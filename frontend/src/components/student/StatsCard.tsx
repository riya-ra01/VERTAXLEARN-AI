interface Props {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

const StatsCard = ({ title, value, icon, color = "bg-primary-50" }: Props) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default StatsCard;
