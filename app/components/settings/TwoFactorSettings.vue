<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import SettingsField from "~/components/settings/SettingsField.vue";
import AppNotice from "~/components/AppNotice.vue";
import type { Data } from "~/utils/api";
import DOMPurify from "isomorphic-dompurify";
import { ApiError } from "~/utils/api";
import AppCaptcha from "~/components/AppCaptcha.vue";

const { t } = useLocale();
const { theme } = useAppConfig();
const { api, request } = useApi();
const { session, refreshUser } = useSession();
const { busy, error, fields, success, run } = usePage();

const form = reactive({ current_password: "", code: "" });
const captcha = ref<Record<string, string>>({});
const twoFactor = ref<Partial<Data<"TwoFactor">>>({});
const passwordRequired = ref(false);

const qr = computed(() =>
  DOMPurify.sanitize(twoFactor.value.qr_code || "", {
    USE_PROFILES: { svg: true },
    FORBID_TAGS: ["foreignObject", "style"],
    FORBID_ATTR: ["style"],
  }),
);

async function loadTwoFactor() {
  try {
    twoFactor.value = (await api<Data<"TwoFactor">>("/me/two-factor")).data;
    passwordRequired.value = false;
  } catch (failure) {
    if (failure instanceof ApiError && failure.status === 423) {
      passwordRequired.value = true;
    } else {
      throw failure;
    }
  }
}

onMounted(() => run(loadTwoFactor));

async function confirmPassword() {
  await run(async () => {
    await request("/user/confirm-password", "POST", {
      password: form.current_password,
    });
    form.current_password = "";
    await loadTwoFactor();
  });
}

async function changeTwoFactor(action: "enable" | "confirm" | "disable") {
  await run(
    async () => {
      const endpoint = "/user/settings/two-factor-authentication";
      if (action === "confirm") {
        await request(`${endpoint}/confirm`, "POST", {
          code: form.code,
          ...captcha.value,
        });
        form.code = "";
      } else {
        await request(endpoint, action === "enable" ? "POST" : "DELETE", {
          current_password: form.current_password,
        });
      }
      form.current_password = "";
      await loadTwoFactor();
      await refreshUser();
    },
    action === "confirm"
      ? "Two-factor authentication is enabled. Keep your recovery codes safe."
      : action === "disable"
        ? "Two-factor authentication is disabled."
        : "",
  );
}
</script>

<template>
  <AppNotice :error="error" :fields="fields" :success="success" />
  <form
    class="flex flex-col gap-3"
    v-if="passwordRequired"
    @submit.prevent="confirmPassword"
  >
    <p>
      {{ t("Confirm your password to view your security settings.") }}
    </p>
    <SettingsField
      compact
      :label="t('Current password')"
      v-model="form.current_password"
      type="password"
      autocomplete="current-password"
      required
    />
    <button
      class="w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white enabled:hover:bg-green-700"
      :class="{ 'px-6 py-2': theme.name === 'atom' }"
      :disabled="busy"
    >
      {{ t("Confirm password") }}
    </button>
  </form>
  <form
    class="flex flex-col gap-3"
    v-else-if="twoFactor.enabled"
    @submit.prevent="changeTwoFactor('disable')"
  >
    <SettingsField
      compact
      :label="t('Current password')"
      v-model="form.current_password"
      type="password"
      autocomplete="current-password"
      required
    />
    <button
      class="w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white enabled:hover:bg-green-700 border-red-400! bg-red-500! enabled:hover:bg-red-600!"
      :class="{ 'px-6 py-2': theme.name === 'atom' }"
      :disabled="busy"
    >
      {{ t("Disable 2FA") }}
    </button>
  </form>
  <template v-else-if="twoFactor.qr_code">
    <p>
      {{
        t(
          "Validate your two-factor enabling by scanning the following QR-code and enter your auto-generated 2-factor code from your phone.",
        )
      }}
    </p>
    <div
      class="mt-4 flex flex-wrap self-center gap-4 rounded bg-gray-100 px-4 py-2 text-black md:flex-nowrap md:gap-8"
    >
      <div
        class="max-w-[260px] bg-transparent p-0 [&_svg]:h-auto [&_svg]:max-w-full"
        v-html="qr"
      ></div>
      <div>
        <strong>{{ t("Recovery codes:") }}</strong>
        <ul>
          <li v-for="code in twoFactor.recovery_codes" :key="code">
            {{ code }}
          </li>
        </ul>
      </div>
    </div>
    <p
      class="mt-2 max-w-[480px] self-center text-xs font-bold text-red-500 italic"
    >
      {{
        t(
          "Please save your recovery codes somewhere safe! If you lose access to your 2FA codes, those recovery codes will be needed to regain access your account.",
        )
      }}
    </p>
    <form
      class="mt-8 flex flex-col gap-4"
      @submit.prevent="changeTwoFactor('confirm')"
    >
      <SettingsField
        compact
        :label="t('Code')"
        :description="
          t(
            'Please scan the QR-code above with your phone to retrieve your two-factor authentication code.',
          )
        "
        v-model="form.code"
        inputmode="numeric"
        autocomplete="one-time-code"
        :placeholder="t('Code')"
        required
      />
      <AppCaptcha
        v-if="
          session.bootstrap.captcha?.recaptcha_enabled ||
          session.bootstrap.captcha?.turnstile_enabled
        "
        v-model="captcha"
        :busy="busy"
      />
      <button
        class="w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white enabled:hover:bg-green-700"
        :class="{ 'px-6 py-2': theme.name === 'atom' }"
        :disabled="busy"
      >
        {{ t("Verify 2FA") }}
      </button>
    </form>
  </template>
  <template v-else>
    <div class="flex w-full flex-col gap-y-3 dark:text-gray-100">
      <p>
        {{
          t(
            "Here at :hotel we take security very serious and therefore we offer you as a user a way to secure your beloved account even further, by allowing you to enable Googles 2-factor authentication!",
            { hotel: session.bootstrap.hotel_name },
          )
        }}
      </p>
      <p>
        {{
          t(
            "2-factor authentication adds an extra layer of security to your account, making it physical impossible to access it without having access to your mobile phone as only your phone will contain the 2-factor authentication code which will be re-generated every 30 seconds automatically",
          )
        }}
      </p>
    </div>
    <form
      class="mt-8 flex flex-col gap-3 self-end"
      @submit.prevent="changeTwoFactor('enable')"
    >
      <SettingsField
        compact
        :label="t('Current password')"
        v-model="form.current_password"
        type="password"
        autocomplete="current-password"
        required
      />
      <button
        class="w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white enabled:hover:bg-green-700"
        :class="{ 'px-6 py-2': theme.name === 'atom' }"
        :disabled="busy"
      >
        {{ t("Activate 2FA") }}
      </button>
    </form>
  </template>
</template>
