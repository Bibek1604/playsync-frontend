/**
 * Pre-Join Game Modal
 * Shows game details and confirmation before joining
 * Professional UX - no instant join
 */

'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Users, Clock, Trophy, Gamepad2, Loader2, Check } from 'lucide-react';

export interface GameInfo {
  id: string;
  title: string;
  gameType: 'ONLINE' | 'OFFLINE';
  maxPlayers: number;
  currentPlayers: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  createdBy?: string;
  createdAt?: string;
  description?: string;
}

export interface PreJoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => Promise<void>;
  game: GameInfo | null;
}

export function PreJoinGameModal({
  isOpen,
  onClose,
  onJoin,
  game,
}: PreJoinGameModalProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  if (!game) return null;

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await onJoin();
      setJoinSuccess(true);
      
      // Show success state briefly before closing
      setTimeout(() => {
        setJoinSuccess(false);
        setIsJoining(false);
        onClose();
      }, 1500);
    } catch {
      setIsJoining(false);
      setJoinSuccess(false);
    }
  };

  const handleClose = () => {
    if (!isJoining) {
      onClose();
    }
  };

  const isFull = game.currentPlayers >= game.maxPlayers;
  const canJoin = game.status === 'WAITING' && !isFull;

  // Status badge
  const getStatusBadge = () => {
    switch (game.status) {
      case 'WAITING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Waiting for Players
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            <Clock size={12} />
            In Progress
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            <Trophy size={12} />
            Completed
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      closeOnOverlayClick={!isJoining}
      closeOnEsc={!isJoining}
      className="overflow-hidden"
    >
      {/* Success Overlay */}
      {joinSuccess && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500">
            <Check className="text-emerald-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            Successfully Joined!
          </h3>
          <p className="text-sm text-slate-600 animate-in slide-in-from-bottom-4 duration-500 delay-200">
            Redirecting to game room...
          </p>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 -mx-6 -mt-6 p-6 text-white mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
            <Gamepad2 size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{game.title}</h3>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </div>

      {/* Game Details */}
      <div className="space-y-4 mb-6">
        {/* Players */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Players</p>
              <p className="text-lg font-bold text-slate-900">
                {game.currentPlayers} / {game.maxPlayers}
              </p>
            </div>
          </div>
          <div className="flex-1 mx-4">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{
                  width: `${(game.currentPlayers / game.maxPlayers) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Game Type */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            game.gameType === 'ONLINE' ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            {game.gameType === 'ONLINE' ? (
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Game Type</p>
            <p className="text-sm font-bold text-slate-900">{game.gameType}</p>
          </div>
        </div>

        {/* Description */}
        {game.description && (
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-slate-700">{game.description}</p>
          </div>
        )}

        {/* Warning if full or in progress */}
        {!canJoin && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-900">Cannot Join</p>
              <p className="text-xs text-amber-700 mt-1">
                {isFull ? 'This game is full.' : 'This game has already started or is completed.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 -mx-6 -mb-6 p-6 bg-slate-50 border-t border-slate-100">
        <button
          onClick={handleClose}
          disabled={isJoining}
          className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200"
        >
          Cancel
        </button>
        <button
          onClick={handleJoin}
          disabled={!canJoin || isJoining}
          className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
        >
          {isJoining ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Joining...
            </>
          ) : (
            <>
              <Gamepad2 size={16} />
              Join Game
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
