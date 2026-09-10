<script setup lang="ts">
import { computed } from "vue";
import DOMPurify from "isomorphic-dompurify";

const props = defineProps<{ html?: string | null }>();
const safe = computed(() =>
  DOMPurify.sanitize(props.html || "", {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["form", "input", "button", "style"],
    FORBID_ATTR: ["style"],
  }),
);
</script>
<template>
  <div
    class="leading-[1.7] [overflow-wrap:anywhere] [&_:is(p,ul,ol,h2,h3)]:mb-[15px] [&_a]:text-[var(--link)] [&_a]:underline [&_img]:h-auto [&_img]:max-w-full [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
    v-html="safe"
  ></div>
</template>
