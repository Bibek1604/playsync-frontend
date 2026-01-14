'use client';

import { useState } from 'react';
import { Gamepad2, Wifi, WifiOff, Zap, Users, Trophy, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PlaySyncJoinGame() {
  const [selectedMode, setSelectedMode] = useState<'offline' | 'online' | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-xl shadow-emerald-200">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Welcome to PlaySync
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose your gaming mode and start your adventure
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Offline Mode */}
          <div
            onClick={() => setSelectedMode('offline')}
            className={`group relative bg-white rounded-3xl p-8 cursor-pointer transition-all duration-500 ${
              selectedMode === 'offline'
                ? 'shadow-2xl shadow-emerald-200 scale-105 border-2 border-emerald-500'
                : 'shadow-lg hover:shadow-xl hover:scale-102 border-2 border-transparent'
            }`}
          >
            {/* Selection Indicator */}
            {selectedMode === 'offline' && (
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            <div className="text-center">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-300 ${
                selectedMode === 'offline'
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-emerald-100 group-hover:to-teal-100'
              }`}>
                <WifiOff className={`w-10 h-10 transition-colors duration-300 ${
                  selectedMode === 'offline' ? 'text-white' : 'text-gray-600 group-hover:text-emerald-600'
                }`} />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Offline Games</h2>
              <p className="text-gray-600 mb-6">
                Play solo adventures without internet connection
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Gamepad2 className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Single player campaigns</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Instant start - no waiting</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Progress saved locally</span>
                </div>
              </div>

              {/* Button */}
              <button className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedMode === 'offline'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-gray-100 text-gray-700 group-hover:bg-emerald-50 group-hover:text-emerald-700'
              }`}>
                Select Offline Mode
              </button>
            </div>
          </div>

          {/* Online Mode */}
          <div
            onClick={() => setSelectedMode('online')}
            className={`group relative bg-white rounded-3xl p-8 cursor-pointer transition-all duration-500 ${
              selectedMode === 'online'
                ? 'shadow-2xl shadow-emerald-200 scale-105 border-2 border-emerald-500'
                : 'shadow-lg hover:shadow-xl hover:scale-102 border-2 border-transparent'
            }`}
          >
            {/* Selection Indicator */}
            {selectedMode === 'online' && (
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            <div className="text-center">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-300 ${
                selectedMode === 'online'
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-emerald-100 group-hover:to-teal-100'
              }`}>
                <Wifi className={`w-10 h-10 transition-colors duration-300 ${
                  selectedMode === 'online' ? 'text-white' : 'text-gray-600 group-hover:text-emerald-600'
                }`} />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Online Games</h2>
              <p className="text-gray-600 mb-6">
                Join multiplayer matches with players worldwide
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Multiplayer competitions</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Ranked & casual modes</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span>Global leaderboards</span>
                </div>
              </div>

              {/* Button */}
              <button className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                selectedMode === 'online'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-gray-100 text-gray-700 group-hover:bg-emerald-50 group-hover:text-emerald-700'
              }`}>
                Select Online Mode
              </button>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        {selectedMode && (
          <div className="text-center animate-fade-in">
            <button 
              onClick={() => router.push(selectedMode === 'offline' ? '/games/offline' : '/games/online')}
              className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-emerald-300 hover:shadow-emerald-400 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Continue to {selectedMode === 'offline' ? 'Offline' : 'Online'} Games
              <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* QNA Section */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I start playing offline games?</h3>
              <p className="text-gray-600">Select the Offline Games mode and click "Continue". Your progress will be saved locally on your device.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What do I need for online multiplayer?</h3>
              <p className="text-gray-600">A stable internet connection is required. You'll be matched with players of similar skill levels.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Is my data safe?</h3>
              <p className="text-gray-600">Yes, we use industry-standard encryption to protect your personal information and game data.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I switch between offline and online modes?</h3>
              <p className="text-gray-600">Absolutely! You can play offline anytime and switch to online when you're ready to compete globally.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}