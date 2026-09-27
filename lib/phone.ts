// Normalizes any Saudi phone number input into bare E.164 digits (no leading +),
// e.g. "0555759614" -> "966555759614", "00966555759614" -> "966555759614",
// "966555759614" -> "966555759614". Single source of truth for phone formatting
// used across auth, contact links (WhatsApp/tel), and display.
export function toSaudiDigits(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "").replace(/^0+/, "");
  return digits.startsWith("966") ? digits : `966${digits}`;
}

export function toE164(rawPhone: string): string {
  return `+${toSaudiDigits(rawPhone)}`;
}
