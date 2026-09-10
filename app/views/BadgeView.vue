<script setup lang="ts">
const { t } = useLocale();

useHead({
  link: [
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css",
      integrity:
        "sha512-DxV+EoADOkOygM4IR9yXP8Sb2qwgidEmeqAEmDKIOfPRQZOWbXCzLC6vjbZyy0vPisbH2SyW27+ddLVCN+OMzQ==",
      crossorigin: "anonymous",
      referrerpolicy: "no-referrer",
    },
  ],
});

const { api, safeUrl } = useApi();

const { session, avatar } = useSession();

type BadgeConfig = { cost?: number; currency?: string; badge_url?: string };

const { busy, error, fields, success, run } = usePage();

const { data: initial, error: initialError } = await useAsyncData(
  "badge-config",
  async () => (await api<BadgeConfig>("/badges")).data,
);

const config = ref<BadgeConfig>(initial.value || {});

const canvas = useTemplateRef<HTMLCanvasElement>("canvas");

const preview = useTemplateRef<HTMLCanvasElement>("preview");

const fileInput = useTemplateRef<HTMLInputElement>("fileInput");

const {
  color,
  eraser,
  copyMode,
  showGrid,
  hasPixels,
  recentColors,
  error: canvasError,
  selectColor,
  start,
  move,
  undo,
  clear,
  importImage,
  encoded,
  download,
} = useBadgeCanvas(canvas, preview);

const badgeName = ref("");

const description = ref("");

const valid = computed(
  () =>
    hasPixels.value &&
    badgeName.value.trim().length > 0 &&
    description.value.trim().length > 0 &&
    !/https?:\/\/|www\./i.test(badgeName.value + description.value),
);

const purchaseLabel = computed(
  () =>
    `${t("Buy Badge")} (${config.value.cost ?? "…"} ${
      config.value.currency
        ? t(
            config.value.currency.charAt(0).toUpperCase() +
              config.value.currency.slice(1),
          )
        : ""
    })`,
);

async function buy() {
  if (!valid.value || busy.value || config.value.cost === undefined) {
    return;
  }

  if (
    !window.confirm(
      t("badge_purchase_confirmation", {
        cost: config.value.cost,
        currency: config.value.currency || "",
      }),
    )
  ) {
    return;
  }

  await run(async () => {
    const badge_data = `data:image/gif;base64,${btoa(
      String.fromCharCode(...encoded()),
    )}`;

    const result = await api<{ badge_url: string }>("/badges", "POST", {
      badge_data,
      badge_name: badgeName.value,
      badge_description: description.value,
    });

    config.value.badge_url = result.data.badge_url;
  }, t("Your badge has been purchased."));
}
</script>

<template>
  <div class="badge-page grid grid-cols-1 lg:grid-cols-4 gap-4">
    <AppNotice
      :error="error || canvasError || initialError?.message"
      :fields="fields"
      :success="success"
    />

    <BaseCard
      :title="t('Badge Drawer')"
      :subtitle="t('Draw your very own badge')"
      icon="hotel-icon"
      class="border border-[var(--border)] lg:col-span-3"
    >
      <div class="px-2 text-sm text-[var(--text)] flex flex-col gap-6">
        <BadgeToolbar
          v-model:copy-mode="copyMode"
          v-model:eraser="eraser"
          v-model:show-grid="showGrid"
          @import="fileInput?.click()"
        />

        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/gif"
          hidden
          @change="importImage"
        />

        <div
          class="[background:repeating-conic-gradient(#fff_0%_25%,#eee_0%_50%)_0/5%_5%] dark:[background:repeating-conic-gradient(#1a1a1a_0%_25%,#2a2a2a_0%_50%)_0/5%_5%] w-full max-w-[640px] mx-auto aspect-square relative"
        >
          <canvas
            ref="canvas"
            tabindex="0"
            @keydown.ctrl.z.prevent="undo"
            @keydown.meta.z.prevent="undo"
            class="block touch-none cursor-crosshair bg-transparent [image-rendering:pixelated] w-full h-full border border-[var(--border)]"
            width="40"
            height="40"
            :aria-label="t('Badge drawing area')"
            @pointerdown="start"
            @pointermove="move"
          ></canvas>

          <div
            v-if="showGrid"
            class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#4b5563_1px,transparent_1px),linear-gradient(to_bottom,#4b5563_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[2.5%_2.5%]"
            aria-hidden="true"
          ></div>
        </div>

        <BadgePalette
          v-model="color"
          :recent-colors="recentColors"
          @select="selectColor"
        />

        <div class="flex flex-col md:flex-row gap-4 justify-between">
          <button
            class="w-full rounded bg-red-600 hover:bg-red-700 text-white p-2 border-2 border-red-500 font-semibold"
            @click="clear"
          >
            {{ t("Clear All") }}
          </button>

          <button
            class="w-full rounded bg-[#eeb425] text-white p-2 border-2 border-yellow-400 hover:bg-[#d49f1c] font-semibold"
            @click="download(badgeName)"
          >
            {{ t("Download badge") }}
          </button>
        </div>
      </div>
    </BaseCard>

    <BaseCard
      :title="t('Badge Drawer Details')"
      :subtitle="t('My Badge Details')"
      icon="hotel-icon"
      class="border border-[var(--border)] lg:col-span-1 h-max"
    >
      <form class="px-2 text-sm flex flex-col gap-3" @submit.prevent="buy">
        <h3 class="font-semibold text-base">{{ t("Preview") }}</h3>

        <div
          class="h-[180px] w-[199px] shrink-0 bg-[url('/assets/images/badgecreator/avatarbox.png')] mx-auto"
        >
          <div class="mt-[13px] ml-[30px] text-xs text-white">
            {{ session.user?.username }}
          </div>

          <div
            class="float-left mt-2.5 ml-[15px] h-[120px] w-[60px] bg-no-repeat"
            :style="{
              backgroundImage: `url('${avatar(session.user, { direction: 4 })}')`,
            }"
          ></div>

          <canvas
            ref="preview"
            width="40"
            height="40"
            class="float-left mt-[7px] ml-[15px] bg-transparent [image-rendering:pixelated]"
            :aria-label="t('Badge preview')"
          ></canvas>
        </div>

        <label class="font-semibold">
          {{ t("Badge Name:") }}
          <input
            v-model="badgeName"
            required
            maxlength="24"
            class="mt-1 focus:ring-0 border-4 rounded bg-[var(--surface-inset)] border-[var(--border)] text-[var(--text)] focus:border-[#eeb425] w-full"
          />
        </label>

        <label class="font-semibold mt-2">
          {{ t("Badge Description:") }}
          <input
            v-model="description"
            required
            maxlength="255"
            class="mt-1 focus:ring-0 border-4 rounded bg-[var(--surface-inset)] border-[var(--border)] text-[var(--text)] focus:border-[#eeb425] w-full"
          />
        </label>

        <button
          :disabled="busy || config.cost === undefined || !valid"
          class="w-full rounded text-white p-2 border-2 border-green-500 font-semibold bg-green-600 hover:bg-green-700"
        >
          {{ purchaseLabel }}
        </button>

        <a
          v-if="safeUrl(config.badge_url)"
          :href="safeUrl(config.badge_url)"
          target="_blank"
          rel="noopener"
        >
          {{ t("View your badge") }}
        </a>
      </form>
    </BaseCard>
  </div>
</template>
