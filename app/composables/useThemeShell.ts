import type { InjectionKey } from "vue";

const shellKey: InjectionKey<ReturnType<typeof useSiteShell>> =
  Symbol("site-shell");

export function provideThemeShell() {
  const shell = useSiteShell();
  provide(shellKey, shell);
  return shell;
}

export function useThemeShell() {
  const shell = inject(shellKey);

  if (!shell) {
    throw new Error(
      "Theme shell components must be rendered inside the default layout.",
    );
  }

  return shell;
}
