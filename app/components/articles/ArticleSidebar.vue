<script setup lang="ts">
import type { Data } from "~/utils/api";
import MemberCard from "~/components/community/MemberCard.vue";

defineProps<{
  article: Data<"Article">;
  otherArticles: Data<"Article">[];
  authorDisplay?: { rank_name: string; background_url: string } | null;
}>();

const { t } = useLocale();

const { mediaUrl } = useApi();
</script>

<template>
  <aside class="flex flex-col gap-3">
    <MemberCard
      v-if="article.author"
      :user="article.author"
      :role="authorDisplay?.rank_name"
      :background="authorDisplay?.background_url"
    />

    <BaseCard
      :title="t('Other articles')"
      :subtitle="t('Our most recent articles')"
      icon="article-icon"
    >
      <div class="flex flex-col gap-2">
        <NuxtLink
          v-for="other in otherArticles"
          :key="other.id"
          class="flex h-12 items-center justify-center rounded bg-blue-200 bg-center text-center font-bold text-white transition duration-200 hover:scale-[1.03]"
          :to="`/community/article/${other.slug}`"
          :style="{
            backgroundImage: other.image
              ? `linear-gradient(#0008,#0008),url('${mediaUrl(other.image)}')`
              : undefined,
          }"
        >
          {{
            other.title.length > 20
              ? `${other.title.slice(0, 20)}...`
              : other.title
          }}
        </NuxtLink>
      </div>

      <p v-if="!otherArticles.length">
        {{ t("There is currently no other articles") }}
      </p>
    </BaseCard>
  </aside>
</template>
