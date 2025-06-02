import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, onCleanup } from "solid-js";
import { checkUserCharacter } from "~/lib/route-data";

export default function CheckingLayout() {
  const navigate = useNavigate();
  const [scanProgress, setScanProgress] = createSignal(0);
  const [scanningStage, setScanningStage] = createSignal("Initializing scan...");

  createEffect(async () => {
    const scanningStages = [
      "Initializing scan...",
      "Verifying identity...",
      "Analyzing hunter status...",
      "Scanning for shadow compatibility...",
      "Checking past dungeon records...",
      "Evaluating rank eligibility...",
      "Finalizing assessment..."
    ];

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            try {
              
              const result = await checkUserCharacter();
              
              if (result.hasCharacter) {
                navigate('/');
              } else {
                navigate('/character/create');
              }
            } catch (error) {
              console.error('Error checking character:', error);
              navigate('/500');
            }
          }, 1500);
          return 100;
        }

        const stageIndex = Math.min(
          Math.floor((prev / 100) * scanningStages.length),
          scanningStages.length - 1
        );
        setScanningStage(scanningStages[stageIndex]);

        return prev + 1.5;
      });
    }, 100);

    onCleanup(() => clearInterval(interval));
  });

  return (
    <div class="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4">
      <div class="max-w-md w-full space-y-12 text-center">
        {/* Scanning Animation */}
        <div class="relative mx-auto w-64 h-64">
          {/* Pulsing Effects */}
          <div class="absolute inset-0 rounded-full bg-blue-500/10 animate-ping opacity-20" style="animation-duration: 2s;"></div>
          <div class="absolute inset-0 rounded-full bg-blue-500/10 animate-ping opacity-20" style="animation-duration: 3s; animation-delay: 0.5s;"></div>

          {/* Rotating Borders */}
          <div class="absolute inset-0 rounded-full border-2 border-blue-500/30">
            <div class="absolute -top-1 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2"></div>
          </div>
          <div class="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" style="animation-duration: 3s;"></div>
          <div class="absolute inset-0 rounded-full border-2 border-transparent border-l-blue-400 animate-spin" style="animation-duration: 5s;"></div>

          {/* Scanner Line */}
          <div class="absolute inset-0 overflow-hidden rounded-full">
            <div
              class="absolute left-0 right-0 top-0 h-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent animate-scanner"
              style="height: 30%; animation: scanner 3s ease-in-out infinite;"
            ></div>
          </div>

          {/* Center Icon */}
          <div class="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-blue-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          {/* Dots */}
          <div class="absolute w-full h-full animate-spin" style="animation-duration: 8s;">
            <div class="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full transform -translate-x-1/2"></div>
          </div>
          <div class="absolute w-full h-full animate-spin" style="animation-duration: 12s; animation-direction: reverse;">
            <div class="absolute bottom-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2"></div>
          </div>
        </div>

        <div>
          <h1 class="text-3xl font-bold text-blue-400 mb-3">Scanning Hunter Profile</h1>
          <p class="text-gray-400 mb-6">Please wait while the system analyzes your status</p>

          {/* Scanning Stage */}
          <div class="text-sm text-blue-300 mb-4 h-6 flex items-center justify-center">
            {scanningStage()}
          </div>

          {/* Progress Bar */}
          <div class="w-full bg-gray-800 rounded-full h-2.5 mb-6">
            <div
              class="bg-gradient-to-r from-blue-600 to-blue-400 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress()}%` }}
            ></div>
          </div>

          <div class="text-gray-500 text-sm">
            <p>The system will automatically redirect after scanning is complete</p>
            <p class="mt-2">S-Rank Certification Progress: {scanProgress().toFixed(0)}%</p>
          </div>
        </div>

        <div class="border-t border-gray-800 pt-6">
          <p class="text-sm text-gray-600">
            "Only those who have passed the test are worthy of entering the gates."
          </p>
        </div>
      </div>

      {/* Custom Animation Keyframes */}
      <style>
        {`
          @keyframes scanner {
            0%, 100% { transform: translateY(-100%); opacity: 0; }
            50% { transform: translateY(100%); opacity: 0.8; }
          }
        `}
      </style>
    </div>
  );
}