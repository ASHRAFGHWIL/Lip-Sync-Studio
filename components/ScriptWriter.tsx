import React, { useState } from 'react';
import { generateScript } from '../services/gemini';
import { Loader2, Copy, Wand2, FileText } from 'lucide-react';

interface ScriptWriterProps {
  onUseScript: (text: string) => void;
}

const ScriptWriter: React.FC<ScriptWriterProps> = ({ onUseScript }) => {
  const [topic, setTopic] = useState('');
  const [mood, setMood] = useState('مضحك');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const script = await generateScript(topic, mood);
      setResult(script);
    } catch (e) {
      alert("فشل في توليد النص. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          كاتب السيناريو السحري
        </h2>
        <p className="text-slate-400">أنشئ حوارات سريعة الانتشار في ثوانٍ.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">ما هو موضوع الفيديو؟</label>
            <textarea
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              placeholder="مثال: قطة تشرح فيزياء الكم، انفصال درامي بسبب البيتزا..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">المزاج / الأسلوب</label>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            >
              <option value="Funny">مضحك</option>
              <option value="Dramatic">درامي</option>
              <option value="Sarcastic">ساخر</option>
              <option value="Inspirational">ملهم</option>
              <option value="Educational">تعليمي</option>
              <option value="Chaotic">فوضوي</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
            توليد السيناريو
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">المخرجات</label>
          <div className="relative h-[400px] bg-slate-800/80 rounded-2xl border border-slate-700 p-6 flex flex-col">
            {result ? (
              <>
                <textarea
                  className="flex-1 w-full bg-transparent border-none resize-none focus:outline-none text-lg leading-relaxed text-slate-100"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                />
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                      alert("تم النسخ!");
                    }}
                    className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> نسخ
                  </button>
                  <button
                    onClick={() => onUseScript(result)}
                    className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> إرسال لاستوديو الصوت
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
                  <FileText className="w-8 h-8 opacity-50" />
                </div>
                <p>سوف تظهر تحفتك الفنية هنا.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptWriter;