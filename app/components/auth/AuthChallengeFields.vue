<script setup lang="ts">
import SettingsField from "~/components/settings/SettingsField.vue";
const form = defineModel<ReturnType<typeof useAuthPage>["form"]>({
  required: true,
});
const { t } = useLocale();
</script>

<template>
  <SettingsField
    v-model="form.code"
    compact
    name="code"
    class="mb-3"
    inputmode="numeric"
    autocomplete="one-time-code"
    :label="t('Code')"
    :placeholder="t('Code')"
    :description="
      t('Enter the two-factor authentication code from your authenticator app.')
    "
  />
  <div class="mt-4">
    <SettingsField
      v-model="form.recovery_code"
      compact
      name="recovery_code"
      class="mb-3"
      autocomplete="off"
      :label="t('Recovery Code')"
      :placeholder="t('Recovery Code')"
      :description="
        t(
          'Enter one of your recovery codes if you cannot access your authenticator app.',
        )
      "
    />
  </div>
</template>
