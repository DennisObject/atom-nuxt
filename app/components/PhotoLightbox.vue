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
  if (index < 0) return;
  selectedIndex.value = index;
  dialog.value?.showModal();
}
function changePhoto(step: number) {
  if (!props.photos.length) return;
  selectedIndex.value =
    (selectedIndex.value + step + props.photos.length) % props.photos.length;
}
defineExpose({ open });
</script>
<template>
  <dialog
    ref="dialog"
    class="photo-lightbox"
    :aria-label="t('Hotel photos')"
    @keydown.left.prevent="changePhoto(-1)"
    @keydown.right.prevent="changePhoto(1)"
    @click="$event.target === dialog && dialog?.close()"
  >
    <button
      class="photo-close"
      :aria-label="t('Close')"
      @click="dialog?.close()"
    >
      ×
    </button>
    <img
      v-if="selectedPhoto"
      :src="safeUrl(selectedPhoto.url)"
      :alt="selectedPhoto.author?.username || t('Hotel photos')"
    />
    <div class="photo-controls">
      <button
        class="secondary"
        :aria-label="t('Previous photo')"
        :disabled="photos.length < 2"
        @click="changePhoto(-1)"
      >
        ‹
      </button>
      <p>{{ selectedPhoto?.author?.username }}</p>
      <button
        class="secondary"
        :aria-label="t('Next photo')"
        :disabled="photos.length < 2"
        @click="changePhoto(1)"
      >
        ›
      </button>
    </div>
  </dialog>
</template>
<style scoped>
.photo-lightbox {
  width: fit-content;
  max-width: 95vw;
  max-height: 95vh;
  margin: auto;
  padding: 16px;
  border: 0;
  border-radius: 8px;
  background: var(--panel);
  color: var(--text);
}
.photo-lightbox::backdrop {
  background: #000c;
}
.photo-lightbox > img {
  max-height: 75vh;
  max-width: 85vw;
  object-fit: contain;
}
.photo-close {
  display: block;
  margin-left: auto;
  border: 0;
  background: none;
  color: inherit;
  font-size: 24px;
  padding: 0 8px;
}
.photo-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.photo-controls p {
  text-align: center;
}
</style>
