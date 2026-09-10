<script setup lang="ts">
import PhotoLightbox from "~/components/PhotoLightbox.vue";

defineOptions({ inheritAttrs: false });

const props = defineProps<{ compact?: boolean }>();

const { safeUrl } = useApi();

const { session } = useSession();

const photos = computed(() =>
  (session.bootstrap.latest_photos || []).slice(0, props.compact ? 2 : 4),
);

const photoViewer =
  useTemplateRef<InstanceType<typeof PhotoLightbox>>("photoViewer");
</script>

<template>
  <div
    v-if="photos.length"
    v-bind="$attrs"
    class="grid grid-cols-1 gap-4 sm:grid-cols-2"
    :class="{ 'lg:grid-cols-4': !compact }"
  >
    <a
      v-for="photo in photos"
      :key="photo.id"
      class="relative cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
      :href="safeUrl(photo.url)"
      target="_blank"
      rel="noopener"
      @click.prevent="photoViewer?.open(photo.url)"
    >
      <div class="absolute inset-0 z-1 bg-black/10"></div>

      <img
        class="h-[250px] w-full rounded-md object-cover object-center shadow-[0_7px_16px_rgba(0,0,0,0.3),0_1px_0_rgba(0,0,0,0.3)]"
        :src="safeUrl(photo.url)"
        :alt="`Photo by ${photo.author?.username || 'a hotel member'}`"
      />

      <div
        class="absolute right-2 bottom-2 z-5 flex gap-x-2 rounded-md bg-black/70 p-2 text-white"
      >
        <img
          src="/assets/images/dusk/author_camera_icon.png"
          alt=""
          class="self-center"
        />

        <small class="text-inherit">{{ photo.author?.username }}</small>
      </div>
    </a>
  </div>

  <PhotoLightbox ref="photoViewer" :photos="photos" />
</template>
