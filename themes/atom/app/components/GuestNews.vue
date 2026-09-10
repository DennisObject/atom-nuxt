<script setup lang="ts">
import type { Data } from "~/utils/api";
import { ArticleTile } from "#components";

const { t } = useLocale();
const { api } = useApi();

const { data: news } = await useAsyncData("auth-news", async () => {
  try {
    return (await api<Data<"Article">[]>("/articles")).data.slice(0, 4);
  } catch {
    return [];
  }
});
</script>

<template>
  <GuestCard
    :title="t('Latest news')"
    :subtitle="t('Keep up to date with the latest hotel gossip.')"
    icon="hotel-icon"
    heading-id="atom-latest-news"
  >
    <div
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <ArticleTile
        v-for="article in news"
        :key="article.id"
        :article="article"
      />
      <EmptyArticle v-if="!news?.length" />
    </div>
  </GuestCard>
</template>
