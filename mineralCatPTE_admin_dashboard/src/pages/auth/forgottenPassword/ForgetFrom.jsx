import { useState } from "react";
import recovaryImage from "/Forgot password-cuate 1.svg";
import { PiEyeClosedBold, PiEyeClosedDuotone } from "react-icons/pi";
import axios from "axios";

import { IoMdCheckboxOutline } from "react-icons/io";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { Link, useNavigate } from "react-router";
import { IoArrowBackSharp } from "react-icons/io5";

const BASE_URL = import.meta.env.VITE_ADMIN_URL;

export default function ForgetFrom() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

    const navigate = useNavigate();



  const data = {
    greetings: "Forget password",
    message:
      "Enter your email address to ger a verification code for resetting your password.",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("email is required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/user/forgot-password`, {
        email,
      });
      console.log("Login success:", response.data);
      // এখানে সফল লগইনের পর কাজ করবেন
    
    } catch (err) {

      console.error("Login error:", err);
      setError("Please check your email.");
      
    } finally {
      setLoading(false);
      navigate("/auth/admin/recover-password/otp",{ state: { email } });
      
    }
  };

  return (
    <div className="grid grid-cols-4 w-full h-screen ">
      {/* img */}

      <section className="flex flex-col justify-center items-center bg-[#ffffff] col-span-2">
        <img src={recovaryImage} alt="recovaryImage" />
      </section>

      {/* row */}

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
                to={"/auth/admin/login"}
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

          <form onSubmit={handleSubmit} className="w-full md:w-full px-4">
            <div className="mb-4 mt-5">
              <label
                htmlFor="email"
                className="text-[25px] text-center text-[#262626] font-[500]"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                autoComplete="on"
                onFocus={() => setError(null)}
                placeholder="please enter your email"
                value={email}
                onChange={(e) => {setEmail(e.target.value), setError(null)}}
                className="border-border border rounded-md outline-none px-4 w-full h-[72px] text-[#646464] text-[20px] font-[500] mt-1 py-3 focus:border-primary transition-colors duration-300"
              />
            </div>

            {error && (
              <p className="text-red-600 font-semibold mt-2 text-left">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="border-border border text-[#F3F3F3] text-[24px] font-[600] rounded-[40px] outline-none px-4 w-full h-[72px] mt-6 py-3 focus:border-primary transition-colors duration-300 [background-image:linear-gradient(to_right,#D80000,#720000)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Get OTP"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
