<script setup lang="ts">
const { session, error, articles } = useMePage();
</script>

<template>
  <AppNotice :error="error" />

  <div
    v-if="session.user"
    class="grid grid-cols-12 items-start gap-x-3 gap-y-8"
  >
    <div class="col-span-12 grid min-w-0 gap-3 md:col-span-9">
      <MeHero />

      <OnlineFriends />

      <ReferralCard />
    </div>

    <aside class="col-span-12 grid min-w-0 gap-3 md:col-span-3">
      <NewsCarousel :articles="articles" />

      <DiscordWidget />
    </aside>
  </div>
</template>
