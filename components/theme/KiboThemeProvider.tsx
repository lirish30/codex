'use client';

import { ReactNode, useEffect } from 'react';
import { KiboProvider } from '@kibocommerce/kiboui';

type KiboThemeProviderProps = {
  children: ReactNode;
};

export const KiboThemeProvider = ({ children }: KiboThemeProviderProps) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'kibo-dark');
  }, []);

  return <KiboProvider colorMode="dark">{children}</KiboProvider>;
};
