import { JSX, Show } from 'solid-js';
import MobileSidebar from './mobile-sidebar';
import DesktopSidebar from './desktop-sidebar';
import { createAsync } from '@solidjs/router';
import { getSidebarData } from '~/lib/route-data';

interface IProps {
  children: JSX.Element;
}

export default function Layout({ children }: IProps) {

  const character = createAsync(() => getSidebarData());

  return (
    <div class="min-h-screen bg-gray-900 text-gray-100 flex">
      <Show when={character() !== undefined}>
        <DesktopSidebar character={character} />
        <MobileSidebar character={character} />
      </Show>

      <main class={`${character() ? 'md:ml-64' : ''} flex-1 py-6 md:py-12 min-h-screen pt-20 md:pt-0 overflow-hidden`}>
        {children}
      </main>
    </div>
  );
}