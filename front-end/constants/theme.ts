/**
 * MediQuick Design System — Colour Tokens
 * Single source of truth for all colours used across the app.
 */

import { Platform } from 'react-native';

// ── Primary tint (legacy compat) ──────────────────────────────────────────────
const tintColorLight = '#00B5AD';
const tintColorDark  = '#fff';

// ── Full MediQuick Palette ────────────────────────────────────────────────────
export const MQ = {
  // Background
  bgLight:    '#F0FAFA',       // page background
  bgWhite:    '#FFFFFF',

  // Teal — primary medical accent
  teal:       '#00B5AD',
  tealLight:  '#E0F7F6',       // icon backgrounds, chips
  tealMid:    '#B2EBEA',
  tealWash:   'rgba(0,181,173,0.10)',   // section top wash
  tealBorder: 'rgba(0,181,173,0.18)',   // card borders
  tealBtn:    'rgba(0,181,173,0.12)',   // header icon button bg

  // Blue
  blue:       '#1976D2',
  blueLight:  '#E3F2FD',

  // Green (vitals / health)
  green:      '#2E7D32',
  greenLight: '#E8F5E9',

  // Red / alert / emergency
  red:        '#E53935',
  redLight:   '#FFEBEE',

  // Amber / warnings
  amber:      '#F57C00',
  amberLight: '#FFF3E0',

  // Purple (AI / records)
  purple:     '#7B1FA2',
  purpleLight:'#F3E5F5',

  // Glass surfaces (frosted cards)
  glassBg:     'rgba(255,255,255,0.75)',
  glassBorder: 'rgba(0,181,173,0.18)',

  // Text
  textPrimary:   '#0D3349',
  textSecondary: '#4A7080',
  textMuted:     '#8AACBA',
} as const;

// ── Legacy Colors (kept for backward compat) ──────────────────────────────────
export const Colors = {
  light: {
    text:            MQ.textPrimary,
    background:      MQ.bgLight,
    tint:            MQ.teal,
    icon:            MQ.textSecondary,
    tabIconDefault:  MQ.textMuted,
    tabIconSelected: MQ.teal,
  },
  dark: {
    text:            '#ECEDEE',
    background:      '#151718',
    tint:            tintColorDark,
    icon:            '#9BA1A6',
    tabIconDefault:  '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
