<script setup lang="ts">
import Notice from "~/components/Notice.vue";
import Captcha from "~/components/Captcha.vue";
const props = defineProps<{ kind?: string; inDialog?: boolean }>();
const {
  t,
  kind,
  session,
  form,
  recovery,
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
    <Notice
      :error="error"
      :fields="fields"
      :success="success"
      :teleport="!inDialog"
    />
    <p
      v-if="
        kind === 'register' && session.bootstrap.registration?.enabled === false
      "
      class="notice error"
    >
      {{ t("Registration is currently closed. Please check back soon.") }}
    </p>
    <form @submit.prevent="submit">
      <label v-if="kind === 'login' || kind === 'register'" class="auth-avatar"
        ><span class="sr-only"> {{ t("Username") }} </span
        ><input
          v-model="form.username"
          name="username"
          autocomplete="username"
          :placeholder="t('Enter your username')"
          required /><img v-if="kind === 'login'" :src="loginAvatar" alt=""
      /></label>
      <label v-if="kind === 'register' || kind === 'forgot'"
        ><span class="sr-only"> {{ t("Email address") }} </span
        ><input
          v-model="form.mail"
          name="mail"
          type="email"
          autocomplete="email"
          :placeholder="t('Enter your email')"
          required
      /></label>
      <label v-if="['login', 'register', 'reset'].includes(kind)"
        ><span class="sr-only"> {{ t("Password") }} </span
        ><input
          v-model="form.password"
          name="password"
          type="password"
          :autocomplete="kind === 'login' ? 'current-password' : 'new-password'"
          :placeholder="t('Enter your password')"
          required
      /></label>
      <label v-if="kind === 'register' || kind === 'reset'"
        ><span class="sr-only"> {{ t("Confirm password") }} </span
        ><input
          v-model="form.password_confirmation"
          name="password_confirmation"
          type="password"
          autocomplete="new-password"
          :placeholder="t('Confirm your password')"
          required
      /></label>
      <label
        v-if="
          kind === 'register' &&
          session.bootstrap.registration?.requires_beta_code
        "
      >
        {{ t("Beta code") }}
        <input v-model="form.beta_code" name="beta_code" required
      /></label>
      <label v-if="kind === 'register'" class="check-label"
        ><input v-model="form.terms" type="checkbox" required /><span>
          {{ t("I accept the") }}
          <NuxtLink to="/help-center/rules" target="_blank">
            {{ t("hotel terms & rules") }} </NuxtLink
          >.</span
        ></label
      >
      <template v-if="kind === 'challenge'"
        ><p>
          {{
            t(
              "Enter the code from your authenticator app, or use one of your saved recovery codes."
            )
          }}
        </p>
        <label v-if="!recovery">
          {{ t("Authentication code") }}
          <input
            v-model="form.code"
            name="code"
            inputmode="numeric"
            autocomplete="one-time-code"
            required /></label
        ><label v-else>
          {{ t("Recovery code") }}
          <input
            v-model="form.recovery_code"
            name="recovery_code"
            autocomplete="off"
            required /></label
        ><button
          class="text-button"
          type="button"
          @click="recovery = !recovery"
        >
          {{
            t(recovery ? "Use an authentication code" : "Use a recovery code")
          }}
        </button></template
      >
      <Captcha v-model="captcha" :busy="busy" />
      <div class="grid two-columns">
        <button
          class="gold"
          :disabled="
            busy ||
            (kind === 'register' &&
              session.bootstrap.registration?.enabled === false)
          "
        >
          {{
            t(
              busy
                ? "Please wait…"
                : kind === "challenge"
                ? "Verify"
                : kind === "forgot"
                ? "Send reset link"
                : kind === "reset"
                ? "Save password"
                : kind === "register"
                ? "Register"
                : "Login"
            )
          }}</button
        ><NuxtLink
          class="button secondary"
          :to="kind === 'login' ? '/register' : '/login'"
          >{{ t(kind === "login" ? "Register" : "Back to login") }}</NuxtLink
        >
      </div>
      <NuxtLink v-if="kind === 'login'" class="muted" to="/forgot-password">
        {{ t("Forgot your password?") }}
      </NuxtLink>
    </form>
  </div>
</template>
<style scoped>
.auth-avatar {
  position: relative;
  overflow: hidden;
}
.auth-avatar img {
  position: absolute;
  top: -16px;
  right: 0;
  image-rendering: pixelated;
}
</style>
