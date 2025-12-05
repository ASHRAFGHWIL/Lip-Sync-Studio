import React, { useState, useRef } from 'react';
import { generateSpeech } from '../services/gemini';
import { VoiceName } from '../types';
import { decodeBase64, pcmToAudioBuffer } from '../utils/audio';
import { Loader2, Play, Pause, Download, Mic2 } from 'lucide-react';

interface VoiceStudioProps {
  initialText?: string;
}

const VoiceStudio: React.FC<VoiceStudioProps> = ({ initialText = '' }) => {
  const [text, setText] = useState(initialText);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Puck);
  const [voiceStyle, setVoiceStyle] = useState('Normal'); // Default style
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    return audioContextRef.current;
  };

  const handleGenerate = async () => {
    if (!text) return;
    setLoading(true);
    stopAudio(); // Stop any current playback
    
    try {
      const base64Audio = await generateSpeech(text, selectedVoice, voiceStyle);
      
      const binary = decodeBase64(base64Audio);
      
      const blob = new Blob([binary], { type: 'application/octet-stream' });
      setAudioUrl(URL.createObjectURL(blob));
      
      // Auto-play
      playAudio(binary);

    } catch (e) {
      alert("فشل في توليد الصوت. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (base64OrBytes: string | Uint8Array) => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      stopAudio();

      let bytes: Uint8Array;
      if (typeof base64OrBytes === 'string') {
        bytes = decodeBase64(base64OrBytes);
      } else {
        bytes = base64OrBytes;
      }

      const buffer = await pcmToAudioBuffer(bytes, ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    } catch (e) {
      console.error("Playback error", e);
    }
  };

  const handlePlayClick = async () => {
    if (isPlaying) {
      stopAudio();
    } else if (audioUrl) {
       const response = await fetch(audioUrl);
       const buffer = await response.arrayBuffer();
       playAudio(new Uint8Array(buffer));
    }
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          استوديو الصوت
        </h2>
        <p className="text-slate-400">حول النص الخاص بك إلى صوت احترافي فوراً.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">نص السيناريو</label>
            <textarea
              className="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all resize-none"
              placeholder="أدخل النص المراد قراءته..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="text-left text-xs text-slate-500">
              {text.length} حرف
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 space-y-6">
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">أسلوب التحدث</label>
              <div className="grid grid-cols-2 gap-2">
                 <button
                    onClick={() => setVoiceStyle('Normal')}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      voiceStyle === 'Normal'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    عادي
                  </button>
                  <button
                    onClick={() => setVoiceStyle('Enthusiastic')}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      voiceStyle === 'Enthusiastic'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    حماسي
                  </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">اختر الصوت</label>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(VoiceName).map((voice) => (
                  <button
                    key={voice}
                    onClick={() => setSelectedVoice(voice)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      selectedVoice === voice
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="font-medium">{voice}</span>
                    {selectedVoice === voice && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !text}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Mic2 className="w-5 h-5" />}
              توليد الصوت
            </button>
          </div>

          {audioUrl && (
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-900/50 flex flex-col gap-4 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-center gap-4">
                 <button
                   onClick={handlePlayClick}
                   className="w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center text-slate-900 transition-transform hover:scale-105 active:scale-95"
                 >
                   {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                 </button>
              </div>
              <div className="text-center text-sm text-cyan-200/70 font-medium">
                 {isPlaying ? 'جاري التشغيل...' : 'جاهز للتشغيل'}
              </div>
              <a 
                href={audioUrl} 
                download={`lipsync-audio-${Date.now()}.pcm`}
                className="flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <Download className="w-3 h-3" /> تحميل ملف خام (PCM)
              </a>
              <p className="text-[10px] text-center text-slate-600">
                ملاحظة: التحميل بتنسيق PCM الخام. استخدم Audacity لتحريره.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceStudio;