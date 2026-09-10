export function useHomeCurrency() {
  const { t } = useLocale();
  const { session } = useSession();
  const names: Record<number, string> = {
    [-1]: "Credits",
    0: "Duckets",
    5: "Diamonds",
    101: "Points",
  };

  function currencyName(currency: number): string {
    return t(names[currency] || String(currency));
  }

  function currencyIcon(currency: number): string {
    const icon =
      currency === 0 ? "duckets" : currency === 5 ? "diamonds" : "credits";
    return `/assets/images/icons/currency/${icon}.png`;
  }

  function balance(currency: number): number {
    const balances = session.user?.balances;
    return (
      (currency === -1
        ? balances?.credits
        : currency === 0
          ? balances?.duckets
          : currency === 5
            ? balances?.diamonds
            : balances?.points) || 0
    );
  }

  return { currencyName, currencyIcon, balance };
}
