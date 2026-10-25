/**
 * Couple Color Coding Mapping for Amrutapu Family Tree:
 * Each husband-and-wife couple has one unique shared color.
 * Both partners in a couple have the same color accents,
 * while different couples have different colors.
 *
 * Exact Mappings:
 * 1. Narasayya and Koteswaramma — Gold
 * 2. Sitaramayya and Venkayamma — Emerald Green
 * 3. Srinivasa Rao and Pushpa Latha — Blue
 * 4. Pradeep and Aswini Priya — Purple
 * 5. Amrutapu Sai Rajesh and Sindhu Triveni — Coral (Future-wife placeholder, not a current marriage)
 */

export interface CoupleTheme {
  id: string;
  name: string;
  colorName: string;
  memberIds: string[];
  // SVG Line & Badge Colors
  lineStroke: string;
  badgeFill: string;
  badgeStroke: string;
  badgeText: string;
  // Card Box Styling
  cardBorderClass: string;
  cardRingClass: string;
  cardShadowClass: string;
  photoBorderClass: string;
  photoBgClass: string;
  photoIconColorClass: string;
  accentBadgeBg: string;
  accentBadgeText: string;
  accentBadgeBorder: string;
  isFuturePlaceholder?: boolean;
}

export const COUPLE_THEMES: Record<string, CoupleTheme> = {
  paternal_grandparents: {
    id: 'paternal_grandparents',
    name: 'Narasayya & Koteswaramma',
    colorName: 'Gold',
    memberIds: ['paternal_grandfather', 'paternal_grandmother'],
    lineStroke: '#F3C969',
    badgeFill: '#1A1405',
    badgeStroke: '#F3C969',
    badgeText: '#FFF6DB',
    cardBorderClass: 'border-[#E5C365] hover:border-[#F3C969]',
    cardRingClass: 'ring-1.5 ring-[#F3C969]/50',
    cardShadowClass: 'shadow-[0_8px_24px_rgba(229,195,101,0.22)]',
    photoBorderClass: 'border-[#E5C365]/80',
    photoBgClass: 'bg-[#FFFDF7]',
    photoIconColorClass: 'text-[#B89335]',
    accentBadgeBg: 'bg-[#FFF9E6]',
    accentBadgeText: 'text-[#8A6714]',
    accentBadgeBorder: 'border-[#F0D58C]',
  },
  maternal_grandparents: {
    id: 'maternal_grandparents',
    name: 'Sitaramayya & Venkayamma',
    colorName: 'Emerald Green',
    memberIds: ['maternal_grandfather', 'maternal_grandmother'],
    lineStroke: '#52B788',
    badgeFill: '#062015',
    badgeStroke: '#52B788',
    badgeText: '#D8F3DC',
    cardBorderClass: 'border-[#38B000] hover:border-[#52B788]',
    cardRingClass: 'ring-1.5 ring-[#52B788]/50',
    cardShadowClass: 'shadow-[0_8px_24px_rgba(82,183,136,0.22)]',
    photoBorderClass: 'border-[#52B788]/80',
    photoBgClass: 'bg-[#F2FBF6]',
    photoIconColorClass: 'text-[#2D6A4F]',
    accentBadgeBg: 'bg-[#E8F8F0]',
    accentBadgeText: 'text-[#1B4332]',
    accentBadgeBorder: 'border-[#95D5B2]',
  },
  parents: {
    id: 'parents',
    name: 'Srinivasa Rao & Pushpa Latha',
    colorName: 'Blue',
    memberIds: ['father', 'mother'],
    lineStroke: '#60A5FA',
    badgeFill: '#08182B',
    badgeStroke: '#60A5FA',
    badgeText: '#DBEAFE',
    cardBorderClass: 'border-[#3B82F6] hover:border-[#60A5FA]',
    cardRingClass: 'ring-1.5 ring-[#60A5FA]/50',
    cardShadowClass: 'shadow-[0_8px_24px_rgba(59,130,246,0.25)]',
    photoBorderClass: 'border-[#60A5FA]/80',
    photoBgClass: 'bg-[#F0F7FF]',
    photoIconColorClass: 'text-[#2563EB]',
    accentBadgeBg: 'bg-[#EFF6FF]',
    accentBadgeText: 'text-[#1E40AF]',
    accentBadgeBorder: 'border-[#93C5FD]',
  },
  sister_marriage: {
    id: 'sister_marriage',
    name: 'Pradeep & Aswini Priya',
    colorName: 'Purple',
    memberIds: ['pradeep', 'aswini_priya'],
    lineStroke: '#C084FC',
    badgeFill: '#1A0D26',
    badgeStroke: '#C084FC',
    badgeText: '#F3E8FF',
    cardBorderClass: 'border-[#A855F7] hover:border-[#C084FC]',
    cardRingClass: 'ring-1.5 ring-[#C084FC]/50',
    cardShadowClass: 'shadow-[0_8px_24px_rgba(168,85,247,0.25)]',
    photoBorderClass: 'border-[#C084FC]/80',
    photoBgClass: 'bg-[#FAF5FF]',
    photoIconColorClass: 'text-[#9333EA]',
    accentBadgeBg: 'bg-[#FAF5FF]',
    accentBadgeText: 'text-[#6B21A8]',
    accentBadgeBorder: 'border-[#D8B4FE]',
  },
  rajesh_future: {
    id: 'rajesh_future',
    name: 'Amrutapu Sai Rajesh & Sindhu Triveni',
    colorName: 'Coral',
    memberIds: ['rajesh', 'sindhu_triveni'],
    lineStroke: '#FB7185',
    badgeFill: '#240C13',
    badgeStroke: '#FB7185',
    badgeText: '#FFE4E6',
    cardBorderClass: 'border-[#FF6B6B] hover:border-[#FB7185]',
    cardRingClass: 'ring-1.5 ring-[#FB7185]/60',
    cardShadowClass: 'shadow-[0_8px_28px_rgba(255,107,107,0.28)]',
    photoBorderClass: 'border-[#FB7185]/80',
    photoBgClass: 'bg-[#FFF5F5]',
    photoIconColorClass: 'text-[#E11D48]',
    accentBadgeBg: 'bg-[#FFF1F2]',
    accentBadgeText: 'text-[#9F1239]',
    accentBadgeBorder: 'border-[#FDA4AF]',
    isFuturePlaceholder: true,
  },
  sindhu_parents: {
    id: 'sindhu_parents',
    name: 'Madhu Sudhan & Venkata Lakshmi',
    colorName: 'Amber',
    memberIds: ['sindhu_father', 'sindhu_mother'],
    lineStroke: '#FB923C',
    badgeFill: '#231206',
    badgeStroke: '#FB923C',
    badgeText: '#FFEDD5',
    cardBorderClass: 'border-[#EA580C] hover:border-[#FB923C]',
    cardRingClass: 'ring-1.5 ring-[#FB923C]/50',
    cardShadowClass: 'shadow-[0_8px_24px_rgba(249,115,22,0.25)]',
    photoBorderClass: 'border-[#FB923C]/80',
    photoBgClass: 'bg-[#FFF9F5]',
    photoIconColorClass: 'text-[#C2410C]',
    accentBadgeBg: 'bg-[#FFF4ED]',
    accentBadgeText: 'text-[#9A3412]',
    accentBadgeBorder: 'border-[#FED7AA]',
  },
};

