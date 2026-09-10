import { computed, reactive, ref, watch } from "vue";
import type { Data } from "~/utils/api";
import { usePage } from "~/composables/usePage";

export function useAuthPage(kindOverride?: () => string | undefined) {
  const { t } = useLocale();

  const { api, request } = useApi();

  const { initialize, session, avatar } = useSession();

  const captcha = ref<Record<string, string>>({});

  const route = useRoute();

  const router = useRouter();

  const { busy, error, fields, success, run } = usePage();

  const kind = computed(() =>
    String(kindOverride?.() || route.meta.authKind || "login"),
  );

  const form = reactive({
    username: "",
    mail: "",
    password: "",
    password_confirmation: "",
    terms: false,
    code: "",
    recovery_code: "",
    beta_code: "",
    referral_code: String(route.params.referral || route.query.referral || ""),
  });

  const loginAvatar = ref("/assets/images/dusk/ghost.png");

  watch(
    () => form.username,
    (username, _, cleanup) => {
      if (kind.value !== "login") {
        return;
      }

      let active = true;

      const timer = setTimeout(async () => {
        if (!username) {
          loginAvatar.value = "/assets/images/dusk/ghost.png";

          return;
        }

        try {
          const result = await api<Data<"PublicUser">>(
            `/users/${encodeURIComponent(username)}`,
          );

          if (active) {
            loginAvatar.value = avatar(result.data, {
              direction: 4,
              action: "wav",
            });
          }
        } catch {
          if (active) {
            loginAvatar.value = "/assets/images/dusk/ghost.png";
          }
        }
      }, 200);

      cleanup(() => {
        active = false;

        clearTimeout(timer);
      });
    },
  );

  async function submit() {
    await run(
      async () => {
        if (kind.value === "forgot") {
          await request("/forgot-password", "POST", {
            mail: form.mail,
            ...captcha.value,
          });

          return;
        }

        if (kind.value === "reset") {
          await request(
            `/reset-password/${encodeURIComponent(String(route.params.token))}`,
            "POST",
            {
              password: form.password,
              password_confirmation: form.password_confirmation,
              ...captcha.value,
            },
          );

          await router.push("/login");

          return;
        }

        const path =
          kind.value === "challenge"
            ? "/two-factor-challenge"
            : `/${kind.value}`;

        const payload =
          kind.value === "challenge"
            ? form.recovery_code.trim() !== ""
              ? { recovery_code: form.recovery_code }
              : { code: form.code }
            : { ...form, ...captcha.value };

        const result = await request(path, "POST", payload);

        form.password = "";

        form.password_confirmation = "";

        if (result.two_factor) {
          await router.push({
            path: "/two-factor-challenge",
            query: route.query,
          });

          return;
        }

        await initialize();

        await router.push(
          typeof route.query.next === "string" &&
            route.query.next.startsWith("/") &&
            !route.query.next.startsWith("//")
            ? route.query.next
            : "/user/me",
        );
      },
      kind.value === "forgot"
        ? "If an account matches that email address, a password reset link will arrive shortly."
        : "",
    );
  }

  return {
    t,
    kind,
    session,
    form,
    captcha,
    loginAvatar,
    busy,
    error,
    fields,
    success,
    submit,
  };
}
