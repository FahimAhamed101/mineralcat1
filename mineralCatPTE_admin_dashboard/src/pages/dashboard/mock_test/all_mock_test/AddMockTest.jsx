import React, { useEffect, useState } from "react";
import fetchWithAuth from "../../../../utils/fetchWithAuth";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router";
import AllQuestions from "../../questions/AllQuestions";

export default function AddMockTest() {
  const [mockName, setMockName] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [loading, setLoading] = useState(false);
  const [qustions, setQuestions] = useState([]);
  const [isMockTest, setIsMockTest] = useState(true);

  const baseUrl = import.meta.env.VITE_ADMIN_URL || "";
  const location = useLocation();
  const from = "/mock-test/fill";
  const navigate = useNavigate();

  // Load saved mockName/hour/minute from localStorage on mount
  useEffect(() => {
    const storedMockName = localStorage.getItem("mock_test_name") || "";
    const storedHour = localStorage.getItem("mock_test_hour") || "";
    const storedMinute = localStorage.getItem("mock_test_minute") || "";
    setMockName(storedMockName);
    setHour(storedHour);
    setMinute(storedMinute);

    // Load questions from localStorage
    const storedQuestions = JSON.parse(localStorage.getItem("mock_full_question_ids") || "[]");
    setQuestions(storedQuestions);
  }, [location?.state?.questions]);

  // Save mockName/hour/minute to localStorage on change
  useEffect(() => {
    localStorage.setItem("mock_test_name", mockName);
  }, [mockName]);
  useEffect(() => {
    localStorage.setItem("mock_test_hour", hour);
  }, [hour]);
  useEffect(() => {
    localStorage.setItem("mock_test_minute", minute);
  }, [minute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mockName || !hour || !minute || !qustions.length) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }
    setLoading(true);

    const body = {
      name: mockName,
      duration: {
        hours: hour,
        minutes: parseInt(hour) * 60 + parseInt(minute),
      },
      questions: qustions,
    };

    fetchWithAuth(`${baseUrl}/full-mock-test/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(() => {
        Swal.fire({
          title: "Success",
          text: "Mock Test added successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });

        // Remove from localStorage only after mock test is successfully added
        localStorage.removeItem("mock_full_question_ids");
        localStorage.removeItem("mock_test_name");
        localStorage.removeItem("mock_test_hour");
        localStorage.removeItem("mock_test_minute");

        setLoading(false);
        navigate(from);
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Error adding mock test.");
        console.error("Error adding mock test:", error);
      });

    setIsMockTest(false);
  };

  // hour/minute arrays for dropdown
  const hourOptions = Array.from({ length: 5 }, (_, i) => i); // 0-4 hours
  const minuteOptions = [0, 15, 30, 45];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <form
        className="max-w-[80%] mx-auto w-full mt-14"
        onSubmit={handleSubmit}
      >
        {/* Mock Test Name */}
        <div className="mb-9">
          <label className="block text-[#1B1B1B] text-[17px] font-semibold mb-2">
            Mock Test Name
          </label>
          <input
            type="text"
            value={mockName}
            onChange={e => setMockName(e.target.value)}
            placeholder="Write here..."
            className="w-full px-5 py-4 bg-[#f2f2f2] border-0 rounded-lg text-gray-800 placeholder-[#bdbdbd] focus:outline-none focus:ring-2 focus:ring-[#a91e22] focus:bg-white text-[18px] transition-colors shadow-sm"
          />
        </div>

        {/* Time & Total Questions row */}
        <div className="flex gap-8 mb-7 items-center">
          {/* Select Total Time */}
          <div className="flex flex-col flex-1 max-w-[380px]">
            <label className="block text-[#191919] text-[16px] font-medium mb-2">
              Select Total Time
            </label>
            <div className="flex items-center w-full">
              <select
                value={hour}
                onChange={e => setHour(e.target.value)}
                className="bg-[#f2f2f2] px-6 py-4 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#a91e22] text-[18px] w-[100px] h-[56px] font-medium"
              >
                <option value="">--</option>
                {hourOptions.map(h => (
                  <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>
                ))}
              </select>
              <span className="mx-2 text-xl text-[#767676] font-semibold">:</span>
              <select
                value={minute}
                onChange={e => setMinute(e.target.value)}
                className="bg-[#f2f2f2] px-6 py-4 rounded-r-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#a91e22] text-[18px] w-[100px] h-[56px] font-medium"
              >
                <option value="">--</option>
                {minuteOptions.map(m => (
                  <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
                ))}
              </select>
              <span className="ml-3 text-[#767676] text-lg font-medium">hour</span>
            </div>
          </div>
          {/* Total Questions */}
          <div className="flex-1 flex items-end justify-end">
            <span className="text-[#242424] font-semibold text-[18px]">
              Total Question:{" "}
              <span className="font-bold text-[22px]">{qustions?.length}</span>
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-12 mb-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#a91e22] hover:bg-[#811b1c] text-white font-semibold py-4 px-20 rounded-md text-[18px] transition-colors focus:outline-none focus:ring-2 focus:ring-[#a91e22] focus:ring-offset-2 disabled:bg-[#e2e2e2] disabled:text-gray-400 shadow"
          >
            {loading ? "Submitting..." : "Published Mock Test"}
          </button>
        </div>
      </form>
      <AllQuestions isMockTest={isMockTest} setQuestions={setQuestions} />
    </div>
  );
}
