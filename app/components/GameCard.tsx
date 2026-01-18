import React from 'react'

interface GameCardProps {
  game: {
    id: string;
    name: string;
    image: string;
    players: number;
    maxPlayers: number;
    status: 'waiting' | 'playing' | 'finished';
    difficulty?: string;
  };
  onJoin?: (gameId: string) => void;
}

function GameCard({ game, onJoin }: GameCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-green-500';
      case 'playing':
        return 'bg-yellow-500';
      case 'finished':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-48 object-cover"
        />
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor(game.status)}`}></div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{game.name}</h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">
            Players: {game.players}/{game.maxPlayers}
          </span>
          {game.difficulty && (
            <span className="text-sm text-gray-600 capitalize">
              {game.difficulty}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full text-white ${
            game.status === 'waiting' ? 'bg-green-500' :
            game.status === 'playing' ? 'bg-yellow-500' : 'bg-gray-500'
          }`}>
            {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
          </span>
          
          {onJoin && game.status === 'waiting' && (
            <button
              onClick={() => onJoin(game.id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Join Game
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default GameCard