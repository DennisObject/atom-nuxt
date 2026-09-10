<script setup lang="ts">
import { BaseCard } from "#components";

interface DiscordMember {
  id: string;
  username: string;
  nick?: string;
  avatar_url: string;
  status: string;
  game?: { name: string };
}
interface DiscordGuild {
  name: string;
  instant_invite: string | null;
  members: DiscordMember[];
}

const { t } = useLocale();
const { session } = useSession();
const { safeUrl } = useApi();
const presenceColors: Record<string, string> = {
  online: "bg-green-600",
  idle: "bg-[#e9b124]",
  dnd: "bg-[#9c0017]",
};

const guild = ref<DiscordGuild | null>(null);
const loading = ref(false);
const failed = ref(false);
const invite = computed(() =>
  safeUrl(
    guild.value
      ? guild.value.instant_invite || ""
      : session.bootstrap.discord_url || "",
  ),
);
const controller = new AbortController();
onBeforeUnmount(() => controller.abort());
onMounted(async () => {
  const id = session.bootstrap.discord_widget_id;
  if (!id || !/^\d+$/.test(id)) {
    return;
  }
  loading.value = true;
  try {
    guild.value = await $fetch<DiscordGuild>(
      `https://discord.com/api/guilds/${id}/widget.json`,
      {
        signal: controller.signal,
        timeout: 10000,
        retry: 0,
      },
    );
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
});
</script>
<template>
  <BaseCard
    v-if="session.bootstrap.discord_widget_id || session.bootstrap.discord_url"
    class="[&_.card-body]:gap-3 [&_.card-heading]:border-0"
    :title="t('Discord')"
    :subtitle="guild?.name"
    icon="discord-icon"
  >
    <div
      class="overflow-auto text-sm dark:text-gray-200"
      :class="invite ? 'h-[129px]' : 'h-[176px]'"
      :aria-busy="loading"
    >
      <p v-if="loading" class="text-[var(--muted)]" role="status">
        {{ t("Please wait…") }}
      </p>
      <p v-else-if="failed" class="text-[var(--muted)]" role="status">
        {{ t("Discord is currently unavailable.") }}
      </p>
      <div
        v-for="member in guild?.members"
        :key="member.id"
        class="mt-3 flex items-center gap-2 first:mt-1"
      >
        <div
          class="relative size-9 shrink-0 [&_img]:size-full [&_img]:rounded-full [&_img]:bg-[var(--surface-inset)]"
        >
          <img :src="safeUrl(member.avatar_url)" alt="" loading="lazy" />
          <span
            class="absolute right-0 bottom-0 size-3 rounded-full border-2 border-current dark:border-gray-800"
            :class="presenceColors[member.status] || 'bg-gray-400'"
            :aria-label="member.status"
            role="img"
          ></span>
        </div>
        <div class="min-w-0 wrap-anywhere">
          <p class="font-semibold">
            {{ member.nick || member.username }}
          </p>
          <p v-if="member.game" class="text-[var(--muted)]">
            {{ member.game.name }}
          </p>
        </div>
      </div>
    </div>
    <a
      v-if="invite"
      class="flex w-full items-center justify-center rounded border-2 border-green-500 bg-green-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-700"
      :href="invite"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ t("Join server") }}
    </a>
  </BaseCard>
</template>
