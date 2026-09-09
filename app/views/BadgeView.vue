<script setup lang="ts">
import { badgeGif } from "~/utils/badge";
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
  async () => (await api<BadgeConfig>("/badges")).data
);
const config = ref<BadgeConfig>(initial.value || {});
const canvas = ref<HTMLCanvasElement | null>(null),
  preview = ref<HTMLCanvasElement | null>(null),
  fileInput = ref<HTMLInputElement | null>(null);
const color = ref("#000000"),
  eraser = ref(false),
  copyMode = ref(false),
  showGrid = ref(true),
  hasPixels = ref(false);
const badgeName = ref(""),
  description = ref(""),
  history = ref<ImageData[]>([]),
  recentColors = ref<string[]>([]);
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
const valid = computed(
  () =>
    hasPixels.value &&
    badgeName.value.trim().length > 0 &&
    description.value.trim().length > 0 &&
    !/https?:\/\/|www\./i.test(badgeName.value + description.value)
);
const purchaseLabel = computed(
  () =>
    `${t("Buy Badge")} (${config.value.cost ?? "…"} ${
      config.value.currency
        ? t(
            config.value.currency.charAt(0).toUpperCase() +
              config.value.currency.slice(1)
          )
        : ""
    })`
);
function snapshot() {
  const context = canvas.value?.getContext("2d");
  if (context) history.value.push(context.getImageData(0, 0, 40, 40));
  if (history.value.length > 30) history.value.shift();
}
function updatePreview() {
  const pixels = canvas.value?.getContext("2d")?.getImageData(0, 0, 40, 40);
  if (!pixels) return;
  preview.value?.getContext("2d")?.putImageData(pixels, 0, 0);
  hasPixels.value = pixels.data.some(
    (value, index) => index % 4 === 3 && value > 0
  );
}
function selectColor(value: string) {
  color.value = value;
  eraser.value = false;
  copyMode.value = false;
}
function rememberColor(value: string) {
  recentColors.value = [
    value,
    ...recentColors.value.filter((item) => item !== value),
  ].slice(0, 12);
}
function paint(event: PointerEvent) {
  const context = canvas.value?.getContext("2d");
  if (!context || !canvas.value) return;
  const bounds = canvas.value.getBoundingClientRect();
  const x = Math.floor(((event.clientX - bounds.left) * 40) / bounds.width),
    y = Math.floor(((event.clientY - bounds.top) * 40) / bounds.height);
  if (x < 0 || y < 0 || x >= 40 || y >= 40) return;
  if (copyMode.value) {
    const pixel = context.getImageData(x, y, 1, 1).data;
    if (pixel[3])
      selectColor(
        `#${Array.from(pixel.slice(0, 3))
          .map((value) => value.toString(16).padStart(2, "0"))
          .join("")}`
      );
    return;
  }
  if (eraser.value) context.clearRect(x, y, 1, 1);
  else {
    context.fillStyle = color.value;
    context.fillRect(x, y, 1, 1);
    rememberColor(color.value);
  }
  updatePreview();
}
function start(event: PointerEvent) {
  if (!copyMode.value) snapshot();
  canvas.value?.setPointerCapture(event.pointerId);
  paint(event);
}
function move(event: PointerEvent) {
  if (event.buttons === 1) paint(event);
}
function undo() {
  const previous = history.value.pop();
  if (previous) canvas.value?.getContext("2d")?.putImageData(previous, 0, 0);
  updatePreview();
}
function clear() {
  snapshot();
  canvas.value?.getContext("2d")?.clearRect(0, 0, 40, 40);
  recentColors.value = [];
  updatePreview();
}
async function importImage(event: Event) {
  const input = event.target as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  await run(async () => {
    if (!["image/png", "image/gif"].includes(file.type))
      throw new Error(t("Only PNG and GIF files are allowed."));
    const image = await createImageBitmap(file);
    snapshot();
    const context = canvas.value?.getContext("2d");
    if (context) {
      context.clearRect(0, 0, 40, 40);
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0, 40, 40);
    }
    image.close();
    updatePreview();
  });
  input.value = "";
}
function encoded(): Uint8Array {
  const pixels = canvas.value
    ?.getContext("2d")
    ?.getImageData(0, 0, 40, 40).data;
  if (!pixels) throw new Error("The badge canvas is unavailable.");
  return badgeGif(pixels);
}
function download() {
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(encoded())], { type: "image/gif" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${badgeName.value || "badge"}.gif`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function buy() {
  if (!valid.value || busy.value || config.value.cost === undefined) return;
  if (
    !window.confirm(
      t("badge_purchase_confirmation", {
        cost: config.value.cost,
        currency: config.value.currency || "",
      })
    )
  )
    return;
  await run(async () => {
    const badge_data = `data:image/gif;base64,${btoa(
      String.fromCharCode(...encoded())
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
    <Notice
      :error="error || initialError?.message"
      :fields="fields"
      :success="success"
    />
    <Card
      :title="t('Badge Drawer')"
      :subtitle="t('Draw your very own badge')"
      icon="hotel-icon"
      class="border border-gray-900 lg:col-span-3"
    >
      <div class="px-2 text-sm text-gray-200 flex flex-col gap-6">
        <div class="flex flex-col md:flex-row flex-wrap gap-4 justify-between">
          <button
            class="badge-drawer-button flex-1 border-2 border-black rounded text-black font-medium"
            :aria-pressed="copyMode"
            :aria-label="t('Toggle copy color mode')"
            @click="
              copyMode = !copyMode;
              eraser = false;
            "
          >
            {{ t("Copy color:")
            }}<i class="fa-solid fa-eye-dropper" aria-hidden="true"></i>
          </button>
          <button
            class="badge-drawer-button flex-1 border-2 border-black rounded text-black font-medium"
            :aria-pressed="eraser"
            :aria-label="t('Toggle erase mode')"
            @click="
              eraser = !eraser;
              copyMode = false;
            "
          >
            {{ t("Erase mode:")
            }}<i class="fa-solid fa-eraser" aria-hidden="true"></i>
          </button>
          <button
            class="badge-drawer-button flex-1 border-2 border-black rounded text-black font-medium"
            :aria-label="t('Import a picture for your badge')"
            @click="fileInput?.click()"
          >
            {{ t("Import Picture:")
            }}<i class="fa-solid fa-file-import" aria-hidden="true"></i>
          </button>
          <button
            class="badge-drawer-button flex-1 border-2 border-black rounded text-black font-medium"
            :aria-pressed="showGrid"
            :aria-label="t('Toggle grid visibility')"
            @click="showGrid = !showGrid"
          >
            {{ t("Show Grid:")
            }}<i class="fa-solid fa-table-cells" aria-hidden="true"></i>
          </button>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/gif"
          hidden
          @change="importImage"
        />
        <div
          class="badge-checkerboard w-full max-w-[640px] mx-auto aspect-square relative"
        >
          <canvas
            ref="canvas"
            tabindex="0"
            @keydown.ctrl.z.prevent="undo"
            @keydown.meta.z.prevent="undo"
            class="badge-canvas w-full h-full border border-gray-700"
            width="40"
            height="40"
            :aria-label="t('Badge drawing area')"
            @pointerdown="start"
            @pointermove="move"
          ></canvas>
          <div v-if="showGrid" class="badge-grid" aria-hidden="true"></div>
        </div>
        <div class="flex flex-col md:flex-row flex-wrap gap-4 justify-between">
          <div class="flex flex-col gap-2 flex-1">
            <p class="font-semibold mb-1">{{ t("Choose Color") }}</p>
            <div class="flex items-center gap-2 w-full">
              <label
                class="badge-color-input w-12 h-12 border-2 border-black rounded badge-drawer-button"
                ><span class="sr-only">{{ t("Choose Color") }}</span
                ><input
                  v-model="color"
                  type="color"
                  @input="
                    eraser = false;
                    copyMode = false;
                  "
              /></label>
              <div
                class="badge-drawer-palette !w-full !max-w-none !h-12"
                :style="{ backgroundColor: color }"
              ></div>
            </div>
            <p class="font-semibold mb-1">{{ t("Recent color") }}</p>
            <div class="flex flex-wrap gap-2 w-full">
              <button
                v-for="swatch in recentColors"
                :key="swatch"
                class="badge-drawer-palette !p-0"
                :style="{ backgroundColor: swatch }"
                :aria-label="`Use color ${swatch}`"
                @click="selectColor(swatch)"
              ></button
              ><span
                v-for="index in 12 - recentColors.length"
                :key="index"
                class="badge-drawer-palette"
              ></span>
            </div>
          </div>
          <div class="flex flex-col gap-2 flex-1">
            <p class="font-semibold mb-1">{{ t("Palette") }}</p>
            <div class="flex flex-wrap gap-2 w-full">
              <button
                v-for="swatch in palette"
                :key="swatch"
                class="badge-drawer-palette !p-0"
                :style="{ backgroundColor: swatch }"
                :aria-label="`Use color ${swatch}`"
                @click="selectColor(swatch)"
              ></button>
            </div>
          </div>
        </div>
        <div class="flex flex-col md:flex-row gap-4 justify-between">
          <button
            class="w-full rounded bg-red-600 hover:bg-red-700 text-white p-2 border-2 border-red-500 font-semibold"
            @click="clear"
          >
            {{ t("Clear All") }}</button
          ><button
            class="w-full rounded bg-[#eeb425] text-white p-2 border-2 border-yellow-400 hover:bg-[#d49f1c] font-semibold"
            @click="download"
          >
            {{ t("Download badge") }}
          </button>
        </div>
      </div>
    </Card>
    <Card
      :title="t('Badge Drawer Details')"
      :subtitle="t('My Badge Details')"
      icon="hotel-icon"
      class="border border-gray-900 lg:col-span-1 h-max"
    >
      <form class="px-2 text-sm flex flex-col gap-3" @submit.prevent="buy">
        <h3 class="font-semibold text-base">{{ t("Preview") }}</h3>
        <div class="badge-avatarbox mx-auto">
          <div class="badge-preview-name">{{ session.user?.username }}</div>
          <div
            class="badge-preview-avatar"
            :style="{ backgroundImage: `url('${avatar(session.user)}')` }"
          ></div>
          <canvas
            ref="preview"
            width="40"
            height="40"
            class="badge-preview"
            :aria-label="t('Badge preview')"
          ></canvas>
        </div>
        <label class="font-semibold"
          >{{ t("Badge Name:")
          }}<input
            v-model="badgeName"
            required
            maxlength="24"
            class="mt-1 focus:ring-0 border-4 rounded bg-gray-800 border-gray-700 text-gray-200 focus:border-[#eeb425] w-full"
        /></label>
        <label class="font-semibold mt-2"
          >{{ t("Badge Description:")
          }}<input
            v-model="description"
            required
            maxlength="255"
            class="mt-1 focus:ring-0 border-4 rounded bg-gray-800 border-gray-700 text-gray-200 focus:border-[#eeb425] w-full"
        /></label>
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
          >{{ t("View your badge") }}</a
        >
      </form>
    </Card>
  </div>
</template>
<style scoped>
.badge-drawer-button svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.badge-drawer-button[aria-pressed="true"] {
  box-shadow: inset 0 0 0 2px #eeb425;
}
.badge-checkerboard {
  background: repeating-conic-gradient(#fff 0% 25%, #e5e5e5 0% 50%) 0 / 5% 5%;
}
.badge-canvas {
  display: block;
  image-rendering: pixelated;
  touch-action: none;
  cursor: crosshair;
  background: transparent;
}
.badge-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(to right, #8886 1px, transparent 1px),
    linear-gradient(to bottom, #8886 1px, transparent 1px);
  background-size: 2.5% 2.5%;
  pointer-events: none;
}
.badge-color-input {
  padding: 0;
  min-width: 48px;
  overflow: hidden;
}
.badge-color-input input {
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  cursor: pointer;
}
.badge-avatarbox {
  background: url("/assets/images/badgecreator/avatarbox.png");
  width: 199px;
  height: 180px;
  flex-shrink: 0;
}
.badge-preview-name {
  font-size: 12px;
  margin: 13px 0 0 30px;
  color: white;
}
.badge-preview-avatar {
  float: left;
  background-repeat: no-repeat;
  width: 60px;
  height: 120px;
  margin: 10px 0 0 15px;
}
.badge-preview {
  float: left;
  margin: 7px 0 0 15px;
  image-rendering: pixelated;
  background: transparent;
}
</style>
