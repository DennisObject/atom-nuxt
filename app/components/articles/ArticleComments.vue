<script setup lang="ts">
import type { Data, Envelope } from "~/utils/api";
import { relativeDate } from "~/utils/date";

const props = defineProps<{
  slug: string;
  canComment: boolean;
  canPostComment?: boolean;
  initial: Envelope<Data<"Comment">[]> | null;
}>();
const { t, locale } = useLocale();
const { api } = useApi();
const { session, avatar } = useSession();
const { theme } = useAppConfig();
const { busy, error, fields, success, run } = usePage();
const result = ref(props.initial);
const comment = ref("");
const canPost = ref(props.canPostComment !== false);
const comments = computed(() => result.value?.data || []);
const commentPagination = computed(() => ({
  page: result.value?.meta?.current_page || 1,
  last: result.value?.meta?.last_page || 1,
}));

async function loadComments(page = 1) {
  const [replies, detail] = await Promise.all([
    api<Data<"Comment">[]>(`/articles/${props.slug}/comments?page=${page}`),
    api<Data<"Article">>(`/articles/${props.slug}`) as Promise<
      Envelope<Data<"Article">> & { can_post_comment?: boolean }
    >,
  ]);
  result.value = replies;
  canPost.value = detail.can_post_comment !== false;
}

async function postComment() {
  if (busy.value || !comment.value.trim()) {
    return;
  }

  await run(async () => {
    await api(`/articles/${props.slug}/comments`, "POST", {
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
</script>

<template>
  <div class="space-y-4">
    <AppNotice :error="error" :fields="fields" :success="success" />
    <BaseCard
      v-if="session.user && canComment && canPost"
      :title="t('Post a comment')"
      :subtitle="
        t(
          'Post a comment on the article, to let us know what you think about it',
        )
      "
      icon="hotel-icon"
    >
      <form class="block text-sm" @submit.prevent="postComment">
        <textarea
          v-model="comment"
          required
          maxlength="255"
          class="min-h-[110px] max-h-[160px] w-full rounded border-2 border-[var(--border)] bg-[var(--surface-inset)] focus:border-[#eeb425] focus:ring-0"
          :aria-label="t('Your comment')"
          :placeholder="t('Write a comment...')"
          @keydown.ctrl.enter.prevent="postComment"
        ></textarea>
        <div
          class="mt-2 flex items-center justify-between text-xs text-[var(--text-dim)]"
        >
          <span>{{ t("Tip: Press Ctrl + Enter to post quickly") }}</span>
          <span>{{ comment.length }}/255</span>
        </div>
        <button
          class="mt-2 w-full rounded border-2 border-blue-500 bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700"
          :disabled="busy"
        >
          {{ t("Post comment") }}
        </button>
      </form>
    </BaseCard>
    <BaseCard
      v-if="canComment && comments.length"
      :title="t('Comments')"
      :subtitle="
        t('Below you will see all the comments, written on this article')
      "
      icon="hotel-icon"
    >
      <div class="space-y-[13px]">
        <article
          v-for="item in comments"
          :key="item.id"
          class="w-full rounded-xl border p-3 shadow-sm transition"
          :class="
            theme.name === 'atom'
              ? 'border-gray-200 bg-[#f5f5f5] dark:border-gray-600 dark:bg-gray-700'
              : 'border-[#2b3040] bg-[#21242e]'
          "
        >
          <div class="flex items-start gap-3">
            <NuxtLink
              :to="`/home/${item.author?.username}`"
              class="shrink-0 drop-shadow-sm"
            >
              <span
                class="flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-inset)]"
              >
                <img
                  class="[image-rendering:pixelated] transition duration-300 hover:scale-105"
                  :src="avatar(item.author, { headonly: 1 })"
                  :alt="item.author?.username"
                />
              </span>
            </NuxtLink>
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <NuxtLink
                  class="truncate font-semibold text-[#89cdf0] hover:underline"
                  :to="`/home/${item.author?.username}`"
                >
                  {{ item.author?.username }}
                </NuxtLink>
                <div class="flex shrink-0 items-center gap-2">
                  <small class="text-xs text-[var(--text-dim)]">
                    {{ relativeDate(item.created_at, locale) }}
                  </small>
                  <button
                    v-if="item.can_delete"
                    class="rounded border-0 bg-transparent p-1 text-[var(--text-dim)] hover:bg-red-500/10 hover:text-red-500"
                    :aria-label="t('Delete comment')"
                    :disabled="busy"
                    @click="removeComment(item.id)"
                  >
                    <svg
                      class="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <p
                class="mt-1 whitespace-pre-wrap text-sm leading-relaxed break-words"
              >
                {{ item.comment }}
              </p>
            </div>
          </div>
        </article>
      </div>
      <div
        v-if="commentPagination.last > 1"
        class="mt-5 flex items-center justify-center gap-3"
      >
        <button
          :disabled="busy || commentPagination.page === 1"
          @click="run(() => loadComments(commentPagination.page - 1))"
        >
          {{ t("Previous") }}
        </button>
        <span>{{ commentPagination.page }} / {{ commentPagination.last }}</span>
        <button
          :disabled="busy || commentPagination.page === commentPagination.last"
          @click="run(() => loadComments(commentPagination.page + 1))"
        >
          {{ t("Next") }}
        </button>
      </div>
    </BaseCard>
  </div>
</template>
