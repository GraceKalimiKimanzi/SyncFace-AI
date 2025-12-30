
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-8 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fa-solid fa-wand-magic-sparkles text-white text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SyncFace AI</h1>
          <p className="text-xs text-slate-400">Cinematic Lip-Sync Generator</p>
        </div>
      </div>
      <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
        <a href="#" className="hover:text-white transition-colors">How it works</a>
        <a href="#" className="hover:text-white transition-colors">Showcase</a>
        <a href="#" className="hover:text-white transition-colors">Pricing</a>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-full border border-slate-700 hover:bg-slate-800 transition-all text-sm font-medium"
      >
        Reset App
      </button>
    </header>
  );
};

export default Header;
