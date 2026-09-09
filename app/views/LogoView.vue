<script setup lang="ts">
const { t } = useLocale();
import { computed, ref } from "vue";
const { api } = useApi();
import type { Data } from "~/utils/api";
const { session } = useSession();
import { usePage } from "~/composables/usePage";
import Card from "~/components/Card.vue";
import Notice from "~/components/Notice.vue";
const { busy, error, success, run } = usePage();
const font = ref("atom"),
  text = ref(""),
  fonts = [
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
    .split("")
);
async function render(): Promise<HTMLCanvasElement> {
  const images = await Promise.all(
    letters.value.map(
      (letter) =>
        new Promise<HTMLImageElement | null>((resolve, reject) => {
          if (letter === " ") {
            resolve(null);
            return;
          }
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () =>
            reject(new Error("A logo letter could not be loaded."));
          image.src = `/assets/images/logo-generator/${font.value}/${letter}.png`;
        })
    )
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(
    1,
    images.reduce((sum, image) => sum + (image?.width || 15), 0) +
      Math.max(0, images.length - 1) * 2
  );
  canvas.height = Math.max(1, ...images.map((image) => image?.height || 0));
  const context = canvas.getContext("2d");
  let left = 0;
  for (const image of images) {
    if (image) context?.drawImage(image, left, canvas.height - image.height);
    left += (image?.width || 15) + 2;
  }
  return canvas;
}
async function generate(use: boolean) {
  await run(
    async () => {
      const canvas = await render();
      if (use) {
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((value) =>
            value
              ? resolve(value)
              : reject(new Error("Could not generate this logo."))
          )
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
    use ? "The hotel logo has been updated." : ""
  );
}
</script>
<template>
  <Card
    :title="t('Logo generator')"
    :subtitle="t('Generate your very own logo')"
    icon="hotel-icon"
    class="border border-gray-900"
  >
    <Notice :error="error" :success="success" />
    <div class="px-2 text-sm text-gray-200">
      <div class="mt-4">
        <div class="grid grid-cols-6 gap-3">
          <button
            v-for="choice in fonts"
            :key="choice"
            class="logo-font h-24 rounded border border-gray-700 p-2 flex gap-2 justify-center items-center transition duration-300 ease-in-out hover:bg-gray-900"
            :class="
              font === choice
                ? 'bg-gray-900 ring-2 ring-emerald-700'
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
            class="mt-2 focus:ring-0 border-4 rounded bg-gray-800 border-gray-700 text-gray-200 focus:border-[#eeb425] w-full"
          />
          <div
            class="logo-preview flex mt-4 gap-[2px] overflow-x-auto"
            :class="text ? 'mb-4' : ''"
            :aria-label="t('Logo preview')"
          >
            <template v-for="(letter, index) in letters" :key="index"
              ><span v-if="letter === ' '" class="shrink-0 w-[15px]"></span
              ><img
                v-else
                :src="`/assets/images/logo-generator/${font}/${letter}.png`"
                :alt="letter"
            /></template>
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
  </Card>
</template>
<style scoped>
.logo-font img {
  max-width: 30%;
  object-fit: contain;
}
.logo-preview img {
  image-rendering: pixelated;
  max-width: none;
  flex-shrink: 0;
}
</style>
