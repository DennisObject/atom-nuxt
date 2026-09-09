<script setup lang="ts">
const { artwork } = useAppConfig();
import { displayDate } from "~/utils/date";
const { t } = useLocale();
import { onMounted, reactive, ref } from "vue";

const { api, safeUrl } = useApi();
import type { Data } from "~/utils/api";
const { session, avatar } = useSession();
import { usePage } from "~/composables/usePage";
import { Card } from "#components";
import Notice from "~/components/Notice.vue";
import RichText from "~/components/RichText.vue";
const route = useRoute(),
  router = useRouter();
const kind = String(route.meta.support || "index"),
  id = route.params.id ? encodeURIComponent(String(route.params.id)) : "";
const { busy, error, fields, success, run } = usePage();
const categories = ref<Data<"SupportCategory">[]>([]),
  tickets = ref<Data<"Ticket">[]>([]),
  ticket = ref<Data<"Ticket"> | null>(null),
  rules = ref<Data<"RuleCategory">[]>([]),
  openTickets = ref<Data<"Ticket">[]>([]);
const form = reactive({ category_id: "", title: "", content: "" }),
  reply = ref(""),
  editing = ref(route.meta.edit === true);
const allTickets = route.meta.all === true;
const page = ref(1),
  lastPage = ref(1);
