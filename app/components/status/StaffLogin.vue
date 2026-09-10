<script setup lang="ts">
import { ref } from "vue";

const { t } = useLocale();
const { api, request } = useApi();
const { session, refreshUser } = useSession();
const { busy, error, fields, run } = usePage();
const loginDialog = ref<HTMLDialogElement>();
const username = ref("");
const password = ref("");
const captcha = ref<Record<string, string>>({});

async function login() {
  await run(async () => {
    const result = await request<{ two_factor?: boolean }>("/login", "POST", {
      username: username.value,
      password: password.value,
      ...captcha.value,
    });
    password.value = "";
    loginDialog.value?.close();
    if (result.two_factor) {
      await navigateTo({
        path: "/two-factor-challenge",
        query: { next: "/user/me" },
      });
      return;
    }
    session.bootstrap = (
      await api<typeof session.bootstrap>("/bootstrap")
    ).data;
    await refreshUser();
    if (session.restriction !== "maintenance") {
      await navigateTo("/user/me");
    }
  });
}
</script>

<template>
  <button
    v-if="!session.user"
    class="absolute top-6 right-6 z-50 rounded-full border-0 bg-white/70 px-4 py-2 font-semibold text-black transition-colors duration-200 ease-in-out hover:bg-white hover:text-black hover:filter-none"
    @click="loginDialog?.showModal()"
  >
    {{ t("Staff login") }}
  </button>
  <dialog
    ref="loginDialog"
    class="relative m-auto w-[calc(100%-32px)] max-w-xl rounded border-0 bg-[var(--header)] px-6 py-6 text-[var(--text)] backdrop:bg-black/50 lg:max-w-2xl lg:px-8"
    :aria-label="t('Staff login')"
    @click="$event.target === loginDialog && loginDialog?.close()"
  >
    <button
      class="absolute top-3 right-2.5 border-0 bg-transparent px-1.5 py-0 text-2xl text-[var(--text-subtle)]"
      :aria-label="t('Close modal')"
      @click="loginDialog?.close()"
    >
      ×
    </button>
    <header class="my-4 flex flex-col items-center">
      <h2 class="text-2xl leading-8 font-semibold">{{ t("Hello!") }}</h2>
      <p>
        {{
          t("There is currently :online users online", {
            online: session.bootstrap.online_count,
          })
        }}
      </p>
    </header>
    <AppNotice :teleport="false" :error="error" :fields="fields" />
    <form class="flex flex-col gap-3" @submit.prevent="login">
      <label>
        {{ t("Username") }}
        <input
          v-model="username"
          name="username"
          autocomplete="username"
          :placeholder="t('Username')"
          required
          class="focus:ring-0 border-2 border-[var(--border)] rounded bg-[var(--header)] focus:border-[#eeb425] w-full text-[var(--text)]"
        />
      </label>
      <label>
        {{ t("Password") }}
        <input
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          :placeholder="t('Password')"
          required
          class="focus:ring-0 border-2 border-[var(--border)] rounded bg-[var(--header)] focus:border-[#eeb425] w-full text-[var(--text)]"
        />
      </label>
      <AppCaptcha v-model="captcha" :busy="busy" />
      <button
        :disabled="busy"
        class="w-full rounded bg-[#eeb425] text-white p-2 border-2 border-yellow-400 hover:bg-[#d49f1c] font-semibold"
      >
        {{ t("Login") }}
      </button>
      <NuxtLink
        to="/forgot-password"
        class="text-center text-sm font-semibold text-gray-400 hover:underline"
      >
        {{ t("Did you forget your password?") }}
      </NuxtLink>
      <NuxtLink
        to="/register"
        class="text-center text-sm font-semibold text-gray-400 hover:underline"
      >
        {{ t("Dont have an account? Join now!") }}
      </NuxtLink>
    </form>
  </dialog>
</template>
