import { useState } from "react";
import recovaryImage from "/otp.svg";
import { Link, useLocation } from "react-router";
import { IoArrowBackSharp } from "react-icons/io5";
import OtpInput from "./OtpInput";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(null);
  const location = useLocation();
  const email = location.state?.email || "";

  const data = {
    greetings: "Verify OTP",
    message: `Please check your email. We have sent a code to contact: ${email}.`,
  };

  return (
    <div className="grid grid-cols-4 w-full h-screen ">
      {/* img */}
      <section className="flex flex-col justify-center items-center bg-[#ffffff] col-span-2">
        <img src={recovaryImage} alt="recovaryImage" />
      </section>
      {/* form */}
      <section className="flex justify-center items-center bg-[#ffffff] col-span-2 gap-x-7">
        <div className="w-[2px] flex flex-col justify-center items-center bg-[#ffffff] ">
          <div className="w-[2px] h-[800px] bg-[#7D0000]"></div>
        </div>
        <div>
          <div>
            <div className="flex items-center gap-x-2">
              <Link
                className="text-white rounded-full p-1 flex justify-center items-center text-3xl bg-black w-[40px] h-[40px]"
                to={"/auth/admin/recover-password"}
              >
                <IoArrowBackSharp />
              </Link>
              <h3 className="text-[#0e0303] text-4xl font-[600] leading-[1.2] tracking-normal text-left">
                {data.greetings}
              </h3>
            </div>
            <p className="text-[#646464] text-base text-[28px] font-[500] leading-[1.2] tracking-normal text-left mt-2">
              {data.message}
            </p>
          </div>

          <form className="w-full md:w-full px-4">
            <div className="mb-4 mt-5">
              <OtpInput setOtp={setOtp} />
            </div>
            <div className="flex items-center justify-between mx-auto gap-x-2 mt-4 w-11/12">
              <span className="text-[#646464] text-base font-[500] leading-[1.2] tracking-normal text-left">
                Didn’t receive the code?
              </span>
              <Link
                to={"/auth/admin/login"}
                className="text-[#D80000] text-base font-[500] leading-[1.2] tracking-normal text-left"
              >
                Resend
              </Link>
            </div>
            {/* No submit button, OTP handled by OtpInput */}
          </form>
        </div>
      </section>
    </div>
  );
}