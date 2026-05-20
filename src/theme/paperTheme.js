import { MD3DarkTheme } from 'react-native-paper';
import { colors, radii } from './tokens';

/**
 * react-native-paper Material 3 dark theme tuned to the S-MIB palette.
 * The screens use mostly custom components for the role-specific gradients
 * and the podium; Paper handles inputs, buttons, dialogs, snackbars, etc.
 */
export const paperTheme = {
  ...MD3DarkTheme,
  roundness: radii.lg,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.teal,
    onPrimary: colors.white,
    primaryContainer: colors.tealLight,
    onPrimaryContainer: colors.navy,
    secondary: colors.yellow,
    onSecondary: colors.navy,
    tertiary: colors.cyan,
    background: colors.navy,
    onBackground: colors.white,
    surface: colors.navyLight,
    onSurface: colors.white,
    surfaceVariant: colors.glass,
    onSurfaceVariant: colors.textMuted,
    outline: colors.border,
    error: colors.red,
  },
};
