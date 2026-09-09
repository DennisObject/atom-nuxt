export function useThemeMode() {
  const theme = useAppConfig().theme;
  const preference = useCookie<"light" | "dark">("atom-color-mode", {
    default: () => (theme.defaultMode === "dark" ? "dark" : "light"),
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  const mode = computed(() =>
    theme.name === "dusk" || preference.value === "dark" ? "dark" : "light"
  );
  const isDark = computed(() => mode.value === "dark");
  function toggleMode() {
    if (theme.name === "atom") {
      preference.value = isDark.value ? "light" : "dark";
    }
  }
  return { mode, isDark, toggleMode };
}
