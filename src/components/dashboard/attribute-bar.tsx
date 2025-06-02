import { cn } from "~/lib/utils";
import { Component, createMemo } from "solid-js";

interface IProps {
  label: string;
  value: number;
  max?: number;
  color: string;
  iconColor: string;
  iconBg: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
  disabledIncrement?: boolean;
  disabledDecrement?: boolean;
}

export const AttributeBar: Component<IProps> = (props) => {
  const widthPercent = createMemo(() => (props.value / (props.max || 100)) * 100);

  return (
    <div class="flex items-center">
      <div
        class={cn(
          "w-10 h-10 rounded-full flex items-center justify-center mr-3",
          props.iconBg
        )}
      >
        <svg class={cn("h-6 w-6", props.iconColor)} viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <div class="grow">
        <div class="flex justify-between">
          <span class="text-sm font-medium text-gray-300">{props.label}</span>
          <span class={cn("text-sm font-bold", props.iconColor)}>{props.value}</span>
        </div>

        <div class="w-full flex items-center gap-2">
          <button
            onClick={() => props.onDecrement?.()}
            disabled={props.disabledDecrement}
            class={cn(
              "h-5 w-5 flex justify-center items-center text-lg hover:brightness-125 rounded-full font-bold cursor-pointer transition-all",
              props.iconColor
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width={4}
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
            </svg>
          </button>
          <div class="flex-auto bg-gray-700 rounded-full h-1.5">
            <div
              class={cn("h-1.5 rounded-full", props.color)}
              style={{ width: `${widthPercent()}%` }}
            ></div>
          </div>
          <button
            onClick={() => props.onIncrement?.()}
            disabled={props.disabledIncrement}
            class={cn(
              "h-5 w-5 flex justify-center items-center text-lg hover:brightness-125 rounded-full font-bold cursor-pointer transition-all",
              props.iconColor
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width={4}
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
