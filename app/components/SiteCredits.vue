<script setup lang="ts">
const { t } = useLocale();
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
  <footer class="site-footer">
    <button @click="creditsDialog?.showModal()">
      © {{ new Date().getFullYear() }} {{ hotel }}
      {{
        t(
          "is a not for profit educational project & is in no way affiliated with Sulake Corporation Oy."
        )
      }}
    </button>
  </footer>
  <dialog
    ref="creditsDialog"
    class="credits-dialog"
    :aria-label="hotel"
    @click="$event.target === creditsDialog && creditsDialog?.close()"
  >
    <header>
      <h3>{{ hotel }}</h3>
      <button :aria-label="t('Close')" @click="creditsDialog?.close()">
        ×
      </button>
    </header>
    <div class="credits-body">
      <p>
        {{
          t(
            "Thank you for playing :hotel. We have put a lot of effort into making the hotel what it is, and we truly appreciate you being here",
            { hotel }
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
          >Object</a
        >
      </p>
      <section>
        <h4>{{ t("Credits:") }}</h4>
        <ul class="contributors">
          <li v-for="[name, contribution] in contributors" :key="name">
            <strong>{{ name }}</strong
            ><span>{{ t(contribution || "") }}</span>
          </li>
        </ul>
      </section>
      <section>
        <h4>{{ t("Translations") }}</h4>
        <ul class="translators">
          <li v-for="[language, names] in translators" :key="language">
            <strong>{{ t(language || "") }}</strong
            ><span>{{ names }}</span>
          </li>
        </ul>
      </section>
    </div>
  </dialog>
</template>
