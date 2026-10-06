import type { Lesson } from "../../services/lessons.service";
import Button from "../../components/common/Button";

interface Props {
  lesson: Lesson;
  isCompleted: boolean;
  onComplete: () => void;
  onNext: () => void;
  hasNext: boolean;
}

const LessonContent = ({ lesson, isCompleted, onComplete, onNext, hasNext }: Props) => (
  <div className="max-w-4xl mx-auto px-6 py-8">
    {/* Title */}
    <h2 className="text-2xl font-bold text-white mb-6">{lesson.title}</h2>

    {/* Content type renderer */}
    {lesson.content_type === "video" && lesson.content_url && (
      <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
        <iframe
          src={lesson.content_url}
          className="w-full h-full"
          allowFullScreen
          title={lesson.title}
        />
      </div>
    )}

    {lesson.content_type === "video" && !lesson.content_url && (
      <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center mb-6">
        <p className="text-gray-500">No video URL provided</p>
      </div>
    )}

    {(lesson.content_type === "article" || lesson.content_type === "pdf") && lesson.content_text && (
      <div className="bg-white rounded-xl p-8 mb-6 prose max-w-none text-gray-800 leading-relaxed">
        <p className="whitespace-pre-wrap">{lesson.content_text}</p>
      </div>
    )}

    {lesson.content_type === "pdf" && lesson.content_url && (
      <a
        href={lesson.content_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mb-6 px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
      >
        📎 Open PDF
      </a>
    )}

    {/* Actions */}
    <div className="flex items-center gap-3 mt-8">
      {!isCompleted && (
        <Button onClick={onComplete} variant="secondary">
          ✅ Mark Complete
        </Button>
      )}
      {isCompleted && (
        <span className="text-green-400 text-sm font-medium flex items-center gap-1">
          ✅ Completed
        </span>
      )}
      {hasNext && (
        <Button onClick={onNext} className="ml-auto">
          Next Lesson →
        </Button>
      )}
    </div>
  </div>
);

export default LessonContent;
