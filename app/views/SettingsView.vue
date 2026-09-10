<script setup lang="ts">
import { computed } from "vue";
import { BaseCard } from "#components";
import AccountSettingsForm from "~/components/settings/AccountSettingsForm.vue";
import SessionLogs from "~/components/settings/SessionLogs.vue";
import SettingsNavigation from "~/components/settings/SettingsNavigation.vue";
import TwoFactorSettings from "~/components/settings/TwoFactorSettings.vue";

const { t } = useLocale();

const { theme } = useAppConfig();

const route = useRoute();

const tab = computed(() => String(route.params.tab || "account"));

const titles: Record<string, string> = {
  account: "Account settings",
  password: "Password settings",
  "session-logs": "Session logs",
};
</script>

<template>
  <div class="grid grid-cols-12 items-start gap-x-3 gap-y-8">
    <SettingsNavigation :tab="tab" />

    <BaseCard
      class="col-span-12 min-w-0 md:col-span-9"
      :class="{
        'border border-current dark:border-gray-900': theme.name === 'atom',
      }"
      :title="
        t(
          tab === 'two-factor'
            ? 'Two factor authentication'
            : titles[tab] || 'Account settings',
        )
      "
      :subtitle="
        t(
          tab === 'account'
            ? 'Manage your account settings'
            : tab === 'password'
              ? 'Change your password by filling out the fields below'
              : tab === 'session-logs'
                ? 'Keep an eye on all your active sessions'
                : 'Add an extra layer of security to your account by enabling two-factor authentication',
        )
      "
      icon="hotel-icon"
    >
      <AccountSettingsForm
        v-if="tab === 'account' || tab === 'password'"
        :key="tab"
        :tab="tab"
      />

      <TwoFactorSettings v-else-if="tab === 'two-factor'" />

      <SessionLogs v-else-if="tab === 'session-logs'" />
    </BaseCard>
  </div>
</template>
