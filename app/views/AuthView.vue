<script setup lang="ts">
const { t } = useLocale();
import { computed, reactive, ref, watch } from "vue";

const { api, request, safeUrl } = useApi();
import type { Data } from "~/utils/api";
const { refreshUser, session, avatar } = useSession();
import { usePage } from "~/composables/usePage";
import Notice from "~/components/Notice.vue";
import Captcha from "~/components/Captcha.vue";
const captcha = ref<Record<string, string>>({});
import ArticleTile from "~/components/ArticleTile.vue";
const route = useRoute(),
  router = useRouter();
const { busy, error, fields, success, run } = usePage();
const kind = computed(() => String(route.meta.authKind || "login"));
const titles: Record<string, string> = {
  login: "Login",
  register: "Create a new account",
  challenge: "Two-factor authentication",
  forgot: "Forgot your password?",
  reset: "Choose a new password",
};
const form = reactive({
  username: "",
  mail: "",
  password: "",
  password_confirmation: "",
  terms: false,
  code: "",
  recovery_code: "",
  beta_code: "",
  referral_code: String(route.params.referral || route.query.referral || ""),
});
const recovery = ref(false),
  slide = ref(0);
const { data: news } = await useAsyncData("auth-news", async () => {
  try {
    return (await api<Data<"Article">[]>("/articles")).data;
  } catch {
    return [];
  }
});
const articles = computed(() => news.value || []);
const loginAvatar = ref("/assets/images/dusk/ghost.png");
watch(
  () => form.username,
  (username, _, cleanup) => {
    if (kind.value !== "login") return;
    let active = true;
    const timer = setTimeout(async () => {
      if (!username) {
        loginAvatar.value = "/assets/images/dusk/ghost.png";
        return;
      }
      try {
        const result = await api<Data<"PublicUser">>(
          `/users/${encodeURIComponent(username)}`
        );
        if (active) loginAvatar.value = avatar(result.data);
      } catch {
        if (active) loginAvatar.value = "/assets/images/dusk/ghost.png";
      }
    }, 200);
    cleanup(() => {
      active = false;
      clearTimeout(timer);
    });
  }
);
useSeoMeta({ title: () => t(titles[kind.value] || "Login") });
async function submit() {
  await run(
    async () => {
      if (kind.value === "forgot") {
        await request("/forgot-password", "POST", {
          mail: form.mail,
          ...captcha.value,
        });
        return;
      }
      if (kind.value === "reset") {
        await request(
          `/reset-password/${encodeURIComponent(String(route.params.token))}`,
          "POST",
          {
            password: form.password,
            password_confirmation: form.password_confirmation,
            ...captcha.value,
          }
        );
        await router.push("/login");
        return;
      }
      const path =
        kind.value === "challenge" ? "/two-factor-challenge" : `/${kind.value}`;
      const payload =
        kind.value === "challenge"
          ? recovery.value
            ? { recovery_code: form.recovery_code }
            : { code: form.code }
          : { ...form, ...captcha.value };
      const result = await request(path, "POST", payload);
      form.password = "";
      form.password_confirmation = "";
      if (result.two_factor) {
        await router.push({
          path: "/two-factor-challenge",
          query: route.query,
        });
        return;
      }
      session.bootstrap = (await api<Data<"Bootstrap">>("/bootstrap")).data;
      await refreshUser();
      await router.push(
        typeof route.query.next === "string" &&
          route.query.next.startsWith("/") &&
          !route.query.next.startsWith("//")
          ? route.query.next
          : "/user/me"
      );
    },
    kind.value === "forgot"
      ? "If an account matches that email address, a password reset link will arrive shortly."
      : ""
  );
}
const photoDialog = ref<HTMLDialogElement>();
const selectedPhoto = ref<{
  url: string;
  author?: { username: string } | null;
} | null>(null);
function viewPhoto(photo: {
  url: string;
  author?: { username: string } | null;
}) {
  selectedPhoto.value = photo;
  photoDialog.value?.showModal();
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
function changePhoto(step: number) {
  const gallery = session.bootstrap.latest_photos || [];
  if (!gallery.length) return;
  const index = gallery.findIndex(
    (photo) => photo.url === selectedPhoto.value?.url
  );
  selectedPhoto.value =
    gallery[(index + step + gallery.length) % gallery.length] || null;
}
</script>
<template>
  <div class="auth-layout" :class="{ registering: kind === 'register' }">
    <section class="glass-panel">
      <h1>{{ t(titles[kind] || "Login") }}</h1>
      <Notice :error="error" :fields="fields" :success="success" />
      <p
        v-if="
          kind === 'register' &&
          session.bootstrap.registration?.enabled === false
        "
        class="notice error"
      >
        {{ t("Registration is currently closed. Please check back soon.") }}
      </p>
      <form @submit.prevent="submit">
        <label
          v-if="kind === 'login' || kind === 'register'"
          class="auth-avatar"
          ><span class="sr-only"> {{ t("Username") }} </span
          ><input
            v-model="form.username"
            name="username"
            autocomplete="username"
            :placeholder="t('Enter your username')"
            required /><img v-if="kind === 'login'" :src="loginAvatar" alt=""
        /></label>
        <label v-if="kind === 'register' || kind === 'forgot'"
          ><span class="sr-only"> {{ t("Email address") }} </span
          ><input
            v-model="form.mail"
            name="mail"
            type="email"
            autocomplete="email"
            :placeholder="t('Enter your email')"
            required
        /></label>
        <label v-if="['login', 'register', 'reset'].includes(kind)"
          ><span class="sr-only"> {{ t("Password") }} </span
          ><input
            v-model="form.password"
            name="password"
            type="password"
            :autocomplete="
              kind === 'login' ? 'current-password' : 'new-password'
            "
            :placeholder="t('Enter your password')"
            required
        /></label>
        <label v-if="kind === 'register' || kind === 'reset'"
          ><span class="sr-only"> {{ t("Confirm password") }} </span
          ><input
            v-model="form.password_confirmation"
            name="password_confirmation"
            type="password"
            autocomplete="new-password"
            :placeholder="t('Confirm your password')"
            required
        /></label>
        <label
          v-if="
            kind === 'register' &&
            session.bootstrap.registration?.requires_beta_code
          "
        >
          {{ t("Beta code") }}
          <input v-model="form.beta_code" name="beta_code" required
        /></label>
        <label v-if="kind === 'register'" class="check-label"
          ><input v-model="form.terms" type="checkbox" required /><span>
            {{ t("I accept the") }}
            <NuxtLink to="/help-center/rules" target="_blank">
              {{ t("hotel terms & rules") }} </NuxtLink
            >.</span
          ></label
        >
        <template v-if="kind === 'challenge'"
          ><p>
            {{
              t(
                "Enter the code from your authenticator app, or use one of your saved recovery codes."
              )
            }}
          </p>
          <label v-if="!recovery">
            {{ t("Authentication code") }}
            <input
              v-model="form.code"
              name="code"
              inputmode="numeric"
              autocomplete="one-time-code"
              required /></label
          ><label v-else>
            {{ t("Recovery code") }}
            <input
              v-model="form.recovery_code"
              name="recovery_code"
              autocomplete="off"
              required /></label
          ><button
            class="text-button"
            type="button"
            @click="recovery = !recovery"
          >
            {{
              t(recovery ? "Use an authentication code" : "Use a recovery code")
            }}
          </button></template
        >
        <Captcha v-model="captcha" :busy="busy" />
        <div class="grid two-columns">
          <button
            class="gold"
            :disabled="
              busy ||
              (kind === 'register' &&
                session.bootstrap.registration?.enabled === false)
            "
          >
            {{
              t(
                busy
                  ? "Please wait…"
                  : kind === "challenge"
                  ? "Verify"
                  : kind === "forgot"
                  ? "Send reset link"
                  : kind === "reset"
                  ? "Save password"
                  : kind === "register"
                  ? "Register"
                  : "Login"
              )
            }}</button
          ><NuxtLink
            class="button secondary"
            :to="kind === 'login' ? '/register' : '/login'"
            >{{ t(kind === "login" ? "Register" : "Back to login") }}</NuxtLink
          >
        </div>
        <NuxtLink v-if="kind === 'login'" class="muted" to="/forgot-password">
          {{ t("Forgot your password?") }}
        </NuxtLink>
      </form>
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
        @click.prevent="viewPhoto(photo)"
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
  <dialog
    ref="photoDialog"
    class="photo-lightbox"
    @keydown.left.prevent="changePhoto(-1)"
    @keydown.right.prevent="changePhoto(1)"
    @click="$event.target === photoDialog && photoDialog?.close()"
  >
    <button
      class="photo-close"
      :aria-label="t('Close')"
      @click="photoDialog?.close()"
    >
      ×</button
    ><img
      v-if="selectedPhoto"
      :src="safeUrl(selectedPhoto.url)"
      :alt="selectedPhoto.author?.username || t('Hotel photos')"
    />
    <div class="flex justify-between items-center gap-4">
      <button
        class="secondary"
        :aria-label="t('Previous photo')"
        @click="changePhoto(-1)"
      >
        ‹
      </button>
      <p>{{ selectedPhoto?.author?.username }}</p>
      <button
        class="secondary"
        :aria-label="t('Next photo')"
        @click="changePhoto(1)"
      >
        ›
      </button>
    </div>
  </dialog>
</template>

<style scoped>
.photo-lightbox {
  width: fit-content;
  max-width: 95vw;
  max-height: 95vh;
  margin: auto;
  padding: 16px;
  border: 0;
  border-radius: 8px;
  background: #171a23;
  color: white;
}
.photo-lightbox::backdrop {
  background: #000c;
}
.photo-lightbox > img {
  max-height: 80vh;
  max-width: 85vw;
  object-fit: contain;
}
.photo-close {
  display: block;
  margin-left: auto;
  border: 0;
  background: none;
  font-size: 24px;
  padding: 0 8px;
}
.photo-lightbox p {
  text-align: center;
}

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
.glass-panel form {
  gap: 12px;
}
.glass-panel input:not([type="checkbox"]) {
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
