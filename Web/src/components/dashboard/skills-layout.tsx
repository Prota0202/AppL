import { A, action, useAction, useSearchParams, createAsync } from '@solidjs/router';
import { createSignal, For, Show } from 'solid-js';
import { updateCharacterExpAndLevel } from '~/actions/update-character-exp-and-level';
import Layout from '~/components/layout';
import LoadingSpinner from '~/components/loading';
import { SuccessAlert } from '~/components/success-alert';
import { useToast } from '~/components/toast/toast';
import db from '~/lib/db';
import { Skill } from '~/lib/types';
import { getSkillsData, getUserCharacter } from '~/lib/route-data';

const removeSkill = action(async (skillId: number) => {
  "use server";

  try {
    await db.skill.delete({
      where: { id: skillId }
    });

    return { success: 'Skill removed successfully.' }
  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}, "removeSkill");

const upgradeSkill = action(async (skillId: number) => {
  "use server";

  try {
    const skill = await db.skill.findUnique({
      where: { id: skillId },
      include: { character: true }
    });

    if (!skill) {
      return { error: "Skill not found." };
    }

    if (skill.level >= skill.maxLevel) {
      return { error: "Skill has already reached max level." };
    }

    const updatedSkill = await db.skill.update({
      where: { id: skillId },
      data: {
        level: skill.level + 1
      }
    });

    const gainedExp = 20;

    const { updatedCharacter, leveledUp } = await updateCharacterExpAndLevel({
      character: skill.character,
      experienceGained: gainedExp,
    });

    if (leveledUp) {
      const levelUpMessage = `🎉 Level Up! ${updatedCharacter.name} has reached level ${updatedCharacter.level} and gained 5 attribute points!`;

      return {
        success: [`Skill upgraded successfully. (+${gainedExp} EXP)`, levelUpMessage],
        skill: updatedSkill,
      };
    }

    return {
      success: [`Skill upgraded successfully. (+${gainedExp} EXP)`],
      skill: updatedSkill
    };
  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}, "upgradeSkill");

export default function SkillsLayout() {
  const [selectedSkill, setSelectedSkill] = createSignal<Skill | null>(null);

  const skillsData = createAsync(() => getSkillsData());
  const character = createAsync(() => getUserCharacter());

  const removeSkillAction = useAction(removeSkill);
  const upgradeSkillAction = useAction(upgradeSkill);
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const renderSkillCard = (skill: Skill) => {
    const isSelected = () => selectedSkill()?.id === skill.id;
    const progress = () => (skill.level / skill.maxLevel) * 100;

    return (
      <div
        class={`bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition hover:bg-gray-750 ${isSelected() ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => setSelectedSkill(skill)}
      >
        <div class="h-1 bg-blue-600"></div>
        <div class="p-4">
          <div class="flex justify-between items-start mb-3">
            <h3 class="font-medium text-gray-200">{skill.name}</h3>
            <span class="text-xs bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded">
              Lvl {skill.level}/{skill.maxLevel}
            </span>
          </div>
          <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-500 rounded-full"
              style={{ width: `${progress()}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const renderSkillDetail = () => {
    const skill = selectedSkill();
    if (!skill) {
      return (
        <div class="flex flex-col items-center justify-center h-full text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p class="text-center">Select a skill to view details</p>
        </div>
      );
    }

    const progress = (skill.level / skill.maxLevel) * 100;

    return (
      <div class="h-full flex flex-col">
        <h2 class="text-xl font-bold text-gray-200 mb-4">{skill.name}</h2>

        <div class="mb-6">
          <p class="text-sm text-gray-300">
            {skill.description}
          </p>
          <div class="mb-2 mt-3 flex justify-between">
            <span class="text-sm text-gray-400">Level {skill.level}</span>
            <span class="text-sm text-gray-400">Max Level {skill.maxLevel}</span>
          </div>
          <div class="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-400 mb-2">Statistics</h3>
          <div class="bg-gray-700 rounded-md p-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-xs text-gray-400 mb-1">Skill ID</div>
                <div class="text-sm font-medium text-blue-400">#{skill.id}</div>
              </div>
              <div>
                <div class="text-xs text-gray-400 mb-1">Current Level</div>
                <div class="text-sm font-medium text-blue-400">{skill.level}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <button
            class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            disabled={selectedSkill()?.level! >= selectedSkill()?.maxLevel!}
            onclick={async () => {
              if (selectedSkill()) {
                const data = await upgradeSkillAction(selectedSkill()?.id!);
                if (data.success && data.skill) {
                  // Update selectedSkill
                  setSelectedSkill(data.skill);

                  data.success.forEach(async (message, index) => {
                    if (index === 1) {
                      toast.levelUp(message);
                    } else toast.success(message);
                    await new Promise(resolve => setTimeout(resolve, 500));
                  });
                } else if (data.error) {
                  toast.error(data.error);
                }
              }
            }}
          >
            Upgrade Skill
          </button>
          <button
            class="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium"
            onclick={async () => {
              if (selectedSkill()) {
                const data = await removeSkillAction(selectedSkill()?.id!);
                if (data.success) {
                  setSelectedSkill(null);
                  toast.warning(data.success);
                } else if (data.error) {
                  toast.error(data.error)
                };
              }
            }}
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center text-blue-400 mb-8">Skills</h1>

        <div class="mb-4">
          <A href="/skill/create">
            <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium cursor-pointer">
              Add Skill
            </button>
          </A>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2">
            <div class="bg-gray-800 rounded-xl shadow-lg p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-gray-200">Skill List</h2>
                <Show when={skillsData()}>
                  <div class="bg-blue-900/30 px-3 py-1 rounded-full">
                    <span class="text-sm text-blue-300">Total: {skillsData()!.length} skills</span>
                  </div>
                </Show>
              </div>
              <Show when={searchParams.create_skill === 'success'}>
                <div class="mb-4">
                  <SuccessAlert
                    message="Badass... New skill unlocked!"
                  />
                </div>
              </Show>
              <Show
                when={skillsData()}
                fallback={(
                  <div class="py-10">
                    <LoadingSpinner size="medium" />
                  </div>
                )}
              >
                {(skills) => (
                  <Show when={skills().length > 0} fallback={
                    <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p class="text-lg font-medium">You don't have any skills yet</p>
                    </div>
                  }>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <For each={skills()}>{renderSkillCard}</For>
                    </div>
                  </Show>
                )}
              </Show>
            </div>
          </div>

          <div class="lg:col-span-1">
            <div class="bg-gray-800 rounded-xl shadow-lg p-6 h-full min-h-[400px]">
              <h2 class="text-xl font-bold text-gray-200 mb-6">Skill Details</h2>
              {renderSkillDetail()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}