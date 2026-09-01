import { BrushSizeOption, SkyPreset, StickerItem, UITheme } from '../types';

export const THEME_CONFIGS: Record<UITheme, {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgDark: string;
  border: string;
  shadow: string;
}> = {
  periwinkle: {
    name: 'Periwinkle Pop',
    primary: '#8FA2FA',
    secondary: '#FFE600',
    accent: '#FF70B8',
    bgDark: '#1B1B4B',
    border: '#000000',
    shadow: '#1B1B4B',
  },
  cotton_candy: {
    name: 'Cotton Candy',
    primary: '#FFB6D9',
    secondary: '#7CE8FF',
    accent: '#FFF176',
    bgDark: '#2E173D',
    border: '#000000',
    shadow: '#2E173D',
  },
  mint_splash: {
    name: 'Mint Splash',
    primary: '#75F0C2',
    secondary: '#FF8A65',
    accent: '#BA68C8',
    bgDark: '#123D33',
    border: '#000000',
    shadow: '#123D33',
  },
  cyber_twilight: {
    name: 'Cyber Twilight',
    primary: '#2A2D4A',
    secondary: '#00FFA3',
    accent: '#FF007F',
    bgDark: '#0E0F1D',
    border: '#000000',
    shadow: '#000000',
  },
};

export const CANDY_SWATCHES: string[] = [
  '#FF2A6D', // Bubblegum Pink
  '#FF70B8', // Rose Pop
  '#FF9E00', // Neon Mango
  '#FFE600', // Sunny Banana
  '#05FFA1', // Mint Lime
  '#00F0FF', // Cyan Spark
  '#7A5CFF', // Electric Violet
  '#B042FF', // Grape Soda
  '#FF4365', // Cherry Candy
  '#FF85A1', // Peach Cream
  '#FFB703', // Marigold
  '#70E000', // Kiwi Fizz
  '#00B4D8', // Lagoon Blue
  '#3A86FF', // Sapphire Pop
  '#FFFFFF', // Marshmallow White
  '#2B2D42', // Obsidian Licorice
];

export const BRUSH_SIZES: BrushSizeOption[] = [
  { id: 'sm', name: 'Small', radius: 0.04, label: '4mm' },
  { id: 'med', name: 'Medium', radius: 0.09, label: '10mm' },
  { id: 'lg', name: 'Large', radius: 0.16, label: '18mm' },
  { id: 'huge', name: 'Huge', radius: 0.25, label: '28mm' },
  { id: 'jumbo', name: 'Jumbo', radius: 0.38, label: '40mm' },
];

export const STICKER_CATALOG: StickerItem[] = [
  { id: 'star_gold', name: 'Magic Star', emoji: '⭐', scale: 0.28 },
  { id: 'sparkle_4p', name: 'Retro Sparkle', emoji: '✨', scale: 0.28 },
  { id: 'heart_pink', name: 'Sweet Heart', emoji: '💖', scale: 0.28 },
  { id: 'rainbow_arc', name: 'Rainbow', emoji: '🌈', scale: 0.35 },
  { id: 'eyes_googly', name: 'Googly Eyes', emoji: '👀', scale: 0.3 },
  { id: 'comic_pow', name: 'Comic POW!', emoji: '💥', scale: 0.35 },
  { id: 'bolt_lightning', name: 'Zap Bolt', emoji: '⚡', scale: 0.3 },
  { id: 'donut_sprinkles', name: 'Yummy Donut', emoji: '🍩', scale: 0.3 },
  { id: 'cat_paw', name: 'Kitty Paw', emoji: '🐾', scale: 0.28 },
  { id: 'diamond_gem', name: 'Shiny Gem', emoji: '💎', scale: 0.28 },
  { id: 'sun_smile', name: 'Sunny Face', emoji: '🌞', scale: 0.32 },
  { id: 'fire_flame', name: 'Fire Flame', emoji: '🔥', scale: 0.3 },
  { id: 'sunglasses_cool', name: 'Cool Shades', emoji: '🕶️', scale: 0.3 },
  { id: 'party_popper', name: 'Party Popper', emoji: '🎉', scale: 0.3 },
  { id: 'cherry_fruit', name: 'Sweet Cherry', emoji: '🍒', scale: 0.28 },
  { id: 'alien_ufo', name: 'Alien Friend', emoji: '🛸', scale: 0.35 },
];

export const SKY_PRESETS: SkyPreset[] = [
  {
    id: 'ghibli_summer',
    name: 'Ghibli Summer Day',
    timeOfDay: 0.45,
    skyTop: '#4B88FF',
    skyBottom: '#CBE4FF',
    sunColor: '#FFF4D0',
    ambientColor: '#E6F0FF',
    cloudColor: '#FFFFFF',
    description: 'Sunlit sky, fluffy volumetric clouds and warm god rays',
    icon: '☀️',
  },
  {
    id: 'golden_sunset',
    name: 'Golden Sunset',
    timeOfDay: 0.78,
    skyTop: '#8A2BE2',
    skyBottom: '#FF7A00',
    sunColor: '#FF4500',
    ambientColor: '#FFAE73',
    cloudColor: '#FFB085',
    description: 'Saturated orange & pink twilight horizon with anime glow',
    icon: '🌅',
  },
  {
    id: 'midnight_stars',
    name: 'Midnight Moon & Stars',
    timeOfDay: 0.05,
    skyTop: '#080820',
    skyBottom: '#181A45',
    sunColor: '#8CA6FF',
    ambientColor: '#1A2150',
    cloudColor: '#303868',
    description: 'Deep cosmos studded with twinkling stars & cool lunar sheen',
    icon: '🌙',
  },
  {
    id: 'candy_dawn',
    name: 'Candy Cloud Dawn',
    timeOfDay: 0.25,
    skyTop: '#A080E6',
    skyBottom: '#FFB8D0',
    sunColor: '#FFE082',
    ambientColor: '#F2D6FF',
    cloudColor: '#FFE6F0',
    description: 'Pastel lavender & peach skies with alpine morning mist',
    icon: '🌸',
  },
  {
    id: 'cyber_aurora',
    name: 'Cyber Aurora',
    timeOfDay: 0.95,
    skyTop: '#060B1F',
    skyBottom: '#0D353A',
    sunColor: '#00FFA3',
    ambientColor: '#00E5FF',
    cloudColor: '#00FFA3',
    description: 'Fluorescent green & cyan auroral ribbons in neon cosmos',
    icon: '🌌',
  },
];
