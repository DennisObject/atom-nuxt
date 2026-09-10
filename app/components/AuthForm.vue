<script setup lang="ts">
import AuthChallengeFields from "~/components/auth/AuthChallengeFields.vue";
import AuthActions from "~/components/auth/AuthActions.vue";
import AppNotice from "~/components/AppNotice.vue";
import AuthField from "~/components/auth/AuthField.vue";
import RegistrationFields from "~/components/auth/RegistrationFields.vue";
import AppCaptcha from "~/components/AppCaptcha.vue";

const { theme } = useAppConfig();

const atom = theme.name === "atom";

const props = defineProps<{ kind?: string; inDialog?: boolean }>();

const {
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
} = useAuthPage(() => props.kind);
</script>

<template>
  <div class="auth-form">
    <AppNotice
      :error="error"
      :fields="fields"
      :success="success"
      :teleport="!inDialog"
    />

    <p
      v-if="
        kind === 'register' && session.bootstrap.registration?.enabled === false
      "
      class="relative m-0 flex items-start gap-3 overflow-hidden rounded-lg border-0 bg-[var(--panel)] p-3 pr-9 text-sm leading-5 shadow-lg error"
    >
      {{ t("Registration is currently closed. Please check back soon.") }}
    </p>

    <form
      class="flex flex-col"
      :class="
        kind === 'challenge' || (atom && kind === 'register')
          ? 'gap-0'
          : !atom
            ? kind === 'register'
              ? 'mt-4 gap-y-3'
              : 'mt-3 gap-y-3'
            : 'gap-y-3'
      "
      @submit.prevent="submit"
    >
      <RegistrationFields v-if="kind === 'register'" :model-value="form" />

      <template v-else>
        <AuthField
          v-if="kind === 'login'"
          v-model="form.username"
          name="username"
          autocomplete="username"
          :label="t('Username')"
          :placeholder="t(atom ? 'Username' : 'Enter your username')"
          :avatar="loginAvatar"
          required
        />

        <AuthField
          v-if="kind === 'forgot'"
          v-model="form.mail"
          name="mail"
          type="email"
          autocomplete="email"
          :label="t('Email')"
          :placeholder="t('Enter your e-mail')"
          required
        />

        <AuthField
          v-if="kind === 'login' || kind === 'reset'"
          v-model="form.password"
          name="password"
          type="password"
          :autocomplete="kind === 'login' ? 'current-password' : 'new-password'"
          :label="t('Password')"
          :placeholder="t(atom ? 'Password' : 'Enter your password')"
          required
        />

        <AuthField
          v-if="kind === 'reset'"
          v-model="form.password_confirmation"
          name="password_confirmation"
          type="password"
          autocomplete="new-password"
          :label="t('Repeat Password')"
          :placeholder="t('Confirm your password')"
          required
        />
      </template>

      <AuthChallengeFields v-if="kind === 'challenge'" :model-value="form" />

      <AppCaptcha v-model="captcha" :busy="busy" />

      <AuthActions
        :kind="kind"
        :busy="busy"
        :disabled="
          busy ||
          (kind === 'register' &&
            session.bootstrap.registration?.enabled === false)
        "
      />
    </form>
  </div>
</template>
