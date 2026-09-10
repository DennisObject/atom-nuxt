<script setup lang="ts">
import type { Data, Envelope } from "~/utils/api";
import ArticleComments from "~/components/articles/ArticleComments.vue";
import ArticleReactions from "~/components/articles/ArticleReactions.vue";
import ArticleSidebar from "~/components/articles/ArticleSidebar.vue";

const { artwork, theme } = useAppConfig();

const { t } = useLocale();

const { api, mediaUrl } = useApi();

const route = useRoute();

const slug = route.params.slug
  ? encodeURIComponent(String(route.params.slug))
  : "";

const { busy, error, fields, success, run } = usePage();

const otherArticles = ref<Data<"Article">[]>([]);

const articles = ref<Data<"Article">[]>([]);

const article = ref<Data<"Article"> | null>(null);

const pagination = reactive({ page: 1, last: 1 });

const reactions = ref<Record<string, number>>({});

const myReactions = ref<string[]>([]);

const reactionUsers = ref<Record<string, string[]>>({});

const authorDisplay = ref<{ rank_name: string; background_url: string } | null>(
  null,
);

const canPostComment = ref<boolean | undefined>();

async function load(page = 1) {
  const result = await api<Data<"Article">[]>(`/articles?page=${page}`);

  articles.value = result.data;

  pagination.page = result.meta?.current_page || page;

  pagination.last = result.meta?.last_page || 1;
}

const { data: initial, error: initialError } = await useAsyncData(
  `articles:${slug || "index"}`,
  async () => {
    try {
      if (!slug) {
        return {
          listing: await api<Data<"Article">[]>("/articles"),
          article: null,
          comments: null,
          others: [],
        };
      }

      const [detail, replies, recent] = await Promise.all([
        api<Data<"Article">>(`/articles/${slug}`) as Promise<
          Envelope<Data<"Article">> & {
            reactions?: Record<string, number>;
            my_reactions?: string[];
            reaction_users?: Record<string, string[]>;
            author_display?: { rank_name: string; background_url: string };
            can_post_comment?: boolean;
          }
        >,
        api<Data<"Comment">[]>(`/articles/${slug}/comments`),
        api<Data<"Article">[]>("/articles"),
      ]);

      return {
        listing: null,
        article: detail,
        comments: replies,
        others: recent.data
          .filter((item) => item.id !== detail.data.id)
          .slice(0, 5),
      };
    } catch (failure) {
      const cause = failure as { status?: number; message?: string };

      throw createError({
        statusCode: cause.status || 500,
        statusMessage: cause.message || "Could not load this page.",
      });
    }
  },
);

if (initialError.value) {
  throw createError({
    statusCode:
      (initialError.value as { status?: number }).status ||
      initialError.value.statusCode ||
      500,
    statusMessage: initialError.value.message,
  });
}

if (initial.value?.listing) {
  articles.value = initial.value.listing.data;

  pagination.page = initial.value.listing.meta?.current_page || 1;

  pagination.last = initial.value.listing.meta?.last_page || 1;
}

if (initial.value?.article) {
  article.value = initial.value.article.data;

  reactions.value = initial.value.article.reactions || {};

  myReactions.value = initial.value.article.my_reactions || [];

  reactionUsers.value = initial.value.article.reaction_users || {};

  authorDisplay.value = initial.value.article.author_display || null;

  canPostComment.value = initial.value.article.can_post_comment;

  otherArticles.value = initial.value.others;
}

useSeoMeta({
  title: () => article.value?.title || t("News"),
  description: () =>
    article.value?.short_story || t("Our most recent articles"),
  ogTitle: () => article.value?.title || t("News"),
  ogDescription: () =>
    article.value?.short_story || t("Our most recent articles"),
  ogImage: () =>
    article.value?.image ? mediaUrl(article.value.image) : undefined,
  ogType: () => (slug ? "article" : "website"),
});
</script>

<template>
  <AppNotice :error="error" :fields="fields" :success="success" />

  <template v-if="!slug">
    <div
      v-if="theme.name === 'dusk'"
      class="mb-4 flex items-center gap-4 rounded-lg bg-[var(--header)] p-3"
    >
      <img :src="artwork.news" alt="" class="max-h-11" />

      <h1 class="text-lg font-bold">{{ t("News") }}</h1>
    </div>

    <div
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      <ArticleTile v-for="item in articles" :key="item.id" :article="item" />
    </div>

    <p
      v-if="!busy && !articles.length"
      class="rounded-lg bg-[var(--empty-bg)] p-[25px] text-center text-[var(--empty-text)]"
    >
      {{ t("There are no articles yet.") }}
    </p>

    <div
      v-if="pagination.last > 1"
      class="mt-5 flex items-center justify-center gap-3"
    >
      <button
        :disabled="busy || pagination.page === 1"
        @click="run(() => load(pagination.page - 1))"
      >
        {{ t("Previous") }}
      </button>

      <span>{{ pagination.page }} / {{ pagination.last }}</span>

      <button
        :disabled="busy || pagination.page === pagination.last"
        @click="run(() => load(pagination.page + 1))"
      >
        {{ t("Next") }}
      </button>
    </div>
  </template>

  <div
    v-else-if="article"
    class="grid items-start gap-4 md:grid-cols-[1fr_3fr]"
  >
    <ArticleSidebar
      :article="article"
      :other-articles="otherArticles"
      :author-display="authorDisplay"
    />

    <div class="grid content-start gap-4">
      <article
        class="relative flex flex-col gap-8 overflow-hidden rounded bg-white p-3 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300"
      >
        <header
          class="relative flex h-24 flex-col items-center justify-center gap-1 overflow-hidden rounded bg-cover bg-center px-2 text-white"
          :style="{
            backgroundImage: article.image
              ? `linear-gradient(#0008,#0008),url('${mediaUrl(article.image)}')`
              : undefined,
          }"
        >
          <h1
            class="relative w-full truncate text-center text-xl font-semibold lg:text-2xl xl:text-3xl"
          >
            {{ article.title }}
          </h1>

          <p class="relative w-full truncate text-center">
            {{ article.short_story }}
          </p>
        </header>

        <RichText class="px-2" :html="article.full_story" />
      </article>

      <ArticleReactions
        :slug="slug"
        :initial-reactions="reactions"
        :initial-my-reactions="myReactions"
        :initial-reaction-users="reactionUsers"
      />

      <ArticleComments
        :slug="slug"
        :can-comment="!!article.can_comment"
        :can-post-comment="canPostComment"
        :initial="initial?.comments || null"
      />
    </div>
  </div>
</template>
