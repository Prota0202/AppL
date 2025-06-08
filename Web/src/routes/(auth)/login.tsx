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

    if (user.provider === 'GITHUB') {
      return { error: "Your account is connected via GitHub sign-in." };
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
          <form action={login} method="post" class="space-y-6 mt-8">
            <div>
              <label for="email" class="text-sm font-medium text-gray-300">Email</label>
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
              <label for="password" class="text-sm font-medium text-gray-300">Password</label>
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

            <button
              type="submit"
              class="w-full py-2 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              disabled={submission.pending}
            >
              {submission.pending ? 'Loading...' : 'Sign In'}
            </button>
          </form>

          <p class="mt-4 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <A href="/sign-up" class="text-blue-400 hover:text-blue-500">
              Sign up here
            </A>
          </p>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-700"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-gray-800 text-gray-400">Or sign in with</span>
              </div>
            </div>

            <div class="mt-6">
              <button
                onClick={() => {
                  signIn('github', {
                    redirect: true,
                    redirectTo: '/checking'
                  })
                }}
                class="w-full flex items-center justify-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
              >
                <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
