<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Data } from "~/utils/api";
import Card from "~/components/Card.vue";
import Notice from "~/components/Notice.vue";
import ArticleTile from "~/components/ArticleTile.vue";
const { t } = useLocale();
const { api } = useApi();
const { session, avatar, refreshUser } = useSession();
const { busy, error, success, run } = usePage();
const frontendOrigin = useRequestURL().origin;
const articles = ref<Data<"Article">[]>([]);
const slide = ref(0);
const referralInput = ref<HTMLInputElement>();
const referralLink = computed(
  () => `${frontendOrigin}/register/${session.user?.referral_code || ""}`
);
onMounted(() =>
  run(async () => {
    await refreshUser();
    articles.value = (await api<Data<"Article">[]>("/articles")).data;
  })
);
async function claim() {
  await run(async () => {
    await api("/me/referral-claim", "POST");
    await refreshUser();
  }, "Referral reward claimed.");
}
async function copyReferral() {
  await run(async () => {
    if (navigator.clipboard)
      await navigator.clipboard.writeText(referralLink.value);
    else {
      referralInput.value?.select();
      if (!document.execCommand("copy"))
        throw new Error(t("Select and copy your referral link."));
    }
  }, "Your referral code has been copied to your clipbord!");
}
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
  <Notice :error="error" :success="success" />
  <div v-if="session.user" class="me-layout">
    <section class="dusk-me-hero">
      <NuxtLink class="dusk-me-avatar" :to="`/home/${session.user.username}`">
        <img :src="avatar(session.user, true)" :alt="session.user.username" />
      </NuxtLink>
      <div class="dusk-me-greeting">
        <div>
          <h1>
            {{ t("Hey :username!", { username: session.user.username }) }}
          </h1>
          <p>{{ session.user.motto }}</p>
        </div>
        <NuxtLink class="button gold" to="/game/nitro">{{
          t("Go to :hotel", { hotel: session.bootstrap.hotel_name })
        }}</NuxtLink>
      </div>
      <div class="dusk-me-balances">
        <div
          v-for="currency in ['credits', 'duckets', 'diamonds']"
          :key="currency"
        >
          <img :src="`/assets/images/icons/currency/${currency}.png`" alt="" />
          <strong>{{
            Number(session.user.balances?.[currency] || 0).toLocaleString()
          }}</strong>
          <span>{{
            t(currency.charAt(0).toUpperCase() + currency.slice(1))
          }}</span>
        </div>
      </div>
    </section>
    <section
      v-if="articles.length"
      class="news-slider"
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
      :title="`${t('User Referrals')} (${session.user.referrals_total ?? 0}/${
        session.user.referral_threshold ?? 0
      })`"
      :subtitle="t('Referral new users and be rewarded by in-game goods')"
      icon="hotel-icon"
    >
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
        /><button class="secondary" :disabled="busy" @click="copyReferral">
          {{ t("Copy code") }}
        </button>
      </div>
      <button
        v-if="session.user.referrals_needed === 0"
        class="secondary"
        :disabled="busy"
        @click="claim"
      >
        {{ t("Claim your referrals reward!") }}
      </button>
      <button v-else disabled>
        {{
          t(
            "You need to refer :needed more users, before being able to claim your reward",
            { needed: session.user.referrals_needed ?? 0 }
          )
        }}
      </button>
    </Card>
  </div>
</template>
<style scoped>
.me-layout {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}
.dusk-me-hero {
  grid-column: span 8;
  height: 250px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 32px;
  overflow: hidden;
  border-radius: 12px;
  background: rgb(17 24 39 / 0.5);
  color: white;
}
.dusk-me-avatar {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  background: url("/assets/images/dusk/me_circle_image.png");
}
.dusk-me-avatar img {
  position: absolute;
  bottom: -48px;
  left: 32px;
  max-width: none;
  image-rendering: pixelated;
}
.dusk-me-greeting {
  display: flex;
  justify-content: space-between;
  align-self: flex-start;
  gap: 16px;
  width: 100%;
  padding: 0 16px;
  z-index: 1;
}
.dusk-me-greeting h1 {
  font-size: 30px;
  line-height: 36px;
  font-weight: 600;
  margin: 8px 0 4px;
}
.dusk-me-greeting p {
  font-style: italic;
}
.dusk-me-greeting .button {
  align-self: flex-start;
  white-space: nowrap;
}
.dusk-me-balances {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 16px 16px 16px 256px;
  background: #111827;
}
.dusk-me-balances > div {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 14px;
}
.dusk-me-balances img {
  image-rendering: pixelated;
}
.news-slider {
  grid-column: span 4;
  position: relative;
  height: 250px;
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
.online-friends-bar {
  grid-column: span 8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px;
  background: #2b303c;
  border-radius: 4px;
  box-shadow: 0 4px 6px #0002;
}
.online-friends-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #e9b124;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
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
  border: 2px solid #d1d5db;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.online-friends-list img {
  image-rendering: pixelated;
}
.referral-card {
  grid-column: 1 / span 8;
}
.referral-code {
  display: flex;
  gap: 8px;
  margin: 8px 0;
}
.referral-code input {
  min-width: 0;
  flex: 1;
}
.referral-card :deep(button) {
  width: 100%;
}
.referral-code button {
  max-width: 110px;
}
@media (max-width: 1023px) {
  .dusk-me-hero {
    padding: 32px 0;
  }
  .dusk-me-avatar {
    width: 120px;
    background: none;
    overflow: visible;
  }
  .dusk-me-avatar img {
    left: -16px;
    bottom: 8px;
  }
  .dusk-me-greeting {
    flex-direction: column;
  }
  .dusk-me-balances {
    padding-left: 16px;
    justify-content: center;
  }
  .dusk-me-balances span {
    display: none;
  }
}
@media (max-width: 767px) {
  .dusk-me-hero,
  .news-slider,
  .online-friends-bar,
  .referral-card {
    grid-column: 1 / -1;
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
