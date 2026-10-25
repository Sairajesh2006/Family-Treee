import React from 'react';
import { Lock, Unlock, Save, RotateCcw, BookOpen, Users, HelpCircle, Check, ShieldCheck, LogOut, Cloud, HardDrive } from 'lucide-react';
import { AuthSession } from '../types';

interface HeaderProps {
  authSession: AuthSession;
  isEditMode: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  memberCount?: number;
  storageStatus?: import('../services/api').StorageStatusResponse | null;
  onOpenStorageStatus?: () => void;
  onToggleEditMode: () => void;
  onSaveChanges: () => void;
  onResetLayout: () => void;
  onOpenAuthModal: () => void;
  onOpenDirectory: () => void;
  onOpenLegend: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  authSession,
  isEditMode,
  hasUnsavedChanges,
  isSaving,
  memberCount = 14,
  storageStatus,
  onOpenStorageStatus,
  onToggleEditMode,
  onSaveChanges,
  onResetLayout,
  onOpenAuthModal,
  onOpenDirectory,
  onOpenLegend,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#061A12] text-stone-100 shadow-md">
      {/* Primary Top Bar (Contract: Zone 1 Wordmark | Zone 2 Nav Links | Zone 3 Action) */}
      <div className="flex items-center justify-between gap-8 px-5 lg:px-8 py-3.5 border-b border-[#113826]">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#A9842C] flex items-center justify-center text-[#061A12] font-bold font-serif text-lg shadow-sm">
            A
          </div>
          <div>
            <span className="text-lg lg:text-xl font-serif font-semibold tracking-tight text-white whitespace-nowrap block leading-tight">
              Amrutapu Family
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-medium text-[#A7DFC0]">
          <button
            type="button"
            onClick={onOpenDirectory}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Users className="w-3.5 h-3.5 text-[#52B788]" />
            <span>Family Directory ({memberCount})</span>
          </button>

          <button
            type="button"
            onClick={onOpenLegend}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#52B788]" />
            <span>Relationship Symbols</span>
          </button>

          <button
            type="button"
            onClick={onOpenStorageStatus}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
              storageStatus?.isConfigured
                ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300 hover:border-emerald-400'
                : 'bg-amber-950/50 border-amber-500/30 text-amber-300 hover:border-amber-400'
            }`}
            title="Check Vercel & Supabase Storage Configuration"
          >
            {storageStatus?.isConfigured ? (
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{storageStatus?.isConfigured ? 'Supabase Online' : 'Storage: Dev Mode'}</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Owner Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {authSession.isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Unsaved indicator & Save button */}
              {isEditMode && (
                <>
                  <button
                    type="button"
                    onClick={onResetLayout}
                    title="Reset to original canonical diagram positions"
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Layout</span>
                  </button>

                  <button
                    type="button"
                    onClick={onSaveChanges}
                    disabled={isSaving || !hasUnsavedChanges}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                      hasUnsavedChanges
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-400/30'
                        : 'bg-stone-800 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
                  </button>
                </>
              )}

              {/* Edit Mode Toggle */}
              <button
                type="button"
                onClick={onToggleEditMode}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isEditMode
                    ? 'bg-amber-400 text-stone-950 font-semibold'
                    : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                }`}
              >
                {isEditMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isEditMode ? 'Editing Mode Active' : 'Enable Edit Mode'}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                title="Log out of owner account"
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-950 bg-stone-100 hover:bg-white rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-stone-700" />
              <span>Owner Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Operational Utility Ribbon */}
      <div className="bg-[#03110C] px-5 lg:px-8 py-1.5 flex flex-wrap items-center justify-between text-xs text-stone-300 border-b border-[#0C2419] gap-3">
        {/* Creator Credit (Mandatory requirement: "Created by Amrutapu Sai Rajesh") */}
        <div className="flex items-center gap-2">
          <span className="text-[#F3C969] font-medium font-serif">
            Created by Amrutapu Sai Rajesh
          </span>
          <span className="text-[#194D36] hidden sm:inline">·</span>
          <span className="hidden sm:inline text-[#A7DFC0]">
            Official Family Lineage & Heritage Diagram
          </span>
        </div>

        {/* Status / Quick instructions */}
        <div className="flex items-center gap-3 text-[11px]">
          {authSession.isAuthenticated ? (
            <span className="flex items-center gap-1 text-[#52B788] font-medium">
              <ShieldCheck className="w-3 h-3 text-[#52B788]" />
              <span>Owner Authenticated ({authSession.userEmail})</span>
            </span>
          ) : (
            <span className="text-[#74C69D]">
              Visitor Mode (Read-Only)
            </span>
          )}
          <span className="text-[#194D36] hidden sm:inline">|</span>
          <span className="hidden md:inline text-[#A7DFC0]">
            Pinch or scroll to zoom · Drag canvas to pan
          </span>
        </div>
      </div>
    </header>
  );
};
