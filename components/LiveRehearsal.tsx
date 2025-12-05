import React, { useState, useRef, useEffect } from 'react';
import { getGeminiClient } from '../services/gemini';
import { createPcmBlob, decodeBase64, pcmToAudioBuffer } from '../utils/audio';
import { LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Volume2, Activity } from 'lucide-react';

const LiveRehearsal: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [transcription, setTranscription] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Initialize Audio Contexts
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (!inputContextRef.current) {
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
  };

  const startSession = async () => {
    initAudio();
    setStatus('connecting');
    setTranscription('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = getGeminiClient();
      const inputCtx = inputContextRef.current!;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Session opened');
            setStatus('active');
            setIsActive(true);

            // Setup Microphone Stream
            const source = inputCtx.createMediaStreamSource(stream);
            // Using ScriptProcessor as per guidance
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
            
            // Store cleanup for stop
            (window as any).liveStreamProcessor = processor;
            (window as any).liveStreamSource = source;
            (window as any).liveStream = stream;
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio) {
                const outputCtx = audioContextRef.current!;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                
                const audioBuffer = await pcmToAudioBuffer(
                  decodeBase64(base64Audio),
                  outputCtx
                );
                
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                });
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
             }

             // Handle Interruption
             if (message.serverContent?.interrupted) {
               sourcesRef.current.forEach(s => s.stop());
               sourcesRef.current.clear();
               nextStartTimeRef.current = 0;
             }
          },
          onclose: () => {
            console.log('Session closed');
            handleStop();
          },
          onerror: (e: any) => {
            console.error('Session error', e);
            setStatus('error');
            handleStop();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a helpful acting coach. Help me practice my lines in Arabic. Keep your responses short, encouraging, and in character as a director. Speak Arabic.",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const handleStop = () => {
    setIsActive(false);
    setStatus('idle');
    
    // Stop Microphone
    if ((window as any).liveStream) {
      (window as any).liveStream.getTracks().forEach((track: any) => track.stop());
    }
    if ((window as any).liveStreamProcessor) {
      (window as any).liveStreamProcessor.disconnect();
    }
    if ((window as any).liveStreamSource) {
      (window as any).liveStreamSource.disconnect();
    }

    // Close Session
    if (sessionRef.current) {
      sessionRef.current.then((s: any) => s.close()); // Close if method exists
      sessionRef.current = null;
    }
    
    // Stop Audio Output
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  useEffect(() => {
    return () => {
      handleStop();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500">
          مدرب البروفة المباشر
        </h2>
        <p className="text-slate-400">تدرب على سطورك مع مخرج ذكاء اصطناعي في الوقت الفعلي.</p>
      </div>

      <div className="bg-slate-900 rounded-3xl border border-slate-700 p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
        
        {/* Visualizer Background Effect */}
        {isActive && (
           <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="w-64 h-64 bg-emerald-500 rounded-full filter blur-[100px] animate-pulse"></div>
           </div>
        )}

        <div className="z-10 flex flex-col items-center gap-8">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
            isActive 
              ? 'bg-emerald-500/20 border-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]' 
              : 'bg-slate-800 border-4 border-slate-700'
          }`}>
             {status === 'connecting' ? (
               <Activity className="w-12 h-12 text-emerald-500 animate-spin" />
             ) : isActive ? (
               <Volume2 className="w-12 h-12 text-emerald-500 animate-pulse" />
             ) : (
               <MicOff className="w-12 h-12 text-slate-500" />
             )}
          </div>

          <div className="text-center space-y-2">
             <h3 className="text-2xl font-semibold text-white">
               {status === 'idle' && 'جاهز للبروفة؟'}
               {status === 'connecting' && 'جاري الاتصال بالمخرج...'}
               {status === 'active' && 'البروفة جارية'}
               {status === 'error' && 'خطأ في الاتصال'}
             </h3>
             <p className="text-slate-400 max-w-md">
               {status === 'idle' 
                 ? "انقر على البدء لبدء جلسة صوتية في الوقت الفعلي. الذكاء الاصطناعي سيستمع إليك ويرد." 
                 : "تحدث بوضوح في الميكروفون. سيرد الذكاء الاصطناعي صوتياً."}
             </p>
          </div>

          <button
            onClick={isActive ? handleStop : startSession}
            disabled={status === 'connecting'}
            className={`px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-3 ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-emerald-500/20'
            }`}
          >
            {isActive ? (
              <>
                <MicOff className="w-6 h-6" /> إيقاف الجلسة
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" /> بدء البروفة
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-sm text-slate-400">
        <strong>ملاحظة الخصوصية:</strong> يتم إرسال صوتك إلى Gemini API للمعالجة ولا يتم تخزينه بواسطة هذا التطبيق.
      </div>
    </div>
  );
};

export default LiveRehearsal;