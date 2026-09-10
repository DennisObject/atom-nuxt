const dictionaries = import.meta.glob<{ default: Record<string, string> }>(
  "../locales/*.json",
);

export function useLocale() {
  const preference = useCookie<string>("atom-locale", {
    default: () => "en",
    sameSite: "lax",
    maxAge: 31536000,
  });
  const locale = useState("locale", () => preference.value);
  const messages = useState<Record<string, string>>("translations", () => ({}));

  async function setLocale(value: string): Promise<void> {
    const loader = dictionaries[`../locales/${value}.json`];
    if (!loader) {
      return;
    }
    messages.value = (await loader()).default;
    locale.value = value;
    preference.value = value;
  }

  function t(
    message: string,
    replacements: Record<string, string | number> = {},
  ): string {
    let result = messages.value[message] || message;
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replaceAll(`:${key}`, String(value));
    }
    return result;
  }

  return { locale, setLocale, t };
}
