<script setup lang="ts">
import { computed, ref } from "vue";
import type { Data } from "~/utils/api";

const props = defineProps<{ photos: Data<"Bootstrap">["latest_photos"] }>();
const { t } = useLocale();
const { safeUrl } = useApi();
const dialog = ref<HTMLDialogElement>();
const selectedIndex = ref(0);
const selectedPhoto = computed(() => props.photos[selectedIndex.value]);

function open(url: string) {
  const index = props.photos.findIndex((photo) => photo.url === url);
  if (index < 0) {
    return;
  }
  selectedIndex.value = index;
  dialog.value?.showModal();
}

function changePhoto(step: number) {
  if (!props.photos.length) {
    return;
  }
  selectedIndex.value =
    (selectedIndex.value + step + props.photos.length) % props.photos.length;
}

defineExpose({ open });
</script>
<template>
  <dialog
    ref="dialog"
    class="m-auto w-fit max-w-[95vw] max-h-[95vh] rounded-lg border-0 bg-[var(--panel)] p-4 text-[var(--text)] backdrop:bg-black/80"
    :aria-label="t('Hotel photos')"
    @keydown.left.prevent="changePhoto(-1)"
    @keydown.right.prevent="changePhoto(1)"
    @click="$event.target === dialog && dialog?.close()"
  >
    <button
      class="ml-auto block border-0 bg-transparent px-2 py-0 text-2xl text-inherit"
      :aria-label="t('Close')"
      @click="dialog?.close()"
    >
      ×
    </button>
    <img
      v-if="selectedPhoto"
      class="max-h-[75vh] max-w-[85vw] object-contain"
      :src="safeUrl(selectedPhoto.url)"
      :alt="selectedPhoto.author?.username || t('Hotel photos')"
    />
    <div class="flex items-center justify-between gap-4 [&_p]:text-center">
      <button
        class="border-[var(--border)] bg-[var(--surface-muted)]"
        :aria-label="t('Previous photo')"
        :disabled="photos.length < 2"
        @click="changePhoto(-1)"
      >
        ‹
      </button>
      <p>{{ selectedPhoto?.author?.username }}</p>
      <button
        class="border-[var(--border)] bg-[var(--surface-muted)]"
        :aria-label="t('Next photo')"
        :disabled="photos.length < 2"
        @click="changePhoto(1)"
      >
        ›
      </button>
    </div>
  </dialog>
</template>
