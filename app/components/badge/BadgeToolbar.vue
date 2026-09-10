<script setup lang="ts">
const copyMode = defineModel<boolean>("copyMode", { required: true });
const eraser = defineModel<boolean>("eraser", { required: true });
const showGrid = defineModel<boolean>("showGrid", { required: true });
const emit = defineEmits<{ import: [] }>();
const { t } = useLocale();
</script>

<template>
  <div class="flex flex-col md:flex-row flex-wrap gap-4 justify-between">
    <BadgeToolButton
      :aria-pressed="copyMode"
      :aria-label="t('Toggle copy color mode')"
      @click="
        copyMode = !copyMode;
        eraser = false;
      "
    >
      {{ t("Copy color:") }}
      <i class="fa-solid fa-eye-dropper" aria-hidden="true"></i>
    </BadgeToolButton>
    <BadgeToolButton
      :aria-pressed="eraser"
      :aria-label="t('Toggle erase mode')"
      @click="
        eraser = !eraser;
        copyMode = false;
      "
    >
      {{ t("Erase mode:") }}
      <i class="fa-solid fa-eraser" aria-hidden="true"></i>
    </BadgeToolButton>
    <BadgeToolButton
      :aria-label="t('Import a picture for your badge')"
      @click="emit('import')"
    >
      {{ t("Import Picture:") }}
      <i class="fa-solid fa-file-import" aria-hidden="true"></i>
    </BadgeToolButton>
    <BadgeToolButton
      :aria-pressed="showGrid"
      :aria-label="t('Toggle grid visibility')"
      @click="showGrid = !showGrid"
    >
      {{ t("Show Grid:") }}
      <i class="fa-solid fa-table-cells" aria-hidden="true"></i>
    </BadgeToolButton>
  </div>
</template>
