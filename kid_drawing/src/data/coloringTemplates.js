/**
 * 20 SVG coloring templates for kids.
 * Each template has clear black outlines on white background,
 * creating distinct regions that can be flood-filled.
 */

const S = (shapes) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><rect width="500" height="500" fill="white"/><g fill="white" stroke="#222" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${shapes}</g></svg>`;

export const svgToDataUrl = (svg) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

export const coloringTemplates = [
  // 1. Cat
  {
    id: 1, name: 'Mèo', emoji: '🐱',
    svg: S(
      '<ellipse cx="250" cy="340" rx="110" ry="85"/>' +
      '<circle cx="250" cy="190" r="85"/>' +
      '<polygon points="185,130 160,40 238,105"/>' +
      '<polygon points="315,130 340,40 262,105"/>' +
      '<ellipse cx="250" cy="210" rx="10" ry="7"/>' +
      '<path d="M240,222 Q250,238 260,222" fill="none" stroke-width="3"/>' +
      '<circle cx="218" cy="178" r="14"/><circle cx="222" cy="175" r="6" fill="black" stroke="none"/>' +
      '<circle cx="282" cy="178" r="14"/><circle cx="278" cy="175" r="6" fill="black" stroke="none"/>' +
      '<line x1="175" y1="205" x2="225" y2="210" stroke-width="2"/>' +
      '<line x1="175" y1="220" x2="225" y2="218" stroke-width="2"/>' +
      '<line x1="275" y1="210" x2="325" y2="205" stroke-width="2"/>' +
      '<line x1="275" y1="218" x2="325" y2="220" stroke-width="2"/>' +
      '<path d="M355,320 C385,270 390,220 365,170" fill="none" stroke-width="7"/>' +
      '<ellipse cx="195" cy="410" rx="30" ry="16"/>' +
      '<ellipse cx="305" cy="410" rx="30" ry="16"/>'
    ),
  },
  // 2. Dog
  {
    id: 2, name: 'Cún con', emoji: '🐶',
    svg: S(
      '<ellipse cx="250" cy="340" rx="115" ry="88"/>' +
      '<circle cx="250" cy="190" r="88"/>' +
      '<ellipse cx="155" cy="190" rx="32" ry="72"/>' +
      '<ellipse cx="345" cy="190" rx="32" ry="72"/>' +
      '<circle cx="220" cy="175" r="14"/><circle cx="224" cy="172" r="6" fill="black" stroke="none"/>' +
      '<circle cx="280" cy="175" r="14"/><circle cx="276" cy="172" r="6" fill="black" stroke="none"/>' +
      '<ellipse cx="250" cy="218" rx="18" ry="13" fill="#222"/>' +
      '<path d="M237,232 Q250,258 263,232" fill="none" stroke-width="3"/>' +
      '<path d="M362,325 Q400,295 385,248" fill="none" stroke-width="7"/>' +
      '<ellipse cx="195" cy="413" rx="32" ry="16"/>' +
      '<ellipse cx="305" cy="413" rx="32" ry="16"/>'
    ),
  },
  // 3. Fish
  {
    id: 3, name: 'Cá', emoji: '🐟',
    svg: S(
      '<ellipse cx="215" cy="250" rx="155" ry="100"/>' +
      '<polygon points="370,250 465,165 465,335"/>' +
      '<circle cx="150" cy="225" r="22"/>' +
      '<circle cx="153" cy="222" r="9" fill="black" stroke="none"/>' +
      '<path d="M265,170 L248,330" fill="none"/>' +
      '<path d="M310,168 L298,332" fill="none"/>' +
      '<ellipse cx="215" cy="250" rx="65" ry="40" fill="none"/>' +
      '<path d="M145,270 Q180,290 220,270" fill="none" stroke-width="2"/>' +
      '<path d="M60,250 Q80,230 100,250 Q80,270 60,250" fill="none"/>'
    ),
  },
  // 4. Butterfly
  {
    id: 4, name: 'Bướm', emoji: '🦋',
    svg: S(
      '<ellipse cx="250" cy="275" rx="14" ry="85"/>' +
      '<path d="M250,210 C195,130 90,105 105,205 C112,265 200,285 250,265"/>' +
      '<path d="M250,210 C305,130 410,105 395,205 C388,265 300,285 250,265"/>' +
      '<path d="M250,315 C215,340 135,360 155,415 C172,448 235,405 250,345"/>' +
      '<path d="M250,315 C285,340 365,360 345,415 C328,448 265,405 250,345"/>' +
      '<circle cx="180" cy="200" r="22"/><circle cx="320" cy="200" r="22"/>' +
      '<circle cx="185" cy="365" r="14"/><circle cx="315" cy="365" r="14"/>' +
      '<circle cx="250" cy="185" r="12"/>' +
      '<path d="M242,180 Q220,130 212,148" fill="none" stroke-width="3"/>' +
      '<path d="M258,180 Q280,130 288,148" fill="none" stroke-width="3"/>' +
      '<circle cx="212" cy="148" r="6" fill="#222"/>' +
      '<circle cx="288" cy="148" r="6" fill="#222"/>'
    ),
  },
  // 5. Flower
  {
    id: 5, name: 'Hoa', emoji: '🌸',
    svg: S(
      '<circle cx="250" cy="110" r="42"/>' +
      '<circle cx="330" cy="162" r="42"/>' +
      '<circle cx="310" cy="258" r="42"/>' +
      '<circle cx="190" cy="258" r="42"/>' +
      '<circle cx="170" cy="162" r="42"/>' +
      '<circle cx="250" cy="190" r="46"/>' +
      '<circle cx="250" cy="190" r="20" fill="none"/>' +
      '<rect x="243" y="270" width="14" height="190" rx="7"/>' +
      '<ellipse cx="215" cy="360" rx="45" ry="16" transform="rotate(-30,215,360)"/>' +
      '<ellipse cx="285" cy="400" rx="45" ry="16" transform="rotate(30,285,400)"/>'
    ),
  },
  // 6. Sun
  {
    id: 6, name: 'Mặt trời', emoji: '☀️',
    svg: S(
      '<circle cx="250" cy="250" r="88"/>' +
      '<polygon points="228,128 272,128 250,28"/>' +
      '<polygon points="228,372 272,372 250,472"/>' +
      '<polygon points="128,228 128,272 28,250"/>' +
      '<polygon points="372,228 372,272 472,250"/>' +
      '<polygon points="170,170 190,148 118,98"/>' +
      '<polygon points="330,170 310,148 382,98"/>' +
      '<polygon points="170,330 148,310 98,382"/>' +
      '<polygon points="330,330 352,310 402,382"/>' +
      '<circle cx="222" cy="232" r="12"/><circle cx="225" cy="229" r="5" fill="black" stroke="none"/>' +
      '<circle cx="278" cy="232" r="12"/><circle cx="275" cy="229" r="5" fill="black" stroke="none"/>' +
      '<path d="M222,272 Q250,300 278,272" fill="none" stroke-width="3"/>'
    ),
  },
  // 7. Star
  {
    id: 7, name: 'Ngôi sao', emoji: '⭐',
    svg: S(
      '<polygon points="250,45 290,185 440,185 318,278 362,418 250,332 138,418 182,278 60,185 210,185"/>' +
      '<circle cx="228" cy="225" r="12"/><circle cx="231" cy="222" r="5" fill="black" stroke="none"/>' +
      '<circle cx="272" cy="225" r="12"/><circle cx="269" cy="222" r="5" fill="black" stroke="none"/>' +
      '<path d="M235,262 Q250,282 265,262" fill="none" stroke-width="3"/>'
    ),
  },
  // 8. House
  {
    id: 8, name: 'Ngôi nhà', emoji: '🏠',
    svg: S(
      '<rect x="95" y="230" width="310" height="220"/>' +
      '<polygon points="75,235 250,70 425,235"/>' +
      '<rect x="205" y="335" width="80" height="115"/>' +
      '<rect x="125" y="278" width="65" height="58"/>' +
      '<rect x="310" y="278" width="65" height="58"/>' +
      '<line x1="157" y1="278" x2="157" y2="336" fill="none"/>' +
      '<line x1="125" y1="307" x2="190" y2="307" fill="none"/>' +
      '<line x1="342" y1="278" x2="342" y2="336" fill="none"/>' +
      '<line x1="310" y1="307" x2="375" y2="307" fill="none"/>' +
      '<circle cx="230" cy="398" r="6" fill="#222"/>' +
      '<rect x="360" y="108" width="28" height="82"/>' +
      '<path d="M60,460 L440,460" stroke-width="5" fill="none"/>'
    ),
  },
  // 9. Tree
  {
    id: 9, name: 'Cây', emoji: '🌳',
    svg: S(
      '<rect x="222" y="300" width="56" height="165" rx="10"/>' +
      '<circle cx="250" cy="195" r="105"/>' +
      '<circle cx="170" cy="245" r="58"/>' +
      '<circle cx="330" cy="245" r="58"/>' +
      '<circle cx="205" cy="145" r="52"/>' +
      '<circle cx="295" cy="145" r="52"/>' +
      '<circle cx="250" cy="120" r="45"/>' +
      '<path d="M60,468 L440,468" stroke-width="5" fill="none"/>'
    ),
  },
  // 10. Car
  {
    id: 10, name: 'Ô tô', emoji: '🚗',
    svg: S(
      '<rect x="55" y="235" width="390" height="105" rx="22"/>' +
      '<path d="M135,235 L180,148 L330,148 L380,235"/>' +
      '<circle cx="148" cy="348" r="42"/><circle cx="148" cy="348" r="20"/>' +
      '<circle cx="352" cy="348" r="42"/><circle cx="352" cy="348" r="20"/>' +
      '<rect x="198" y="168" width="58" height="55" rx="6"/>' +
      '<rect x="276" y="168" width="62" height="55" rx="6"/>' +
      '<circle cx="82" cy="275" r="14"/>' +
      '<rect x="415" y="260" width="20" height="18" rx="4" fill="none"/>' +
      '<path d="M30,395 L470,395" stroke-width="5" fill="none"/>'
    ),
  },
  // 11. Boat
  {
    id: 11, name: 'Thuyền', emoji: '⛵',
    svg: S(
      '<path d="M75,310 L105,410 L395,410 L425,310 Z"/>' +
      '<rect x="246" y="115" width="8" height="200"/>' +
      '<polygon points="258,125 258,275 410,275"/>' +
      '<polygon points="242,135 242,260 135,260"/>' +
      '<circle cx="250" cy="358" r="24"/>' +
      '<path d="M50,420 Q150,460 250,420 Q350,380 450,420" fill="none" stroke-width="4"/>' +
      '<path d="M50,445 Q150,475 250,445 Q350,415 450,445" fill="none" stroke-width="3"/>' +
      '<polygon points="258,100 265,115 251,115" fill="#222"/>'
    ),
  },
  // 12. Rocket
  {
    id: 12, name: 'Tên lửa', emoji: '🚀',
    svg: S(
      '<rect x="198" y="150" width="104" height="225" rx="12"/>' +
      '<path d="M198,155 Q250,35 302,155"/>' +
      '<polygon points="193,375 142,448 198,382"/>' +
      '<polygon points="307,375 358,448 302,382"/>' +
      '<circle cx="250" cy="230" r="32"/>' +
      '<circle cx="250" cy="230" r="18" fill="none"/>' +
      '<rect x="218" y="310" width="64" height="12" rx="6"/>' +
      '<rect x="218" y="342" width="64" height="12" rx="6"/>' +
      '<polygon points="220,378 250,465 280,378"/>' +
      '<circle cx="222" cy="100" r="5" fill="none" stroke-width="2"/>' +
      '<circle cx="350" cy="130" r="4" fill="none" stroke-width="2"/>' +
      '<circle cx="140" cy="85" r="3" fill="none" stroke-width="2"/>'
    ),
  },
  // 13. Heart
  {
    id: 13, name: 'Trái tim', emoji: '❤️',
    svg: S(
      '<path d="M250,425 C145,350 25,260 48,165 C65,105 118,72 178,72 C215,72 248,98 250,135 C252,98 285,72 322,72 C382,72 435,105 452,165 C475,260 355,350 250,425Z"/>' +
      '<path d="M175,152 Q198,118 225,148" fill="none" stroke-width="3"/>' +
      '<circle cx="200" cy="240" r="30" fill="none" stroke-width="2"/>' +
      '<circle cx="300" cy="280" r="22" fill="none" stroke-width="2"/>'
    ),
  },
  // 14. Mushroom
  {
    id: 14, name: 'Nấm', emoji: '🍄',
    svg: S(
      '<path d="M95,260 Q95,95 250,75 Q405,95 405,260 Z"/>' +
      '<rect x="195" y="255" width="110" height="175" rx="18"/>' +
      '<circle cx="195" cy="178" r="28"/>' +
      '<circle cx="300" cy="155" r="22"/>' +
      '<circle cx="250" cy="120" r="20"/>' +
      '<circle cx="150" cy="225" r="16"/>' +
      '<circle cx="345" cy="225" r="16"/>' +
      '<ellipse cx="172" cy="445" rx="48" ry="22"/>' +
      '<ellipse cx="328" cy="445" rx="48" ry="22"/>' +
      '<path d="M55,468 L445,468" stroke-width="4" fill="none"/>'
    ),
  },
  // 15. Bird
  {
    id: 15, name: 'Chim', emoji: '🐦',
    svg: S(
      '<ellipse cx="260" cy="278" rx="115" ry="72"/>' +
      '<circle cx="185" cy="210" r="58"/>' +
      '<polygon points="120,208 65,188 68,228"/>' +
      '<circle cx="172" cy="198" r="12"/>' +
      '<circle cx="175" cy="195" r="5" fill="black" stroke="none"/>' +
      '<path d="M290,225 Q360,175 400,228" fill="none"/>' +
      '<path d="M375,278 L420,268 L405,295" fill="none" stroke-width="3"/>' +
      '<path d="M228,350 L208,418 L248,418 Z"/>' +
      '<path d="M278,350 L258,418 L298,418 Z"/>' +
      '<path d="M310,240 Q340,210 360,240" fill="none" stroke-width="2"/>'
    ),
  },
  // 16. Rabbit
  {
    id: 16, name: 'Thỏ', emoji: '🐰',
    svg: S(
      '<ellipse cx="250" cy="345" rx="105" ry="92"/>' +
      '<circle cx="250" cy="200" r="82"/>' +
      '<ellipse cx="198" cy="90" rx="28" ry="78"/>' +
      '<ellipse cx="302" cy="90" rx="28" ry="78"/>' +
      '<ellipse cx="198" cy="90" rx="14" ry="55" fill="none"/>' +
      '<ellipse cx="302" cy="90" rx="14" ry="55" fill="none"/>' +
      '<circle cx="222" cy="188" r="12"/><circle cx="225" cy="185" r="5" fill="black" stroke="none"/>' +
      '<circle cx="278" cy="188" r="12"/><circle cx="275" cy="185" r="5" fill="black" stroke="none"/>' +
      '<ellipse cx="250" cy="218" rx="9" ry="7" fill="#222"/>' +
      '<path d="M238,228 Q250,248 262,228" fill="none" stroke-width="2"/>' +
      '<ellipse cx="200" cy="422" rx="28" ry="15"/>' +
      '<ellipse cx="300" cy="422" rx="28" ry="15"/>' +
      '<circle cx="310" cy="380" r="18" fill="none" stroke-width="2"/>'
    ),
  },
  // 17. Bear
  {
    id: 17, name: 'Gấu', emoji: '🐻',
    svg: S(
      '<ellipse cx="250" cy="328" rx="125" ry="105"/>' +
      '<circle cx="250" cy="195" r="92"/>' +
      '<circle cx="165" cy="128" r="38"/>' +
      '<circle cx="335" cy="128" r="38"/>' +
      '<circle cx="165" cy="128" r="20" fill="none"/>' +
      '<circle cx="335" cy="128" r="20" fill="none"/>' +
      '<circle cx="218" cy="182" r="14"/><circle cx="221" cy="179" r="6" fill="black" stroke="none"/>' +
      '<circle cx="282" cy="182" r="14"/><circle cx="279" cy="179" r="6" fill="black" stroke="none"/>' +
      '<ellipse cx="250" cy="220" rx="22" ry="16"/>' +
      '<ellipse cx="250" cy="215" rx="8" ry="6" fill="#222"/>' +
      '<path d="M235,235 Q250,258 265,235" fill="none" stroke-width="3"/>' +
      '<ellipse cx="250" cy="340" rx="52" ry="38" fill="none"/>' +
      '<ellipse cx="192" cy="418" rx="30" ry="16"/>' +
      '<ellipse cx="308" cy="418" rx="30" ry="16"/>'
    ),
  },
  // 18. Snail
  {
    id: 18, name: 'Ốc sên', emoji: '🐌',
    svg: S(
      '<ellipse cx="225" cy="378" rx="175" ry="52"/>' +
      '<circle cx="305" cy="258" r="108"/>' +
      '<circle cx="305" cy="258" r="72"/>' +
      '<circle cx="305" cy="258" r="38"/>' +
      '<ellipse cx="95" cy="342" rx="38" ry="28"/>' +
      '<circle cx="80" cy="295" r="10" fill="#222"/>' +
      '<circle cx="115" cy="295" r="10" fill="#222"/>' +
      '<path d="M80,310 L80,295" stroke-width="4" fill="none"/>' +
      '<path d="M115,310 L115,295" stroke-width="4" fill="none"/>' +
      '<path d="M82,348 Q95,360 108,348" fill="none" stroke-width="2"/>' +
      '<path d="M45,440 L455,440" stroke-width="4" fill="none"/>'
    ),
  },
  // 19. Ice Cream
  {
    id: 19, name: 'Kem', emoji: '🍦',
    svg: S(
      '<polygon points="180,278 320,278 250,468"/>' +
      '<line x1="200" y1="290" x2="290" y2="420" fill="none" stroke-width="2"/>' +
      '<line x1="300" y1="290" x2="210" y2="420" fill="none" stroke-width="2"/>' +
      '<line x1="240" y1="310" x2="320" y2="300" fill="none" stroke-width="2"/>' +
      '<circle cx="250" cy="202" r="78"/>' +
      '<circle cx="175" cy="225" r="58"/>' +
      '<circle cx="325" cy="225" r="58"/>' +
      '<circle cx="230" cy="170" r="12" fill="none" stroke-width="2"/>' +
      '<circle cx="280" cy="190" r="8" fill="none" stroke-width="2"/>' +
      '<circle cx="195" cy="215" r="10" fill="none" stroke-width="2"/>'
    ),
  },
  // 20. Crown
  {
    id: 20, name: 'Vương miện', emoji: '👑',
    svg: S(
      '<path d="M78,358 L78,195 L165,285 L250,148 L335,285 L422,195 L422,358 Z"/>' +
      '<rect x="78" y="352" width="344" height="45" rx="8"/>' +
      '<circle cx="165" cy="285" r="14"/>' +
      '<circle cx="250" cy="195" r="14"/>' +
      '<circle cx="335" cy="285" r="14"/>' +
      '<rect x="225" y="360" width="50" height="30" rx="6" fill="none"/>' +
      '<circle cx="132" cy="375" r="8" fill="none"/>' +
      '<circle cx="368" cy="375" r="8" fill="none"/>'
    ),
  },
];
