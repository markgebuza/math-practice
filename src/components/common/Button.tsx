import type { ComponentProps } from 'react';
import { Link, type LinkProps } from 'react-router';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'success';
type ButtonSize = 'md' | 'lg';

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

function buttonClassName(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return ['button', `button--${variant}`, size === 'lg' && 'button--lg', className]
    .filter(Boolean)
    .join(' ');
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonStyleProps & ComponentProps<'button'>) {
  return <button type={type} className={buttonClassName(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonStyleProps & LinkProps) {
  return <Link className={buttonClassName(variant, size, className)} {...props} />;
}
