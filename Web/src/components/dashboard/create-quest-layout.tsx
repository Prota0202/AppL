import { action, redirect, useSubmission, createAsync, query } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { getSession } from "@auth/solid-start";
import { authOptions } from "~/routes/api/auth/[...solidauth]";
import { For } from "solid-js/web";
import { ErrorAlert } from "~/components/error-alert";
import Layout from "~/components/layout";
import LoadingSpinner from "~/components/loading";
import { availableItems } from "~/constants/dummy";
import db from "~/lib/db";
import { getExpReward } from "~/lib/utils";
import { questFormSchema, rewardListSchema } from "~/lib/validation";
import { getRequestEvent } from "solid-js/web";

type RewardItem = {
  id: number;
  itemName: string;
  description: string;
  quantity: number;
};

export const getCreateQuestData = query(async () => {
  "use server";
  
  const event = getRequestEvent();
    if (!event) throw new Error("No request event");

  const session = await getSession(event.request,authOptions);
  if (!session?.user) {
    throw new Error("Non autorisé");
  }

  return {
    userEmail: session.user.email!
  };
}, "createQuest");

const createQuest = action(async (
  userEmail: string,
  reward: RewardItem[],
  formData: FormData
) => {
  "use server";

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    difficulty: formData.get("difficulty"),
  };

  const parsed = questFormSchema.safeParse(raw);
  const parsedRewards = rewardListSchema.safeParse(reward);

  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
    return { error: errorMessages };
  } else if (!parsedRewards.success) {
    const errorMessages = parsedRewards.error.errors.map(err => err.message).join(', ');
    return { error: errorMessages };
  }

  try {
    const user = await db.user.findUnique({
      where: { email: userEmail },
      select: {
        character: { select: { id: true } }
      }
    });

    if (!user || !user.character) {
      return { error: `${!user ? 'User' : 'Character'} not found in our database` };
    }

    const characterId = user.character.id;

    const exp = getExpReward(parsed.data.difficulty);

    // Create the quest
    const createdQuest = await db.quest.create({
      data: {
        ...parsed.data,
        reward: `${exp} XP${reward.length > 0 ? ` + ${reward.map((r) => `x${r.quantity} ${r.itemName}`).join(' + ')}` : ''}`,
        characterId,
      }
    });

    if (reward.length > 0) {
      const itemData = reward.map(item => ({
        name: item.itemName,
        description: item.description,
        quantity: item.quantity,
        characterId,
        rewardFromQuestId: createdQuest.id,
      }));

      await db.item.createMany({ data: itemData });
    }
  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred. Please try again." };
  }

  throw redirect('/quests?create_quest=success');
}, "createQuest");

export default function CreateQuestLayout() {
  const questData = createAsync(() => getCreateQuestData());
  const [rewards, setRewards] = createSignal<RewardItem[]>([
    { id: 1, itemName: '', description: '', quantity: 1 }
  ]);

  const submission = useSubmission(createQuest);

  const handleRewardChange = (index: number, field: keyof RewardItem, value: string) => {
    const updated = [...rewards()];
    if (field === "quantity") {
      updated[index][field] = parseInt(value, 10);
    } else if (field !== "id") {
      updated[index][field] = value;
    }

    if (field === "itemName" && value) {
      const selectedItem = availableItems.find((item) => item.name === value);
      if (selectedItem) {
        updated[index].description = selectedItem.description;
      }
    }

    setRewards(updated);
  };

  const addReward = () => {
    setRewards([...rewards(), {
      id: rewards().length + 1,
      itemName: '',
      description: '',
      quantity: 1
    }]);
  };

  const removeReward = (index: number) => {
    if (rewards().length > 1) {
      setRewards(rewards().filter((_, i) => i !== index));
    }
  };

  return (
    <Layout>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center text-blue-400 mb-8">Create New Quest</h1>

        <Show
          when={questData()}
          fallback={
            <div class="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div class="p-6">
                <LoadingSpinner size="medium" message="Loading..." />
              </div>
            </div>
          }
        >
          {(data) => (
            <div class="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div class="p-6">
                <form action={createQuest.with(data().userEmail, rewards())} method="post">
                  <div class="mb-8">
                    <h2 class="text-xl font-bold text-gray-200 mb-6">Quest Information</h2>

                    <div class="grid grid-cols-1 gap-6">
                      <div>
                        <label for="title" class="block text-sm font-medium text-gray-300 mb-2">
                          Quest Title <span class="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          required
                          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter quest title"
                        />
                      </div>

                      <div>
                        <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
                          Quest Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={4}
                          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter quest description"
                        ></textarea>
                      </div>

                      <div>
                        <label for="difficulty" class="block text-sm font-medium text-gray-300 mb-2">
                          Difficulty Level <span class="text-red-500">*</span>
                        </label>
                        <select
                          id="difficulty"
                          name="difficulty"
                          class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="" selected disabled>Select a difficulty</option>
                          <option value="A">A (Hardest) - 1000 XP</option>
                          <option value="B">B (Hard) - 500 XP</option>
                          <option value="C">C (Medium) - 300 XP</option>
                          <option value="D">D (Easy) - 150 XP</option>
                          <option value="E">E (Easiest) - 50 XP</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="mb-8">
                    <div class="flex justify-between items-center mb-6">
                      <h2 class="text-xl font-bold text-gray-200">Reward Items</h2>
                      <button
                        type="button"
                        onClick={addReward}
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div class="space-y-6">
                      <For each={rewards()}>
                        {(reward, index) => (
                          <div class="p-4 bg-gray-750 rounded-lg border border-gray-700">
                            <div class="flex justify-between items-center mb-4">
                              <h3 class="font-medium text-gray-200">Reward Item #{index() + 1}</h3>
                              <button
                                type="button"
                                onClick={() => removeReward(index())}
                                class="text-red-400 hover:text-red-300"
                                disabled={rewards().length === 1}
                              >
                                {rewards().length > 1 ? 'Remove' : ''}
                              </button>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div class="md:col-span-2">
                                <label for={`itemName-${index()}`} class="block text-sm font-medium text-gray-300 mb-2">
                                  Item Name <span class="text-red-500">*</span>
                                </label>
                                <select
                                  id={`itemName-${index()}`}
                                  value={reward.itemName}
                                  onChange={(e) => handleRewardChange(index(), 'itemName', e.currentTarget.value)}
                                  required
                                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select Item</option>
                                  <For each={availableItems}>
                                    {(item) => <option value={item.name}>{item.name}</option>}
                                  </For>
                                </select>
                              </div>

                              <div>
                                <label for={`quantity-${index()}`} class="block text-sm font-medium text-gray-300 mb-2">
                                  Quantity <span class="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  id={`quantity-${index()}`}
                                  value={reward.quantity}
                                  onInput={(e) => handleRewardChange(index(), 'quantity', e.currentTarget.value)}
                                  min={1}
                                  required
                                  class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            {reward.description && (
                              <div class="mt-4">
                                <p class="text-sm text-gray-400">
                                  <span class="font-medium">Description:</span> {reward.description}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </For>
                    </div>
                  </div>

                  <Show when={submission.error || submission.result?.error}>
                    <ErrorAlert
                      message={submission.error?.message || submission.result?.error}
                    />
                  </Show>

                  <div class="mt-4 flex justify-end pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      class="px-4 py-2 bg-gray-700 text-gray-300 rounded-md mr-3 hover:bg-gray-600"
                      onClick={() => history.back()}
                      disabled={submission.pending}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      disabled={submission.pending}
                    >
                      {submission.pending ? 'Loading...' : 'Create Quest'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </Show>
      </div>
    </Layout>
  );
}