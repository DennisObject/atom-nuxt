<script setup lang="ts">
import { Card } from "#components";

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
const guild = ref<DiscordGuild | null>(null);
const loading = ref(false);
const failed = ref(false);
const invite = computed(() =>
  safeUrl(
    guild.value
      ? guild.value.instant_invite || ""
      : session.bootstrap.discord_url || ""
  )
);
const controller = new AbortController();
onBeforeUnmount(() => controller.abort());
onMounted(async () => {
  const id = session.bootstrap.discord_widget_id;
  if (!id || !/^\d+$/.test(id)) return;
  loading.value = true;
  try {
    guild.value = await $fetch<DiscordGuild>(
      `https://discord.com/api/guilds/${id}/widget.json`,
      {
        signal: controller.signal,
        timeout: 10000,
        retry: 0,
      }
    );
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
});
</script>
<template>
  <Card
    v-if="session.bootstrap.discord_widget_id || session.bootstrap.discord_url"
    class="atom-discord-widget"
    :title="t('Discord')"
    :subtitle="guild?.name"
    icon="discord-icon"
  >
    <div
      class="discord-members"
      :class="{ 'without-invite': !invite }"
      :aria-busy="loading"
    >
      <p v-if="loading" class="muted" role="status">{{ t("Please wait…") }}</p>
      <p v-else-if="failed" class="muted" role="status">
        {{ t("Discord is currently unavailable.") }}
      </p>
      <div
        v-for="member in guild?.members"
        :key="member.id"
        class="discord-member"
      >
        <div class="discord-avatar">
          <img :src="safeUrl(member.avatar_url)" alt="" loading="lazy" />
          <span
            class="discord-presence"
            :class="member.status"
            :aria-label="member.status"
            role="img"
          ></span>
        </div>
        <div class="discord-member-text">
          <p class="discord-member-name">
            {{ member.nick || member.username }}
          </p>
          <p v-if="member.game" class="muted">{{ member.game.name }}</p>
        </div>
      </div>
    </div>
    <a
      v-if="invite"
      class="button atom-secondary-button"
      :href="invite"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ t("Join server") }}
    </a>
  </Card>
</template>
<style scoped>
.atom-discord-widget {
  border: 1px solid var(--divider);
}
.atom-discord-widget :deep(.card-body) {
  gap: 12px;
}
.discord-members {
  height: 129px;
  overflow: auto;
  font-size: 14px;
}
.discord-members.without-invite {
  height: 176px;
}
.discord-member {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.discord-member + .discord-member {
  margin-top: 12px;
}
.discord-avatar {
  width: 36px;
  height: 36px;
  position: relative;
  flex-shrink: 0;
}
.discord-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--surface-inset);
}
.discord-presence {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border: 2px solid var(--panel);
  border-radius: 50%;
  background: #9ca3af;
}
.discord-presence.online {
  background: #16a34a;
}
.discord-presence.idle {
  background: #e9b124;
}
.discord-presence.dnd {
  background: #9c0017;
}
.discord-member-text {
  min-width: 0;
  overflow-wrap: anywhere;
}
.discord-member-name {
  font-weight: 600;
}
</style>
