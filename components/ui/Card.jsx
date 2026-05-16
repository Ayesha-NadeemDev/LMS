import clsx from "clsx";

export default function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm",
        hover && "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}