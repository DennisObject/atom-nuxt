<script setup lang="ts">
import { displayDate } from "~/utils/date";
const { t } = useLocale();
import { computed, onMounted, ref, watch } from "vue";

const { api, safeUrl } = useApi();
import type { Data } from "~/utils/api";
const { session, refreshUser } = useSession();
import { money } from "~/utils/money";
import { usePage } from "~/composables/usePage";
import { Card } from "#components";
import Notice from "~/components/Notice.vue";
import RichText from "~/components/RichText.vue";
const route = useRoute();
const { busy, error, fields, success, run } = usePage();
const catalog = ref<Data<"Shop">>({ categories: [], packages: [] }),
  purchases = ref<Data<"Purchase">[]>([]),
  selected = ref<Data<"ShopPackage"> | null>(null),
  receiver = ref(""),
  voucher = ref(""),
  amount = ref(5),
  order = ref<Data<"PaypalStatus"> | null>(null),
  termsAccepted = ref(false);
const gifting = ref(false);
const termsDialog = ref<HTMLDialogElement>(),
  purchaseDialog = ref<HTMLDialogElement>();
const recipients = ref<{ username: string; look: string }[]>([]);
watch(receiver, (query, _, cleanup) => {
  let active = true;
  const timer = setTimeout(async () => {
    if (query.length < 2) {
      recipients.value = [];
      return;
    }
    try {
      const result = await api<{ username: string; look: string }[]>(
        `/users?q=${encodeURIComponent(query)}`
      );
      if (active) recipients.value = result.data;
    } catch {
      if (active) recipients.value = [];
    }
  }, 250);
  cleanup(() => {
    active = false;
    clearTimeout(timer);
  });
});
function choosePackage(item: Data<"ShopPackage">, gift = false) {
  gifting.value = gift;
  selected.value = item;
  receiver.value = "";
  termsAccepted.value = false;
  purchaseDialog.value?.showModal();
}
const history = computed(() => route.meta.history === true);
const page = ref(1),
  lastPage = ref(1);
