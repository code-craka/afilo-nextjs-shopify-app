'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ variant = 'button', showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (variant === 'dropdown') {
    return (
      <div className={`relative inline-block text-left ${className}`}>
        <div className="group">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="theme-menu-button"
            aria-expanded="false"
            aria-haspopup="true"
          >
            {resolvedTheme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            {showLabel && (
              <span className="ml-2 capitalize">
                {theme === 'system' ? 'Auto' : theme}
              </span>
            )}
          </button>

          <div className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 scale-95 transform transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="theme-menu-button">
              <button
                onClick={() => setTheme('light')}
                className={`flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  theme === 'light'
                    ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
                role="menuitem"
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  theme === 'dark'
                    ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
                role="menuitem"
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex w-full items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  theme === 'system'
                    ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
                role="menuitem"
              >
                <Monitor className="mr-2 h-4 w-4" />
                System
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Simple toggle button (cycles through light -> dark -> system)
  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />;
    }
    return resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (theme === 'system') return 'Auto';
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center justify-center rounded-md bg-white dark:bg-gray-800 p-2 text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
    >
      {getIcon()}
      {showLabel && <span className="ml-2 text-sm font-medium">{getLabel()}</span>}
    </button>
  );
}