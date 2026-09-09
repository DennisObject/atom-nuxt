<script setup lang="ts">
import { Card, ArticleTile, DiscordWidget } from "#components";
import Notice from "~/components/Notice.vue";
const {
  t,
  session,
  avatar,
  busy,
  error,
  success,
  articles,
  slide,
  slideStart,
  referralInput,
  referralLink,
  claim,
  copyReferral,
} = useMePage();

const paused = ref(false);
function swipeNews(event: PointerEvent) {
  const delta = event.clientX - slideStart.value;
  if (Math.abs(delta) > 40 && articles.value.length > 1) {
    slide.value =
      (slide.value + (delta < 0 ? 1 : -1) + articles.value.length) %
      articles.value.length;
  }
}
let autoplay: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  autoplay = setInterval(() => {
    if (!paused.value && articles.value.length > 1) {
      slide.value = (slide.value + 1) % articles.value.length;
    }
  }, 5000);
});
onBeforeUnmount(() => clearInterval(autoplay));
</script>
<template>
  <Notice :error="error" :success="success" />
  <div v-if="session.user" class="atom-me-layout">
    <div class="atom-me-main">
      <section class="atom-me-hero">
        <NuxtLink class="atom-me-avatar" :to="`/home/${session.user.username}`">
          <img :src="avatar(session.user, true)" :alt="session.user.username" />
        </NuxtLink>
        <NuxtLink class="button atom-enter-hotel" to="/game/nitro">{{
          t("Go to :hotel", { hotel: session.bootstrap.hotel_name })
        }}</NuxtLink>
      </section>
      <div class="online-friends-bar">
        <div class="online-friends-title">
          <img src="/assets/images/icons/online-friends.png" alt="" />{{
            t("Online Friends")
          }}
        </div>
        <div class="online-friends-list">
          <NuxtLink
            v-for="friend in session.user.online_friends"
            :key="friend.id"
            :to="`/home/${friend.username}`"
            :title="`${friend.username}: ${friend.motto}`"
            ><img
              :src="`${avatar(friend)}&headonly=1&size=s`"
              :alt="friend.username"
          /></NuxtLink>
        </div>
      </div>
      <Card
        class="referral-card"
        :title="
          t('User Referrals (%s/%s)')
            .replace('%s', String(session.user.referrals_total ?? 0))
            .replace('%s', String(session.user.referral_threshold ?? 0))
        "
        :subtitle="t('Referral new users and be rewarded by in-game goods')"
        icon="friends-icon"
      >
        <div class="referral-content">
          <p>
            {{
              t(
                "Here at :hotel we have added a referral system, allowing you to obtain a bonus for every :needed users that registers through your referral link will allow you to claim a reward of :amount diamonds!",
                {
                  hotel: session.bootstrap.hotel_name,
                  needed: session.user.referral_threshold ?? 0,
                  amount: session.user.referral_reward_amount ?? 0,
                }
              )
            }}
          </p>
          <small class="muted">{{
            t(
              "Boosting referrals by making own accounts will lead to removal of all progress, currency, inventory and a potential ban"
            )
          }}</small>
          <div class="referral-code">
            <input
              ref="referralInput"
              :value="referralLink"
              readonly
              :aria-label="t('Your invitation link')"
            /><button
              class="atom-secondary-button"
              :disabled="busy"
              @click="copyReferral"
            >
              {{ t("Copy code") }}
            </button>
          </div>
          <button
            v-if="session.user.referrals_needed === 0"
            class="atom-secondary-button"
            :disabled="busy"
            @click="claim"
          >
            {{ t("Claim your referrals reward!") }}
          </button>
          <button v-else class="referral-unavailable" disabled>
            {{
              t(
                "You need to refer :needed more users, before being able to claim your reward",
                { needed: session.user.referrals_needed ?? 0 }
              )
            }}
          </button>
        </div>
      </Card>
    </div>
    <aside class="atom-me-sidebar">
      <section
        class="news-slider"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
        @focusin="paused = true"
        @focusout="paused = false"
        @pointerdown="slideStart = $event.clientX"
        @pointerup="swipeNews"
        :aria-label="t('Latest news')"
      >
        <article v-if="!articles.length" class="atom-article-tile">
          <div
            class="atom-article-image"
            style="background-image: url('https://i.imgur.com/uGLDOUu.png')"
          ></div>
          <div class="atom-article-caption">
            <h2>{{ t("No published articles") }}</h2>
            <div class="atom-article-author">
              <span class="atom-article-avatar"
                ><img :src="avatar()" alt="" /></span
              ><span>{{ session.bootstrap.hotel_name }}</span>
            </div>
          </div>
        </article>
        <ArticleTile
          v-for="(article, index) in articles"
          v-show="index === slide"
          :key="article.id"
          :article="article"
          for-slider
        />
        <template v-if="articles.length > 1">
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
      </section>
      <DiscordWidget />
    </aside>
  </div>
