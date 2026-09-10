export function usePurchaseAttempt() {
  const { session } = useSession();

  function keyFor(
    operation: string,
    payload: unknown,
  ): { storage: string; key: string } {
    const storage = `dusk-pending:${
      session.user?.id
    }:${operation}:${JSON.stringify(payload)}`;
    const key = sessionStorage.getItem(storage) || crypto.randomUUID();
    sessionStorage.setItem(storage, key);
    return { storage, key };
  }

  return { keyFor };
}
