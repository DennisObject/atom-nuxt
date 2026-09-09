<script setup lang="ts">
const {
  t,
  locale,
  session,
  safeUrl,
  busy,
  error,
  mobileOpen,
  openMenu,
  logoFailed,
  hotel,
  logo,
  languages,
  navigation,
  hoverMenu,
  toggleMenu,
  closeMenu,
  logout,
  changeLocale,
  avatar,
} = useSiteShell();
const { isDark, toggleMode } = useThemeMode();
const route = useRoute();
const loginDialog = ref<HTMLDialogElement>();
const loginOpen = ref(false);
async function openLogin() {
  loginOpen.value = true;
  await nextTick();
  loginDialog.value?.showModal();
}
function closeLogin() {
  loginDialog.value?.close();
  loginOpen.value = false;
}
watch(() => route.fullPath, closeLogin);
watch(
  () => session.user,
  (user) => {
    if (user) closeLogin();
  }
);
const atomNavigation = computed(() => {
  const home = navigation.value.find((item) => item.label === "Home")!;
  return [
    session.user
      ? {
          ...home,
          children: [{ label: "Home", path: "/user/me" }, ...home.children!],
        }
      : { ...home, path: "/" },
    ...navigation.value.filter((item) => item.label !== "Home"),
    {
      label: "Assistance",
      icon: "rules",
      active: false,
      children: [
        { label: "Hotel rules", path: "/help-center/rules" },
        ...(session.user
          ? [{ label: "Help center", path: "/help-center" }]
          : []),
        ...(session.user?.can_manage_tickets
          ? [{ label: "Open tickets", path: "/help-center/tickets/all" }]
          : []),
      ],
    },
  ];
});
function navigationIcon(icon: string) {
  const icons: Record<string, string> = {
    home_icon: "home.png",
    community_icon: "community.png",
    leaderboard_icon: "leaderboards.png",
    store_icon: "shop.png",
    news_icon: "community.png",
    rules: "rules.gif",
  };
  return `/assets/images/atom/icons/navigation/${icons[icon] || "home.png"}`;
}
const currencies = computed(() => [
  {
    name: "Credits",
    icon: "nav-credit-icon",
    amount: session.user?.balances?.credits ?? 0,
  },
  {
    name: "Duckets",
    icon: "nav-ducket-icon",
    amount: session.user?.balances?.duckets ?? 0,
  },
  {
    name: "Diamonds",
    icon: "nav-diamond-icon",
    amount: session.user?.balances?.diamonds ?? 0,
  },
]);
</script>

