<script setup lang="ts">
const {
  t,
  session,
  busy,
  mobileOpen,
  openMenu,
  logoFailed,
  hotel,
  logo,
  navigation,
  hoverMenu,
  toggleMenu,
  closeMenu,
  logout,
} = useThemeShell();
</script>

<template>
  <header
    class="relative z-30 flex w-full items-center justify-center bg-[#171a23]"
  >
    <nav
      class="relative mx-auto block min-h-[60px] w-full max-w-[1280px] px-5 lg:flex lg:h-[120px] lg:items-center lg:justify-between lg:p-0"
      :aria-label="t('Main navigation')"
    >
      <NuxtLink
        class="hidden shrink transition-transform duration-300 hover:scale-105 lg:block"
        :to="session.user ? '/user/me' : '/'"
        :aria-label="`${hotel} home`"
      >
        <img :src="logo" :alt="hotel" @error="logoFailed = true" />
      </NuxtLink>

      <button
        class="absolute right-5 top-5 border-0 bg-transparent p-0 text-white lg:hidden [&_svg]:size-6"
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
        class="w-full flex-col items-start gap-3 p-4 text-white lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-14 lg:p-0"
        :class="mobileOpen ? 'flex' : 'hidden'"
      >
        <template v-for="item in navigation" :key="item.label">
          <NuxtLink
            v-if="item.path"
            :to="item.path"
            class="group flex items-center gap-1 text-base leading-6 hover:text-[#ac93da] [&.router-link-active]:text-[#ac93da] lg:flex-col"
          >
            <img
              class="hidden size-10 grayscale transition-[filter] duration-300 group-hover:grayscale-0 group-[.router-link-active]:grayscale-0 group-[.active]/menu:grayscale-0 lg:block"
              :src="`/assets/images/dusk/${item.icon}.png`"
              alt=""
            />
            {{ t(item.label) }}
          </NuxtLink>

          <div
            v-else
            class="nav-menu group/menu relative z-5"
            :class="{
              'active text-[#ac93da]': item.active || openMenu === item.label,
            }"
            @pointerenter="hoverMenu($event, item.label)"
            @pointerleave="hoverMenu($event, '')"
            @focusout="closeMenu"
          >
            <button
              class="group flex items-center gap-1 border-0 bg-transparent p-0 text-base font-semibold leading-6 text-inherit hover:text-[#ac93da] lg:flex-col"
              :aria-expanded="openMenu === item.label"
              :aria-controls="`nav-${item.icon}`"
              @click="toggleMenu($event, item.label)"
            >
              <img
                class="hidden size-10 grayscale transition-[filter] duration-300 group-hover:grayscale-0 group-[.router-link-active]:grayscale-0 group-[.active]/menu:grayscale-0 lg:block"
                :src="`/assets/images/dusk/${item.icon}.png`"
                alt=""
              />
              {{ t(item.label) }}
              <svg
                class="size-5 text-gray-400 lg:hidden"
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

            <Transition
              enter-active-class="transition duration-150 ease-out"
              leave-active-class="transition duration-75 ease-out"
              enter-from-class="scale-95 opacity-0"
              leave-to-class="scale-95 opacity-0"
            >
              <div
                v-show="openMenu === item.label"
                :id="`nav-${item.icon}`"
                class="absolute top-full left-0 z-100 mt-1 flex min-w-[150px] origin-top-left flex-col items-center gap-2 rounded bg-[#ac93da] py-2 font-semibold whitespace-nowrap text-white shadow-sm before:absolute before:-top-1 before:h-1 before:w-full"
              >
                <template v-for="child in item.children" :key="child.label">
                  <NuxtLink
                    v-if="child.path"
                    :to="child.path"
                    class="block w-full rounded-none border-0 bg-transparent px-2 py-1 text-left text-sm leading-5 text-white hover:bg-[#8770b2]"
                  >
                    {{ t(child.label) }}
                  </NuxtLink>

                  <button
                    v-else
                    class="block w-full rounded-none border-0 bg-transparent px-2 py-1 text-left text-sm leading-5 text-white hover:bg-[#8770b2]"
                    :disabled="busy"
                    @click="logout"
                  >
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
</template>
