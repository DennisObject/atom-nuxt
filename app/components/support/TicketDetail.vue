<script setup lang="ts">
import { BaseCard } from "#components";
import AppNotice from "~/components/AppNotice.vue";
import RichText from "~/components/RichText.vue";
import type { Data } from "~/utils/api";

const { t } = useLocale();

const { api } = useApi();

const { busy, error, fields, run } = usePage();

const props = defineProps<{ ticket: Data<"Ticket">; categoryName: string }>();

const emit = defineEmits<{ changed: [] }>();

const router = useRouter();

async function toggle() {
  await run(async () => {
    await api(`/support/tickets/${props.ticket.id}/toggle-status`, "POST");

    emit("changed");
  });
}

async function remove() {
  if (!window.confirm("Delete this support ticket and its replies?")) {
    return;
  }

  await run(async () => {
    await api(`/support/tickets/${props.ticket.id}`, "DELETE");

    await router.push("/help-center");
  });
}
</script>

<template>
  <AppNotice :error="error" :fields="fields" />

  <BaseCard :title="`${ticket.title} [${categoryName}]`" icon="chat-icon">
    <NuxtLink
      class="self-end"
      :to="`/help-center/tickets/edit/${ticket.id}`"
      :aria-label="t('Edit ticket')"
    >
      <svg
        class="size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 0 1 2.652 2.652L10.582 16.07 6 18l1.417-4.49 9.445-9.023ZM5 6H4v14h14v-7"
        />
      </svg>
    </NuxtLink>

    <div class="flex gap-3">
      <button
        class="w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white hover:bg-green-700 grow"
        :class="{ 'bg-[#eeb425]! border-yellow-400!': !ticket.open }"
        :disabled="busy"
        @click="toggle"
      >
        {{ t(ticket.open ? "Close" : "Re-open") }}
      </button>

      <button
        v-if="ticket.can_delete"
        class="border-[#d26475] bg-[#9e3b4a] grow"
        :disabled="busy"
        @click="remove()"
      >
        {{ t("Delete") }}
      </button>
    </div>

    <RichText class="mt-8" :html="ticket.content" />
  </BaseCard>
</template>
