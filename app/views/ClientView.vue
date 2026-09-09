<script setup lang="ts">
import { ApiError, type Data } from "~/utils/api";
const { t } = useLocale();
const { api, request, safeUrl } = useApi();
const { session } = useSession();
const route = useRoute();
const { busy, error, run } = usePage();
const frame = ref<HTMLIFrameElement>();
const url = ref(""),
  voteUrl = ref("");
const disconnected = ref(false),
  fullscreen = ref(false);
const onlineCount = ref(session.bootstrap.online_count || 0);
const flashRequested = route.params.client === "flash";
let onlineTimer: ReturnType<typeof setInterval> | undefined;
useSeoMeta({
  title: () =>
    `${session.bootstrap.hotel_name} - ${flashRequested ? "Flash" : "Nitro"}`,
  robots: "noindex, nofollow",
});
useHead({ bodyAttrs: { class: "overflow-hidden", id: "nitro-client" } });
async function launch() {
  voteUrl.value = "";
  disconnected.value = false;
  url.value = "";
  try {
    const result = await api<Data<"ClientLaunch">>("/client/launch", "POST", {
      client: "nitro",
    });
    url.value = safeUrl(result.data.url);
    if (!url.value)
      throw new Error(t("The hotel client is not configured yet."));
  } catch (failure) {
    if (failure instanceof ApiError && failure.code === "vote_required")
      voteUrl.value = safeUrl(failure.voteUrl);
    throw failure;
  }
}
async function updateOnlineCount() {
  try {
    const result = await request<{ data: { onlineCount: number } }>(
      "/api/online-count"
    );
    onlineCount.value = result.data.onlineCount;
  } catch {
    /* Keep the most recent count when a refresh is unavailable. */
  }
}
async function toggleFullscreen() {
  await run(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  });
}
function updateFullscreen() {
  fullscreen.value = !!document.fullscreenElement;
}
function handleMessage(event: MessageEvent) {
  if (
    !frame.value?.contentWindow ||
    event.source !== frame.value.contentWindow ||
    !url.value ||
    event.origin !== new URL(url.value).origin
  )
    return;
  const prefix = "Nitro_LegacyExternalInterface";
  if (typeof event.data !== "string" || !event.data.startsWith(prefix)) return;
  try {
    const message: unknown = JSON.parse(event.data.slice(prefix.length));
    if (
      message &&
      typeof message === "object" &&
      "method" in message &&
      message.method === "disconnect"
    )
      disconnected.value = true;
  } catch {
    /* Ignore malformed messages from the game frame. */
  }
}
function handleFrameLoad() {
  if (!url.value || !frame.value?.contentWindow) return;
  try {
    const destination = frame.value.contentWindow.location.href;
    const clientSource = new URL(url.value);
    const clientBase =
      clientSource.origin + clientSource.pathname.replace(/[^/]*$/, "");
    if (/^https?:\/\//.test(destination) && !destination.startsWith(clientBase))
      window.location.replace(destination);
  } catch {
    /* A cross-origin renderer cannot expose its destination. */
  }
}
onMounted(() => {
  window.addEventListener("message", handleMessage);
  document.addEventListener("fullscreenchange", updateFullscreen);
  void updateOnlineCount();
  onlineTimer = setInterval(() => {
    void updateOnlineCount();
  }, 15000);
  if (!flashRequested) void run(launch);
});
onBeforeUnmount(() => {
  if (onlineTimer) clearInterval(onlineTimer);
  window.removeEventListener("message", handleMessage);
  document.removeEventListener("fullscreenchange", updateFullscreen);
});
</script>
<template>
  <main class="nitro-page">
    <nav class="nitro-toolbar" :aria-label="t('Game controls')">
      <NuxtLink
        class="nitro-button"
        to="/user/me"
        :aria-label="t('Back to website')"
        :title="t('Back to website')"
        ><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.69Z"
          />
          <path
            d="M12 5.432 20.159 13.591c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.43Z"
          /></svg
      ></NuxtLink>
      <button
        v-if="!flashRequested"
        class="nitro-button"
        :disabled="busy"
        :aria-label="t('Reload client')"
        :title="t('Reload client')"
        @click="run(launch)"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </button>
      <button
        class="nitro-button"
        :disabled="busy"
        :aria-pressed="fullscreen"
        :aria-label="t('Toggle fullscreen')"
        :title="t('Toggle fullscreen')"
        @click="toggleFullscreen"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
          />
        </svg>
      </button>
      <span
        class="nitro-button nitro-online"
        :aria-label="`${onlineCount} ${t('online')}`"
        ><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
            clip-rule="evenodd"
          /></svg
        ><span>{{ onlineCount }}</span></span
      >
    </nav>
    <iframe
      v-if="url"
      ref="frame"
      id="nitro"
      class="nitro-frame"
      :src="url"
      :title="t('Hotel game client')"
      allow="fullscreen; autoplay"
      referrerpolicy="no-referrer"
      @load="handleFrameLoad"
    ></iframe>
    <Notice :error="error" />
    <section v-if="flashRequested" class="nitro-status">
      <h2>{{ t("Flash client unavailable in this browser") }}</h2>
      <p>
        {{
          t(
            "This frontend supports the Nitro browser client. The legacy Flash client requires a separate supported Flash runtime."
          )
        }}
      </p>
      <NuxtLink class="nitro-button" to="/game/nitro">{{
        t("Open Nitro")
      }}</NuxtLink>
    </section>
    <section v-else-if="!url" class="nitro-status">
      <p v-if="busy">{{ t("Connecting to the hotel…") }}</p>
      <template v-else
        ><p>{{ error || t("The hotel client is not configured yet.") }}</p>
        <a
          v-if="voteUrl"
          class="nitro-button"
          :href="voteUrl"
          target="_blank"
          rel="noopener noreferrer"
          >{{ t("Vote for the hotel") }}</a
        ><button class="nitro-button" @click="run(launch)">
          {{ t("Try again") }}
        </button></template
      >
    </section>
    <section v-if="disconnected" class="nitro-disconnected" role="alert">
      <div class="nitro-disconnected-content">
        <h2>{{ t("Whoops! It seems like you have been disconnected...") }}</h2>
        <div>
          <button :disabled="busy" class="nitro-button" @click="run(launch)">
            {{ t("Reload client") }}</button
          ><NuxtLink class="nitro-return" to="/user/me">{{
            t("Back to website")
          }}</NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>
<style scoped>
.nitro-page {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #262a35;
}
.nitro-frame {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  border: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0;
}
.nitro-toolbar {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  gap: 8px;
}
.nitro-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 8px;
  border: 2px solid #cf9d15;
  border-radius: 4px;
  background: #eeb425;
  color: white;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  cursor: pointer;
  transition: background-color 150ms ease-in-out;
}
.nitro-button:hover {
  background: #e3aa1e;
  color: white;
  filter: none;
}
.nitro-button svg {
  width: 20px;
  height: 20px;
}
.nitro-online {
  cursor: default;
}
.nitro-online svg {
  width: 16px;
  height: 16px;
}
.nitro-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
  padding: 72px 24px;
  text-align: center;
}
.nitro-status h2 {
  font-size: 24px;
}
.nitro-disconnected {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 50%);
}
.nitro-disconnected-content {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
}
.nitro-disconnected h2 {
  font-size: 24px;
  line-height: 32px;
  color: white;
  text-align: center;
}
.nitro-disconnected-content > div {
  display: flex;
  gap: 16px;
}
.nitro-disconnected .nitro-button {
  padding: 8px 16px;
  font-size: 16px;
}
.nitro-return {
  border-radius: 4px;
  background: #16a34a;
  color: white;
  padding: 8px;
  border: 2px solid #22c55e;
  font-weight: 600;
}
.nitro-return:hover {
  background: #15803d;
  color: white;
}
</style>
