import React from "react";

export interface JewelCoreLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "mark" | "badge" | "full";
  showText?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { icon: 18, textMain: "text-xs", textSub: "text-[8px]" },
  sm: { icon: 24, textMain: "text-sm", textSub: "text-[9px]" },
  md: { icon: 32, textMain: "text-base", textSub: "text-[10px]" },
  lg: { icon: 44, textMain: "text-xl", textSub: "text-xs" },
  xl: { icon: 64, textMain: "text-2xl", textSub: "text-sm" },
};

export function JewelCoreLogo({
  size = "md",
  variant = "mark",
  showText = false,
  className = "",
}: JewelCoreLogoProps) {
  const { icon: pxSize, textMain, textSub } = SIZE_MAP[size];

  const renderMarkSvg = () => (
    <svg
      viewBox="16 16 96 96"
      width={pxSize}
      height={pxSize}
      className="flex-shrink-0 drop-shadow-[0_1px_4px_rgba(212,175,55,0.25)]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-label="JewelCore Atelier Logo Mark"
    >
      <defs>
        <linearGradient id="jcGoldLuster" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="25%" stopColor="#FDF3B8" />
          <stop offset="50%" stopColor="#C59B27" />
          <stop offset="75%" stopColor="#FAE893" />
          <stop offset="100%" stopColor="#9A741E" />
        </linearGradient>

        <linearGradient id="jcGoldShade" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6B4F12" />
          <stop offset="45%" stopColor="#9A7422" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>

        <linearGradient
          id="jcGoldHighlight"
          x1="50%"
          y1="0%"
          x2="50%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#FFFFF5" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.7" />
        </linearGradient>

        <linearGradient id="jcPlatAccent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        <filter id="jcGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g id="gemCore">
        {/* Crown Table */}
        <polygon
          points="44,26 84,26 74,42 54,42"
          fill="url(#jcGoldHighlight)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Crown Star Kites */}
        <polygon
          points="44,26 54,42 22,50"
          fill="url(#jcGoldShade)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <polygon
          points="84,26 106,50 74,42"
          fill="url(#jcGoldLuster)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Crown Center Facet */}
        <polygon
          points="54,42 74,42 64,52"
          fill="url(#jcGoldLuster)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Crown Girdle Triangles */}
        <polygon
          points="22,50 54,42 42,52"
          fill="url(#jcGoldLuster)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <polygon
          points="42,52 54,42 64,52"
          fill="url(#jcGoldShade)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <polygon
          points="64,52 74,42 86,52"
          fill="url(#jcGoldHighlight)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <polygon
          points="86,52 74,42 106,50"
          fill="url(#jcGoldShade)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Upper Pavilion Flanks */}
        <polygon
          points="22,50 42,52 32,70"
          fill="url(#jcGoldShade)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <polygon
          points="106,50 96,70 86,52"
          fill="url(#jcGoldLuster)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Isometric Core Monogram */}
        <polygon
          points="64,54 80,64 64,74 48,64"
          fill="url(#jcPlatAccent)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <polygon
          points="48,64 64,74 64,94 48,84"
          fill="url(#jcGoldShade)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <polygon
          points="64,74 80,64 80,84 64,94"
          fill="url(#jcGoldLuster)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Lower Pavilion Facets */}
        <polygon
          points="22,50 32,70 64,106"
          fill="url(#jcGoldShade)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <polygon
          points="32,70 48,84 64,106"
          fill="url(#jcGoldLuster)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <polygon
          points="48,84 64,94 64,106"
          fill="url(#jcGoldHighlight)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        <polygon
          points="106,50 64,106 96,70"
          fill="url(#jcGoldLuster)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <polygon
          points="96,70 64,106 80,84"
          fill="url(#jcGoldShade)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
        <polygon
          points="80,84 64,106 64,94"
          fill="url(#jcGoldLuster)"
          stroke="#8C6615"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Center Glow Node */}
        <circle cx="64" cy="74" r="2.2" fill="#FFFFFF" filter="url(#jcGlow)" />

        {/* Crown 4-Point Star Sparkle */}
        <g transform="translate(86, 22)">
          <path
            d="M0,-8.5 Q0,0 8.5,0 Q0,0 0,8.5 Q0,0 -8.5,0 Q0,0 0,-8.5 Z"
            fill="url(#jcGoldHighlight)"
          />
          <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
        </g>
      </g>
    </svg>
  );

  const renderBadge = () => (
    <div
      className={`rounded-xl bg-gradient-to-br from-surface-elevated via-surface to-background border border-gold/30 p-1.5 flex items-center justify-center shadow-lg shadow-gold/5 ${className}`}
    >
      {renderMarkSvg()}
    </div>
  );

  const shouldRenderText = variant === "full" || showText;

  if (variant === "badge" && !shouldRenderText) {
    return renderBadge();
  }

  return (
    <div className={`inline-flex items-center space-x-2.5 ${className}`}>
      {variant === "badge" ? renderBadge() : renderMarkSvg()}

      {shouldRenderText && (
        <div className="flex flex-col select-none">
          <span
            className={`font-semibold tracking-[0.16em] uppercase text-foreground leading-tight ${textMain}`}
          >
            JEWELCORE
          </span>
          <span
            className={`font-mono uppercase tracking-[0.22em] text-muted-foreground opacity-80 leading-none ${textSub}`}
          >
            ATELIER ERP
          </span>
        </div>
      )}
    </div>
  );
}
