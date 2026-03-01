'use client';

import { useState } from 'react';
import { Gamepad2, Wifi, WifiOff, Zap, Users, Trophy, Crown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const offlineFeatures = [
  { icon: Gamepad2, label: 'Single player campaigns' },
  { icon: Zap, label: 'Instant start — no waiting' },
  { icon: Trophy, label: 'Progress saved locally' },
];

const onlineFeatures = [
  { icon: Users, label: 'Multiplayer competitions' },
  { icon: Crown, label: 'Ranked & casual modes' },
  { icon: Trophy, label: 'Global leaderboards' },
];

const faqs = [
  {
    q: 'How do I start playing offline games?',
    a: 'Select the Offline Games mode and click "Continue". Your progress will be saved locally on your device.',
  },
  {
    q: 'What do I need for online multiplayer?',
    a: "A stable internet connection is required. You'll be matched with players of similar skill levels.",
  },
  {
    q: 'Is my data safe?',
    a: 'Yes, we use industry-standard encryption to protect your personal information and game data.',
  },
  {
    q: 'Can I switch between offline and online modes?',
    a: "Absolutely! You can play offline anytime and switch to online when you're ready to compete globally.",
  },
];

type Mode = 'offline' | 'online' | null;

export default function PlaySyncJoinGame() {
  const [selectedMode, setSelectedMode] = useState<Mode>(null);
  const router = useRouter();

  return (
    <div className="min-h-full py-12 animate-in">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-green-600 shadow-2xl shadow-green-100 mb-8 border-4 border-white">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Mode Selector
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-4">
            Choose Your <span className="text-green-600">Arena</span>
          </h1>
          <p className="text-lg font-medium text-slate-500">
            Select your preferred gaming environment and start your journey.
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Offline Mode */}
          <button
            onClick={() => setSelectedMode('offline')}
            className={`
                text-left rounded-[2.5rem] p-10 transition-all duration-300 relative group overflow-hidden border-2
                ${selectedMode === 'offline'
                ? 'bg-white border-emerald-500 shadow-2xl shadow-emerald-100 scale-[1.02]'
                : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}
            `}
          >
            {selectedMode === 'offline' && (
              <div className="absolute top-6 right-6">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
            )}

            <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all
                ${selectedMode === 'offline' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}
            `}>
              <WifiOff size={28} />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">Offline Games</h2>
            <p className="text-slate-500 font-medium mb-8">No internet required. Perfect for solo training.</p>

            <div className="space-y-4">
              {offlineFeatures.map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <feat.icon size={14} />
                  </div>
                  <span>{feat.label}</span>
                </div>
              ))}
            </div>
          </button>

          {/* Online Mode */}
          <button
            onClick={() => setSelectedMode('online')}
            className={`
                text-left rounded-[2.5rem] p-10 transition-all duration-300 relative group overflow-hidden border-2
                ${selectedMode === 'online'
                ? 'bg-green-600 border-green-600 shadow-2xl shadow-green-200 scale-[1.02] text-white'
                : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm'}
            `}
          >
            {selectedMode === 'online' && (
              <div className="absolute top-6 right-6">
                <CheckCircle2 size={24} className="text-white" />
              </div>
            )}

            <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all
                ${selectedMode === 'online' ? 'bg-white text-green-600' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}
            `}>
              <Wifi size={28} />
            </div>

            <h2 className={`text-2xl font-black mb-2 ${selectedMode === 'online' ? 'text-white' : 'text-slate-900'}`}>Online Games</h2>
            <p className={`${selectedMode === 'online' ? 'text-green-100' : 'text-gray-500'} font-medium mb-8`}>Compete with players worldwide in real-time.</p>

            <div className="space-y-4">
              {onlineFeatures.map((feat, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm font-bold ${selectedMode === 'online' ? 'text-blue-50' : 'text-slate-600'}`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedMode === 'online' ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600'}`}>
                    <feat.icon size={14} />
                  </div>
                  <span>{feat.label}</span>
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* Continue CTA */}
        {selectedMode && (
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={() => router.push(selectedMode === 'offline' ? '/games/offline' : '/games/online')}
              className={`
                inline-flex items-center gap-3 px-12 py-4 rounded-2xl text-lg font-black transition-all group shadow-xl
                ${selectedMode === 'offline'
                  ? 'bg-green-600 text-white shadow-green-100 hover:bg-green-700'
                  : 'bg-green-600 text-white shadow-green-100 hover:bg-green-700'}
              `}
            >
              Enter {selectedMode === 'offline' ? 'Offline' : 'Online'} World
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-green-600" />
          <h2 className="text-2xl font-black text-slate-900 mb-8">Common Questions</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-2">
                <h3 className="font-bold text-gray-900 border-l-4 border-green-100 pl-4">{faq.q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}