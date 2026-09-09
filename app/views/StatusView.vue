<script setup lang="ts">
const { t } = useLocale();
const { api, request, safeUrl } = useApi();
const { session, refreshUser } = useSession();
const route = useRoute();
const kind = computed(() =>
  route.path === "/maintenance"
    ? "maintenance"
    : route.path === "/banned"
    ? "banned"
    : "missing"
);
import type { Data } from "~/utils/api";
type MaintenanceTask = Data<"MaintenanceTask">;
const { busy, error, fields, run } = usePage();
const { data, error: statusError } = await useAsyncData(
  computed(() => `status-page:${route.fullPath}`),
  async () => {
    if (kind.value === "maintenance")
      return {
        maintenance: (
          await api<Data<"Status">>(
            `/status?page=${encodeURIComponent(String(route.query.page || 1))}`
          )
        ).data,
        ban: null,
      };
    if (kind.value === "banned")
      return {
        maintenance: null,
        ban: (await api<Data<"BanInfo"> | null>("/ban")).data,
      };
    return { maintenance: null, ban: null };
  }
);
if (
  kind.value === "maintenance" &&
  data.value?.maintenance?.maintenance === false
)
  await navigateTo(session.user ? "/user/me" : "/", { replace: true });
if (
  kind.value === "maintenance" &&
  data.value?.maintenance?.maintenance &&
  session.user &&
  session.restriction !== "maintenance"
)
  await navigateTo("/user/me", { replace: true });
if (
  kind.value === "banned" &&
  data.value &&
  !data.value.ban &&
  !statusError.value
)
  await navigateTo(session.user ? "/user/me" : "/login", { replace: true });
const loginDialog = ref<HTMLDialogElement>();
const username = ref(""),
  password = ref("");
