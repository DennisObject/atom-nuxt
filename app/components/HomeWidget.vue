<script setup lang="ts">
import type { Data } from "~/utils/api";
import WidgetGuestbook from "./home/WidgetGuestbook.vue";
import WidgetProfile from "./home/WidgetProfile.vue";
import WidgetRating from "./home/WidgetRating.vue";
import WidgetRooms from "./home/WidgetRooms.vue";

const { t } = useLocale();
const { api, safeUrl } = useApi();
const { avatar, session } = useSession();
const props = defineProps<{
  username: string;
  memberSince?: string;
  item: Data<"HomeItem">;
  visitor: boolean;
  editing: boolean;
}>();
const { busy, error, run } = usePage();
const widget = ref<Data<"HomeWidget"> | null>(null);
const message = ref("");
const pagination = computed(() =>
  widget.value && ["my-friends", "my-badges"].includes(widget.value.type)
    ? (
        widget.value as Extract<
          Data<"HomeWidget">,
          { type: "my-friends" | "my-badges" }
        >
      ).content
    : null,
);

async function load(page = 1) {
  widget.value = (
    await api<Data<"HomeWidget">>(
      `/homes/${props.username}/widgets/${props.item.id}?friends_page=${page}&badges_page=${page}`,
    )
  ).data;
}

const { data: initialWidget, error: widgetError } = await useAsyncData(
  `home-widget:${props.username}:${props.item.id}`,
  async () =>
    (
      await api<Data<"HomeWidget">>(
        `/homes/${props.username}/widgets/${props.item.id}`,
      )
    ).data,
);
widget.value = initialWidget.value || null;
if (widgetError.value) {
  error.value = widgetError.value.message;
}

async function post() {
  await run(async () => {
    await api(`/homes/${props.username}/messages`, "POST", {
      content: message.value,
    });
    message.value = "";
    await load();
  });
}

async function rate(rating: number) {
  await run(async () => {
    await api(`/homes/${props.username}/ratings`, "POST", {
      rating,
    });
    await load();
  });
}
</script>
<template>
  <div class="p-2 text-sm">
    <AppNotice :error="error" />
    <template v-if="widget">
      <p v-if="widget.supported === false" class="text-[var(--muted)]">
        {{ t("This widget is not available for this hotel.") }}
      </p>
      <WidgetProfile
        v-else-if="widget.type === 'my-profile'"
        :content="widget.content"
        :member-since="memberSince"
      />
      <WidgetRooms
        v-else-if="widget.type === 'my-rooms'"
        :content="widget.content"
      />
      <template v-else-if="widget.type === 'my-badges'">
        <div class="grid grid-cols-4 gap-1 p-1">
          <img
            v-for="badge in widget.content?.items"
            :key="badge.code"
            class="size-10 object-contain"
            :src="
              safeUrl(
                `${session.bootstrap.assets?.badge || ''}/${badge.code}.gif`,
              )
            "
            :alt="badge.code"
          />
        </div>
      </template>
      <template v-else-if="widget.type === 'my-friends'">
        <div class="grid grid-cols-2 gap-1.5 p-1">
          <NuxtLink
            v-for="friend in widget.content.items.filter(
              (friend) => friend !== null,
            )"
            :key="friend.id"
            class="flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--surface-muted)] p-1"
            :to="`/home/${friend.username}`"
          >
            <img
              class="h-14 w-8 shrink-0 object-cover object-[-7px_-7px] [image-rendering:pixelated]"
              :src="
                avatar(friend, { size: 's', direction: 4, head_direction: 4 })
              "
              alt=""
            />
            <strong
              class="truncate text-xs font-semibold text-blue-500 hover:underline"
            >
              {{ friend.username }}
            </strong>
          </NuxtLink>
        </div>
      </template>
      <WidgetRating
        v-else-if="widget.type === 'my-rating'"
        :content="widget.content"
        :busy="busy"
        :visitor="visitor"
        :editing="editing"
        @rate="rate"
      />
      <WidgetGuestbook
        v-model="message"
        v-else-if="widget.type === 'my-guestbook'"
        :content="widget.content"
        :busy="busy"
        :visitor="visitor"
        :editing="editing"
        @post="post"
      />
      <div
        v-if="pagination && pagination.last_page > 1"
        class="mt-5 flex items-center justify-center gap-3"
      >
        <button
          class="px-[11px] py-[5px] text-[13px]"
          :disabled="busy || pagination.current_page === 1"
          @click="run(() => load((pagination?.current_page || 1) - 1))"
        >
          ←
        </button>
        <span>{{ pagination.current_page }}/{{ pagination.last_page }}</span>
        <button
          class="px-[11px] py-[5px] text-[13px]"
          :disabled="busy || pagination.current_page === pagination.last_page"
          @click="run(() => load((pagination?.current_page || 1) + 1))"
        >
          →
        </button>
      </div>
    </template>
  </div>
</template>
