import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#153540] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium shadow-2xl border border-[#3b606d] animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none select-none">
      {message}
    </div>
  );
};