<template>
  <div
    class="site-shell atom-shell"
    @keydown.esc="
      openMenu = '';
      mobileOpen = false;
    "
  >
    <div v-if="session.user" class="atom-top-header">
      <div class="atom-top-inner">
        <div class="atom-currencies">
          <div
            v-for="currency in currencies"
            :key="currency.name"
            class="atom-currency"
          >
            <span :class="currency.icon" aria-hidden="true"></span>
            <span
              ><strong>{{ currency.amount }}</strong>
              {{ t(currency.name) }}</span
            >
          </div>
        </div>
        <div class="atom-account-tools">
          <NuxtLink
            v-if="session.bootstrap.viewer?.can_generate_logo"
            to="/logo-generator"
            >{{ t("Logo generator") }}</NuxtLink
          >
          <a
            v-if="
              session.bootstrap.viewer?.can_show_housekeeping_link &&
              safeUrl(session.bootstrap.housekeeping_url)
            "
            :href="safeUrl(session.bootstrap.housekeeping_url)"
            target="_blank"
            rel="noopener"
            >{{ t("Housekeeping") }}</a
          >
          <NuxtLink to="/user/settings/account" class="atom-account"
            ><img :src="avatar(session.user)" alt="" />{{
              session.user.username
            }}</NuxtLink
          >
          <button :disabled="busy" @click="logout">{{ t("Logout") }}</button>
        </div>
      </div>
    </div>
    <header class="atom-banner">
      <div class="atom-banner-inner">
        <NuxtLink
          v-if="session.user"
          class="brand"
          :to="session.user ? '/user/me' : '/'"
          :aria-label="`${hotel} home`"
        >
          <img :src="logo" :alt="hotel" @error="logoFailed = true" />
        </NuxtLink>
        <template v-if="session.user">
          <span class="atom-online">{{
            t(":online :hotel online", {
              online: session.bootstrap.online_count || 0,
              hotel,
            })
          }}</span>
          <div class="atom-client-links">
            <NuxtLink class="btn" to="/game/nitro">{{
              t("Nitro client")
            }}</NuxtLink>
          </div>
        </template>
        <div v-else class="atom-welcome">
          <p>
            {{
              t(
                "An online virtual world where you can create your own avatar, make friends, chat, create rooms and much more!"
              )
            }}
          </p>
          <div>
            <a
              class="atom-login"
              href="/login"
              aria-haspopup="dialog"
              @click.prevent="openLogin"
            >
              {{ t("Login") }}</a
            ><span>{{ t("Or") }}</span
            ><NuxtLink class="atom-register" to="/register">{{
              t("Create an account")
            }}</NuxtLink>
          </div>
        </div>
      </div>
    </header>
    <nav class="atom-navigation" :aria-label="t('Main navigation')">
      <div class="atom-nav-inner">
        <button
          class="mobile-menu-toggle"
          :aria-label="t('Main navigation')"
          :aria-expanded="mobileOpen"
          aria-controls="main-navigation"
          @click="mobileOpen = !mobileOpen"
        >
          ☰
        </button>
        <div
          id="main-navigation"
          class="nav-links"
          :class="{ 'mobile-open': mobileOpen }"
        >
          <template v-for="item in atomNavigation" :key="item.label">
            <NuxtLink v-if="'path' in item && item.path" :to="item.path"
              ><img
                class="atom-nav-icon"
                :src="navigationIcon(item.icon)"
                alt=""
              />{{ t(item.label) }}</NuxtLink
            >
            <div
              v-else
              class="nav-menu"
              :class="{ active: item.active || openMenu === item.label }"
              @pointerenter="hoverMenu($event, item.label)"
              @pointerleave="hoverMenu($event, '')"
              @focusout="closeMenu"
            >
              <button
                class="dropdown-parent"
                :aria-expanded="openMenu === item.label"
                :aria-controls="`nav-${item.icon}`"
                @click="toggleMenu($event, item.label)"
              >
                <img
                  class="atom-nav-icon"
                  :src="navigationIcon(item.icon)"
                  alt=""
                />{{ t(item.label) }} <span aria-hidden="true">⌄</span>
              </button>
              <div
                v-show="openMenu === item.label"
                :id="`nav-${item.icon}`"
                class="dropdown dropdown-children"
              >
                <template v-for="child in item.children" :key="child.label">
                  <NuxtLink v-if="child.path" :to="child.path">{{
                    t(child.label)
                  }}</NuxtLink>
                  <button v-else :disabled="busy" @click="logout">
                    {{ t(child.label) }}
                  </button>
                </template>
              </div>
            </div>
          </template>
          <a
            v-if="safeUrl(session.bootstrap.discord_url)"
            :href="safeUrl(session.bootstrap.discord_url)"
            target="_blank"
            rel="noopener"
            >{{ t("Discord") }}</a
          >
        </div>
        <div class="atom-nav-tools">
          <button
            class="atom-mode-toggle"
            :aria-label="t('Toggle dark mode')"
            :aria-pressed="isDark"
            @click="toggleMode"
          >
            <span aria-hidden="true">{{ isDark ? "☀" : "☾" }}</span>
          </button>
          <div class="language-menu" @focusout="closeMenu">
            <button
              class="language-toggle"
              :disabled="busy"
              :aria-label="t('Language')"
              :aria-expanded="openMenu === 'language'"
              aria-controls="language-options"
              @click="openMenu = openMenu === 'language' ? '' : 'language'"
            >
              <img
                :src="`/assets/images/icons/flags/${locale}.png`"
                :alt="locale"
              />
            </button>
            <div
              v-show="openMenu === 'language'"
              id="language-options"
              class="dropdown language-options"
            >
              <button
                v-for="language in languages"
                :key="language.locale"
                :aria-label="language.name"
                :title="language.name"
                :disabled="busy"
                @click="changeLocale(language.locale)"
              >
                <img
                  :src="`/assets/images/icons/flags/${language.locale}.png`"
                  :alt="language.name"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <main class="main-content" @click="openMenu = ''">
      <Notice :error="error" /><slot />
    </main>
  </div>
  <dialog
    ref="loginDialog"
    class="atom-login-dialog"
    :aria-label="t('Login')"
    @close="loginOpen = false"
    @click="$event.target === loginDialog && closeLogin()"
  >
    <header>
      <h2>{{ t("Login") }}</h2>
      <button :aria-label="t('Close')" @click="closeLogin">×</button>
    </header>
    <AuthForm v-if="loginOpen" kind="login" in-dialog />
  </dialog>
  <SiteCredits :hotel="hotel" />
