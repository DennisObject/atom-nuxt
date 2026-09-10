export function accessDestination(
  path: string,
  requiresAuth: boolean,
  session: {
    user: { requires_two_factor?: boolean } | null;
    restriction: string;
  },
): string | undefined {
  if (session.restriction === "account_banned") {
    return path === "/banned" || path.startsWith("/help-center")
      ? undefined
      : "/banned";
  }

  if (session.restriction === "maintenance") {
    return ["/login", "/two-factor-challenge", "/maintenance"].includes(path)
      ? undefined
      : "/maintenance";
  }

  if (requiresAuth && !session.user) {
    return "/login";
  }

  if (
    (session.user?.requires_two_factor ||
      session.restriction === "two_factor_required") &&
    !["/user/settings/two-factor", "/settings/two-factor"].includes(path)
  ) {
    return "/user/settings/two-factor";
  }

  if (session.user && ["/", "/login", "/register"].includes(path)) {
    return "/user/me";
  }
}
