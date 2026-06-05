import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getOpenAiApiKey(): string {
  if (typeof window !== "undefined") {
    const customKey = localStorage.getItem("reportai_custom_api_key");
    if (customKey) return customKey;
  }
  return process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
}
