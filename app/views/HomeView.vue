<script setup lang="ts">
const { t } = useLocale();
import { computed, ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";
const { api, safeUrl } = useApi();
import type { Data } from "~/utils/api";
const { avatar, session, refreshUser } = useSession();
import { usePage } from "~/composables/usePage";
import Card from "~/components/Card.vue";
import Notice from "~/components/Notice.vue";
import HomeWidget from "~/components/HomeWidget.vue";
const route = useRoute(),
  username = encodeURIComponent(String(route.params.username));
const { busy, error, fields, success, run } = usePage();
const home = ref<Data<"Home"> | null>(null),
  items = ref<Data<"HomeItem">[]>([]),
  inventory = ref<Data<"HomeItem">[]>([]),
  shop = ref<Data<"HomeShop">>({ categories: [], items: [] }),
  editing = ref(false),
  dirty = ref(false),
  backgroundId = ref(0);
const owner = computed(() => home.value?.user?.id === session.user?.id);
const previewItems = ref<Data<"HomeItem">[]>([]),
  previewBackground = ref<Data<"HomeDefinition"> | null>(null);
const visibleItems = computed(() => [...items.value, ...previewItems.value]);
const background = computed(
  () =>
    previewBackground.value?.image ||
    [...items.value, ...inventory.value].find(
      (item) => item.id === backgroundId.value
    )?.definition?.image ||
    home.value?.active_background?.definition?.image ||
    ""
);
const selectedItem = ref<Data<"HomeItem"> | null>(null);
async function load() {
  home.value = (await api<Data<"Home">>(`/homes/${username}`)).data;
  items.value = home.value.items || [];
  backgroundId.value = home.value.active_background?.id || 0;
  if (owner.value)
    inventory.value = (
      await api<Data<"HomeItem">[]>(`/homes/${username}/inventory`)
    ).data;
}
const { data: initial, error: initialError } = await useAsyncData(
  `home:${username}`,
  async () => {
    try {
      const result = (await api<Data<"Home">>(`/homes/${username}`)).data;
      const owned =
        result.user.id === session.user?.id
          ? (await api<Data<"HomeItem">[]>(`/homes/${username}/inventory`)).data
          : [];
      return { home: result, inventory: owned };
    } catch (failure) {
      const cause = failure as { status?: number; message?: string };
      throw createError({
        statusCode: cause.status || 500,
        statusMessage: cause.message || "Could not load this page.",
      });
    }
  }
);
if (initialError.value)
  throw createError({
    statusCode:
      (initialError.value as { status?: number }).status ||
      initialError.value.statusCode ||
      500,
    statusMessage: initialError.value.message,
  });
if (initial.value) {
  home.value = initial.value.home;
  items.value = JSON.parse(JSON.stringify(initial.value.home.items));
  backgroundId.value = initial.value.home.active_background?.id || 0;
  inventory.value = JSON.parse(JSON.stringify(initial.value.inventory));
}
useSeoMeta({
  title: () =>
    t("Home of :u", {
      u: home.value?.user.username || String(route.params.username),
    }),
});
const bag = ref<HTMLDialogElement>();
const inventorySelection = ref<number[]>([]),
  shopSelection = ref<number[]>([]);
const bagTab = ref("inventory"),
  inventoryType = ref("s"),
  shopCategory = ref<number | null>(null),
  quantity = ref(1);
watch(inventoryType, () => {
  inventorySelection.value = [];
});
watch(shopCategory, () => {
  shopSelection.value = [];
});
const filteredInventory = computed(() =>
  inventory.value.filter(
    (item) => item.definition?.type === inventoryType.value
  )
);
const placeQuantity = ref(1);
const inventoryStacks = computed(() => {
  const stacks = new Map<
    number,
    { item: Data<"HomeItem">; items: Data<"HomeItem">[] }
  >();
  for (const item of filteredInventory.value) {
    const key = item.definition?.id ?? -item.id;
    const stack = stacks.get(key);
    if (stack) stack.items.push(item);
    else stacks.set(key, { item, items: [item] });
  }
  return [...stacks.values()];
});
const activeStack = computed(() =>
  inventorySelection.value.length === 1
    ? inventoryStacks.value.find(
        (stack) => stack.item.id === inventorySelection.value[0]
      )
    : undefined
);
watch(inventorySelection, () => {
  placeQuantity.value = 1;
});
const filteredShop = computed(() =>
  shop.value.items.filter(
    (item) =>
      shopCategory.value === null || item.category_id === shopCategory.value
  )
);
function openBag(tab: string) {
  bagTab.value = tab;
  bag.value?.showModal();
}
function currencyName(currency: number): string {
  return t(
    (
      { [-1]: "Credits", 0: "Duckets", 5: "Diamonds", 101: "Points" } as Record<
        number,
        string
      >
    )[currency] || String(currency)
  );
}
onBeforeRouteLeave(
  () => !dirty.value || window.confirm("Leave without saving your home layout?")
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
function place(item: Data<"HomeItem">) {
  if (item.definition?.type === "b") {
    const previous = home.value?.active_background;
    if (
      previous &&
      previous.id !== item.id &&
      !inventory.value.some((entry) => entry.id === previous.id)
    )
      inventory.value.push(previous);
    backgroundId.value = item.id;
    if (home.value) home.value.active_background = item;
    inventory.value = inventory.value.filter((entry) => entry.id !== item.id);
    dirty.value = true;
    return;
  } else {
    const existing = items.value.find((entry) => entry.id === item.id);
    if (existing) existing.placed = true;
    else
      items.value.push({
        ...item,
        x: 30,
        y: 30,
        z: items.value.length + 1,
        placed: true,
      });
  }
  inventory.value = inventory.value.filter((entry) => entry.id !== item.id);
  dirty.value = true;
}
function remove(item: Data<"HomeItem">) {
  item.placed = false;
  inventory.value.push(item);
  selectedItem.value = null;
  dirty.value = true;
}
function drag(event: PointerEvent, item: Data<"HomeItem">) {
  if (
    !editing.value ||
    (event.target as HTMLElement).closest("button,a,input,textarea,select")
  )
    return;
  selectedItem.value = item.id > 0 ? item : null;
  const element = event.currentTarget as HTMLElement;
  item.z = Math.min(
    1000,
    Math.max(0, ...visibleItems.value.map((entry) => entry.z)) + 1
  );
  const stage = element.parentElement!;
  const maxX = Math.max(0, stage.clientWidth - element.offsetWidth),
    maxY = Math.max(0, stage.clientHeight - element.offsetHeight);
  const startX = event.clientX,
    startY = event.clientY,
    initialX = Number(item.x),
    initialY = Number(item.y);
  element.setPointerCapture(event.pointerId);
  const move = (next: PointerEvent) => {
    item.x = Math.round(
      Math.max(0, Math.min(maxX, initialX + next.clientX - startX))
    );
    item.y = Math.round(
      Math.max(0, Math.min(maxY, initialY + next.clientY - startY))
    );
    dirty.value = true;
  };
  const end = () => {
    element.removeEventListener("pointermove", move);
    element.removeEventListener("pointerup", end);
    element.removeEventListener("pointercancel", end);
  };
  element.addEventListener("pointermove", move);
  element.addEventListener("pointerup", end);
  element.addEventListener("pointercancel", end);
}
function placeSelected() {
  for (const stack of inventoryStacks.value) {
    if (!inventorySelection.value.includes(stack.item.id)) continue;
    const count =
      inventorySelection.value.length === 1 &&
      !["w", "b"].includes(stack.item.definition?.type || "")
        ? Math.max(
            1,
            Math.min(stack.items.length, Math.floor(placeQuantity.value))
          )
        : 1;
    for (const item of stack.items.slice(0, count)) place(item);
  }
  inventorySelection.value = [];
  bag.value?.close();
}
function preview(item: Data<"HomeDefinition">) {
  if (item.type === "b") previewBackground.value = item;
  else if (
    !previewItems.value.some((entry) => entry.definition?.id === item.id)
  )
    previewItems.value.push({
      id: -item.id,
      definition: item,
      x: 30,
      y: 30,
      z: items.value.length + previewItems.value.length + 1,
      placed: true,
      is_reversed: false,
      theme: item.type === "w" ? "default" : item.type === "n" ? "note" : null,
      extra_data: "",
    });
  bag.value?.close();
}
function previewSelected() {
  for (const item of shop.value.items)
    if (shopSelection.value.includes(item.id)) preview(item);
}
function endPreview() {
  previewItems.value = [];
  previewBackground.value = null;
}
async function purchaseAndPlace(
  item: Data<"HomeDefinition">,
  count: number,
  position?: Data<"HomeItem">
) {
  const previous = new Set(
    [...inventory.value, ...items.value].map((entry) => entry.id)
  );
  await api(`/homes/${username}/purchases`, "POST", {
    item_id: item.id,
    quantity: count,
  });
  // Clear confirmed purchases before a separate inventory fetch or layout save can fail.
  previewItems.value = previewItems.value.filter(
    (entry) => entry.definition?.id !== item.id
  );
  if (previewBackground.value?.id === item.id) previewBackground.value = null;
  inventory.value = (
    await api<Data<"HomeItem">[]>(`/homes/${username}/inventory`)
  ).data;
  const purchased = inventory.value.filter(
    (entry) => !previous.has(entry.id) && entry.definition?.id === item.id
  );
  for (const entry of purchased) {
    place(entry);
    if (position && item.type !== "b") {
      const placed = items.value.find((current) => current.id === entry.id);
      if (placed) {
        placed.x = position.x;
        placed.y = position.y;
        placed.z = position.z;
      }
    }
  }
  await refreshUser();
}
async function buy(item: Data<"HomeDefinition">) {
  if (
    !window.confirm(
      `Buy ${quantity.value} × ${item.name} for ${
        item.price * quantity.value
      } ${currencyName(item.currency)}?`
    )
  )
    return;
  await run(async () => {
    await purchaseAndPlace(item, quantity.value);
    bag.value?.close();
  }, "Items purchased and placed. Save your home to keep this layout.");
}
async function buySelected() {
  const targets = filteredShop.value.filter((item) =>
    shopSelection.value.includes(item.id)
  );
  if (
    !targets.length ||
    !window.confirm(
      targets
        .map(
          (item) => `${item.name}: ${item.price} ${currencyName(item.currency)}`
        )
        .join("\n")
    )
  )
    return;
  const failures: string[] = [];
  await run(async () => {
    for (const item of targets) {
      try {
        await purchaseAndPlace(item, 1);
      } catch (failure) {
        failures.push(
          failure instanceof Error ? failure.message : t("Purchase failed.")
        );
      }
    }
    shopSelection.value = [];
    bag.value?.close();
  }, "Items purchased and placed. Save your home to keep this layout.");
  if (failures.length) {
    success.value = "";
    error.value = failures.join(" ");
  }
}
async function buyPreview() {
  const targets = [
    ...previewItems.value.map((entry) => ({
      definition: entry.definition!,
      position: entry,
    })),
    ...(previewBackground.value
      ? [{ definition: previewBackground.value, position: undefined }]
      : []),
  ];
  if (
    !targets.length ||
    !window.confirm(
      targets
        .map(
          (entry) =>
            `${entry.definition.name}: ${entry.definition.price} ${currencyName(
              entry.definition.currency
            )}`
        )
        .join("\n")
    )
  )
    return;
  const failures: string[] = [];
  let purchased = false;
  await run(async () => {
    for (const target of targets) {
      try {
        await purchaseAndPlace(target.definition, 1, target.position);
        purchased = true;
      } catch (failure) {
        failures.push(
          failure instanceof Error ? failure.message : t("Purchase failed.")
        );
      }
    }
  });
  if (purchased) await save();
  if (failures.length) error.value = failures.join(" ");
}
</script>
<template>
  <Notice :error="error" :fields="fields" :success="success" />
  <div v-if="home" class="stack home-page">
    <div class="home-toolbar">
      <h1 v-if="!owner">{{ t("Home of :u", { u: home.user.username }) }}</h1>
      <template v-else>
        <button v-if="!editing" class="gold" :disabled="busy" @click="edit">
          {{ t("Edit Home") }}
        </button>
        <template v-else>
          <div class="flex items-center gap-4 flex-wrap">
            <button :disabled="busy" @click="openBag('inventory')">
              {{ t("Inventory") }}</button
            ><button class="gold" :disabled="busy" @click="openBag('shop')">
              {{ t("Shop") }}
            </button>
          </div>
          <div class="flex items-center gap-4 flex-wrap">
            <button class="danger" :disabled="busy" @click="cancel">
              {{ t("Cancel") }}</button
            ><button :disabled="busy" @click="save">
              {{ t(busy ? "Saving..." : "Save") }}
            </button>
          </div>
        </template>
      </template>
    </div>
    <div
      v-if="previewItems.length || previewBackground"
      class="preview-toolbar"
    >
      <span>{{
        t("Preview mode - drag items to arrange, then purchase")
      }}</span>
      <div class="flex items-center gap-4">
        <button class="secondary" :disabled="busy" @click="endPreview">
          {{ t("Cancel") }}</button
        ><button :disabled="busy" @click="buyPreview">
          {{ t("Buy & Save") }}
        </button>
      </div>
    </div>
    <Card v-if="editing && selectedItem" :title="t('Selected item')"
      ><div class="grid four-columns">
        <label>
          {{ t("X position") }}
          <input
            v-model.number="selectedItem.x"
            type="number"
            min="0"
            max="2000"
            @input="dirty = true" /></label
        ><label>
          {{ t("Y position") }}
          <input
            v-model.number="selectedItem.y"
            type="number"
            min="0"
            max="2000"
            @input="dirty = true" /></label
        ><label>
          {{ t("Layer") }}
          <input
            v-model.number="selectedItem.z"
            type="number"
            min="0"
            max="1000"
            @input="dirty = true" /></label
        ><label class="check-label"
          ><input
            v-model="selectedItem.is_reversed"
            type="checkbox"
            @change="dirty = true"
          />
          {{ t("Flip image") }}
        </label>
      </div>
      <label v-if="selectedItem.definition?.type === 'n'">
        {{ t("Note text") }}
        <textarea
          v-model="selectedItem.extra_data"
          maxlength="2000"
          @input="dirty = true"
        ></textarea>
      </label>
      <div>
        <button class="small danger" @click="remove(selectedItem)">
          {{ t("Return to inventory") }}
        </button>
      </div></Card
    >
    <div
      class="home-stage"
      :style="{
        backgroundImage: background
          ? `url('${safeUrl(background)}')`
          : undefined,
      }"
    >
      <template v-for="item in visibleItems" :key="item.id"
        ><section
          v-if="item.placed && item.definition?.type !== 'b'"
          :class="[
            'home-widget',
            {
              editable: editing,
              preview: item.id < 0,
              'home-note': item.definition?.type === 'n',
            },
          ]"
          :style="{
            left: `${item.x}px`,
            top: `${item.y}px`,
            zIndex: item.z,
            width: item.definition?.type === 's' ? 'auto' : '280px',
            background:
              item.definition?.type === 's' ? 'transparent' : undefined,
            border: item.definition?.type === 's' ? 'none' : undefined,
          }"
          @pointerdown="drag($event, item)"
        >
          <h3 v-if="item.definition?.type === 'w'">
            {{ item.definition?.name }}
          </h3>
          <HomeWidget
            v-if="item.definition?.type === 'w' && item.id > 0"
            :member-since="home.member_since"
            :username="username"
            :item="item"
            :visitor="!!session.user && !owner"
            :editing="editing"
          />
          <p v-else-if="item.definition?.type === 'w'" class="p-2 italic">
            {{ t("Preview") }}
          </p>
          <p
            v-else-if="item.definition?.type === 'n'"
            style="white-space: pre-wrap"
          >
            {{ item.extra_data }}
          </p>
          <img
            v-else-if="item.definition?.image"
            :src="safeUrl(item.definition.image)"
            :alt="item.definition.name"
            :style="{
              transform: item.is_reversed ? 'scaleX(-1)' : undefined,
              pointerEvents: 'none',
            }"
          /><button
            v-if="editing && item.id > 0"
            class="small secondary"
            @click="selectedItem = item"
          >
            {{ t("Select") }}
          </button>
        </section></template
      >
      <p v-if="!items.filter((item) => item.placed).length" class="empty">
        {{
          t(
            owner
              ? "Make this space your own. Edit your home to place items."
              : "This home has not been decorated yet."
          )
        }}
      </p>
    </div>
    <dialog
      ref="bag"
      class="home-bag"
      @click="$event.target === bag && bag?.close()"
    >
      <header>
        <button
          :class="{ secondary: bagTab !== 'inventory' }"
          @click="bagTab = 'inventory'"
        >
          {{ t("Inventory") }}</button
        ><button
          :class="{ gold: bagTab === 'shop', secondary: bagTab !== 'shop' }"
          @click="bagTab = 'shop'"
        >
          {{ t("Shop") }}</button
        ><button
          class="close-bag"
          :aria-label="t('Close')"
          @click="bag?.close()"
        >
          ×
        </button>
      </header>
      <Notice :error="error" :fields="fields" :success="success" />
      <div class="bag-content">
        <nav
          v-if="bagTab === 'inventory'"
          :aria-label="t('Inventory categories')"
        >
          <button
            v-for="(name, type) in {
              s: 'Stickers',
              n: 'Notes',
              w: 'Widgets',
              b: 'Backgrounds',
            }"
            :key="type"
            :class="{ secondary: inventoryType !== type }"
            @click="inventoryType = String(type)"
          >
            {{ t(name) }}
          </button>
        </nav>
        <nav v-else :aria-label="t('Shop categories')">
          <button
            :class="{ secondary: shopCategory !== null }"
            @click="shopCategory = null"
          >
            {{ t("All") }}</button
          ><button
            v-for="category in shop.categories"
            :key="category.id"
            :class="{ secondary: shopCategory !== category.id }"
            @click="shopCategory = category.id"
          >
            {{ category.name }}
          </button>
        </nav>
        <template v-if="bagTab === 'inventory'">
          <div class="bag-items">
            <div class="w-full flex gap-2">
              <button
                class="small secondary"
                @click="
                  inventorySelection =
                    inventorySelection.length === inventoryStacks.length
                      ? []
                      : inventoryStacks.map((stack) => stack.item.id)
                "
              >
                {{
                  t(
                    inventorySelection.length === inventoryStacks.length
                      ? "Deselect all"
                      : "Select all"
                  )
                }}
              </button>
            </div>
            <button
              v-for="stack in inventoryStacks"
              :key="stack.item.id"
              class="inventory-item secondary"
              :title="stack.item.definition?.name"
              :aria-pressed="inventorySelection.includes(stack.item.id)"
              @click="
                inventorySelection = inventorySelection.includes(stack.item.id)
                  ? inventorySelection.filter((id) => id !== stack.item.id)
                  : [...inventorySelection, stack.item.id]
              "
              @dblclick="
                place(stack.item);
                inventorySelection = [];
                bag?.close();
              "
            >
              <img
                v-if="stack.item.definition?.image"
                :src="safeUrl(stack.item.definition.image)"
                :alt="stack.item.definition.name"
              /><span v-else>{{ stack.item.definition?.name }}</span
              ><span v-if="stack.items.length > 1" class="stack-count">{{
                stack.items.length
              }}</span
              ><span
                v-if="inventorySelection.includes(stack.item.id)"
                class="stack-selected"
                >✓</span
              >
            </button>
            <p v-if="!inventoryStacks.length" class="muted">
              {{ t("No items here.") }}
            </p>
          </div>
          <aside class="bag-preview">
            <template v-if="activeStack"
              ><strong>{{ activeStack.item.definition?.name }}</strong
              ><img
                v-if="activeStack.item.definition?.image"
                :src="safeUrl(activeStack.item.definition.image)"
                alt=""
              />
              <p>{{ activeStack.items.length }} {{ t("available") }}</p>
              <label
                v-if="
                  activeStack.items.length > 1 &&
                  activeStack.item.definition?.type === 's'
                "
                >{{ t("Quantity")
                }}<input
                  v-model.number="placeQuantity"
                  type="number"
                  min="1"
                  :max="activeStack.items.length" /></label
              ><button
                :disabled="
                  !Number.isInteger(placeQuantity) || placeQuantity < 1
                "
                @click="placeSelected"
              >
                {{ t("Place") }}
              </button></template
            >
            <template v-else-if="inventorySelection.length"
              ><strong
                >{{ inventorySelection.length }}
                {{ t("items selected") }}</strong
              ><button @click="placeSelected">
                {{ t("Place All") }}
              </button></template
            >
            <p v-else class="muted">
              {{ t("Choose an item to place it in your home") }}
            </p>
          </aside>
        </template>
        <div v-else class="bag-shop">
          <div class="flex gap-2">
            <button
              class="small secondary"
              @click="
                shopSelection =
                  shopSelection.length === filteredShop.length
                    ? []
                    : filteredShop.map((item) => item.id)
              "
            >
              {{
                t(
                  shopSelection.length === filteredShop.length
                    ? "Deselect all"
                    : "Select all"
                )
              }}</button
            ><button
              class="small"
              :disabled="!shopSelection.length"
              @click="previewSelected"
            >
              {{ t("Preview selected") }}</button
            ><button
              class="small"
              :disabled="busy || !shopSelection.length"
              @click="buySelected"
            >
              {{ t("Buy Selected") }}
            </button>
          </div>
          <label
            >{{ t("Quantity")
            }}<input v-model.number="quantity" type="number" min="1" max="100"
          /></label>
          <div v-for="item in filteredShop" :key="item.id" class="user-row">
            <input
              v-model="shopSelection"
              type="checkbox"
              :value="item.id"
              :aria-label="t('Select :name', { name: item.name })"
            /><img v-if="item.image" :src="safeUrl(item.image)" alt="" />
            <div>
              <strong>{{ item.name }}</strong>
              <p class="muted">
                {{ item.price }} {{ currencyName(item.currency) }}
              </p>
            </div>
            <button
              class="small secondary"
              :disabled="busy"
              @click="preview(item)"
            >
              {{ t("Preview") }}</button
            ><button
              class="small"
              :disabled="
                busy ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 100
              "
              @click="buy(item)"
            >
              {{ t("Buy") }}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.home-page {
  align-items: center;
}
.preview-toolbar {
  display: flex;
  width: 100%;
  max-width: 928px;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #164e6380;
  border: 1px solid #0e7490;
  border-radius: 8px;
  gap: 12px;
  font-size: 14px;
}
.home-widget.editable {
  touch-action: none;
  user-select: none;
}
.home-widget.preview {
  opacity: 0.6;
  outline: 2px dashed #22d3ee;
}
.inventory-item[aria-pressed="true"] {
  border: 2px solid #eeb425;
  background: #eeb42520;
}
.home-toolbar {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 928px;
}
.home-toolbar h1 {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  width: 100%;
}
.home-stage {
  width: 100%;
  max-width: 928px;
  height: 1360px;
  min-height: 1360px;
  border: 1px solid #374151;
  border-radius: 8px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.home-widget {
  background: #2b303c;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 0;
  color: #e5e7eb;
  overflow: hidden;
}
.home-widget h3 {
  background: #21242e;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
}
.home-widget :deep(.home-widget-content) {
  padding: 8px;
  font-size: 14px;
}
.home-widget.home-note {
  background: #fffbeb;
  border-color: #fde68a;
  border-radius: 4px;
  color: #1f2937;
  padding: 12px;
  font-size: 12px;
  min-width: 150px;
  min-height: 80px;
}
.home-bag {
  padding: 0;
  width: min(820px, calc(100vw - 32px));
  max-height: 75vh;
  border: 0;
  border-radius: 8px;
  background: #2b303c;
  color: #f3f4f6;
  margin: auto;
}
.home-bag::backdrop {
  background: #0009;
}
.home-bag header {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: #21242e;
}
.close-bag {
  margin-left: auto;
  background: transparent;
  border: 0;
  font-size: 24px;
}
.bag-content {
  display: flex;
  min-height: 300px;
}
.bag-content nav {
  width: 176px;
  flex-shrink: 0;
  padding: 8px;
  border-right: 1px solid #374151;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bag-content nav button {
  text-align: left;
  font-size: 14px;
}
.bag-preview {
  width: 176px;
  flex-shrink: 0;
  border-left: 1px solid #374151;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  text-align: center;
}
.bag-preview img {
  max-width: 72px;
  max-height: 72px;
  object-fit: contain;
}
.bag-preview input {
  width: 100%;
}
.stack-count {
  position: absolute;
  top: -4px;
  right: -4px;
  border-radius: 999px;
  background: #2563eb;
  color: white;
  font-size: 9px;
  min-width: 16px;
  height: 16px;
  padding: 0 2px;
}
.stack-selected {
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  background: #eeb425;
  border-bottom-right-radius: 4px;
  color: white;
  font-size: 10px;
}
.bag-items {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 6px;
  padding: 12px;
}
.inventory-item {
  position: relative;
  width: 64px;
  height: 64px;
  padding: 3px;
  border: 1px solid #4b5563;
}
.inventory-item img {
  max-width: 56px;
  max-height: 56px;
  object-fit: contain;
}
.bag-shop {
  padding: 12px;
  flex: 1;
  overflow: auto;
}
.bag-shop .user-row > img {
  max-width: 56px;
  max-height: 56px;
  object-fit: contain;
}
@media (max-width: 639px) {
  .bag-content nav {
    width: 110px;
  }
  .home-toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
