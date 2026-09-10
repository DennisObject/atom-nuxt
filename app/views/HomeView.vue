<script setup lang="ts">
import { onBeforeRouteLeave } from "vue-router";
import type { Data } from "~/utils/api";
import HomeBag from "~/components/home/HomeBag.vue";
import HomeItemEditor from "~/components/home/HomeItemEditor.vue";
import HomePurchaseDialog from "~/components/home/HomePurchaseDialog.vue";
import HomeStage from "~/components/home/HomeStage.vue";

const { t } = useLocale();

const { api } = useApi();

const { session, refreshUser } = useSession();

const route = useRoute();

const username = encodeURIComponent(String(route.params.username));

const { busy, error, fields, success, run } = usePage();

const {
  home,
  items,
  inventory,
  editing,
  dirty,
  backgroundId,
  owner,
  previewItems,
  previewBackground,
  visibleItems,
  background,
  selectedItem,
  load,
  place,
  remove,
  drag,
  preview,
  endPreview,
  updateSelected,
} = await useHomeLayout(username);

const { purchaseAndPlace, purchaseBatch } = useHomePurchases(username, {
  inventory,
  items,
  previewItems,
  previewBackground,
  place,
});

const shop = ref<Data<"HomeShop">>({ categories: [], items: [] });

const bag = ref<InstanceType<typeof HomeBag>>();

const purchaseDialog = ref<InstanceType<typeof HomePurchaseDialog>>();

useSeoMeta({
  title: () =>
    t("Home of :u", {
      u: home.value?.user.username || String(route.params.username),
    }),
});

onBeforeRouteLeave(
  () =>
    !dirty.value || window.confirm("Leave without saving your home layout?"),
);

async function edit() {
  await run(async () => {
    shop.value = (await api<Data<"HomeShop">>("/home-shop")).data;

    editing.value = true;
  });
}

async function save() {
  await run(async () => {
    await api(`/homes/${username}`, "PUT", {
      items: items.value.map((item) => ({
        id: item.id,
        x: item.x,
        y: item.y,
        z: item.z,
        placed: item.placed,
        is_reversed: item.is_reversed,
        theme: item.theme,
        extra_data: item.extra_data,
      })),
      backgroundId: backgroundId.value,
    });

    endPreview();

    dirty.value = false;

    editing.value = false;

    selectedItem.value = null;

    await load();
  }, "Your home has been saved.");
}

async function cancel() {
  await run(async () => {
    await load();

    endPreview();

    dirty.value = false;

    editing.value = false;

    selectedItem.value = null;
  });
}

function placeItems(selected: Data<"HomeItem">[]) {
  selected.forEach(place);

  bag.value?.close();
}

function previewItemsFromShop(selected: Data<"HomeDefinition">[]) {
  selected.forEach(preview);

  bag.value?.close();
}

async function buy(
  item: Data<"HomeDefinition">,
  quantity: number,
  placeAfterPurchase = true,
) {
  if (busy.value) {
    return;
  }

  await run(
    async () => {
      await purchaseAndPlace(item, quantity, undefined, placeAfterPurchase);

      if (placeAfterPurchase) {
        bag.value?.close();
      }
    },
    placeAfterPurchase
      ? "Items purchased and placed. Save your home to keep this layout."
      : "Items purchased and added to your inventory.",
  );
}

async function buySelected(
  targets: Data<"HomeDefinition">[],
  placeAfterPurchase = true,
) {
  if (busy.value || !targets.length) {
    return;
  }

  let failures: string[] = [];

  await run(
    async () => {
      const result = await purchaseBatch(
        targets.map((definition) => ({ definition })),
        placeAfterPurchase,
      );

      failures = result.failures;

      if (placeAfterPurchase) {
        bag.value?.close();
      }
    },
    placeAfterPurchase
      ? "Items purchased and placed. Save your home to keep this layout."
      : "Items purchased and added to your inventory.",
  );

  if (failures.length) {
    success.value = "";

    error.value = failures.join(" ");
  }
}

async function confirmPreview() {
  await run(async () => {
    await refreshUser();

    purchaseDialog.value?.open([
      ...previewItems.value.flatMap((item) =>
        item.definition ? [item.definition] : [],
      ),
      ...(previewBackground.value ? [previewBackground.value] : []),
    ]);
  });
}

function removePreview(item: Data<"HomeDefinition">) {
  previewItems.value = previewItems.value.filter(
    (entry) => entry.definition?.id !== item.id,
  );

  if (previewBackground.value?.id === item.id) {
    previewBackground.value = null;
  }
}