</template>

<style scoped>
.atom-login-dialog {
  width: min(600px, calc(100vw - 32px));
  max-height: calc(100dvh - 32px);
  margin: auto;
  border: 0;
  border-radius: 16px;
  padding: 28px;
  color: var(--text);
  background: var(--panel);
  box-shadow: 0 12px 40px #0005;
}
.atom-login-dialog::backdrop {
  background: #0008;
}
.atom-login-dialog > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.atom-login-dialog h2 {
  font-size: 20px;
  font-weight: 600;
}
.atom-login-dialog > header button {
  font-size: 26px;
  width: 32px;
  height: 32px;
  line-height: 1;
}
.atom-shell {
  min-height: calc(100vh - 80px);
}
.atom-top-header,
.atom-navigation {
  background: var(--panel);
}
.atom-top-inner,
.atom-banner-inner,
.atom-nav-inner {
  max-width: 1280px;
  margin: auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
}
.atom-top-inner {
  min-height: 60px;
  justify-content: space-between;
  gap: 20px;
}
.atom-currencies,
.atom-account-tools,
.atom-currency,
.atom-account,
.atom-nav-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}
.atom-currencies {
  gap: 24px;
}
.atom-currency {
  font-size: 14px;
  white-space: nowrap;
}
.atom-account-tools {
  font-size: 13px;
}
.atom-currency > span:first-child {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  outline-offset: 3px;
}
.nav-credit-icon {
  background: #e9b124 url("/assets/images/icons/currency/credits.png") no-repeat
    center;
  outline: 1px solid #b26d18;
}
.nav-ducket-icon {
  background: #c44aac url("/assets/images/icons/currency/duckets.png") no-repeat
    center;
  outline: 1px solid #812378;
}
.nav-diamond-icon {
  background: #caf1f3 url("/assets/images/icons/currency/diamonds.png")
    no-repeat center;
  outline: 1px solid #6caff4;
}
.atom-account {
  height: 60px;
  overflow: hidden;
}
.atom-account img {
  width: 48px;
  margin-top: 24px;
}
.atom-banner {
  background: #126798 url("/assets/images/atom/kasja_mepage_header.png") center;
  background-size: cover;
  position: relative;
}
.atom-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: #0005;
}
.atom-banner-inner {
  min-height: 208px;
  gap: 30px;
  position: relative;
}
.brand img {
  max-width: 200px;
  max-height: 120px;
}
.atom-online {
  background: var(--panel);
  padding: 15px 20px;
  border-radius: 5px;
  font-size: 14px;
  position: relative;
}
.atom-online::before {
  content: "";
  position: absolute;
  left: -6px;
  top: 18px;
  width: 15px;
  height: 15px;
  background: inherit;
  transform: rotate(45deg);
}
.atom-client-links {
  margin-left: auto;
}
.atom-client-links .btn {
  background: var(--panel);
  color: inherit;
  border: 0;
  border-radius: 30px;
  padding: 10px 26px;
}
.atom-welcome {
  color: white;
  text-align: center;
  max-width: 650px;
  margin: auto;
}
.atom-welcome p {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
}
.atom-welcome > div {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-size: 14px;
}
.atom-login,
.atom-register {
  border: 2px solid white;
  padding: 9px 30px;
  border-radius: 30px;
}
.atom-register {
  background: #16a34acc;
  border-color: transparent;
}
.atom-login:hover {
  background: white;
  color: #222;
}
.atom-register:hover {
  background: #16a34a;
}
.atom-navigation {
  box-shadow: 0 2px 4px #0001;
  position: relative;
  z-index: 20;
}
.atom-nav-inner {
  min-height: 60px;
  justify-content: space-between;
}
.nav-links {
  display: flex;
  align-items: stretch;
  gap: 24px;
}
.nav-links > a,
.dropdown-parent {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 60px;
  border-bottom: 4px solid transparent;
  padding-top: 4px;
  font-size: 14px;
  font-weight: 600;
}
.nav-links > .router-link-active,
.nav-menu.active > .dropdown-parent {
  border-bottom-color: #eeb425;
}
.atom-nav-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  image-rendering: pixelated;
}
.nav-menu,
.language-menu {
  position: relative;
}
.dropdown {
  position: absolute;
  background: var(--panel);
  box-shadow: 0 6px 20px #0003;
  border-radius: 4px;
  z-index: 30;
  padding: 6px 0;
  min-width: 180px;
}
.dropdown-children {
  top: 100%;
  left: 0;
}
.dropdown-children a,
.dropdown-children button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  font-size: 14px;
}
.dropdown-children a:hover,
.dropdown-children button:hover {
  background: var(--input-bg);
}
.atom-mode-toggle {
  font-size: 25px;
  width: 40px;
  height: 40px;
}
.language-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
}
.language-toggle img,
.language-options img {
  width: 22px;
  height: auto;
}
.language-options {
  right: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
}
.language-options button {
  padding: 3px;
}
.mobile-menu-toggle {
  display: none;
  font-size: 24px;
}
@media (max-width: 1023px) {
  .atom-currencies {
    gap: 12px;
  }
  .atom-currency {
    font-size: 12px;
  }
  .atom-top-inner {
    flex-wrap: wrap;
    gap: 0;
    padding-top: 8px;
  }
  .atom-nav-inner {
    flex-wrap: wrap;
  }
  .mobile-menu-toggle {
    display: block;
  }
  .nav-links {
    display: none;
    order: 3;
    flex-basis: 100%;
    flex-direction: column;
    gap: 0;
    padding-bottom: 14px;
  }
  .nav-links.mobile-open {
    display: flex;
  }
  .nav-links > a,
  .dropdown-parent {
    min-height: 44px;
    width: 100%;
  }
  .dropdown-children {
    position: static;
    box-shadow: none;
    margin-left: 16px;
  }
  .atom-welcome p {
    font-size: 16px;
  }
}
@media (max-width: 639px) {
  .atom-top-inner,
  .atom-banner-inner,
  .atom-nav-inner {
    padding-left: 16px;
    padding-right: 16px;
  }
  .atom-top-inner {
    justify-content: center;
  }
  .atom-account-tools {
    flex-wrap: wrap;
    justify-content: center;
  }
  .atom-banner-inner {
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    padding-top: 24px;
    padding-bottom: 24px;
  }
  .brand img {
    max-width: 160px;
    max-height: 90px;
  }
  .atom-online {
    display: none;
  }
  .atom-client-links {
    margin-left: 0;
  }
  .atom-welcome p {
    display: none;
  }
  .atom-welcome > div {
    gap: 10px;
    font-size: 12px;
  }
  .atom-login,
  .atom-register {
    padding: 8px 16px;
  }
}
</style>
