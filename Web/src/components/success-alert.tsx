import { cn } from "~/lib/utils";

interface AlertProps {
  message: string;
}

export function SuccessAlert({ message }: AlertProps) {
  return (
    <div class={cn("rounded-md flex items-center gap-x-2 text-sm p-3", "bg-green-500/15", "text-green-600")}>
      <svg class="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <p>{message}</p>
    </div>
  );
}
