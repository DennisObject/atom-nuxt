<script setup lang="ts">
import { BaseCard } from "#components";
import AuthForm from "~/components/AuthForm.vue";

const { t } = useLocale();

const { theme } = useAppConfig();

useSeoMeta({ title: () => t("Two-Factor Authentication") });
</script>

<template>
  <div class="grid grid-cols-12 gap-3">
    <BaseCard
      class="col-span-12 md:col-span-9 md:col-start-4"
      :class="{ 'border dark:border-gray-900': theme.name === 'atom' }"
      :title="t('Two-Factor Authentication')"
      :subtitle="
        t(
          'Please enter your two-factor authentication code or one of your recovery codes.',
        )
      "
      icon="hotel-icon"
    >
      <AuthForm kind="challenge" />
    </BaseCard>
  </div>
</template>
