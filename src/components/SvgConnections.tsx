import React from 'react';
import { PersonNode, Relationship } from '../types';
import { getCoupleThemeByRelationship } from '../utils/coupleColors';

interface SvgConnectionsProps {
  members: PersonNode[];
  relationships: Relationship[];
}

export const SvgConnections: React.FC<SvgConnectionsProps> = ({ members, relationships }) => {
  // Map members by id for instant lookup
  const memberMap = React.useMemo(() => {
    const map = new Map<string, PersonNode>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  // Helper to get center and edge anchor coordinates
  const getBoxBounds = (id: string) => {
    const box = memberMap.get(id);
    if (!box) return null;
    return {
      left: box.x,
      right: box.x + box.width,
      top: box.y,
      bottom: box.y + box.height,
      cx: box.x + box.width / 2,
      cy: box.y + box.height / 2,
      width: box.width,
      height: box.height,
    };
  };

  return (
    <svg className="absolute inset-0 pointer-events-none w-[2200px] h-[1400px]">
      <defs>
        {/* Standard Parent-to-Child Arrow Marker (Crisp Emerald Mint on Dark Canvas) */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 10 4, 0 8" fill="#B7E4C7" />
        </marker>

        {/* Future Wife Prospective Arrow Marker */}
        <marker
          id="arrowhead-future"
          markerWidth="10"
          markerHeight="8"
          refX="9"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 10 4, 0 8" fill="#FB7185" />
        </marker>

        {/* Shadow for relationship symbol badges */}
        <filter id="badge-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Render Dynamic Connecting Lines */}
      {relationships.map((rel) => {
        const from = getBoxBounds(rel.fromId);
        const to = getBoxBounds(rel.toId);
        if (!from || !to) return null;

        // 1. Spouse Relationship: <=> (Unique shared color per couple)
        if (rel.type === 'spouse') {
          // Horizontal connection between facing edges
          const isFromLeftOfTo = from.cx < to.cx;
          const x1 = isFromLeftOfTo ? from.right : from.left;
          const y1 = from.cy;
          const x2 = isFromLeftOfTo ? to.left : to.right;
          const y2 = to.cy;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          const coupleTheme = getCoupleThemeByRelationship(rel.id, rel.fromId, rel.toId);
          const strokeColor = coupleTheme ? coupleTheme.lineStroke : '#F3C969';
          const badgeFill = coupleTheme ? coupleTheme.badgeFill : '#0A2419';
          const badgeStroke = coupleTheme ? coupleTheme.badgeStroke : '#F3C969';
          const badgeTextColor = coupleTheme ? coupleTheme.badgeText : '#FFF6DB';

          return (
            <g key={rel.id} className="transition-all duration-75">
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strokeColor}
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Badge: <=> (Shared Couple Color on Dark Background) */}
              <g transform={`translate(${midX}, ${midY})`} className="pointer-events-auto cursor-help">
                <rect
                  x="-24"
                  y="-11"
                  width="48"
                  height="22"
                  rx="6"
                  fill={badgeFill}
                  stroke={badgeStroke}
                  strokeWidth="1.6"
                  filter="url(#badge-shadow)"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill={badgeTextColor}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  &lt;=&gt;
                </text>
                <title>
                  {coupleTheme
                    ? `${coupleTheme.name} (${coupleTheme.colorName} Couple)`
                    : `Husband & Wife (${rel.label || 'Spouse'})`}
                </title>
              </g>
            </g>
          );
        }

        // 2. Sibling Relationship: <-> (Neutral sibling indicator, NOT couple-colored)
        if (rel.type === 'sibling') {
          const isFromLeftOfTo = from.cx < to.cx;
          const x1 = isFromLeftOfTo ? from.right : from.left;
          const y1 = from.cy;
          const x2 = isFromLeftOfTo ? to.left : to.right;
          const y2 = to.cy;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          return (
            <g key={rel.id} className="transition-all duration-75">
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#86C3A0"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {/* Badge: <-> (Neutral Sibling Line - Not based on couple color) */}
              <g transform={`translate(${midX}, ${midY})`} className="pointer-events-auto cursor-help">
                <rect
                  x="-22"
                  y="-11"
                  width="44"
                  height="22"
                  rx="6"
                  fill="#0B2319"
                  stroke="#86C3A0"
                  strokeWidth="1.4"
                  filter="url(#badge-shadow)"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#E0F2E9"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  &lt;-&gt;
                </text>
                <title>Siblings</title>
              </g>
            </g>
          );
        }

        // 3. Future Wife Placeholder: <...> (Coral Couple shared color, strictly labelled placeholder)
        if (rel.type === 'future-spouse') {
          const isFromLeftOfTo = from.cx < to.cx;
          const x1 = isFromLeftOfTo ? from.right : from.left;
          const y1 = from.cy;
          const x2 = isFromLeftOfTo ? to.left : to.right;
          const y2 = to.cy;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          return (
            <g key={rel.id} className="transition-all duration-75">
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FB7185"
                strokeWidth="2.4"
                strokeDasharray="6,4"
                strokeLinecap="round"
              />
              {/* Badge: Future Wife placeholder (Coral Theme, explicitly not a current marriage) */}
              <g transform={`translate(${midX}, ${midY})`} className="pointer-events-auto cursor-help">
                <rect
                  x="-62"
                  y="-12"
                  width="124"
                  height="24"
                  rx="6"
                  fill="#240C13"
                  stroke="#FB7185"
                  strokeWidth="1.5"
                  filter="url(#badge-shadow)"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#FFE4E6"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  Future Wife (Placeholder)
                </text>
                <title>Future Wife — Sindhu Triveni (Placeholder, not married)</title>
              </g>
            </g>
          );
        }

        // 4. Parent-to-Child Relationship (Directional Arrow)
        if (rel.type === 'parent-child') {
          let startX = from.cx;
          let startY = from.bottom;

          // If this is the couple line from Sindhu Triveni's parents to Sindhu Triveni
          if (
            rel.id === 'rel_sindhu_parents_to_sindhu' ||
            (rel.fromId === 'sindhu_father' && rel.toId === 'sindhu_triveni')
          ) {
            const mother = getBoxBounds('sindhu_mother');
            if (mother) {
              // Stem directly from the couple's relationship connection (<=>)
              startX = (from.right + mother.left) / 2;
              startY = from.cy + 11; // directly under the <=> badge
            }
          }

          const endX = to.cx;
          const endY = to.top;
          const dropY = startY + (endY - startY) * 0.45;

          const pathD = `M ${startX} ${startY} V ${dropY} H ${endX} V ${endY}`;

          return (
            <g key={rel.id} className="transition-all duration-75">
              <path
                d={pathD}
                fill="none"
                stroke="#B7E4C7"
                strokeWidth="2.4"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        }

        return null;
      })}
    </svg>
  );
};
