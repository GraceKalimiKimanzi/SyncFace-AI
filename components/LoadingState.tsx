
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Analyzing facial geometry...",
  "Synthesizing lip movements...",
  "Calibrating expression weights...",
  "Rendering lighting reflections...",
  "Synchronizing audio waves with visual frames...",
  "Smoothing temporal consistency...",
  "Adding cinematic polish...",
  "Almost there! Just a few more seconds...",
];

const LoadingState: React.FC<{ title: string }> = ({ title }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fa-solid fa-wand-magic-sparkles text-2xl text-indigo-400 animate-pulse"></i>
        </div>
      </div>
      
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-slate-400 text-lg h-8 transition-all duration-500 animate-fade-in">
        {MESSAGES[index]}
      </p>
      
      <div className="mt-12 w-full max-w-md bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-indigo-500 animate-[loading_120s_ease-in-out_infinite]" style={{ width: '0%' }}></div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          10% { width: 5%; }
          30% { width: 15%; }
          60% { width: 45%; }
          80% { width: 85%; }
          95% { width: 95%; }
          100% { width: 99%; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
