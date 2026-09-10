<script setup lang="ts">
const { session, error, articles } = useMePage();
</script>

<template>
  <AppNotice :error="error" />

  <div v-if="session.user" class="grid grid-cols-12 items-start gap-4">
    <MeHero class="col-span-12 md:col-span-8" />

    <NewsCarousel
      class="col-span-12 md:col-span-4"
      :articles="articles.filter((article) => article.author).slice(0, 5)"
    />

    <OnlineFriends class="col-span-12 md:col-span-8" />

    <ReferralCard class="col-span-12 md:col-span-8 md:col-start-1" />
  </div>
</template>
