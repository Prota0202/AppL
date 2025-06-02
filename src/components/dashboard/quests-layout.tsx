import { A, action, useAction, useSearchParams, createAsync } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import Layout from "~/components/layout";
import LoadingSpinner from "~/components/loading";
import { SuccessAlert } from "~/components/success-alert";
import { questTabs } from "~/constants/dummy";
import { Quest, QuestStatus } from "~/lib/types";
import { cn, getExpReward } from "~/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import db from "~/lib/db";
import { useToast } from "~/components/toast/toast";
import { updateCharacterExpAndLevel } from "~/actions/update-character-exp-and-level";
import { getQuestsData, getUserCharacter } from "~/lib/route-data";

type UpdateAction = 'accept' | 'progress' | 'cancel';

const updateQuest = action(async (questId: number, type: UpdateAction) => {
  "use server";

  try {
    const quest = await db.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      return { error: "Quest not found." };
    }

    if (type === 'accept') {
      if (quest.status !== 'AVAILABLE') {
        return { error: "Quest must be AVAILABLE to accept." };
      }

      const updatedQuest = await db.quest.update({
        where: { id: questId },
        data: {
          status: 'IN_PROGRESS',
          progress: 0,
        },
      });

      return {
        success: ["Quest accepted."],
        type: "accepted" as const,
        data: updatedQuest
      };
    }

    if (type === 'progress') {
      if (quest.status !== 'IN_PROGRESS') {
        return { error: "Quest must be IN_PROGRESS to update progress." };
      }

      const nextProgress = quest.progress + 25;

      const updateData: any = {
        progress: Math.min(nextProgress, 100),
      };

      let resultType: "inProgress" | "completed" = "inProgress";

      if (nextProgress >= 100) {
        updateData.status = 'COMPLETED';
        updateData.completedDate = new Date();
        resultType = "completed";
      }

      const updatedQuest = await db.quest.update({
        where: { id: questId },
        data: updateData,
        include: {
          character: true,
          itemsRewarded: true,
        }
      });

      const { itemsRewarded, character, ...data } = updatedQuest;

      if (resultType === 'completed') {
        const gainedExp = getExpReward(data.difficulty);

        for (const rewardItem of itemsRewarded) {
          const existingItem = await db.item.findFirst({
            where: {
              characterId: updatedQuest.characterId,
              name: rewardItem.name,
              status: 'COMPLETED'
            },
          });

          if (existingItem) {
            await db.item.update({
              where: { id: existingItem.id },
              data: {
                quantity: {
                  increment: rewardItem.quantity
                },
              },
            });

            await db.item.delete({
              where: { id: rewardItem.id },
            });
          } else {
            await db.item.updateMany({
              where: {
                characterId: updatedQuest.characterId,
                name: rewardItem.name,
                status: 'PENDING'
              },
              data: { status: 'COMPLETED' }
            });
          }
        }

        const { updatedCharacter, leveledUp } = await updateCharacterExpAndLevel({
          character: character!,
          experienceGained: gainedExp,
        });

        if (leveledUp) {
          const levelUpMessage = `🎉 Level Up! ${updatedCharacter.name} has reached level ${updatedCharacter.level} and gained 5 attribute points!`;

          return {
            success: [`Quest completed. You got ${data.reward}`, levelUpMessage],
            type: resultType,
            data: data
          };
        }

        return {
          success: ["Progress completed."],
          type: resultType,
          data: data
        };
      }

      return {
        success: ["Progress updated."],
        type: resultType,
        data: updatedQuest
      };
    }

    if (type === 'cancel') {
      if (quest.status !== 'IN_PROGRESS') {
        return { error: "Only IN_PROGRESS quests can be cancelled." };
      }

      const updatedQuest = await db.quest.update({
        where: { id: questId },
        data: {
          status: 'FAILED',
          failedDate: new Date(),
          reason: "Cancelled by player",
        },
        include: { itemsRewarded: true }
      });

      const { itemsRewarded, ...data } = updatedQuest;

      for (const rewardItem of itemsRewarded) {
        await db.item.update({
          where: { id: rewardItem.id },
          data: {
            quantity: { increment: rewardItem.quantity },
            status: 'FAILED'
          },
        });
      }

      return {
        success: ["Quest has been cancelled."],
        type: "failed" as const,
        data: data
      };
    }

    return { error: "Invalid action type." };

  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}, "updateQuest");

