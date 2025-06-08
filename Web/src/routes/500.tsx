import { For } from 'solid-js';
import { A } from '@solidjs/router';

export default function Error500Page() {
  return (
    <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div class="max-w-3xl w-full text-center">
        {/* Glitchy Icon Container */}
        <div class="relative mx-auto w-64 h-64 mb-8">
          {/* Background Shattered Effect */}
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-full h-full relative">
              {/* Red Warning Pulse */}
              <div class="absolute inset-0 bg-red-900/20 rounded-full animate-pulse"></div>

              {/* Fragments - Representing a dungeon collapse */}
              <For each={Array.from({ length: 12 })}>
                {(_, i) => (
                  <div
                    class="absolute bg-gray-700"
                    style={{
                      width: `${Math.random() * 30 + 10}px`,
                      height: `${Math.random() * 30 + 10}px`,
                      top: `${Math.random() * 80 + 10}%`,
                      left: `${Math.random() * 80 + 10}%`,
                      opacity: Math.random() * 0.5 + 0.3,
                      transform: `rotate(${Math.random() * 360}deg)`,
                      animation: `float${i() % 3 + 1} ${Math.random() * 3 + 2}s infinite ease-in-out`
                    }}
                  ></div>
                )}
              </For>
            </div>
          </div>

          {/* Error Symbol */}
          <div class="absolute inset-0 flex items-center justify-center animate-glitch">
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>

              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-4xl font-bold text-white">500</span>
              </div>

              {/* Glitch Effect Overlay */}
              <div class="absolute inset-0 flex items-center justify-center opacity-0 animate-glitch-2" style="animation-delay: 0.1s;">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Flickering Particles */}
          <For each={Array.from({ length: 5 })}>
            {() => (
              <div
                class="absolute bg-red-500 rounded-full animate-flicker"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  "animation-duration": `${Math.random() * 2 + 0.5}s`,
                  "animation-delay": `${Math.random() * 0.5}s`
                }}
              ></div>
            )}
          </For>
        </div>

        <h1 class="text-5xl md:text-6xl font-bold text-red-500 mb-4">Dungeon Collapse</h1>

        <div class="mb-8">
          <p class="text-gray-300 text-xl mb-3">A system error has occurred in the gate.</p>
          <p class="text-gray-400">The Hunter Association is working to restore stability.</p>
          <p class="text-gray-400 mt-2">Error Code: <span class="font-mono text-red-400">500 (Internal Server Error)</span></p>
        </div>

        <div class="space-y-4">
          <div class="flex justify-center">
            <A
              href="/"
              class="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md font-medium text-lg transition flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Return to Home
            </A>
          </div>
        </div>

        <div class="mt-12 border-t border-gray-800 pt-6">
          <p class="text-gray-500">
            "Even the strongest hunters must retreat when the dungeon becomes unstable." — Hunter's Manual
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes glitch {
          0%, 100% { transform: translate(0, 0); filter: hue-rotate(0deg); }
          20% { transform: translate(-5px, 5px); filter: hue-rotate(70deg); }
          40% { transform: translate(-5px, -5px); }
          60% { transform: translate(5px, 5px); }
          80% { transform: translate(5px, -5px); filter: hue-rotate(-70deg); }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes float1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        @keyframes float2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }

        @keyframes float3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(10deg); }
        }

        .animate-glitch {
          animation: glitch 2s infinite;
        }

        .animate-glitch-2 {
          animation: glitch 2.5s infinite;
        }

        .animate-flicker {
          animation: flicker 3s infinite;
        }
      `}</style>
    </div>
  );
}
