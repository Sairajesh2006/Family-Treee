import React from 'react';

/**
 * BotanicalBackground component:
 * Renders an elegant, nature-inspired family heritage framing with soft ivory/cream backdrop,
 * subtle watercolor greenery and leaves around the page corners, and gentle warm gold accents.
 * All decorative elements are pointer-events-none so they never interfere with diagram navigation.
 */
export const BotanicalBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Soft Vignette / Ambient Dark Emerald Edge Warmth */}
      <div className="absolute inset-0 bg-radial-[circle_at_center] from-transparent via-transparent to-[#020a07]/55" />

      {/* --- TOP-LEFT CORNER: Watercolor Eucalyptus & Olive Branch --- */}
      <div className="absolute -top-3 -left-3 w-56 h-56 sm:w-72 sm:h-72 opacity-90">
        <svg
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-sm"
        >
          <defs>
            <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1B4332" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#2D6A4F" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#52B788" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="leafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D2818" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#40916C" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#74C69D" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="goldStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C5A059" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F3D080" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* Main Arcing Stem */}
          <path
            d="M -10 -10 C 60 40, 110 90, 175 180"
            stroke="url(#goldStemGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Secondary Stem */}
          <path
            d="M 30 20 C 80 50, 120 70, 205 105"
            stroke="#34684E"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />

          {/* Watercolor Leaves (Top-Left) */}
          <g>
            {/* Leaf 1 */}
            <path
              d="M 50 40 C 40 10, 80 0, 95 25 C 105 45, 70 55, 50 40 Z"
              fill="url(#leafGrad1)"
            />
            {/* Leaf 2 */}
            <path
              d="M 80 65 C 65 35, 115 25, 130 50 C 140 70, 100 85, 80 65 Z"
              fill="url(#leafGrad2)"
            />
            {/* Leaf 3 */}
            <path
              d="M 115 100 C 95 70, 145 60, 165 85 C 175 105, 135 120, 115 100 Z"
              fill="url(#leafGrad1)"
            />
            {/* Leaf 4 */}
            <path
              d="M 145 145 C 125 115, 175 110, 195 135 C 205 155, 165 170, 145 145 Z"
              fill="url(#leafGrad2)"
            />
            {/* Leaf 5 - tip */}
            <path
              d="M 175 180 C 160 160, 200 155, 215 175 C 220 190, 190 200, 175 180 Z"
              fill="url(#leafGrad1)"
            />

            {/* Side Leaves & Golden Accents */}
            <path
              d="M 120 60 C 140 30, 180 40, 170 70 C 160 85, 130 75, 120 60 Z"
              fill="url(#leafGrad2)"
            />
            <path
              d="M 160 85 C 185 60, 220 75, 210 100 C 195 115, 170 100, 160 85 Z"
              fill="url(#leafGrad1)"
            />

            {/* Tiny Golden Berries / Floral Buds */}
            <circle cx="100" cy="55" r="3.5" fill="#F3D080" fillOpacity="0.9" />
            <circle cx="138" cy="92" r="3" fill="#E5C365" fillOpacity="0.85" />
            <circle cx="178" cy="130" r="3" fill="#F3D080" fillOpacity="0.85" />
            <circle cx="70" cy="30" r="2.5" fill="#E5C365" fillOpacity="0.8" />
          </g>
        </svg>
      </div>

      {/* --- TOP-RIGHT CORNER: Watercolor Laurel & Golden Frond --- */}
      <div className="absolute -top-3 -right-3 w-56 h-56 sm:w-72 sm:h-72 opacity-90">
        <svg
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-sm"
        >
          {/* Main Arcing Stem */}
          <path
            d="M 310 -10 C 240 40, 190 90, 125 180"
            stroke="url(#goldStemGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Secondary Stem */}
          <path
            d="M 270 20 C 220 50, 180 70, 95 105"
            stroke="#34684E"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />

          <g>
            <path
              d="M 250 40 C 260 10, 220 0, 205 25 C 195 45, 230 55, 250 40 Z"
              fill="url(#leafGrad2)"
            />
            <path
              d="M 220 65 C 235 35, 185 25, 170 50 C 160 70, 200 85, 220 65 Z"
              fill="url(#leafGrad1)"
            />
            <path
              d="M 185 100 C 205 70, 155 60, 135 85 C 125 105, 165 120, 185 100 Z"
              fill="url(#leafGrad2)"
            />
            <path
              d="M 155 145 C 175 115, 125 110, 105 135 C 95 155, 135 170, 155 145 Z"
              fill="url(#leafGrad1)"
            />
            <path
              d="M 125 180 C 140 160, 100 155, 85 175 C 80 190, 110 200, 125 180 Z"
              fill="url(#leafGrad2)"
            />

            {/* Side leaves */}
            <path
              d="M 180 60 C 160 30, 120 40, 130 70 C 140 85, 170 75, 180 60 Z"
              fill="url(#leafGrad1)"
            />
            <path
              d="M 140 85 C 115 60, 80 75, 90 100 C 105 115, 130 100, 140 85 Z"
              fill="url(#leafGrad2)"
            />

            {/* Golden Berries */}
            <circle cx="200" cy="55" r="3.5" fill="#F3D080" fillOpacity="0.9" />
            <circle cx="162" cy="92" r="3" fill="#E5C365" fillOpacity="0.85" />
            <circle cx="122" cy="130" r="3" fill="#F3D080" fillOpacity="0.85" />
            <circle cx="230" cy="30" r="2.5" fill="#E5C365" fillOpacity="0.8" />
          </g>
        </svg>
      </div>

      {/* --- BOTTOM-LEFT CORNER: Subtle Botanical Fern & Sage Leaves --- */}
      <div className="absolute -bottom-3 -left-3 w-48 h-48 sm:w-64 sm:h-64 opacity-85">
        <svg
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-sm"
        >
          {/* Stem arching upward */}
          <path
            d="M -10 310 C 50 250, 100 200, 170 120"
            stroke="url(#goldStemGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 30 280 C 80 240, 120 220, 195 190"
            stroke="#34684E"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.65"
          />

          <g>
            <path
              d="M 50 260 C 40 290, 80 300, 95 275 C 105 255, 70 245, 50 260 Z"
              fill="url(#leafGrad2)"
            />
            <path
              d="M 80 235 C 65 265, 115 275, 130 250 C 140 230, 100 215, 80 235 Z"
              fill="url(#leafGrad1)"
            />
            <path
              d="M 115 200 C 95 230, 145 240, 165 215 C 175 195, 135 180, 115 200 Z"
              fill="url(#leafGrad2)"
            />
            <path
              d="M 145 155 C 125 185, 175 190, 195 165 C 205 145, 165 130, 145 155 Z"
              fill="url(#leafGrad1)"
            />

            <circle cx="100" cy="245" r="3" fill="#F3D080" fillOpacity="0.85" />
            <circle cx="140" cy="205" r="2.8" fill="#E5C365" fillOpacity="0.8" />
          </g>
        </svg>
      </div>

      {/* --- BOTTOM-RIGHT CORNER: Botanical Sprig & Warm Gold Touches --- */}
      <div className="absolute -bottom-3 -right-3 w-48 h-48 sm:w-64 sm:h-64 opacity-85">
        <svg
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-sm"
        >
          <path
            d="M 310 310 C 250 250, 200 200, 130 120"
            stroke="url(#goldStemGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 270 280 C 220 240, 180 220, 105 190"
            stroke="#34684E"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.65"
          />

          <g>
            <path
              d="M 250 260 C 260 290, 220 300, 205 275 C 195 255, 230 245, 250 260 Z"
              fill="url(#leafGrad1)"
            />
            <path
              d="M 220 235 C 235 265, 185 275, 170 250 C 160 230, 200 215, 220 235 Z"
              fill="url(#leafGrad2)"
            />
            <path
              d="M 185 200 C 205 230, 155 240, 135 215 C 125 195, 165 180, 185 200 Z"
              fill="url(#leafGrad1)"
            />
            <path
              d="M 155 155 C 175 185, 125 190, 105 165 C 95 145, 135 130, 155 155 Z"
              fill="url(#leafGrad2)"
            />

            <circle cx="200" cy="245" r="3" fill="#F3D080" fillOpacity="0.85" />
            <circle cx="160" cy="205" r="2.8" fill="#E5C365" fillOpacity="0.8" />
          </g>
        </svg>
      </div>
    </div>
  );
};
