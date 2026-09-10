import type { Ref } from "vue";

export function useReferrals(referralInput: Ref<HTMLInputElement | null>) {
  const { t } = useLocale();

  const { api } = useApi();

  const { session, refreshUser } = useSession();

  const { busy, error, success, run } = usePage();

  const frontendOrigin = useRequestURL().origin;

  const referralLink = computed(
    () => `${frontendOrigin}/register/${session.user?.referral_code || ""}`,
  );

  async function claim() {
    await run(async () => {
      await api("/me/referral-claim", "POST");

      await refreshUser();
    }, "Referral reward claimed.");
  }

  async function copyReferral() {
    await run(async () => {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(referralLink.value);
      } else {
        referralInput.value?.select();

        if (!document.execCommand("copy")) {
          throw new Error(t("Select and copy your referral link."));
        }
      }
    }, "Your referral code has been copied to your clipbord!");
  }

  return {
    t,
    session,
    busy,
    error,
    success,
    referralLink,
    claim,
    copyReferral,
  };
}