/**
 * Get couple theme by member ID
 */
export function getCoupleThemeByMemberId(memberId: string): CoupleTheme | null {
  for (const theme of Object.values(COUPLE_THEMES)) {
    if (theme.memberIds.includes(memberId)) {
      return theme;
    }
  }
  return null;
}

/**
 * Get couple theme by relationship ID or by pair of member IDs
 */
export function getCoupleThemeByRelationship(
  relId: string,
  fromId: string,
  toId: string
): CoupleTheme | null {
  if (relId === 'rel_paternal_grandparents' || (fromId === 'paternal_grandfather' && toId === 'paternal_grandmother')) {
    return COUPLE_THEMES.paternal_grandparents;
  }
  if (relId === 'rel_maternal_grandparents' || (fromId === 'maternal_grandfather' && toId === 'maternal_grandmother')) {
    return COUPLE_THEMES.maternal_grandparents;
  }
  if (relId === 'rel_parents' || (fromId === 'father' && toId === 'mother')) {
    return COUPLE_THEMES.parents;
  }
  if (relId === 'rel_sister_marriage' || (fromId === 'pradeep' && toId === 'aswini_priya')) {
    return COUPLE_THEMES.sister_marriage;
  }
  if (relId === 'rel_future_wife' || (fromId === 'rajesh' && toId === 'sindhu_triveni')) {
    return COUPLE_THEMES.rajesh_future;
  }
  if (
    relId === 'rel_sindhu_parents' ||
    (fromId === 'sindhu_father' && toId === 'sindhu_mother') ||
    (fromId === 'sindhu_mother' && toId === 'sindhu_father')
  ) {
    return COUPLE_THEMES.sindhu_parents;
  }
  return null;
}
