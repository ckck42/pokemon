// src/components/Card.jsx
import React from 'react';
import { Zap, Sword, Heart } from 'lucide-react';

export function Card({ card, size = 'medium' }) {
  const sizeClasses = {
    small: 'w-20 h-28 text-xs',
    medium: 'w-24 h-32 text-sm',
    large: 'w-32 h-40 text-base'
  };

  const hpPercentage = (card.power / card.maxHp) * 100;
  const hpColor = hpPercentage > 60 ? 'from-green-400 to-green-500' : hpPercentage > 30 ? 'from-yellow-400 to-orange-500' : 'from-red-400 to-red-500';

  return (
    <div className={`relative flex flex-col p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg border-2 border-indigo-700 text-white ${sizeClasses[size]} transform transition-all duration-300 hover:scale-105`}>
      <div className="flex-1 flex flex-col justify-between">
        <div className="text-center font-bold text-lg mb-1">
          {card.name}
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            {/* Simple Pokémon Icon */}
            <Zap className="w-8 h-8" />
          </div>
        </div>
        <div className="flex justify-around items-center mt-2">
          <div className="flex items-center space-x-1">
            <Heart size={16} className="text-red-400" />
            <span className="font-bold">{card.power}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Sword size={16} className="text-yellow-400" />
            <span className="font-bold">{card.attack}</span>
          </div>
        </div>
        
        {/* HP Bar */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="relative w-full bg-black bg-opacity-30 rounded-full h-2 overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${hpColor} transition-all duration-500 ease-out shadow-sm`}
              style={{ width: `${hpPercentage}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -skew-x-12 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
