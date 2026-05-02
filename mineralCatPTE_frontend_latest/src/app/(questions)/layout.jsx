import QuestionScoreHistory from "@/components/questions/QuestionScoreHistory";

export default function QuestionsLayout({ children }) {
  return (
    <>
      {children}
      <QuestionScoreHistory />
    </>
  );
}
