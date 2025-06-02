import { A } from "@solidjs/router";

export default function Custom404() {
  return (
    <div class="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <div class="max-w-3xl w-full text-center">
        <div class="relative mb-8 mx-auto w-56 h-56">
          {/* Shadow Circle Animation */}
          <div class="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse"></div>

          {/* Shadow Monarch Symbol */}
          <div class="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-32 w-32 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
            <div class="absolute w-full h-full flex items-center justify-center">
              <span class="text-6xl font-bold text-white">404</span>
            </div>
          </div>

          {/* Orbiting Shadow Particles */}
          <div class="absolute w-full h-full animate-spin" style={{ "animation-duration": '10s' }}>
            <div class="absolute top-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2"></div>
          </div>
          <div class="absolute w-full h-full animate-spin" style={{ "animation-duration": '15s', "animation-direction": 'reverse' }}>
            <div class="absolute top-1/4 right-0 w-2 h-2 bg-blue-400 rounded-full"></div>
          </div>
          <div class="absolute w-full h-full animate-spin" style={{ "animation-duration": '20s' }}>
            <div class="absolute bottom-0 left-1/2 w-4 h-4 bg-blue-600 rounded-full transform -translate-x-1/2"></div>
          </div>
        </div>

        <h1 class="text-5xl md:text-6xl font-bold text-blue-400 mb-4">Dungeon Not Found</h1>

        <div class="mb-8">
          <p class="text-gray-300 text-xl mb-3">It looks like you've entered an area that's not yet unlocked.</p>
          <p class="text-gray-400">The gate you're looking for may have closed, changed, or never existed.</p>
        </div>

        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
            <A href="/" class="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-lg transition">
              Return to Base
            </A>
          </div>
        </div>

        <div class="mt-12 border-t border-gray-800 pt-6">
          <p class="text-gray-500">
            "Rise." — Shadow Hunter
          </p>
        </div>
      </div>
    </div>
  );
}
