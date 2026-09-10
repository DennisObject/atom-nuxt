<script setup lang="ts">
const { t } = useLocale();

const { session } = useSession();

const currencies = [
  {
    name: "credits",
    label: "Credits",
    color: "bg-[#e9b124] outline-[#b26d18]",
  },
  {
    name: "duckets",
    label: "Duckets",
    color: "bg-[#c44aac] outline-[#812378]",
  },
  {
    name: "diamonds",
    label: "Diamonds",
    color: "bg-[#caf1f3] outline-[#6caff4]",
  },
] as const;
</script>

<template>
  <div
    class="absolute bottom-0 left-0 h-20 w-full bg-gray-900 px-4 py-4 lg:px-0 lg:pl-64"
  >
    <div
      class="flex h-full items-center justify-center gap-x-6 lg:justify-start"
    >
      <div
        v-for="currency in currencies"
        :key="currency.name"
        class="flex gap-x-3"
      >
        <span
          class="flex size-[25px] shrink-0 items-center justify-center rounded-full outline outline-offset-[3px]"
          :class="currency.color"
        >
          <img
            :src="`/assets/images/icons/currency/${currency.name}.png`"
            alt=""
          />
        </span>

        <div class="flex gap-x-2">
          <span class="font-semibold">
            {{ session.user?.balances?.[currency.name] || 0 }}
          </span>

          <span class="hidden lg:block">{{ t(currency.label) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
