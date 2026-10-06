import { Link } from "react-router-dom";
import type { Course } from "../../services/courses.service";
import Badge from "./Badge";

interface Props {
  course: Course;
}

const levelColor = (level: string | null) => {
  if (level === "beginner")     return "green";
  if (level === "intermediate") return "yellow";
  if (level === "advanced")     return "red";
  return "gray";
};

const CourseCard = ({ course }: Props) => (
  <Link
    to={`/courses/${course.slug}`}
    className="group block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
  >
    {/* Thumbnail */}
    <div className="bg-gradient-to-br from-primary-100 to-primary-50 h-40 flex items-center justify-center overflow-hidden">
      {course.thumbnail_url ? (
        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
      ) : (
        <span className="text-4xl">📚</span>
      )}
    </div>

    <div className="p-4 flex flex-col gap-2">
      {/* Category + level */}
      <div className="flex items-center gap-2 flex-wrap">
        {course.category_name && <Badge color="blue">{course.category_name}</Badge>}
        {course.level && <Badge color={levelColor(course.level)}>{course.level}</Badge>}
      </div>

      <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 line-clamp-2 leading-snug">
        {course.title}
      </h3>

      <p className="text-xs text-gray-500">by {course.instructor_name}</p>

      {course.description && (
        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
      )}

      <div className="mt-auto pt-2 flex items-center justify-between">
        <span className="text-sm font-bold text-primary-700">
          {course.is_free ? "Free" : `$${parseFloat(course.price).toFixed(2)}`}
        </span>
        {course.duration_mins && (
          <span className="text-xs text-gray-400">{course.duration_mins} min</span>
        )}
      </div>
    </div>
  </Link>
);

export default CourseCard;
