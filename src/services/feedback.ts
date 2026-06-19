import * as Haptics from 'expo-haptics';

/**
 * Tactile/audio feedback service.
 *
 * UI components call these intent-named helpers; whether they actually fire is
 * decided by user settings (passed in by the controller), so components stay
 * ignorant of preferences. Audio is intentionally stubbed until sound assets
 * ship — the seam is here so it is a one-file change.
 */
export const feedback = {
  diceRoll(enabled: boolean): void {
    if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  tokenMove(enabled: boolean): void {
    if (enabled) void Haptics.selectionAsync();
  },
  capture(enabled: boolean): void {
    if (enabled)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
  win(enabled: boolean): void {
    if (enabled)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
};
