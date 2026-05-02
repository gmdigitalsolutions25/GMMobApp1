/**
 * Feature flag for Design V2 (Showroom Floor theme).
 *
 * How it works:
 * - In `preview-v2` EAS builds, EXPO_PUBLIC_DESIGN_V2 is set to "true"
 * - In all other builds (preview, production), it defaults to false
 * - This means current users are NEVER affected
 *
 * Usage in any screen:
 *   import { useDesignV2 } from '@/hooks/useDesignV2';
 *   const isV2 = useDesignV2();
 *   return isV2 ? <HomeScreenV2 /> : <HomeScreen />;
 */
import { useApp } from '@/providers/AppProvider';

export function useDesignV2(): { isV2: boolean; theme: 'light' | 'dark' } {
  const isV2 = process.env.EXPO_PUBLIC_DESIGN_V2 === 'true';
  // Get user's theme preference from AppProvider
  // Falls back to 'light' for v2 builds, 'dark' for v1 builds
  const defaultTheme: 'light' | 'dark' = isV2 ? 'light' : 'dark';
  const { user } = useApp();
  const theme = (user?.theme as 'light' | 'dark') || defaultTheme;
  return { isV2, theme };
}

/**
 * Design V2 color palette — "Showroom Floor" theme.
 * Light mode: premium white/off-white with glass overlays
 * Dark mode: "Dark Cockpit" — same layout, dark background
 */
export const ColorsV2 = {
  dark: {
    background: '#1A1A1A',
    surface: '#2A2A2A',
    surfaceElevated: '#333333',
    border: '#3A3A3A',
    borderLight: '#2A2A2A',

    primary: '#F24141',
    primaryDark: '#D63030',
    primaryLight: '#F56565',

    accent: '#F24141',
    accentDark: '#D63030',
    warning: '#F59E0B',
    error: '#EF4444',

    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textTertiary: '#6B6B6B',

    success: '#22C55E',
    info: '#F24141',

    // V2-specific
    heroOverlay: 'transparent',
    cardGlow: 'rgba(242,65,65,0.1)',
    gaugeGreen: '#22C55E',
    gaugeAmber: '#F59E0B',
    gaugeRed: '#EF4444',
  },

  light: {
    background: '#F8F8F8',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    primary: '#F24141',
    primaryDark: '#D63030',
    primaryLight: '#F56565',

    accent: '#F24141',
    accentDark: '#D63030',
    warning: '#F59E0B',
    error: '#EF4444',

    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',

    success: '#22C55E',
    info: '#F24141',

    // V2-specific
    heroOverlay: 'transparent',
    cardGlow: 'rgba(242,65,65,0.05)',
    gaugeGreen: '#22C55E',
    gaugeAmber: '#F59E0B',
    gaugeRed: '#EF4444',
  },
};
