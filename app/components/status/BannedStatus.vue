<script setup lang="ts">
import type { Data } from "~/utils/api";

defineProps<{ ban: Data<"BanInfo"> | null; error?: string }>();
const { t } = useLocale();
const { safeUrl } = useApi();
const { session } = useSession();

function expiry(timestamp: number | null): string {
  if (timestamp === null) {
    return t("Never");
  }
  const date = new Date(timestamp * 1000);
  return `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}/${String(date.getUTCDate()).padStart(2, "0")}`;
}
</script>

<template>
  <section class="flex justify-center text-black dark:text-[var(--text)]">
    <AppNotice :error="error" />
    <div class="flex w-full flex-col gap-4 lg:w-1/2">
      <div class="w-full rounded-md bg-red-500 p-2 text-center text-white">
        {{
          t("It seems like you are banned off :hotel", {
            hotel: session.bootstrap.hotel_name,
          })
        }}
      </div>
      <div
        class="flex justify-between rounded-md bg-white p-2 shadow-sm dark:bg-[var(--surface-inset)]"
      >
        <div class="flex flex-col px-1">
          <div v-if="ban" class="max-w-[380px]">
            <p>
              <strong>{{ t("Ban type:") }}</strong>
              {{ ban.type }}
            </p>
            <p>
              <strong>{{ t("Ban reason:") }}</strong>
              {{ ban.ban_reason }}
            </p>
            <p>
              <strong>{{ t("Ban expiration:") }}</strong>
              {{ expiry(ban.ban_expire) }}
            </p>
          </div>
          <div class="mt-4 max-w-[380px]">
            <p class="mb-4">
              {{
                t(
                  "If you believe this is a mistake, please reach out to one of our staff members through our Discord server!",
                )
              }}
            </p>
            <a
              v-if="safeUrl(session.bootstrap.discord_url)"
              class="flex w-full justify-center rounded border-2 border-yellow-400 bg-[#eeb425] px-6 py-2 font-semibold text-white hover:bg-[#d49f1c] hover:text-white"
              :href="safeUrl(session.bootstrap.discord_url)"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t("Join discord") }}
            </a>
            <NuxtLink
              v-else
              class="flex w-full justify-center rounded border-2 border-yellow-400 bg-[#eeb425] px-6 py-2 font-semibold text-white hover:bg-[#d49f1c] hover:text-white"
              to="/help-center"
            >
              {{ t("Help center") }}
            </NuxtLink>
          </div>
        </div>
        <div class="mr-8 hidden items-center lg:flex">
          <img class="max-w-none" src="/assets/images/angry_frank.png" alt="" />
        </div>
      </div>
    </div>
  </section>
</template>
