<script setup lang="ts">
import { computed } from "vue";
import PaymentStatus from "~/components/shop/PaymentStatus.vue";
import PurchaseHistory from "~/components/shop/PurchaseHistory.vue";
import ShopCatalog from "~/components/shop/ShopCatalog.vue";

const { t } = useLocale();
const route = useRoute();
const history = computed(() => route.meta.history === true);
const orderId = computed(() =>
  String(route.params.order || route.query.order || route.query.token || ""),
);
</script>

<template>
  <div
    v-if="history || orderId"
    class="mb-[18px] flex items-center justify-between gap-5 max-[700px]:items-start"
  >
    <h1>{{ t(history ? "Purchase history" : "Payment status") }}</h1>
    <NuxtLink to="/shop">{{ t("Back to store") }} →</NuxtLink>
  </div>
  <PaymentStatus v-if="orderId" :key="orderId" :order-id="orderId" />
  <PurchaseHistory v-else-if="history" />
  <ShopCatalog v-else :key="String(route.params.category || '')" />
</template>
