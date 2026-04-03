import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchWithAuth from "../../../utils/fetchWithAuth";

const planTypes = ["Gold", "Silver", "Bronze"];

export default function EditUser() {
  const { id: userId } = useParams();
  const baseUrl = import.meta.env.VITE_ADMIN_URL;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch user data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["singleUser", userId],
    queryFn: async () => {
      const res = await fetchWithAuth(`${baseUrl}/admin/get-single-user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
    enabled: !!userId,
  });

  // Extract only editable fields from API response (blocked from root, not userSubscription)
  const apiUser = data?.user || {};
  const apiSub = apiUser.userSubscription || {};
  const defaultForm = {
    name: apiUser.name || "",
    email: apiUser.email || "",
    credits: apiSub.credits ?? 0,
    mockTestLimit: apiSub.mockTestLimit ?? 0,
    planType: apiSub.planType || "",
    isActive: apiSub.isActive ?? false,
    weeklyPredictions: apiSub.weeklyPredictions ?? false,
    performanceTracking: apiSub.performanceTracking ?? false,
    noExpiration: apiSub.noExpiration ?? false,
    blocked: apiUser.blocked ?? false, // <-- blocked is from root user
  };

  // Form state
  const [form, setForm] = useState(defaultForm);
  // Track which fields changed
  const [changedFields, setChangedFields] = useState({});

  // Sync API data to form when loaded
  useEffect(() => {
    setForm(defaultForm);
    setChangedFields({});
    // eslint-disable-next-line
  }, [data]);

  // Change handler (track changed fields)
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setChangedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Mutation for update (only send changed fields)
  const mutation = useMutation({
    mutationFn: async (formData) => {
      // Only send fields that are changed by admin
      const payload = {};
      Object.keys(changedFields).forEach((key) => {
        payload[key] = formData[key];
      });
      if (Object.keys(payload).length === 0) throw new Error("No changes to update");

      const res = await fetchWithAuth(
        `${baseUrl}/admin/edit-user/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        let err = null;
        try { err = await res.json(); } catch {
          throw new Error("Failed to parse error response");
        }
        throw new Error(err?.message || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["singleUser", userId]);
      navigate("/users");
    },
  });

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  // UI loading
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <div className="animate-pulse text-lg font-medium text-gray-500">
          Loading user data...
        </div>
        <div className="w-1/2 h-32 bg-gray-200 animate-pulse rounded mt-6"></div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-red-600 font-medium">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-gradient-to-br from-[#fff4f4] via-[#ffe6e1] to-[#f9d1d1] rounded-2xl shadow-xl p-8 border border-[#f2b4b4]">
      <h1 className="text-3xl font-bold mb-6 text-[#ac2b2b] text-center drop-shadow">
        Edit User
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label
            className="block text-[#b03c3c] font-semibold mb-1"
            htmlFor="name"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={e => handleChange("name", e.target.value)}
            className="w-full border border-[#ffd6d6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e25252] bg-white shadow-sm"
            required
            autoComplete="off"
          />
          <div className="text-xs text-[#b3b3b3] mt-1">Current: {defaultForm.name}</div>
        </div>

        {/* Email (editable) */}
        <div>
          <label
            className="block text-[#b03c3c] font-semibold mb-1"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={e => handleChange("email", e.target.value)}
            className="w-full border border-[#ffd6d6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e25252] bg-white shadow-sm"
            required
            autoComplete="off"
          />
          <div className="text-xs text-[#b3b3b3] mt-1">Current: {defaultForm.email}</div>
        </div>

        {/* Credits */}
        <div>
          <label className="block text-[#b03c3c] font-semibold mb-1" htmlFor="credits">
            Credits
          </label>
          <input
            id="credits"
            type="number"
            min={0}
            value={form.credits}
            onChange={e => handleChange("credits", Number(e.target.value))}
            className="w-full border border-[#ffd6d6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e25252] bg-white shadow-sm"
            required
          />
          <div className="text-xs text-[#b3b3b3] mt-1">Current: {defaultForm.credits}</div>
        </div>

        {/* MockTest Limit */}
        <div>
          <label className="block text-[#b03c3c] font-semibold mb-1" htmlFor="mockTestLimit">
            Mock Test Limit
          </label>
          <input
            id="mockTestLimit"
            type="number"
            min={0}
            value={form.mockTestLimit}
            onChange={e => handleChange("mockTestLimit", Number(e.target.value))}
            className="w-full border border-[#ffd6d6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e25252] bg-white shadow-sm"
            required
          />
          <div className="text-xs text-[#b3b3b3] mt-1">Current: {defaultForm.mockTestLimit}</div>
        </div>

        {/* Plan Type dropdown */}
        <div>
          <label className="block text-[#b03c3c] font-semibold mb-1" htmlFor="planType">
            Plan Type
          </label>
          <select
            id="planType"
            value={form.planType}
            onChange={e => handleChange("planType", e.target.value)}
            className="w-full border border-[#ffd6d6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e25252] bg-white shadow-sm"
            required
          >
            <option value="">Select plan type</option>
            {planTypes.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="text-xs text-[#b3b3b3] mt-1">Current: {defaultForm.planType}</div>
        </div>

        {/* isActive dropdown */}
        <div>
          <label className="block text-[#b03c3c] font-semibold mb-1" htmlFor="isActive">
            Is Active
          </label>
          <select
            id="isActive"
            value={form.isActive ? "true" : "false"}
            onChange={e => handleChange("isActive", e.target.value === "true")}
            className="w-full border border-[#ffd6d6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e25252] bg-white shadow-sm"
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </select>
          <div className="text-xs text-[#b3b3b3] mt-1">Current: {defaultForm.isActive ? "True" : "False"}</div>
        </div>

        {/* Weekly Predictions dropdown */}
        <div>
          <label className="block text-[#b03c3c] font-semibold mb-1" htmlFor="weeklyPredictions">
            Weekly Predictions
          </label>
          <select
            id="weeklyPredictions"
            value={form.weeklyPredictions ? "true" : "false"}
            onChange={e => handleChange("weeklyPredictions", e.target.value === "true")}
            className="w-full border border-[#ffd6d6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e25252] bg-white shadow-sm"
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </select>
          <div className="text-xs text-[#b3b3b3] mt-1">{defaultForm.weeklyPredictions ? "True" : "False"}</div>
        </div>

        {/* Performance Tracking dropdown */}
        <div>
          <label className="block text-[#b03c3c] font-semibold mb-1" htmlFor="performanceTracking">
            Performance Tracking
          </label>
          <select
            id="performanceTracking"
            value={form.performanceTracking ? "true" : "false"}
            onChange={e => handleChange("performanceTracking", e.target.value === "true")}
            className="w-full border border-[#ffd6d6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e25252] bg-white shadow-sm"
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </select>
          <div className="text-xs text-[#b3b3b3] mt-1">{defaultForm.performanceTracking ? "True" : "False"}</div>
        </div>

        {/* No Expiration dropdown */}
        <div>
          <label className="block text-[#b03c3c] font-semibold mb-1" htmlFor="noExpiration">
            No Expiration
          </label>
          <select
            id="noExpiration"
            value={form.noExpiration ? "true" : "false"}
            onChange={e => handleChange("noExpiration", e.target.value === "true")}
            className="w-full border border-[#ffd6d6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e25252] bg-white shadow-sm"
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </select>
          <div className="text-xs text-[#b3b3b3] mt-1">{defaultForm.noExpiration ? "True" : "False"}</div>
        </div>

        {/* Blocked dropdown */}
        <div>
          <label className="block text-[#b03c3c] font-semibold mb-1" htmlFor="blocked">
            Blocked
          </label>
          <select
            id="blocked"
            value={form.blocked ? "true" : "false"}
            onChange={e => handleChange("blocked", e.target.value === "true")}
            className="w-full border border-[#ffd6d6] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#e25252] bg-white shadow-sm"
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </select>
          <div className="text-xs text-[#b3b3b3] mt-1">{defaultForm.blocked ? "True" : "False"}</div>
        </div>

        {/* Update button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isLoading}
            className={`px-8 py-2 rounded-lg text-white bg-gradient-to-r from-[#e25252] to-[#ac2b2b] font-bold shadow-md transition duration-200 ${
              mutation.isLoading ? "opacity-60 cursor-not-allowed" : "hover:from-[#e25252] hover:to-[#e25252] hover:brightness-110"
            }`}
          >
            {mutation.isLoading ? "Saving..." : "Save"}
          </button>
        </div>

        {/* Success/Error messages */}
        {mutation.isError && (
          <div className="text-red-600 mt-2 text-sm">{mutation.error?.message}</div>
        )}
      </form>
    </div>
  );
}