</template>
<style scoped>
.atom-me-layout {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}
.atom-me-main,
.atom-me-sidebar {
  display: grid;
  gap: 12px;
  min-width: 0;
}
.atom-me-hero {
  height: 180px;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 5px;
  background: #0000004d url("/assets/images/atom/kasja_mepage_image.png") center;
  background-blend-mode: multiply;
  color: white;
}
.atom-me-avatar {
  position: absolute;
  left: 0;
  bottom: -48px;
}
.atom-me-avatar img {
  image-rendering: pixelated;
}
.atom-enter-hotel {
  margin: 0 40px 0 auto;
  border-radius: 999px;
  background: #ffffffe6;
  color: #000;
  border: 0;
  font-size: 18px;
  padding: 8px 24px;
}
.online-friends-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 4px;
}
.online-friends-title {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e9b124;
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
}
@media (min-width: 1024px) {
  .online-friends-title::after {
    content: "";
    position: absolute;
    right: -4px;
    width: 24px;
    height: 24px;
    background: #e9b124;
    transform: rotate(45deg);
    z-index: -1;
  }
  .online-friends-title {
    isolation: isolate;
  }
}
.online-friends-title img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.online-friends-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.online-friends-list a {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border);
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.online-friends-list img {
  image-rendering: pixelated;
}
.referral-card {
  border: 1px solid var(--divider);
}
.referral-content {
  padding-inline: 8px;
  font-size: 14px;
}
.referral-content small {
  color: #9ca3af;
}
.referral-code {
  display: grid;
  grid-template-columns: minmax(0, 10fr) minmax(0, 2fr);
  gap: 8px;
}
.referral-code input {
  min-width: 0;
  border: 4px solid var(--divider);
  border-radius: 4px;
  background: var(--panel);
  padding: 8px 12px;
  font-size: 14px;
}
.referral-code input:focus {
  border-color: #eeb425;
}
.referral-content > button {
  width: 100%;
  margin-top: 8px;
}
.referral-unavailable {
  border: 0;
  border-radius: 4px;
  padding: 8px;
  background: #9ca3af;
  color: white;
  font-weight: 400;
  opacity: 1;
}
:global(.dark .referral-unavailable),
:global(.dark .atom-enter-hotel) {
  background: #111827;
  color: white;
}
.news-slider {
  position: relative;
  height: 213px;
}
.news-slider :deep(.atom-article-tile) {
  height: 210px;
}
.slider-dots {
  position: absolute;
  bottom: 0;
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
  background: #0003;
}
.slider-dots .active {
  background: #007aff;
}
@media (max-width: 900px) {
  .atom-me-layout {
    grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
  }
  .atom-enter-hotel {
    margin-right: 16px;
    font-size: 16px;
  }
}
@media (max-width: 1023px) {
  .online-friends-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .online-friends-list {
    justify-content: center;
  }
}
@media (max-width: 767px) {
  .referral-code {
    grid-template-columns: 1fr;
  }
  .atom-enter-hotel {
    margin-left: 112px;
    font-size: 14px;
    line-height: 20px;
    padding: 10px 16px;
    text-align: center;
  }
  .atom-me-layout {
    grid-template-columns: 1fr;
  }
  .online-friends-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .online-friends-list {
    justify-content: center;
  }
}
</style>
