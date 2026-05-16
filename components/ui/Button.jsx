import clsx from "clsx";

export default function Button({
  children, variant = "primary", size = "md", className, ...props
}) {
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md",
    secondary: "bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200",
    outline: "border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200",
    ghost: "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2", lg: "px-6 py-3 text-lg" };

  return (
    <button
      className={clsx(
        "rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50",
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {children}
    </button>
  );
}