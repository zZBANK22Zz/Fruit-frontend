import OrangeSpinner from './OrangeSpinner';

/**
 * Reusable Button Component
 * 
 * @param {ReactNode} children - Button content/text
 * @param {string} variant - Button style variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost' | 'link'
 * @param {string} size - Button size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} isLoading - Shows loading spinner when true
 * @param {boolean} disabled - Disables the button
 * @param {boolean} fullWidth - Makes button full width
 * @param {ReactNode} leftIcon - Icon to display on the left
 * @param {ReactNode} rightIcon - Icon to display on the right
 * @param {function} onClick - Click handler function
 * @param {string} type - Button type: 'button' | 'submit' | 'reset'
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * // Basic usage
 * <Button onClick={handleClick}>Click Me</Button>
 * 
 * @example
 * // With loading state
 * <Button isLoading={isLoading}>Submit</Button>
 * 
 * @example
 * // With icon
 * <Button leftIcon={<ArrowLeftIcon />}>Back</Button>
 * 
 * @example
 * // Full width primary button
 * <Button variant="primary" fullWidth>Submit</Button>
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    outline: 'border-2 border-orange-400 text-orange-500 hover:bg-orange-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-[#00B900] text-white hover:bg-[#00A000]',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    link: 'bg-transparent text-orange-500 hover:text-orange-600 underline p-0',
  };

  // Size styles
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg',
    xl: 'px-6 py-4 text-xl',
  };

  // Base styles
  const baseStyles = 'font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg';

  // Disabled styles
  const disabledStyles = 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300 hover:from-orange-400 hover:to-orange-500';

  // Combine all styles
  const buttonStyles = `
    ${baseStyles}
    ${disabled || isLoading ? disabledStyles : variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
        <OrangeSpinner className="h-5 w-5" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;

