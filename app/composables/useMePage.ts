import { computed, onMounted, ref } from "vue";
import type { Data } from "~/utils/api";

export function useMePage() {
  const { t } = useLocale();
  const { api } = useApi();
  const { session, avatar, refreshUser } = useSession();
  const { busy, error, success, run } = usePage();
  const frontendOrigin = useRequestURL().origin;
  const articles = ref<Data<"Article">[]>([]);
  const slide = ref(0);
  const referralInput = ref<HTMLInputElement>();
  const referralLink = computed(
    () => `${frontendOrigin}/register/${session.user?.referral_code || ""}`
  );
  onMounted(() =>
    run(async () => {
      await refreshUser();
      articles.value = (await api<Data<"Article">[]>("/articles")).data;
    })
  );
  async function claim() {
    await run(async () => {
      await api("/me/referral-claim", "POST");
      await refreshUser();
    }, "Referral reward claimed.");
  }
  async function copyReferral() {
    await run(async () => {
      if (navigator.clipboard)
        await navigator.clipboard.writeText(referralLink.value);
      else {
        referralInput.value?.select();
        if (!document.execCommand("copy"))
          throw new Error(t("Select and copy your referral link."));
      }
    }, "Your referral code has been copied to your clipbord!");
  }
  const slideStart = ref(0);
  function swipeNews(event: PointerEvent) {
    const delta = event.clientX - slideStart.value;
    if (Math.abs(delta) > 40)
      slide.value = Math.max(
        0,
        Math.min(articles.value.length - 1, slide.value + (delta < 0 ? 1 : -1))
      );
  }
  return {
    t,
    session,
    avatar,
    busy,
    error,
    success,
    articles,
    slide,
    slideStart,
    swipeNews,
    referralInput,
    referralLink,
    claim,
    copyReferral,
  };
}
