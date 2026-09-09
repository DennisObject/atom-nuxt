<script setup lang="ts">
const { t } = useLocale();
import { computed, onMounted, reactive, ref } from "vue";

import { ApiError } from "~/utils/api";
const { api, request } = useApi();
import type { RecordData, Data } from "~/utils/api";
const { session, refreshUser } = useSession();
import { usePage } from "~/composables/usePage";
import { Card } from "#components";
import Notice from "~/components/Notice.vue";
import Captcha from "~/components/Captcha.vue";
import DOMPurify from "isomorphic-dompurify";
const captcha = ref<Record<string, string>>({});
const route = useRoute();
const tab = computed(() => String(route.params.tab || "account"));
const { busy, error, fields, success, run } = usePage();
const form = reactive({
  mail: session.user?.mail || "",
  motto: session.user?.motto || "",
  username: session.user?.username || "",
  current_password: "",
  password: "",
  password_confirmation: "",
  code: "",
});
const twoFactor = ref<Partial<Data<"TwoFactor">>>({}),
  sessions = ref<Data<"Session">[]>([]),
  passwordRequired = ref(false);
const tabs: [string, string][] = [
  ["Account settings", "account"],
  ["Password settings", "password"],
  ["Two factor", "two-factor"],
  ["Session logs", "session-logs"],
];
const qr = computed(() =>
  DOMPurify.sanitize(twoFactor.value.qr_code || "", {
    USE_PROFILES: { svg: true },
    FORBID_TAGS: ["foreignObject", "style"],
    FORBID_ATTR: ["style"],
  })
);
async function loadTwoFactor() {
  try {
    twoFactor.value = (await api<Data<"TwoFactor">>("/me/two-factor")).data;
    passwordRequired.value = false;
  } catch (failure) {
    if (failure instanceof ApiError && failure.status === 423)
      passwordRequired.value = true;
    else throw failure;
  }
}
onMounted(() =>
  run(async () => {
    if (tab.value === "two-factor") await loadTwoFactor();
    if (tab.value === "session-logs")
      sessions.value = (await api<Data<"Session">[]>("/me/sessions")).data;
  })
);
async function save() {
  await run(async () => {
    if (tab.value === "account") {
      const body: RecordData = {
        mail: form.mail,
        motto: form.motto,
        current_password: form.current_password,
        ...captcha.value,
      };
      if (session.user?.can_change_name) body.username = form.username;
      await api("/me/account", "PUT", body);
      await refreshUser();
    } else {
      await api("/me/password", "PUT", {
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
        ...captcha.value,
      });
      form.password = "";
      form.password_confirmation = "";
    }
    form.current_password = "";
  }, "Your settings have been updated.");
}
async function confirmPassword() {
  await run(async () => {
    await request("/user/confirm-password", "POST", {
      password: form.current_password,
    });
    form.current_password = "";
    await loadTwoFactor();
  });
}
async function changeTwoFactor(action: "enable" | "confirm" | "disable") {
  await run(
    async () => {
      const endpoint = "/user/settings/two-factor-authentication";
      if (action === "confirm") {
        await request(`${endpoint}/confirm`, "POST", {
          code: form.code,
          ...captcha.value,
        });
        form.code = "";
        await refreshUser();
      } else
        await request(endpoint, action === "enable" ? "POST" : "DELETE", {
          current_password: form.current_password,
        });
      form.current_password = "";
      await loadTwoFactor();
      await refreshUser();
    },
    action === "confirm"
      ? "Two-factor authentication is enabled. Keep your recovery codes safe."
      : action === "disable"
      ? "Two-factor authentication is disabled."
      : ""
  );
}
</script>
<template>
  <div class="settings-layout">
    <aside class="settings-navigation">
      <NuxtLink
        v-for="[label, path] in tabs"
        :key="path"
        :to="`/user/settings/${path}`"
        :class="{ active: tab === path }"
        ><svg
          v-if="path === 'account'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          /></svg
        ><svg
          v-if="path === 'password'"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          /></svg
        ><svg
          v-if="path === 'two-factor'"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-6 w-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"
          /></svg
        ><svg
          v-if="path === 'session-logs'"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <line x1="9" y1="7" x2="15" y2="7" />
          <line x1="9" y1="11" x2="15" y2="11" />
          <line x1="9" y1="15" x2="13" y2="15" />
        </svg>
        {{ t(label) }}
      </NuxtLink>
    </aside>
    <Card
      class="settings-content"
      :title="
        t(
          tab === 'two-factor'
            ? 'Two factor authentication'
            : tabs.find((item) => item[1] === tab)?.[0] || 'Account settings'
        )
      "
      :subtitle="
        t(
          tab === 'account'
            ? 'Manage your account settings'
            : tab === 'password'
            ? 'Change your password by filling out the fields below'
            : tab === 'session-logs'
            ? 'Keep an eye on all your active sessions'
            : 'Add an extra layer of security to your account by enabling two-factor authentication'
        )
      "
      icon="hotel-icon"
      ><Notice :error="error" :fields="fields" :success="success" />
      <form
        v-if="tab === 'account' || tab === 'password'"
        @submit.prevent="save"
      >
        <template v-if="tab === 'account'"
          ><label>
            {{ t("E-mail") }}
            <small>{{
              t(
                "Make sure to use an email that you remember, if you ever lose your password, your email will be required."
              )
            }}</small>
            <input
              v-model="form.mail"
              type="email"
              autocomplete="email"
              required /></label
          ><label v-if="session.user?.can_change_name">
            {{ t("Username") }}
            <small>{{
              t("Your username is what you and others will see in-game")
            }}</small>
            <input
              v-model="form.username"
              autocomplete="username"
              required /></label
          ><label>
            {{ t("Motto")
            }}<small>{{ t("Spice up your profile with a nice motto") }}</small>
            <input v-model="form.motto" /></label
        ></template>
        <label>
          {{ t("Current password") }}
          <small>{{
            t(
              tab === "account"
                ? "Required to change your e-mail address."
                : "Enter your current password"
            )
          }}</small>
          <input
            v-model="form.current_password"
            type="password"
            autocomplete="current-password"
            :required="tab === 'password'"
        /></label>
        <template v-if="tab === 'password'"
          ><label>
            {{ t("New password") }}
            <small>{{
              t(
                "Enter a new secure password. Do not forget to save it somewhere safe"
              )
            }}</small>
            <input
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              required /></label
          ><label>
            {{ t("Confirm new password") }}
            <small>{{ t("Please confirm your new password") }}</small>
            <input
              v-model="form.password_confirmation"
              type="password"
              autocomplete="new-password"
              required /></label
        ></template>
        <div class="settings-captcha">
          <Captcha v-model="captcha" :busy="busy" />
        </div>
        <div class="settings-submit">
          <button :disabled="busy">
            {{ t(tab === "password" ? "Update password" : "Update settings") }}
          </button>
        </div>
      </form>
      <template v-else-if="tab === 'two-factor'">
        <form v-if="passwordRequired" @submit.prevent="confirmPassword">
          <p>
            {{ t("Confirm your password to view your security settings.") }}
          </p>
          <label
            >{{ t("Current password")
            }}<input
              v-model="form.current_password"
              type="password"
              autocomplete="current-password"
              required /></label
          ><button :disabled="busy">{{ t("Confirm password") }}</button>
        </form>
        <form
          v-else-if="twoFactor.enabled"
          @submit.prevent="changeTwoFactor('disable')"
        >
          <label
            >{{ t("Current password")
            }}<input
              v-model="form.current_password"
              type="password"
              autocomplete="current-password"
              required /></label
          ><button class="danger" :disabled="busy">
            {{ t("Disable 2FA") }}
          </button>
        </form>
        <template v-else-if="twoFactor.qr_code">
          <p>
            {{
              t(
                "Validate your two-factor enabling by scanning the following QR-code and enter your auto-generated 2-factor code from your phone."
              )
            }}
          </p>
          <div class="two-factor-codes">
            <div class="qr" v-html="qr"></div>
            <div>
              <strong>{{ t("Recovery codes:") }}</strong>
              <ul>
                <li v-for="code in twoFactor.recovery_codes" :key="code">
                  {{ code }}
                </li>
              </ul>
            </div>
          </div>
          <p class="recovery-warning">
            {{
              t(
                "Please save your recovery codes somewhere safe! If you lose access to your 2FA codes, those recovery codes will be needed to regain access your account."
              )
            }}
          </p>
          <form
            class="two-factor-confirm"
            @submit.prevent="changeTwoFactor('confirm')"
          >
            <label
              >{{ t("Code")
              }}<small>{{
                t(
                  "Please scan the QR-code above with your phone to retrieve your two-factor authentication code."
                )
              }}</small
              ><input
                v-model="form.code"
                inputmode="numeric"
                autocomplete="one-time-code"
                :placeholder="t('Code')"
                required /></label
            ><Captcha v-model="captcha" :busy="busy" /><button :disabled="busy">
              {{ t("Verify 2FA") }}
            </button>
          </form>
        </template>
        <template v-else>
          <p>
            {{
              t(
                "Here at :hotel we take security very serious and therefore we offer you as a user a way to secure your beloved account even further, by allowing you to enable Googles 2-factor authentication!",
                { hotel: session.bootstrap.hotel_name }
              )
            }}
          </p>
          <p>
            {{
              t(
                "2-factor authentication adds an extra layer of security to your account, making it physical impossible to access it without having access to your mobile phone as only your phone will contain the 2-factor authentication code which will be re-generated every 30 seconds automatically"
              )
            }}
          </p>
          <form
            class="two-factor-enable"
            @submit.prevent="changeTwoFactor('enable')"
          >
            <label
              >{{ t("Current password")
              }}<input
                v-model="form.current_password"
                type="password"
                autocomplete="current-password"
                required /></label
            ><button :disabled="busy">{{ t("Activate 2FA") }}</button>
          </form>
        </template>
      </template>
      <div v-else-if="tab === 'session-logs'" class="session-table">
        <table>
          <thead>
            <tr>
              <th>{{ t("IP") }}</th>
              <th>{{ t("IP Current Device") }}</th>
              <th>{{ t("Is Desktop") }}</th>
              <th>{{ t("Platform") }}</th>
              <th>{{ t("Browser") }}</th>
              <th>{{ t("Last Activity") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in sessions" :key="index">
              <td>{{ item.ip_address }}</td>
              <td>{{ String(item.is_current_device) }}</td>
              <td>{{ String(item.agent.is_desktop) }}</td>
              <td>{{ item.agent.platform || "" }}</td>
              <td>{{ item.agent.browser || "" }}</td>
              <td>{{ item.last_active }}</td>
            </tr>
            <tr v-if="!sessions.length">
              <td colspan="6" class="text-center">
                {{ t("No session logs found") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>

<style scoped>
.settings-layout {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}
.settings-navigation {
  grid-column: span 3;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.settings-navigation a {
  background: var(--header, #21242e);
  color: var(--text, #f3f4f6);
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 24px;
  text-align: center;
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  transition: background-color 0.2s;
}
.settings-navigation a.active,
.settings-navigation a:hover {
  background: #eeb425;
  color: white;
}
.settings-navigation svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.settings-content {
  grid-column: span 9;
  min-width: 0;
}
.settings-content form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.settings-content label {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
  color: var(--text, #e5e7eb);
}
.settings-content label small {
  font-size: 14px;
  line-height: 21px;
  font-weight: 400;
  color: var(--text-subtle, #9ca3af);
}
.settings-content input {
  margin-top: 12px;
  background: var(--header, #21242e);
  color: var(--text, #e5e7eb);
  border: 2px solid var(--border, #374151);
  border-radius: 4px;
  padding: 8px 12px;
  width: 100%;
}
.settings-content input:focus {
  border-color: #eeb425;
  box-shadow: none;
  outline: none;
}
.settings-content button {
  width: 100%;
  border-radius: 4px;
  background: var(--color-green-600);
  color: white;
  padding: 8px;
  border: 2px solid var(--color-green-500);
  font-weight: 600;
}
.settings-content button:hover:not(:disabled) {
  background: var(--color-green-700);
}
.settings-content button.danger {
  background: #dc2626;
  border-color: #ef4444;
}
.settings-captcha {
  margin-top: 12px;
}
.settings-submit {
  display: flex;
  justify-content: flex-end;
}
.settings-submit button {
  width: 25%;
}
.two-factor-codes {
  display: flex;
  align-self: center;
  gap: 32px;
  border-radius: 4px;
  background: #f3f4f6;
  color: black;
  padding: 8px 16px;
  margin-top: 16px;
}
.two-factor-codes .qr {
  background: none;
  padding: 0;
}
.recovery-warning {
  max-width: 480px;
  align-self: center;
  color: #ef4444;
  font-size: 12px;
  font-style: italic;
  font-weight: bold;
}
.two-factor-confirm {
  margin-top: 32px;
}
.two-factor-enable {
  margin-top: 32px;
  align-self: flex-end;
}
.session-table {
  overflow: auto;
  border: 2px solid var(--border, #374151);
  border-radius: 4px;
}
.session-table table {
  min-width: 100%;
  font-size: 14px;
  border-collapse: collapse;
}
.session-table thead {
  background: var(--header, #21242e);
}
.session-table th,
.session-table td {
  padding: 8px 16px;
  color: var(--text, #e5e7eb);
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid var(--border, #374151);
}
.session-table th {
  font-weight: 500;
}
.session-table td.text-center {
  text-align: center;
}
@media (max-width: 767px) {
  .settings-navigation,
  .settings-content {
    grid-column: 1 / -1;
  }
  .settings-navigation a {
    padding: 8px;
    font-size: 16px;
    line-height: 24px;
  }
  .settings-submit {
    justify-content: flex-start;
  }
  .settings-submit button {
    width: 100%;
  }
  .two-factor-codes {
    flex-wrap: wrap;
    gap: 16px;
  }
  .two-factor-enable {
    align-self: stretch;
  }
}
</style>
