<script setup lang="ts">
import type { Data } from "~/utils/api";

defineProps<{
  value: Data<"RareValue"> & {
    holdings: { user: Data<"PublicUser"> | null; count: number }[];
  };
}>();
const { t } = useLocale();
const { avatar } = useSession();
</script>

<template>
  <BaseCard
    :title="value.name"
    :subtitle="
      t('Here is a list of all the owned :value`s', { value: value.name })
    "
    icon="currency-icon"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <NuxtLink
        v-for="(holder, index) in value.holdings"
        :key="holder.user?.id || index"
        :to="holder.user ? `/home/${holder.user.username}` : '/values'"
        class="px-3 h-[100px] rounded bg-[var(--surface-muted)] flex gap-4 items-center overflow-hidden"
      >
        <div
          class="w-12 h-12 shrink-0 overflow-hidden rounded-full flex items-center justify-center bg-[var(--surface-inset)]"
        >
          <img
            v-if="holder.user"
            :src="avatar(holder.user, { headonly: 1 })"
            :alt="holder.user.username"
          />
        </div>
        <div class="flex flex-col gap-y-2">
          <p class="text-[var(--text)]">
            {{ holder.user?.username || t("Unknown member") }}
          </p>
          <div
            class="w-full bg-yellow-400 rounded h-[35px] flex items-center text-gray-900"
          >
            <div
              class="bg-yellow-500 rounded-l px-2 h-full flex items-center justify-center"
            >
              <img
                class="h-[18px] w-[28px]"
                src="/assets/images/icons/amount.png"
                alt=""
              />
            </div>
            <p class="w-full text-center truncate text-sm px-2">
              {{ holder.count }} {{ t("owned") }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
    <p v-if="!value.holdings.length" class="text-center text-sm">
      {{ t("No owners found.") }}
    </p>
  </BaseCard>
</template>
