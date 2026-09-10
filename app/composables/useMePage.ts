import type { Data } from "~/utils/api";

export function useMePage() {
  const { api } = useApi();

  const { session, refreshUser } = useSession();

  const { error, run } = usePage();

  const articles = ref<Data<"Article">[]>([]);

  onMounted(() =>
    run(async () => {
      await refreshUser();

      articles.value = (await api<Data<"Article">[]>("/articles")).data;
    }),
  );

  return { session, error, articles };
}
