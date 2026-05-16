export default function ProgressBar({ value, showLabel = true }) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1.5 text-gray-600 dark:text-gray-400">
          <span className="font-medium">Progress</span>
          <span>{value}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}