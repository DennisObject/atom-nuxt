<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AppNotice from "~/components/AppNotice.vue";
import type { Data } from "~/utils/api";
import OpenTickets from "~/components/support/OpenTickets.vue";
import TicketComments from "~/components/support/TicketComments.vue";
import TicketDetail from "~/components/support/TicketDetail.vue";
import TicketForm from "~/components/support/TicketForm.vue";

const { api } = useApi();

const { error, fields, run } = usePage();

const route = useRoute();

const id = route.params.id ? encodeURIComponent(String(route.params.id)) : "";

const creating = route.meta.support === "create";

const editing = ref(route.meta.edit === true);

const loaded = ref(false);

const categories = ref<Data<"SupportCategory">[]>([]);

const ticket = ref<Data<"Ticket"> | null>(null);

const openTickets = ref<Data<"Ticket">[]>([]);

const categoryName = computed(
  () =>
    categories.value.find(
      (category) => category.id === ticket.value?.category_id,
    )?.name || "",
);

async function load() {
  categories.value = (await api<Data<"SupportCategory">[]>("/support")).data;

  const items: Data<"Ticket">[] = [];

  let nextPage = 1;

  let lastPage = 1;

  do {
    const result = await api<Data<"Ticket">[]>(
      `/support/tickets?open=1&page=${nextPage}`,
    );

    items.push(...result.data);

    lastPage = result.meta?.last_page || 1;

    nextPage++;
  } while (nextPage <= lastPage);

  openTickets.value = items.filter((item) => String(item.id) !== id);

  if (id) {
    ticket.value = (await api<Data<"Ticket">>(`/support/tickets/${id}`)).data;
  }

  loaded.value = true;
}

async function saved() {
  editing.value = false;

  await run(load);
}

onMounted(() => run(load));
</script>

<template>
  <AppNotice :error="error" :fields="fields" />

  <div
    class="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,9fr)_minmax(0,3fr)]"
  >
    <div class="grid min-w-0 content-start gap-4">
      <TicketForm
        v-if="loaded && (creating || editing)"
        :categories="categories"
        :ticket="ticket"
        @saved="saved"
        @cancel="editing = false"
      />

      <template v-else-if="ticket">
        <TicketDetail
          :ticket="ticket"
          :category-name="categoryName"
          @changed="run(load)"
        />

        <TicketComments :ticket="ticket" @changed="run(load)" />
      </template>
    </div>

    <OpenTickets :open-tickets="openTickets" />
  </div>
</template>
