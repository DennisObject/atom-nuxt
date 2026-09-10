<script setup lang="ts">
import PhotoLightbox from "~/components/PhotoLightbox.vue";

const { t } = useLocale();
const { safeUrl } = useApi();
const { session, avatar } = useSession();
const photoViewer =
  useTemplateRef<InstanceType<typeof PhotoLightbox>>("photoViewer");
</script>

<template>
  <GuestCard
    v-if="session.bootstrap.latest_photos?.length"
    :title="t('Latest Photos')"
    :subtitle="
      t(
        'Have a look at some of the great moments captured by users around the hotel.',
      )
    "
    icon="camera-icon"
    heading-id="atom-latest-photos"
  >
    <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
      <a
        v-for="photo in session.bootstrap.latest_photos"
        :key="photo.id"
        class="cursor-pointer hover:text-inherit"
        :href="safeUrl(photo.url)"
        @click.prevent="photoViewer?.open(photo.url)"
        target="_blank"
        rel="noopener"
      >
        <div
          class="relative h-[280px] overflow-hidden rounded border-2 border-current object-fill dark:border-gray-600"
        >
          <img
            class="h-full w-full object-cover object-center"
            :src="safeUrl(photo.url)"
            :alt="`${t('Photo by')} ${photo.author?.username || t('Unknown')}`"
          />
          <div
            class="absolute bottom-3 left-4 flex items-center gap-x-3 rounded-full bg-white pr-3 dark:bg-gray-800"
          >
            <div
              class="flex size-10 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-gray-900"
            >
              <img
                :src="avatar(photo.author, { headonly: 1, head_direction: 2 })"
                alt=""
              />
            </div>
            <p class="dark:text-white">
              {{ photo.author?.username || t("Unknown") }}
            </p>
          </div>
        </div>
      </a>
    </div>
  </GuestCard>
  <PhotoLightbox
    ref="photoViewer"
    :photos="session.bootstrap.latest_photos || []"
  />
</template>
