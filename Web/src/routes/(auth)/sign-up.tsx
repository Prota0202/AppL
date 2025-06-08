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

          {/*  Formulaire HTML natif qui fonctionne SANS JavaScript */}
          <form action={register} method="post" class="space-y-6 mt-8">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                class="mt-1 w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your hunter name"
                minlength="3"
              />
              <p class="mt-1 text-xs text-gray-500">Minimum 3 characters</p>
            </div>

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
                placeholder="email@chasseur.com"
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
                minlength="6"
                class="mt-1 w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
              <p class="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minlength="6"
                class="mt-1 w-full px-3 py-2 border border-gray-700 bg-gray-700 text-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            {/*  Validation côté client HTML5 + côté serveur */}
            <noscript>
              <div class="p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
                <p class="text-blue-200 text-sm">
                  💡 Make sure your passwords match and meet the requirements above.
                </p>
              </div>
            </noscript>

            <Show when={submission.error || submission.result?.error}>
              <ErrorAlert
                message={submission.error?.message || submission.result?.error}
              />
            </Show>

            {/*  Bouton de soumission HTML natif */}
            <button
              type="submit"
              class="w-full py-2 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submission.pending}
            >
              {submission.pending ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/*  Lien HTML classique vers login */}
          <p class="mt-4 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <A href="/login" class="text-blue-400 hover:text-blue-500">
              Sign in here
            </A>
          </p>

          {/*  Informations importantes pour les utilisateurs */}
          <div class="mt-6 p-4 bg-gray-750 rounded-lg border border-gray-600">
            <h3 class="text-sm font-medium text-gray-200 mb-2">Account Requirements:</h3>
            <ul class="text-xs text-gray-400 space-y-1">
              <li>• Name: At least 3 characters</li>
              <li>• Email: Valid email address</li>
              <li>• Password: Minimum 6 characters</li>
              <li>• Unique email (not already registered)</li>
            </ul>
          </div>

          <noscript>
            <div class="mt-6 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
              <p class="text-yellow-200 text-sm">
                ⚠️ JavaScript is disabled. Registration will work, but make sure to double-check that your passwords match before submitting.
              </p>
            </div>
          </noscript>

          {/*  Information sur le processus */}
          <div class="mt-6 border-t border-gray-700 pt-4">
            <p class="text-xs text-gray-500 text-center">
              After registration, you'll be redirected to login and can create your character.
            </p>
          </div>
        </div>
      </div>

      <script>
        {`
          // Progressive enhancement: validation côté client si JS activé
          document.addEventListener('DOMContentLoaded', function() {
            const form = document.querySelector('form');
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            
            if (form && password && confirmPassword) {
              form.addEventListener('submit', function(e) {
                if (password.value !== confirmPassword.value) {
                  e.preventDefault();
                  alert('Passwords do not match!');
                  confirmPassword.focus();
                  return false;
                }
                
                if (password.value.length < 6) {
                  e.preventDefault();
                  alert('Password must be at least 6 characters long!');
                  password.focus();
                  return false;
                }
              });
              
              // Visual feedback when passwords match
              confirmPassword.addEventListener('input', function() {
                if (password.value && confirmPassword.value) {
                  if (password.value === confirmPassword.value) {
                    confirmPassword.style.borderColor = '#10B981';
                  } else {
                    confirmPassword.style.borderColor = '#EF4444';
                  }
                }
              });
            }
          });
        `}
      </script>
    </>
  );
}