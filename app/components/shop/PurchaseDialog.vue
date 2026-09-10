<script setup lang="ts">
import { ref, watch } from "vue";
import { BaseCard } from "#components";
import AppNotice from "~/components/AppNotice.vue";
import type { Data } from "~/utils/api";
import { money } from "~/utils/money";

const { t } = useLocale();

const { api } = useApi();

const { refreshUser } = useSession();

const { busy, error, fields, success, run } = usePage();

const emit = defineEmits<{ purchased: [] }>();

const { keyFor } = usePurchaseAttempt();

const selected = ref<Data<"ShopPackage"> | null>(null);

const receiver = ref("");

const termsAccepted = ref(false);

const gifting = ref(false);

const purchaseDialog = ref<HTMLDialogElement>();

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
        `/users?q=${encodeURIComponent(query)}`,
      );

      if (active) {
        recipients.value = result.data;
      }
    } catch {
      if (active) {
        recipients.value = [];
      }
    }
  }, 250);

  cleanup(() => {
    active = false;

    clearTimeout(timer);
  });
});

function open(item: Data<"ShopPackage">, gift = false) {
  gifting.value = gift;

  selected.value = item;

  receiver.value = "";

  termsAccepted.value = false;

  purchaseDialog.value?.showModal();
}

async function purchase() {
  if (!selected.value) {
    return;
  }

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
      { "Idempotency-Key": attempt.key },
    );

    sessionStorage.removeItem(attempt.storage);

    purchaseDialog.value?.close();

    selected.value = null;

    receiver.value = "";

    await refreshUser();

    emit("purchased");
  }, "Purchase complete. Your items will be delivered in the hotel.");
}

defineExpose({ open });
</script>

<template>
  <AppNotice :teleport="false" :success="success" />

  <dialog
    ref="purchaseDialog"
    class="m-auto max-h-[85vh] w-[min(640px,calc(100vw-32px))] rounded-lg border-0 bg-[var(--header)] p-6 text-[var(--text)] backdrop:bg-black/55 max-w-[480px]"
  >
    <BaseCard
      v-if="selected"
      :title="
        gifting
          ? t('Gift :package', { package: selected.name })
          : t('Purchase :package', { package: selected.name })
      "
      icon="store_icon"
    >
      <AppNotice :teleport="false" :error="error" :fields="fields" />

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
            :placeholder="t('Leave empty to buy for yourself')"
          />
        </label>

        <datalist id="gift-recipients">
          <option
            v-for="recipient in recipients"
            :key="recipient.username"
            :value="recipient.username"
          />
        </datalist>

        <label class="flex items-center text-[13px]">
          <input v-model="termsAccepted" type="checkbox" required />
          {{ t("I have read and accept the shop terms.") }}
        </label>

        <div class="flex items-center gap-4 flex-wrap">
          <button :disabled="busy">
            {{ t("Confirm purchase") }}
          </button>

          <button
            class="border-[var(--border)] bg-[var(--surface-muted)]"
            type="button"
            @click="
              purchaseDialog?.close();
              selected = null;
            "
          >
            {{ t("Cancel") }}
          </button>
        </div>
      </form>
    </BaseCard>
  </dialog>
</template>
