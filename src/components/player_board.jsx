// src/components/PlayerBoard.jsx
import React from 'react';
import { Card } from './card';
import { Crown, Shield, Users, Layers, Target, Zap } from 'lucide-react';

export function PlayerBoard({ player, isOpponent, isCurrentPlayer, playerid, waitingForActive, onSwapClick }) {
  const boardGradient = isOpponent ? 'from-red-400 to-red-600' : 'from-blue-400 to-blue-600';
  const bgGradient = isOpponent ? 'from-red-50 to-pink-50' : 'from-blue-50 to-purple-50';
  const borderColor = isOpponent ? 'border-red-300' : 'border-blue-300';
  
  return (
    <div className={`relative p-6 rounded-3xl bg-gradient-to-br ${bgGradient} border-2 ${borderColor} shadow-xl transform transition-all duration-500 hover:scale-105 w-full md:w-5/12 mx-auto my-4`}>
      <h3 className={`text-2xl font-bold mb-4 text-center ${isOpponent ? 'text-red-800' : 'text-blue-800'}`}>
        {isOpponent ? 'Opponent' : 'Your'} Board ({playerid})
      </h3>
      <div className="flex flex-col items-center">
        {/* Active Pokémon Area */}
        <div className="w-full h-44 bg-slate-200 rounded-2xl border-4 border-dashed border-gray-400 flex items-center justify-center p-2 mb-4 shadow-inner">
          {player.activePokemon ? (
            <Card card={player.activePokemon} size="large" />
          ) : (
            <div className="text-center text-gray-500 p-2">
              <Zap size={32} className="mx-auto mb-2" />
              <p className="font-bold">
                {waitingForActive ? 'Choose an active Pokémon!' : 'Waiting for Active Pokémon'}
              </p>
            </div>
          )}
        </div>
        
        {/* Bench Area */}
        <div className="w-full p-4 bg-slate-300 rounded-2xl shadow-inner">
          <h4 className="text-xl font-bold text-gray-600 mb-2">Bench ({player.bench.length}/5)</h4>
          <div className="flex gap-2 overflow-x-auto p-2">
            {player.bench.length > 0 ? (
              player.bench.map((card, index) => (
                <button
                  key={index}
                  onClick={isCurrentPlayer && onSwapClick ? () => onSwapClick(card) : undefined}
                  disabled={!isCurrentPlayer || !onSwapClick || !player.activePokemon}
                  className="disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105"
                >
                  <Card card={card} size="small" />
                </button>
              ))
            ) : (
              <div className="w-full text-center py-4 text-gray-400">
                <Users size={32} className="mx-auto mb-2" />
                No Pokémon on the bench.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Knocked Out Counter */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black bg-opacity-70 text-white py-2 px-4 rounded-full shadow-lg">
        <Crown size={24} className="text-yellow-400" />
        <span className="font-bold text-lg">{player.knockedOutCount}</span>
        <span className="text-sm">KO'd</span>
      </div>
    </div>
  );
}
