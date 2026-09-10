import type { Data } from "~/utils/api";

type HomeLayout = Awaited<ReturnType<typeof useHomeLayout>>;

export function useHomePurchases(
  username: string,
  layout: Pick<
    HomeLayout,
    "inventory" | "items" | "previewItems" | "previewBackground" | "place"
  >,
) {
  const { api } = useApi();

  const { refreshUser } = useSession();

  const { inventory, items, previewItems, previewBackground, place } = layout;

  async function purchaseAndPlace(
    item: Data<"HomeDefinition">,
    count: number,
    position?: Data<"HomeItem">,
    placeAfterPurchase = true,
  ) {
    const previous = new Set(
      [...inventory.value, ...items.value].map((entry) => entry.id),
    );

    await api(`/homes/${username}/purchases`, "POST", {
      item_id: item.id,
      quantity: count,
    });

    // Clear confirmed purchases before a separate inventory fetch or layout save can fail.
    previewItems.value = previewItems.value.filter(
      (entry) => entry.definition?.id !== item.id,
    );

    if (previewBackground.value?.id === item.id) {
      previewBackground.value = null;
    }

    inventory.value = (
      await api<Data<"HomeItem">[]>(`/homes/${username}/inventory`)
    ).data;

    const purchased = inventory.value.filter(
      (entry) => !previous.has(entry.id) && entry.definition?.id === item.id,
    );

    for (const entry of placeAfterPurchase ? purchased : []) {
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

  async function purchaseBatch(
    targets: {
      definition: Data<"HomeDefinition">;
      position?: Data<"HomeItem">;
    }[],
    placeAfterPurchase = true,
  ): Promise<{ purchased: number; failures: string[] }> {
    const failures: string[] = [];

    let purchased = 0;

    for (const target of targets) {
      try {
        await purchaseAndPlace(
          target.definition,
          1,
          target.position,
          placeAfterPurchase,
        );

        purchased++;
      } catch (failure) {
        failures.push(
          failure instanceof Error ? failure.message : "Purchase failed.",
        );
      }
    }

    return { purchased, failures };
  }

  return { purchaseAndPlace, purchaseBatch };
}
