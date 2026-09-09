<script setup lang="ts">
const { t } = useLocale();
import { computed, ref } from "vue";

const { api, safeUrl } = useApi();
import type { Data } from "~/utils/api";
const { avatar, session } = useSession();
import { usePage } from "~/composables/usePage";
import Card from "~/components/Card.vue";
import Notice from "~/components/Notice.vue";
import Captcha from "~/components/Captcha.vue";
const captcha = ref<Record<string, string>>({});
import RichText from "~/components/RichText.vue";
const route = useRoute();
const section = String(route.meta.section || route.params.section || "staff");
const { busy, error, fields, success, run } = usePage();
const groups = ref<Data<"StaffGroup">[]>([]),
  boards = ref<Partial<Data<"Leaderboards">>>({}),
  photos = ref<Data<"Photo">[]>([]),
  positions = ref<Data<"Position">[]>([]),
  position = ref<Data<"Position"> | null>(null),
  application = ref("");
const page = ref(1),
  lastPage = ref(1);
const titles: Record<string, string> = {
  staff: "Meet the staff",
  teams: "Our teams",
  leaderboard: "Leaderboard",
  photos: "Hotel photos",
  "staff-applications": "Staff applications",
  "team-applications": "Team applications",
};
const isApplications = computed(() => section.endsWith("applications"));
const boardNames: Record<string, string> = {
  credits: "Credits",
  duckets: "Duckets",
  diamonds: "Diamonds",
  mostOnline: "Time online",
  respectsReceived: "Respects received",
  achievementScores: "Achievement scores",
};
async function load(nextPage = 1) {
  if (section === "staff" || section === "teams")
    groups.value = (await api<Data<"StaffGroup">[]>(`/${section}`)).data;
  if (section === "leaderboard")
    boards.value = (await api<Data<"Leaderboards">>("/leaderboards")).data;
  if (section === "photos") {
    const result = await api<Data<"Photo">[]>(`/photos?page=${nextPage}`);
    photos.value = result.data;
    page.value = result.meta?.current_page || nextPage;
    lastPage.value = result.meta?.last_page || 1;
  }
  if (isApplications.value) {
    if (route.params.id)
      position.value = (
        await api<Data<"Position">>(
          `/applications/${encodeURIComponent(String(route.params.id))}`
        )
      ).data;
    else
      positions.value = (
        await api<Data<"Position">[]>(
          `/applications?kind=${
            section === "staff-applications" ? "rank" : "team"
          }`
        )
      ).data;
  }
}
const { data: initial, error: initialError } = await useAsyncData(
  `community:${section}:${String(route.params.id || "")}`,
  async () => {
    try {
      return {
        groups: ["staff", "teams"].includes(section)
          ? (await api<Data<"StaffGroup">[]>(`/${section}`)).data
          : [],
        boards:
          section === "leaderboard"
            ? (await api<Data<"Leaderboards">>("/leaderboards")).data
            : {},
        photos:
          section === "photos" ? await api<Data<"Photo">[]>("/photos") : null,
        positions:
          isApplications.value && !route.params.id
            ? (
                await api<Data<"Position">[]>(
                  `/applications?kind=${
                    section === "staff-applications" ? "rank" : "team"
                  }`
                )
              ).data
            : [],
        position:
          isApplications.value && route.params.id
            ? (
                await api<Data<"Position">>(
                  `/applications/${encodeURIComponent(String(route.params.id))}`
                )
              ).data
            : null,
      };
    } catch (failure) {
      const cause = failure as { status?: number; message?: string };
      throw createError({
        statusCode: cause.status || 500,
        statusMessage: cause.message || "Could not load this page.",
      });
    }
  }
);
if (initialError.value) error.value = initialError.value.message;
if (initial.value) {
  groups.value = initial.value.groups;
  boards.value = initial.value.boards;
  photos.value = initial.value.photos?.data || [];
  page.value = initial.value.photos?.meta?.current_page || 1;
  lastPage.value = initial.value.photos?.meta?.last_page || 1;
  positions.value = initial.value.positions;
  position.value = initial.value.position;
}
useSeoMeta({ title: () => t(titles[section] || "Community") });
async function apply() {
  await run(async () => {
    await api(`/applications/${position.value?.id}`, "POST", {
      content: application.value,
      ...captcha.value,
    });
    application.value = "";
  }, "Your application has been submitted.");
}
const photoDialog = ref<HTMLDialogElement>();
const selectedPhoto = ref<{
  url: string;
  author?: { username: string } | null;
} | null>(null);
function viewPhoto(photo: {
  url: string;
  author?: { username: string } | null;
}) {
  selectedPhoto.value = photo;
  photoDialog.value?.showModal();
}
function changePhoto(step: number) {
  const gallery = photos.value;
  if (!gallery.length) return;
  const index = gallery.findIndex(
    (photo) => photo.url === selectedPhoto.value?.url
  );
  selectedPhoto.value =
    gallery[(index + step + gallery.length) % gallery.length] || null;
}
</script>
<template>
  <div
    v-if="section !== 'staff' && section !== 'teams' && !position"
    class="community-heading"
  >
    <img
      :src="`/assets/images/dusk/${
        section === 'leaderboard'
          ? 'leaderboard_icon'
          : section === 'photos'
          ? 'camera_icon'
          : 'community_icon'
      }.png`"
      alt=""
    />
    <h1>{{ t(titles[section] || "Community") }}</h1>
  </div>
  <Notice :error="error" :fields="fields" :success="success" />
  <div v-if="section === 'staff' || section === 'teams'" class="staff-layout">
    <div class="stack">
      <section v-for="group in groups" :key="group.id" class="staff-group">
        <header>
          <span :style="{ backgroundColor: group.color || '#327fa8' }"
            ><img
              v-if="group.badge"
              :src="
                safeUrl(
                  `${session.bootstrap.assets?.badge || ''}/${group.badge}.gif`
                )
              "
              alt=""
          /></span>
          <div>
            <h2>{{ group.name }}</h2>
            <p>{{ group.description }}</p>
          </div>
        </header>
        <div class="staff-members">
          <NuxtLink
            v-for="user in group.users"
            :key="user.id"
            class="staff-member"
            :to="`/home/${user.username}`"
            :style="{
              backgroundImage: `linear-gradient(transparent 65%,#171a23 65%),url('${safeUrl(
                group.background
                  ? /^https?:/.test(group.background) ||
                    group.background.startsWith('/')
                    ? group.background
                    : `/assets/images/${group.background}`
                  : '/assets/images/staff-bg.png'
              )}')`,
            }"
          >
            <div class="staff-portrait">
              <img :src="avatar(user, true)" :alt="user.username" />
            </div>
            <strong>{{ user.username }}</strong
            ><small>{{ user.motto || t("No motto") }}</small
            ><span
              :class="['staff-status', { online: user.online }]"
              :aria-label="t(user.online ? 'Online' : 'Offline')"
            ></span>
          </NuxtLink>
          <p v-if="!group.users.length" class="empty">
            {{ t("We currently have no staff in this position") }}
          </p>
        </div>
      </section>
      <p v-if="!groups.length && !busy" class="empty">
        {{ t("There are no members in this group yet.") }}
      </p>
    </div>
    <aside class="stack">
      <Card
        :title="t(':hotel staff', { hotel: session.bootstrap.hotel_name })"
        :subtitle="
          t('About the :hotel staff', { hotel: session.bootstrap.hotel_name })
        "
        icon="chat-icon"
      >
        <p>
          {{
            t(
              "The :hotel staff team is one big happy family, each staff member has a different role and duties to fulfill.",
              { hotel: session.bootstrap.hotel_name }
            )
          }}
        </p>
        <p>
          {{
            t(
              "Most of our team usually consists of players that have been around :hotel for quite a while, but this does not mean we only recruit old & known players, we recruit those who shine out to us!",
              { hotel: session.bootstrap.hotel_name }
            )
          }}
        </p>
      </Card>
      <Card
        :title="t('Apply for staff')"
        :subtitle="t('How to join the staff team')"
        icon="chat-icon"
      >
        <p>
          {{
            t(
              "Every now and then staff applications may open up. Once they do we always make sure to post a news article explaining the process - So make sure you keep an eye out for those in you are interested in joining the :hotel staff team.",
              { hotel: session.bootstrap.hotel_name }
            )
          }}
        </p>
        <NuxtLink
          :to="`/community/${
            section === 'teams' ? 'team' : 'staff'
          }-applications`"
          >{{ t("Staff applications") }}</NuxtLink
        >
      </Card>
    </aside>
  </div>
  <div v-else-if="section === 'leaderboard'" class="grid three-columns">
    <template v-for="(users, key) in boards" :key="key">
      <section v-if="users" class="leaderboard-list">
        <h2>
          <img
            :src="`/assets/images/icons/${({ credits: 'credits.png', duckets: 'duckets.png', diamonds: 'diamond.png', mostOnline: 'clock.gif', respectsReceived: 'heart.gif', achievementScores: 'star.gif' } as Record<string, string>)[String(key)]}`"
            alt=""
          />{{ t(boardNames[String(key)] || String(key)) }}
        </h2>
        <NuxtLink
          v-for="(entry, index) in users"
          :key="entry.user.id"
          class="leaderboard-entry"
          :to="`/home/${entry.user.username}`"
          ><div class="leaderboard-avatar">
            <img :src="avatar(entry.user)" alt="" />
          </div>
          <div>
            <strong>{{ entry.user.username }}</strong>
            <p>
              {{
                (key === "mostOnline"
                  ? Math.round(entry.value / 3600)
                  : entry.value
                ).toLocaleString()
              }}
              {{
                t(
                  key === "mostOnline"
                    ? "Hours online"
                    : boardNames[String(key)] || String(key)
                )
              }}
            </p>
          </div>
          <img
            v-if="index < 3"
            class="leaderboard-medal"
            :src="`/assets/images/dusk/leaderboard_${
              ['gold', 'silver', 'bronze'][index]
            }_icon.png`"
            :alt="String(index + 1)"
          /><span v-else class="leaderboard-number">{{
            index + 1
          }}</span></NuxtLink
        >
        <p v-if="!users.length" class="muted">{{ t("No rankings yet.") }}</p>
      </section>
    </template>
  </div>
  <template v-else-if="section === 'photos'"
    ><div class="grid four-columns">
      <a
        v-for="photo in photos"
        :key="photo.id"
        class="photo"
        :href="safeUrl(photo.url)"
        @click.prevent="viewPhoto(photo)"
        target="_blank"
        rel="noopener"
        ><img
          :src="safeUrl(photo.url)"
          :alt="`Photo by ${photo.author?.username || 'a hotel member'}`"
        />
        <figcaption>
          <img src="/assets/images/dusk/author_camera_icon.png" alt="" />{{
            photo.author?.username
          }}
        </figcaption></a
      >
    </div>
    <p v-if="!busy && !photos.length" class="empty">
      {{ t("No photos have been shared yet.") }}
    </p>
    <div v-if="lastPage > 1" class="pagination">
      <button :disabled="busy || page === 1" @click="run(() => load(page - 1))">
        {{ t("Previous") }}</button
      ><span>{{ page }} / {{ lastPage }}</span
      ><button
        :disabled="busy || page === lastPage"
        @click="run(() => load(page + 1))"
      >
        {{ t("Next") }}
      </button>
    </div></template
  >
  <template v-else-if="isApplications">
    <div v-if="position" class="grid grid-cols-12 gap-4">
      <section class="staff-group col-span-12 lg:col-span-9 lg:w-[96%]">
        <header>
          <span :style="{ backgroundColor: position.color || '#327fa8' }"
            ><img
              v-if="position.badge"
              :src="
                safeUrl(
                  `${session.bootstrap.assets?.badge || ''}/${
                    position.badge
                  }.gif`
                )
              "
              alt=""
          /></span>
          <div>
            <h2>
              {{
                t("You are applying for :position", {
                  position: position.name || "",
                })
              }}
            </h2>
            <p>
              {{
                t("Please fill out the fields below to apply for :position", {
                  position: position.name || "",
                })
              }}
            </p>
          </div>
        </header>
        <form class="application-form" @submit.prevent="apply">
          <label
            >{{ t("Username")
            }}<input :value="session.user?.username" readonly /></label
          ><label
            >{{ t("About you")
            }}<textarea
              v-model="application"
              required
              minlength="10"
              maxlength="5000"
            ></textarea></label
          ><Captcha v-model="captcha" :busy="busy" /><button :disabled="busy">
            {{ t("Apply for :position", { position: position.name || "" }) }}
          </button>
        </form>
      </section>
      <aside class="col-span-12 lg:col-span-3 lg:w-[110%] lg:-ml-8">
        <Card
          :title="
            t('Applying for :position', { position: position.name || '' })
          "
          :subtitle="t('Read before applying')"
          icon="hotel-icon"
          class="border border-gray-900"
          ><p class="px-2 text-sm text-gray-200">
            {{
              t(
                "Please fill out all the fields to apply for :position. Be honest and transparent. Providing incorrect information may lead to removal if hired.",
                { position: position.name || "" }
              )
            }}
          </p></Card
        >
      </aside>
    </div>
    <div v-else class="grid two-columns">
      <Card
        v-for="item in positions"
        :key="item.id"
        :title="item.name || 'Position'"
        icon="community_icon"
        ><RichText :html="item.description" /><NuxtLink
          class="button"
          :to="`/community/${section}/${item.id}`"
        >
          {{ t("Apply now") }}
        </NuxtLink></Card
      >
      <p v-if="!busy && !positions.length" class="empty">
        {{ t("There are no open positions right now. Check back soon.") }}
      </p>
    </div></template
  >
  <dialog
    ref="photoDialog"
    class="photo-lightbox"
    @keydown.left.prevent="changePhoto(-1)"
    @keydown.right.prevent="changePhoto(1)"
    @click="$event.target === photoDialog && photoDialog?.close()"
  >
    <button
      class="photo-close"
      :aria-label="t('Close')"
      @click="photoDialog?.close()"
    >
      ×</button
    ><img
      v-if="selectedPhoto"
      :src="safeUrl(selectedPhoto.url)"
      :alt="selectedPhoto.author?.username || t('Hotel photos')"
    />
    <div class="flex justify-between items-center gap-4">
      <button
        class="secondary"
        :aria-label="t('Previous photo')"
        @click="changePhoto(-1)"
      >
        ‹
      </button>
      <p>{{ selectedPhoto?.author?.username }}</p>
      <button
        class="secondary"
        :aria-label="t('Next photo')"
        @click="changePhoto(1)"
      >
        ›
      </button>
    </div>
  </dialog>
</template>

<style scoped>
.application-form {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.application-form label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.application-form input {
  background: #21242e;
  color: #e5e7eb;
  border: 2px solid #374151;
  border-radius: 4px;
  padding: 8px 12px;
}
.application-form textarea {
  min-height: 180px;
  border: 4px solid #374151;
  border-radius: 4px;
  background: #1f2937;
  color: #e5e7eb;
}
.application-form textarea:focus {
  border-color: #eeb425;
  outline: none;
}
.application-form button {
  width: 100%;
  border-radius: 4px;
  background: #eeb425;
  color: white;
  padding: 8px;
  border: 2px solid #facc15;
  font-weight: 600;
}
.application-form button:hover {
  background: #d49f1c;
}

.photo-lightbox {
  width: fit-content;
  max-width: 95vw;
  max-height: 95vh;
  margin: auto;
  padding: 16px;
  border: 0;
  border-radius: 8px;
  background: #171a23;
  color: white;
}
.photo-lightbox::backdrop {
  background: #000c;
}
.photo-lightbox > img {
  max-height: 80vh;
  max-width: 85vw;
  object-fit: contain;
}
.photo-close {
  display: block;
  margin-left: auto;
  border: 0;
  background: none;
  font-size: 24px;
  padding: 0 8px;
}
.photo-lightbox p {
  text-align: center;
}

.community-heading {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #21242e;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}
.community-heading h1 {
  font-size: 18px;
  font-weight: 700;
}
.community-heading img {
  max-height: 44px;
}
.staff-layout {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 16px;
  align-items: start;
}
.staff-group {
  border-radius: 8px;
  background: #2b303c;
  overflow: hidden;
  padding-bottom: 16px;
}
.staff-group header {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #21242e;
  margin-bottom: 16px;
  align-items: center;
}
.staff-group header > span {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.staff-group header h2 {
  font-size: 14px;
  font-weight: 600;
  color: #d1d5db;
}
.staff-group header p {
  font-size: 14px;
  color: #6b7280;
}
.staff-members {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 0 12px;
}
.staff-member {
  display: block;
  height: 96px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: #171a23;
}
.staff-portrait {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: url("/assets/images/dusk/me_circle_image.png") center/contain;
  overflow: hidden;
}
.staff-portrait img {
  position: absolute;
  bottom: -40px;
  max-width: none;
  image-rendering: pixelated;
}
.staff-member strong,
.staff-member small {
  display: block;
  margin-left: 90px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.staff-member strong {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 600;
}
.staff-member small {
  font-style: italic;
}
.staff-status {
  position: absolute;
  bottom: 10px;
  right: 16px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #f87171;
}
.staff-status.online {
  background: #4ade80;
}
.staff-layout aside {
  font-size: 14px;
}
.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.leaderboard-list h2 {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 16px;
  background: #21242ee6;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
}
.leaderboard-list h2 img {
  width: 16px;
  image-rendering: pixelated;
}
.leaderboard-entry {
  padding: 12px;
  border-radius: 6px;
  height: 60px;
  background: #21242ee6;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}
.leaderboard-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  overflow: hidden;
  border-radius: 50%;
  flex-shrink: 0;
  background: url("/assets/images/dusk/leaderboard_circle_image.png")
    center/cover;
}
.leaderboard-avatar img {
  position: absolute;
  top: -8px;
  left: 0;
  max-width: none;
  image-rendering: pixelated;
}
.leaderboard-entry p {
  font-size: 14px;
}
.leaderboard-medal,
.leaderboard-number {
  margin-left: auto;
}
.leaderboard-medal {
  width: 32px;
  height: 32px;
  object-fit: contain;
  image-rendering: pixelated;
}
.leaderboard-number {
  width: 32px;
  height: 32px;
  background: #d1d5db;
  color: #1f2937;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
@media (max-width: 1023px) {
  .staff-layout {
    grid-template-columns: 1fr;
  }
  .staff-members {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 639px) {
  .staff-members {
    grid-template-columns: 1fr;
  }
}
</style>
