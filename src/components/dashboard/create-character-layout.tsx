import { action, useNavigate, useSubmission, createAsync } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { redirect } from "@solidjs/router";
import { ErrorAlert } from "~/components/error-alert";
import LoadingSpinner from "~/components/loading";
import db from "~/lib/db";
import { cn } from "~/lib/utils";
import { characterSchema } from "~/lib/validation";
import { checkUserCharacter } from "~/lib/route-data";

const createCharacter = action(async (
  userId: number,
  remainingPoints: number,
  formData: FormData
) => {
  "use server";

  const raw = {
    name: formData.get("name"),
    class: formData.get("class"),
    strength: +formData.get("strength")!,
    intelligence: +formData.get("intelligence")!,
    endurance: +formData.get("endurance")!,
    remainingPoints
  };

  const parsed = characterSchema.safeParse(raw);

  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
    return { error: errorMessages };
  }

  try {
    await db.character.create({
      data: {
        name: parsed.data.name,
        class: parsed.data.class,
        endurance: parsed.data.endurance,
        strength: parsed.data.strength,
        intelligence: parsed.data.intelligence,
        userId,
        maxLevelReached: 100
      },
    });
  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred. Please try again." };
  }

  throw redirect('/?create_character=success');
}, "createCharacter");

export default function CreateCharacterLayout() {
  const submission = useSubmission(createCharacter);
  const navigate = useNavigate();
  
  // Utilise createAsync pour vérifier si l'utilisateur a déjà un personnage
  const userCheck = createAsync(async () => {
    const result = await checkUserCharacter();
    if (result.hasCharacter) {
      navigate('/');
    }
    return result;
  });

  const [character, setCharacter] = createSignal({
    name: "",
    class: "WARRIOR",
    strength: 5,
    intelligence: 5,
    endurance: 5,
    remainingPoints: 5,
  });

  const handleAttributeChange = (attribute: string, value: number) => {
    const c = character();
    const newValue = +c[attribute as keyof typeof c] + value;
    if (value > 0 && c.remainingPoints <= 0) return;
    if (newValue < 5) return;

    setCharacter({
      ...c,
      [attribute]: newValue,
      remainingPoints: c.remainingPoints - value,
    });
  };

  return (
    <div class="bg-gray-900">
      <div class="container mx-auto min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <Show when={userCheck()} fallback={<LoadingSpinner message="Please wait!..." size="large" />}>
          {(data) => (
            <>
              <h1 class="text-3xl font-bold text-center text-blue-400 mb-8">Create Your Character</h1>

              <form
                action={createCharacter.with(data().userId, character().remainingPoints)}
                method="post"
                class="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6"
              >
                <div class="mb-6">
                  <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
                    Character Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={character().name}
                    onInput={(e) =>
                      setCharacter({ ...character(), name: e.currentTarget.value })
                    }
                    class="w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your character's name"
                  />
                </div>

                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-300 mb-2">Class</label>
                  <input
                    type="hidden"
                    name="class"
                    value={`${character().class}`}
                  />
                  <div class="grid grid-cols-3 gap-4">
                    {["WARRIOR", "MAGE", "ROGUE"].map((classType) => (
                      <button
                        type="button"
                        class={cn(
                          "p-4 rounded-lg border-2 transition",
                          character().class === classType
                            ? "border-blue-500 bg-gray-700"
                            : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                        )}
                        onClick={() =>
                          setCharacter({ ...character(), class: classType })
                        }
                      >
                        <div class="text-center">
                          <div
                            class={cn(
                              "text-xl font-bold",
                              character().class === classType
                                ? "text-blue-400"
                                : "text-gray-400"
                            )}
                          >
                            {{
                              WARRIOR: "Warrior",
                              MAGE: "Mage",
                              ROGUE: "Rogue",
                            }[classType]}
                          </div>
                          <p class="text-xs text-gray-400 mt-2">
                            {{
                              WARRIOR: "Specialized in defense and physical attacks",
                              MAGE: "Specialized in magic and intelligence",
                              ROGUE: "Specialized in speed and agility",
                            }[classType]}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div class="mb-6">
                  <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-medium text-gray-300">Attributes</label>
                    <span class="text-sm text-blue-400">
                      Points Remaining: {character().remainingPoints}
                    </span>
                  </div>

                  <div class="space-y-4">
                    {[
                      {
                        name: "Strength",
                        key: "strength",
                        description:
                          "Increases physical damage and carry capacity",
                      },
                      {
                        name: "Intelligence",
                        key: "intelligence",
                        description:
                          "Boosts magic damage and reduces skill cooldown",
                      },
                      {
                        name: "Endurance",
                        key: "endurance",
                        description: "Improves HP and defense",
                      },
                    ].map((attribute) => (
                      <div class="bg-gray-700 rounded-lg p-4">
                        <div class="flex justify-between items-center mb-2">
                          <div>
                            <h3 class="font-medium text-gray-200">
                              {attribute.name}
                            </h3>
                            <p class="text-xs text-gray-400">
                              {attribute.description}
                            </p>
                          </div>
                          <div class="flex items-center space-x-3">
                            <button
                              type="button"
                              class="w-8 h-8 rounded-full bg-gray-600 text-gray-200 flex items-center justify-center hover:bg-gray-500"
                              onClick={() =>
                                handleAttributeChange(attribute.key, -1)
                              }
                            >
                              -
                            </button>
                            <input
                              type="hidden"
                              name={attribute.key}
                              value={`${character()[attribute.key as 'strength' | 'intelligence' | 'endurance']}`}
                            />
                            <span class="text-lg font-bold text-blue-400 w-8 text-center">
                              {character()[attribute.key as 'strength' | 'intelligence' | 'endurance']}
                            </span>
                            <button
                              type="button"
                              class={cn(
                                "w-8 h-8 rounded-full text-gray-200 flex items-center justify-center",
                                character().remainingPoints > 0
                                  ? "bg-blue-600 hover:bg-blue-500"
                                  : "bg-gray-600 cursor-not-allowed"
                              )}
                              onClick={() =>
                                handleAttributeChange(attribute.key, 1)
                              }
                              disabled={character().remainingPoints <= 0}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Show when={submission.error || submission.result?.error}>
                  <ErrorAlert
                    message={submission.error?.message || submission.result?.error}
                  />
                </Show>

                <div class="mt-8">
                  <button
                    type="submit"
                    disabled={!character().name.trim() || submission.pending}
                    class={cn(
                      "w-full py-3 px-4 rounded-md font-medium text-white",
                      character().name.trim()
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-600 cursor-not-allowed"
                    )}
                  >
                    {submission.pending ? 'Loading...' : 'Create Character'}
                  </button>
                </div>
              </form>
            </>
          )}
        </Show>
      </div>
    </div>
  );
}