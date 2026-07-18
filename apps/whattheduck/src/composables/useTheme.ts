import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { StatusBar, Style } from '@capacitor/status-bar';
import { usePreferredDark } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';
const DARK_CLASS = 'ion-palette-dark';

// Background colors kept in sync with variables.scss so the native status bar
// matches the WebView on Android (where the status bar has its own background).
const DARK_BACKGROUND = '#303030';
const LIGHT_BACKGROUND = '#ffffff';

// Module-scoped singletons so every caller shares the same reactive state.
const preference = ref<ThemePreference>('system');
const prefersDark = usePreferredDark();

const isDark = computed(() => (preference.value === 'system' ? prefersDark.value : preference.value === 'dark'));

const applyDarkClass = (dark: boolean) => {
  document.documentElement.classList.toggle(DARK_CLASS, dark);
};

const applyStatusBar = async (dark: boolean) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }
  try {
    // Style.Dark => light icons (for a dark bar), Style.Light => dark icons.
    await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: dark ? DARK_BACKGROUND : LIGHT_BACKGROUND });
    }
  } catch (e) {
    console.info('Failed to update status bar style', e);
  }
};

// Keep the DOM and native chrome in sync with the resolved theme.
watch(
  isDark,
  (dark) => {
    applyDarkClass(dark);
    void applyStatusBar(dark);
  },
  { immediate: true },
);

export const loadThemePreference = async () => {
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  if (value === 'system' || value === 'light' || value === 'dark') {
    preference.value = value;
  }
};

export const setThemePreference = async (value: ThemePreference) => {
  preference.value = value;
  await Preferences.set({ key: STORAGE_KEY, value });
};

export const useTheme = () => ({
  preference,
  isDark,
  setThemePreference,
});
