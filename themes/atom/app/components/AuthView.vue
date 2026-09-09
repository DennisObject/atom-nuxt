<script setup lang="ts">
import { computed, ref } from "vue";
import type { Data } from "~/utils/api";
import PhotoLightbox from "~/components/PhotoLightbox.vue";
import AuthForm from "~/components/AuthForm.vue";
import { ArticleTile, Card } from "#components";
const { t } = useLocale();
const { api, safeUrl } = useApi();
const { session } = useSession();
const route = useRoute();
const photoViewer = ref<InstanceType<typeof PhotoLightbox>>();
const kind = computed(() => String(route.meta.authKind || "login"));
const isHome = computed(() => route.path === "/");
const titles: Record<string, string> = {
  login: "Login",
  register: "Create your account!",
  challenge: "Two-factor authentication",
  forgot: "Forgot your password?",
  reset: "Choose a new password",
};
const { data: news } = await useAsyncData("auth-news", async () => {
  try {
    return (await api<Data<"Article">[]>("/articles")).data;
  } catch {
    return [];
  }
});
useSeoMeta({
  title: () =>
    isHome.value
      ? t("Welcome to the best hotel on the web!")
      : t(titles[kind.value] || "Login"),
});
</script>
<template>
  <div class="atom-auth">
    <Card
      v-if="!isHome"
      class="atom-auth-card"
      :class="{ registering: kind === 'register' }"
      :title="t(titles[kind] || 'Login')"
      :subtitle="
        kind === 'register'
          ? t('Create a free account, and be a part of a fun online world!')
          : ''
      "
      icon="hotel-icon"
    >
      <div class="atom-auth-content">
        <AuthForm />
        <img
          v-if="kind === 'register'"
          class="registration-hotel"
          src="/assets/images/atom/hotel.png"
          alt=""
        />
      </div>
    </Card>
    <template v-else>
      <section aria-labelledby="atom-latest-news">
        <div class="guest-section-title">
          <span class="hotel-icon" aria-hidden="true"></span>
          <div>
            <h1 id="atom-latest-news">{{ t("Latest news") }}</h1>
            <p>{{ t("Keep up to date with the latest hotel gossip.") }}</p>
          </div>
        </div>
        <div v-if="news?.length" class="atom-news-grid">
          <ArticleTile
            v-for="article in news"
            :key="article.id"
            :article="article"
          />
        </div>
        <Card
          v-else
          :title="`${t('Welcome to')} ${session.bootstrap.hotel_name}`"
          icon="hotel-icon"
          ><p>{{ session.bootstrap.hotel_description }}</p></Card
        >
      </section>
      <section
        v-if="session.bootstrap.latest_photos?.length"
        aria-labelledby="atom-latest-photos"
      >
        <div class="guest-section-title">
          <span class="camera-icon" aria-hidden="true"></span>
          <div>
            <h2 id="atom-latest-photos">{{ t("Latest Photos") }}</h2>
            <p>
              {{
                t(
                  "Have a look at some of the great moments captured by users around the hotel."
                )
              }}
            </p>
          </div>
        </div>
        <div class="atom-photo-grid">
          <a
            v-for="photo in session.bootstrap.latest_photos"
            :key="photo.id"
            class="atom-photo"
            :href="safeUrl(photo.url)"
            @click.prevent="photoViewer?.open(photo.url)"
            target="_blank"
            rel="noopener"
            ><img
              :src="safeUrl(photo.url)"
              :alt="`${t('Photo by')} ${
                photo.author?.username || session.bootstrap.hotel_name
              }`"
            /><span>{{ photo.author?.username }}</span></a
          >
        </div>
      </section>
    </template>
  </div>
  <PhotoLightbox
    ref="photoViewer"
    :photos="session.bootstrap.latest_photos || []"
  />
</template>
<style scoped>
.atom-auth {
  display: grid;
  gap: 48px;
}
.atom-auth > section {
  border-radius: 16px;
  background: color-mix(in srgb, var(--panel) 94%, transparent);
  box-shadow: 0 4px 12px #00000026;
}
.atom-auth > section:not(.atom-auth-card) {
  padding: 16px;
}
.atom-auth :deep(.card-icon) {
  border-radius: 50%;
}
.atom-auth :deep(.atom-article-tile) {
  border-radius: 8px;
}
.atom-auth-card {
  width: 100%;
  max-width: 660px;
  margin: 0 auto;
}
.atom-auth-card.registering {
  max-width: none;
}
.atom-auth-content {
  position: relative;
}
.atom-auth-content :deep(.auth-form) {
  position: relative;
  z-index: 1;
}
.registering .atom-auth-content :deep(.auth-form) {
  max-width: 460px;
}
.atom-auth :deep(.auth-form form) {
  gap: 16px;
}
.atom-auth :deep(.auth-form .sr-only) {
  position: static;
  width: auto;
  height: auto;
  margin: 0 0 4px;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
.atom-auth :deep(.auth-avatar img) {
  display: none;
}
.atom-auth :deep(.auth-form input:not([type="checkbox"])) {
  background: var(--input-bg);
  color: var(--text);
}
.registration-hotel {
  position: absolute;
  right: -12px;
  bottom: -12px;
  max-width: 45%;
  max-height: 95%;
  opacity: 0.5;
  object-fit: contain;
}
.guest-section-title {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.guest-section-title > span {
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
}
.guest-section-title h1,
.guest-section-title h2 {
  font-size: 24px;
  margin: 0;
}
.guest-section-title p {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 14px;
}
.atom-news-grid,
.atom-photo-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.atom-news-grid :deep(.article-tile) {
  height: 213px;
}
.atom-photo {
  border-radius: 8px;
  overflow: hidden;
  background: var(--panel);
  border: 1px solid var(--border);
}
.atom-photo > img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
.atom-photo > span {
  display: block;
  padding: 8px 12px;
  font-size: 14px;
}
@media (max-width: 1023px) {
  .atom-news-grid,
  .atom-photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 767px) {
  .registration-hotel {
    display: none;
  }
  .registering .atom-auth-content :deep(.auth-form) {
    max-width: none;
  }
}
@media (max-width: 479px) {
  .atom-news-grid,
  .atom-photo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
