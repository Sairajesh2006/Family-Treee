import React from 'react';
import { X, Edit3, User, Heart, ArrowRight } from 'lucide-react';
import { PersonNode, Relationship } from '../types';
import { getCoupleThemeByMemberId } from '../utils/coupleColors';

interface MemberDetailModalProps {
  member: PersonNode | null;
  isOpen: boolean;
  isOwner: boolean;
  relationships: Relationship[];
  allMembers: PersonNode[];
  onClose: () => void;
  onEditClick: (member: PersonNode) => void;
  onSelectMember: (member: PersonNode) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  isOpen,
  isOwner,
  relationships,
  allMembers,
  onClose,
  onEditClick,
  onSelectMember,
}) => {
  if (!isOpen || !member) return null;

  const isMe = member.id === 'rajesh';
  const isFutureWife = member.id === 'sindhu_triveni';

  // Find direct relationships
  const relatedLinks = relationships.filter(
    (r) => r.fromId === member.id || r.toId === member.id
  );

  const getOtherMember = (rel: Relationship) => {
    const otherId = rel.fromId === member.id ? rel.toId : rel.fromId;
    return allMembers.find((m) => m.id === otherId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="relative p-6 bg-stone-900 text-white flex items-center gap-4">
          <div className="w-18 h-18 rounded-xl border-2 border-stone-700 bg-stone-800 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-9 h-9 text-stone-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-serif font-semibold truncate leading-tight text-white">
                {member.name}
              </h3>
              {isMe && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFE4E6] text-[#9F1239] border border-[#FDA4AF] shrink-0">
                  Me
                </span>
              )}
              {(() => {
                const coupleTheme = getCoupleThemeByMemberId(member.id);
                if (!coupleTheme) return null;
                return (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${coupleTheme.accentBadgeBg} ${coupleTheme.accentBadgeText} ${coupleTheme.accentBadgeBorder} shrink-0`}
                  >
                    {coupleTheme.colorName} Couple
                  </span>
                );
              })()}
            </div>
            <p className="text-xs text-stone-300 mt-1">
              {member.labelOverride || member.relationToMe}
            </p>
            {isFutureWife && (
              <span className="inline-block text-[11px] text-rose-300 italic mt-0.5 font-medium">
                (Future Wife Placeholder — Not Married)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          {/* Bio / Notes */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
              Biography & Notes
            </h4>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed">
              {member.notes || 'No biographical notes recorded yet.'}
            </div>
          </div>

          {/* Connected Family Members */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Family Connections ({relatedLinks.length})
            </h4>
            <div className="space-y-1.5">
              {relatedLinks.map((rel) => {
                const other = getOtherMember(rel);
                if (!other) return null;
                return (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => {
                      onSelectMember(other);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-left text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                        {other.photoUrl ? (
                          <img src={other.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-stone-500" />
                        )}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-stone-900 block truncate">
                          {other.name}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          {other.labelOverride || other.relationToMe}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-stone-400 shrink-0 flex items-center gap-1">
                      {rel.symbol}
                      <ArrowRight className="w-3 h-3 text-stone-300" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            {isOwner ? 'Owner access active' : 'Public diagram viewer'}
          </span>

          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditClick(member);
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
