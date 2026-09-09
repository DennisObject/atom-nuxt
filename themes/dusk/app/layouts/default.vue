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
} = useSiteShell();
</script>

<template>
  <div
    class="site-shell"
    @click.self="openMenu = ''"
    @keydown.esc="
      openMenu = '';
      mobileOpen = false;
    "
  >
    <header class="nav-header">
      <nav class="nav-inner" :aria-label="t('Main navigation')">
        <NuxtLink
          class="brand"
          :to="session.user ? '/user/me' : '/'"
          :aria-label="`${hotel} home`"
        >
          <img :src="logo" :alt="hotel" @error="logoFailed = true" />
        </NuxtLink>
        <button
          class="mobile-menu-toggle"
          :aria-label="t('Main navigation')"
          :aria-expanded="mobileOpen"
          aria-controls="main-navigation"
          @click="mobileOpen = !mobileOpen"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <div
          id="main-navigation"
          class="nav-links"
          :class="{ 'mobile-open': mobileOpen }"
        >
          <template v-for="item in navigation" :key="item.label">
            <NuxtLink v-if="item.path" :to="item.path">
              <img
                class="icon"
                :src="`/assets/images/dusk/${item.icon}.png`"
                alt=""
              />{{ t(item.label) }}
            </NuxtLink>
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
                  class="icon"
                  :src="`/assets/images/dusk/${item.icon}.png`"
                  alt=""
                />{{ t(item.label) }}
                <svg
                  class="mobile-chevron"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <Transition name="dropdown">
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
              </Transition>
            </div>
          </template>
        </div>
      </nav>
    </header>
    <div class="sub-header">
      <div class="sub-header-inner">
        <div class="sub-header-group">
          <div
            class="language-menu"
            @focusout="closeMenu"
            @keydown.esc="openMenu = ''"
          >
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
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414Z"
                  clip-rule="evenodd"
                />
              </svg>
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
          <a
            v-if="safeUrl(session.bootstrap.discord_url)"
            :href="safeUrl(session.bootstrap.discord_url)"
            target="_blank"
            rel="noopener"
            >{{ t("Discord") }}</a
          >
        </div>
        <div class="sub-header-group sub-header-tools">
          <NuxtLink
            to="/help-center/rules"
            :aria-label="t('Hotel rules')"
            :title="t('Hotel rules')"
            ><img src="/assets/images/dusk/rules_icon.png" alt=""
          /></NuxtLink>
          <NuxtLink
            v-if="session.user && session.bootstrap.viewer?.can_generate_logo"
            to="/logo-generator"
            :aria-label="t('Logo generator')"
            :title="t('Logo generator')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Z"
              />
            </svg>
          </NuxtLink>
          <a
            v-if="
              session.user &&
              session.bootstrap.viewer?.can_show_housekeeping_link &&
              safeUrl(session.bootstrap.housekeeping_url)
            "
            :href="safeUrl(session.bootstrap.housekeeping_url)"
            target="_blank"
            rel="noopener"
            :aria-label="t('Housekeeping')"
            :title="t('Housekeeping')"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204-.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
              />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
    <div class="site-bg" aria-hidden="true"></div>
    <main class="main-content" @click="openMenu = ''">
      <Notice :error="error" />
      <slot />
    </main>
  </div>
  <SiteCredits :hotel="hotel" />
</template>
