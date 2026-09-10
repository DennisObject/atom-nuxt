<script setup lang="ts">
import type { Data, Envelope } from "~/utils/api";
import ArticleReaction from "./ArticleReaction.vue";

type ArticleResponse = Envelope<Data<"Article">> & {
  reactions?: Record<string, number>;
  my_reactions?: string[];
  reaction_users?: Record<string, string[]>;
};

const props = defineProps<{
  slug: string;
  initialReactions: Record<string, number>;
  initialMyReactions: string[];
  initialReactionUsers?: Record<string, string[]>;
}>();

const { t } = useLocale();

const { theme } = useAppConfig();

const { api } = useApi();

const { session } = useSession();

const { busy, error, run } = usePage();

const reactions = ref(props.initialReactions);

const myReactions = ref(props.initialMyReactions);

const reactionUsers = ref(props.initialReactionUsers || {});

const reactionDialog = ref<HTMLDialogElement>();

const articleReactions = computed(() =>
  Object.entries(reactions.value).filter(([, count]) => count > 0),
);

const availableReactions = computed(() =>
  (session.bootstrap.reactions || []).filter(
    (reaction) =>
      !reactions.value[reaction] && !myReactions.value.includes(reaction),
  ),
);

async function react(reaction: string) {
  if (!session.user || busy.value) {
    return;
  }

  await run(async () => {
    await api(
      `/articles/${props.slug}/reactions/${encodeURIComponent(reaction)}`,
      myReactions.value.includes(reaction) ? "DELETE" : "PUT",
    );

    const result = (await api<Data<"Article">>(
      `/articles/${props.slug}`,
    )) as ArticleResponse;

    reactions.value = result.reactions || {};

    myReactions.value = result.my_reactions || [];

    reactionUsers.value = result.reaction_users || {};
  });
}
</script>

<template>
  <AppNotice :error="error" />

  <div
    class="flex w-full flex-wrap gap-2 rounded-lg p-2"
    :class="
      theme.name === 'dusk'
        ? 'bg-gray-900 text-gray-100'
        : 'bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100'
    "
    :aria-label="t('Reactions')"
  >
    <button
      v-if="session.user"
      class="h-8 rounded-lg border-yellow-400 bg-[#eeb425] px-2 py-0 text-xs text-white font-semibold filter-none enabled:hover:scale-110 disabled:cursor-default disabled:opacity-100"
      type="button"
      @click="reactionDialog?.showModal()"
    >
      {{ t("Add") }}
    </button>

    <ArticleReaction
      v-for="[reaction, count] in articleReactions"
      :key="reaction"
      :name="reaction"
      :count="count"
      :users="reactionUsers[reaction] || []"
      :selected="myReactions.includes(reaction)"
      :busy="busy"
      :authenticated="!!session.user"
      @select="react(reaction)"
    />
  </div>

  <dialog
    v-if="session.user"
    ref="reactionDialog"
    class="m-auto max-h-[calc(100dvh-32px)] w-full max-w-lg rounded-lg border-0 p-4 shadow-lg backdrop:bg-black/70"
    :class="
      theme.name === 'dusk'
        ? 'bg-gray-900 text-gray-100'
        : 'bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100'
    "
    aria-labelledby="reaction-dialog-title"
    @click="$event.target === reactionDialog && reactionDialog?.close()"
  >
    <header class="flex items-center justify-between">
      <h2 class="m-0 text-2xl leading-8 font-normal" id="reaction-dialog-title">
        {{ t("Insert Reaction") }}
      </h2>

      <button
        type="button"
        class="border-0 bg-transparent p-0 text-[var(--text-secondary)]"
        :aria-label="t('Close')"
        @click="reactionDialog?.close()"
      >
        ✕
      </button>
    </header>

    <p v-if="error" role="alert">{{ error }}</p>

    <div class="mt-4 flex flex-wrap justify-center gap-3">
      <button
        class="rounded-lg border-2 bg-transparent px-3 py-2 hover:filter-none"
        :class="
          theme.name === 'dusk'
            ? 'border-gray-800 hover:bg-gray-700'
            : 'border-gray-300 hover:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
        "
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
</template>
