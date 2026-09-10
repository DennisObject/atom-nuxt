<script setup lang="ts">
import type { Data } from "~/utils/api";
import { ArticleTile } from "#components";

const props = defineProps<{
  articles: Data<"Article">[];
  registration?: boolean;
}>();
const { t } = useLocale();
const { slide, hovered, focused, move, startSwipe, endSwipe, leaveFocus } =
  useNewsCarousel(() => props.articles.length, false);
</script>

<template>
  <section
    v-if="articles.length"
    class="relative h-[250px] overflow-hidden rounded-md"
    :aria-label="t('Latest news')"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focusin="focused = true"
    @focusout="leaveFocus"
    @pointerdown="startSwipe"
    @pointerup="endSwipe"
  >
    <ArticleTile
      v-for="(article, index) in articles"
      v-show="index === slide"
      :key="article.id"
      :article="article"
      :registration="registration"
    />
    <template v-if="articles.length > 1">
      <button
        class="absolute top-1/2 left-[10px] z-15 -mt-[22px] h-11 w-[27px] rounded-none border-0 bg-transparent p-0 text-[#007aff] disabled:cursor-auto disabled:opacity-35"
        :disabled="slide === 0"
        :aria-label="t('Previous article')"
        @click="move(-1)"
      >
        <svg
          viewBox="0 0 27 44"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          aria-hidden="true"
        >
          <path d="M25 1 3 22l22 21" />
        </svg>
      </button>
      <button
        class="absolute top-1/2 right-[10px] z-15 -mt-[22px] h-11 w-[27px] rounded-none border-0 bg-transparent p-0 text-[#007aff] disabled:cursor-auto disabled:opacity-35"
        :disabled="slide === articles.length - 1"
        :aria-label="t('Next article')"
        @click="move(1)"
      >
        <svg
          viewBox="0 0 27 44"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          aria-hidden="true"
        >
          <path d="m2 1 22 21L2 43" />
        </svg>
      </button>
      <div
        class="absolute inset-x-0 top-[3px] z-15 flex h-[10px] justify-center gap-2"
      >
        <button
          v-for="(_, index) in articles"
          :key="index"
          class="size-2 min-h-0 rounded-full border-0 p-0"
          :class="index === slide ? 'bg-[#007aff]' : 'bg-black/20'"
          :aria-label="`${t('Article')} ${index + 1}`"
          :aria-current="index === slide ? 'true' : undefined"
          @click="slide = index"
        ></button>
      </div>
    </template>
  </section>
</template>
