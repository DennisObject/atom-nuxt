<script setup lang="ts">
import { reactive, ref } from "vue";
import SettingsField from "~/components/settings/SettingsField.vue";
import AppNotice from "~/components/AppNotice.vue";
import AppCaptcha from "~/components/AppCaptcha.vue";
import type { RecordData } from "~/utils/api";

const { t } = useLocale();

const { theme } = useAppConfig();

const { api } = useApi();

const { session, refreshUser } = useSession();

const { busy, error, fields, success, run } = usePage();

const props = defineProps<{ tab: "account" | "password" }>();

const captcha = ref<Record<string, string>>({});

const form = reactive({
  mail: session.user?.mail || "",
  motto: session.user?.motto || "",
  username: session.user?.username || "",
  current_password: "",
  password: "",
  password_confirmation: "",
});

async function save() {
  await run(async () => {
    if (props.tab === "account") {
      const body: RecordData = {
        mail: form.mail,
        motto: form.motto,
        current_password: form.current_password,
        ...captcha.value,
      };

      if (session.user?.can_change_name) {
        body.username = form.username;
      }

      await api("/me/account", "PUT", body);

      await refreshUser();
    } else {
      await api("/me/password", "PUT", {
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
        ...captcha.value,
      });

      form.password = "";

      form.password_confirmation = "";
    }

    form.current_password = "";
  }, "Your settings have been updated.");
}
</script>

<template>
  <AppNotice :error="error" :fields="fields" :success="success" />

  <form class="flex flex-col gap-4" @submit.prevent="save">
    <template v-if="tab === 'account'">
      <SettingsField
        v-model="form.mail"
        :label="t('E-mail')"
        :description="
          t(
            'Make sure to use an email that you remember, if you ever lose your password, your email will be required.',
          )
        "
        type="email"
        autocomplete="email"
        required
      />

      <SettingsField
        v-if="session.user?.can_change_name"
        v-model="form.username"
        :label="t('Username')"
        :description="
          t('Your username is what you and others will see in-game')
        "
        autocomplete="username"
        required
      />

      <SettingsField
        v-model="form.motto"
        :label="t('Motto')"
        :description="t('Spice up your profile with a nice motto')"
      />
    </template>

    <SettingsField
      v-model="form.current_password"
      :label="t('Current password')"
      :description="
        t(
          tab === 'account'
            ? 'Required to change your e-mail address.'
            : 'Enter your current password',
        )
      "
      type="password"
      autocomplete="current-password"
      :required="tab === 'password'"
    />

    <template v-if="tab === 'password'">
      <SettingsField
        v-model="form.password"
        :label="t('New password')"
        :description="
          t(
            'Enter a new secure password. Do not forget to save it somewhere safe',
          )
        "
        type="password"
        autocomplete="new-password"
        required
      />

      <SettingsField
        v-model="form.password_confirmation"
        :label="t('Confirm new password')"
        :description="t('Please confirm your new password')"
        type="password"
        autocomplete="new-password"
        required
      />
    </template>

    <AppCaptcha
      v-if="
        session.bootstrap.captcha?.recaptcha_enabled ||
        session.bootstrap.captcha?.turnstile_enabled
      "
      v-model="captcha"
      :busy="busy"
    />

    <div class="flex justify-start md:justify-end">
      <button
        class="w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white enabled:hover:bg-green-700 lg:w-1/4"
        :class="{ 'px-6 py-2': theme.name === 'atom' }"
        :disabled="busy"
      >
        {{ t(tab === "password" ? "Update password" : "Update settings") }}
      </button>
    </div>
  </form>
</template>
