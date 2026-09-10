<script setup lang="ts">
import Editor from "@tinymce/tinymce-vue";

const model = defineModel<string>({ default: "" });

defineProps<{ disabled?: boolean }>();

const { session } = useSession();

const { mode, isDark } = useThemeMode();

const { editor } = useAppConfig();

const contentStyle = computed(() => {
  const colors = editor[mode.value];

  return `body { background: ${colors.background}; color: ${colors.text}; font-family: ${editor.fontFamily}; } a { color: ${colors.link}; }`;
});
</script>

<template>
  <Editor
    :key="mode"
    v-model="model"
    :api-key="session.bootstrap.tinymce_api_key || 'no-api-key'"
    cloud-channel="7"
    :disabled="disabled"
    :init="{
      skin: isDark ? 'oxide-dark' : 'oxide',
      content_css: isDark ? 'dark' : 'default',
      content_style: contentStyle,
      plugins: 'lists image',
      toolbar:
        'undo redo | blocks | bold italic | bullist numlist checklist | code | table',
    }"
  />
</template>
