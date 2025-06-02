import { Component, For, Show } from "solid-js";
import { createAsync } from "@solidjs/router";
import Layout from "~/components/layout";
import LoadingSpinner from "~/components/loading";
import { Item } from "~/lib/types";
import { getInventoryData } from "~/lib/route-data";

const InventoryLayout: Component = () => {
  
  const inventory = createAsync(() => getInventoryData());

  const renderItemCard = (item: Item) => (
    <div class="bg-gray-800 rounded-lg overflow-hidden transition hover:bg-gray-900">
      <div class="p-2 sm:p-4">
        <div class="w-full h-20 bg-gray-700 rounded-md mb-3 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <div class="flex justify-between items-start">
          <h3 class="text-sm font-medium text-gray-200">{item.name}</h3>
          <Show when={item.quantity > 1}>
            <span class="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded-full">x{item.quantity}</span>
          </Show>
        </div>
        <Show when={item.description}>
          <p class="mt-1 text-xs text-gray-400 line-clamp-2">{item.description}</p>
        </Show>
      </div>
    </div>
  );

  return (
    <Layout>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center text-blue-400 mb-8">Inventory</h1>

        <div class="bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-200">Item List</h2>
            <Show when={inventory()}>
              <div class="bg-blue-900/30 px-3 py-1 rounded-full">
                <span class="text-sm text-blue-300">Total: {inventory()!.length} items</span>
              </div>
            </Show>
          </div>
          <Show
            when={inventory()}
            fallback={(
              <div class="py-10">
                <LoadingSpinner size="medium" />
              </div>
            )}
          >
            {(items) => (
              <Show
                when={items().length > 0}
                fallback={
                  <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p class="text-lg font-medium">Inventory is empty</p>
                  </div>
                }
              >
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
                  <For each={items()}>{renderItemCard}</For>
                </div>
              </Show>
            )}
          </Show>
        </div>
      </div>
    </Layout>
  );
};

export default InventoryLayout;