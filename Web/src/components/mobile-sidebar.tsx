import { A, useLocation } from '@solidjs/router';
import { navigationItems } from '~/constants/dummy';
import { cn } from '~/lib/utils';
import { createSignal, createMemo, Show } from 'solid-js';
import { signOut } from '@auth/solid-start/client';
import { CharacterSidebar } from '~/lib/types';
import LoadingSpinner from './loading';

interface IProps {
  character: () => CharacterSidebar | null | undefined;
}

export default function MobileSidebar({ character }: IProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  const location = useLocation();
  const pathname = createMemo(() => location.pathname);

  return (
    <Show when={character() !== null}>
      <div class="md:hidden fixed top-0 left-0 right-0 z-10 bg-gray-800 border-b border-gray-700">
        <div class="flex items-center justify-between h-16 px-4">
          <span class="text-xl font-bold text-blue-400">Solo Leveling</span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen())}
            class="p-1 rounded-md text-gray-400 hover:text-white focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <Show when={isMobileMenuOpen()}>
          <div class="bg-gray-800 pt-2 pb-3 space-y-1 px-4">
            <h4 class="text-sm font-medium text-gray-300 mb-3">
              Hello, {character()?.userName || 'Guest'}!
            </h4>

            {navigationItems.map((item) => (
              <A
                href={item.path}
                class={cn(
                  'flex items-center px-3 py-2 rounded-md text-base font-medium',
                  pathname() === item.path
                    ? 'bg-gray-900 text-blue-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div
                  class={cn(
                    'mr-3',
                    pathname() === item.path
                      ? 'text-blue-400'
                      : 'text-gray-400'
                  )}
                >
                  {item.icon}
                </div>
                {item.name}
              </A>
            ))}

            <Show
              when={character()}
              fallback={(
                <div class="my-3 pt-2 border-t border-gray-700">
                  <LoadingSpinner size="small" />
                </div>
              )}
            >
              {(char) => (
                <div class="flex items-center px-3 py-4 mt-4 border-t border-gray-700">
                  <div
                    class={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center mr-3',
                      char().class === 'WARRIOR' && 'bg-red-900/30 text-red-400',
                      char().class === 'MAGE' && 'bg-blue-900/30 text-blue-400',
                      char().class === 'ROGUE' && 'bg-green-900/30 text-green-400'
                    )}
                  >
                    {char().class === 'WARRIOR' && 'W'}
                    {char().class === 'MAGE' && 'M'}
                    {char().class === 'ROGUE' && 'R'}
                  </div>
                  <div>
                    <div class="font-medium text-gray-300">
                      {char().name}
                    </div>
                    <div class="text-xs text-gray-400">
                      Lvl {char().level}{' '}
                      {char().class === 'WARRIOR'
                        ? 'Warrior'
                        : char().class === 'MAGE'
                          ? 'Mage'
                          : 'Rogue'}
                    </div>
                  </div>
                </div>
              )}
            </Show>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              class="w-full p-3 text-xs bg-red-500 text-white rounded cursor-pointer hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </Show>
      </div>
    </Show>
  );
}