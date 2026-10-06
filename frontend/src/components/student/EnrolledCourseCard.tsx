import { Link } from "react-router-dom";
import type { Enrollment } from "../../services/courses.service";
import Badge from "../common/Badge";

interface Props { enrollment: Enrollment }

const EnrolledCourseCard = ({ enrollment }: Props) => (
  <Link
    to={`/courses/${enrollment.slug}/learn`}
    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
  >
    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
      {enrollment.thumbnail_url
        ? <img src={enrollment.thumbnail_url} alt={enrollment.title} className="w-full h-full object-cover" />
        : <span className="text-2xl">📖</span>}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-800 truncate">{enrollment.title}</h3>
      <div className="flex items-center gap-2 mt-1">
        {enrollment.level && <Badge color="blue">{enrollment.level}</Badge>}
        <Badge color={enrollment.status === "completed" ? "green" : "yellow"}>
          {enrollment.status}
        </Badge>
      </div>
    </div>
    <span className="text-primary-600 text-sm font-medium flex-shrink-0">Continue →</span>
  </Link>
);

export default EnrolledCourseCard;
