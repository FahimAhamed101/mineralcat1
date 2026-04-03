"use client";

interface PracticeDetail {
  id: string;
  title: string;
  count: string;
  label: string;
  description: string[];
}

const PRACTICE_DETAILS: Record<string, PracticeDetail> = {
  speaking: {
    id: "speaking",
    title: "Speaking Practice",
    count: "+4000",
    label: "Speaking Question",
    description: [
      "Master PTE Core Speaking with Real-Time AI Feedback.",
      "Practice Repeat Sentence, Describe Image, and Retell Lecture with instant feedback on accuracy, fluency, and pronunciation.",
      "Build confidence through real exam style questions designed to mirror authentic PTE Core experiences.",
    ],
  },
  writing: {
    id: "writing",
    title: "Writing Practice",
    count: "+300",
    label: "Writing Task",
    description: [
      "Perfect Your Writing Skills with Smart AI Evaluation",
      "Practice Summarize Written Text and Write Essay with real exam formats.",
      "Enhance your writing accuracy, coherence, and grammar through guided PTE-style tasks and instant feedback.",
    ],
  },
  reading: {
    id: "reading",
    title: "Reading Practice",
    count: "+700",
    label: "Reading Passage",
    description: [
      "Master every reading task with authentic materials and adaptive feedback designed to strengthen your logic and focus.",
      "Practice Fill in the Blanks, Re-order Paragraphs, and Multiple Choice tasks",
      "Improve your reading speed, accuracy, and vocabulary comprehension.",
    ],
  },
  listening: {
    id: "listening",
    title: "Listening Practice",
    count: "+2000",
    label: "Listening Task",
    description: [
      "Train your ear to capture details, ideas, and speaker intent with realistic exam-based audio tracks.",
      "Practice Fill in the Blanks, Highlight Incorrect Words, Select Missing Word, and Multiple Choice questions.",
      "Improve your listening accuracy and note-taking under timed conditions.",
    ],
  },
};

interface PracticeDetailsProps {
  activeCardId: string;
}

export function PracticeDetails({ activeCardId }: PracticeDetailsProps) {
  const detail = PRACTICE_DETAILS[activeCardId];

  if (!detail) return null;

  return (
    <div className="lg:w-6xl lg:h-72 p-5 rounded-2xl bg-white border border-[#E5E7EB] mt-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
      <div className="flex flex-col items-center justify-center lg:w-1/3">
        <div className="md:text-6xl text-4xl font-bold text-[#7D0000]">
          {detail.count}
        </div>
        <div className="text-xl font-semibold text-gray-800 mt-4">
          {detail.label}
        </div>
      </div>
      <div className="h-55 hidden lg:block border border-[#E5E7EB]"></div>

      <div className="lg:w-2/3">
        <h2 className="text-3xl md:text-4xl font-bold text-[#7D0000] mb-6">
          {detail.title}
        </h2>
        <ul className="space-y-4">
          {detail.description.map((item, index) => (
            <li key={index} className="flex gap-3 text-gray-700 leading-relaxed">
              <span className="text-[#7D0000] font-bold mt-1">&bull;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
