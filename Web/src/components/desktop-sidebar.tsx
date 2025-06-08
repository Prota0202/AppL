import { A, useLocation } from '@solidjs/router';
import { navigationItems } from '~/constants/dummy';
import { cn } from '~/lib/utils';
import { Show, createMemo } from 'solid-js';
import { signOut } from '@auth/solid-start/client';
import LoadingSpinner from './loading';
import { CharacterSidebar } from '~/lib/types';

interface IProps {
  character: () => CharacterSidebar | null | undefined;
}

export default function DesktopSidebar({ character }: IProps) {
  const location = useLocation();
  const pathname = createMemo(() => location.pathname);

  return (
    <Show when={character() !== null}>
      <div class="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-800">
        <div class="flex flex-col grow pt-5 pb-4 overflow-y-auto">
          <div class="flex items-center shrink-0 px-4 mb-5">
            <span class="text-xl font-bold text-blue-400">My Solo Up</span>
          </div>
          
          <Show
            when={character()}
            fallback={(
              <div class="my-10">
                <LoadingSpinner size="small" />
              </div>
            )}
          >
            {(char) => (
              <div class="px-4 mb-6">
                <h4 class="text-sm font-medium text-gray-300">
                  Hello, {char().userName}!
                </h4>
                <div class="bg-gray-700 rounded-lg p-4 mt-2">
                  <div class="flex items-center">
                    <div
                      class={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center mr-3',
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
                      <div class="font-medium">{char().name}</div>
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
                </div>
              </div>
            )}
          </Show>

          <nav class="mt-5 flex-1 px-4 space-y-1">
            {navigationItems.map((item) => (
              <A
                href={item.path}
                class={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                  pathname() === item.path
                    ? 'bg-gray-900 text-blue-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <div
                  class={cn(
                    'mr-3',
                    pathname() === item.path
                      ? 'text-blue-400'
                      : 'text-gray-400 group-hover:text-gray-300'
                  )}
                >
                  {item.icon}
                </div>
                {item.name}
              </A>
            ))}
          </nav>
        </div>

        <div class="p-4 border-t border-gray-700">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            class="w-full p-3 text-xs bg-red-500 text-white rounded cursor-pointer hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </Show>
  );
}