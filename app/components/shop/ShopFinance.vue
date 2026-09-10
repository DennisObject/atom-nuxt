<script setup lang="ts">
import { ref } from "vue";
import { BaseCard } from "#components";
import AppNotice from "~/components/AppNotice.vue";
import type { Data } from "~/utils/api";
import { money } from "~/utils/money";

const { t } = useLocale();
const { api, safeUrl } = useApi();
const { session, refreshUser } = useSession();
const { busy, error, fields, success, run } = usePage();

const { keyFor } = usePurchaseAttempt();
const amount = ref(5);
const paypalConfigured = computed(
  () =>
    (
      session.bootstrap as Data<"Bootstrap"> & {
        payments?: { paypal_configured?: boolean };
      }
    ).payments?.paypal_configured !== false,
);
const voucher = ref("");

async function redeem() {
  await run(async () => {
    await api("/shop/vouchers", "POST", { code: voucher.value });
    voucher.value = "";
    await refreshUser();
  }, "Your voucher has been redeemed.");
}

async function topup() {
  await run(async () => {
    const payload = { amount: Number(amount.value) };
    const attempt = keyFor("paypal", payload);
    const result = await api<Data<"PaypalOrder">>(
      "/shop/paypal/orders",
      "POST",
      payload,
      {
        "Idempotency-Key": attempt.key,
      },
    );
    const url = safeUrl(result.data.approval_url);
    if (!url) {
      throw new Error(
        "PayPal did not return a valid approval link. Please try again.",
      );
    }
    sessionStorage.removeItem(attempt.storage);
    window.location.assign(url);
  });
}
</script>

<template>
  <aside class="grid content-start gap-4">
    <AppNotice :error="error" :fields="fields" :success="success" />
    <BaseCard
      :title="t('Top up account')"
      :subtitle="t('Donate to :hotel', { hotel: session.bootstrap.hotel_name })"
      icon="currency-icon"
    >
      <div
        class="rounded bg-[var(--surface-muted)] px-4 py-2 text-center text-sm"
      >
        {{
          t("Current balance: :balance", {
            balance: money(session.user?.website_balance),
          })
        }}
      </div>
      <form v-if="paypalConfigured" class="mt-3 gap-2" @submit.prevent="topup">
        <input
          v-model.number="amount"
          type="number"
          min="1"
          max="250"
          required
          :aria-label="t('amount')"
          :placeholder="t('amount')"
        />
        <button
          class="w-full rounded border-2 border-blue-500 bg-blue-600 p-2 font-semibold text-white hover:bg-blue-700"
          :disabled="busy"
        >
          {{ t("Donate") }}
        </button>
      </form>
      <p v-if="!paypalConfigured" class="mt-4 text-xs">
        {{ t("Please setup the paypal credentials to allow for top ups") }}
      </p>
    </BaseCard>
    <BaseCard
      :title="t('Voucher')"
      :subtitle="t('Use a voucher for free credit')"
      icon="catalog-icon"
    >
      <form class="gap-2" @submit.prevent="redeem">
        <input
          v-model="voucher"
          class="mb-3"
          required
          autocomplete="off"
          :aria-label="t('Voucher')"
          :placeholder="t('Voucher')"
        />
        <button
          class="mt-2 w-full rounded border-2 border-green-500 bg-green-600 p-2 font-semibold text-white hover:bg-green-700"
          :disabled="busy"
        >
          {{ t("Use voucher") }}
        </button>
      </form>
    </BaseCard>
    <NuxtLink to="/shop/purchases">{{ t("Your purchases") }} →</NuxtLink>
  </aside>
</template>
