<script setup lang="ts">
import { onMounted, ref } from "vue";
import { BaseCard } from "#components";
import AppNotice from "~/components/AppNotice.vue";
import type { Data } from "~/utils/api";
import SupportCategories from "~/components/support/SupportCategories.vue";

const { t } = useLocale();

const { api } = useApi();

const { session } = useSession();

const { busy, error, fields, run } = usePage();

const route = useRoute();

const allTickets = route.meta.all === true;

const categories = ref<Data<"SupportCategory">[]>([]);

const tickets = ref<Data<"Ticket">[]>([]);

const page = ref(1);

const lastPage = ref(1);

async function load(nextPage = 1) {
  categories.value = (await api<Data<"SupportCategory">[]>("/support")).data;

  if (!allTickets) {
    return;
  }

  const result = await api<Data<"Ticket">[]>(
    `/support/tickets?page=${nextPage}${allTickets ? "&all=1" : ""}`,
  );

  tickets.value = result.data;

  page.value = result.meta?.current_page || nextPage;

  lastPage.value = result.meta?.last_page || 1;
}

async function remove(ticketId: string) {
  if (!window.confirm("Delete this support ticket and its replies?")) {
    return;
  }

  await run(async () => {
    await api(`/support/tickets/${ticketId}`, "DELETE");

    await load(page.value);
  });
}

onMounted(() => run(load));
</script>

<template>
  <AppNotice :error="error" :fields="fields" />

  <div class="grid content-start gap-4">
    <SupportCategories v-if="!allTickets" :categories="categories" />

    <div v-if="allTickets" class="flex gap-4 flex-wrap">
      <NuxtLink
        class="inline-flex items-center justify-center gap-2 rounded-md border-2 px-[17px] py-[9px] [font-weight:var(--button-weight)] text-[var(--button-text)] transition-[filter,transform] duration-200 hover:text-white hover:brightness-112 border-[var(--accent-border)] bg-[var(--accent)] w-full rounded border-green-500 bg-green-600 p-2 font-semibold text-white hover:bg-green-700"
        to="/help-center/tickets/create"
      >
        {{ t("Create a ticket") }}
      </NuxtLink>

      <NuxtLink
        v-if="session.user?.can_manage_tickets"
        :to="allTickets ? '/help-center' : '/help-center/tickets/all'"
      >
        {{ t(allTickets ? "Your support tickets" : "All support tickets") }}
      </NuxtLink>
    </div>

    <BaseCard
      v-if="allTickets"
      :title="t(allTickets ? 'All tickets' : 'Your support tickets')"
      icon="chat-icon"
    >
      <div class="overflow-x-auto">
        <table class="w-full rounded border border-[var(--border)] text-sm">
          <thead>
            <tr>
              <th
                class="border-b border-[var(--border)] px-4 py-2 text-left bg-[var(--surface-inset)] text-[var(--text)]"
              >
                {{ t("Title") }}
              </th>

              <th
                class="border-b border-[var(--border)] px-4 py-2 text-left bg-[var(--surface-inset)] text-[var(--text)]"
              >
                {{ t("Author") }}
              </th>

              <th
                class="border-b border-[var(--border)] px-4 py-2 text-left bg-[var(--surface-inset)] text-[var(--text)]"
              >
                {{ t("Status") }}
              </th>

              <th
                class="border-b border-[var(--border)] px-4 py-2 text-left bg-[var(--surface-inset)] text-[var(--text)]"
              >
                {{ t("Actions") }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in tickets" :key="item.id">
              <td
                class="border-b border-[var(--border)] px-4 py-2 text-left text-[var(--text-secondary)]"
              >
                {{ item.title }}
              </td>

              <td
                class="border-b border-[var(--border)] px-4 py-2 text-left text-[var(--text-secondary)]"
              >
                {{ item.author?.username }}
              </td>

              <td
                class="border-b border-[var(--border)] px-4 py-2 text-left text-[var(--text-secondary)]"
              >
                {{ t(item.open ? "Open" : "Closed") }}
              </td>

              <td
                class="border-b border-[var(--border)] px-4 py-2 text-left text-[var(--text-secondary)]"
              >
                <div class="flex gap-3">
                  <NuxtLink
                    :to="`/help-center/tickets/${item.id}`"
                    :aria-label="t('View ticket')"
                  >
                    <svg
                      class="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path d="M2 12C6 3 18 3 22 12 18 21 6 21 2 12Z" />

                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </NuxtLink>

                  <NuxtLink
                    :to="`/help-center/tickets/edit/${item.id}`"
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

                  <button
                    v-if="item.can_delete"
                    class="border-0 bg-transparent p-0 text-[var(--lilac)]"
                    :aria-label="t('Delete ticket')"
                    :disabled="busy"
                    @click="remove(String(item.id))"
                  >
                    <svg
                      class="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path
                        d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!busy && !tickets.length">
              <td
                class="border-b border-[var(--border)] px-4 py-2 text-left text-[var(--text-secondary)]"
                colspan="4"
              >
                {{ t("No tickets available") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="lastPage > 1"
        class="mt-5 flex items-center justify-center gap-3"
      >
        <button
          :disabled="busy || page === 1"
          @click="run(() => load(page - 1))"
        >
          {{ t("Previous") }}
        </button>

        <span>{{ page }} / {{ lastPage }}</span>

        <button
          :disabled="busy || page === lastPage"
          @click="run(() => load(page + 1))"
        >
          {{ t("Next") }}
        </button>
      </div>
    </BaseCard>
  </div>
</template>
