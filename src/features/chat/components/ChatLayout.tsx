import React from 'react';

interface ChatLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children, sidebar }) => {
  return (
    <div className="flex h-full bg-white overflow-hidden text-gray-900 selection:bg-green-100 selection:text-green-700">
      {/* Left sidebar */}
      {sidebar}

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-[#F7F8FA]">
        {children}
      </main>

      <style jsx global>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.08);
          border-radius: 99px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(22, 163, 74, 0.25);
        }
        @keyframes msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-anim {
          animation: msg-in 0.22s ease-out both;
        }
        .textarea-autosize {
          field-sizing: content;
          min-height: 44px;
          max-height: 140px;
        }
      `}</style>
    </div>
  );
};
