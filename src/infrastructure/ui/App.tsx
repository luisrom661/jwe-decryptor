import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, ShieldCheck, ShieldAlert, Eye, EyeOff, Copy, Trash2, Settings2, Terminal, FileCode2, Lock, Zap, Code, PenTool, X, AlertTriangle, CheckCircle2, Languages, Binary, FileUp, Download, Sun, Moon 
} from 'lucide-react';
import { useTokenInspector, useTokenStudio, useUtils, useBase64Studio } from './hooks/useTokenLogic';
import { translations, Language } from './translations';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inspect' | 'studio' | 'utils' | 'base64'>('inspect');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('es');

  const t = useMemo(() => translations[lang], [lang]);

  const inspector = useTokenInspector();
  const studio = useTokenStudio();
  const utils = useUtils();
  const base64 = useBase64Studio();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const copyToClipboard = (text: any, section: string) => {
    const value = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
    navigator.clipboard.writeText(value);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans p-4 md:p-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-6 md:gap-8 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                <Lock size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">DevSec Toolkit</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Crypto & Web Utils Studio</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <div className="flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setLang(lang === 'es' ? 'en' : 'es')} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs"
                >
                  <Languages size={14} className="text-indigo-500" />
                  {lang.toUpperCase()}
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  {isDarkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-500" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 gap-1 md:gap-2">
              <button onClick={() => setActiveTab('inspect')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'inspect' ? 'bg-indigo-600 text-white shadow-lg dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><ShieldCheck size={18} />{t.inspectTab}</button>
              <button onClick={() => setActiveTab('studio')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'studio' ? 'bg-indigo-600 text-white shadow-lg dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><PenTool size={18} />{t.studioTab}</button>
              <button onClick={() => setActiveTab('base64')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'base64' ? 'bg-indigo-600 text-white shadow-lg dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><FileCode2 size={18} />{t.base64Tab}</button>
              <button onClick={() => setActiveTab('utils')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'utils' ? 'bg-indigo-600 text-white shadow-lg dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Binary size={18} />{t.utilsTab}</button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'inspect' && (
            <motion.div key="inspect" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <InspectorPanel hook={inspector} t={t} />
              <ResultPanel result={inspector.result} copiedSection={copiedSection} copyToClipboard={copyToClipboard} t={t} />
            </motion.div>
          )}
          {activeTab === 'studio' && (
            <motion.div key="studio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <StudioPanel hook={studio} t={t} />
              <StudioOutput hook={studio} copiedSection={copiedSection} copyToClipboard={copyToClipboard} t={t} />
            </motion.div>
          )}
          {activeTab === 'base64' && (
            <motion.div key="base64" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
              <Base64Panel hook={base64} t={t} copyToClipboard={copyToClipboard} copiedSection={copiedSection} />
            </motion.div>
          )}
          {activeTab === 'utils' && (
            <motion.div key="utils" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <UtilsPanel hook={utils} t={t} copyToClipboard={copyToClipboard} copiedSection={copiedSection} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

  function InspectorPanel({ hook, t }: any) {
  return (
    <section className="lg:col-span-5 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-7 space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest"><Terminal size={14} className="inline mr-2 text-indigo-500" />{t.inputToken}</label>
          <textarea value={hook.token} onChange={e => hook.setToken(e.target.value)} placeholder={t.pastePlaceholder} className="w-full h-36 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 font-mono text-sm resize-none dark:text-slate-300" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest"><Key size={14} className="inline mr-2 text-indigo-500" />{t.key}</label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {['oct', 'rsa', 'ec', 'jwk'].map(t => <button key={t} onClick={() => hook.setKeyType(t)} className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg ${hook.keyType === t ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-400'}`}>{t}</button>)}
            </div>
          </div>
          <div className="relative">
            <textarea value={hook.key} onChange={e => hook.setKey(e.target.value)} className={`w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 font-mono text-sm resize-none dark:text-slate-300 ${!hook.showKey && hook.key ? 'blur-sm select-none' : ''}`} />
            <div className="absolute right-3 top-3 flex gap-2">
              <button onClick={() => hook.setKey('')} className="p-2 bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 dark:border-slate-700 rounded-xl text-slate-400 hover:text-red-500 shadow-sm"><Trash2 size={16} /></button>
              <button onClick={() => hook.setShowKey(!hook.showKey)} className="p-2 bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm">{hook.showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
        </div>
        <button onClick={hook.inspect} disabled={hook.isProcessing || !hook.token} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-3">
          {hook.isProcessing ? <Zap size={22} className="animate-spin" /> : <ShieldCheck size={22} />}{hook.isProcessing ? t.processing : t.processBtn}
        </button>
        <AnimatePresence>
          {hook.error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 relative group">
                <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-black uppercase tracking-wider leading-none">{t.extractionError}</p>
                  <p className="text-xs font-medium opacity-80 leading-relaxed">{hook.error}</p>
                </div>
                <button 
                  onClick={() => hook.setError(null)}
                  className="p-1 hover:bg-red-100 rounded-lg transition-colors absolute right-2 top-2"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ResultPanel({ result, copiedSection, copyToClipboard, t }: any) {
  return (
    <section className="lg:col-span-7">
      {!result ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl h-full min-h-[500px] flex flex-col items-center justify-center text-slate-300 p-8 text-center">
          <Code size={64} className="opacity-20 mb-4" />
          <h3 className="text-xl font-bold text-slate-400">{t.readyTitle}</h3>
          <p className="text-sm mt-2 opacity-60">{t.readyDescription}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {result.isValid !== undefined && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-3xl flex items-start gap-4 transition-all ${
                result.isValid 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' 
                  : 'bg-amber-50 text-amber-700 border border-amber-100 shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-2xl ${result.isValid ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {result.isValid ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
              </div>
              <div className="flex-1 pt-1">
                <p className="font-black text-xs uppercase tracking-widest leading-none">
                  {result.isValid ? t.integrityVerified : t.securityWarning}
                </p>
                {result.validationIssues && result.validationIssues.length > 0 ? (
                  <ul className="text-xs font-medium opacity-90 mt-2 space-y-1">
                    {result.validationIssues.map((issue: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full ${result.isValid ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {issue}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs font-medium opacity-70 mt-1.5">{t.noIssues}</p>
                )}
              </div>
            </motion.div>
          )}

          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center"><span className="text-white font-black text-xs uppercase tracking-widest">{t.header}</span><button onClick={() => copyToClipboard(result.header, 'h')} className="text-indigo-400 text-xs font-black uppercase">{copiedSection === 'h' ? t.copied : t.copy}</button></div>
            <pre className="p-6 text-indigo-300 text-sm font-mono">{JSON.stringify(result.header, null, 2)}</pre>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center"><span className="text-slate-800 dark:text-slate-200 font-black text-xs uppercase tracking-widest">{t.payload}</span><button onClick={() => copyToClipboard(result.payload, 'p')} className="text-indigo-600 text-xs font-black uppercase">{copiedSection === 'p' ? t.copied : t.copy}</button></div>
            <pre className="p-6 text-slate-600 dark:text-slate-400 text-sm font-mono whitespace-pre-wrap">{typeof result.payload === 'object' ? JSON.stringify(result.payload, null, 2) : result.payload}</pre>
          </div>
        </div>
      )}
    </section>
  );
}

function StudioPanel({ hook, t }: any) {
  return (
    <section className="lg:col-span-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-7 space-y-6">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          {['JWT', 'JWE'].map(tType => <button key={tType} onClick={() => { hook.setType(tType); hook.setAlg(tType === 'JWT' ? 'HS256' : 'RSA-OAEP'); }} className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${hook.type === tType ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-md' : 'text-slate-400'}`}>{tType}</button>)}
        </div>
        <textarea value={hook.payload} onChange={e => hook.setPayload(e.target.value)} className="w-full h-48 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-sm resize-none" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.algLabel}</label>
            <select value={hook.alg} onChange={e => hook.setAlg(e.target.value)} className="w-full px-3 py-2 border rounded-xl font-bold text-sm">
              {(hook.type === 'JWT' ? ['HS256', 'RS256', 'ES256'] : ['RSA-OAEP', 'A128KW', 'dir']).map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          {hook.type === 'JWE' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.encLabel}</label>
              <select value={hook.enc} onChange={e => hook.setEnc(e.target.value)} className="w-full px-3 py-2 border rounded-xl font-bold text-sm">
                {['A128GCM', 'A256GCM'].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t.key}</label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {['oct', 'rsa', 'ec', 'jwk'].map(tKey => <button key={tKey} onClick={() => hook.setKeyType(tKey)} className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg ${hook.keyType === tKey ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{tKey}</button>)}
            </div>
            {(hook.keyType === 'oct' || hook.keyType === 'rsa') && (
              <button 
                onClick={hook.generateInternalKey}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black hover:bg-indigo-100 transition-all border border-indigo-100"
              >
                <Zap size={10} />
                {t.generateKey}
              </button>
            )}
          </div>
          <div className="relative">
            <textarea 
              value={hook.key} 
              onChange={e => hook.setKey(e.target.value)} 
              placeholder={hook.type === 'JWT' ? "Signing Key..." : "Encryption Key..."} 
              className={`w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-100 font-mono text-sm resize-none ${!hook.showKey && hook.key ? 'blur-sm select-none' : ''}`} 
            />
            <div className="absolute right-3 top-3 flex gap-2">
              <button onClick={() => hook.setKey('')} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-red-500 shadow-sm"><Trash2 size={16} /></button>
              <button onClick={() => hook.setShowKey(!hook.showKey)} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm">{hook.showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
        </div>
        <button onClick={hook.generate} disabled={hook.isGenerating || !hook.key} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3">
          {hook.isGenerating ? <Zap size={22} className="animate-spin" /> : <PenTool size={22} />}{hook.isGenerating ? t.generating : t.generateBtn}
        </button>

        <AnimatePresence>
          {hook.error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 relative group">
                <ShieldAlert size={20} className="shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-black uppercase tracking-wider leading-none">{t.generationFailed}</p>
                  <p className="text-xs font-medium opacity-80 leading-relaxed">{hook.error}</p>
                </div>
                <button 
                  onClick={() => hook.setError(null)}
                  className="p-1 hover:bg-red-100 rounded-lg transition-colors absolute right-2 top-2"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function StudioOutput({ hook, copiedSection, copyToClipboard, t }: any) {
  return (
    <section className="lg:col-span-6">
      {!hook.result ? (
        <div className="bg-slate-900 border-2 border-dashed border-white/10 rounded-3xl h-full min-h-[500px] flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 p-8 text-center">
          <Zap size={48} className="opacity-20 mb-4" />
          <h3 className="font-bold text-slate-400">{t.outputToken}</h3>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-indigo-600 rounded-3xl p-8 space-y-6 shadow-2xl relative group">
          <div className="flex justify-between items-center text-white">
            <span className="text-xs font-black uppercase tracking-widest">{t.outputToken}</span>
            <button 
              onClick={() => copyToClipboard(hook.result, 'out')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${copiedSection === 'out' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 text-indigo-600 shadow-lg hover:scale-105'}`}
            >
              {copiedSection === 'out' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {copiedSection === 'out' ? t.copied : t.copy}
            </button>
          </div>
          <p className="text-white font-mono text-sm break-all bg-white dark:bg-slate-900/10 p-6 rounded-2xl border border-white/20 shadow-inner">{hook.result}</p>
          <div className="flex gap-4">
             <div className="px-3 py-1 bg-white dark:bg-slate-900/10 rounded-lg"><span className="text-[10px] text-indigo-200 uppercase font-black block">{t.length}</span><span className="text-white font-bold text-sm">{hook.result.length} {t.chars}</span></div>
             <div className="px-3 py-1 bg-white dark:bg-slate-900/10 rounded-lg"><span className="text-[10px] text-indigo-200 uppercase font-black block">{t.type}</span><span className="text-white font-bold text-sm">{hook.type}</span></div>
          </div>
        </motion.div>
      )}
    </section>
  );
}

function UtilsPanel({ hook, t, copyToClipboard, copiedSection }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* URL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-7 space-y-6">
        <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <Settings2 size={16} className="text-indigo-500" />
          {t.urlLabel}
        </label>
        <textarea 
          value={hook.urlInput} 
          onChange={e => hook.setUrlInput(e.target.value)} 
          className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-sm resize-none" 
        />
        <div className="flex gap-3">
          <button onClick={hook.urlEncode} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">{t.encode}</button>
          <button onClick={hook.urlDecode} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">{t.decode}</button>
        </div>
        {hook.urlOutput && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 relative group overflow-hidden">
            <pre className="text-xs font-mono break-all line-clamp-3">{hook.urlOutput}</pre>
            <button 
              onClick={() => copyToClipboard(hook.urlOutput, 'url')} 
              className="absolute right-2 top-2 p-1.5 bg-white dark:bg-slate-900 border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Copy size={14} className="text-slate-400" />
            </button>
          </div>
        )}
      </div>

      {/* UUID */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-7 space-y-6">
        <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <Zap size={16} className="text-indigo-500" />
          {t.uuidLabel}
        </label>
        <div className="flex flex-col h-full gap-4">
          <button onClick={hook.genUuid} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none">
            <Zap size={20} />
            {t.generate}
          </button>
          {hook.uuidOutput && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <code className="text-indigo-600 font-bold font-mono">{hook.uuidOutput}</code>
              <button 
                onClick={() => copyToClipboard(hook.uuidOutput, 'uuid')} 
                className={`p-2 rounded-xl transition-all ${copiedSection === 'uuid' ? 'bg-emerald-500 text-white' : 'hover:bg-indigo-100 text-indigo-400'}`}
              >
                {copiedSection === 'uuid' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {hook.error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="col-span-full">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center justify-between border border-red-100 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldAlert size={20} />
                <span className="text-sm font-bold">{hook.error}</span>
              </div>
              <button onClick={() => hook.setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Base64Panel({ hook, t, copyToClipboard, copiedSection }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-7 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              <button 
                onClick={() => { hook.clearAll(); hook.setMode('text'); }} 
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${hook.mode === 'text' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                {t.textMode}
              </button>
              <button 
                onClick={() => { hook.clearAll(); hook.setMode('file'); }} 
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${hook.mode === 'file' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                {t.fileMode}
              </button>
            </div>
            <button onClick={hook.clearAll} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title={t.clearAll}>
              <Trash2 size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest px-1">
              {hook.mode === 'text' ? t.encodeTitle : t.fileMode}
            </h4>
            
            {hook.mode === 'text' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>{t.payloadLabel}</span>
                    <button onClick={hook.clearInput} className="text-indigo-500 hover:underline">{t.clearText}</button>
                  </div>
                  <textarea 
                    value={hook.input} 
                    onChange={e => hook.setInput(e.target.value)} 
                    placeholder={t.pastePlaceholder}
                    className="w-full h-48 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-sm resize-none focus:ring-4 focus:ring-indigo-100 transition-all shadow-inner" 
                  />
                </div>
                <button 
                  onClick={hook.encodeText} 
                  disabled={!hook.input}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap size={18} />
                  {t.encode}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div 
                  onClick={() => document.getElementById('file-input')?.click()}
                  className={`w-full h-48 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group ${hook.fileInfo ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-100 hover:bg-slate-50 dark:bg-slate-950'}`}
                >
                  <input id="file-input" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && hook.handleFileUpload(e.target.files[0])} />
                  <div className={`p-4 rounded-full transition-all ${hook.fileInfo ? 'bg-indigo-100' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100'}`}>
                    <FileUp size={32} className={hook.fileInfo ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-500'} />
                  </div>
                  <div className="text-center px-6">
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{hook.fileInfo ? t.fileReady : t.dragFile}</p>
                    {hook.fileInfo && <p className="text-indigo-600 text-xs font-mono font-bold break-all">{hook.fileInfo.name}</p>}
                  </div>
                </div>
                <button 
                  onClick={hook.encodeFile} 
                  disabled={!hook.fileInfo}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Binary size={18} />
                  {t.encode}
                </button>
              </div>
            )}
          </div>

          {hook.mode === 'text' && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest px-1">
                {t.decodeTitle}
              </h4>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Base64</span>
                    </div>
                    <textarea 
                      value={hook.decodeInput} 
                      onChange={e => { hook.setDecodeInput(e.target.value); }}
                      placeholder="Paste Base64 here to decode..."
                      className="w-full h-24 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-sm resize-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/20 transition-all shadow-inner dark:text-slate-300" 
                    />
                 </div>
                  <button 
                    onClick={hook.decodeText} 
                    disabled={!hook.decodeInput}
                    className="w-full py-4 bg-slate-800 dark:bg-slate-800 text-white rounded-2xl font-black shadow-lg hover:bg-slate-900 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Lock size={18} />
                    {t.decode}
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-7 flex flex-col h-full min-h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                {hook.decodedType === 'text' ? 'Output' : 'Preview'}
              </label>
              {hook.decodedType !== 'text' && (
                <span className="text-[10px] font-bold text-indigo-500 mt-1">{t.detectedAs}: {hook.decodedType.toUpperCase()}</span>
              )}
            </div>
            <div className="flex gap-2">
              {(hook.output || hook.previewUrl || ((hook.decodedType === 'pdf' || hook.decodedType === 'binary') && hook.input)) && (
                <>
                  <button onClick={hook.clearOutput} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title={t.clearText}>
                    <Trash2 size={18} />
                  </button>
                  <button onClick={() => hook.downloadDecodedFile()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    <Download size={14} />
                    {t.downloadFile}
                  </button>
                  {hook.output && (
                    <button onClick={() => copyToClipboard(hook.output, 'b64out')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${copiedSection === 'b64out' ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white shadow-lg'}`}>
                      {copiedSection === 'b64out' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      {copiedSection === 'b64out' ? t.copied : t.copy}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 bg-slate-900 rounded-3xl p-6 font-mono text-sm text-indigo-300 break-all overflow-auto shadow-inner border border-white/5 relative flex items-center justify-center">
            {hook.decodedType === 'image' && hook.previewUrl ? (
                <img src={hook.previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
            ) : hook.output ? (
                <pre className="w-full h-full whitespace-pre-wrap leading-relaxed">{hook.output}</pre>
            ) : hook.decodedType === 'pdf' || hook.decodedType === 'binary' ? (
                <div className="text-center">
                  <FileUp size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xs font-black uppercase tracking-widest">{t.previewNotAvail}</p>
                  <p className="text-[10px] mt-2 opacity-60">El entorno de prueba bloquea visores integrados.<br/>Usa el botón de descarga.</p>
                </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                <Binary size={64} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-tighter">Waiting for Action</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {hook.error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center justify-between border border-red-100">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={18} />
                    <span className="text-sm font-bold">{hook.error}</span>
                  </div>
                  <button onClick={() => hook.setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors"><X size={16} /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
