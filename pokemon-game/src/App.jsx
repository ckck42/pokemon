// src/App.jsx

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Lobby } from './components/lobby.jsx'; // Corrected import
import { GameBoard } from './components/game_board.jsx'; // Corrected import

// Card data for the game
const cardData = [
  { name: 'Pikachu', power: 50, attack: 20, maxHp: 50 },
  { name: 'Bulbasaur', power: 60, attack: 10, maxHp: 60 },
  { name: 'Squirtle', power: 50, attack: 20, maxHp: 50 },
  { name: 'Charmander', power: 50, attack: 20, maxHp: 50 },
  { name: 'Jigglypuff', power: 70, attack: 10, maxHp: 70 },
  { name: 'Meowth', power: 40, attack: 30, maxHp: 40 },
  { name: 'Psyduck', power: 60, attack: 10, maxHp: 60 },
];

// Helper function to shuffle an array
const shuffle = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error("Supabase environment variables are not set. Please check your .env.local file.");
}

// Generate a random user ID for anonymous play
const getUserId = () => {
  let userId = localStorage.getItem('supabase-user-id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('supabase-user-id', userId);
  }
  return userId;
};

// Game state constants
const GAME_STATE = {
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING',
  FINISHED: 'FINISHED',
};

// ======================================================
// App Component - Main logic and state management
// ======================================================
const App = () => {
  const [userId, setUserId] = useState(getUserId());
  const [gameId, setGameId] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Listen for real-time game data updates from Supabase.
  useEffect(() => {
    if (!gameId || !supabase) return;

    // Fetch initial game state
    const fetchGameData = async () => {
      const { data, error } = await supabase.from('games').select('state').eq('id', gameId).single();
      if (error) {
        console.error("Error fetching initial game data:", error);
      } else if (data) {
        setGameData(data.state);
        setMessage(data.state.message || '');
      }
    };
    
    fetchGameData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('game-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, (payload) => {
        setGameData(payload.new.state);
        setMessage(payload.new.state.message || '');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(supabase.channel('game-updates'));
    };
  }, [gameId]);

  // Create a new two-player game session.
  const createGame = async () => {
    if (!supabase) return;
    setLoading(true);

    const playerDeck = shuffle([...cardData, ...cardData, ...cardData, ...cardData, ...cardData]);
    const playerHand = playerDeck.splice(0, 5);

    const newGameState = {
      players: {
        [userId]: {
          hand: playerHand,
          deck: playerDeck,
          activePokemon: null,
          bench: [],
          knockedOutCount: 0,
        },
      },
      turnOrder: [userId],
      currentPlayerIndex: 0,
      state: GAME_STATE.LOBBY,
      message: `${userId} created the game.`,
      lastAction: null,
    };

    try {
      const { data, error } = await supabase.from('games').insert([{ state: newGameState }]).select();

      if (error) throw error;

      if (data && data.length > 0) {
        const newGameId = data[0].id;
        setGameId(newGameId);
        setGameData(newGameState);
        setMessage(`Game created! Share this ID with one other player: ${newGameId}`);
      }
    } catch (error) {
      console.error("Error creating game:", error);
      setMessage('Failed to create game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Join an existing game session using a game ID.
  const joinGame = async (gameIdToJoin) => {
    if (!supabase || !gameIdToJoin) return;
    setLoading(true);

    try {
      const { data: game, error: fetchError } = await supabase.from('games').select('state').eq('id', gameIdToJoin).single();

      if (fetchError) throw fetchError;

      const currentData = game.state;
      const playerIds = Object.keys(currentData.players);

      if (currentData.state !== GAME_STATE.LOBBY) {
        setMessage('This game has already started.');
        return;
      }
      if (playerIds.length >= 2) {
        setMessage('This game is full (2 players max).');
        return;
      }
      if (playerIds.includes(userId)) {
        setMessage('You are already in this game.');
        return;
      }

      const playerDeck = shuffle([...cardData, ...cardData, ...cardData, ...cardData, ...cardData]);
      const playerHand = playerDeck.splice(0, 5);

      const updatedPlayers = {
        ...currentData.players,
        [userId]: {
          hand: playerHand,
          deck: playerDeck,
          activePokemon: null,
          bench: [],
          knockedOutCount: 0,
        },
      };
      const updatedTurnOrder = [...currentData.turnOrder, userId];
      
      const { error: updateError } = await supabase
        .from('games')
        .update({ state: { ...currentData, players: updatedPlayers, turnOrder: updatedTurnOrder, message: `${userId} joined the game!` } })
        .eq('id', gameIdToJoin);

      if (updateError) throw updateError;
      
      setGameId(gameIdToJoin);
    } catch (error) {
      console.error("Error joining game:", error);
      setMessage('Failed to join game. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start the game once two players have joined.
  const startGame = async () => {
    if (!supabase || !gameId || !gameData) return;
    setLoading(true);
    const playerIds = Object.keys(gameData.players);

    if (playerIds.length !== 2) {
      setMessage('Need exactly 2 players to start.');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('games')
        .update({ state: { ...gameData, state: GAME_STATE.PLAYING, message: 'The game has started!' } })
        .eq('id', gameId);

      if (error) throw error;
    } catch (error) {
      console.error("Error starting game:", error);
      setMessage('Failed to start game.');
    } finally {
      setLoading(false);
    }
  };

  // Handle a player's action (play card, attack, swap, end turn).
  const takeAction = async (action, payload) => {
    if (!supabase || !isMyTurn() || !gameData || !userId) return;
    setLoading(true);

    let newGameData = JSON.parse(JSON.stringify(gameData));
    const myPlayer = newGameData.players[userId];
    
    // Play card from hand to bench or active slot
    if (action === 'playCard') {
      const cardToPlay = payload.card;
      const cardIndex = myPlayer.hand.findIndex(c => c.name === cardToPlay.name);
      
      if (cardIndex === -1) {
        setLoading(false);
        return;
      }
      
      // Remove card from hand
      myPlayer.hand.splice(cardIndex, 1);
      
      if (!myPlayer.activePokemon) {
        myPlayer.activePokemon = cardToPlay;
        newGameData.message = `${userId} played ${cardToPlay.name} as their active Pokémon.`;
      } else {
        myPlayer.bench.push(cardToPlay);
        newGameData.message = `${userId} played ${cardToPlay.name} to their bench.`;
      }
    }

    // Attack
    if (action === 'attack') {
      const opponentId = newGameData.turnOrder.find(id => id !== userId);
      if (!opponentId) { setLoading(false); return; }

      const myActive = myPlayer.activePokemon;
      const opponentPlayer = newGameData.players[opponentId];
      const opponentActive = opponentPlayer.activePokemon;

      if (myActive && opponentActive) {
        opponentActive.power -= myActive.attack;
        newGameData.message = `${userId}'s ${myActive.name} attacked ${opponentId}'s ${opponentActive.name} for ${myActive.attack} damage!`;

        if (opponentActive.power <= 0) {
          opponentPlayer.knockedOutCount++;
          newGameData.message += ` ${opponentActive.name} was knocked out!`;

          if (opponentPlayer.knockedOutCount >= 3) {
            newGameData.state = GAME_STATE.FINISHED;
            newGameData.message += ` ${userId} wins the game!`;
          } else {
            // Logic to choose new active Pokémon
            opponentPlayer.activePokemon = null; // Forces opponent to choose
            newGameData.message += ` ${opponentId} must now choose a new active Pokémon from their bench or hand.`;
          }
        }
      }
    }

    // Swap Pokémon
    if (action === 'swap') {
      const { newActiveName } = payload;
      const newActiveIndex = myPlayer.bench.findIndex(p => p.name === newActiveName);
      if (newActiveIndex !== -1 && myPlayer.activePokemon) {
        const oldActive = myPlayer.activePokemon;
        const newActive = myPlayer.bench[newActiveIndex];
        myPlayer.activePokemon = newActive;
        myPlayer.bench.splice(newActiveIndex, 1);
        myPlayer.bench.push(oldActive);
        newGameData.message = `${userId} swapped their active Pokémon.`;
      }
    }

    // End turn
    if (action === 'endTurn') {
      const currentPlayerIndex = newGameData.currentPlayerIndex;
      const nextPlayerIndex = (currentPlayerIndex + 1) % newGameData.turnOrder.length;
      newGameData.currentPlayerIndex = nextPlayerIndex;
      newGameData.message = `${newGameData.turnOrder[nextPlayerIndex]}'s turn.`;
    }

    try {
      const { error } = await supabase
        .from('games')
        .update({ state: newGameData })
        .eq('id', gameId);

      if (error) throw error;
    } catch (error) {
      console.error("Error taking action:", error);
      setMessage('Failed to take action. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Check if it's the current user's turn.
  const isMyTurn = () => {
    if (!gameData || !userId) return false;
    return gameData.turnOrder[gameData.currentPlayerIndex] === userId;
  };
  
  // Render the appropriate UI based on the game state
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-inter">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      {gameData?.state === GAME_STATE.PLAYING ? (
        <GameBoard 
          gameData={gameData}
          userId={userId}
          takeAction={takeAction}
          loading={loading}
          message={message}
          isMyTurn={isMyTurn}
          onBackToLobby={() => window.location.reload()}
        />
      ) : (
        <Lobby 
          userId={userId}
          gameId={gameId}
          setGameId={setGameId}
          gameData={gameData}
          message={message}
          loading={loading}
          createGame={createGame}
          joinGame={joinGame}
          startGame={startGame}
        />
      )}
      {gameData?.state === GAME_STATE.FINISHED && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-xl shadow-2xl text-center text-white">
            <h2 className="text-4xl font-bold text-yellow-300 mb-4">Game Over!</h2>
            <p className="text-xl mb-6">{message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md transform hover:scale-105"
            >
              Start New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
