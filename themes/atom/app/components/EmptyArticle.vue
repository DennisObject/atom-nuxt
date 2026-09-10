<script setup lang="ts">
const { t } = useLocale();
const { session, avatar } = useSession();
</script>

<template>
  <article
    class="relative h-[210px] w-full overflow-hidden rounded bg-white shadow-sm dark:bg-gray-900"
  >
    <div
      class="mb-5 block h-[100px] w-full bg-[url(https://i.imgur.com/uGLDOUu.png)] bg-position-[300px_220px]"
    ></div>
    <div class="mt-4 px-4">
      <h2 class="truncate text-lg font-semibold dark:text-gray-200">
        {{ t("No published articles") }}
      </h2>
      <div class="flex items-center gap-x-2">
        <div
          class="mt-3 flex size-10 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <img :src="avatar()" alt="" />
        </div>
        <p class="mt-4 font-semibold dark:text-gray-400">
          {{ session.bootstrap.hotel_name }}
        </p>
      </div>
    </div>
  </article>
</template>
