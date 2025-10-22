/* eslint-disable react/jsx-props-no-spreading */
'use client';

import React, { createContext, useContext } from 'react';

type ColorMode = 'light' | 'dark';

type ThemeContextValue = {
  colorMode: ColorMode;
  // placeholder to align with a real theme provider API
  setColorMode: (_mode: ColorMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  colorMode: 'dark',
  setColorMode: () => undefined,
});

type KiboProviderProps = {
  colorMode?: ColorMode;
  children: React.ReactNode;
};

export const KiboProvider = ({ colorMode = 'dark', children }: KiboProviderProps) => (
  <ThemeContext.Provider value={{ colorMode, setColorMode: () => undefined }}>
    <div data-kibo-color-mode={colorMode}>{children}</div>
  </ThemeContext.Provider>
);

export const useKiboTheme = () => useContext(ThemeContext);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', ...props }, ref) => {
    const classes =
      variant === 'ghost'
        ? 'kibo-button kibo-button--ghost'
        : 'kibo-button kibo-button--primary';

    return <button ref={ref} className={`${classes} ${className}`.trim()} {...props} />;
  }
);
Button.displayName = 'KiboButton';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => (
    <input ref={ref} className={`kibo-input ${className}`.trim()} {...props} />
  )
);
Input.displayName = 'KiboInput';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => (
    <section ref={ref} className={`kibo-card ${className}`.trim()} {...props} />
  )
);
Card.displayName = 'KiboCard';

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', ...props }, ref) => (
    <header ref={ref} className={`kibo-card__header ${className}`.trim()} {...props} />
  )
);
CardHeader.displayName = 'KiboCardHeader';

type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`kibo-card__body ${className}`.trim()} {...props} />
  )
);
CardBody.displayName = 'KiboCardBody';

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', ...props }, ref) => (
    <label className={`kibo-checkbox ${className}`.trim()}>
      <input ref={ref} type="checkbox" {...props} />
      <span className="kibo-checkbox__control" />
    </label>
  )
);
Checkbox.displayName = 'KiboCheckbox';