const captcha = ref<Record<string, string>>({});
const logoFailed = ref(false);
const logo = computed(() =>
  logoFailed.value
    ? "/assets/images/logo.png"
    : safeUrl(session.bootstrap.assets?.logo) || "/assets/images/logo.png"
);
const title = computed(() =>
  t(
    kind.value === "maintenance"
      ? "Maintenance"
      : kind.value === "banned"
      ? "Banned"
      : "Page not found"
  )
);
useSeoMeta({
  title: () => `${session.bootstrap.hotel_name} - ${title.value}`,
  robots: () => (kind.value === "missing" ? "noindex" : "noindex, nofollow"),
});
function taskAvatar(task: MaintenanceTask) {
  return task.user
    ? safeUrl(
        `${session.bootstrap.assets.avatar || ""}${encodeURIComponent(
          task.user.look
        )}&direction=3&head_direction=3&gesture=sml&action=wav&frame=0`
      )
    : "";
}
function expiry(timestamp: number | null): string {
  if (timestamp === null) return t("Never");
  const date = new Date(timestamp * 1000);
  return `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}/${String(date.getUTCDate()).padStart(2, "0")}`;
}
async function login() {
  await run(async () => {
    const result = await request<{ two_factor?: boolean }>("/login", "POST", {
      username: username.value,
      password: password.value,
      ...captcha.value,
    });
    password.value = "";
    loginDialog.value?.close();
    if (result.two_factor) {
      await navigateTo({
        path: "/two-factor-challenge",
        query: { next: "/user/me" },
      });
      return;
    }
    session.bootstrap = (
      await api<typeof session.bootstrap>("/bootstrap")
    ).data;
    await refreshUser();
    if (session.restriction !== "maintenance") await navigateTo("/user/me");
  });
}
</script>
<template>
  <div v-if="kind === 'maintenance'" class="maintenance-page">
    <Notice :error="error || statusError?.message" :fields="fields" />
    <div class="maintenance-columns">
      <aside class="maintenance-sidebar">
        <div>
          <img
            :src="logo"
            :alt="session.bootstrap.hotel_name"
            @error="logoFailed = true"
          />
        </div>
        <div class="maintenance-tasks">
          <article
            v-for="task in data?.maintenance?.tasks.items || []"
            :key="task.id"
            class="maintenance-task"
          >
            <div class="maintenance-task-content">
              <div><img v-if="task.user" :src="taskAvatar(task)" alt="" /></div>
              <div>{{ task.task }}</div>
            </div>
            <div class="maintenance-task-meta">
              <small>{{
                t("By: :user", { user: task.user?.username || "" })
              }}</small
              ><small
                >{{ t("Status:")
                }}<svg
                  v-if="task.completed"
                  class="task-complete"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  :aria-label="t('Completed')"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  /></svg
                ><svg
                  v-else
                  class="task-pending"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  :aria-label="t('In progress')"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  /></svg
              ></small>
            </div>
          </article>
          <nav
            v-if="
              (data?.maintenance?.tasks.current_page || 1) > 1 ||
              data?.maintenance?.tasks.has_more
            "
            class="maintenance-pagination"
            :aria-label="t('Pagination')"
          >
            <NuxtLink
              v-if="(data?.maintenance?.tasks.current_page || 1) > 1"
              :to="{
                path: '/maintenance',
                query: {
                  page: (data?.maintenance?.tasks.current_page || 1) - 1,
                },
              }"
              >{{ t("Previous") }}</NuxtLink
            ><NuxtLink
              v-if="data?.maintenance?.tasks.has_more"
              :to="{
                path: '/maintenance',
                query: { page: data.maintenance.tasks.current_page + 1 },
              }"
              >{{ t("Next") }}</NuxtLink
            >
          </nav>
        </div>
        <img
          class="maintenance-fireman"
          src="/assets/images/maintenance/fireman.png"
          alt=""
        />
      </aside>
      <section class="maintenance-message">
        <h1>{{ t("Maintenance break!") }}</h1>
        <RichText
          class="maintenance-message-body"
          :html="data?.maintenance?.maintenance_message || ''"
        />
      </section>
    </div>
    <img
      class="maintenance-hotel"
      src="/assets/images/maintenance/hotelview.png"
      alt=""
    />
    <button
      v-if="!session.user"
      class="staff-login-toggle"
      @click="loginDialog?.showModal()"
    >
      {{ t("Staff login") }}
    </button>
    <dialog
      ref="loginDialog"
      class="maintenance-login-dialog"
      :aria-label="t('Staff login')"
      @click="$event.target === loginDialog && loginDialog?.close()"
    >
      <button
        class="maintenance-login-close"
        :aria-label="t('Close modal')"
        @click="loginDialog?.close()"
      >
        ×
      </button>
      <header>
        <h2>{{ t("Hello!") }}</h2>
        <p>
          {{
            t("There is currently :online users online", {
              online: session.bootstrap.online_count,
            })
          }}
        </p>
      </header>
      <form class="flex flex-col gap-3" @submit.prevent="login">
        <label
          >{{ t("Username")
          }}<input
            v-model="username"
            name="username"
            autocomplete="username"
            :placeholder="t('Username')"
            required
            class="focus:ring-0 border-2 border-gray-700 rounded bg-[#21242e] focus:border-[#eeb425] w-full text-gray-200"
        /></label>
        <label
          >{{ t("Password")
          }}<input
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            :placeholder="t('Password')"
            required
            class="focus:ring-0 border-2 border-gray-700 rounded bg-[#21242e] focus:border-[#eeb425] w-full text-gray-200"
        /></label>
        <Captcha v-model="captcha" :busy="busy" />
        <button
          :disabled="busy"
          class="w-full rounded bg-[#eeb425] text-white p-2 border-2 border-yellow-400 hover:bg-[#d49f1c] font-semibold"
        >
          {{ t("Login") }}
        </button>
        <NuxtLink
          to="/forgot-password"
          class="text-center text-sm font-semibold text-gray-400 hover:underline"
          >{{ t("Did you forget your password?") }}</NuxtLink
        ><NuxtLink
          to="/register"
          class="text-center text-sm font-semibold text-gray-400 hover:underline"
          >{{ t("Dont have an account? Join now!") }}</NuxtLink
        >
      </form>
    </dialog>
  </div>
  <section v-else-if="kind === 'banned'" class="banned-page">
    <Notice :error="statusError?.message" />
    <div class="banned-content">
      <div class="banned-heading">
        {{
          t("It seems like you are banned off :hotel", {
            hotel: session.bootstrap.hotel_name,
          })
        }}
      </div>
      <div class="banned-card">
        <div class="banned-details">
          <div v-if="data?.ban">
            <p>
              <strong>{{ t("Ban type:") }}</strong> {{ data.ban.type }}
            </p>
            <p>
              <strong>{{ t("Ban reason:") }}</strong> {{ data.ban.ban_reason }}
            </p>
            <p>
              <strong>{{ t("Ban expiration:") }}</strong>
              {{ expiry(data.ban.ban_expire) }}
            </p>
          </div>
          <div class="banned-appeal">
            <p>
              {{
                t(
                  "If you believe this is a mistake, please reach out to one of our staff members through our Discord server!"
                )
              }}
            </p>
            <a
              v-if="safeUrl(session.bootstrap.discord_url)"
              class="banned-discord"
              :href="safeUrl(session.bootstrap.discord_url)"
              target="_blank"
              rel="noopener noreferrer"
              >{{ t("Join discord") }}</a
            ><NuxtLink v-else class="banned-discord" to="/help-center">{{
              t("Help center")
            }}</NuxtLink>
          </div>
        </div>
        <div class="banned-frank">
          <img src="/assets/images/angry_frank.png" alt="" />
        </div>
      </div>
    </div>
  </section>
  <Card v-else :title="t('Page not found')" icon="exclamation-mark_icon"
    ><p>{{ t("We could not find the page you were looking for.") }}</p>
    <NuxtLink class="button" to="/">{{ t("Back home") }}</NuxtLink></Card
  >
