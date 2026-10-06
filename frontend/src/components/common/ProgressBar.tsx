interface Props {
  value: number;   // 0–100
  color?: string;
  label?: string;
}

const ProgressBar = ({ value, color = "bg-primary-600", label }: Props) => (
  <div>
    {label && (
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
    )}
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);

export default ProgressBar;
