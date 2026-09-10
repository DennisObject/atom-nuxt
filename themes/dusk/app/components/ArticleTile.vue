<script setup lang="ts">
import type { Data } from "~/utils/api";

const { t } = useLocale();
const { mediaUrl } = useApi();
defineProps<{ article: Data<"Article">; registration?: boolean }>();
</script>
<template>
  <article
    class="relative block h-[250px] w-full overflow-hidden rounded-lg bg-cover bg-right"
    :style="{ backgroundImage: `url('${mediaUrl(article.image)}')` }"
  >
    <div
      class="absolute bottom-0 left-0 h-[90px] w-full bg-[#171a23]/95 px-4 py-2 text-white"
    >
      <h2
        class="m-0 font-bold"
        :class="
          registration ? 'text-3xl leading-9' : 'truncate text-xl leading-7'
        "
      >
        {{ article.title }}
      </h2>
      <div
        class="flex items-center justify-between"
        :class="{ 'mt-1': !registration }"
      >
        <span
          class="mt-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-sm leading-5 [&_svg]:size-4"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
          {{ article.author?.username }}
        </span>
        <NuxtLink
          :to="`/community/article/${article.slug}`"
          class="relative z-1 mt-1 text-sm leading-5 hover:text-white hover:underline"
        >
          {{ t("Read more") }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>
