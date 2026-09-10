<script setup lang="ts">
import type { Data } from "~/utils/api";
import MaintenanceSidebar from "~/components/status/MaintenanceSidebar.vue";
import StaffLogin from "~/components/status/StaffLogin.vue";

defineProps<{ status: Data<"Status"> | null; error?: string }>();
const { t } = useLocale();
</script>

<template>
  <div
    class="fixed inset-0 h-screen overflow-hidden bg-[var(--maintenance-bg)] text-[var(--text)]"
  >
    <AppNotice :error="error" />
    <div class="flex size-full">
      <MaintenanceSidebar :status="status" />
      <section
        class="relative z-10 flex h-full flex-col justify-center px-4 lg:px-14"
      >
        <h1
          class="text-4xl leading-10 font-bold uppercase lg:text-5xl lg:leading-12"
        >
          {{ t("Maintenance break!") }}
        </h1>
        <RichText
          class="mt-4 max-w-[600px] text-lg leading-7 [overflow-wrap:anywhere] lg:text-xl"
          :html="status?.maintenance_message || ''"
        />
      </section>
    </div>
    <img
      class="absolute right-0 bottom-0 z-0 hidden opacity-60 lg:block"
      src="/assets/images/maintenance/hotelview.png"
      alt=""
    />
    <StaffLogin />
  </div>
</template>
