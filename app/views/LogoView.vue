<script setup lang="ts">
import { computed, ref } from "vue";
import { renderLogo } from "~/utils/logo";
import type { Data } from "~/utils/api";
import { usePage } from "~/composables/usePage";
import { BaseCard } from "#components";
import AppNotice from "~/components/AppNotice.vue";

const { t } = useLocale();

const { theme } = useAppConfig();

const { api } = useApi();

const { session } = useSession();

const { busy, error, success, run } = usePage();

const font = ref("atom");

const text = ref("");

const fonts = [
  "atom",
  "sunrise",
  "marine",
  "danlie",
  "habton",
  "habton_capitalized",
  "habbo_modern",
];

const letters = computed(() =>
  text.value
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .split(""),
);

async function generate(use: boolean) {
  await run(
    async () => {
      const canvas = await renderLogo(letters.value, font.value);

      if (use) {
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((value) =>
            value
              ? resolve(value)
              : reject(new Error("Could not generate this logo.")),
          ),
        );

        const data = new FormData();

        data.append("logo", blob, "logo.png");

        await api("/logo", "POST", data);

        session.bootstrap = (await api<Data<"Bootstrap">>("/bootstrap")).data;
      } else {
        const link = document.createElement("a");

        link.href = canvas.toDataURL("image/png");

        link.download = "hotel-logo.png";

        link.click();
      }
    },
    use ? "The hotel logo has been updated." : "",
  );
}
</script>

<template>
  <BaseCard
    :title="t('Logo generator')"
    :subtitle="t('Generate your very own logo')"
    icon="hotel-icon"
    class="border border-[var(--border)]"
  >
    <AppNotice :error="error" :success="success" />

    <div class="px-2 text-sm text-[var(--text)]">
      <div class="mt-4">
        <div class="grid grid-cols-6 gap-3">
          <button
            v-for="choice in fonts"
            :key="choice"
            class="logo-font h-24 rounded border border-[var(--border)] p-2 flex gap-2 justify-center items-center transition duration-300 ease-in-out hover:bg-[var(--header)]"
            :class="
              font === choice
                ? theme.name === 'atom'
                  ? 'bg-gray-200 dark:bg-gray-900 ring-2 ring-emerald-700'
                  : 'bg-gray-900 ring-2 ring-emerald-700'
                : 'bg-transparent'
            "
            :aria-pressed="font === choice"
            :aria-label="choice"
            @click="font = choice"
          >
            <img
              v-for="letter in ['a', 'b', 'c']"
              :key="letter"
              :src="`/assets/images/logo-generator/${choice}/${letter}.png`"
              :alt="letter"
              class="object-contain"
            />
          </button>
        </div>

        <div class="mt-4">
          <label for="logo-text" class="font-bold">{{ t("Logo text") }}</label>

          <input
            id="logo-text"
            v-model="text"
            maxlength="60"
            :placeholder="t('Type here...')"
            class="mt-2 focus:ring-0 border-4 rounded bg-[var(--surface-inset)] border-[var(--border)] text-[var(--text)] focus:border-[#eeb425] w-full"
          />

          <div
            class="logo-preview flex mt-4 gap-[2px] overflow-x-auto"
            :class="text ? 'mb-4' : ''"
            :aria-label="t('Logo preview')"
          >
            <template v-for="(letter, index) in letters" :key="index">
              <span v-if="letter === ' '" class="shrink-0 w-[15px]"></span>

              <img
                v-else
                :src="`/assets/images/logo-generator/${font}/${letter}.png`"
                :alt="letter"
                class="max-w-none shrink-0 object-contain"
              />
            </template>
          </div>

          <div class="flex gap-4 justify-between">
            <button
              :disabled="busy || !letters.length"
              class="w-full rounded bg-[#eeb425] text-white p-2 border-2 border-yellow-400 transition duration-200 hover:bg-[#d49f1c] font-semibold"
              @click="generate(false)"
            >
              {{ t("Download logo") }}
            </button>

            <button
              v-if="session.user?.can_generate_logo"
              :disabled="busy || !letters.length"
              class="w-full rounded bg-green-600 hover:bg-green-700 text-white p-2 border-2 border-green-500 transition duration-150 font-semibold"
              @click="generate(true)"
            >
              {{ t("Use logo") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
