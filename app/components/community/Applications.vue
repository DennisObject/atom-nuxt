<script setup lang="ts">
import type { Data } from "~/utils/api";
import ApplicationPositions from "./ApplicationPositions.vue";
import GroupHeading from "./GroupHeading.vue";

const props = defineProps<{ section: string }>();
const { t } = useLocale();
const { api } = useApi();
const { session } = useSession();
const route = useRoute();
const { busy, error, fields, success, run } = usePage();
const application = ref("");
const captcha = ref<Record<string, string>>({});
const {
  data,
  error: initialError,
  refresh,
} = await useAsyncData(
  `community:${props.section}:${String(route.params.id || "")}`,
  async () =>
    route.params.id
      ? {
          position: (
            await api<Data<"Position">>(
              `/applications/${encodeURIComponent(String(route.params.id))}`,
            )
          ).data,
          positions: [],
        }
      : {
          position: null,
          positions: (
            await api<Data<"Position">[]>(
              `/applications?kind=${props.section === "staff-applications" ? "rank" : "team"}`,
            )
          ).data,
        },
);
const position = computed(() => data.value?.position);
const positions = computed(() => data.value?.positions || []);
const applicationStatusLabels: Record<string, string> = {
  pending: "Your application is pending",
  approved: "You have been approved",
  rejected: "Your application was rejected",
};

function applicationStatusLabel(status: string): string {
  return t(applicationStatusLabels[status] || "Application submitted");
}

async function apply() {
  if (!position.value) {
    return;
  }

  await run(async () => {
    await api(`/applications/${position.value!.id}`, "POST", {
      content: application.value,
      ...captcha.value,
    });
    application.value = "";
    await refresh();
  }, "Your application has been submitted.");
}
</script>

<template>
  <AppNotice
    :error="error || initialError?.message"
    :fields="fields"
    :success="success"
  />

  <div v-if="position" class="grid grid-cols-12 gap-4">
    <section
      class="overflow-hidden rounded-lg bg-[var(--panel)] pb-4 col-span-12 lg:col-span-9 lg:w-[96%]"
    >
      <GroupHeading
        :name="
          t('You are applying for :position', { position: position.name || '' })
        "
        :description="
          t('Please fill out the fields below to apply for :position', {
            position: position.name || '',
          })
        "
        :badge="position.badge"
        :color="position.color"
      />
      <p
        v-if="position.application_status"
        class="flex flex-col gap-3 px-3"
        role="status"
      >
        {{ applicationStatusLabel(position.application_status) }}
      </p>
      <form v-else class="flex flex-col gap-3 px-3" @submit.prevent="apply">
        <label class="flex flex-col gap-1">
          {{ t("Username") }}
          <input
            class="rounded border-2 border-[var(--border)] bg-[var(--header)] px-3 py-2 text-[var(--text)]"
            :value="session.user?.username"
            readonly
          />
        </label>
        <label class="flex flex-col gap-1">
          {{ t("About you") }}
          <textarea
            class="min-h-[180px] rounded border-4 border-[var(--border)] bg-[var(--surface-inset)] text-[var(--text)] focus:border-[#eeb425] focus:outline-none"
            v-model="application"
            required
            minlength="10"
            maxlength="5000"
          ></textarea>
        </label>
        <AppCaptcha v-model="captcha" :busy="busy" />
        <button
          class="w-full rounded border-2 border-yellow-400 bg-[#eeb425] p-2 font-semibold text-white hover:bg-[#d49f1c]"
          :disabled="busy"
        >
          {{ t("Apply for :position", { position: position.name || "" }) }}
        </button>
      </form>
    </section>
    <aside class="col-span-12 lg:col-span-3 lg:w-[110%] lg:-ml-8">
      <BaseCard
        :title="t('Applying for :position', { position: position.name || '' })"
        :subtitle="t('Read before applying')"
        icon="hotel-icon"
        class="border border-gray-900"
      >
        <p class="px-2 text-sm text-[var(--text)]">
          {{
            t(
              "Please fill out all the fields to apply for :position. Be honest and transparent. Providing incorrect information may lead to removal if hired.",
              { position: position.name || "" },
            )
          }}
        </p>
      </BaseCard>
    </aside>
  </div>
  <ApplicationPositions v-else :positions="positions" :section="section" />
</template>
