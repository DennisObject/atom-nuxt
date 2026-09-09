<script setup lang="ts">
import { computed, ref } from "vue";
import type { Data } from "~/utils/api";
import PhotoLightbox from "~/components/PhotoLightbox.vue";
import AuthForm from "~/components/AuthForm.vue";
import { ArticleTile } from "#components";
const { t } = useLocale();
const { api, safeUrl } = useApi();
const { session } = useSession();
const route = useRoute();
const kind = computed(() => String(route.meta.authKind || "login"));
const titles: Record<string, string> = {
  login: "Login",
  register: "Create a new account",
  challenge: "Two-factor authentication",
  forgot: "Forgot your password?",
  reset: "Choose a new password",
};
useSeoMeta({ title: () => t(titles[kind.value] || "Login") });
const slide = ref(0);
const { data: news } = await useAsyncData("auth-news", async () => {
  try {
    return (await api<Data<"Article">[]>("/articles")).data;
  } catch {
    return [];
  }
});
const articles = computed(() => news.value || []);
const photoViewer = ref<InstanceType<typeof PhotoLightbox>>();
let slideStart = 0;
function swipeNews(event: PointerEvent) {
  const delta = event.clientX - slideStart;
  if (Math.abs(delta) > 40)
    slide.value = Math.max(
      0,
      Math.min(articles.value.length - 1, slide.value + (delta < 0 ? 1 : -1))
    );
}
</script>
<template>
  <div class="auth-layout" :class="{ registering: kind === 'register' }">
    <section class="glass-panel">
      <h1>{{ t(titles[kind] || "Login") }}</h1>
      <AuthForm />
    </section>
    <aside class="auth-news">
      <div
        v-if="articles.length"
        class="auth-slider"
        @pointerdown="slideStart = $event.clientX"
        @pointerup="swipeNews"
        :aria-label="t('Latest news')"
      >
        <ArticleTile
          v-for="(article, index) in articles"
          v-show="index === slide"
          :key="article.id"
          :article="article"
        />
        <template v-if="articles.length > 1">
          <button
            class="slider-previous"
            :disabled="slide === 0"
            :aria-label="t('Previous article')"
            @click="slide = Math.max(0, slide - 1)"
          >
            ‹
          </button>
          <button
            class="slider-next"
            :disabled="slide === articles.length - 1"
            :aria-label="t('Next article')"
            @click="slide = Math.min(articles.length - 1, slide + 1)"
          >
            ›
          </button>
          <div class="slider-dots">
            <button
              v-for="(_, index) in articles"
              :key="index"
              :class="{ active: index === slide }"
              :aria-label="`${t('Article')} ${index + 1}`"
              :aria-current="index === slide ? 'true' : undefined"
              @click="slide = index"
            ></button>
          </div>
        </template>
      </div>
      <div v-if="!articles.length" class="glass-panel">
        <img src="/assets/images/dusk/hotel_icon.png" alt="" />
        <h2>{{ t("Welcome to") }} {{ session.bootstrap.hotel_name }}</h2>
        <p>
          {{
            session.bootstrap.hotel_description ||
            "Meet new friends, create your own rooms, and make yourself at home."
          }}
        </p>
      </div>
    </aside>
    <div
      v-if="session.bootstrap.latest_photos?.length"
      class="auth-photos grid four-columns"
    >
      <a
        v-for="photo in session.bootstrap.latest_photos"
        :key="photo.id"
        class="photo"
        :href="safeUrl(photo.url)"
        @click.prevent="photoViewer?.open(photo.url)"
        target="_blank"
        rel="noopener"
        ><img
          :src="safeUrl(photo.url)"
          :alt="`Photo by ${photo.author?.username || 'a hotel member'}`"
        />
        <figcaption>
          <img src="/assets/images/dusk/author_camera_icon.png" alt="" />{{
            photo.author?.username
          }}
        </figcaption></a
      >
    </div>
  </div>
  <PhotoLightbox
    ref="photoViewer"
    :photos="session.bootstrap.latest_photos || []"
  />
</template>

<style scoped>
.auth-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}
.glass-panel {
  background: rgb(17 24 39 / 0.5);
  border: 0;
  border-radius: 12px;
  padding: 24px 32px;
  color: white;
}
.glass-panel h1 {
  font-size: 24px;
  line-height: 32px;
  font-weight: 400;
  margin: 0 0 12px;
}
.glass-panel :deep(form) {
  gap: 12px;
}
.glass-panel :deep(input:not([type="checkbox"])) {
  background: white;
  color: #111827;
  border-radius: 6px;
  padding: 8px 12px;
  min-height: 42px;
}
.auth-avatar {
  position: relative;
  overflow: hidden;
}
.auth-avatar img {
  position: absolute;
  top: -16px;
  right: 0;
  image-rendering: pixelated;
}
.auth-slider {
  height: 250px;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
}
.slider-previous,
.slider-next {
  position: absolute;
  z-index: 2;
  top: 70px;
  padding: 0 10px;
  background: transparent;
  border: 0;
  font-size: 40px;
  color: #007aff;
}
.slider-previous {
  left: 0;
}
.slider-next {
  right: 0;
}
.slider-dots {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
}
.slider-dots button {
  width: 8px;
  min-height: 0;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #777;
}
.slider-dots .active {
  background: #007aff;
}
.auth-photos {
  grid-column: 1 / -1;
}
.registering .glass-panel {
  grid-row: 1 / span 2;
}
.registering .auth-photos {
  grid-column: 2;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (max-width: 767px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }
  .registering .glass-panel {
    grid-row: auto;
  }
  .registering .auth-photos {
    grid-column: 1;
  }
}
</style>
