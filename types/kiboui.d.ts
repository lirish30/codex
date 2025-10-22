declare module '@kibocommerce/kiboui' {
  import type React from 'react';
  import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

  export type ColorMode = 'light' | 'dark';

  export const KiboProvider: (props: { colorMode?: ColorMode; children: ReactNode }) => JSX.Element;
  export const useKiboTheme: () => {
    colorMode: ColorMode;
    setColorMode: (mode: ColorMode) => void;
  };

  export const Button: React.ForwardRefExoticComponent<
    ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: 'primary' | 'ghost';
    } & React.RefAttributes<HTMLButtonElement>
  >;

  export const Input: React.ForwardRefExoticComponent<
    InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
  >;

  export const Card: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;

  export const CardHeader: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;

  export const CardBody: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;

  export const Checkbox: React.ForwardRefExoticComponent<
    InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
  >;
}
