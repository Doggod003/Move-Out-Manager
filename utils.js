@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  body {
    font-feature-settings: 'cv11', 'ss01', 'ss03';
  }
  ::selection {
    background-color: theme('colors.brand.200');
    color: theme('colors.brand.900');
  }
  /* Custom scrollbar */
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: theme('colors.ink.200'); border-radius: 99px; border: 2px solid theme('colors.ink.50'); }
  ::-webkit-scrollbar-thumb:hover { background: theme('colors.ink.300'); }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-primary {
    @apply btn bg-ink-900 text-white px-4 py-2.5 hover:bg-ink-800 shadow-sm hover:shadow;
  }
  .btn-brand {
    @apply btn bg-brand-600 text-white px-4 py-2.5 hover:bg-brand-700 shadow-sm hover:shadow;
  }
  .btn-secondary {
    @apply btn bg-white text-ink-700 px-4 py-2.5 border border-ink-200 hover:border-ink-300 hover:bg-ink-50;
  }
  .btn-ghost {
    @apply btn text-ink-600 px-3 py-2 hover:bg-ink-100;
  }
  .btn-sm { @apply px-3 py-1.5 text-sm; }
  .btn-xs { @apply px-2.5 py-1 text-xs; }

  .input {
    @apply w-full px-3 py-2 bg-white text-ink-900 border border-ink-200 rounded-lg text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all;
  }
  .label {
    @apply text-xs font-medium text-ink-600 uppercase tracking-wider;
  }
  .card {
    @apply bg-white border border-ink-200 rounded-xl;
  }
  .badge {
    @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium;
  }
  .ai-dot {
    @apply inline-block w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-dot;
  }
}
