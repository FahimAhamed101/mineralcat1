import Pte from "../components/features/Pte";
import JourneyStarts from "../components/features/JourneyStarts";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="font-bold text-2xl lg:text-[48px] text-center mt-10">
        All about the <span className="text-[#EF5634]">PTE Core Exam</span>
      </h1>
      <Pte />
      <JourneyStarts />
    </div>
  );
}
