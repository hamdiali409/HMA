import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface BaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  isLoading?: boolean;
  as?: 'button' | 'a';
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' };
type AnchorProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' };

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  as = 'button',
  ...props
}: ButtonProps | AnchorProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none gap-2 overflow-hidden relative group";
  
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200/50",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-sm",
    outline: "border-2 border-slate-200 bg-transparent text-slate-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-blue-600",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    dark: "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200/20",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm rounded-xl",
    md: "px-6 py-3 text-base rounded-2xl",
    lg: "px-8 py-4 text-lg rounded-2xl",
    icon: "p-2.5 rounded-xl",
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      {isLoading ? (
        <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </>
  );

  if (as === 'a') {
    const { ...anchorProps } = props as any;
    return (
      <motion.a
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        className={combinedClassName}
        {...anchorProps}
      >
        {content}
      </motion.a>
    );
  }

  const { disabled, ...buttonProps } = props as any;
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...buttonProps}
    >
      {content}
    </motion.button>
  );
}
