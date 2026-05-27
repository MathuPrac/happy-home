import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Reserve space for the bottom tab bar */
  withTabBar?: boolean;
}

/** Centered phone-shaped container with safe-area paddings. */
export function MobileShell({ children, withTabBar = false }: Props) {
  return (
    <div className="min-h-dvh w-full bg-background flex justify-center">
      <div
        className="relative w-full max-w-[440px] min-h-dvh bg-background overflow-hidden"
        style={{
          paddingBottom: withTabBar ? "calc(76px + env(safe-area-inset-bottom))" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
