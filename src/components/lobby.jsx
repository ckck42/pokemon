// src/components/Lobby.jsx
import React from 'react';
import { Play, AlertCircle } from 'lucide-react';

export function Lobby({ userId, gameId, setGameId, gameData, message, loading, createGame, joinGame, startGame }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-3xl font-bold mb-6 text-yellow-300">Simplified Pokémon Game</h2>
        <p className="mb-4 text-xl">Current User ID: <span className="font-mono text-xs break-all">{userId}</span></p>
        <button
          onClick={createGame}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md transform hover:scale-105 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Game...' : 'Create New Game'}
        </button>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter Game ID"
            value={gameId || ''}
            onChange={(e) => setGameId(e.target.value)}
            className="flex-1 bg-slate-700 text-white placeholder-slate-400 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => joinGame(gameId)}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </div>
        {gameId && (
          <div className="mt-6 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Game ID:</h3>
            <p className="font-mono break-all text-sm">{gameId}</p>
            {gameData && (
              <div className="mt-4">
                <h4 className="font-semibold text-lg">Players:</h4>
                <ul className="list-disc list-inside">
                  {Object.keys(gameData.players).map(pId => (
                    <li key={pId}>{pId === userId ? 'You' : pId}</li>
                  ))}
                </ul>
                <button
                  onClick={startGame}
                  disabled={loading || Object.keys(gameData.players).length !== 2}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Starting...' : 'Start Game'}
                </button>
              </div>
            )}
          </div>
        )}
        <p className="mt-4 text-lg text-yellow-200">{message}</p>
      </div>
    </div>
  );
}
