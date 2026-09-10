<script setup lang="ts">
const { t } = useLocale();

const { theme } = useAppConfig();

defineProps<{ hotel: string }>();

const creditsDialog = ref<HTMLDialogElement>();

const contributors = [
  ["Kasja", "Design, ideas & GFX"],
  [
    "Nicollas",
    "Dark mode, Turbolinks, performance, article reactions, user sessions, layout & PT-BR translations",
  ],
  ["Dominic", "Performance improvements & user sessions"],
  [
    "EntenKoeniq",
    "Automatic language registration, rooms page, profile tweaks & shop additions",
  ],
  ["MisterDeen", "Custom Discord widget, bugfixes & tweaks"],
  ["Kani", "RCON base & FindRetros API"],
  ["Beny", "FindRetros API & Cloudflare fixes"],
  ["Oliver", "Profile page additions & Finnish translations"],
  ["Live", "French translations, bugfixes & tweaks"],
  ["DamienJolly", "Bugfixes"],
  ["Danbo", "Bugfixes"],
  ["Diddy/Josh", "Code readability improvements"],
];

const translators = [
  ["German", "Damue & EntenKoeniq"],
  ["Turkish", "Talion"],
  ["Swedish", "CentralCee, Rille & Tuborgs"],
  ["Dutch", "Yannick"],
  ["Spanish", "Gedomi"],
  ["Italian", "Lorenzune"],
  ["Norwegian", "Twana & Zaruzet"],
  ["French", "Plow & Live"],
  ["Finnish", "Oliver"],
  ["Portuguese (BR)", "Nicollas"],
];
</script>

<template>
  <footer
    class="site-footer h-14 min-h-14 p-0"
    :class="
      theme.name === 'atom'
        ? 'bg-gray-100 dark:bg-gray-900'
        : 'bg-[var(--surface-recessed)]'
    "
  >
    <button
      class="size-full rounded-none border-0 bg-transparent px-2 py-0 text-center text-xs leading-4 transition-colors duration-200 ease-in-out hover:filter-none sm:leading-6"
      :class="
        theme.name === 'atom'
          ? 'block! px-0! text-left! leading-5! font-normal text-gray-400 hover:text-gray-400 hover:underline md:text-center! md:text-sm md:font-semibold'
          : 'px-0! text-left! text-base! leading-6! font-bold text-[var(--text-dim)] hover:text-[var(--text-subtle)]'
      "
      @click="creditsDialog?.showModal()"
    >
      © {{ new Date().getFullYear() }} {{ theme.name === "atom" ? "-" : "" }}
      {{ theme.name === "dusk" ? hotel : "" }}
      {{
        t(
          theme.name === "atom"
            ? ":hotel is a not for profit educational project"
            : "is a not for profit educational project & is in no way affiliated with Sulake Corporation Oy.",
          { hotel },
        )
      }}
    </button>
  </footer>

  <dialog
    ref="creditsDialog"
    class="credits-dialog m-auto mb-4 max-h-[85vh] w-[calc(100%-32px)] max-w-xl rounded-lg border-0 bg-[var(--panel)] p-0 text-[var(--text)] open:flex open:flex-col open:overflow-hidden backdrop:bg-gray-950/70 sm:mb-auto"
    :aria-label="hotel"
    @click="$event.target === creditsDialog && creditsDialog?.close()"
  >
    <header
      class="flex items-center justify-between gap-4 bg-[var(--header)] px-4 py-3"
    >
      <h3 class="text-base font-semibold">{{ hotel }}</h3>

      <button
        class="border-0 bg-transparent px-1.5 py-0 text-2xl leading-7 text-[var(--text-subtle)]"
        :aria-label="t('Close')"
        @click="creditsDialog?.close()"
      >
        ×
      </button>
    </header>

    <div
      class="grid gap-6 overflow-y-auto p-4 text-sm leading-5 text-[var(--text-secondary)] [&_p]:leading-5 [&_a]:font-semibold [&_a]:text-blue-500 [&_h4]:mb-2 [&_h4]:text-xs [&_h4]:font-semibold [&_h4]:tracking-[0.05em] [&_h4]:text-[var(--text-dim)] [&_h4]:uppercase [&_li]:flex [&_li]:items-baseline [&_li]:justify-between [&_li]:gap-4 [&_strong]:shrink-0 [&_strong]:font-semibold [&_strong]:text-[var(--text)] [&_li_span]:text-right [&_li_span]:text-[var(--text-subtle)]"
    >
      <p>
        {{
          t(
            "Thank you for playing :hotel. We have put a lot of effort into making the hotel what it is, and we truly appreciate you being here",
            { hotel },
          )
        }}
        ❤️
      </p>

      <p>
        {{ t(":hotel is driven by Atom CMS made by:", { hotel }) }}
        <a
          href="https://devbest.com/threads/atom-cms-a-multi-theme-cms.93034/"
          target="_blank"
          rel="noopener"
        >
          Object
        </a>
      </p>

      <section>
        <h4>{{ t("Credits:") }}</h4>

        <ul
          class="[&_li]:border-b [&_li]:border-[var(--surface-muted)] [&_li]:py-2 [&_li:last-child]:border-0 max-sm:[&_li]:flex-col max-sm:[&_li]:items-start max-sm:[&_li]:gap-0.5 max-sm:[&_li_span]:text-left"
        >
          <li v-for="[name, contribution] in contributors" :key="name">
            <strong>{{ name }}</strong>

            <span>{{ t(contribution || "") }}</span>
          </li>
        </ul>
      </section>

      <section>
        <h4>{{ t("Translations") }}</h4>

        <ul class="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
          <li v-for="[language, names] in translators" :key="language">
            <strong>{{ t(language || "") }}</strong>

            <span>{{ names }}</span>
          </li>
        </ul>
      </section>
    </div>
  </dialog>
</template>
