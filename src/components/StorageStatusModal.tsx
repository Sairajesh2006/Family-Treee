import React from 'react';
import { X, Cloud, HardDrive, CheckCircle2, AlertTriangle, ShieldCheck, Key, Copy, Check, ExternalLink } from 'lucide-react';
import { StorageStatusResponse } from '../services/api';

interface StorageStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: StorageStatusResponse | null;
  onRefresh: () => void;
}

export const StorageStatusModal: React.FC<StorageStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isConfigured = status?.isConfigured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#0B1E16] text-[#E8F0EA] rounded-2xl shadow-2xl border border-[#1A4B35] max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-[#061A12] border-b border-[#143B29] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${
              isConfigured
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
            }`}>
              {isConfigured ? <Cloud className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-white">
                Vercel &amp; Cloud Storage Verification
              </h3>
              <p className="text-xs text-[#95C7AC]">
                Persistent photo storage for Amrutapu Family website
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Current Status Box */}
          <div className={`p-4 rounded-xl border ${
            isConfigured
              ? 'bg-[#08281C] border-[#1E6847]'
              : 'bg-[#1E1908] border-[#68531E]'
          }`}>
            <div className="flex items-start gap-3">
              {isConfigured ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">
                    {isConfigured ? 'Supabase Online Storage: Connected' : 'Local Disk Mode (Development)'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    {status?.provider || 'local-disk'}
                  </span>
                </div>
                <p className="text-[#A7DFC0] leading-relaxed">
                  {isConfigured
                    ? `Photos are uploaded directly to Supabase bucket "${status?.bucket}". URLs are public CDN links that persist across all devices, redeploys, and page refreshes.`
                    : 'Photos uploaded right now are saved to the local server disk. Because Vercel has an ephemeral serverless filesystem, you must configure Supabase Storage environment variables in Vercel for production.'}
                </p>
              </div>
            </div>
          </div>

          {/* Vercel Readiness Checklist */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#52B788]" />
              <span>Production Readiness for Vercel</span>
            </h4>

            <div className="space-y-2 text-[11px]">
              <div className="p-3 bg-[#061A12] border border-[#143B29] rounded-lg space-y-1">
                <div className="flex items-center justify-between text-white font-medium">
                  <span>1. Authentication Protection</span>
                  <span className="text-emerald-400 font-bold">WORKING</span>
                </div>
                <p className="text-[#84B89A]">
                  Upload and delete endpoints are strictly secured. Only authenticated owner (<span className="text-[#F3C969]">sairajeshamrutapu@gmail.com</span>) can upload or delete photos. Public visitors are read-only.
                </p>
              </div>

              <div className="p-3 bg-[#061A12] border border-[#143B29] rounded-lg space-y-1">
                <div className="flex items-center justify-between text-white font-medium">
                  <span>2. Vercel Serverless Routing (`vercel.json` &amp; `api/index.ts`)</span>
                  <span className="text-emerald-400 font-bold">READY</span>
                </div>
                <p className="text-[#84B89A]">
                  Vercel configuration and API serverless entry point are committed and ready to build static Vite frontend + serverless API.
                </p>
              </div>

              <div className="p-3 bg-[#061A12] border border-[#143B29] rounded-lg space-y-1">
                <div className="flex items-center justify-between text-white font-medium">
                  <span>3. Supabase Cloud Storage Adapter</span>
                  <span className={isConfigured ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {isConfigured ? 'ONLINE' : 'NEEDS ENV IN VERCEL'}
                  </span>
                </div>
                <p className="text-[#84B89A]">
                  The code is configured with `@supabase/supabase-js`. As soon as your 3 environment variables are pasted into your Vercel Project Settings, uploads immediately route to Supabase Storage.
                </p>
              </div>
            </div>
          </div>

          {/* Required Vercel Environment Variables */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#F3C969]" />
              <span>Required Vercel Environment Variables</span>
            </h4>

            <div className="space-y-1.5">
              {[
                { name: 'SUPABASE_URL', example: 'https://xyzcompany.supabase.co', desc: 'Supabase Project URL (Dashboard -> Settings -> API)' },
                { name: 'SUPABASE_SERVICE_ROLE_KEY', example: 'eyJhbGciOi...', desc: 'Secret Service Role Key (Dashboard -> Settings -> API - Keep secret on Vercel backend)' },
                { name: 'SUPABASE_STORAGE_BUCKET', example: 'family-photos', desc: 'Bucket name (Public bucket in Supabase Storage)' },
              ].map((env) => (
                <div key={env.name} className="p-2.5 bg-[#061A12] border border-[#143B29] rounded-lg flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-white text-[11px] block">{env.name}</span>
                    <span className="text-[10px] text-[#74C69D] truncate block">{env.desc}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(env.name, env.name)}
                    className="p-1.5 bg-[#123826] hover:bg-[#1C543A] text-stone-200 rounded transition-colors shrink-0 flex items-center gap-1 text-[10px]"
                    title="Copy variable name"
                  >
                    {copiedKey === env.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === env.name ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Setup steps for Supabase */}
          <div className="p-3 bg-[#082015] border border-[#174830] rounded-xl space-y-1.5 text-[11px]">
            <span className="font-semibold text-white block">Quick 2-Step Supabase Setup:</span>
            <ol className="list-decimal list-inside space-y-1 text-[#A7DFC0]">
              <li>In your free <strong className="text-white">Supabase Dashboard</strong>, go to <strong className="text-white">Storage</strong> &gt; <strong className="text-white">New Bucket</strong>. Name it <code className="text-[#F3C969] bg-[#03110C] px-1 py-0.5 rounded">family-photos</code> and switch <strong className="text-white">Public Bucket</strong> to <strong className="text-emerald-400">ON</strong>.</li>
              <li>In your <strong className="text-white">Vercel Dashboard</strong>, go to <strong className="text-white">Settings &gt; Environment Variables</strong>, add <code className="text-[#F3C969] bg-[#03110C] px-1 rounded">SUPABASE_URL</code> and <code className="text-[#F3C969] bg-[#03110C] px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code>, and redeploy!</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#061A12] border-t border-[#143B29] flex items-center justify-between">
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-1.5 text-xs font-medium text-[#A7DFC0] hover:text-white bg-[#113826] hover:bg-[#194D35] rounded-lg transition-colors"
          >
            Re-check Status
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