export default function QuestsLayout() {
  const [activeTab, setActiveTab] = createSignal<QuestStatus>('AVAILABLE');

  const questsData = createAsync(() => getQuestsData());
  const character = createAsync(() => getUserCharacter());

  const updateQuestAction = useAction(updateQuest);
  const [searchParams] = useSearchParams();
  const toast = useToast();

  return (
    <Layout>
      <div class="container mx-auto h-full flex flex-col px-4 py-8">
        <h1 class="text-3xl font-bold text-center text-blue-400 mb-8">Quest Board</h1>

        <Show
          when={questsData()}
          fallback={(
            <div class="flex-1 flex justify-center items-center">
              <LoadingSpinner size="large" message="Please wait..." />
            </div>
          )}
        >
          {(quests) => (
            <>
              <div class="mb-4">
                <A href="/quest/create">
                  <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">
                    Create Quest
                  </button>
                </A>
              </div>

              <div class="flex gap-2 overflow-x-auto mb-6 bg-gray-800 rounded-lg p-1">
                <For each={questTabs}>
                  {(tab) => (
                    <button
                      onClick={() => setActiveTab(tab.value)}
                      class={cn(
                        "flex-1 min-w-[120px] py-2 px-4 rounded-md text-sm font-medium",
                        activeTab() === tab.value
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      )}
                    >
                      {tab.label}
                      <span class={cn(
                        "ml-2 px-1.5 py-0.5 rounded-full text-xs",
                        activeTab() === tab.value
                          ? 'bg-blue-800 text-blue-200'
                          : 'bg-gray-700 text-gray-400'
                      )}>
                        {quests()[tab.value].length}
                      </span>
                    </button>
                  )}
                </For>
              </div>

              <Show when={searchParams.create_quest === 'success'}>
                <div class="mb-4">
                  <SuccessAlert
                    message="Great, new quest created🔥"
                  />
                </div>
              </Show>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <For each={quests()[activeTab()]}>
                  {(quest) => (
                    <div class="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                      <div class={cn("p-1", {
                        'bg-gray-600': quest.difficulty === 'E',
                        'bg-green-800': quest.difficulty === 'D',
                        'bg-blue-800': quest.difficulty === 'C',
                        'bg-purple-800': quest.difficulty === 'B',
                        'bg-red-800': quest.difficulty === 'A',
                      })} />
                      <div class="p-5 h-full flex flex-col justify-between">
                        <div>
                          <div class="flex items-start justify-between mb-3">
                            <h3 class="text-lg font-medium text-gray-200">{quest.title}</h3>
                            <span class={cn("text-xs font-bold px-2 py-1 rounded whitespace-nowrap", {
                              'bg-gray-700 text-gray-300': quest.difficulty === 'E',
                              'bg-green-900 text-green-300': quest.difficulty === 'D',
                              'bg-blue-900 text-blue-300': quest.difficulty === 'C',
                              'bg-purple-900 text-purple-300': quest.difficulty === 'B',
                              'bg-red-900 text-red-300': quest.difficulty === 'A',
                            })}>
                              Rank {quest.difficulty}
                            </span>
                          </div>
                          <p class="text-sm text-gray-400 mb-4">{quest.description}</p>

                          <Show when={activeTab() === 'IN_PROGRESS'}>
                            <div class="mb-4">
                              <div class="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{quest.progress}%</span>
                              </div>
                              <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full" style={{ width: `${quest.progress}%` }} />
                              </div>
                            </div>
                          </Show>

                          <div class="flex flex-wrap gap-2 mb-4">
                            <div class="bg-gray-700 rounded-lg px-3 py-1 text-xs text-gray-300">
                              <span class="font-bold text-blue-400 mr-1">Reward:</span> {quest.reward}
                            </div>
                            <Show when={quest.completedDate}>
                              <div class="bg-gray-700 rounded-lg px-3 py-1 text-xs text-gray-300">
                                <span class="font-bold text-green-400 mr-1">Completed:</span>
                                {formatDistanceToNow(new Date(quest.completedDate!), { addSuffix: true })}
                              </div>
                            </Show>

                            <Show when={quest.failedDate}>
                              <div class="bg-gray-700 rounded-lg px-3 py-1 text-xs text-gray-300">
                                <span class="font-bold text-red-400 mr-1">Failed:</span>
                                {formatDistanceToNow(new Date(quest.failedDate!), { addSuffix: true })}
                              </div>
                            </Show>
                          </div>
                        </div>

                        <div>
                          <Show when={activeTab() === 'AVAILABLE'}>
                            <button
                              class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                              onclick={async () => {
                                const res = await updateQuestAction(quest.id, 'accept');
                                if (res.success) {
                                  toast.success(res.success[0]);
                                } else if (res.error) {
                                  toast.error(res.error);
                                }
                              }}
                            >
                              Accept Quest
                            </button>
                          </Show>

                          <Show when={activeTab() === 'IN_PROGRESS'}>
                            <div class="flex gap-2">
                              <button
                                class="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
                                onclick={async () => {
                                  const res = await updateQuestAction(quest.id, 'progress');
                                  if (res.success) {
                                    res.success.forEach(async (message, index) => {
                                      if (index === 1) {
                                        toast.levelUp(message);
                                      } else toast.success(message);
                                      await new Promise(resolve => setTimeout(resolve, 500));
                                    });
                                  } else if (res.error) {
                                    toast.error(res.error);
                                  }
                                }}
                              >
                                Update Progress
                              </button>
                              <button
                                class="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium"
                                onclick={async () => {
                                  const res = await updateQuestAction(quest.id, 'cancel');
                                  if (res.success) {
                                    toast.warning(res.success[0]);
                                  } else if (res.error) {
                                    toast.error(res.error);
                                  }
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </Show>

                          <Show when={quest.reason}>
                            <div class="p-3 border border-red-700 bg-red-900/30 rounded-lg text-sm text-red-300">
                              <p class="font-semibold">Reason for Failure:</p>
                              <p>{quest.reason}</p>
                            </div>
                          </Show>
                        </div>
                      </div>
                    </div>
                  )}
                </For>

                <Show when={quests()[activeTab()].length === 0}>
                  <div class="col-span-full text-center text-gray-400 py-12">
                    <p class="text-lg font-medium">No quests currently in this category.</p>
                  </div>
                </Show>
              </div>
            </>
          )}
        </Show>
      </div>
    </Layout>
  );
}