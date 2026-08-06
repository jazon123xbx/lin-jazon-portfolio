export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function getCurrentYear() {
  return new Date().getFullYear();
}
