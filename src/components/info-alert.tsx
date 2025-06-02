import { cn } from "~/lib/utils";

interface AlertProps {
  message: string;
}

export function InfoAlert({ message }: AlertProps) {
  return (
    <div class={cn("rounded-md flex items-center gap-x-2 text-sm p-3", "bg-blue-500/15", "text-blue-600")}>
      <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>
      <p>{message}</p>
    </div>
  );
}
