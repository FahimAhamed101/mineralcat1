import fetchWithAuth from "../utils/fetchWithAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const baseUrl = import.meta.env.VITE_ADMIN_URL || "";

async function fetchHomeFaqs() {
  if (!baseUrl) throw new Error("Base URL not set");
  const res = await fetchWithAuth(`${baseUrl}/faqs/home/all`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch home FAQs");
  return res.json();
}

async function createHomeFaq(payload) {
  if (!baseUrl) throw new Error("Base URL not set");
  const res = await fetchWithAuth(`${baseUrl}/faqs/home`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to create home FAQ");
  }
  return res.json();
}

async function updateFaq(id, payload) {
  if (!baseUrl) throw new Error("Base URL not set");
  const res = await fetchWithAuth(`${baseUrl}/faqs`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to update FAQ");
  }
  return res.json();
}

async function deleteHomeFaq(id) {
  if (!baseUrl) throw new Error("Base URL not set");
  const res = await fetchWithAuth(`${baseUrl}/faqs/home/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to delete FAQ");
  }
  return res.json();
}

export function useHomeFaqs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["home-faqs"],
    queryFn: fetchHomeFaqs,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createHomeFaq(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["home-faqs"]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateFaq(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["home-faqs"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteHomeFaq(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["home-faqs"]);
    },
  });

  return {
    ...query,
    createFaq: createMutation.mutateAsync,
    createStatus: createMutation.status,
    createError: createMutation.error,
    updateFaq: updateMutation.mutateAsync,
    updateStatus: updateMutation.status,
    updateError: updateMutation.error,
    deleteFaq: deleteMutation.mutateAsync,
    deleteStatus: deleteMutation.status,
    deleteError: deleteMutation.error,
  };
}
