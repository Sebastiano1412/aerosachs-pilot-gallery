
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // JavaScript months are 0-11
    year: now.getFullYear()
  };
}

export function getMonthName(month: number): string {
  const months = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];
  return months[month - 1];
}

export function showErrorToast(message: string) {
  toast.error(message);
}

export function showSuccessToast(message: string) {
  toast.success(message);
}

export const MAX_UPLOADS_PER_MONTH = 3;
export const MAX_VOTES_PER_USER = 3;

export function isStaffPassword(password: string): boolean {
  return password === "asxfoto10";
}
