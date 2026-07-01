import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
  xl: 'h-16 w-16 border-4',
};

export const Loading: React.FC<LoadingProps> = ({ size = 'md', text, fullScreen = false }) => {
  const spinner = (
    <div
      className={`${sizeMap[size]} animate-spin rounded-full border-blue-600 border-t-transparent`}
      role="status"
      aria-label="Carregando"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
        {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {spinner}
      {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
    </div>
  );
};

export const LoadingOverlay: React.FC<{ text?: string }> = ({ text }) => (
  <Loading fullScreen size="lg" text={text} />
);

export const LoadingInline: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    {text && <span>{text}</span>}
  </div>
);
