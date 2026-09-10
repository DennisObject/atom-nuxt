<script setup lang="ts">
const color = defineModel<string>({ required: true });

defineProps<{ recentColors: string[] }>();

const emit = defineEmits<{ select: [color: string] }>();

const { t } = useLocale();

const palette = [
  "#000000",
  "#FFFFFF",
  "#808080",
  "#C0C0C0",
  "#FF0000",
  "#800000",
  "#FFFF00",
  "#808000",
  "#00FF00",
  "#008000",
  "#00FFFF",
  "#008080",
  "#0000FF",
  "#000080",
  "#FF00FF",
  "#800080",
  "#FF4500",
  "#FFA500",
  "#FFD700",
  "#F0E68C",
  "#90EE90",
  "#98FB98",
  "#AFEEEE",
  "#ADD8E6",
  "#87CEFA",
  "#6495ED",
  "#DDA0DD",
  "#EE82EE",
  "#A52A2A",
  "#D2691E",
  "#CD853F",
  "#F4A460",
  "#FFC0CB",
  "#9370DB",
  "#228B22",
  "#20B2AA",
];
</script>

<template>
  <div class="flex flex-col md:flex-row flex-wrap gap-4 justify-between">
    <div class="flex flex-col gap-2 flex-1">
      <p class="font-semibold mb-1">{{ t("Choose Color") }}</p>

      <div class="flex items-center gap-2 w-full">
        <label
          class="relative grid place-items-center min-w-12 overflow-hidden p-0! [&_input]:h-full [&_input]:w-full [&_input]:cursor-pointer [&_input]:border-0 [&_input]:p-0 w-12 h-12 border-2 border-black rounded bg-[linear-gradient(to_bottom,#f2f2f3_51%,#d9d8d8_49%)] shadow-[inset_0_0_0_2px_#d9d9d9] p-2.5 hover:bg-[linear-gradient(to_bottom,#fff_50%,#ebebeb_50%)] hover:shadow-[inset_0_0_0_2px_#fff] dark:bg-[linear-gradient(to_bottom,#141414_51%,#101010_49%)] dark:shadow-[inset_0_0_0_2px_#242424] dark:hover:bg-[linear-gradient(to_bottom,#171717_50%,#111_50%)] dark:hover:shadow-[inset_0_0_0_2px_#363636] aria-pressed:shadow-[inset_0_0_0_2px_#eeb425]"
        >
          <span class="sr-only">{{ t("Choose Color") }}</span>

          <i
            class="fa-solid fa-fill-drip fa-lg text-black"
            aria-hidden="true"
          />

          <input
            v-model="color"
            class="absolute inset-0 opacity-0"
            type="color"
            @input="emit('select', color)"
          />
        </label>

        <div
          class="relative flex h-10 w-full max-w-[38px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded border-[3px] border-[#b6bec5] bg-center bg-no-repeat text-black after:absolute after:inset-x-0 after:top-0 after:z-2 after:h-1/2 after:bg-white/10 !w-full !max-w-none !h-12"
          :style="{ backgroundColor: color }"
        ></div>
      </div>

      <p class="font-semibold mb-1">{{ t("Recent color") }}</p>

      <div class="flex flex-wrap gap-2 w-full">
        <button
          v-for="swatch in recentColors"
          :key="swatch"
          class="relative flex h-10 w-full max-w-[38px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded border-[3px] border-[#b6bec5] bg-center bg-no-repeat text-black after:absolute after:inset-x-0 after:top-0 after:z-2 after:h-1/2 after:bg-white/10 !p-0"
          :style="{ backgroundColor: swatch }"
          :aria-label="`Use color ${swatch}`"
          @click="emit('select', swatch)"
        ></button>

        <span
          v-for="index in 12 - recentColors.length"
          :key="index"
          class="relative flex h-10 w-full max-w-[38px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded border-[3px] border-[#b6bec5] bg-center bg-no-repeat text-black after:absolute after:inset-x-0 after:top-0 after:z-2 after:h-1/2 after:bg-white/10"
        ></span>
      </div>
    </div>

    <div class="flex flex-col gap-2 flex-1">
      <p class="font-semibold mb-1">{{ t("Palette") }}</p>

      <div class="flex flex-wrap gap-2 w-full">
        <button
          v-for="swatch in palette"
          :key="swatch"
          class="relative flex h-10 w-full max-w-[38px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded border-[3px] border-[#b6bec5] bg-center bg-no-repeat text-black after:absolute after:inset-x-0 after:top-0 after:z-2 after:h-1/2 after:bg-white/10 !p-0"
          :style="{ backgroundColor: swatch }"
          :aria-label="`Use color ${swatch}`"
          @click="emit('select', swatch)"
        ></button>
      </div>
    </div>
  </div>
</template>
