<script setup lang="ts">
import { ref } from "vue";

const { t } = useLocale();

const { session } = useSession();

const termsDialog = ref<HTMLDialogElement>();
</script>

<template>
  <div class="mb-4 rounded bg-[#f68b08] px-4 py-2 text-center text-white">
    {{ t("Please make sure to read our shop") }}
    <button
      class="min-h-0 border-0 bg-transparent p-0 font-bold underline"
      @click="termsDialog?.showModal()"
    >
      {{ t("Terms & Conditions") }}
    </button>
    {{ t("before making a purchase") }}
  </div>

  <dialog
    ref="termsDialog"
    class="m-auto max-h-[85vh] w-[min(640px,calc(100vw-32px))] rounded-lg border-0 bg-[var(--header)] p-6 text-[var(--text)] backdrop:bg-black/55"
  >
    <h2 class="mb-4 text-2xl">{{ t("Shop Terms & Conditions") }}</h2>

    <p class="my-2">
      {{
        t(
          "Here at :hotel Hotel we are accepting donations to keep the hotel up & running and as a thank you, you will in return receive in-game goods.",
          { hotel: session.bootstrap.hotel_name },
        )
      }}
    </p>

    <h3 class="mt-6 font-semibold">{{ t("Why are donations important?") }}</h3>

    <p class="my-2">
      {{
        t(
          "Donations are important, as it will help to pay our monthly bills needed to keep the hotel up & running, as well as adding new and exciting features for you and others to enjoy!",
        )
      }}
    </p>

    <h3 class="mt-6 font-semibold">{{ t("Our terms") }}</h3>

    <p class="my-2">
      {{
        t(
          "Once a donation has been made and received by us, it is non-refundable under any circumstances. The donated amount which is converted into website balance cannot be converted back into cash or other forms of money. By making a donation, you acknowledge and accept these terms and agree not to initiate a chargeback or dispute with your bank or card issuer.",
        )
      }}
    </p>

    <h3 class="mt-6 font-semibold">{{ t("Notice") }}</h3>

    <p class="my-2">
      {{
        t(
          "It is important to consider the consequences of our spending habits, especially when it comes to financial decisions. If you find yourself tempted to spend money you do not have, take a moment to reflect.",
        )
      }}
    </p>

    <p class="my-2">
      {{
        t(
          "Remember, your financial well-being is crucial, and making responsible choices is key. If you are facing difficulties in controlling your spending habits, do not hesitate to seek friendly and professional guidance. There are resources available that can provide valuable advice and support.",
        )
      }}
    </p>

    <button
      class="border-[var(--border)] bg-[var(--surface-muted)] mt-4"
      @click="termsDialog?.close()"
    >
      {{ t("Close") }}
    </button>
  </dialog>
</template>
