<script setup lang="ts">
import { BaseCard } from "#components";
import type { Data } from "~/utils/api";
import PhotoLightbox from "~/components/PhotoLightbox.vue";

const { t } = useLocale();

const { artwork, theme } = useAppConfig();

const { avatar } = useSession();

const isAtom = theme.name === "atom";

const { api, safeUrl } = useApi();

const { busy, error, run } = usePage();

const lightbox = ref<InstanceType<typeof PhotoLightbox>>();

const { data: result, error: initialError } = await useAsyncData(
  "community:photos",
  () => api<Data<"Photo">[]>("/photos"),
);

const photos = computed(() => result.value?.data || []);

const page = computed(() => result.value?.meta?.current_page || 1);

const lastPage = computed(() => result.value?.meta?.last_page || 1);

async function load(nextPage: number) {
  result.value = await api<Data<"Photo">[]>(`/photos?page=${nextPage}`);
}
</script>

<template>
  <AppNotice :error="error || initialError?.message" />

  <component
    :is="isAtom ? BaseCard : 'div'"
    :title="isAtom ? t('Latest Photos') : undefined"
    :subtitle="
      isAtom
        ? t(
            'Have a look at some of the great moments captured by users around the hotel.',
          )
        : undefined
    "
    :icon="isAtom ? 'camera-icon' : undefined"
  >
    <div
      class="grid grid-cols-1 lg:grid-cols-4"
      :class="isAtom ? 'gap-2 md:grid-cols-2' : 'gap-4 sm:grid-cols-2'"
    >
      <a
        v-for="photo in photos"
        :key="photo.id"
        class="relative block cursor-pointer overflow-hidden"
        :class="
          isAtom
            ? 'h-[280px] rounded border-2 border-[var(--border)]'
            : 'rounded-md transition duration-300 ease-in-out hover:scale-[1.02]'
        "
        :href="safeUrl(photo.url)"
        @click.prevent="lightbox?.open(photo.url)"
        target="_blank"
        rel="noopener"
      >
        <span
          v-if="!isAtom"
          class="pointer-events-none absolute inset-0 z-1 bg-black/10"
        />

        <img
          class="block w-full object-cover object-center"
          :class="
            isAtom
              ? 'h-full'
              : 'h-[250px] rounded-md shadow-[0_7px_16px_#0000004d,0_1px_0_#0000004d]'
          "
          :src="safeUrl(photo.url)"
          :alt="`Photo by ${photo.author?.username || 'a hotel member'}`"
        />

        <span
          class="absolute z-5 flex items-center"
          :class="
            isAtom
              ? 'bottom-3 left-4 gap-3 rounded-full bg-[var(--panel)] pr-3'
              : 'right-2 bottom-2 gap-2 rounded-md bg-black/70 p-2 text-white'
          "
        >
          <span
            v-if="isAtom"
            class="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[var(--header)]"
          >
            <img :src="avatar(photo.author, { headonly: 1 })" alt="" />
          </span>

          <img v-else class="self-center" :src="artwork.photoAuthor" alt="" />

          <span :class="{ 'text-sm': !isAtom }">
            {{ photo.author?.username || t("Unknown") }}
          </span>
        </span>
      </a>
    </div>
  </component>

  <p
    v-if="!busy && !photos.length"
    class="rounded-lg bg-[var(--empty-bg)] p-[25px] text-center text-[var(--empty-text)]"
  >
    {{ t("No photos have been shared yet.") }}
  </p>

  <div v-if="lastPage > 1" class="mt-5 flex items-center justify-center gap-3">
    <button :disabled="busy || page === 1" @click="run(() => load(page - 1))">
      {{ t("Previous") }}
    </button>

    <span>{{ page }} / {{ lastPage }}</span>

    <button
      :disabled="busy || page === lastPage"
      @click="run(() => load(page + 1))"
    >
      {{ t("Next") }}
    </button>
  </div>

  <PhotoLightbox ref="lightbox" :photos="photos" />
</template>
