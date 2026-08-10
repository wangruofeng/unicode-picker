export const CATEGORY_DEFINITIONS = [
  { id: 'popular', names: { 'zh-CN': '热门符号', en: 'Popular' }, priority: 100 },
  { id: 'arrows', names: { 'zh-CN': '箭头', en: 'Arrows' }, priority: 90 },
  { id: 'math', names: { 'zh-CN': '数学', en: 'Math' }, priority: 88 },
  { id: 'currency', names: { 'zh-CN': '货币', en: 'Currency' }, priority: 86 },
  { id: 'punctuation', names: { 'zh-CN': '标点', en: 'Punctuation' }, priority: 84 },
  { id: 'brackets-quotes', names: { 'zh-CN': '括号与引号', en: 'Brackets & Quotes' }, priority: 82 },
  { id: 'geometric', names: { 'zh-CN': '几何图形', en: 'Geometric' }, priority: 80 },
  { id: 'stars-decoration', names: { 'zh-CN': '星星与装饰', en: 'Stars & Decoration' }, priority: 78 },
  { id: 'checks-status', names: { 'zh-CN': '对勾与状态', en: 'Checks & Status' }, priority: 76 },
  { id: 'ui-keyboard', names: { 'zh-CN': 'UI 与键盘', en: 'UI & Keyboard' }, priority: 74 },
  { id: 'box-drawing', names: { 'zh-CN': '方框与制表', en: 'Box & Line Drawing' }, priority: 72 },
  { id: 'circles', names: { 'zh-CN': '圆圈字符', en: 'Circles' }, priority: 70 },
  { id: 'superscripts-subscripts', names: { 'zh-CN': '上下标', en: 'Superscripts' }, priority: 68 },
  { id: 'music', names: { 'zh-CN': '音乐', en: 'Music' }, priority: 66 },
  { id: 'games-chess', names: { 'zh-CN': '游戏与棋类', en: 'Games & Chess' }, priority: 64 },
  { id: 'astronomy-zodiac', names: { 'zh-CN': '天文与星座', en: 'Astronomy & Zodiac' }, priority: 62 },
  { id: 'religion-culture', names: { 'zh-CN': '宗教与文化', en: 'Religion & Culture' }, priority: 60 },
  { id: 'weather-nature', names: { 'zh-CN': '天气与自然', en: 'Weather & Nature' }, priority: 58 },
  { id: 'other', names: { 'zh-CN': '其他符号', en: 'Other Symbols' }, priority: 0 }
];

const FEATURED_CODE_POINTS = [
  '21E3', '2190', '2191', '2192', '2193', '2194', '2195', '21D0', '21D2', '21D4',
  '21E6', '21E7', '21E8', '21E9', '2713', '2714', '2715', '2716', '2717', '2718',
  '2719', '271A', '271B', '271C', '271D', '271E', '271F', '2720', '2721', '2722',
  '2728', '2736', '2737', '2739', '273A', '273B', '273C', '273D', '273E', '273F',
  '2740', '2744', '2747', '2748', '274C', '274E', '2753', '2754', '2755', '2757',
  '2763', '2764', '27A1', '27B2', '27F5', '27F6', '27F7', '27F8', '27F9', '27FA',
  '00A9', '00AE', '2122', '00B1', '00D7', '00F7', '221A', '221E', '2248', '2260',
  '2264', '2265', '2200', '2203', '2205', '2208', '220B', '222B', '2211', '03C0',
  '0024', '00A2', '00A3', '00A5', '20AC', '20B9', '20BD', '20A9', '20AB', '20BF',
  '0021', '0023', '0026', '002A', '002B', '002D', '002E', '002F', '003A', '003B',
  '003C', '003D', '003E', '003F', '0040', '005B', '005D', '007B', '007D', '2022',
  '2026', '2013', '2014', '2018', '2019', '201C', '201D', '00AB', '00BB', '25A0',
  '25A1', '25B2', '25B3', '25C6', '25CB', '25CF', '25D0', '25D1', '25D2', '25D3',
  '2605', '2606', '260E', '2611', '2612', '2615', '2620', '2622', '2623', '2626',
  '262A', '262F', '2638', '2639', '263A', '263D', '263E', '2640', '2642', '2648',
  '2649', '264A', '264B', '264C', '264D', '264E', '264F', '2650', '2651', '2652',
  '2653', '2660', '2663', '2665', '2666', '266A', '266B', '2669', '266F', '266D',
  '266E', '2667', '2668', '2702', '2705', '2708', '2709', '270F', '2712', '2721',
  '2744', '2747', '2748', '2B50', '2B55'
];

export const FEATURED_IDS = FEATURED_CODE_POINTS.map((codePoint) => `u-${codePoint.toLowerCase()}`);

const hasAny = (value, terms) => terms.some((term) => value.includes(term));

export function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'no-block';
}

