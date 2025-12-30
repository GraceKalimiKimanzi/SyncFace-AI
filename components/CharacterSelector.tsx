
import React from 'react';
import { Character, FileData } from '../types';

interface CharacterSelectorProps {
  image: FileData;
  characters: Character[];
  onSelect: (character: Character) => void;
  selectedId?: string;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ 
  image, 
  characters, 
  onSelect, 
  selectedId 
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-bold mb-3">Who is speaking?</h2>
        <p className="text-slate-400">We found {characters.length} characters in your photo. Click on the one you want to lip-sync to the audio.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">
          <img 
            src={image.url} 
            alt="Source" 
            className="w-full h-auto"
          />
          {characters.map((char) => {
            const [ymin, xmin, ymax, xmax] = char.box_2d;
            return (
              <div
                key={char.id}
                onClick={() => onSelect(char)}
                className={`absolute cursor-pointer border-2 transition-all duration-300 group ${
                  selectedId === char.id 
                    ? 'border-indigo-500 bg-indigo-500/10 z-10' 
                    : 'border-white/30 hover:border-white bg-transparent hover:bg-white/5'
                }`}
                style={{
                  top: `${ymin / 10}%`,
                  left: `${xmin / 10}%`,
                  width: `${(xmax - xmin) / 10}%`,
                  height: `${(ymax - ymin) / 10}%`,
                }}
              >
                <div className={`absolute bottom-0 left-0 right-0 p-1 text-[10px] md:text-xs text-white bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity ${selectedId === char.id ? 'opacity-100 bg-indigo-600' : ''}`}>
                  {char.name}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <i className="fa-solid fa-users text-indigo-400"></i>
            Character List
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => onSelect(char)}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  selectedId === char.id
                    ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                }`}
              >
                <span className="font-bold text-white">{char.name}</span>
                <span className="text-sm text-slate-400 line-clamp-2">{char.description}</span>
              </button>
            ))}
          </div>
          
          {selectedId && (
            <div className="mt-8 p-4 bg-indigo-600/10 rounded-xl border border-indigo-500/30 animate-pulse">
              <p className="text-indigo-300 text-sm font-medium text-center">
                Click "Generate Magic" below once you're ready!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterSelector;
