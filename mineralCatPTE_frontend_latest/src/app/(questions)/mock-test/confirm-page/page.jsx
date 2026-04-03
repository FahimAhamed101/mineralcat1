"use client";

import React, { useState } from "react";
import Image from "next/image";
import cookies from "../../../../../public/cookies.png";
import js from "../../../../../public/js.png";
import browser from "../../../../../public/recomended-browser.png";
import resolution from "../../../../../public/resolution.png";
import microphone from "../../../../../public/microphone.png";
import keyboard from "../../../../../public/keyboard.png";
import keyboardimg from "../../../../../public/keyboardimg.png";
import { useRouter, useSearchParams } from "next/navigation"
const SingleMockTest = ({ params: paramsPromise }) => {
  
const searchParams = useSearchParams();
  const item_id = searchParams.get('item_id');
  const [consentGiven, setConsentGiven] = useState(false);
  const router = useRouter();
  const handleContinue = () => {
    if (consentGiven && item_id) {
      router.push(`/mock-test/confirm-page/${item_id}`);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-10">
      <div>
        <h1 className="font-medium text-xl md:text-4xl">
          SYSTEM REQUIREMENT TEST
        </h1>
      </div>
      <div>
        <div className="upper grid gap-5  md:flex w-full md:gap-10 mt-10">
          <div className="cookies bg-orange-100 p-8 rounded-xl border border-orange-400 flex flex-col items-center justify-center gap-3">
            <Image src={cookies} alt="" />
            <p className="text-orange-400 text-xl">Cookies</p>
            <p>
              Cookies Are <span className="text-orange-400 ">Enabled</span>
            </p>
          </div>
          <div className="js bg-red-100 p-8 rounded-xl border border-red-400 flex flex-col items-center justify-center gap-3">
            <Image src={js} alt="" />
            <p className="text-red-500 text-xl">Java Script</p>
            <p>
              Java Script is <span className="text-red-500 ">Enabled</span>
            </p>
          </div>
          <div className="browser bg-sky-100 p-8 rounded-xl border border-sky-400 flex flex-col items-center justify-center gap-3">
            <Image src={browser} alt="" />
            <p className="text-sky-500 text-xl">Recommended Browser</p>
            <p>Google Chrome</p>
          </div>
          <div className="resolution bg-blue-100 p-8 rounded-xl border border-blue-400 flex flex-col items-center justify-center gap-3">
            <Image src={resolution} alt="" />
            <p className="text-blue-500 text-xl">Best Resolution</p>
            <p>1366 * 768 and above</p>
          </div>
        </div>
        <div className="lower grid gap-5 md:flex justify-center md:gap-8 mt-10">
          <div className="microphone bg-green-100 p-8 rounded-xl border border-green-400 flex flex-col items-center justify-center gap-3">
            <Image src={microphone} alt="" />
            <p className="text-green-500 text-xl">Microphone Status</p>
            <p>
              Microphone Is
              <span className="text-green-500 "> Enabled</span>
            </p>
          </div>
          <div className="keyboard bg-slate-300 p-8 rounded-xl border border-slate-500 md:flex  items-center justify-center gap-5">
            <div className="flex flex-col gap-5 items-center justify-center text-center">
              <Image src={keyboard} alt="" />
              <p className="text-slate-500 text-xl">Check your Keyboard</p>
            </div>
            <Image src={keyboardimg} alt="" />
          </div>
        </div>
      </div>
      <div className=" mx-auto p-4 border border-gray-300 rounded-xl space-y-4 mt-10">
        <p className="text-sm text-gray-600">
          Starting this test will use 1 mock-test token. Full mock tests do not use AI credits.
        </p>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-1"
          />
          <span>
            I can confirm that my microphone is functioning properly & I have
            the correct keyboard.
            <br />I am not taking this mock test on a mobile device as I am
            aware that some features might not function properly if I do so.
          </span>
        </label>

        <button
        onClick={handleContinue}
          disabled={!consentGiven}
          className={`px-4 py-2 rounded-md text-white font-semibold transition ${
            consentGiven
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SingleMockTest;