async function buyPreview(selected: Data<"HomeDefinition">[]) {
  const targets = [
    ...previewItems.value.map((entry) => ({
      definition: entry.definition!,
      position: entry,
    })),
    ...(previewBackground.value
      ? [{ definition: previewBackground.value, position: undefined }]
      : []),
  ];

  const selectedTargets = targets.filter((entry) =>
    selected.some((item) => item.id === entry.definition.id),
  );

  if (busy.value || !selectedTargets.length) {
    return;
  }

  let failures: string[] = [];

  let purchased = 0;

  await run(async () => {
    const result = await purchaseBatch(selectedTargets);

    failures = result.failures;

    purchased = result.purchased;
  });

  if (purchased) {
    await save();
  }

  if (failures.length) {
    error.value = failures.join(" ");
  }
}
</script>

<template>
  <AppNotice :error="error" :fields="fields" :success="success" />

  <div v-if="home" class="flex flex-col gap-4 items-center">
    <div
      class="flex w-full max-w-[928px] justify-between max-sm:flex-wrap max-sm:gap-2"
    >
      <h1 v-if="!owner" class="w-full text-center text-xl font-semibold">
        {{ t("Home of :u", { u: home.user.username }) }}
      </h1>

      <template v-else>
        <button
          v-if="!editing"
          class="rounded border-2 border-yellow-400 bg-[#eeb425] px-5 py-1.5 text-sm font-semibold text-white hover:bg-[#d49f1c]"
          :disabled="busy"
          @click="edit"
        >
          {{ t("Edit Home") }}
        </button>

        <template v-else>
          <div class="flex items-center gap-4 flex-wrap">
            <button
              class="rounded border-2 border-blue-400 bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-600"
              :disabled="busy"
              @click="bag?.open('inventory')"
            >
              {{ t("Inventory") }}
            </button>

            <button
              class="rounded border-2 border-yellow-400 bg-[#eeb425] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#d49f1c]"
              :disabled="busy"
              @click="bag?.open('shop')"
            >
              {{ t("Shop") }}
            </button>
          </div>

          <div class="flex items-center gap-4 flex-wrap">
            <button
              class="rounded border-2 border-red-400 bg-red-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-600"
              :disabled="busy"
              @click="cancel"
            >
              {{ t("Cancel") }}
            </button>

            <button
              class="rounded border-2 border-green-500 bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
              :disabled="busy"
              @click="save"
            >
              {{ t(busy ? "Saving..." : "Save") }}
            </button>
          </div>
        </template>
      </template>
    </div>

    <div
      v-if="previewItems.length || previewBackground"
      class="flex w-full max-w-[928px] items-center justify-between gap-3 rounded-lg border border-cyan-700 bg-cyan-900/50 px-4 py-2 text-sm"
    >
      <span>
        {{ t("Preview mode - drag items to arrange, then purchase") }}
      </span>

      <div class="flex items-center gap-4">
        <button
          class="border-[var(--border)] bg-[var(--surface-muted)]"
          :disabled="busy"
          @click="endPreview"
        >
          {{ t("Cancel") }}
        </button>

        <button :disabled="busy" @click="confirmPreview">
          {{ t("Buy & Save") }}
        </button>
      </div>
    </div>

    <details
      v-if="editing && selectedItem"
      class="w-full max-w-[928px] text-sm"
    >
      <summary class="cursor-pointer text-[var(--text-dim)]">
        {{ t("Selected item") }}
      </summary>

      <HomeItemEditor
        :item="selectedItem"
        @update="updateSelected"
        @remove="remove(selectedItem!)"
      />
    </details>

    <HomeStage
      :items="visibleItems"
      :background="background"
      :username="username"
      :member-since="home.member_since"
      :visitor="!!session.user && !owner"
      :owner="owner"
      :editing="editing"
      :selected-id="selectedItem?.id"
      @remove="remove"
      @drag="drag"
      @select="selectedItem = $event"
    />

    <HomePurchaseDialog
      ref="purchaseDialog"
      :busy="busy"
      @confirm="buyPreview"
      @remove="removePreview"
    />

    <HomeBag
      ref="bag"
      :inventory="inventory"
      :shop="shop"
      :busy="busy"
      :error="error"
      :fields="fields"
      :success="success"
      @place="placeItems"
      @preview="previewItemsFromShop"
      @buy="buy"
      @buy-selected="buySelected"
    />
  </div>
</template>
