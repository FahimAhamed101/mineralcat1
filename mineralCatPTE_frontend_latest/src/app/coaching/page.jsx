"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useLoggedInUser from "@/lib/useGetLoggedInUser";
import Coaching from "../components/coaching/Coaching";
import MasterPte from "../components/coaching/MasterPte";
import Succeed from "../components/coaching/Succeed";
import UsersSaying from "../components/home/UsersSaying";
import ChoosePlan from "../components/home/ChoosePlan";

export default function Page() {
  const { user, loading } = useLoggedInUser();
  const router = useRouter();
  const toastShown = useRef(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    const subscription = user?.user?.userSubscription;
    const coachingUnlimited = subscription?.coachingUnlimited === true;
    const coachingDays = Number(subscription?.coachingDays || 0);

    if (coachingUnlimited || coachingDays >= 1) {
      return;
    }

    if (!toastShown.current) {
      toastShown.current = true;
      toast.info("Buy a coaching Plan");
    }

    router.replace("/pricing");
  }, [loading, router, user]);

  if (loading) {
    return null;
  }

  const subscription = user?.user?.userSubscription;
  const coachingUnlimited = subscription?.coachingUnlimited === true;
  const coachingDays = Number(subscription?.coachingDays || 0);

  if (!coachingUnlimited && coachingDays < 1) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Coaching />
      <MasterPte />
      <Succeed />
      <div className="w-full">
        <UsersSaying />
      </div>
      <div className="w-full lg:mt-20">
        <ChoosePlan />
      </div>
    </div>
  );
}