</template>
<style scoped>
.maintenance-page {
  position: fixed;
  inset: 0;
  height: 100vh;
  overflow: hidden;
  background: #233143;
  color: #f3f4f6;
}
.maintenance-columns {
  width: 100%;
  height: 100%;
  display: flex;
}
.maintenance-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 384px;
  height: 100%;
  padding: 40px 24px;
  gap: 40px;
  position: relative;
  background: #111827;
}
.maintenance-tasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  position: relative;
  z-index: 10;
}
.maintenance-task {
  position: relative;
  height: 80px;
  width: 100%;
  overflow: hidden;
  background: #233143;
  padding: 8px 8px 8px 0;
  transition: transform 150ms ease-in-out;
}
.maintenance-task:hover {
  transform: scale(1.01);
}
.maintenance-task-content {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  gap: 24px;
}
.maintenance-task-content img {
  margin-bottom: -32px;
  max-width: none;
  image-rendering: auto;
}
.maintenance-task-content > div:last-child {
  display: flex;
  height: 100%;
  width: 66.6667%;
  align-items: center;
  overflow-wrap: break-word;
}
.maintenance-task-meta {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.maintenance-task-meta > small:first-child {
  padding-left: 96px;
}
.maintenance-task-meta small {
  color: inherit;
  font-size: 12.8px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.maintenance-task-meta svg {
  width: 20px;
  height: 20px;
}
.task-complete {
  color: #4ade80;
}
.task-pending {
  color: #facc15;
}
.maintenance-pagination {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
.maintenance-pagination a {
  padding: 8px 16px;
  border: 1px solid #4b5563;
  border-radius: 4px;
  background: #1f2937;
}
.maintenance-fireman {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 0;
}
.maintenance-message {
  padding: 0 56px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 10;
}
.maintenance-message h1 {
  font-size: 48px;
  line-height: 48px;
  font-weight: 700;
  text-transform: uppercase;
}
.maintenance-message-body {
  margin-top: 16px;
  font-size: 20px;
  line-height: 28px;
  max-width: 600px;
  overflow-wrap: anywhere;
}
.maintenance-hotel {
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0.6;
  z-index: 0;
}
.staff-login-toggle {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 50;
  padding: 8px 16px;
  border: 0;
  border-radius: 9999px;
  background: rgb(255 255 255 / 70%);
  color: black;
  font-weight: 600;
  transition: background 200ms ease-in-out;
}
.staff-login-toggle:hover {
  background: white;
  color: black;
  filter: none;
}
.maintenance-login-dialog {
  width: calc(100% - 32px);
  max-width: 672px;
  position: relative;
  padding: 24px 32px;
  border: 0;
  border-radius: 4px;
  background: #21242e;
  color: #e5e7eb;
}
.maintenance-login-dialog::backdrop {
  background: rgb(0 0 0 / 50%);
}
.maintenance-login-dialog > header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px 0;
}
.maintenance-login-dialog h2 {
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
}
.maintenance-login-close {
  position: absolute;
  top: 12px;
  right: 10px;
  color: #9ca3af;
  background: none;
  border: 0;
  padding: 0 6px;
  font-size: 24px;
}
.banned-page {
  display: flex;
  justify-content: center;
  color: #000;
}
.banned-content {
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.banned-heading {
  width: 100%;
  border-radius: 6px;
  background: #ef4444;
  color: white;
  text-align: center;
  padding: 8px;
}
.banned-card {
  display: flex;
  justify-content: space-between;
  border-radius: 6px;
  padding: 8px;
  background: #fff;
  box-shadow: 0 1px 3px #0000001a, 0 1px 2px #0000001a;
}
.banned-details {
  display: flex;
  flex-direction: column;
  padding: 0 4px;
}
.banned-details > div {
  max-width: 380px;
}
.banned-appeal {
  margin-top: 16px;
}
.banned-appeal p {
  margin-bottom: 16px;
}
.banned-discord {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 8px 24px;
  border: 2px solid #facc15;
  border-radius: 4px;
  background: #eeb425;
  color: white;
  font-weight: 600;
}
.banned-discord:hover {
  background: #d49f1c;
  color: white;
}
.banned-frank {
  display: flex;
  align-items: center;
  margin-right: 32px;
}
.banned-frank img {
  max-width: none;
}
:global(.dark) .banned-page {
  color: #f3f4f6;
}
:global(.dark) .banned-card {
  background: #1f2937;
}
@media (max-width: 1023px) {
  .maintenance-sidebar,
  .maintenance-hotel {
    display: none;
  }
  .maintenance-message {
    padding: 0 16px;
  }
  .maintenance-message h1 {
    font-size: 36px;
    line-height: 40px;
  }
  .maintenance-message-body {
    font-size: 18px;
  }
  .maintenance-login-dialog {
    max-width: 576px;
    padding-inline: 24px;
  }
  .banned-content {
    width: 100%;
  }
  .banned-frank {
    display: none;
  }
}
</style>
