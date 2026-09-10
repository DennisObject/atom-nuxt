import type { Data } from "~/utils/api";

export async function useHomeLayout(username: string) {
  const { api } = useApi();

  const { session } = useSession();

  const home = ref<Data<"Home"> | null>(null);

  const items = ref<Data<"HomeItem">[]>([]);

  const inventory = ref<Data<"HomeItem">[]>([]);

  const editing = ref(false);

  const dirty = ref(false);

  const backgroundId = ref(0);

  const owner = computed(() => home.value?.user?.id === session.user?.id);

  const previewItems = ref<Data<"HomeItem">[]>([]);

  const previewBackground = ref<Data<"HomeDefinition"> | null>(null);

  const visibleItems = computed(() => [...items.value, ...previewItems.value]);

  const background = computed(
    () =>
      previewBackground.value?.image ||
      [...items.value, ...inventory.value].find(
        (item) => item.id === backgroundId.value,
      )?.definition?.image ||
      home.value?.active_background?.definition?.image ||
      "",
  );

  const selectedItem = ref<Data<"HomeItem"> | null>(null);

  async function fetchHome() {
    const home = (await api<Data<"Home">>(`/homes/${username}`)).data;

    const inventory =
      home.user.id === session.user?.id
        ? (await api<Data<"HomeItem">[]>(`/homes/${username}/inventory`)).data
        : [];

    return { home, inventory };
  }

  function setHome(result: Awaited<ReturnType<typeof fetchHome>>) {
    home.value = result.home;

    items.value = result.home.items.map((item) => ({ ...item }));

    backgroundId.value = result.home.active_background?.id || 0;

    inventory.value = result.inventory.map((item) => ({ ...item }));
  }

  async function load() {
    setHome(await fetchHome());
  }

  const { data: initial, error: initialError } = await useAsyncData(
    `home:${username}`,
    fetchHome,
  );

  if (initialError.value) {
    throw createError({
      statusCode:
        (initialError.value as { status?: number }).status ||
        initialError.value.statusCode ||
        500,
      statusMessage: initialError.value.message,
    });
  }

  if (initial.value) {
    setHome(initial.value);
  }

  function place(item: Data<"HomeItem">) {
    if (item.definition?.type === "b") {
      const previous = home.value?.active_background;

      if (
        previous &&
        previous.id !== item.id &&
        !inventory.value.some((entry) => entry.id === previous.id)
      ) {
        inventory.value.push(previous);
      }

      backgroundId.value = item.id;

      if (home.value) {
        home.value.active_background = item;
      }

      inventory.value = inventory.value.filter((entry) => entry.id !== item.id);

      dirty.value = true;

      return;
    } else {
      const existing = items.value.find((entry) => entry.id === item.id);

      if (existing) {
        existing.placed = true;
      } else {
        items.value.push({
          ...item,
          x: 30,
          y: 30,
          z: items.value.length + 1,
          placed: true,
        });
      }
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
    ) {
      return;
    }

    selectedItem.value = item.id > 0 ? item : null;

    const element = event.currentTarget as HTMLElement;

    item.z = Math.min(
      1000,
      Math.max(0, ...visibleItems.value.map((entry) => entry.z)) + 1,
    );

    const stage = element.parentElement!;

    const maxX = Math.max(0, stage.clientWidth - element.offsetWidth);

    const maxY = Math.max(0, stage.clientHeight - element.offsetHeight);

    const startX = event.clientX;

    const startY = event.clientY;

    const initialX = Number(item.x);

    const initialY = Number(item.y);

    element.setPointerCapture(event.pointerId);

    const move = (next: PointerEvent) => {
      item.x = Math.round(
        Math.max(0, Math.min(maxX, initialX + next.clientX - startX)),
      );

      item.y = Math.round(
        Math.max(0, Math.min(maxY, initialY + next.clientY - startY)),
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

  function preview(item: Data<"HomeDefinition">) {
    if (item.type === "b") {
      previewBackground.value = item;
    } else if (
      !previewItems.value.some((entry) => entry.definition?.id === item.id)
    ) {
      previewItems.value.push({
        id: -item.id,
        definition: item,
        x: 30,
        y: 30,
        z: items.value.length + previewItems.value.length + 1,
        placed: true,
        is_reversed: false,
        theme:
          item.type === "w" ? "default" : item.type === "n" ? "note" : null,
        extra_data: "",
      });
    }
  }

  function endPreview() {
    previewItems.value = [];

    previewBackground.value = null;
  }

  function updateSelected(patch: Partial<Data<"HomeItem">>) {
    if (!selectedItem.value) {
      return;
    }

    Object.assign(selectedItem.value, patch);

    dirty.value = true;
  }

  return {
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
  };
}
