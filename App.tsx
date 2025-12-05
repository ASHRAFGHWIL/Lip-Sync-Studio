import React, { useState } from 'react';
import { AppView } from './types';
import ScriptWriter from './components/ScriptWriter';
import VoiceStudio from './components/VoiceStudio';
import AvatarStudio from './components/AvatarStudio';
import VideoStudio from './components/VideoStudio';
import LiveRehearsal from './components/LiveRehearsal';
import { 
  LayoutDashboard, 
  FileText, 
  Mic2, 
  Image as ImageIcon, 
  Radio, 
  Github,
  Clapperboard
} from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [sharedScript, setSharedScript] = useState<string>('');
  const [sharedImage, setSharedImage] = useState<string>('');

  const handleUseScript = (text: string) => {
    setSharedScript(text);
    setCurrentView(AppView.VOICE_STUDIO);
  };

  const handleGenerateVideo = (imageUrl: string) => {
    setSharedImage(imageUrl);
    setCurrentView(AppView.VIDEO_STUDIO);
  };

  const NavButton = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 w-full aspect-square ${
        currentView === view
          ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-500 text-white shadow-xl scale-105'
          : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-200'
      }`}
    >
      <Icon className={`w-8 h-8 ${currentView === view ? 'text-purple-400' : 'opacity-70'}`} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 selection:bg-purple-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setCurrentView(AppView.DASHBOARD)}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              استوديو مزامنة الشفاه
            </h1>
          </div>
          <a 
            href="#" 
            className="hidden md:flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>مفتوح المصدر</span>
          </a>
        </div>
      </header>

      {/* Main Layout */}
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {currentView === AppView.DASHBOARD ? (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="text-center space-y-4 max-w-2xl mx-auto mt-12">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                أنشئ محتوى <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                  مزامنة شفاه فيرال
                </span>
              </h2>
              <p className="text-lg text-slate-400">
                أطلق العنان لإبداعك مع Gemini AI. أنشئ نصوصاً مضحكة، وتعليقات صوتية واقعية، وصوراً رمزية فريدة في ثوانٍ.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
              <NavButton view={AppView.SCRIPT_WRITER} icon={FileText} label="كاتب السيناريو" />
              <NavButton view={AppView.VOICE_STUDIO} icon={Mic2} label="استوديو الصوت" />
              <NavButton view={AppView.AVATAR_STUDIO} icon={ImageIcon} label="توليد الشخصيات" />
              <NavButton view={AppView.VIDEO_STUDIO} icon={Clapperboard} label="فيديو سينمائي" />
              <NavButton view={AppView.LIVE_REHEARSAL} icon={Radio} label="المدرب المباشر" />
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
              {[
                { title: "كتابة ذكية", desc: "لا تنفد أفكارك أبداً. دع Gemini Flash يكتب لك المشهد الفيرال القادم.", color: "text-purple-400" },
                { title: "صوت واقعي", desc: "أنشئ تعليقات صوتية احترافية لمزامنة الشفاه باستخدام أحدث تقنيات تحويل النص إلى كلام.", color: "text-cyan-400" },
                { title: "إنتاج سينمائي", desc: "حول صورك إلى مقاطع فيديو حية عالية الجودة باستخدام نموذج Veo الجديد.", color: "text-orange-400" }
              ].map((item, i) => (
                <div key={i} className="bg-slate-800/20 p-6 rounded-2xl border border-slate-800">
                  <h3 className={`font-bold text-lg mb-2 ${item.color}`}>{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative">
             <button 
               onClick={() => setCurrentView(AppView.DASHBOARD)}
               className="absolute -top-12 right-0 text-sm text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
             >
               → العودة للرئيسية
             </button>
             
             {currentView === AppView.SCRIPT_WRITER && <ScriptWriter onUseScript={handleUseScript} />}
             {currentView === AppView.VOICE_STUDIO && <VoiceStudio initialText={sharedScript} />}
             {currentView === AppView.AVATAR_STUDIO && <AvatarStudio onGenerateVideo={handleGenerateVideo} />}
             {currentView === AppView.VIDEO_STUDIO && <VideoStudio initialImage={sharedImage} />}
             {currentView === AppView.LIVE_REHEARSAL && <LiveRehearsal />}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;