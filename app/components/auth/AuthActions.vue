<script setup lang="ts">
const props = defineProps<{ kind: string; busy: boolean; disabled: boolean }>();
const { t } = useLocale();
const { theme } = useAppConfig();
const atom = theme.name === "atom";
const labels: Record<string, string> = {
  login: "Login",
  register: atom ? "Create account" : "Register",
  challenge: "Verify",
  forgot: "Send reset link",
  reset: "Save password",
};
const layout = computed(() => {
  if (props.kind === "challenge") {
    return "mt-4 flex flex-col";
  }

  if (atom) {
    return props.kind === "register" ? "mt-4 flex flex-col" : "flex flex-col";
  }

  return props.kind === "login"
    ? "mt-4 flex gap-4"
    : "mt-4 grid grid-cols-2 gap-3";
});
</script>

<template>
  <div :class="layout">
    <button
      class="w-full rounded border-2 px-4 py-2 text-white hover:brightness-100"
      :class="
        kind === 'challenge'
          ? 'border-green-500 bg-green-600 font-semibold hover:bg-green-700'
          : atom
            ? 'border-yellow-400 bg-[#eeb425] font-semibold hover:bg-[#d49f1c]'
            : 'rounded-md border-yellow-300 bg-yellow-500 font-normal transition duration-300 ease-in-out hover:scale-[102%]'
      "
      :disabled="disabled"
    >
      {{ t(busy ? "Please wait…" : labels[kind] || "Login") }}
    </button>
    <NuxtLink
      v-if="
        kind !== 'challenge' &&
        (!atom || (kind !== 'login' && kind !== 'register'))
      "
      class="w-full"
      :to="kind === 'login' ? '/register' : '/login'"
    >
      <span
        class="inline-flex w-full items-center justify-center rounded-md border-2 border-gray-600 bg-gray-700 px-4 py-2 font-normal text-white transition duration-300 ease-in-out hover:scale-[102%]"
      >
        {{ t(kind === "login" ? "Register" : "Back to login") }}
      </span>
    </NuxtLink>
  </div>
  <template v-if="kind === 'login' && atom">
    <NuxtLink
      to="/forgot-password"
      class="text-center text-sm font-semibold text-gray-700 dark:text-gray-400"
    >
      {{ t("Did you forget your password?") }}
    </NuxtLink>
    <NuxtLink
      to="/register"
      class="text-center text-sm font-semibold text-gray-700 dark:text-gray-400"
    >
      {{ t("Dont have an account? Join now!") }}
    </NuxtLink>
  </template>
</template>
