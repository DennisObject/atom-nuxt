import { ApiError, type Data } from "~/utils/api";

type Viewer = Pick<Data<"Me">, "id" | "username"> &
  Partial<Data<"Me">> &
  Partial<NonNullable<Data<"Bootstrap">["viewer"]>>;
export function useSessionState() {
  return useState("session", () => ({
    user: null as Viewer | null,
    bootstrap: {} as Data<"Bootstrap">,
    ready: false,
    restriction: "",
  }));
}
export function useSession() {
  const session = useSessionState().value;
  const { api, safeUrl } = useApi();
  async function initialize(): Promise<void> {
    session.bootstrap = (await api<Data<"Bootstrap">>("/bootstrap")).data;
    session.user = session.bootstrap.viewer;
    await refreshUser();
    if (!session.user && session.bootstrap.maintenance)
      session.restriction = "maintenance";
    session.ready = true;
  }
  async function refreshUser(): Promise<void> {
    try {
      session.user = (await api<Data<"Me">>("/me")).data;
      session.restriction = "";
      if (session.bootstrap.viewer)
        session.bootstrap.viewer.requires_two_factor = false;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401)
        session.user = null;
      else if (
        error instanceof ApiError &&
        ["two_factor_required", "account_banned", "maintenance"].includes(
          error.code
        )
      ) {
        session.restriction = error.code;
        session.bootstrap = (await api<Data<"Bootstrap">>("/bootstrap")).data;
        session.user = session.bootstrap.viewer;
      } else throw error;
    }
  }
  function avatar(
    user?: Partial<Data<"PublicUser">> | null,
    large = false
  ): string {
    if (!user?.look) return "/assets/images/avatar-fallback.png";
    return safeUrl(
      `${session.bootstrap.assets?.avatar || ""}${encodeURIComponent(
        user.look
      )}&direction=2&head_direction=3&gesture=sml&size=${large ? "l" : "m"}`
    );
  }
  return { session, initialize, refreshUser, avatar };
}
