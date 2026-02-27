import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { normalizeCourses } from '../courseValidation';

interface VoidDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onCoursesUpdate: (courses: Course[]) => void;
}

const VOID_API_BASE = 'https://kvapi.zc13501500964.workers.dev';
const VOID_KEY_STORAGE = 'zcanic_void_key';

const VoidDropModal: React.FC<VoidDropModalProps> = ({ isOpen, onClose, courses, onCoursesUpdate }) => {
  const [voidKey, setVoidKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'downloading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showWarning, setShowWarning] = useState(true);

  // Load saved void key on mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(VOID_KEY_STORAGE);
      if (savedKey) {
        setVoidKey(savedKey);
        setShowWarning(false);
      }
    } catch (e) {
      console.warn('Unable to read Void key from local storage.');
    }
  }, []);

  const handleUpload = async () => {
    if (voidKey.length < 3) {
      setStatus('error');
      setMessage('暗号长度必须 ≥ 3 位');
      return;
    }

    setStatus('uploading');
    setMessage('正在向虚空广播...');

    try {
      const response = await fetch(`${VOID_API_BASE}/${voidKey}`, {
        method: 'POST',
        body: JSON.stringify(courses),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setStatus('success');
        setMessage(`✅ 已成功广播到频段 [${voidKey}]`);
        try {
          localStorage.setItem(VOID_KEY_STORAGE, voidKey);
        } catch (e) {
          console.warn('Unable to store Void key locally.');
        }
        setShowWarning(false);
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      setStatus('error');
      setMessage('❌ 虚空连接失败，请检查网络');
    }
  };

  const handleDownload = async () => {
    if (voidKey.length < 3) {
      setStatus('error');
      setMessage('暗号长度必须 ≥ 3 位');
      return;
    }

    setStatus('downloading');
    setMessage('正在从虚空读取...');

    try {
      const response = await fetch(`${VOID_API_BASE}/${voidKey}`);

      if (response.ok) {
        const text = await response.text();

        if (!text || text === 'null') {
          setStatus('error');
          setMessage(`❌ 频段 [${voidKey}] 无信号，请先上传数据`);
          return;
        }

        const parsed: unknown = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error('数据格式错误');
        }

        const data = normalizeCourses(parsed);
        if (parsed.length > 0 && data.length === 0) {
          throw new Error('数据格式错误');
        }

        onCoursesUpdate(data);
        setStatus('success');
        setMessage(`✅ 已从频段 [${voidKey}] 接收 ${data.length} 条数据`);
        try {
          localStorage.setItem(VOID_KEY_STORAGE, voidKey);
        } catch (e) {
          console.warn('Unable to store Void key locally.');
        }
        setShowWarning(false);
      } else {
        throw new Error('下载失败');
      }
    } catch (error) {
      setStatus('error');
      setMessage('❌ 虚空解析失败，数据可能损坏');
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-gentle" onClick={onClose}>
      <div className="bg-white max-w-[360px] w-full rounded-[32px] shadow-2xl relative flex flex-col p-6 max-h-[85vh] overflow-y-auto hide-scrollbar" onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors z-20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Simplified Header */}
        <div className="text-center mt-2 mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
                <span className="text-2xl">🌌</span>
                虚空投送
            </h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Void Drop Protocol</p>
        </div>

        <div className="flex flex-col gap-5">
            {/* Input */}
            <div>
               <label className="block text-center text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                 虚空暗号 (Void Key)
               </label>
               <input
                type="text"
                value={voidKey}
                onChange={(e) => {
                  setVoidKey(e.target.value);
                  resetStatus();
                }}
                className="w-full text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-200"
                placeholder="123456"
               />
            </div>

            {/* Status Message Area */}
            {message && (
                <div className={`p-4 rounded-2xl flex items-start gap-3 transition-all ${
                  status === 'success' ? 'bg-[#ECFDF5]' : 
                  status === 'error' ? 'bg-red-50' :
                  'bg-blue-50'
                }`}>
                    {/* Icon Box */}
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                         status === 'success' ? 'bg-emerald-500 text-white' : 
                         status === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                        {status === 'success' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        {status === 'error' && <span className="font-bold text-xs">✕</span>}
                        {(status === 'uploading' || status === 'downloading') && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>}
                    </div>
                    
                    <div className={`text-sm font-bold leading-tight break-all ${
                        status === 'success' ? 'text-emerald-800' :
                        status === 'error' ? 'text-red-700' :
                        'text-blue-700'
                    }`}>
                        {message.replace(/✅|❌|📡|📥/g, '').trim()}
                    </div>
                </div>
            )}

            {/* Actions Stack */}
            <div className="flex flex-col gap-3">
               <button
                 onClick={handleUpload}
                 disabled={status === 'uploading' || status === 'downloading'}
                 className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-slate-200 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
               >
                  <span className="text-lg group-hover:-translate-y-1 transition-transform duration-300">📡</span>
                  <span>上传到虚空</span>
               </button>
               
               <button
                 onClick={handleDownload}
                 disabled={status === 'uploading' || status === 'downloading'}
                 className="w-full bg-slate-100 text-slate-600 border border-slate-200 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
               >
                  <span className="text-lg group-hover:-translate-y-1 transition-transform duration-300">📥</span>
                  <span>从虚空读取</span>
               </button>
            </div>

             {/* Info */}
             <div className="bg-slate-50 rounded-2xl p-5 text-[11px] text-slate-400 leading-relaxed font-medium">
                <div className="flex items-center gap-2 mb-2 text-slate-600 font-bold">
                    <span>💡</span>
                    <span>工作原理</span>
                </div>
                <div className="space-y-1.5 pl-1">
                    <p>• <strong>上传</strong>：将当前课表覆盖写入云端暗号频段</p>
                    <p>• <strong>下载</strong>：从云端读取数据并覆盖本地课表</p>
                    <p className="mt-2 text-[10px] text-slate-300">⚡ 本地优先 (Local-First)，云端仅作临时传输</p>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default VoidDropModal;