async function load(nextPage = 1) {
  if (kind === "rules") {
    rules.value = (await api<Data<"RuleCategory">[]>("/rules")).data;
    return;
  }
  categories.value = (await api<Data<"SupportCategory">[]>("/support")).data;
  if (!form.category_id && categories.value[0])
    form.category_id = String(categories.value[0].id);
  if (kind === "create" || id) {
    let next = 1;
    const items: Data<"Ticket">[] = [];
    do {
      const result = await api<Data<"Ticket">[]>(
        `/support/tickets?open=1&page=${next}`
      );
      items.push(...result.data);
      if (next >= (result.meta?.last_page || 1)) break;
      next++;
    } while (true);
    openTickets.value = items.filter((item) => String(item.id) !== id);
  }
  if (id) {
    ticket.value = (await api<Data<"Ticket">>(`/support/tickets/${id}`)).data;
    form.category_id = String(ticket.value.category_id);
    form.title = ticket.value.title;
    form.content = ticket.value.content;
  } else if (kind !== "create") {
    const result = await api<Data<"Ticket">[]>(
      `/support/tickets?page=${nextPage}${allTickets ? "&all=1" : ""}`
    );
    tickets.value = result.data;
    page.value = result.meta?.current_page || nextPage;
    lastPage.value = result.meta?.last_page || 1;
  }
}
if (kind === "rules") {
  const { data: initialRules, error: rulesError } = await useAsyncData(
    "hotel-rules",
    async () => (await api<Data<"RuleCategory">[]>("/rules")).data
  );
  rules.value = initialRules.value || [];
  if (rulesError.value) error.value = rulesError.value.message;
} else {
  onMounted(() => run(() => load()));
}
useSeoMeta({
  title: () => t(kind === "rules" ? "Hotel rules" : "Help center"),
});
async function save() {
  await run(async () => {
    const result = await api(
      `/support/tickets${id ? `/${id}` : ""}`,
      id ? "PUT" : "POST",
      { ...form, category_id: Number(form.category_id) }
    );
    if (id) {
      editing.value = false;
      await load();
    } else await router.push(`/help-center/tickets/${result.data.id}`);
  }, "Your ticket has been saved.");
}
async function postReply() {
  await run(async () => {
    await api(`/support/tickets/${id}/replies`, "POST", {
      content: reply.value,
    });
    reply.value = "";
    await load();
  }, "Your reply has been sent.");
}
async function toggle() {
  await run(async () => {
    await api(`/support/tickets/${id}/toggle-status`, "POST");
    await load();
  });
}
async function remove(ticketId = id) {
  if (!window.confirm("Delete this support ticket and its replies?")) return;
  await run(async () => {
    await api(`/support/tickets/${ticketId}`, "DELETE");
    if (id) await router.push("/help-center");
    else await load(page.value);
  });
}
async function removeReply(replyId: number) {
  await run(async () => {
    await api(`/support/replies/${replyId}`, "DELETE");
    await load();
  });
}
</script>
<template>
  <Notice :error="error" :fields="fields" :success="success" />
  <template v-if="kind === 'rules'">
    <div class="section-heading support-heading">
      <h1><img :src="artwork.rules" alt="" />{{ t("Rules") }}</h1>
    </div>
    <div class="stack">
      <Card
        v-for="category in rules"
        :key="category.id"
        :title="category.name"
        :subtitle="category.description"
        :icon="category.badge || 'rules_icon'"
      >
        <div v-for="rule in category.rules" :key="rule.id" class="rule-line">
          <strong>{{ rule.paragraph }}.</strong><RichText :html="rule.rule" />
        </div>
      </Card>
    </div>
  </template>
  <div v-else-if="kind === 'create' || id" class="ticket-grid">
    <div class="ticket-main stack">
      <Card
        v-if="kind === 'create' || editing"
        :title="t(editing ? 'Edit your ticket' : 'Create a ticket')"
        :subtitle="t('Please describe your request below')"
        icon="chat-icon"
      >
        <form class="ticket-form" @submit.prevent="save">
          <select
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
          <label
            >{{ t("Title")
            }}<input
              v-model="form.title"
              required
              minlength="10"
              maxlength="255"
              :placeholder="t('Enter a title for your ticket')"
          /></label>
          <TicketEditor v-model="form.content" :disabled="busy" />
          <div class="flex gap-4">
            <button class="ticket-submit" :disabled="busy">
              {{ t(editing ? "Update ticket" : "Submit ticket") }}</button
            ><button
              v-if="editing"
              class="secondary"
              type="button"
              @click="editing = false"
            >
              {{ t("Cancel") }}
            </button>
          </div>
        </form>
      </Card>
      <template v-else-if="ticket">
        <Card
          :title="`${ticket.title} [${
            categories.find((category) => category.id === ticket?.category_id)
              ?.name || ''
          }]`"
          icon="chat-icon"
        >
          <NuxtLink
            class="ticket-edit"
            :to="`/help-center/tickets/edit/${ticket.id}`"
            :aria-label="t('Edit ticket')"
            ><svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 0 1 2.652 2.652L10.582 16.07 6 18l1.417-4.49 9.445-9.023ZM5 6H4v14h14v-7"
              /></svg
          ></NuxtLink>
          <div class="flex gap-3">
            <button
              class="ticket-submit grow"
              :class="{ reopen: !ticket.open }"
              :disabled="busy"
              @click="toggle"
            >
              {{ t(ticket.open ? "Close" : "Re-open") }}</button
            ><button
              v-if="ticket.can_delete"
              class="danger grow"
              :disabled="busy"
              @click="remove()"
            >
              {{ t("Delete") }}
            </button>
          </div>
          <RichText class="ticket-content" :html="ticket.content" />
        </Card>
        <Card
          :title="t('Comments')"
          :subtitle="t('Please submit your reply below')"
          icon="duo-chat-icon"
        >
          <form
            v-if="ticket.open"
            class="ticket-form"
            @submit.prevent="postReply"
          >
            <TicketEditor v-model="reply" :disabled="busy" />
            <div>
              <button class="ticket-submit" :disabled="busy">
                {{ t("Submit reply") }}
              </button>
            </div>
          </form>
          <div class="stack mt-4">
            <article
              v-for="item in [...(ticket.replies || [])].reverse()"
              :key="item.id"
              class="ticket-reply"
            >
              <header :class="{ other: item.author?.id !== session.user?.id }">
                <div class="reply-author">
                  <img :src="avatar(item.author)" alt="" /><small>{{
                    item.author?.username
                  }}</small>
                </div>
                <div class="flex gap-2">
                  <small>{{ displayDate(item.created_at, true) }}</small
                  ><button
                    v-if="item.can_delete"
                    class="text-button"
                    :aria-label="t('Delete reply')"
                    :disabled="busy"
                    @click="removeReply(item.id)"
                  >
                    <svg
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
              </header>
              <RichText class="p-4" :html="item.content" />
            </article>
            <p v-if="!ticket.replies?.length">
              {{ t("There is currently no replies") }}
            </p>
          </div>
        </Card>
      </template>
    </div>
    <aside>
      <Card
        :title="t('Open tickets')"
        :subtitle="t('Your current open tickets')"
        icon="duo-chat-icon"
        ><div class="stack open-tickets">
          <NuxtLink
            v-for="item in openTickets"
            :key="item.id"
            :to="`/help-center/tickets/${item.id}`"
            ><span aria-hidden="true">»</span>
            {{
              item.title.length > 20
                ? item.title.slice(0, 20) + "…"
                : item.title
            }}</NuxtLink
          >
          <p v-if="!openTickets.length">
            {{ t("You currently have no open tickets.") }}
          </p>
        </div></Card
      >
    </aside>
  </div>
  <div v-else class="stack">
    <div v-if="!allTickets" class="support-categories">
      <div v-for="small in [false, true]" :key="String(small)" class="stack">
        <Card
          v-for="category in categories.filter(
            (item) => item.small_box === small
          )"
          :key="category.id"
          :title="category.name"
          icon="duo-chat-icon"
        >
          <div class="support-copy">
            <img
              v-if="!small && category.image_url"
              class="support-image"
              :src="
                safeUrl(
                  category.image_url.startsWith('/') ||
                    /^https?:/.test(category.image_url)
                    ? category.image_url
                    : `/assets/images/help-center/${category.image_url}`
                )
              "
              alt=""
            /><RichText :html="category.content" />
          </div>
          <a
            v-if="safeUrl(category.button_url)"
            class="button support-link"
            :style="{
              backgroundColor: category.button_color,
              borderColor: category.button_border_color,
            }"
            :href="safeUrl(category.button_url)"
            >{{ category.button_text || t("Read more") }}</a
          >
        </Card>
      </div>
    </div>
    <div class="flex gap-4 flex-wrap">
      <NuxtLink class="button ticket-submit" to="/help-center/tickets/create">{{
        t("Create a ticket")
      }}</NuxtLink
      ><NuxtLink
        v-if="session.user?.can_manage_tickets"
        :to="allTickets ? '/help-center' : '/help-center/tickets/all'"
        >{{
          t(allTickets ? "Your support tickets" : "All support tickets")
        }}</NuxtLink
      >
    </div>
    <Card
      :title="t(allTickets ? 'All tickets' : 'Your support tickets')"
      icon="chat-icon"
    >
      <div class="table-wrap">
        <table class="ticket-table">
          <thead>
            <tr>
              <th>{{ t("Title") }}</th>
              <th>{{ t("Author") }}</th>
              <th>{{ t("Status") }}</th>
              <th>{{ t("Actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in tickets" :key="item.id">
              <td>{{ item.title }}</td>
              <td>{{ item.author?.username }}</td>
              <td>{{ t(item.open ? "Open" : "Closed") }}</td>
              <td>
                <div class="flex gap-3">
                  <NuxtLink
                    :to="`/help-center/tickets/${item.id}`"
                    :aria-label="t('View ticket')"
                    ><svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path d="M2 12C6 3 18 3 22 12 18 21 6 21 2 12Z" />
                      <circle cx="12" cy="12" r="3" /></svg></NuxtLink
                  ><NuxtLink
                    :to="`/help-center/tickets/edit/${item.id}`"
                    :aria-label="t('Edit ticket')"
                    ><svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 0 1 2.652 2.652L10.582 16.07 6 18l1.417-4.49 9.445-9.023ZM5 6H4v14h14v-7"
                      /></svg></NuxtLink
                  ><button
                    v-if="item.can_delete"
                    class="text-button"
                    :aria-label="t('Delete ticket')"
                    :disabled="busy"
                    @click="remove(String(item.id))"
                  >
                    <svg
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
              <td colspan="4">{{ t("No tickets available") }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="lastPage > 1" class="pagination">
        <button
          :disabled="busy || page === 1"
          @click="run(() => load(page - 1))"
        >
          {{ t("Previous") }}</button
        ><span>{{ page }} / {{ lastPage }}</span
        ><button
          :disabled="busy || page === lastPage"
          @click="run(() => load(page + 1))"
        >
          {{ t("Next") }}
        </button>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.support-categories {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
}
.support-copy {
  padding: 0 8px;
  font-size: 14px;
  color: var(--text, #e5e7eb);
}
.support-image {
  float: right;
  padding: 0 8px;
  max-width: 45%;
}
.support-link {
  align-self: flex-start;
  padding: 4px 8px;
  font-size: 14px;
  border: 2px solid;
  margin: 16px 0 0 8px;
}
.support-heading {
  padding: 12px;
  background: var(--header, #21242e);
  border-radius: 8px;
}
.support-heading h1 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
}
.support-heading img {
  max-height: 44px;
}
.rule-line {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: var(--text-secondary, #d1d5db);
}
.rule-line :deep(p) {
  margin: 0;
}
.ticket-grid {
  display: grid;
  grid-template-columns: minmax(0, 9fr) minmax(0, 3fr);
  gap: 16px;
  align-items: start;
}
.ticket-main {
  min-width: 0;
}
.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ticket-form input,
.ticket-form select {
  background: var(--surface-inset, #1f2937);
  border: 4px solid var(--border, #374151);
  color: var(--text, #e5e7eb);
  padding: 8px 12px;
  border-radius: 4px;
  width: 100%;
}
.ticket-form input:focus,
.ticket-form select:focus {
  border-color: #eeb425;
  box-shadow: none;
}
.ticket-submit {
  width: 100%;
  padding: 8px;
  font-weight: 600;
  background: var(--color-green-600);
  border: 2px solid var(--color-green-500);
  border-radius: 4px;
  color: white;
}
.ticket-submit:hover {
  background: var(--color-green-700);
}
.ticket-submit.reopen {
  background: #eeb425;
  border-color: #facc15;
}
.ticket-content {
  margin-top: 32px;
}
.ticket-edit {
  align-self: flex-end;
}
.ticket-reply {
  background: var(--surface-muted, #374151);
  border-radius: 4px;
  overflow: hidden;
}
.ticket-reply header {
  display: flex;
  height: 50px;
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #1f2937;
  position: relative;
  overflow: hidden;
  color: var(--text-subtle, #9ca3af);
}
.reply-author {
  padding-left: 56px;
}
.reply-author img {
  position: absolute;
  left: 8px;
  bottom: -40px;
}
.ticket-reply header.other {
  flex-direction: row-reverse;
}
.other .reply-author {
  padding-left: 0;
  padding-right: 56px;
}
.other .reply-author img {
  left: auto;
  right: 8px;
  transform: scaleX(-1);
}
.open-tickets {
  gap: 8px;
}
.open-tickets a {
  padding: 8px;
  background: var(--surface-muted, #374151);
  border-radius: 4px;
}
.open-tickets a:hover {
  color: #eeb425;
}
.ticket-table {
  width: 100%;
  font-size: 14px;
  border: 1px solid var(--border, #374151);
  border-radius: 4px;
}
.ticket-table th {
  background: var(--surface-inset, #1f2937);
  color: var(--text);
}
.ticket-table td,
.ticket-table th {
  padding: 8px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border, #374151);
}
.ticket-table td {
  color: var(--text-secondary, #d1d5db);
}
.ticket-grid svg,
.ticket-table svg {
  width: 20px;
  height: 20px;
}
@media (max-width: 1023px) {
  .support-categories,
  .ticket-grid {
    grid-template-columns: 1fr;
  }
}
</style>
