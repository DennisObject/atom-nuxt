<script setup lang="ts">
import type { Data } from "~/utils/api";
import { ArticleTile } from "#components";

const props = defineProps<{ articles: Data<"Article">[] }>();

const { t } = useLocale();

const { slide, hovered, focused, startSwipe, endSwipe, leaveFocus } =
  useNewsCarousel(() => props.articles.length, true);
</script>

<template>
  <section
    class="relative h-[213px] min-w-0"
    :aria-label="t('Latest news')"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focused = true"
    @focusout="leaveFocus"
    @pointerdown="startSwipe"
    @pointerup="endSwipe"
  >
    <EmptyArticle v-if="!articles.length" />

    <ArticleTile
      v-for="(article, index) in articles"
      v-show="index === slide"
      :key="article.id"
      :article="article"
      for-slider
    />

    <template v-if="articles.length > 1">
      <div class="absolute inset-x-0 bottom-0 flex justify-center gap-2">
        <button
          v-for="(_, index) in articles"
          :key="index"
          class="size-2 min-h-0 rounded-full border-0 p-0"
          :class="
            index === slide ? 'bg-[#e9b124]' : 'bg-black/20 dark:bg-white/20'
          "
          :aria-label="`${t('Article')} ${index + 1}`"
          :aria-current="index === slide ? 'true' : undefined"
          @click="slide = index"
        ></button>
      </div>
    </template>
  </section>
</template>
