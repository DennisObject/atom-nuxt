<script setup lang="ts">
import type { Data } from "~/utils/api";
const { t } = useLocale();
const { mediaUrl } = useApi();
defineProps<{ article: Data<"Article"> }>();
</script>
<template>
  <article
    class="article-tile"
    :style="{ backgroundImage: `url('${mediaUrl(article.image)}')` }"
  >
    <div class="article-tile-caption">
      <h2>{{ article.title }}</h2>
      <div class="article-tile-meta">
        <span class="article-author"
          ><svg
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
            /></svg
          >{{ article.author?.username }}</span
        >
        <NuxtLink
          :to="`/community/article/${article.slug}`"
          class="read-more-link"
          >{{ t("Read more") }}</NuxtLink
        >
      </div>
    </div>
  </article>
</template>
