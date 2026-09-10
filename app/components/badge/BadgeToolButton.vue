<template>
  <button
    type="button"
    class="bg-[linear-gradient(to_bottom,#f2f2f3_51%,#d9d8d8_49%)] shadow-[inset_0_0_0_2px_#d9d9d9] p-2.5 hover:bg-[linear-gradient(to_bottom,#fff_50%,#ebebeb_50%)] hover:shadow-[inset_0_0_0_2px_#fff] dark:bg-[linear-gradient(to_bottom,#141414_51%,#101010_49%)] dark:shadow-[inset_0_0_0_2px_#242424] dark:hover:bg-[linear-gradient(to_bottom,#171717_50%,#111_50%)] dark:hover:shadow-[inset_0_0_0_2px_#363636] aria-pressed:shadow-[inset_0_0_0_2px_#eeb425] flex-1 border-2 border-black rounded text-black dark:text-gray-100 font-medium"
  >
    <slot />
  </button>
</template>
