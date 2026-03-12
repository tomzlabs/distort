/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Download, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDistortedEmoji = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const prompt = "Transform the subject in this image into a 'DISTORTIFY' style emoji that EXACTLY matches this specific perspective: A perfectly round, 3D glossy head filling the frame. The eyes must be MASSIVE, perfectly circular, and wide-open, occupying at least 60% of the face area, with large black pupils. Above the eyes, there should be two thin, arched eyebrows. At the very bottom of the face, a small, flat, horizontal pill-shaped mouth. The lighting should have a strong white glossy highlight at the top. The perspective should be an extreme fisheye distortion. Maintain the subject's defining features (like ears, hair, or color) but force them into this exact 'huge eyes, tiny mouth, round glossy head' emoji template.";

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: selectedImage,
          prompt: prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate emoji");
      }

      setGeneratedImage(data.image);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate emoji. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'distortify-emoji.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="p-6 border-b border-white/10 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="text-black w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DISTORTIFY</h1>
        </div>
        <div className="text-xs font-mono text-white/40 uppercase tracking-widest hidden sm:block">
          Emoji Style Generator v1.0
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Upload */}
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight">
                Turn anything into a <span className="text-emerald-400">Distorted Emoji</span>
              </h2>
              <p className="text-white/60 text-lg">
                Upload a photo of yourself, your pet, or an object. We'll transform it into that iconic wide-eyed, glossy emoji style.
              </p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[300px] ${
                selectedImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*"
              />
              
              {selectedImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="max-h-[250px] rounded-2xl shadow-2xl object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <RefreshCw className="w-8 h-8 text-white" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-white/40 group-hover:text-white/80 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-lg">Click to upload image</p>
                    <p className="text-white/40 text-sm">PNG, JPG up to 5MB</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={generateDistortedEmoji}
              disabled={!selectedImage || isLoading}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                !selectedImage || isLoading
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98] shadow-lg shadow-emerald-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>DISTORTIFY!</span>
                </>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </section>

          {/* Right Column: Result */}
          <section className="relative min-h-[400px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {generatedImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full space-y-6"
                >
                  <div className="aspect-square w-full max-w-[400px] mx-auto bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-[40px] p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img 
                      src={generatedImage} 
                      alt="Generated Emoji" 
                      className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(16,185,129,0.3)]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="flex gap-4 w-full max-w-[400px] mx-auto">
                    <button
                      onClick={downloadImage}
                      className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                    <button
                      onClick={() => setGeneratedImage(null)}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
                      title="Clear"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-6 text-white/20"
                >
                  <div className="w-64 h-64 border-2 border-dashed border-white/5 rounded-[40px] flex items-center justify-center">
                    <ImageIcon className="w-16 h-16" />
                  </div>
                  <p className="text-center max-w-[200px]">
                    Your distorted emoji will appear here
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-sm rounded-3xl z-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-emerald-500 animate-pulse" />
                </div>
                <p className="text-emerald-400 font-medium animate-pulse">Distorting Reality...</p>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 p-12 border-t border-white/5 text-center text-white/20 text-sm">
        <p>© 2026 DISTORTIFY. Powered by Gemini 2.5 Flash Image.</p>
      </footer>
    </div>
  );
}
