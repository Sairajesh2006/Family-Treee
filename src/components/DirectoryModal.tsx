import React, { useState } from 'react';
import { X, Search, Users, User, MapPin } from 'lucide-react';
import { PersonNode } from '../types';
import { getCoupleThemeByMemberId } from '../utils/coupleColors';

interface DirectoryModalProps {
  isOpen: boolean;
  members: PersonNode[];
  onClose: () => void;
  onSelectMember: (member: PersonNode) => void;
}

export const DirectoryModal: React.FC<DirectoryModalProps> = ({
  isOpen,
  members,
  onClose,
  onSelectMember,
}) => {
  if (!isOpen) return null;

  const [search, setSearch] = useState('');
  const [generationFilter, setGenerationFilter] = useState<number | 'all'>('all');

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.relationToMe.toLowerCase().includes(search.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesGen = generationFilter === 'all' || m.generation === generationFilter;
    return matchesSearch && matchesGen;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-semibold text-white">
                Amrutapu Family Directory
              </h3>
              <p className="text-xs text-stone-300">
                {members.length} Family Members Recorded in Lineage
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

        {/* Filter Bar */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search family member by name or relation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setGenerationFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                generationFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              All ({members.length})
            </button>
            <button
              onClick={() => setGenerationFilter(1)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                generationFilter === 1
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Grandparents ({members.filter((m) => m.generation === 1).length})
            </button>
            <button
              onClick={() => setGenerationFilter(2)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                generationFilter === 2
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Parents ({members.filter((m) => m.generation === 2).length})
            </button>
            <button
              onClick={() => setGenerationFilter(3)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                generationFilter === 3
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Siblings & In-Laws ({members.filter((m) => m.generation === 3).length})
            </button>
            <button
              onClick={() => setGenerationFilter(4)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                generationFilter === 4
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Niece ({members.filter((m) => m.generation === 4).length})
            </button>
          </div>
        </div>

        {/* Members Grid / List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              No family members match your filter.
            </div>
          ) : (
            filteredMembers.map((m) => {
              const isMe = m.id === 'rajesh';
              const isFutureWife = m.id === 'sindhu_triveni';
              const coupleTheme = getCoupleThemeByMemberId(m.id);

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMember(m);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                    coupleTheme
                      ? `${coupleTheme.cardBorderClass} ${coupleTheme.accentBadgeBg}`
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-stone-500" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-stone-900 truncate">
                          {m.name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#FFE4E6] text-[#9F1239] border border-[#FDA4AF] rounded">
                            Me
                          </span>
                        )}
                        {isFutureWife && (
                          <span className="text-[10px] text-[#BE123C] font-semibold italic">
                            (Future Wife Placeholder)
                          </span>
                        )}
                        {coupleTheme && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${coupleTheme.accentBadgeBg} ${coupleTheme.accentBadgeText} ${coupleTheme.accentBadgeBorder}`}
                          >
                            {coupleTheme.colorName}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-500">
                        {m.labelOverride || m.relationToMe}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    title="Locate on Canvas"
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Locate</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
