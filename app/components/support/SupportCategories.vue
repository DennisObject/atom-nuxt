<script setup lang="ts">
import { BaseCard } from "#components";
import RichText from "~/components/RichText.vue";
import type { Data } from "~/utils/api";

defineProps<{ categories: Data<"SupportCategory">[] }>();
const { t } = useLocale();
const { safeUrl } = useApi();
</script>

<template>
  <div class="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
    <div
      v-for="small in [false, true]"
      :key="String(small)"
      class="grid content-start gap-4"
    >
      <BaseCard
        v-for="category in categories.filter(
          (item) => item.small_box === small,
        )"
        :key="category.id"
        :title="category.name"
        icon="duo-chat-icon"
      >
        <div class="px-2 text-sm text-[var(--text)]">
          <img
            v-if="!small && category.image_url"
            class="float-right px-2"
            :src="
              safeUrl(
                category.image_url.startsWith('/') ||
                  /^https?:/.test(category.image_url)
                  ? category.image_url
                  : `/assets/images/help-center/${category.image_url}`,
              )
            "
            alt=""
          />
          <RichText :html="category.content" />
        </div>
        <a
          v-if="safeUrl(category.button_url)"
          class="mt-4 ml-2 self-start rounded border-2 px-2 py-1 font-semibold text-white transition hover:scale-105"
          :style="{
            backgroundColor: category.button_color,
            borderColor: category.button_border_color,
          }"
          :href="safeUrl(category.button_url)"
        >
          {{ category.button_text || t("Read more") }}
        </a>
      </BaseCard>
    </div>
  </div>
</template>
