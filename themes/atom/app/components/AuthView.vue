<script setup lang="ts">
import AuthForm from "~/components/AuthForm.vue";
import { BaseCard } from "#components";

const { t } = useLocale();

const route = useRoute();

const { session } = useSession();

const kind = computed(() => String(route.meta.authKind || "login"));

const isHome = computed(() => route.path === "/");

const titles: Record<string, string> = {
  login: "Login",
  register: "Create your account!",
  challenge: "Two-factor authentication",
  forgot: "Forgot your password?",
  reset: "Choose a new password",
};

useSeoMeta({
  title: () =>
    isHome.value
      ? t("Welcome to the best hotel on the web!")
      : t(titles[kind.value] || "Login"),
});
</script>

<template>
  <div v-if="isHome" class="space-y-14">
    <GuestNews />

    <GuestPhotos />
  </div>

  <div v-else :class="{ 'lg:px-[250px]': kind !== 'register' }">
    <BaseCard
      :class="{ 'gap-y-8!': kind === 'register' }"
      :title="
        kind === 'login'
          ? t('Login to :hotel', { hotel: session.bootstrap.hotel_name })
          : t(titles[kind] || 'Login')
      "
      :subtitle="
        kind === 'register'
          ? t('Create a free account, and be a part of a fun online world!')
          : kind === 'login'
            ? t(
                'Login to :hotel and take part in the most wonderful online world!',
                { hotel: session.bootstrap.hotel_name },
              )
            : ''
      "
      icon="hotel-icon"
    >
      <div class="flex w-full justify-between">
        <div class="w-full">
          <AuthForm />
        </div>

        <div v-if="kind === 'register'" class="relative hidden w-full md:block">
          <img
            class="absolute -right-3 -bottom-3 opacity-50"
            src="/assets/images/atom/hotel.png"
            alt=""
          />
        </div>
      </div>
    </BaseCard>
  </div>
</template>
