export function useThemeMode() {
  const theme = useAppConfig().theme;

  const { session } = useSession();

  const preference = useCookie<"light" | "dark">("atom-color-mode", {
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  const mode = computed(() => {
    if (theme.name === "dusk") {
      return "dark";
    }

    if (preference.value === "light" || preference.value === "dark") {
      return preference.value;
    }

    return session.bootstrap.color_mode || theme.defaultMode || "light";
  });

  const isDark = computed(() => mode.value === "dark");

  function toggleMode() {
    if (theme.name === "atom") {
      preference.value = isDark.value ? "light" : "dark";
    }
  }

  return { mode, isDark, toggleMode };
}
