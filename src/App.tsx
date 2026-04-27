import { useState, useEffect } from 'react';
import * as jose from 'jose';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Trash2, 
  Settings2,
  Terminal,
  FileCode2,
  AlertCircle
} from 'lucide-react';

type KeyType = 'oct' | 'rsa' | 'ec' | 'jwk';

interface DecryptResult {
  header: any;
  payload: any;
  raw: string;
  innerJwt?: {
    header: any;
    payload: any;
    raw: string;
  } | null;
}

export default function App() {
  const [token, setToken] = useState('');
  const [key, setKey] = useState('');
  const [keyType, setKeyType] = useState<KeyType>('oct');
  const [showKey, setShowKey] = useState(false);
  const [result, setResult] = useState<DecryptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [copiedSection, setCopiedSection] = useState<'header' | 'payload' | null>(null);
  const [headerPreview, setHeaderPreview] = useState<any>(null);

  // Attempt to decode header preview when token changes
  useEffect(() => {
    if (!token) {
      setHeaderPreview(null);
      return;
    }
    
    try {
      const parts = token.trim().split('.');
      if (parts.length >= 3) {
        const decoded = JSON.parse(new TextDecoder().decode(jose.base64url.decode(parts[0])));
        setHeaderPreview(decoded);
      }
    } catch {
      setHeaderPreview(null);
    }
  }, [token]);

  const handleDecrypt = async () => {
    setIsDecrypting(true);
    setError(null);
    setResult(null);

    const cleanToken = token.trim();
    const parts = cleanToken.split('.');

    try {
      if (!cleanToken) throw new Error('Please provide a token (JWT or JWE).');

      // CASE: JWE (5 parts)
      if (parts.length === 5) {
        if (!key.trim()) throw new Error('Decryption key is required for JWE tokens.');

        let cryptoKey: jose.KeyLike | Uint8Array;

        if (keyType === 'jwk') {
          const jwk = JSON.parse(key);
          cryptoKey = await jose.importJWK(jwk);
        } else if (keyType === 'oct') {
          cryptoKey = new TextEncoder().encode(key);
        } else {
          cryptoKey = await jose.importPKCS8(key, 'ANY');
        }

        const { plaintext, protectedHeader } = await jose.compactDecrypt(cleanToken, cryptoKey);
        const rawPayload = new TextDecoder().decode(plaintext);
        let payload;
        let innerJwt = null;

        try {
          payload = JSON.parse(rawPayload);
        } catch {
          payload = rawPayload;
        }

        // Detect nested JWT inside JWE
        if (typeof rawPayload === 'string' && rawPayload.split('.').length === 3) {
          try {
            const [h, p] = rawPayload.split('.');
            innerJwt = {
              header: JSON.parse(new TextDecoder().decode(jose.base64url.decode(h))),
              payload: JSON.parse(new TextDecoder().decode(jose.base64url.decode(p))),
              raw: rawPayload
            };
          } catch (e) {
            console.log('Not a valid inner JWT', e);
          }
        }

        setResult({
          header: protectedHeader,
          payload: payload,
          raw: rawPayload,
          innerJwt: innerJwt
        });
      } 
      // CASE: JWT (3 parts)
      else if (parts.length === 3) {
        try {
          const header = JSON.parse(new TextDecoder().decode(jose.base64url.decode(parts[0])));
          const payload = JSON.parse(new TextDecoder().decode(jose.base64url.decode(parts[1])));
          
          setResult({
            header,
            payload,
            raw: cleanToken,
            innerJwt: null
          });
        } catch (e: any) {
          throw new Error('Failed to decode JWT segments: ' + e.message);
        }
      } 
      else {
        throw new Error(`Invalid token format. Detected ${parts.length} parts. JWE requires 5, JWT requires 3.`);
      }

    } catch (err: any) {
      setError(err.message || 'Decryption failed. Check your token and key.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const copyToClipboard = (text: string, section: 'header' | 'payload') => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const clearAll = () => {
    setToken('');
    setKey('');
    setResult(null);
    setError(null);
    setHeaderPreview(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">JWE & JWT Inspector</h1>
              <p className="text-slate-500 text-sm">Professional JWE Decryption & JWT Claims Inspection</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Trash2 size={18} />
              <span className="text-sm font-medium">Clear All</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
              {/* JWE Token Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Terminal size={16} className="text-indigo-500" />
                  Token (JWE or JWT)
                </label>
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="eyJhbGciOiJ..."
                  className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-sm font-mono resize-none"
                />
                
                <AnimatePresence>
                  {headerPreview && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          {token.split('.').length === 5 ? 'JWE Header Preview' : 'JWT Header Preview'}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-400">{headerPreview.alg} / {headerPreview.enc || 'Signed'}</span>
                      </div>
                      <code className="text-xs text-indigo-700 block truncate">
                        {JSON.stringify(headerPreview)}
                      </code>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Key Config - Modified to show it's optional for standard JWT */}
              <div className={`space-y-4 pt-2 transition-opacity duration-300 ${token && token.split('.').length === 3 ? 'opacity-60' : 'opacity-100'}`}>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Key size={16} className="text-indigo-500" />
                    Decryption Key
                    {token && token.split('.').length === 3 && (
                      <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase">Optional (JWT)</span>
                    )}
                  </label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {(['oct', 'rsa', 'ec', 'jwk'] as KeyType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setKeyType(type)}
                        className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md transition-all ${
                          keyType === type 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder={
                      keyType === 'oct' ? 'Symmetric Passphrase / Secret' :
                      keyType === 'jwk' ? '{"kty":"...", ...}' :
                      '-----BEGIN PRIVATE KEY-----...'
                    }
                    className={`w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm font-mono resize-none ${!showKey && key ? 'blur-[3px]' : ''}`}
                  />
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    <button
                      onClick={() => setKey('')}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                      title="Clear Key"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors shadow-sm"
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDecrypt}
                disabled={isDecrypting || !token || !key}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-3"
              >
                {isDecrypting ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShieldCheck size={20} />
                )}
                {token.split('.').length === 3 ? 'Inspect JWT' : 'Decrypt JWE'}
              </button>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600"
                >
                  <AlertCircle className="shrink-0" size={20} />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </div>
            
            {/* Tips/Info */}
            <div className="bg-slate-900 rounded-2xl p-6 text-slate-400 space-y-4">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Settings2 size={18} />
                <h3>Usage Guide</h3>
              </div>
              <ul className="text-xs space-y-2.5 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">1.</span>
                  <span>Paste your 5-part JWE or 3-part JWT token.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">2.</span>
                  <span>For JWE: Choose key format and provide the key.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">3.</span>
                  <span>For JWT: Just click Decrypt/Inspect to see claims.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">4.</span>
                  <span>Payload will be automatically formatted if it's valid JSON.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Results Panel */}
          <section className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border-2 border-dashed border-slate-200 rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4 p-8 text-center"
                >
                  <div className="bg-slate-50 p-4 rounded-full">
                    <FileCode2 size={48} className="text-slate-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-500">Awaiting Decryption</h3>
                    <p className="text-sm max-w-xs mx-auto">Fill in the JWE token and key details to see the decrypted contents here.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Decrypted Header */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        {result.raw.split('.').length === 5 ? 'JWE Header' : 'JWT Header'}
                      </h3>
                      <button 
                        onClick={() => copyToClipboard(result.header, 'header')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all hover:border-indigo-100"
                      >
                        {copiedSection === 'header' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copiedSection === 'header' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-6">
                      <pre className="text-sm font-mono text-slate-600 overflow-x-auto">
                        {JSON.stringify(result.header, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Inner JWT (Nested) if detected */}
                  {result.innerJwt && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center gap-4 py-2">
                        <div className="h-px flex-1 bg-amber-200" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                          Nested JWT (JWS) Detected
                        </span>
                        <div className="h-px flex-1 bg-amber-200" />
                      </div>

                      <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-amber-50 bg-amber-50/50 flex items-center justify-between">
                          <h3 className="font-bold text-amber-800 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-amber-500" />
                            Inner JWT Header
                          </h3>
                          <button 
                            onClick={() => copyToClipboard(result.innerJwt?.header, 'header')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-500 hover:text-amber-600 transition-all"
                          >
                            {copiedSection === 'header' ? <Check size={14} /> : <Copy size={14} />}
                            Copy
                          </button>
                        </div>
                        <div className="p-6">
                          <pre className="text-sm font-mono text-amber-900 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(result.innerJwt.header, null, 2)}
                          </pre>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-amber-50 bg-amber-50/50 flex items-center justify-between">
                          <h3 className="font-bold text-amber-800 flex items-center gap-2">
                            <Eye size={18} className="text-amber-500" />
                            Inner JWT Payload
                          </h3>
                          <button 
                            onClick={() => copyToClipboard(result.innerJwt?.payload, 'payload')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-500 hover:text-amber-600 transition-all"
                          >
                            {copiedSection === 'payload' ? <Check size={14} /> : <Copy size={14} />}
                            Copy
                          </button>
                        </div>
                        <div className="p-0">
                          <div className="bg-slate-900 p-6 text-amber-200 font-mono text-sm leading-relaxed overflow-x-auto">
                            <pre className="whitespace-pre-wrap break-all">
                              {JSON.stringify(result.innerJwt.payload, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Decrypted Payload / JWT Payload */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <FileCode2 size={18} className="text-indigo-500" />
                        {result.raw.split('.').length === 5 ? 'Decrypted JWE Payload' : 'JWT Claims'}
                      </h3>
                      <button 
                        onClick={() => copyToClipboard(result.payload, 'payload')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all hover:border-indigo-100"
                      >
                        {copiedSection === 'payload' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copiedSection === 'payload' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-0">
                      <div className="bg-[#1e293b] p-6 text-slate-300 font-mono text-sm leading-relaxed overflow-x-auto">
                        <pre className="whitespace-pre-wrap break-all">
                          {typeof result.payload === 'object' 
                            ? JSON.stringify(result.payload, null, 2) 
                            : result.payload}
                        </pre>
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold flex justify-between">
                      <span>Algorithm: {result.header.alg}</span>
                      <span>Encoding: {result.header.enc}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
}
