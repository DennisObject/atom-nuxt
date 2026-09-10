<script setup lang="ts">
import type { Data } from "~/utils/api";

defineProps<{ item: Data<"HomeItem"> }>();
const emit = defineEmits<{
  update: [patch: Partial<Data<"HomeItem">>];
  remove: [];
}>();
const { t } = useLocale();

function updateNumber(key: "x" | "y" | "z", event: Event) {
  emit("update", { [key]: Number((event.target as HTMLInputElement).value) });
}
</script>

<template>
  <BaseCard :title="t('Selected item')">
    <div
      class="grid gap-4 grid-cols-4 max-[1000px]:grid-cols-2 max-[700px]:gap-3"
    >
      <label>
        {{ t("X position") }}
        <input
          :value="item.x"
          type="number"
          min="0"
          max="2000"
          @input="updateNumber('x', $event)"
        />
      </label>
      <label>
        {{ t("Y position") }}
        <input
          :value="item.y"
          type="number"
          min="0"
          max="2000"
          @input="updateNumber('y', $event)"
        />
      </label>
      <label>
        {{ t("Layer") }}
        <input
          :value="item.z"
          type="number"
          min="0"
          max="1000"
          @input="updateNumber('z', $event)"
        />
      </label>
      <label class="flex items-center text-[13px]">
        <input
          :checked="item.is_reversed"
          type="checkbox"
          @change="
            emit('update', {
              is_reversed: ($event.target as HTMLInputElement).checked,
            })
          "
        />
        {{ t("Flip image") }}
      </label>
    </div>
    <label v-if="item.definition?.type === 'n'">
      {{ t("Note text") }}
      <textarea
        :value="item.extra_data"
        maxlength="2000"
        @input="
          emit('update', {
            extra_data: ($event.target as HTMLTextAreaElement).value,
          })
        "
      ></textarea>
    </label>
    <div>
      <button
        class="px-[11px] py-[5px] text-[13px] border-[#d26475] bg-[#9e3b4a]"
        @click="emit('remove')"
      >
        {{ t("Return to inventory") }}
      </button>
    </div>
  </BaseCard>
</template>
