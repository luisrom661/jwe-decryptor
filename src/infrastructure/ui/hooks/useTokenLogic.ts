import { useState, useEffect } from 'react';
import * as jose from 'jose';
import { DecryptResult, KeyType, StudioConfig } from '../../../domain/models/Token';
import { processTokenUseCase, generateTokenUseCase } from '../../dependencies';

export function useTokenInspector() {
  const [token, setToken] = useState('');
  const [key, setKey] = useState('');
  const [keyType, setKeyType] = useState<KeyType>('oct');
  const [showKey, setShowKey] = useState(false);
  const [result, setResult] = useState<DecryptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [headerPreview, setHeaderPreview] = useState<any>(null);

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
    } catch { setHeaderPreview(null); }
  }, [token]);

  const inspect = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await processTokenUseCase.execute(token, key, keyType);
      setResult(res);
    } catch (e: any) {
      setError(e.message);
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return { token, setToken, key, setKey, keyType, setKeyType, showKey, setShowKey, result, error, setError, isProcessing, headerPreview, inspect };
}

export function useTokenStudio() {
  const STORAGE_KEY = 'jwe_jwt_studio_state';

  // Helper to load initial state safely
  const getInitialState = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  };

  const initial = getInitialState();

  const [type, setType] = useState<'JWT' | 'JWE'>(initial?.type || 'JWT');
  const [payload, setPayload] = useState(initial?.payload || '{\n  "sub": "1234567890",\n  "iat": 1516239022\n}');
  const [key, setKey] = useState(initial?.key || '');
  const [keyType, setKeyType] = useState<KeyType>(initial?.keyType || 'oct');
  const [alg, setAlg] = useState(initial?.alg || 'HS256');
  const [enc, setEnc] = useState(initial?.enc || 'A128GCM');
  const [showKey, setShowKey] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInternalKey = async () => {
    try {
      if (keyType === 'oct') {
        setKey(utilsUseCase.generateSymmetricKey(32));
      } else if (keyType === 'rsa') {
        const pair = await utilsUseCase.generateRSAKeyPair();
        // For studio JWE typically we use the public key to encrypt
        setKey(pair.publicKey);
      }
    } catch (e: any) {
      setError('Key generation failed: ' + e.message);
    }
  };

  // Persistence Effect
  useEffect(() => {
    const stateToSave = { type, payload, key, keyType, alg, enc };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [type, payload, key, keyType, alg, enc]);

  const generate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const config: StudioConfig = { type, payload, key, keyType, alg, enc };
      const res = await generateTokenUseCase.execute(config);
      setResult(res);
    } catch (e: any) {
      setError(e.message);
      setResult('');
    } finally {
      setIsGenerating(false);
    }
  };

  return { type, setType, payload, setPayload, key, setKey, keyType, setKeyType, alg, setAlg, enc, setEnc, showKey, setShowKey, result, error, setError, isGenerating, generate, generateInternalKey };
}

import { utilsUseCase } from '../../dependencies';

