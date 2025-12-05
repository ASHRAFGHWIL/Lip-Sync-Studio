import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/gemini';
import { Loader2, Clapperboard, Sparkles, AlertCircle } from 'lucide-react';

interface VideoStudioProps {
  initialImage?: string;
  initialPrompt?: string;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ initialImage, initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [hasKey, setHasKey] = useState(true); // Assume true initially

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
      const has = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(has);
    }
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      // Assume success after dialog interaction to avoid race conditions
      setHasKey(true); 
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    if (!hasKey) {
        await handleSelectKey();
    }
    
    setLoading(true);
    setStatusMessage('جاري تحضير المشهد السينمائي...');
    
    try {
      // Simulate progress messages since video gen takes time
      const msgs = [
        'جاري تحليل الصورة والسيناريو...',
        'جاري إخراج الفيديو (قد يستغرق 1-2 دقيقة)...',
        'وضع اللمسات النهائية للإضاءة والحركة...'
      ];
      let msgIdx = 0;
      const interval = setInterval(() => {
        if (msgIdx < msgs.length) setStatusMessage(msgs[msgIdx++]);
      }, 15000);

      const url = await generateVideo(prompt, initialImage);
      
      clearInterval(interval);
      setVideoUrl(url);
    } catch (e) {
      console.error(e);
      setStatusMessage('فشل في توليد الفيديو. تأكد من استخدام مفتاح API مدفوع يدعم Veo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
          استوديو الفيديو السينمائي
        </h2>
        <p className="text-slate-400">حول صورتك إلى مشهد سينمائي حي باستخدام Veo.</p>
      </div>

      {!hasKey && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-3">
             <AlertCircle className="text-yellow-500" />
             <span className="text-yellow-200 text-sm">تتطلب نماذج الفيديو مفتاح API مدفوع.</span>
           </div>
           <button 
             onClick={handleSelectKey}
             className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg text-sm hover:bg-yellow-400"
           >
             تحديد مفتاح API
           </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 h-fit">
          
          {initialImage && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">الصورة المرجعية</label>
              <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                <img src={initialImage} alt="Reference" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">وصف الحركة (Prompt)</label>
            <textarea
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all resize-none"
              placeholder="صف كيف تتحرك الشخصية... مثال: لقطة سينمائية مقربة، الشخصية تبتسم ببطء وتنظر للكاميرا، إضاءة درامية، جودة 4k"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-semibold text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Clapperboard className="w-5 h-5" />}
            {loading ? 'جاري الإنتاج...' : 'توليد الفيديو'}
          </button>
          
          <div className="text-xs text-slate-500">
            * توليد الفيديو قد يستغرق دقيقة أو أكثر. يرجى الانتظار.
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-2 flex items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center gap-4 animate-pulse text-center px-4">
               <div className="w-16 h-16 relative">
                 <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                 <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
               </div>
               <p className="text-orange-400 text-lg font-medium">{statusMessage}</p>
            </div>
          ) : videoUrl ? (
            <div className="relative w-full h-full flex flex-col gap-4">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop
                className="w-full h-auto rounded-xl shadow-2xl shadow-black/50"
              />
              <a 
                href={videoUrl} 
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-center rounded-xl text-white font-medium transition-colors"
              >
                تحميل الفيديو (MP4)
              </a>
            </div>
          ) : (
            <div className="text-center text-slate-600">
               <Clapperboard className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p>سيظهر الفيديو السينمائي هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;