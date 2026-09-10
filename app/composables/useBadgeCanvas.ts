import type { Ref } from "vue";
import { badgeGif } from "~/utils/badge";

export function useBadgeCanvas(
  canvas: Ref<HTMLCanvasElement | null>,
  preview: Ref<HTMLCanvasElement | null>,
) {
  const { t } = useLocale();
  const { run, error } = usePage();
  const color = ref("#000000");
  const eraser = ref(false);
  const copyMode = ref(false);
  const showGrid = ref(true);
  const hasPixels = ref(false);
  const history = ref<ImageData[]>([]);
  const recentColors = ref<string[]>([]);

  function snapshot() {
    const context = canvas.value?.getContext("2d");
    if (context) {
      history.value.push(context.getImageData(0, 0, 40, 40));
    }
    if (history.value.length > 30) {
      history.value.shift();
    }
  }

  function updatePreview() {
    const pixels = canvas.value?.getContext("2d")?.getImageData(0, 0, 40, 40);
    if (!pixels) {
      return;
    }
    preview.value?.getContext("2d")?.putImageData(pixels, 0, 0);
    hasPixels.value = pixels.data.some(
      (value, index) => index % 4 === 3 && value > 0,
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
    if (!context || !canvas.value) {
      return;
    }
    const bounds = canvas.value.getBoundingClientRect();
    const x = Math.floor(((event.clientX - bounds.left) * 40) / bounds.width);
    const y = Math.floor(((event.clientY - bounds.top) * 40) / bounds.height);
    if (x < 0 || y < 0 || x >= 40 || y >= 40) {
      return;
    }
    if (copyMode.value) {
      const pixel = context.getImageData(x, y, 1, 1).data;
      if (pixel[3]) {
        selectColor(
          `#${Array.from(pixel.slice(0, 3))
            .map((value) => value.toString(16).padStart(2, "0"))
            .join("")}`,
        );
      }
      return;
    }
    if (eraser.value) {
      context.clearRect(x, y, 1, 1);
    } else {
      context.fillStyle = color.value;
      context.fillRect(x, y, 1, 1);
      rememberColor(color.value);
    }
    updatePreview();
  }

  function start(event: PointerEvent) {
    if (!copyMode.value) {
      snapshot();
    }
    canvas.value?.setPointerCapture(event.pointerId);
    paint(event);
  }

  function move(event: PointerEvent) {
    if (event.buttons === 1) {
      paint(event);
    }
  }

  function undo() {
    const previous = history.value.pop();
    if (previous) {
      canvas.value?.getContext("2d")?.putImageData(previous, 0, 0);
    }
    updatePreview();
  }

  function clear() {
    snapshot();
    canvas.value?.getContext("2d")?.clearRect(0, 0, 40, 40);
    recentColors.value = [];
    updatePreview();
  }

  async function importImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    await run(async () => {
      if (!["image/png", "image/gif"].includes(file.type)) {
        throw new Error(t("Only PNG and GIF files are allowed."));
      }
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
    if (!pixels) {
      throw new Error("The badge canvas is unavailable.");
    }
    return badgeGif(pixels);
  }

  function download(name: string) {
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(encoded())], { type: "image/gif" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name || "badge"}.gif`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return {
    color,
    eraser,
    copyMode,
    showGrid,
    hasPixels,
    recentColors,
    error,
    selectColor,
    start,
    move,
    undo,
    clear,
    importImage,
    encoded,
    download,
  };
}
