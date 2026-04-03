import Subscription from "../components/pricing/Subscription";
import CoachingPlan from "../components/pricing/CoachingPlan";
import FAQ from "../components/home/FAQ";

export default function Page() {
  return (
    <div className="mb-20">
      <div className="bg-linear-to-r from-[#A52B1A] to-[#EF5634] text-center text-white">
        <h1 className="font-bold text-2xl lg:text-[64px] pt-5">Pricing</h1>
        <p className="text-base lg:text-[24px] pb-10">
          Choose the perfect subscription plan for your needs
        </p>
      </div>
      <div>
        <Subscription />
        <CoachingPlan />
        <FAQ />
      </div>
    </div>
  );
}
