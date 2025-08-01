// src/components/GameBoard.jsx
import React from 'react';
import { Card } from './card';
import { PlayerBoard } from './player_board';
import { Sword, Shield, RotateCcw, Home, Crown, Zap, Users } from 'lucide-react';

export function GameBoard({ gameData, userId, takeAction, loading, message, isMyTurn, onBackToLobby }) {
  if (!gameData) return null;

  const myPlayer = gameData.players[userId];
  const opponentId = gameData.turnOrder.find(id => id !== userId);
  const opponentPlayer = opponentId ? gameData.players[opponentId] : null;

  if (!myPlayer || !opponentPlayer) {
    return <div className="p-8 text-center text-white">Waiting for players to join...</div>;
  }

  const myIsWaitingForActive = myPlayer.activePokemon === null && myPlayer.hand.length > 0;
  const opponentIsWaitingForActive = opponentPlayer.activePokemon === null && opponentPlayer.hand.length > 0;
  
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-inter">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-yellow-300">Pokémon Battle</h1>
        <p className="text-lg mt-2 text-slate-300">Current Game ID: {gameData.id}</p>
        <p className={`mt-4 text-2xl font-semibold ${isMyTurn() ? 'text-green-400' : 'text-red-400'}`}>
          {isMyTurn() ? "It's your turn!" : `Waiting for ${gameData.turnOrder[gameData.currentPlayerIndex]}...`}
        </p>
        <p className="mt-2 text-yellow-200 text-lg">{message}</p>
      </div>

      <div className="flex flex-col md:flex-row justify-around items-center p-4 rounded-xl shadow-lg mt-8 bg-slate-800">
        <PlayerBoard
          player={opponentPlayer}
          isOpponent={true}
          isCurrentPlayer={!isMyTurn()}
          playerid={opponentId}
          waitingForActive={opponentIsWaitingForActive}
        />

        <div className="h-0.5 md:h-64 w-full md:w-0.5 bg-slate-700 my-4 md:my-0"></div>

        <PlayerBoard
          player={myPlayer}
          isOpponent={false}
          isCurrentPlayer={isMyTurn()}
          playerid={userId}
          waitingForActive={myIsWaitingForActive}
          onSwapClick={(card) => takeAction('swap', { newActiveName: card.name })}
        />
      </div>

      {/* Game Actions */}
      <div className="flex justify-center gap-4 p-4 mt-8 bg-slate-800 rounded-xl shadow-lg">
        <button
          onClick={() => takeAction('attack')}
          disabled={loading || !isMyTurn() || !myPlayer.activePokemon || opponentIsWaitingForActive || opponentPlayer.activePokemon === null}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Attacking...' : 'Attack! 💥'}
        </button>
        <button
          onClick={() => takeAction('endTurn')}
          disabled={loading || !isMyTurn() || myIsWaitingForActive}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Ending Turn...' : 'End Turn'}
        </button>
      </div>

      {/* Your Hand */}
      <div className="mt-8 p-4 bg-slate-800 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-slate-300">Your Hand</h3>
        <div className="flex gap-4 p-4 overflow-x-auto">
          {myPlayer.hand.map((p, index) => (
            <button
              key={index}
              onClick={() => {
                takeAction('playCard', { card: p });
              }}
              disabled={loading || !isMyTurn() || myPlayer.activePokemon && myPlayer.bench.length >= 5}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Card card={p} size="small" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
