import fetchWithAuth from "../utils/fetchWithAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const baseUrl = import.meta.env.VITE_ADMIN_URL || "";

// Fetch all FAQs with fetchWithAuth
async function fetchFaqs() {
  if (!baseUrl) throw new Error("Base URL not set");
  const res = await fetchWithAuth(`${baseUrl}/faqs`, {
    headers: { "Content-Type": "application/json",
      
     },
    // credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch FAQs");
  return res.json();
}

// Update a FAQ by id with payload { question, answer } using fetchWithAuth
async function updateFaq(id, payload) {
  if (!baseUrl) throw new Error("Base URL not set");
  const res = await fetchWithAuth(`${baseUrl}/faqs`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to update FAQ");
  }
  return res.json();
}

export function useFaqs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["faqs"],
    queryFn: fetchFaqs,
  });

  const mutation = useMutation({
    mutationFn: ({ id, payload }) => updateFaq(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["faqs"]);
    },
  });

  return {
    ...query,
    updateFaq: mutation.mutateAsync,
    updateStatus: mutation.status,
    updateError: mutation.error,
  };
}
