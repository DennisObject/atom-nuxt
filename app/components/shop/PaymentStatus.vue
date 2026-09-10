<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { BaseCard } from "#components";
import AppNotice from "~/components/AppNotice.vue";
import type { Data } from "~/utils/api";

const { t } = useLocale();

const { api } = useApi();

const { refreshUser } = useSession();

const { busy, error, fields, run } = usePage();

const route = useRoute();

const props = defineProps<{ orderId: string }>();

const order = ref<Data<"PaypalStatus"> | null>(null);

const paymentHints: Record<string, string> = {
  completed:
    "PayPal has returned you to the hotel. Your balance updates after payment is verified.",
  pending: "Your payment is waiting for confirmation.",
  cancelled:
    "The PayPal checkout was cancelled. You can return to the store whenever you are ready.",
  failed:
    "We could not confirm your payment. Check its status before trying again.",
};

const paymentHint = computed(
  () => paymentHints[String(route.query.payment_status || "")] || "",
);

const orderMessage = computed(() => {
  const status = order.value?.status?.toUpperCase();

  if (["CANCELLED", "VOIDED"].includes(status || "")) {
    return "This payment was cancelled.";
  }

  if (status === "FAILED") {
    return "This payment failed. You can check with PayPal for more details.";
  }

  if (status === "REVIEW") {
    return "This payment needs to be reviewed by the hotel team.";
  }

  return "Payment confirmation can take a moment. Refresh to check for an update.";
});

async function load() {
  order.value = (
    await api<Data<"PaypalStatus">>(
      `/shop/paypal/orders/${encodeURIComponent(props.orderId)}`,
    )
  ).data;
}

async function refreshStatus() {
  await load();

  await refreshUser();
}

onMounted(() => run(load));
</script>

<template>
  <AppNotice :error="error" :fields="fields" />

  <p
    v-if="paymentHint && !order?.credited_at"
    class="relative m-0 flex items-start gap-3 overflow-hidden rounded-lg border-0 bg-[var(--panel)] p-3 pr-9 text-sm leading-5 shadow-lg"
    role="status"
  >
    {{ t(paymentHint) }}
  </p>

  <BaseCard v-if="order" :title="t('Your PayPal payment')" icon="store_icon">
    <p>{{ t("Order") }} {{ order.id }}</p>

    <p>
      {{ t("Status:") }}
      <strong>{{ order.status }}</strong>
    </p>

    <p
      v-if="order.credited_at"
      class="relative m-0 flex items-start gap-3 overflow-hidden rounded-lg border-0 bg-[var(--panel)] p-3 pr-9 text-sm leading-5 shadow-lg success"
    >
      {{ t("Your hotel balance has been credited.") }}
    </p>

    <p v-else class="text-[var(--muted)]">
      {{ t(orderMessage) }}
    </p>

    <div>
      <button :disabled="busy" @click="run(refreshStatus)">
        {{ t("Refresh status") }}
      </button>
    </div>
  </BaseCard>
</template>
