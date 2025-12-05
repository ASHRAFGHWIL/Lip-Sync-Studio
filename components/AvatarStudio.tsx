import React, { useState, useRef } from 'react';
import { generateAvatar } from '../services/gemini';
import { Loader2, Image as ImageIcon, Download, Sparkles, Upload, Video } from 'lucide-react';

interface AvatarStudioProps {
  onGenerateVideo?: (imageUrl: string) => void;
}

const AvatarStudio: React.FC<AvatarStudioProps> = ({ onGenerateVideo }) => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const url = await generateAvatar(prompt);
      setImageUrl(url);
    } catch (e) {
      alert("فشل في توليد الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400">
          استوديو الصور الرمزية
        </h2>
        <p className="text-slate-400">أنشئ شخصيات فريدة لمقاطع الفيديو الخاصة بك.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 h-fit">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">وصف الشخصية</label>
            <textarea
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all resize-none"
              placeholder="مثال: روبوت سايبربانك بعيون نيون زرقاء، نمط ثلاثي الأبعاد، يواجه الكاميرا..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl font-semibold text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            توليد الشخصية
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-800/50 px-2 text-slate-500">أو</span>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            رفع صورة جاهزة
          </button>
          
          <div className="bg-slate-900/50 rounded-lg p-4 text-xs text-slate-500 leading-relaxed">
            <p className="font-semibold mb-1 text-slate-400">نصيحة احترافية:</p>
            صف الإضاءة والنمط (كرتون، واقعي، ثلاثي الأبعاد) وتعبير الوجه للحصول على أفضل نتيجة لمزامنة الشفاه.
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-2 flex items-center justify-center min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center gap-4 animate-pulse">
               <div className="w-12 h-12 rounded-full border-2 border-pink-500 border-t-transparent animate-spin"></div>
               <p className="text-pink-400 text-sm font-medium">جاري تخيل شخصيتك...</p>
            </div>
          ) : imageUrl ? (
            <div className="relative group w-full h-full">
              <img 
                src={imageUrl} 
                alt="Generated Avatar" 
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 rounded-xl">
                <a 
                  href={imageUrl} 
                  download={`avatar-${Date.now()}.png`}
                  className="py-2 px-6 bg-white text-black font-semibold rounded-full flex items-center gap-2 hover:bg-slate-200 transition-colors"
                >
                  <Download className="w-4 h-4" /> حفظ الصورة
                </a>
                
                {onGenerateVideo && (
                  <button 
                    onClick={() => onGenerateVideo(imageUrl)}
                    className="py-2 px-6 bg-orange-600 text-white font-semibold rounded-full flex items-center gap-2 hover:bg-orange-500 transition-colors shadow-lg shadow-orange-500/30"
                  >
                    <Video className="w-4 h-4" /> تحويل إلى فيديو
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-600">
               <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p>ستظهر شخصيتك هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarStudio;