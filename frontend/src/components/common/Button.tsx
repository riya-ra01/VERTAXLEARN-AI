import { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

const variants = {
  primary:   "bg-primary-600 hover:bg-primary-700 text-white",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
  danger:    "bg-red-500 hover:bg-red-600 text-white",
};

const Button = ({ variant = "primary", loading, children, className = "", disabled, ...props }: Props) => (
  <button
    disabled={disabled || loading}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variants[variant]} ${className}`}
    {...props}
  >
    {loading ? (
      <span className="flex items-center gap-2 justify-center">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading...
      </span>
    ) : children}
  </button>
);

export default Button;