const orderId = computed(() =>
  String(route.params.order || route.query.order || route.query.token || "")
);
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
  () => paymentHints[String(route.query.payment_status || "")] || ""
);
const orderMessage = computed(() => {
  const status = order.value?.status?.toUpperCase();
  if (["CANCELLED", "VOIDED"].includes(status || ""))
    return "This payment was cancelled.";
  if (status === "FAILED")
    return "This payment failed. You can check with PayPal for more details.";
  if (status === "REVIEW")
    return "This payment needs to be reviewed by the hotel team.";
  return "Payment confirmation can take a moment. Refresh to check for an update.";
});
async function load(nextPage = 1) {
  if (orderId.value)
    order.value = (
      await api<Data<"PaypalStatus">>(
        `/shop/paypal/orders/${encodeURIComponent(orderId.value)}`
      )
    ).data;
  else if (history.value) {
    const result = await api<Data<"Purchase">[]>(
      `/shop/purchases?page=${nextPage}`
    );
    purchases.value = result.data;
    page.value = result.meta?.current_page || nextPage;
    lastPage.value = result.meta?.last_page || 1;
  } else
    catalog.value = (
      await api<Data<"Shop">>(
        `/shop${
          route.params.category
            ? `?category=${encodeURIComponent(String(route.params.category))}`
            : ""
        }`
      )
    ).data;
}
onMounted(() => run(() => load()));
function keyFor(
  operation: string,
  payload: unknown
): { storage: string; key: string } {
  const storage = `dusk-pending:${
    session.user?.id
  }:${operation}:${JSON.stringify(payload)}`;
  const key = sessionStorage.getItem(storage) || crypto.randomUUID();
  sessionStorage.setItem(storage, key);
  return { storage, key };
}
async function purchase() {
  if (!selected.value) return;
  await run(async () => {
    const payload = {
      receiver:
        selected.value?.is_giftable && receiver.value ? receiver.value : null,
    };
    const attempt = keyFor(`package:${selected.value?.id}`, payload);
    await api(
      `/shop/packages/${selected.value?.id}/purchases`,
      "POST",
      payload,
      { "Idempotency-Key": attempt.key }
    );
    sessionStorage.removeItem(attempt.storage);
    purchaseDialog.value?.close();
    selected.value = null;
    receiver.value = "";
    await refreshUser();
    await load();
  }, "Purchase complete. Your items will be delivered in the hotel.");
}
async function redeem() {
  await run(async () => {
    await api("/shop/vouchers", "POST", { code: voucher.value });
    voucher.value = "";
    await refreshUser();
  }, "Your voucher has been redeemed.");
}
async function topup() {
  await run(async () => {
    const payload = { amount: Number(amount.value) },
      attempt = keyFor("paypal", payload);
    const result = await api<Data<"PaypalOrder">>(
      "/shop/paypal/orders",
      "POST",
      payload,
      {
        "Idempotency-Key": attempt.key,
      }
    );
    const url = safeUrl(result.data.approval_url);
    if (!url)
      throw new Error(
        "PayPal did not return a valid approval link. Please try again."
      );
    sessionStorage.removeItem(attempt.storage);
    window.location.assign(url);
  });
}
</script>
<template>
  <div v-if="history || orderId" class="section-heading">
    <h1>{{ t(history ? "Purchase history" : "Payment status") }}</h1>
    <NuxtLink to="/shop">{{ t("Back to store") }} →</NuxtLink>
  </div>
  <div v-else class="shop-terms-banner">
    {{ t("Please make sure to read our shop") }}
    <button @click="termsDialog?.showModal()">
      {{ t("Terms & Conditions") }}
    </button>
    {{ t("before making a purchase") }}
  </div>
  <dialog ref="termsDialog" class="shop-dialog">
    <h2>{{ t("Shop Terms & Conditions") }}</h2>
    <p>
      {{
        t(
          "Here at :hotel Hotel we are accepting donations to keep the hotel up & running and as a thank you, you will in return receive in-game goods.",
          { hotel: session.bootstrap.hotel_name }
        )
      }}
    </p>
    <h3>{{ t("Why are donations important?") }}</h3>
    <p>
      {{
        t(
          "Donations are important, as it will help to pay our monthly bills needed to keep the hotel up & running, as well as adding new and exciting features for you and others to enjoy!"
        )
      }}
    </p>
    <h3>{{ t("Our terms") }}</h3>
    <p>
      {{
        t(
          "Once a donation has been made and received by us, it is non-refundable under any circumstances. The donated amount which is converted into website balance cannot be converted back into cash or other forms of money. By making a donation, you acknowledge and accept these terms and agree not to initiate a chargeback or dispute with your bank or card issuer."
        )
      }}
    </p>
    <h3>{{ t("Notice") }}</h3>
    <p>
      {{
        t(
          "It is important to consider the consequences of our spending habits, especially when it comes to financial decisions. If you find yourself tempted to spend money you do not have, take a moment to reflect."
        )
      }}
    </p>
    <p>
      {{
        t(
          "Remember, your financial well-being is crucial, and making responsible choices is key. If you are facing difficulties in controlling your spending habits, do not hesitate to seek friendly and professional guidance. There are resources available that can provide valuable advice and support."
        )
      }}
    </p>
    <button class="secondary" @click="termsDialog?.close()">
      {{ t("Close") }}
    </button>
  </dialog>
  <Notice :error="error" :fields="fields" :success="success" />
  <p v-if="paymentHint && !order?.credited_at" class="notice" role="status">
    {{ t(paymentHint) }}
  </p>
  <Card v-if="order" :title="t('Your PayPal payment')" icon="store_icon"
    ><p>{{ t("Order") }} {{ order.id }}</p>
    <p>
      {{ t("Status:") }} <strong>{{ order.status }}</strong>
    </p>
    <p v-if="order.credited_at" class="notice success">
      {{ t("Your hotel balance has been credited.") }}
    </p>
    <p v-else class="muted">
      {{ t(orderMessage) }}
    </p>
    <div>
      <button
        :disabled="busy"
        @click="
          run(async () => {
            await load();
            await refreshUser();
          })
        "
      >
        {{ t("Refresh status") }}
      </button>
    </div></Card
  >
  <Card v-else-if="history" :title="t('Your purchases')" icon="store_icon"
    ><div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t("Package") }}</th>
            <th>{{ t("Recipient") }}</th>
            <th>{{ t("Date") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in purchases" :key="item.id">
            <td>{{ item.package_name }}</td>
            <td>
              {{ item.recipient_username || session.user?.username }}
            </td>
            <td>
              {{ displayDate(item.created_at, true) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!purchases.length && !busy" class="empty">
      {{ t("You haven't made any purchases yet.") }}
    </p>
    <div v-if="lastPage > 1" class="pagination">
      <button :disabled="busy || page === 1" @click="run(() => load(page - 1))">
        {{ t("Previous") }}</button
      ><span>{{ page }} / {{ lastPage }}</span
      ><button
        :disabled="busy || page === lastPage"
        @click="run(() => load(page + 1))"
      >
        {{ t("Next") }}
      </button>
    </div></Card
  >
  <div v-else class="shop-layout">
    <aside class="shop-categories">
      <h2>{{ t("Categories") }}</h2>
      <nav class="sidebar-nav" :aria-label="t('Store categories')">
        <NuxtLink to="/shop"
          ><img src="/assets/images/icons/navigation/shop.png" alt="" />
          {{ t("All") }} </NuxtLink
        ><NuxtLink
          v-for="category in catalog.categories"
          :key="category.id"
          :to="`/shop/category/${category.slug}`"
          ><img v-if="category.icon" :src="safeUrl(category.icon)" alt="" />{{
            category.name
          }}</NuxtLink
        >
      </nav>
    </aside>
    <aside class="shop-finance stack">
      <Card :title="t('Top up account')" icon="store_icon"
        ><strong class="price">{{
          money(session.user?.website_balance)
        }}</strong>
        <form @submit.prevent="topup">
          <label>
            {{ t("Top up (") }}
            {{ session.bootstrap.currency }})<input
              v-model.number="amount"
              type="number"
              min="1"
              max="250"
              required /></label
          ><button :disabled="busy">
            {{ t("Continue to PayPal") }}
          </button>
        </form></Card
      ><Card :title="t('Redeem a voucher')"
        ><form @submit.prevent="redeem">
          <label>
            {{ t("Voucher code") }}
            <input v-model="voucher" required autocomplete="off" /></label
          ><button :disabled="busy">{{ t("Redeem") }}</button>
        </form></Card
      >
      <NuxtLink to="/shop/purchases">{{ t("Your purchases") }} →</NuxtLink>
    </aside>
    <div class="shop-packages stack">
      <dialog ref="purchaseDialog" class="shop-dialog purchase-dialog">
        <Card
          v-if="selected"
          :title="
            gifting
              ? t('Gift :package', { package: selected.name })
              : t('Purchase :package', { package: selected.name })
          "
          icon="store_icon"
          ><Notice :error="error" :fields="fields" />
          <p>
            {{ t("Total:") }}
            <strong>{{ money(selected.price) }}</strong>
          </p>
          <form @submit.prevent="purchase">
            <label v-if="selected.is_giftable">
              {{ t("Gift recipient (optional)") }}
              <input
                v-model="receiver"
                list="gift-recipients"
                :required="gifting"
                :placeholder="t('Leave empty to buy for yourself')" /></label
            ><datalist id="gift-recipients">
              <option
                v-for="recipient in recipients"
                :key="recipient.username"
                :value="recipient.username"
              /></datalist
            ><label class="check-label"
              ><input v-model="termsAccepted" type="checkbox" required />
              {{ t("I have read and accept the shop terms.") }}
            </label>
            <div class="flex items-center gap-4 flex-wrap">
              <button :disabled="busy">
                {{ t("Confirm purchase") }}</button
              ><button
                class="secondary"
                type="button"
                @click="
                  purchaseDialog?.close();
                  selected = null;
                "
              >
                {{ t("Cancel") }}
              </button>
            </div>
          </form></Card
        >
      </dialog>
      <div class="grid two-columns">
        <section
          v-for="item in catalog.packages"
          :key="item.id"
          class="shop-package"
        >
          <header>
            <h2>{{ item.name }}</h2>
            <strong>{{ money(item.price) }}</strong>
          </header>
          <div class="package-body">
            <img
              v-if="item.image"
              class="package-art"
              :src="safeUrl(item.image)"
              :alt="item.name"
            /><RichText
              v-if="item.description"
              :html="item.description"
            /><strong>{{ t("Includes:") }}</strong>
            <ul>
              <li v-for="product in item.items" :key="product.id">
                {{ product.quantity }}x {{ product.name }}
              </li>
            </ul>
            <p v-if="item.stock !== null" class="package-stock">
              {{ t(":stock remaining", { stock: item.stock }) }}
            </p>
            <p v-if="item.limit_per_user" class="muted">
              {{ t("Limit: :limit per user", { limit: item.limit_per_user }) }}
            </p>
            <div class="package-actions">
              <button
                v-if="item.is_giftable"
                :disabled="busy || !item.available"
                :aria-label="t('Gift :package', { package: item.name })"
                @click="choosePackage(item, true)"
              >
                🎁</button
              ><button
                class="secondary"
                :disabled="busy || !item.available"
                @click="choosePackage(item)"
              >
                {{ t(item.available ? "Buy" : "Unavailable") }}
              </button>
            </div>
          </div>
        </section>
      </div>
      <p v-if="!busy && !catalog.packages?.length" class="empty">
        {{ t("There are no packages in this category yet.") }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.shop-terms-banner {
  padding: 8px 16px;
  text-align: center;
  background: #f68b08;
  color: white;
  border-radius: 4px;
  margin-bottom: 16px;
}
.shop-terms-banner button {
  padding: 0;
  border: 0;
  background: none;
  font-weight: bold;
  text-decoration: underline;
  min-height: 0;
}
.shop-layout {
  display: grid;
  grid-template-columns: minmax(0, 2.25fr) minmax(0, 6.75fr) minmax(0, 3fr);
  gap: 16px;
  align-items: start;
}
.shop-layout > * {
  min-width: 0;
}
.shop-categories {
  grid-column: 1;
  grid-row: 1;
}
.shop-finance {
  grid-column: 3;
  grid-row: 1;
}
.shop-packages {
  grid-column: 2;
  grid-row: 1;
}
.shop-categories h2 {
  background: var(--panel, #2b303c);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}
.shop-categories .sidebar-nav {
  background: none;
  padding: 0;
  border: 0;
  gap: 8px;
}
.shop-categories .sidebar-nav a {
  background: var(--panel, #2b303c);
  padding: 16px;
  border-radius: 8px;
  gap: 16px;
}
.shop-categories img {
  max-width: 50px;
  max-height: 50px;
  object-fit: contain;
}
.shop-package {
  border-radius: 8px;
  overflow: hidden;
  background: var(--panel, #2b303c);
}
.shop-package header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--header, #21242e);
  gap: 8px;
}
.shop-package h2 {
  font-size: 16px;
  font-weight: 600;
}
.package-body {
  padding: 16px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.package-art {
  width: auto;
  max-width: 65px;
  max-height: 65px;
  object-fit: contain;
  align-self: center;
  padding: 8px;
}
.package-body ul {
  list-style: disc;
  padding-left: 20px;
}
.package-stock {
  color: #facc15;
  font-size: 12px;
}
.package-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  gap: 16px;
}
.shop-dialog {
  width: min(640px, calc(100vw - 32px));
  margin: auto;
  padding: 24px;
  border: 0;
  border-radius: 8px;
  background: var(--header, #21242e);
  color: var(--text, #e5e7eb);
  max-height: 85vh;
}
.shop-dialog::backdrop {
  background: #0008;
}
.shop-dialog h2 {
  font-size: 24px;
  margin-bottom: 16px;
}
.shop-dialog h3 {
  font-weight: 600;
  margin-top: 24px;
}
.shop-dialog p {
  margin: 8px 0;
}
.shop-dialog > button {
  margin-top: 16px;
}
.purchase-dialog {
  max-width: 480px;
}
@media (max-width: 1023px) {
  .shop-layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);
  }
  .shop-finance {
    grid-row: 1;
    grid-column: 1 / -1;
  }
  .shop-categories {
    grid-row: 2;
  }
  .shop-packages {
    grid-row: 2;
  }
  .shop-packages .two-columns {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 639px) {
  .shop-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .shop-categories {
    grid-row: 2;
    grid-column: 1;
  }
  .shop-packages {
    grid-row: 3;
    grid-column: 1;
  }
}
</style>
