<script setup lang="ts">
import Applications from "~/components/community/Applications.vue";
import Leaderboards from "~/components/community/Leaderboards.vue";
import PhotoGallery from "~/components/community/PhotoGallery.vue";
import TeamDirectory from "~/components/community/TeamDirectory.vue";
import StaffDirectory from "~/components/community/StaffDirectory.vue";

const { artwork, theme } = useAppConfig();
const { t } = useLocale();
const route = useRoute();
const section = String(route.meta.section || route.params.section || "staff");
const titles: Record<string, string> = {
  staff: "Meet the staff",
  teams: "Our teams",
  leaderboard: "Leaderboards",
  photos: "Photos",
  "staff-applications": "Staff applications",
  "team-applications": "Team applications",
};
const title = computed(() => t(titles[section] || "Community"));
const headingImage = computed(() =>
  section === "leaderboard"
    ? artwork.leaderboard
    : section === "photos"
      ? artwork.photos
      : artwork.community,
);
useSeoMeta({ title: () => title.value });
</script>

<template>
  <div
    v-if="
      theme.name === 'dusk' &&
      ['leaderboard', 'photos'].includes(section) &&
      !route.params.id
    "
    class="mb-4 flex items-center gap-4 rounded-lg bg-[var(--header)] p-3"
  >
    <img :src="headingImage" alt="" class="max-h-11" />
    <h1 class="text-lg font-bold">{{ title }}</h1>
  </div>
  <StaffDirectory v-if="section === 'staff'" :section="section" />
  <TeamDirectory v-else-if="section === 'teams'" />
  <Leaderboards v-else-if="section === 'leaderboard'" />
  <PhotoGallery v-else-if="section === 'photos'" />
  <Applications
    v-else-if="section.endsWith('applications')"
    :section="section"
  />
</template>
