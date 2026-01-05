import React from "react";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import GoogleAnalyticsInit from "@/lib/ga";
import { fontVariables } from "@/lib/fonts";
import NextTopLoader from "nextjs-toploader";
import type { Metadata } from "next";

import "./globals.css";

import { ActiveThemeProvider } from "@/components/shared/active-theme";
import { DEFAULT_THEME } from "@/lib/themes";
import { ClientProviders } from "@/components/providers/client-providers";
import { DevTools } from "@/components/dev-tools";
import { APP_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: APP_CONFIG.NAME,
  description: `${APP_CONFIG.COMPANY_NAME} ${APP_CONFIG.DESCRIPTION}`,
  icons: {
    icon: APP_CONFIG.LOGO_PATH,
    shortcut: APP_CONFIG.LOGO_PATH,
    apple: APP_CONFIG.LOGO_PATH,
  },
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeSettings = {
    preset: (cookieStore.get("theme_preset")?.value ?? DEFAULT_THEME.preset) as any,
    scale: (cookieStore.get("theme_scale")?.value ?? DEFAULT_THEME.scale) as any,
    radius: (cookieStore.get("theme_radius")?.value ?? DEFAULT_THEME.radius) as any,
    contentLayout: (cookieStore.get("theme_content_layout")?.value ??
      DEFAULT_THEME.contentLayout) as any
  };

  const bodyAttributes = Object.fromEntries(
    Object.entries(themeSettings)
      .filter(([_, value]) => value)
      .map(([key, value]) => [`data-theme-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value])
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn("bg-background group/layout font-sans", fontVariables)}
        {...bodyAttributes}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <ActiveThemeProvider initialTheme={themeSettings}>
            <ClientProviders>
              {children}
              {process.env.NODE_ENV === "production" ? <GoogleAnalyticsInit /> : null}
              {process.env.NODE_ENV === "development" ? <DevTools /> : null}
            </ClientProviders>
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
