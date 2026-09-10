<script setup lang="ts">
import { reactive } from "vue";
import { BaseCard } from "#components";
import AppNotice from "~/components/AppNotice.vue";
import type { Data } from "~/utils/api";

const { t } = useLocale();
const { api } = useApi();
const { busy, error, fields, success, run } = usePage();

const props = defineProps<{
  categories: Data<"SupportCategory">[];
  ticket?: Data<"Ticket"> | null;
}>();
const emit = defineEmits<{ saved: []; cancel: [] }>();
const router = useRouter();
const form = reactive({
  category_id: String(
    props.ticket?.category_id || props.categories[0]?.id || "",
  ),
  title: props.ticket?.title || "",
  content: props.ticket?.content || "",
});

async function save() {
  await run(async () => {
    const id = props.ticket?.id;
    const result = await api<Data<"Ticket">>(
      `/support/tickets${id ? `/${id}` : ""}`,
      id ? "PUT" : "POST",
      { ...form, category_id: Number(form.category_id) },
    );
    if (id) {
      emit("saved");
    } else {
      await router.push(`/help-center/tickets/${result.data.id}`);
    }
  }, "Your ticket has been saved.");
}
</script>

<template>
  <AppNotice :error="error" :fields="fields" :success="success" />
  <BaseCard
    :title="t(ticket ? 'Edit your ticket' : 'Create a ticket')"
    :subtitle="t('Please describe your request below')"
    icon="chat-icon"
  >
    <form class="flex flex-col gap-4" @submit.prevent="save">
      <select
        class="w-full rounded border-4 border-[var(--border)] bg-[var(--surface-inset)] px-3 py-2 text-[var(--text)] focus:border-[#eeb425] focus:shadow-none"
        v-model="form.category_id"
        :aria-label="t('Category')"
        required
      >
        <option
          v-for="category in categories"
          :key="category.id"
          :value="String(category.id)"
        >
          {{ category.name }}
        </option>
      </select>
      <label>
        {{ t("Title") }}
        <input
          class="w-full rounded border-4 border-[var(--border)] bg-[var(--surface-inset)] px-3 py-2 text-[var(--text)] focus:border-[#eeb425] focus:shadow-none"
          v-model="form.title"
          required
          minlength="10"
          maxlength="255"
          :placeholder="t('Enter a title for your ticket')"
        />
      </label>
      <TicketEditor v-model="form.content" :disabled="busy" />
      <div class="flex gap-4">
        <button
          class="w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white hover:bg-green-700"
          :disabled="busy"
        >
          {{ t(ticket ? "Update ticket" : "Submit ticket") }}
        </button>
        <button
          v-if="ticket"
          class="border-[var(--border)] bg-[var(--surface-muted)]"
          type="button"
          @click="emit('cancel')"
        >
          {{ t("Cancel") }}
        </button>
      </div>
    </form>
  </BaseCard>
</template>
