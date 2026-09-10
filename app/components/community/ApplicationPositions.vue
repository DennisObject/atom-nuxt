<script setup lang="ts">
import type { Data } from "~/utils/api";
import GroupHeading from "./GroupHeading.vue";

type Position = Data<"Position"> & { group_description?: string | null };
defineProps<{ positions: Position[]; section: string }>();
const { t, locale } = useLocale();
const { session } = useSession();
const statusColors: Record<string, string> = {
  approved:
    "border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300",
  pending:
    "border-yellow-200 bg-yellow-100 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  rejected:
    "border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-900/40 dark:text-red-300",
};
const statusLabels: Record<string, string> = {
  pending: "Your application is pending",
  approved: "You have been approved",
  rejected: "Your application was rejected",
};

function deadline(value: string | null): string {
  return value
    ? new Intl.DateTimeFormat(locale.value.replace("_", "-"), {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(new Date(value))
    : t("No deadline set");
}
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <div
      class="col-span-12 grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:col-span-9 lg:w-[96%]"
    >
      <section
        v-for="position in positions"
        :key="position.id"
        class="overflow-hidden rounded bg-[var(--panel)] pb-3 shadow-sm"
      >
        <GroupHeading
          :name="position.name"
          :description="position.group_description"
          :badge="position.badge"
          :color="position.color"
        >
          <span
            v-if="position.kind === 'team' && position.application_status"
            class="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
            :class="statusColors[position.application_status]"
          >
            {{
              t(
                position.application_status.charAt(0).toUpperCase() +
                  position.application_status.slice(1),
              )
            }}
          </span>
        </GroupHeading>
        <div class="px-3">
          <div class="text-center text-[var(--text-dim)]">
            <p class="mb-4 whitespace-pre-line text-sm">
              {{ position.description }}
            </p>
            <p class="mb-4 text-sm font-semibold">
              {{
                t("Application Deadline :date", {
                  date: deadline(position.apply_to),
                })
              }}
            </p>
          </div>
          <button
            v-if="position.application_status"
            disabled
            class="w-full rounded border-2 p-2 font-semibold text-white"
            :class="
              position.kind === 'rank'
                ? 'border-red-500 bg-red-600'
                : 'border-green-500 bg-green-600'
            "
          >
            {{
              position.kind === "rank"
                ? t("You have already applied for :position", {
                    position: position.name || "",
                  })
                : t(
                    statusLabels[position.application_status] ||
                      "Application submitted",
                  )
            }}
          </button>
          <NuxtLink
            v-else
            class="block w-full rounded border-2 p-2 text-center font-semibold text-white hover:text-white"
            :class="
              position.kind === 'rank'
                ? 'border-green-500 bg-green-600 hover:bg-green-700'
                : 'border-yellow-400 bg-[#eeb425] hover:bg-[#d49f1c]'
            "
            :to="
              session.user ? `/community/${section}/${position.id}` : '/login'
            "
            >{{
              session.user
                ? t("Apply for :position", { position: position.name || "" })
                : t("Login to apply")
            }}</NuxtLink
          >
        </div>
      </section>
      <BaseCard
        v-if="!positions.length"
        :title="
          t(
            section === 'team-applications'
              ? 'No team positions open'
              : 'No positions open',
          )
        "
        :subtitle="
          t(
            section === 'team-applications'
              ? 'There are currently no open team positions'
              : 'There is currently no positions open',
          )
        "
        icon="lighthouse-icon"
        class="col-span-full border border-[var(--border)]"
      >
        <p class="px-2 text-sm">
          {{
            t(
              section === "team-applications"
                ? "Please come back later to check for new openings. Thank you!"
                : "Please come back at a later time to check if we have any positions open by then! Thank you for your interest.",
            )
          }}
        </p>
      </BaseCard>
    </div>
    <aside class="col-span-12 lg:col-span-3 lg:-ml-8 lg:w-[110%]">
      <BaseCard
        :title="
          t(
            section === 'team-applications'
              ? 'Apply for :hotel Team'
              : 'Apply for :hotel staff',
            { hotel: session.bootstrap.hotel_name },
          )
        "
        :subtitle="
          t(
            section === 'team-applications'
              ? 'Select a team to get started'
              : 'Select position to get started',
          )
        "
        icon="chat-icon"
        class="border border-[var(--border)]"
      >
        <p class="px-2 text-sm">
          {{
            t(
              section === "team-applications"
                ? "We open team applications periodically. If you see a team you fit, do not hesitate to apply!"
                : "Here at :hotel we open up for staff applications every now and then. Sometimes you will find this page empty other times it might be filled with positions, if you ever come across a position you feel you would fit perfectly into, then do not hesitate to apply for it.",
              { hotel: session.bootstrap.hotel_name },
            )
          }}
        </p>
      </BaseCard>
    </aside>
  </div>
</template>
