// Small reusable button. variant: "primary" | "ghost" | "danger"
export default function Button({ variant = 'primary', type = 'button', className = '', children, ...rest }) {
  return (
    <button type={type} className={`btn btn--${variant} ${className}`} {...rest}>
      {children}
    </button>
  );
}
