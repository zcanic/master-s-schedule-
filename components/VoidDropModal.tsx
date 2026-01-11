import React, { useState, useEffect } from 'react';
import { Course } from '../types';

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
    const savedKey = localStorage.getItem(VOID_KEY_STORAGE);
    if (savedKey) {
      setVoidKey(savedKey);
      setShowWarning(false);
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
        localStorage.setItem(VOID_KEY_STORAGE, voidKey);
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

        const data = JSON.parse(text);

        if (Array.isArray(data) && data.length > 0) {
          onCoursesUpdate(data);
          setStatus('success');
          setMessage(`✅ 已从频段 [${voidKey}] 接收数据`);
          localStorage.setItem(VOID_KEY_STORAGE, voidKey);
          setShowWarning(false);
        } else {
          throw new Error('数据格式错误');
        }
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in-gentle" onClick={onClose}>
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl relative border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_50%)]"></div>
          <h2 className="text-2xl font-black text-white relative z-10 flex items-center gap-3">
            <span className="text-3xl">🌌</span>
            虚空投送
          </h2>
          <p className="text-xs text-slate-300 mt-1 relative z-10">Void Drop Protocol — 零门槛数据广播站</p>
        </div>

        {/* Warning Zone */}
        {showWarning && (
          <div className="mx-6 mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 relative">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div className="flex-1">
                <h3 className="text-sm font-black text-red-700 mb-1">DANGER ZONE — 公共频段警告</h3>
                <p className="text-xs text-red-600 leading-relaxed mb-2">
                  这是一个完全开放的虚空频段。使用简单暗号（如 <code className="bg-red-100 px-1 py-0.5 rounded font-mono">123</code>）会导致数据被他人覆盖。
                </p>
                <p className="text-xs text-red-600 leading-relaxed font-bold">
                  请使用高熵值暗号（如 <code className="bg-red-100 px-1 py-0.5 rounded font-mono">correct-horse-battery-2026</code>）作为隐形密码。数据安全责任自负。
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Section */}
        <div className="px-6 py-6">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            虚空暗号 (Void Key)
          </label>
          <input
            type="text"
            value={voidKey}
            onChange={(e) => {
              setVoidKey(e.target.value);
              resetStatus();
            }}
            placeholder="输入你的暗号（≥3位）"
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 outline-none text-sm font-bold transition-all"
          />

          {/* Status Message */}
          {message && (
            <div className={`mt-3 px-4 py-2 rounded-lg text-xs font-bold ${
              status === 'success' ? 'bg-green-50 text-green-700' :
              status === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleUpload}
            disabled={status === 'uploading' || status === 'downloading'}
            className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {status === 'uploading' ? '广播中...' : '📡 上传到虚空'}
          </button>
          <button
            onClick={handleDownload}
            disabled={status === 'uploading' || status === 'downloading'}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-sm uppercase tracking-wide hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {status === 'downloading' ? '接收中...' : '📥 从虚空读取'}
          </button>
        </div>

        {/* Info Footer */}
        <div className="px-6 pb-6 pt-0">
          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
            <p className="font-bold mb-2">💡 工作原理</p>
            <p className="mb-1">• <strong>上传</strong>: 将当前课表覆盖写入云端暗号频段</p>
            <p className="mb-1">• <strong>下载</strong>: 从云端读取数据并覆盖本地课表</p>
            <p className="text-[10px] text-slate-400 mt-2">⚡ 本地优先 (Local-First)，云端仅作临时传输</p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white font-black transition-all z-20"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default VoidDropModal;
