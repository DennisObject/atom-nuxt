<script setup lang="ts">
import Editor from "@tinymce/tinymce-vue";

const model = defineModel<string>({ default: "" });
defineProps<{ disabled?: boolean }>();
const { session } = useSession();
</script>

<template>
  <Editor
    v-model="model"
    :api-key="session.bootstrap.tinymce_api_key || 'no-api-key'"
    cloud-channel="7"
    :disabled="disabled"
    :init="{
      plugins: 'lists image',
      toolbar:
        'undo redo | blocks | bold italic | bullist numlist checklist | code | table',
    }"
  />
</template>
