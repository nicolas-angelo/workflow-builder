'use client'

import {
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps,
} from 'next-themes'

export type { ThemeProviderProps }

export function ThemeProvider({
  children,
  ...themeProps
}: ThemeProviderProps & { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={[...(themeProps?.themes ?? []), 'dark', 'light']}
      {...themeProps}
      disableTransitionOnChange
      enableColorScheme
    >
      {children}
    </NextThemeProvider>
  )
}

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)'
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)'

const THEME_COLOR_SCRIPT = `
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`

export function ThemeColorScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: THEME_COLOR_SCRIPT }}
      id="theme-script"
    />
  )
}
