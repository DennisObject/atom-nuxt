<script setup lang="ts">
import { BaseCard } from "#components";

const referralInput = useTemplateRef<HTMLInputElement>("referralInput");
const { t, session, busy, error, success, referralLink, claim, copyReferral } =
  useReferrals(referralInput);
</script>

<template>
  <div>
    <AppNotice :error="error" :success="success" />
    <BaseCard
      v-if="session.user"
      class="[&_.card-heading]:border-0"
      :title="
        t('User Referrals (%s/%s)')
          .replace('%s', String(session.user.referrals_total ?? 0))
          .replace('%s', String(session.user.referral_threshold ?? 0))
      "
      :subtitle="t('Referral new users and be rewarded by in-game goods')"
      icon="friends-icon"
    >
      <div class="px-2 text-sm dark:text-gray-200">
        <p>
          {{
            t(
              "Here at :hotel we have added a referral system, allowing you to obtain a bonus for every :needed users that registers through your referral link will allow you to claim a reward of :amount diamonds!",
              {
                hotel: session.bootstrap.hotel_name,
                needed: session.user.referral_threshold ?? 0,
                amount: session.user.referral_reward_amount ?? 0,
              },
            )
          }}
        </p>
        <small class="text-gray-400">
          {{
            t(
              "Boosting referrals by making own accounts will lead to removal of all progress, currency, inventory and a potential ban",
            )
          }}
        </small>
        <div
          class="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,10fr)_minmax(0,2fr)]"
        >
          <input
            ref="referralInput"
            class="min-w-0 rounded border-4 border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#eeb425] focus:ring-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            :value="referralLink"
            readonly
            :aria-label="t('Your invitation link')"
          />
          <button
            class="w-full rounded border-2 border-green-500 bg-green-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-700"
            :disabled="busy"
            @click="copyReferral"
          >
            {{ t("Copy code") }}
          </button>
        </div>
        <button
          v-if="session.user.referrals_needed === 0"
          class="mt-2 w-full rounded border-2 border-green-500 bg-green-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-700"
          :disabled="busy"
          @click="claim"
        >
          {{ t("Claim your referrals reward!") }}
        </button>
        <button
          v-else
          class="mt-2 w-full rounded border-0 bg-gray-400 p-2 font-normal text-white opacity-100 dark:bg-gray-900"
          disabled
        >
          {{
            t(
              "You need to refer :needed more users, before being able to claim your reward",
              { needed: session.user.referrals_needed ?? 0 },
            )
          }}
        </button>
      </div>
    </BaseCard>
  </div>
</template>
