<script setup lang="ts">
const { t } = useLocale();
const { session } = useSession();
const route = useRoute();
const dialog = useTemplateRef<HTMLDialogElement>("dialog");
const isOpen = ref(false);

async function open() {
  isOpen.value = true;
  await nextTick();
  dialog.value?.showModal();
}

function close() {
  dialog.value?.close();
  isOpen.value = false;
}

watch(() => route.fullPath, close);
watch(
  () => session.user,
  (user) => {
    if (user) {
      close();
    }
  },
);

defineExpose({ open });
</script>

<template>
  <dialog
    ref="dialog"
    class="relative m-auto max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-xl rounded border-0 bg-white px-6 py-6 text-black shadow-md backdrop:bg-black/50 dark:bg-gray-900 dark:text-gray-200 lg:max-w-2xl lg:px-8"
    :aria-label="t('Login')"
    @close="isOpen = false"
    @click="$event.target === dialog && close()"
  >
    <header class="mb-2 flex flex-col items-center">
      <h2 class="text-2xl font-semibold">{{ t("Hello!") }}</h2>
      <p class="dark:text-gray-400">
        {{
          t("There is currently :online users online", {
            online: session.bootstrap.online_count || 0,
          })
        }}
      </p>
      <button
        class="absolute top-3 right-2.5 ml-auto rounded-lg border-0 bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
        :aria-label="t('Close')"
        @click="close"
      >
        <svg
          class="size-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </header>
    <AuthForm v-if="isOpen" kind="login" in-dialog />
  </dialog>
</template>
