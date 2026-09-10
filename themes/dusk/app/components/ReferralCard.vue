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
      :title="`${t('User Referrals')} (${session.user.referrals_total ?? 0}/${session.user.referral_threshold ?? 0})`"
      :subtitle="t('Referral new users and be rewarded by in-game goods')"
      icon="hotel-icon"
    >
      <div class="text-sm">
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
        <br />
        <small class="text-gray-300">
          {{
            t(
              "Boosting referrals by making own accounts will lead to removal of all progress, currency, inventory and a potential ban",
            )
          }}
        </small>
        <div class="mt-2 grid grid-cols-12 gap-2">
          <input
            ref="referralInput"
            class="col-span-12 min-h-0 rounded border-2 border-gray-700 bg-[#21242e] py-2 text-gray-200 focus:border-[#eeb425] focus:ring-0 md:col-span-10"
            :value="referralLink"
            readonly
            :aria-label="t('Your invitation link')"
          />
          <button
            class="col-span-12 w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white transition-colors duration-150 hover:bg-green-700 md:col-span-2"
            :disabled="busy"
            @click="copyReferral"
          >
            {{ t("Copy code") }}
          </button>
        </div>
        <button
          v-if="session.user.referrals_needed === 0"
          class="mt-2 w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white transition-colors duration-150 hover:bg-green-700"
          :disabled="busy"
          @click="claim"
        >
          {{ t("Claim your referrals reward!") }}
        </button>
        <button
          v-else
          class="mt-2 w-full cursor-default rounded border-0 bg-[#171a23] p-2 text-white disabled:cursor-default disabled:opacity-100"
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