export function classifySymbol(symbol) {
  const name = symbol.name.toUpperCase();
  const block = symbol.block.toUpperCase();
  const category = symbol.generalCategory;
  const categories = [];
  const add = (id) => {
    if (!categories.includes(id)) categories.push(id);
  };

  if (category === 'Sc' || block.includes('CURRENCY') || hasAny(name, ['DOLLAR', 'EURO', 'YEN', 'POUND', 'RUPEE', 'WON', 'RUBLE', 'FRANC', 'PESO', 'LIRA', 'SHEQEL', 'BAHT'])) add('currency');
  if (category.startsWith('P') || hasAny(name, ['PUNCTUATION', 'COMMA', 'COLON', 'SEMICOLON', 'EXCLAMATION', 'QUESTION MARK', 'ELLIPSIS', 'DASH', 'HYPHEN', 'APOSTROPHE', 'QUOTATION'])) add('punctuation');
  if (['Ps', 'Pe', 'Pi', 'Pf'].includes(category) || hasAny(name, ['BRACKET', 'PARENTHESIS', 'PARENTHESIS', 'BRACE', 'QUOTATION MARK', 'ANGLE BRACKET', 'CEILING', 'FLOOR'])) add('brackets-quotes');
  if (category === 'Sm' || block.includes('MATHEMATICAL') || hasAny(name, ['PLUS', 'MINUS', 'MULTIPLICATION', 'DIVISION', 'EQUALS', 'INFINITY', 'INTEGRAL', 'SUMMATION', 'SQUARE ROOT', 'SUBSET', 'SUPERSET', 'PROPORTIONAL', 'APPROXIMATELY'])) add('math');
  if (block.includes('ARROW') || hasAny(name, ['ARROW', 'HARPOON', 'DRAFTING POINT RIGHT'])) add('arrows');
  if (block.includes('GEOMETRIC') || hasAny(name, ['TRIANGLE', 'SQUARE', 'DIAMOND', 'HEXAGON', 'PENTAGON', 'OCTAGON', 'LOZENGE', 'RECTANGLE', 'RHOMBUS', 'GEOMETRIC'])) add('geometric');
  if (block.includes('BOX DRAWING') || block.includes('BLOCK ELEMENTS') || hasAny(name, ['BOX DRAWINGS', 'BOX DRAWING', 'DASHED VERTICAL', 'DASHED HORIZONTAL'])) add('box-drawing');
  if (block.includes('SUPERSCRIPTS') || block.includes('SUPERSCRIPT') || hasAny(name, ['SUPERSCRIPT', 'SUBSCRIPT'])) add('superscripts-subscripts');
  if (hasAny(name, ['CIRCLE', 'CIRCLED', 'RING', 'BULLSEYE']) || (symbol.codePoint >= 0x24B6 && symbol.codePoint <= 0x24FF)) add('circles');
  if (block.includes('MUSICAL') || block.includes('MUSIC') || hasAny(name, ['MUSIC', 'NOTE', 'CLEF', 'MUSICAL', 'REST'])) add('music');
  if (block.includes('CHESS') || block.includes('MAHJONG') || block.includes('DOMINO') || block.includes('PLAYING CARDS') || hasAny(name, ['CHESS', 'MAHJONG', 'DOMINO', 'PLAYING CARD', 'GAME DIE', 'GAME PIECE'])) add('games-chess');
  if (hasAny(name, ['ZODIAC', 'ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORN', 'AQUARIUS', 'PISCES', 'PLANET', 'ORBIT', 'COMET'])) add('astronomy-zodiac');
  if (hasAny(name, ['CROSS', 'RELIGIOUS', 'RELIGION', 'STAR AND CRESCENT', 'YIN YANG', 'PEACE', 'ATOM', 'DHARMA', 'OM SYMBOL', 'MENORAH', 'ANKH', 'FLEUR-DE-LIS', 'TRIDENT EMBLEM'])) add('religion-culture');
  if (hasAny(name, ['CLOUD', 'RAIN', 'SNOW', 'SUN', 'MOON', 'LIGHTNING', 'UMBRELLA', 'FIRE', 'WATER', 'LEAF', 'FLOWER', 'EARTH', 'MOUNTAIN', 'WIND', 'WAVE', 'WEATHER', 'SNOWFLAKE'])) add('weather-nature');
  if (hasAny(name, ['CHECK', 'CROSS MARK', 'WARNING', 'PROHIBITED', 'RADIOACTIVE', 'BIOHAZARD', 'NO ENTRY', 'ERROR', 'STATUS', 'HEAVY CHECK', 'BALLOT BOX'])) add('checks-status');
  if (block.includes('MISCELLANEOUS TECHNICAL') || hasAny(name, ['KEY', 'COMMAND', 'OPTION', 'ENTER', 'BACKSPACE', 'DELETE', 'EJECT', 'PLAY', 'PAUSE', 'POWER', 'RECORD', 'HOME', 'END', 'TAB', 'SHIFT', 'CONTROL', 'ALT', 'ESCAPE', 'RETURN', 'PRINT'])) add('ui-keyboard');
  if (block.includes('DINGBATS') || hasAny(name, ['STAR', 'SPARKLE', 'ORNAMENT', 'ASTERISK', 'DECORATION', 'SPARKLES', 'FLOWER', 'SNOWFLAKE', 'BULLET'])) add('stars-decoration');

  if (categories.length === 0) add('other');
  return categories.sort((a, b) => {
    const aPriority = CATEGORY_DEFINITIONS.find((item) => item.id === a)?.priority ?? 0;
    const bPriority = CATEGORY_DEFINITIONS.find((item) => item.id === b)?.priority ?? 0;
    return bPriority - aPriority;
  });
}
