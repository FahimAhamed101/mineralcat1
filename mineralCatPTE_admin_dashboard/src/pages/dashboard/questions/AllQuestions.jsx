import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Define question categories and their questions
const questionCategories = [
  {
    name: "Speaking",
    color: "#F2994A", // Orange/yellow color
    textColor: "#F2994A",
    questions: [
      { id: "read-aloud", title: "Read Aloud", icon: "🗣️", url: "/question/read-aloud" },
      { id: "repeat-sentence", title: "Repeat Sentence", icon: "🗣️", url: "/question/repeat-sentence" },
      { id: "respond-situation", title: "Respond to a Situation", icon: "🗣️", url: "/question/response-situtation" },
      { id: "answer-short", title: "Answer Short Question", icon: "🗣️", url: "/question/short-questions" },
    ],
  },
  {
    name: "Writing",
    color: "#2D9CDB", // Blue color
    textColor: "#2D9CDB",
    questions: [
      { id: "summarize-written", title: "Summarize Written Text", icon: "✍️", url: "/question/summarize-written" },
      { id: "write-email", title: "Write Email", icon: "✍️", url: "/question/write-email" },
    ],
  },
  {
    name: "Reading",
    color: "#27AE60", // Green color
    textColor: "#27AE60",
    questions: [
      { id: "fill-blanks-reading", title: "Fill in the Blanks", icon: "📚", url: "/question/fill-blanks-reading" },
      { id: "multiple-choice-reading", title: "Multiple Choice and ans...", icon: "📚", url: "/question/multiple-choice-reading" },
      { id: "reorder-paragraphs", title: "Re-order Paragraphs", icon: "📚", url: "/question/reorder-paragraphs" },
      { id: "multiple-choice-single-reading", title: "Multiple Choice, Single A...", icon: "📚", url: "/question/multiple-choice-single-reading" },
    ],
  },
  {
    name: "Listening",
    color: "#6666CC", // Purple color
    textColor: "#6666CC",
    questions: [
      { id: "summarize-spoken", title: "Summarize Spoken Text", icon: "🎧", url: "/question/summarize-spoken" },
      { id: "multiple-choice-listening", title: "Multiple Choice and ans...", icon: "🎧", url: "/question/multiple-choice-listening" },
      { id: "fill-blanks-listening", title: "Fill in the blanks", icon: "🎧", url: "/question/fill-blanks-listening" },
      { id: "multiple-choice-single-listening", title: "Multiple Choice, Single A...", icon: "🎧", url: "/question/multiple-choice-single-listening" },
    ],
  },
];

export default function AllQuestions({ isMockTest = false, sectional = null, url = "" }) {
  const navigate = useNavigate();

  // Lowercase mapping for easier comparison
  const allowedSections = ["writing", "listening", "reading", "speaking"];

  // If sectional is provided & valid, show only that one, otherwise show all
  let filteredCategories = questionCategories;
  if (
    sectional &&
    typeof sectional === "string" &&
    allowedSections.includes(sectional.toLowerCase())
  ) {
    filteredCategories = questionCategories.filter(
      (cat) => cat.name.toLowerCase() === sectional.toLowerCase()
    );
  }

  // Function to handle question button click and redirect to the corresponding URL with additional state or query parameters
  const handleQuestionClick = (questionUrl) => {
    navigate(questionUrl, {
      state: { isMockTest, url: url },
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className={`bg-[#8B0000] text-white p-4`}>
        <h1 className="text-2xl font-bold">Question</h1>
      </div>

      {/* Question categories and buttons */}
      <div className="bg-white p-4">
        {/* Category tabs */}
        <div className="flex mb-4">
          {filteredCategories.map((category) => (
            <div
              key={category.name}
              className="flex-1 pb-1 text-center"
              style={{ borderBottom: `2px solid ${category.color}` }}
            >
              <span style={{ color: category.textColor }} className="font-medium">
                {category.name}
              </span>
            </div>
          ))}
        </div>

        {/* Question buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <div key={category.name} className="flex flex-col gap-3">
              {category.questions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleQuestionClick(question.url)}
                  className={`flex items-center justify-between p-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors`}
                  style={{ borderColor: category.color }}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{question.icon}</span>
                    <span>{question.title}</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}