"use client";
import React, { useState, useEffect } from "react";
import fetchWithAuth from "../../../lib/fetchWithAuth";
import empty from "../../../../public/emty.png";

import Image from "next/image";
const PaymentHistory = () => {
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log("Fetching:", `${baseUrl}/user/user-payment-history`);
        const response = await fetchWithAuth(
          `${baseUrl}/user/user-payment-history`
        );

        console.log("response", response);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched Data:", data);

        setPaymentHistory(data.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (baseUrl) fetchUserData();
  }, [baseUrl]);

  const formatDateAndYear = (isoDateStr) => {
    if (!isoDateStr) return "";
    const date = new Date(isoDateStr);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  
  return (
    <div className=" w-full mt-5">
     {
      loading ? (<div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#810000]"></div>
          </div>):(

           
      !paymentHistory?.length? (<div className="grid items-center justify-center  ">
            <Image src={empty} alt="" className="w-100 md:w-150"/>
            <h1 className="text-[#7D0000] text-center font-medium text-2xl md:text-5xl">No Transactions Yet</h1>
      </div>) : (<div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
  <thead className="hidden bg-gradient-to-r from-[#7D0000] to-[#973333] text-white md:table-header-group text-xs md:text-sm">
    <tr>
      <th className="border-r border-white p-2 text-center">SI. No.</th>
      <th className="border-r border-white p-2 text-center">Transaction ID</th>
      <th className="border-r border-white p-2 text-center">Transaction Date</th>
      <th className="border-r border-white p-2 text-center">Payment Status</th>
      <th className="p-2 text-center">Amount</th>
    </tr>
  </thead>

  <tbody className="block md:table-row-group">
    {paymentHistory?.map((item, index) => (
      <tr
        key={index}
        className="block md:table-row mb-4 border border-gray-200 rounded-lg md:border-b md:mb-0 md:rounded-none"
      >
        <td
          data-label="SI. No."
          className="block md:table-cell p-3 text-center border-b md:border-none md:p-2 before:content-[attr(data-label)] before:block before:font-semibold md:before:content-none"
        >
          {item.user?.slice(0, 3)}
        </td>
        <td
          data-label="Transaction ID"
          className="block md:table-cell p-3 text-center border-b md:border-none md:p-2 before:content-[attr(data-label)] before:block before:font-semibold md:before:content-none"
        >
          {item.transactionId}
        </td>
        <td
          data-label="Transaction Date"
          className="block md:table-cell p-3 text-center border-b md:border-none md:p-2 before:content-[attr(data-label)] before:block before:font-semibold md:before:content-none"
        >
          {formatDateAndYear(item.paymentDate)}
        </td>
        <td
          data-label="Payment Status"
          className="block md:table-cell p-3 text-center border-b md:border-none md:p-2 before:content-[attr(data-label)] before:block before:font-semibold md:before:content-none"
        >
          {item.status}
        </td>
        <td
          data-label="Amount"
          className="block md:table-cell p-3 text-center md:p-2 before:content-[attr(data-label)] before:block before:font-semibold md:before:content-none"
        >
          {item.amount}
        </td>
      </tr>
    ))}
  </tbody>
</table>

      </div>)
      )
     }
      
      
    </div>
  );
};

export default PaymentHistory;
