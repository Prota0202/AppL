import { A, action, useSubmission } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import { ErrorAlert } from "~/components/error-alert";
import { Show } from "solid-js";
import { registerSchema } from "~/lib/validation";
import db from "~/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "solid-start/server";

const register = action(async (formData: FormData) => {
  "use server";

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
    return { error: errorMessages };
  }

  const { name, email, password } = parsed.data;

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "Email is already registered." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        provider: 'CREDENTIALS'
      },
    });
  } catch (err) {
    console.error(err);
    return { error: "An unexpected error occurred. Please try again." };
  }

  throw redirect('/login?signup=success');
}, "register");

export default function SignUpPage() {
  const submission = useSubmission(register);

  return (
    <>
      <Title>Register | Dungeon</Title>
      <Meta name="description" content="Create your hunter account to start the adventure." />

      <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div class="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
          <div class="text-center">
            <h2 class="text-3xl font-bold text-blue-400">Register New Hunter</h2>
            <p class="mt-2 text-sm text-gray-400">Begin your adventure now</p>
          </div>

          <form action={register} method="post" class="space-y-6 mt-8">
            <div>
              <label for="name" class="text-sm font-medium text-gray-300">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                class="mt-1 w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your hunter name"
              />
            </div>

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
              {submission.pending ? 'Loading...' : 'Sign Up'}
            </button>
          </form>

          <p class="mt-4 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <A href="/login" class="text-blue-400 hover:text-blue-500">
              Sign in here
            </A>
          </p>
        </div>
      </div>
    </>
  );
}
