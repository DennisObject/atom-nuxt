<script setup lang="ts">
import type { Data } from "~/utils/api";
import LeaderboardEntry from "./LeaderboardEntry.vue";

const { theme } = useAppConfig();

const isAtom = theme.name === "atom";

const { t } = useLocale();

const { api } = useApi();

const boardIcons: Record<string, string> = {
  credits: "credits.png",
  duckets: "duckets.png",
  diamonds: "diamond.png",
  mostOnline: "clock.gif",
  respectsReceived: "heart.gif",
  achievementScores: "star.gif",
};

const boardNames: Record<string, string> = {
  credits: "Credits",
  duckets: "Duckets",
  diamonds: "Diamonds",
  mostOnline: "Hours online",
  respectsReceived: "Respect received",
  achievementScores: "Achievement points",
};

const boardTitles: Record<string, string> = {
  credits: "Top credits",
  duckets: "Top duckets",
  diamonds: "Top diamonds",
  mostOnline: "Hours online",
  respectsReceived: "Respects received",
  achievementScores: "Achievement score",
};

const { data: boards, error } = await useAsyncData(
  "community:leaderboard",
  async () => (await api<Data<"Leaderboards">>("/leaderboards")).data,
);
</script>

<template>
  <AppNotice :error="error?.message" />

  <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
    <template v-for="(users, key) in boards" :key="key">
      <section
        v-if="users"
        class="flex flex-col gap-3"
        :class="{ 'rounded bg-white p-2 shadow-sm dark:bg-gray-900': isAtom }"
      >
        <h2
          class="flex items-center gap-2 text-base font-bold"
          :class="
            isAtom
              ? 'justify-center border-b border-[var(--border)] mb-1 font-semibold'
              : 'rounded-md bg-[color-mix(in_srgb,var(--header)_90%,transparent)] px-4 py-2'
          "
        >
          <img
            class="w-4 [image-rendering:pixelated]"
            :src="`/assets/images/icons/${boardIcons[String(key)]}`"
            alt=""
          />
          {{
            t((isAtom ? boardTitles : boardNames)[String(key)] || String(key))
          }}
        </h2>

        <LeaderboardEntry
          v-for="(entry, index) in users"
          :key="entry.user.id"
          :entry="entry"
          :index="index"
          :online-time="key === 'mostOnline'"
          :label="
            t(
              key === 'mostOnline'
                ? 'Hours online'
                : boardNames[String(key)] || String(key),
            )
          "
        />

        <p v-if="!users.length" class="text-[var(--muted)]">
          {{ t("No rankings yet.") }}
        </p>
      </section>
    </template>
  </div>
</template>