export function useUtils() {
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  
  const [urlInput, setUrlInput] = useState('');
  const [urlOutput, setUrlOutput] = useState('');
  
  const [uuidOutput, setUuidOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const b64Encode = () => {
    try {
      setBase64Output(utilsUseCase.base64Encode(base64Input));
      setError(null);
    } catch (e: any) { setError(e.message); }
  };

  const b64Decode = () => {
    try {
      setBase64Output(utilsUseCase.base64Decode(base64Input));
      setError(null);
    } catch (e: any) { setError(e.message); }
  };

  const urlEncode = () => {
    try {
      setUrlOutput(utilsUseCase.urlEncode(urlInput));
      setError(null);
    } catch (e: any) { setError(e.message); }
  };

  const urlDecode = () => {
    try {
      setUrlOutput(utilsUseCase.urlDecode(urlInput));
      setError(null);
    } catch (e: any) { setError(e.message); }
  };

  const genUuid = () => {
    setUuidOutput(utilsUseCase.generateUUID());
  };

  return {
    base64Input, setBase64Input, base64Output, b64Encode, b64Decode,
    urlInput, setUrlInput, urlOutput, urlEncode, urlDecode,
    uuidOutput, genUuid,
    error, setError
  };
}

export function useBase64Studio() {
  const [input, setInput] = useState('');
  const [decodeInput, setDecodeInput] = useState('');
  const [output, setOutput] = useState('');
  const [decodedType, setDecodedType] = useState<'text' | 'image' | 'pdf' | 'binary'>('text');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const encodeText = () => {
    try {
      setOutput(utilsUseCase.base64Encode(input));
      setDecodeInput('');
      setPreviewUrl(null);
      setError(null);
    } catch (e: any) { setError(e.message); }
  };

  const detectAndSetDecoded = (base64: string) => {
    try {
      const binaryString = atob(base64.trim());
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Simple magic number detection
      const hex = Array.from(bytes.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      
      let type: 'text' | 'image' | 'pdf' | 'binary' = 'text';
      let mime = 'text/plain';

      if (hex === '89504E47') { type = 'image'; mime = 'image/png'; }
      else if (hex.startsWith('FFD8FF')) { type = 'image'; mime = 'image/jpeg'; }
      else if (hex === '25504446') { type = 'pdf'; mime = 'application/pdf'; }
      else if (hex === '47494638') { type = 'image'; mime = 'image/gif'; }
      else {
        // Try to see if it's valid UTF-8 text
        try {
          const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
          setOutput(decoded);
          type = 'text';
        } catch {
          type = 'binary';
        }
      }

      setDecodedType(type);
      if (type === 'image' || type === 'pdf') {
        const blob = new Blob([bytes], { type: mime });
        setPreviewUrl(URL.createObjectURL(blob));
        setOutput(''); // Clear text output if it's a file
      } else if (type === 'binary') {
        setOutput('');
        setPreviewUrl(null);
      }
      
      setError(null);
    } catch (e: any) { 
      setError('Invalid Base64: ' + e.message); 
      setPreviewUrl(null);
    }
  };

  const decodeText = () => {
    setInput('');
    detectAndSetDecoded(decodeInput);
  };

  const handleFileUpload = (file: File) => {
    setFileInfo({ name: file.name, type: file.type, size: file.size });
    setOutput(''); 
    setPreviewUrl(null);
    
    if (file.type.startsWith('image/')) setDecodedType('image');
    else if (file.type === 'application/pdf') setDecodedType('pdf');
    else setDecodedType('binary');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      setInput(base64);
      setDecodeInput('');
      setOutput('');
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setPreviewUrl(result);
      } else {
        setPreviewUrl(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const encodeFile = () => {
    if (input && mode === 'file') {
      setOutput(input);
      setDecodeInput('');
      setPreviewUrl(null);
      setDecodedType('text');
      setError(null);
    }
  };

  const downloadDecodedFile = () => {
    try {
      const base64Content = decodeInput || output || input;
      if (!base64Content) return;

      const binaryString = atob(base64Content.trim());
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
      
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo?.name || (decodedType === 'pdf' ? 'document.pdf' : decodedType === 'image' ? 'image.png' : 'decoded_file');
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError('Failed to decode for download: ' + e.message);
    }
  };

  const clearAll = () => {
    setInput('');
    setDecodeInput('');
    setOutput('');
    setPreviewUrl(null);
    setFileInfo(null);
    setError(null);
    setDecodedType('text');
  };

  const clearInput = () => setInput('');
  const clearOutput = () => { setOutput(''); setPreviewUrl(null); setDecodedType('text'); };

  return {
    input, setInput, decodeInput, setDecodeInput, output, setOutput, mode, setMode,
    fileInfo, setFileInfo, error, setError,
    encodeText, decodeText, handleFileUpload, downloadDecodedFile,
    clearAll, clearInput, clearOutput,
    decodedType, previewUrl, encodeFile
  };
}
