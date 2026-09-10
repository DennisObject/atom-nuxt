<script setup lang="ts">
import type { Data } from "~/utils/api";
import GroupHeading from "./GroupHeading.vue";
import MemberCard from "./MemberCard.vue";

const props = defineProps<{ section: string }>();

const { t } = useLocale();

const { api } = useApi();

const { session } = useSession();

const {
  data: groups,
  error,
  status,
} = await useAsyncData(
  `community:${props.section}`,
  async () => (await api<Data<"StaffGroup">[]>(`/${props.section}`)).data,
  { default: () => [] },
);

const busy = computed(() => status.value === "pending");

const applicationCopy = computed(() =>
  t(
    "You can occasionally also look at the :startTag Staff application page :endTag which will show you all of our current open positions.",
    { startTag: "|", endTag: "|" },
  ).split("|"),
);
</script>

<template>
  <AppNotice :error="error?.message" />

  <div class="grid grid-cols-12 items-start gap-4">
    <div class="col-span-12 grid content-start gap-4 lg:col-span-9 lg:w-[96%]">
      <section
        v-for="group in groups"
        :key="group.id"
        class="overflow-hidden rounded bg-[var(--panel)] pb-3 shadow-sm"
      >
        <GroupHeading
          :name="group.name"
          :description="group.description"
          :badge="group.badge"
          :color="group.color"
        />

        <div class="grid grid-cols-1 gap-4 px-3 sm:grid-cols-2 lg:grid-cols-3">
          <MemberCard
            v-for="user in group.users"
            :key="user.id"
            :user="user"
            :background="group.background"
            :role="group.name"
          />

          <p
            v-if="!group.users.length"
            class="col-span-full text-center text-[var(--text-dim)]"
          >
            {{ t("We currently have no staff in this position") }}
          </p>
        </div>
      </section>

      <p
        v-if="!groups.length && !busy"
        class="rounded-lg bg-[var(--empty-bg)] p-[25px] text-center text-[var(--empty-text)]"
      >
        {{ t("There are no members in this group yet.") }}
      </p>
    </div>

    <aside
      class="col-span-12 grid content-start gap-4 text-sm lg:col-span-3 lg:w-[110%] lg:-ml-8"
    >
      <BaseCard
        :title="t(':hotel staff', { hotel: session.bootstrap.hotel_name })"
        :subtitle="
          t('About the :hotel staff', { hotel: session.bootstrap.hotel_name })
        "
        icon="chat-icon"
      >
        <div class="space-y-4 px-2 text-sm text-[var(--text-secondary)]">
          <p>
            {{
              t(
                "The :hotel staff team is one big happy family, each staff member has a different role and duties to fulfill.",
                { hotel: session.bootstrap.hotel_name },
              )
            }}
          </p>

          <p>
            {{
              t(
                "Most of our team usually consists of players that have been around :hotel for quite a while, but this does not mean we only recruit old & known players, we recruit those who shine out to us!",
                { hotel: session.bootstrap.hotel_name },
              )
            }}
          </p>
        </div>
      </BaseCard>

      <BaseCard
        :title="t('Apply for staff')"
        :subtitle="t('How to join the staff team')"
        icon="chat-icon"
      >
        <div class="space-y-4 px-2 text-sm text-[var(--text-secondary)]">
          <p>
            {{
              t(
                "Every now and then staff applications may open up. Once they do we always make sure to post a news article explaining the process - So make sure you keep an eye out for those in you are interested in joining the :hotel staff team.",
                { hotel: session.bootstrap.hotel_name },
              )
            }}
          </p>

          <p>
            {{ applicationCopy[0] }}
            <NuxtLink
              class="underline"
              :to="`/community/${
                section === 'teams' ? 'team' : 'staff'
              }-applications`"
            >
              {{ applicationCopy[1] }}
            </NuxtLink>
            {{ applicationCopy[2] }}
          </p>
        </div>
      </BaseCard>
    </aside>
  </div>
</template>
