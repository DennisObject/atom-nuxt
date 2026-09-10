<script setup lang="ts">
import { BaseCard } from "#components";
import type { Data } from "~/utils/api";

defineProps<{ openTickets: Data<"Ticket">[] }>();

const { t } = useLocale();

const { session } = useSession();
</script>

<template>
  <aside>
    <BaseCard
      :title="t('Open tickets')"
      :subtitle="t('Your current open tickets')"
      icon="duo-chat-icon"
    >
      <div class="grid content-start gap-2">
        <NuxtLink
          class="rounded bg-[var(--surface-muted)] p-2 hover:text-[#eeb425]"
          v-for="item in openTickets"
          :key="item.id"
          :to="`/help-center/tickets/${item.id}`"
        >
          <span aria-hidden="true">»</span>
          {{
            item.title.length > 20 ? item.title.slice(0, 20) + "…" : item.title
          }}
        </NuxtLink>

        <p v-if="!openTickets.length">
          {{ t("You currently have no open tickets.") }}
        </p>
      </div>

      <NuxtLink
        v-if="session.user?.can_manage_tickets"
        class="text-sm underline"
        to="/help-center/tickets/all"
      >
        {{ t("All support tickets") }}
      </NuxtLink>
    </BaseCard>
  </aside>
</template>
