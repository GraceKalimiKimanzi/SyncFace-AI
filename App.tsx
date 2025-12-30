
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import CharacterSelector from './components/CharacterSelector';
import LoadingState from './components/LoadingState';
import { AppStep, Character, FileData, AnalysisResult } from './types';
import { analyzeMedia, generateLipSyncVideo } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INITIAL);
  const [imageFile, setImageFile] = useState<FileData | null>(null);
  const [audioFile, setAudioFile] = useState<FileData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const data: FileData = {
        base64,
        mimeType: file.type,
        url: URL.createObjectURL(file)
      };
      if (type === 'image') setImageFile(data);
      else setAudioFile(data);
    };
    reader.readAsDataURL(file);
  };

  const onStartAnalysis = async () => {
    if (!imageFile || !audioFile) return;
    setError(null);
    setStep(AppStep.ANALYZING);
    try {
      const result = await analyzeMedia(
        { data: imageFile.base64, mimeType: imageFile.mimeType },
        { data: audioFile.base64, mimeType: audioFile.mimeType }
      );
      setAnalysis(result);
      setStep(AppStep.SELECT_CHARACTER);
    } catch (err: any) {
      setError(err.message || "Failed to analyze files. Please try again.");
      setStep(AppStep.INITIAL);
    }
  };

  const onGenerateVideo = async () => {
    if (!imageFile || !selectedCharacter || !analysis) return;
    setError(null);
    setStep(AppStep.GENERATING);
    try {
      const videoUrl = await generateLipSyncVideo(
        { data: imageFile.base64, mimeType: imageFile.mimeType },
        selectedCharacter,
        analysis.audioTranscript
      );
      setFinalVideoUrl(videoUrl);
      setStep(AppStep.COMPLETE);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        // This is a sign of an API key issue/expired session
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setError("Please re-select your API key to continue.");
      } else {
        setError(err.message || "Video generation failed. Please try again.");
      }
      setStep(AppStep.SELECT_CHARACTER);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-12 max-w-6xl">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200 animate-fade-in">
            <i className="fa-solid fa-circle-exclamation text-lg"></i>
            <p className="flex-1 font-medium">{error}</p>
            <button onClick={() => setError(null)} className="text-white/50 hover:text-white">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}

        {step === AppStep.INITIAL && (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                  Bring Your Photos <span className="text-indigo-500">To Life</span>
                </h2>
                <p className="text-xl text-slate-400">
                  Upload a photo and an audio clip. Our AI will automatically identify the characters and generate a realistic lip-sync video.
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-colors group">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Step 1: Upload Group Photo</h3>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <i className={`fa-solid ${imageFile ? 'fa-check-circle text-green-500' : 'fa-image text-slate-500'} text-3xl mb-2`}></i>
                      <p className="text-sm text-slate-400">
                        {imageFile ? "Image ready!" : "Drop image or click to upload"}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                  </label>
                  {imageFile && (
                    <div className="mt-4 flex items-center gap-4 animate-fade-in">
                      <img src={imageFile.url} alt="Preview" className="w-16 h-16 object-cover rounded-lg ring-1 ring-slate-600" />
                      <p className="text-xs text-slate-500 italic">Character detection will begin after audio is added.</p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-colors group">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Step 2: Add Voice Clip</h3>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <i className={`fa-solid ${audioFile ? 'fa-check-circle text-green-500' : 'fa-microphone text-slate-500'} text-3xl mb-2`}></i>
                      <p className="text-sm text-slate-400">
                        {audioFile ? "Audio ready!" : "Drop audio or click to upload"}
                      </p>
                    </div>
                    <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} />
                  </label>
                  {audioFile && (
                    <div className="mt-4 animate-fade-in">
                      <audio src={audioFile.url} controls className="w-full h-10 filter invert opacity-80" />
                    </div>
                  )}
                </div>

                <button
                  disabled={!imageFile || !audioFile}
                  onClick={onStartAnalysis}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all ${
                    imageFile && audioFile 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20' 
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Analyze Characters <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
              <div className="relative bg-slate-800/80 p-4 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-sm">
                <img 
                  src="https://picsum.photos/seed/faces/800/600" 
                  alt="Feature showcase" 
                  className="rounded-2xl opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-8">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
                    <i className="fa-solid fa-play text-white"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Instant Motion</h3>
                  <p className="text-slate-300">Convert group shots into dynamic talking head videos in minutes.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === AppStep.ANALYZING && (
          <LoadingState title="Identifying Characters" />
        )}

        {step === AppStep.SELECT_CHARACTER && imageFile && analysis && (
          <div className="space-y-12">
            <CharacterSelector 
              image={imageFile} 
              characters={analysis.characters} 
              onSelect={setSelectedCharacter}
              selectedId={selectedCharacter?.id}
            />
            
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <button
                onClick={() => setStep(AppStep.INITIAL)}
                className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all"
              >
                Go Back
              </button>
              <button
                disabled={!selectedCharacter}
                onClick={onGenerateVideo}
                className={`w-full md:w-auto px-16 py-4 rounded-xl font-bold text-lg shadow-xl transition-all ${
                  selectedCharacter 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 text-white' 
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Generate Magic <i className="fa-solid fa-sparkles ml-2"></i>
              </button>
            </div>
          </div>
        )}

        {step === AppStep.GENERATING && (
          <LoadingState title="Creating Your Video" />
        )}

        {step === AppStep.COMPLETE && finalVideoUrl && (
          <div className="max-w-4xl mx-auto space-y-10 text-center animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">Your Video is Ready!</h2>
              <p className="text-slate-400 text-lg">Lip-sync applied to <span className="text-indigo-400 font-bold">{selectedCharacter?.name}</span></p>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700 bg-black aspect-video">
              <video 
                src={finalVideoUrl} 
                controls 
                autoPlay 
                loop
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={finalVideoUrl} 
                download="syncface-video.mp4"
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <i className="fa-solid fa-download"></i> Download Video
              </a>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <i className="fa-solid fa-rotate-right"></i> Create Another
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-slate-600 text-sm border-t border-slate-800 bg-slate-900/30">
        <p>&copy; 2024 SyncFace AI. Powered by Gemini & Veo.</p>
      </footer>
    </div>
  );
};

export default App;
