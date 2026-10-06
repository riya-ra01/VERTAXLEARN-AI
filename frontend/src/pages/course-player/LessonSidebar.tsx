import type { Lesson } from "../../services/lessons.service";

interface Props {
  lessons: Lesson[];
  activeLesson: Lesson | null;
  completedIds: Set<string>;
  onSelect: (lesson: Lesson) => void;
}

const iconFor = (type: Lesson["content_type"]) => {
  const map: Record<string, string> = {
    video: "▶️", article: "📄", pdf: "📎", quiz: "❓", assignment: "📝",
  };
  return map[type] ?? "📄";
};

const LessonSidebar = ({ lessons, activeLesson, completedIds, onSelect }: Props) => (
  <aside className="w-72 bg-gray-800 border-r border-gray-700 overflow-y-auto flex-shrink-0">
    <div className="px-4 py-3 border-b border-gray-700">
      <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
        Course Content
      </p>
    </div>
    <ul>
      {lessons.map((lesson, idx) => {
        const isActive    = activeLesson?.id === lesson.id;
        const isCompleted = completedIds.has(lesson.id);
        return (
          <li key={lesson.id}>
            <button
              onClick={() => onSelect(lesson)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-700 transition-colors
                ${isActive ? "bg-gray-700 border-l-2 border-primary-500" : ""}`}
            >
              {/* Completion indicator */}
              <span className="mt-0.5 flex-shrink-0 text-lg">
                {isCompleted ? "✅" : iconFor(lesson.content_type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${isActive ? "text-white font-medium" : "text-gray-300"}`}>
                  {idx + 1}. {lesson.title}
                </p>
                {lesson.duration_mins && (
                  <p className="text-xs text-gray-500 mt-0.5">{lesson.duration_mins} min</p>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  </aside>
);

export default LessonSidebar;
