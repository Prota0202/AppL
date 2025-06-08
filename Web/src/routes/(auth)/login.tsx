import { Title, Meta } from "@solidjs/meta";
import { A, action, useSearchParams, useSubmission } from "@solidjs/router";
import bcrypt from "bcryptjs";
import { createEffect, Show } from "solid-js";
import { ErrorAlert } from "~/components/error-alert";
import { SuccessAlert } from "~/components/success-alert";
import db from "~/lib/db";
import { loginSchema } from "~/lib/validation";
import { signIn } from '@auth/solid-start/client'

const login = action(async (formData: FormData) => {
  "use server";

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
    return { error: errorMessages };
  }

  const { email, password } = parsed.data;

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "Invalid email or password." };
    }

    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) {
      return { error: "Invalid email or password." };
    }

    const character = await db.character.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    return {
      success: true,
      email,
      password,
      isNewUser: !character
    }
  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred. Please try again." };
  }
}, "login");

export default function LoginPage() {
  const submission = useSubmission(login);
  const [searchParams] = useSearchParams();

  createEffect(() => {
    if (submission.result?.success) {
      const { email, password, isNewUser } = submission.result;

      signIn("credentials", {
        email,
        password,
        redirect: true,
        redirectTo: isNewUser ? '/character/create' : '/'
      });
    }
  });

  return (
    <>
      <Title>Login | Dungeon</Title>
      <Meta name="description" content="Sign in to continue your journey in the dungeon." />

      <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div class="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
          <div class="text-center">
            <h2 class="text-3xl font-bold text-blue-400">Enter the Dungeon</h2>
            <p class="mt-2 text-sm text-gray-400">Continue your journey</p>
          </div>
          
          <Show when={searchParams.signup === 'success'}>
            <SuccessAlert
              message="Yay... You have become a member of the dungeon🐲. Please sign in!"
            />
          </Show>

          {/* Formulaire HTML natif qui fonctionne SANS JavaScript */}
          <form action={login} method="post" class="space-y-6 mt-8">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                class="mt-1 w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@dungeon.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                class="mt-1 w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            <Show when={submission.error || submission.result?.error}>
              <ErrorAlert
                message={submission.error?.message || submission.result?.error}
              />
            </Show>

            {/* Bouton de soumission HTML natif */}
            <button
              type="submit"
              class="w-full py-2 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submission.pending}
            >
              {submission.pending ? 'Loading...' : 'Sign In'}
            </button>
          </form>

          {/* Lien HTML classique vers sign-up */}
          <p class="mt-4 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <A href="/sign-up" class="text-blue-400 hover:text-blue-500">
              Sign up here
            </A>
          </p>

          {/* Message informatif pour JavaScript désactivé */}
          <noscript>
            <div class="mt-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
              <p class="text-yellow-200 text-sm">
                ⚠️ JavaScript is disabled. You can still use email/password login, but some features may be limited.
              </p>
            </div>
          </noscript>
        </div>
      </div>
    </>
  );
}