<script setup lang="ts">
import type { Data } from "~/utils/api";
import AuthForm from "~/components/AuthForm.vue";

const { t } = useLocale();

const { api } = useApi();

const route = useRoute();

const kind = computed(() => String(route.meta.authKind || "login"));

const titles: Record<string, string> = {
  login: "Login",
  register: "Create a new account",
  challenge: "Two-factor authentication",
  forgot: "Forgot your password?",
  reset: "Choose a new password",
};

useSeoMeta({ title: () => t(titles[kind.value] || "Login") });

const { data: news } = await useAsyncData("auth-news", async () => {
  try {
    return (await api<Data<"Article">[]>("/articles")).data;
  } catch {
    return [];
  }
});

const articles = computed(() =>
  (news.value || []).filter((article) => article.author).slice(0, 4),
);
</script>

<template>
  <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
    <section
      class="flex min-h-[250px] flex-col rounded-xl bg-gray-900/50 px-8 py-6 text-white"
    >
      <h1 class="text-2xl font-normal leading-8">
        {{ t(titles[kind] || "Login") }}
      </h1>

      <AuthForm />
    </section>

    <aside>
      <NewsCarousel :articles="articles" :registration="kind === 'register'" />

      <GuestPhotos v-if="kind === 'register'" compact class="mt-4" />
    </aside>

    <GuestPhotos v-if="kind !== 'register'" class="md:col-span-2" />
  </div>
</template>
