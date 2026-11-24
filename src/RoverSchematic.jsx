import { useDashboardLocale } from './dashboardLocale.js';
import React from 'react';

export default function RoverSchematic() {
  const { t } = useDashboardLocale();
  return (
    <figure className="bot console-rover" role="img" aria-label={t("Campus Inspection Robot chassis with a tall tapered body, touchscreen, and round wheeled base")}>
      <div className="console-rover-grid" aria-hidden="true">
        <svg viewBox="0 0 156 168" fill="none" focusable="false">
          <ellipse cx="78" cy="156" rx="43" ry="7" fill="#111c1c" opacity=".65" />

          {/* Wheels, round housing and bumper */}
          <path d="M48 141 Q43 150 49 157 Q54 162 61 154 L63 143Z" fill="#121c1c" stroke="#526764" />
          <path d="M92 146 L94 158 Q95 162 101 159 Q106 155 103 146Z" fill="#121c1c" stroke="#526764" />
          <path d="M43 128 H113 V146 C113 153 97 157 78 157 S43 153 43 146Z" fill="#a4afaa" />
          <path d="M43 128 H56 V149 Q47 148 43 145Z" fill="#7b8984" />
          <path d="M43 141 C46 147 60 150 78 150 C96 150 110 147 113 141 V148 C111 155 97 159 78 159 C59 159 45 155 43 149Z" fill="#bd692f" />
          <path d="M44 143 C54 149 71 151 83 150 C98 150 109 146 112 144" stroke="#e89250" strokeWidth="1.2" />
          <ellipse cx="78" cy="128" rx="35" ry="10" fill="#778783" stroke="#a5b2aa" />

          {/* Frame and LiDAR sit in the gap above the base. */}
          <path d="M52 110 H57 V127 L52 128Z M99 110 H104 V127 L99 129Z" fill="#697974" stroke="#98a5a0" strokeWidth=".8" />
          <path d="M76 114 L92 115 L91 129 L76 132Z" fill="#182425" />
          <path d="M75 115 L89 113 L92 117 L77 121Z" fill="#424f54" />
          <path d="M75 117 L80 118 V126 L75 127Z" fill="#376697" />

          {/* Tapered shell and upper housing */}
          <path d="M53 43 L71 46 L64 117 L50 114 L44 108Z" fill="#8c9b93" />
          <path d="M71 46 L102 43 L112 109 L107 114 L64 117Z" fill="#c6cec6" />
          <path d="M44 107 L51 111 L65 114 L107 111 L112 107 V112 L107 117 L65 121 L51 117 L44 112Z" fill="#758681" />
          <path d="M52 16 L70 20 L69 45 L53 41Z" fill="#95a29b" />
          <path d="M70 20 L103 18 L101 44 L69 45Z" fill="#d0d6cb" />
          <path d="M52 16 L88 12 L104 16 L70 20Z" fill="#b7c2b9" />
          <path d="M50 41 L69 46 L101 42 L109 44 V47 L69 50 L46 45 V42Z" fill="#3b72ad" />
          <path d="M72 22 L102 19 L100 41 L70 44Z" fill="#17232d" stroke="#788e92" />
          <path d="M76 13 V11 L85 10 L88 11 V14 L80 15Z" fill="#d4a447" />
          <path d="M78 11 V7 Q82 5 86 7 V11 Q82 13 78 11Z" fill="#b6473b" />
          <path d="M79 7 Q82 6 85 7" stroke="#eb806d" strokeLinecap="round" />

          {/* Vents, camera, access hatch and front proximity sensors */}
          <path d="M74 58 L99 55 M74 62 L100 59 M73 66 L100 63 M73 70 L101 67" stroke="#74847c" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M82 77 L90 76 L94 78 V85 L85 87 L82 85Z" fill="#889891" />
          <rect x="87" y="78" width="6" height="6" rx="1.2" fill="#1d282d" />
          <circle cx="90" cy="81" r="1" fill="#567789" />
          <path d="M74 95 L102 91 L105 104 L73 110Z" fill="#a8b6ac" stroke="#85968c" strokeWidth=".8" />
          <path d="M75 109 L105 104" stroke="#697c75" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M82 112 L86 111.5 V114 L82 114.5Z M91 111 L95 110.5 V113 L91 113.5Z" fill="#273a39" />
        </svg>
      </div>
      <figcaption aria-hidden="true">{t("Chassis schematic")}</figcaption>
    </figure>
  );
}
