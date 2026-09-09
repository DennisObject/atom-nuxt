<script setup lang="ts">
const { t } = useLocale();
import { computed, ref } from "vue";
const { api, safeUrl } = useApi();
import type { Data } from "~/utils/api";
const { avatar, session } = useSession();
import { usePage } from "~/composables/usePage";
import Notice from "./Notice.vue";
const props = defineProps<{
  username: string;
  memberSince?: string;
  item: Data<"HomeItem">;
  visitor: boolean;
  editing: boolean;
}>();
const { busy, error, run } = usePage();
const widget = ref<Data<"HomeWidget"> | null>(null),
  message = ref(""),
  rating = ref(5);
const pagination = computed(() =>
  widget.value && ["my-friends", "my-badges"].includes(widget.value.type)
    ? (
        widget.value as Extract<
          Data<"HomeWidget">,
          { type: "my-friends" | "my-badges" }
        >
      ).content
    : null
);
async function load(page = 1) {
  widget.value = (
    await api<Data<"HomeWidget">>(
      `/homes/${props.username}/widgets/${props.item.id}?friends_page=${page}&badges_page=${page}`
    )
  ).data;
}
const { data: initialWidget, error: widgetError } = await useAsyncData(
  `home-widget:${props.username}:${props.item.id}`,
  async () =>
    (
      await api<Data<"HomeWidget">>(
        `/homes/${props.username}/widgets/${props.item.id}`
      )
    ).data
);
widget.value = initialWidget.value || null;
if (widgetError.value) error.value = widgetError.value.message;
async function post() {
  await run(async () => {
    await api(`/homes/${props.username}/messages`, "POST", {
      content: message.value,
    });
    message.value = "";
    await load();
  });
}
async function rate() {
  await run(async () => {
    await api(`/homes/${props.username}/ratings`, "POST", {
      rating: Number(rating.value),
    });
    await load();
  });
}
</script>
<template>
  <div class="home-widget-content">
    <Notice :error="error" /><template v-if="widget">
      <p v-if="widget.supported === false" class="muted">
        {{ t("This widget is not available for this hotel.") }}
      </p>
      <template v-else-if="widget.type === 'my-profile'">
        <div class="widget-profile">
          <div>
            <NuxtLink :to="`/home/${widget.content.username}`"
              ><strong>{{ widget.content.username }}</strong></NuxtLink
            ><small :class="{ online: widget.content.online }">{{
              t(widget.content.online ? "Online" : "Offline")
            }}</small
            ><small v-if="memberSince"
              >{{ t("Member since") }} {{ memberSince.slice(0, 10) }}</small
            >
          </div>
          <img :src="avatar(widget.content)" :alt="widget.content.username" />
        </div>
        <p class="profile-motto">{{ widget.content.motto }}</p>
      </template>
      <template v-else-if="widget.type === 'my-rooms'">
        <div v-for="room in widget.content" :key="room.id" class="widget-room">
          <span :class="['room-state', room.state]" :title="room.state"></span>
          <div>
            <strong>{{ room.name }}</strong>
            <p>{{ room.description }}</p>
          </div>
        </div>
        <p v-if="!widget.content.length" class="muted">
          {{ t("No rooms yet.") }}
        </p>
      </template>
      <template v-else-if="widget.type === 'my-badges'"
        ><div class="flex items-center gap-4 flex-wrap">
          <img
            v-for="badge in widget.content?.items"
            :key="badge.code"
            :src="
              safeUrl(
                `${session.bootstrap.assets?.badge || ''}/${badge.code}.gif`
              )
            "
            :alt="badge.code"
          /></div
      ></template>
      <template v-else-if="widget.type === 'my-friends'"
        ><NuxtLink
          v-for="friend in widget.content.items.filter(
            (friend) => friend !== null
          )"
          :key="friend.id"
          class="user-row"
          :to="`/home/${friend.username}`"
          ><img :src="avatar(friend)" alt="" /><strong>{{
            friend.username
          }}</strong></NuxtLink
        ></template
      >
      <template v-else-if="widget.type === 'my-rating'">
        <div class="widget-rating">
          <strong>{{
            t("Average rating: :n", {
              n: Number(widget.content.average).toFixed(1),
            })
          }}</strong>
          <div class="rating-stars">
            <button
              v-for="value in 5"
              :key="value"
              :class="{ rated: widget.content.average >= value }"
              :disabled="busy || !visitor || editing"
              :aria-label="t('Rate :n stars', { n: value })"
              @click="
                rating = value;
                rate();
              "
            >
              ★
            </button>
          </div>
          <span>{{ t(":n votes total", { n: widget.content.total }) }}</span
          ><span>{{
            t("(:n users voted 4 or better)", { n: widget.content.positive })
          }}</span>
        </div>
      </template>
      <template v-else-if="widget.type === 'my-guestbook'"
        ><article
          v-for="entry in widget.content"
          :key="entry.id"
          class="comment"
        >
          <strong>{{ entry.author?.username }}</strong>
          <p>{{ entry.content }}</p>
        </article>
        <form v-if="visitor && !editing" @submit.prevent="post">
          <label>
            {{ t("Leave a message") }}
            <textarea
              v-model="message"
              required
              maxlength="2000"
            ></textarea></label
          ><button class="small" :disabled="busy">
            {{ t("Post message") }}
          </button>
        </form></template
      >
      <div v-if="pagination && pagination.last_page > 1" class="pagination">
        <button
          class="small"
          :disabled="busy || pagination.current_page === 1"
          @click="run(() => load((pagination?.current_page || 1) - 1))"
        >
          ←</button
        ><span>{{ pagination.current_page }}/{{ pagination.last_page }}</span
        ><button
          class="small"
          :disabled="busy || pagination.current_page === pagination.last_page"
          @click="run(() => load((pagination?.current_page || 1) + 1))"
        >
          →
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.widget-profile {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #4b5563;
  padding: 8px 8px 12px;
  gap: 12px;
}
.widget-profile a {
  color: #60a5fa;
}
.widget-profile small {
  display: block;
  font-size: 12px;
  color: #9ca3af;
}
.widget-profile .online {
  color: #4ade80;
}
.widget-profile img {
  width: 64px;
  height: auto;
  image-rendering: pixelated;
}
.profile-motto {
  font-style: italic;
  font-size: 12px;
  padding: 8px;
}
.widget-room {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #4b5563;
  padding: 4px;
}
.widget-room strong {
  font-size: 12px;
}
.widget-room p {
  font-size: 10px;
  color: #9ca3af;
}
.room-state {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 4px;
}
.room-state.open,
.room-state.invisible {
  background: #14532d80;
}
.room-state.locked {
  background: #713f1280;
}
.room-state.password {
  background: #7f1d1d80;
}
.widget-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  font-size: 12px;
}
.widget-rating span {
  color: #9ca3af;
}
.rating-stars {
  display: flex;
  gap: 4px;
}
.rating-stars button {
  background: transparent;
  border: 0;
  padding: 0;
  min-height: 0;
  color: #4b5563;
  font-size: 24px;
}
.rating-stars button.rated {
  color: #facc15;
}
.rating-stars button:hover:not(:disabled) {
  color: #fde047;
}
</style>
