<script setup lang="ts">
const { artwork } = useAppConfig();
import { displayDate } from "~/utils/date";
const { t } = useLocale();
import { reactive, ref } from "vue";

const { api, mediaUrl } = useApi();
import type { Data, Envelope } from "~/utils/api";
const { session, avatar } = useSession();
import { usePage } from "~/composables/usePage";
import { Card } from "#components";
import Notice from "~/components/Notice.vue";
import { ArticleTile } from "#components";
import RichText from "~/components/RichText.vue";
const route = useRoute(),
  slug = route.params.slug ? encodeURIComponent(String(route.params.slug)) : "";
const { busy, error, fields, success, run } = usePage();
const otherArticles = ref<Data<"Article">[]>([]);
const articles = ref<Data<"Article">[]>([]),
  article = ref<Data<"Article"> | null>(null),
  comments = ref<Data<"Comment">[]>([]),
  comment = ref("");
const pagination = reactive({ page: 1, last: 1 }),
  commentPagination = reactive({ page: 1, last: 1 });
const reactions = ref<Record<string, number>>({}),
  myReactions = ref<string[]>([]);
const reactionDialog = ref<HTMLDialogElement>();
const articleReactions = computed(() =>
  Object.entries(reactions.value).filter(([, count]) => count > 0)
);
const availableReactions = computed(() =>
  (session.bootstrap.reactions || []).filter(
    (reaction) =>
      !reactions.value[reaction] && !myReactions.value.includes(reaction)
  )
);
async function load(page = 1) {
  if (slug) {
    const result = (await api<Data<"Article">>(
      `/articles/${slug}`
    )) as Envelope<Data<"Article">> & {
      reactions: Record<string, number>;
      my_reactions: string[];
    };
    article.value = result.data;
    reactions.value = result.reactions || {};
    myReactions.value = result.my_reactions || [];
    await loadComments();
  } else {
    const result = await api<Data<"Article">[]>(`/articles?page=${page}`);
    articles.value = result.data;
    pagination.page = result.meta?.current_page || page;
    pagination.last = result.meta?.last_page || 1;
  }
}
async function loadComments(page = 1) {
  const result = await api<Data<"Comment">[]>(
    `/articles/${slug}/comments?page=${page}`
  );
  comments.value = result.data;
  commentPagination.page = result.meta?.current_page || page;
  commentPagination.last = result.meta?.last_page || 1;
}
const { data: initial, error: initialError } = await useAsyncData(
  `articles:${slug || "index"}`,
  async () => {
    try {
      if (!slug)
        return {
          listing: await api<Data<"Article">[]>("/articles"),
          article: null,
          comments: null,
          others: [],
        };
      const [detail, replies, recent] = await Promise.all([
        api<Data<"Article">>(`/articles/${slug}`) as Promise<
          Envelope<Data<"Article">> & {
            reactions?: Record<string, number>;
            my_reactions?: string[];
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
  }
);
if (initialError.value)
  throw createError({
    statusCode:
      (initialError.value as { status?: number }).status ||
      initialError.value.statusCode ||
      500,
    statusMessage: initialError.value.message,
  });
if (initial.value?.listing) {
  articles.value = initial.value.listing.data;
  pagination.page = initial.value.listing.meta?.current_page || 1;
  pagination.last = initial.value.listing.meta?.last_page || 1;
}
if (initial.value?.article) {
  article.value = initial.value.article.data;
  reactions.value = initial.value.article.reactions || {};
  myReactions.value = initial.value.article.my_reactions || [];
  comments.value = initial.value.comments?.data || [];
  commentPagination.page = initial.value.comments?.meta?.current_page || 1;
  commentPagination.last = initial.value.comments?.meta?.last_page || 1;
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
async function postComment() {
  await run(async () => {
    await api(`/articles/${slug}/comments`, "POST", {
      comment: comment.value,
    });
    comment.value = "";
    await loadComments();
  }, "Your comment has been posted.");
}
async function removeComment(id: number) {
  await run(async () => {
    await api(`/comments/${id}`, "DELETE");
    await loadComments();
  }, "Comment deleted.");
}
async function react(reaction: string) {
  if (!session.user || busy.value) return;
  await run(async () => {
    await api(
      `/articles/${slug}/reactions/${encodeURIComponent(reaction)}`,
      myReactions.value.includes(reaction) ? "DELETE" : "PUT"
    );
    await load();
  });
}
</script>
<template>
  <Notice :error="error" :fields="fields" :success="success" />
  <template v-if="!slug"
    ><div class="news-heading">
      <img :src="artwork.news" alt="" />
      <h1>{{ t("News") }}</h1>
    </div>
    <div class="grid four-columns">
      <ArticleTile v-for="item in articles" :key="item.id" :article="item" />
    </div>
    <p v-if="!busy && !articles.length" class="empty">
      {{ t("There are no articles yet.") }}
    </p>
    <div v-if="pagination.last > 1" class="pagination">
      <button
        :disabled="busy || pagination.page === 1"
        @click="run(() => load(pagination.page - 1))"
      >
        {{ t("Previous") }}</button
      ><span>{{ pagination.page }} / {{ pagination.last }}</span
      ><button
        :disabled="busy || pagination.page === pagination.last"
        @click="run(() => load(pagination.page + 1))"
      >
        {{ t("Next") }}
      </button>
    </div></template
  >
  <div v-else-if="article" class="article-layout">
    <aside class="stack">
      <NuxtLink
        v-if="article.author"
        class="article-author"
        :to="`/home/${article.author.username}`"
      >
        <div class="author-portrait">
          <img
            :src="avatar(article.author, true)"
            :alt="article.author.username"
          />
        </div>
        <strong>{{ article.author.username }}</strong
        ><small>{{ article.author.motto || t("No motto") }}</small
        ><span
          :class="['author-status', { online: article.author.online }]"
          :aria-label="t(article.author.online ? 'Online' : 'Offline')"
        ></span>
      </NuxtLink>
      <Card
        :title="t('Other articles')"
        :subtitle="t('Our most recent articles')"
        icon="article-icon"
      >
        <NuxtLink
          v-for="other in otherArticles"
          :key="other.id"
          class="recent-article"
          :to="`/community/article/${other.slug}`"
          :style="{
            backgroundImage: other.image
              ? `linear-gradient(#0008,#0008),url('${mediaUrl(other.image)}')`
              : undefined,
          }"
          >{{ other.title }}</NuxtLink
        >
        <p v-if="!otherArticles.length">
          {{ t("There is currently no other articles") }}
        </p>
      </Card>
    </aside>
    <div class="stack">
      <article class="article-content-panel">
        <header
          :style="{
            backgroundImage: article.image
              ? `linear-gradient(#0008,#0008),url('${mediaUrl(article.image)}')`
              : undefined,
          }"
        >
          <h1>{{ article.title }}</h1>
          <p>{{ article.short_story }}</p>
        </header>
        <RichText :html="article.full_story" />
      </article>
      <div class="article-reactions" :aria-label="t('Reactions')">
        <button
          v-if="session.user"
          class="reaction-add"
          type="button"
          @click="reactionDialog?.showModal()"
        >
          {{ t("Add") }}
        </button>
        <button
          v-for="[reaction, count] in articleReactions"
          :key="reaction"
          class="reaction-count"
          :aria-pressed="myReactions.includes(reaction)"
          :disabled="busy || !session.user"
          @click="react(reaction)"
        >
          <img
            :src="`/assets/images/icons/reactions/${reaction}.png`"
            :alt="reaction"
          />
          {{ count }}
        </button>
      </div>
      <dialog
        v-if="session.user"
        ref="reactionDialog"
        class="reaction-dialog"
        aria-labelledby="reaction-dialog-title"
        @click="$event.target === reactionDialog && reactionDialog?.close()"
      >
        <header>
          <h2 id="reaction-dialog-title">{{ t("Insert Reaction") }}</h2>
          <button
            type="button"
            :aria-label="t('Close')"
            @click="reactionDialog?.close()"
          >
            ✕
          </button>
        </header>
        <p v-if="error" role="alert">{{ error }}</p>
        <div class="reaction-options">
          <button
            v-for="reaction in availableReactions"
            :key="reaction"
            type="button"
            :disabled="busy"
            @click="react(reaction)"
          >
            <img
              :src="`/assets/images/icons/reactions/${reaction}.png`"
              :alt="reaction"
            />
          </button>
        </div>
      </dialog>
      <Card :title="t('Comments')" icon="speechbubble_icon"
        ><article v-for="item in comments" :key="item.id" class="comment">
          <div class="flex items-center gap-4 flex-wrap">
            <NuxtLink :to="`/home/${item.author?.username}`"
              ><strong>{{ item.author?.username }}</strong></NuxtLink
            ><small>{{ displayDate(item.created_at, true) }}</small>
          </div>
          <p>{{ item.comment }}</p>
          <button
            v-if="item.can_delete"
            class="text-button"
            :disabled="busy"
            @click="removeComment(item.id)"
          >
            {{ t("Delete comment") }}
          </button>
        </article>
        <p v-if="!comments.length" class="muted">
          {{ t("Be the first to join the conversation.") }}
        </p>
        <div v-if="commentPagination.last > 1" class="pagination">
          <button
            :disabled="busy || commentPagination.page === 1"
            @click="run(() => loadComments(commentPagination.page - 1))"
          >
            {{ t("Previous") }}</button
          ><span
            >{{ commentPagination.page }} / {{ commentPagination.last }}</span
          ><button
            :disabled="
              busy || commentPagination.page === commentPagination.last
            "
            @click="run(() => loadComments(commentPagination.page + 1))"
          >
            {{ t("Next") }}
          </button>
        </div>
        <form
          v-if="session.user && article.can_comment"
          @submit.prevent="postComment"
        >
          <label>
            {{ t("Your comment") }}
            <textarea v-model="comment" required maxlength="5000"></textarea>
          </label>
          <div>
            <button :disabled="busy">{{ t("Post comment") }}</button>
          </div>
        </form>
        <NuxtLink v-else-if="!session.user" to="/login">
          {{ t("Log in to join the conversation →") }}
        </NuxtLink>
        <p v-else class="muted">
          {{ t("Comments are closed for this article.") }}
        </p></Card
      >
    </div>
  </div>
</template>

<style scoped>
.news-heading {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--header, #21242e);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}
.news-heading h1 {
  font-size: 18px;
  font-weight: 700;
}
.news-heading img {
  max-height: 44px;
}
.article-layout {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 16px;
  align-items: start;
}
.article-content-panel {
  padding: 12px;
  background: var(--surface-inset, #1f2937);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  color: var(--text, #f3f4f6);
}
.article-content-panel header {
  min-height: 96px;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-position: center;
  background-size: cover;
}
.article-content-panel h1 {
  font-size: 30px;
  line-height: 36px;
  font-weight: 600;
  text-align: center;
}
.article-content-panel header p {
  text-align: center;
}
.article-content-panel :deep(.rich-text) {
  padding: 0 8px;
}
.article-author {
  display: block;
  height: 96px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(transparent 65%, var(--surface-deep, #171a23) 65%),
    url("/assets/images/staff-bg.png");
}
.author-portrait {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--portrait-background) center/contain;
  overflow: hidden;
}
.author-portrait img {
  position: absolute;
  bottom: -40px;
  max-width: none;
  image-rendering: pixelated;
}
.article-author strong,
.article-author small {
  display: block;
  margin-left: 90px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.article-author strong {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 600;
}
.article-author small {
  font-style: italic;
}
.author-status {
  position: absolute;
  bottom: 10px;
  right: 16px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #f87171;
}
.author-status.online {
  background: #4ade80;
}
.recent-article {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background-position: center;
  border-radius: 4px;
  padding: 8px;
  text-align: center;
}
@media (max-width: 767px) {
  .article-layout {
    grid-template-columns: 1fr;
  }
  .article-layout > aside {
    order: 2;
  }
}
</style>
