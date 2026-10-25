import React from 'react';
import { X, Heart, ArrowDown, GitFork, Sparkles, BookOpen } from 'lucide-react';

interface LegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegendModal: React.FC<LegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-white">
                Diagram Relationship Symbols Guide
              </h3>
              <p className="text-xs text-stone-300">
                Faithful to Amrutapu Sai Rajesh's original reference drawing
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Symbol 1: <=> */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-4">
            <div className="px-3 py-1.5 bg-white border border-stone-400 rounded-lg font-bold font-mono text-sm text-stone-900 shadow-xs shrink-0">
              &lt;=&gt;
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-stone-900">
                Husband & Wife (Spouses)
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Represents a marital union between two partners.
              </p>
              <ul className="text-[11px] text-stone-500 list-disc list-inside space-y-0.5 pt-1">
                <li>Srinivasa Rao &lt;=&gt; Pushpa Latha (Father &lt;=&gt; Mother)</li>
                <li>Narasayya &lt;=&gt; Koteswaramma (Paternal Grandparents)</li>
                <li>Sitaramayya &lt;=&gt; Venkayamma (Maternal Grandparents)</li>
                <li>Pradeep &lt;=&gt; Aswini Priya</li>
                <li>Madhu Sudhan &lt;=&gt; Venkata Lakshmi (Parents of Sindhu Triveni)</li>
              </ul>
            </div>
          </div>

          {/* Symbol 2: <-> */}
          <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-200 flex items-start gap-4">
            <div className="px-3 py-1.5 bg-white border border-sky-400 rounded-lg font-bold font-mono text-sm text-sky-800 shadow-xs shrink-0">
              &lt;-&gt;
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-sky-950">
                Siblings
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Connects brothers and sisters belonging to the same immediate lineage.
              </p>
              <ul className="text-[11px] text-stone-500 list-disc list-inside space-y-0.5 pt-1">
                <li>Aswini Priya &lt;-&gt; Amrutapu Sai Rajesh</li>
                <li>Sindhu Triveni &lt;-&gt; Vamsi</li>
              </ul>
            </div>
          </div>

          {/* Symbol 3: -> Arrow */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-4">
            <div className="px-3 py-1.5 bg-white border border-stone-400 rounded-lg font-bold font-mono text-sm text-stone-900 shadow-xs shrink-0 flex items-center gap-1">
              <span>──&gt;</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-stone-900">
                Parent to Child (Lineage Arrow)
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Downward directional lines showing generation descent and biological / parental lineage.
              </p>
              <ul className="text-[11px] text-stone-500 list-disc list-inside space-y-0.5 pt-1">
                <li>Srinivasa Rao &amp; Pushpa Latha ──&gt; Sai Rajesh &amp; Aswini Priya</li>
                <li>Pradeep &amp; Aswini Priya ──&gt; Darshika (Niece)</li>
                <li>Madhu Sudhan &amp; Venkata Lakshmi ──&gt; Sindhu Triveni</li>
                <li>Grandparents ──&gt; Parents</li>
              </ul>
            </div>
          </div>

          {/* Couple Shared Color Coding Guide */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332]" />
              <h4 className="text-sm font-semibold text-emerald-950">
                Husband &amp; Wife Couple Shared Colour Coding
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Each husband-and-wife couple shares one unique color across their box borders, couple-connecting line, and &lt;=&gt; relationship symbol. Siblings are not assigned colors based on sibling relationships.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-medium">
              <div className="p-2.5 bg-white rounded-lg border border-[#E5C365] flex items-center justify-between shadow-xs">
                <span className="text-stone-800">1. Narasayya &amp; Koteswaramma</span>
                <span className="px-2 py-0.5 rounded bg-[#FFF9E6] text-[#8A6714] border border-[#F0D58C] text-[11px] font-bold">
                  Gold
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#38B000] flex items-center justify-between shadow-xs">
                <span className="text-stone-800">2. Sitaramayya &amp; Venkayamma</span>
                <span className="px-2 py-0.5 rounded bg-[#E8F8F0] text-[#1B4332] border border-[#95D5B2] text-[11px] font-bold">
                  Emerald Green
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#3B82F6] flex items-center justify-between shadow-xs">
                <span className="text-stone-800">3. Srinivasa Rao &amp; Pushpa Latha</span>
                <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1E40AF] border border-[#93C5FD] text-[11px] font-bold">
                  Blue
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#A855F7] flex items-center justify-between shadow-xs">
                <span className="text-stone-800">4. Pradeep &amp; Aswini Priya</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF5FF] text-[#6B21A8] border border-[#D8B4FE] text-[11px] font-bold">
                  Purple
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#EA580C] flex items-center justify-between shadow-xs">
                <span className="text-stone-800">5. Madhu Sudhan &amp; Venkata Lakshmi</span>
                <span className="px-2 py-0.5 rounded bg-[#FFF4ED] text-[#9A3412] border border-[#FED7AA] text-[11px] font-bold">
                  Amber
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-[#FF6B6B] flex items-center justify-between shadow-xs">
                <span className="text-stone-800">6. Amrutapu Sai Rajesh &amp; Sindhu Triveni (Future-Wife Placeholder)</span>
                <span className="px-2 py-0.5 rounded bg-[#FFF1F2] text-[#9F1239] border border-[#FDA4AF] text-[11px] font-bold">
                  Coral
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-950 bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
