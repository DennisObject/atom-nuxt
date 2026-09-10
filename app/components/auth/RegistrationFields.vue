<script setup lang="ts">
import AuthField from "~/components/auth/AuthField.vue";
const form = defineModel<ReturnType<typeof useAuthPage>["form"]>({
  required: true,
});
const { t } = useLocale();
const { session } = useSession();
const { theme } = useAppConfig();
const atom = theme.name === "atom";
const hotel = computed(() => session.bootstrap.hotel_name || "Atom Hotel");
</script>

<template>
  <AuthField
    v-model="form.username"
    name="username"
    autocomplete="username"
    :label="t('Username')"
    :placeholder="t(atom ? 'Username' : 'Enter your username')"
    :description="
      atom
        ? t(
            'Your username is what you will have to use, when logging into :hotel. It is also what other users will know you as, so make sure you select a username that you like!',
            { hotel },
          )
        : undefined
    "
    required
  />
  <div :class="{ 'mt-4': atom }">
    <AuthField
      v-model="form.mail"
      name="mail"
      type="email"
      autocomplete="email"
      :label="t('Email')"
      :placeholder="t(atom ? 'Enter your email' : 'Enter your e-mail')"
      :description="
        atom
          ? t(
              'You will need your email if you were to ever forget your password, so make sure it is something that you remember.',
            )
          : undefined
      "
      required
    />
  </div>
  <div
    :class="
      atom
        ? 'mt-4 flex flex-col gap-y-6 rounded-md bg-[#efefef] p-3 dark:bg-gray-900'
        : 'contents'
    "
  >
    <AuthField
      v-model="form.password"
      name="password"
      type="password"
      autocomplete="new-password"
      :label="t('Password')"
      :placeholder="
        t(atom ? 'Choose a secure password' : 'Enter your password')
      "
      :description="
        atom
          ? t(
              'Your password must contain atleast 8 characters. Make sure to use a unique & secure password.',
            )
          : undefined
      "
      required
    />
    <hr v-if="atom" class="dark:border-gray-700" />
    <AuthField
      v-model="form.password_confirmation"
      name="password_confirmation"
      type="password"
      autocomplete="new-password"
      :label="t('Repeat Password')"
      :placeholder="
        t(atom ? 'Repeat your chosen password' : 'Confirm your password')
      "
      required
    />
  </div>
  <div
    v-if="session.bootstrap.registration?.requires_beta_code"
    :class="{ 'mt-4': atom }"
  >
    <AuthField
      v-model="form.beta_code"
      name="beta_code"
      :label="t('Beta code')"
      :description="
        atom ? t('Enter the beta code you have been provided with') : undefined
      "
      :placeholder="t('Beta code')"
      required
    />
  </div>
  <div
    :class="
      atom
        ? 'mt-4 flex flex-col gap-y-1 rounded-md bg-[#efefef] p-3 dark:bg-gray-900'
        : '-mt-1'
    "
  >
    <label
      class="flex items-center gap-3 text-[14px] leading-normal font-semibold"
      :class="atom ? 'text-gray-700 dark:text-gray-500' : 'text-white'"
    >
      <input
        v-model="form.terms"
        name="terms"
        type="checkbox"
        class="mt-1 size-4 shrink-0 rounded focus:ring-0"
        required
      />
      <NuxtLink to="/help-center/rules" target="_blank" class="mt-1">
        {{ t("I accept the :hotel terms & rules.", { hotel }) }}
      </NuxtLink>
    </label>
  </div>
</template>
