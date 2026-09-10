<script setup lang="ts">
import { computed, ref } from "vue";
import { BaseCard } from "#components";
import AppNotice from "~/components/AppNotice.vue";
import RichText from "~/components/RichText.vue";
import type { Data } from "~/utils/api";
import { displayDate } from "~/utils/date";

const { t } = useLocale();

const { api } = useApi();

const { session, avatar } = useSession();

const { busy, error, fields, success, run } = usePage();

const props = defineProps<{ ticket: Data<"Ticket"> }>();

const emit = defineEmits<{ changed: [] }>();

const reply = ref("");

const replies = computed(() => [...(props.ticket.replies || [])].reverse());

async function postReply() {
  await run(async () => {
    await api(`/support/tickets/${props.ticket.id}/replies`, "POST", {
      content: reply.value,
    });

    reply.value = "";

    emit("changed");
  }, "Your reply has been sent.");
}

async function removeReply(replyId: number) {
  await run(async () => {
    await api(`/support/replies/${replyId}`, "DELETE");

    emit("changed");
  });
}
</script>

<template>
  <AppNotice :error="error" :fields="fields" :success="success" />

  <BaseCard
    :title="t('Comments')"
    :subtitle="t('Please submit your reply below')"
    icon="duo-chat-icon"
  >
    <form
      v-if="ticket.open"
      class="flex flex-col gap-4"
      @submit.prevent="postReply"
    >
      <TicketEditor v-model="reply" :disabled="busy" />

      <div>
        <button
          class="w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white hover:bg-green-700"
          :disabled="busy"
        >
          {{ t("Submit reply") }}
        </button>
      </div>
    </form>

    <div class="grid content-start gap-4 mt-4">
      <article
        v-for="item in replies"
        :key="item.id"
        class="overflow-hidden rounded bg-[var(--surface-muted)]"
      >
        <header
          class="relative flex h-[50px] items-center justify-between overflow-hidden border-b border-gray-800 px-4 text-[var(--text-subtle)]"
          :class="{ 'flex-row-reverse': item.author?.id !== session.user?.id }"
        >
          <div
            :class="item.author?.id !== session.user?.id ? 'pr-14' : 'pl-14'"
          >
            <img
              class="absolute -bottom-10"
              :class="
                item.author?.id !== session.user?.id
                  ? 'right-2 -scale-x-100'
                  : 'left-2'
              "
              :src="avatar(item.author)"
              alt=""
            />

            <small>{{ item.author?.username }}</small>
          </div>

          <div class="flex gap-2">
            <small>{{ displayDate(item.created_at, true) }}</small>

            <button
              v-if="item.can_delete"
              class="border-0 bg-transparent p-0 text-[var(--lilac)]"
              :aria-label="t('Delete reply')"
              :disabled="busy"
              @click="removeReply(item.id)"
            >
              <svg
                class="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
              </svg>
            </button>
          </div>
        </header>

        <RichText class="p-4" :html="item.content" />
      </article>

      <p v-if="!ticket.replies?.length">
        {{ t("There is currently no replies") }}
      </p>
    </div>
  </BaseCard>
</template>
