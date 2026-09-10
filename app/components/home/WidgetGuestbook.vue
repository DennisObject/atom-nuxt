<script setup lang="ts">
import { relativeDate } from "~/utils/date";
import type { Data } from "~/utils/api";

defineProps<{
  content: Extract<Data<"HomeWidget">, { type: "my-guestbook" }>["content"];
  busy: boolean;
  visitor: boolean;
  editing: boolean;
}>();
const emit = defineEmits<{ post: [message: string] }>();
const { t, locale } = useLocale();
const { avatar } = useSession();
const message = defineModel<string>({ default: "" });
</script>

<template>
  <div class="flex flex-col gap-2 p-1">
    <form
      v-if="visitor && !editing"
      class="flex flex-col gap-1 border-b border-[var(--border)] pb-2"
      @submit.prevent="emit('post', message)"
    >
      <textarea
        v-model="message"
        required
        maxlength="500"
        rows="2"
        class="min-h-0 w-full rounded border border-[var(--border)] bg-[var(--surface-muted)] p-2 text-xs"
        :aria-label="t('Leave a message')"
        :placeholder="t('Leave a message')"
      ></textarea>
      <button
        class="self-end rounded border-0 bg-blue-500 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-600"
        :disabled="busy"
      >
        {{ t("Post") }}
      </button>
    </form>
    <article
      v-for="entry in content"
      :key="entry.id"
      class="flex gap-2 border-b border-[var(--border)] pb-2"
    >
      <img
        class="h-14 w-8 shrink-0 object-cover object-[-9px_-7px] [image-rendering:pixelated]"
        :src="
          avatar(entry.author, { size: 's', direction: 4, head_direction: 4 })
        "
        :alt="entry.author?.username"
      />
      <div class="flex min-w-0 flex-col">
        <div class="flex items-center gap-1">
          <span
            class="size-2 shrink-0 rounded-full"
            :class="entry.author?.online ? 'bg-green-500' : 'bg-gray-400'"
          />
          <NuxtLink
            class="truncate text-xs font-semibold text-blue-500 hover:underline"
            :to="`/home/${entry.author?.username}`"
          >
            {{ entry.author?.username }}
          </NuxtLink>
        </div>
        <p
          class="mt-1 max-h-[100px] overflow-y-auto whitespace-pre-wrap text-xs text-[var(--text-secondary)]"
        >
          {{ entry.content }}
        </p>
        <span class="mt-1 text-[10px] text-gray-400">
          {{ relativeDate(entry.created_at, locale) }}
        </span>
      </div>
    </article>
  </div>
</template>
