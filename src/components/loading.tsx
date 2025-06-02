import { JSX } from 'solid-js';
import { cn } from '~/lib/utils';

type LoadingSpinnerProps = {
  size?: 'small' | 'medium' | 'large' | 'full';
  overlay?: boolean;
  message?: string;
  showMessage?: boolean;
  transparent?: boolean;
};

const LoadingSpinner = ({
  size = 'medium',
  overlay = false,
  message = 'Loading...',
  showMessage = true,
  transparent = false
}: LoadingSpinnerProps): JSX.Element => {
  const dimensions = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
    full: 'w-32 h-32'
  };

  const padding = {
    small: 'p-2',
    medium: 'p-4',
    large: 'p-6',
    full: 'p-8'
  };

  const LoadingContent = () => (
    <div class={cn('flex flex-col items-center justify-center', !overlay && padding[size])}>
      <div class={cn('relative', dimensions[size])}>
        {/* Outer rotating circle */}
        <div
          class="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"
          style={{ 'animation-duration': '1s' }}
        ></div>

        {/* Inner rotating circle */}
        <div
          class="absolute inset-1 rounded-full border-2 border-transparent border-b-blue-400 animate-spin"
          style={{ 'animation-duration': '1.5s', 'animation-direction': 'reverse' }}
        ></div>

        {/* Center pulse effect */}
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-1/3 h-1/3 bg-blue-500 rounded-full animate-pulse"></div>
        </div>

        {/* Orbiting particles */}
        <div class="absolute w-full h-full animate-spin" style={{ 'animation-duration': '3s' }}>
          <div class="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full transform -translate-x-1/2"></div>
        </div>
        <div
          class="absolute w-full h-full animate-spin"
          style={{ 'animation-duration': '4s', 'animation-direction': 'reverse' }}
        >
          <div class="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full transform -translate-x-1/2"></div>
        </div>
      </div>

      {showMessage && size !== 'small' && (
        <div class="mt-4 text-center">
          <p class={cn(
            'font-medium text-blue-400',
            size === 'full' ? 'text-lg' : 'text-sm'
          )}>
            {message}
          </p>
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div
        class={cn(
          'fixed inset-0 z-50 flex items-center justify-center',
          transparent ? 'bg-gray-900/70' : 'bg-gray-900/90'
        )}
      >
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

export default LoadingSpinner;
