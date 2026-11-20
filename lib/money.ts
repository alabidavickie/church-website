// Amounts and currencies (Offerings). Any amount, any currency the admin
// enables; the smallest gift is the equivalent of $0.50.
import { amountToMinor, isValidAmount } from "./stripe";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", GBP: "£", EUR: "€", NGN: "₦", GHS: "₵", KES: "KSh", CAD: "$",
};

export function formatMoney(amountMinor: number, currency: string): string {
  const zero = ["JPY", "KRW", "VND", "CLP"].includes(currency.toUpperCase());
  const amount = zero ? amountMinor : amountMinor / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function parseOfferingAmount(raw: string): { ok: true; amount: number } | { ok: false; error: string } {
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: "Enter an amount." };
  if (!isValidAmount(amount)) return { ok: false, error: "The smallest gift is the equivalent of $0.50." };
  return { ok: true, amount };
}

export { amountToMinor, isValidAmount };
