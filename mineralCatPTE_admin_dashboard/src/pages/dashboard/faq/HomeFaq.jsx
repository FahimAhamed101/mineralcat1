import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useHomeFaqs } from "../../../hooks/useHomeFaqs";

export default function HomeFaq() {
  const [openFaqId, setOpenFaqId] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [createForm, setCreateForm] = useState({ question: "", answer: "" });

  const {
    data,
    isLoading,
    error,
    createFaq,
    createStatus,
    createError,
    updateFaq,
    updateStatus,
    updateError,
    deleteFaq,
    deleteStatus,
    deleteError,
  } = useHomeFaqs();

  const faqs = data?.faqs || data || [];

  const toggleFaq = (faqId) => {
    setOpenFaqId(openFaqId === faqId ? null : faqId);
  };

  const handleEditClick = (faq) => {
    setEditingFaq(faq._id);
    setEditForm({
      FAQId: faq._id,
      question: faq.question,
      answer: faq.answer,
    });
  };

  const handleBackFromEdit = () => {
    setEditingFaq(null);
    setEditForm({ question: "", answer: "" });
  };

  const handleChange = (field, value, mode) => {
    if (mode === "create") {
      setCreateForm((prev) => ({ ...prev, [field]: value }));
      return;
    }
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateFaq = async () => {
    if (!createForm.question.trim() || !createForm.answer.trim()) {
      toast("Question and Answer cannot be empty", {
        type: "error",
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    try {
      await createFaq(createForm);
      setCreateForm({ question: "", answer: "" });
      toast("Homepage FAQ created", {
        type: "success",
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast(err.message || "FAQ creation failed", {
        type: "error",
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleUpdateFaq = async () => {
    if (!editForm.question.trim() || !editForm.answer.trim()) {
      toast("Question and Answer cannot be empty", {
        type: "error",
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    try {
      await updateFaq({ id: editingFaq, payload: editForm });
      handleBackFromEdit();
    } catch (err) {
      toast(err.message || "FAQ update failed", {
        type: "error",
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleDeleteFaq = async (faqId) => {
    const confirmed = window.confirm("Delete this homepage FAQ?");
    if (!confirmed) {
      return;
    }
    try {
      await deleteFaq(faqId);
      toast("Homepage FAQ deleted", {
        type: "success",
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast(err.message || "FAQ delete failed", {
        type: "error",
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="[background-image:linear-gradient(to_right,#D80000,#720000)] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Homepage FAQ</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-red-700 text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Homepage FAQ</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-lg text-red-600">{error?.message || "Error loading FAQ data"}</div>
        </div>
      </div>
    );
  }

  if (editingFaq) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="[background-image:linear-gradient(to_right,#660000,#720000)] text-white px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={handleBackFromEdit}
              className="mr-3 hover:bg-red-600 p-1 rounded"
              aria-label="Back to FAQ list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Edit Homepage FAQ</h1>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="w-full mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Edit FAQ</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="question">
                  Question
                </label>
                <input
                  id="question"
                  type="text"
                  value={editForm.question}
                  onChange={(e) => handleChange("question", e.target.value)}
                  placeholder="Enter question"
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="answer">
                  Answer
                </label>
                <textarea
                  id="answer"
                  value={editForm.answer}
                  onChange={(e) => handleChange("answer", e.target.value)}
                  placeholder="Enter answer"
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleUpdateFaq}
                disabled={updateStatus === "loading"}
                className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {updateStatus === "loading" ? "Updating..." : "Update"}
              </button>

              {updateError && (
                <p className="mt-4 text-red-600">{updateError.message || "Error updating FAQ"}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-dvh bg-white overflow-y-auto">
      <div className="bg-[#660000] text-white px-6 py-4">
        <h1 className="text-xl font-semibold">Homepage FAQ</h1>
      </div>

      <div className="px-6 py-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Create Homepage FAQ</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="create-question">
              Question
            </label>
            <input
              id="create-question"
              type="text"
              value={createForm.question}
              onChange={(e) => handleChange("question", e.target.value, "create")}
              placeholder="Enter question"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="create-answer">
              Answer
            </label>
            <textarea
              id="create-answer"
              value={createForm.answer}
              onChange={(e) => handleChange("answer", e.target.value, "create")}
              placeholder="Enter answer"
              rows={5}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>
          <button
            onClick={handleCreateFaq}
            disabled={createStatus === "loading"}
            className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {createStatus === "loading" ? "Creating..." : "Create"}
          </button>
          {createError && (
            <p className="mt-4 text-red-600">{createError.message || "Error creating FAQ"}</p>
          )}
        </div>

        <div className="max-w-full mx-auto space-y-4">
          {faqs.length === 0 && (
            <p className="text-center text-gray-600">No homepage FAQs available.</p>
          )}
          {faqs.map((faq) => (
            <div key={faq._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4">
                <button
                  onClick={() => toggleFaq(faq._id)}
                  className="flex items-center flex-1 text-left focus:outline-none"
                  aria-expanded={openFaqId === faq._id}
                  aria-controls={`home-faq-answer-${faq._id}`}
                >
                  <span className="mr-3 text-gray-600">
                    {openFaqId === faq._id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </span>
                  <span className="text-gray-800 font-medium">{faq.question}</span>
                </button>

                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(faq)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    aria-label={`Edit FAQ: ${faq.question}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(faq._id)}
                    disabled={deleteStatus === "loading"}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Delete FAQ: ${faq.question}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {openFaqId === faq._id && (
                <div id={`home-faq-answer-${faq._id}`} className="px-6 pb-4">
                  <div className="pl-8 text-gray-600 leading-relaxed">{faq.answer}</div>
                </div>
              )}
            </div>
          ))}
          {deleteError && (
            <p className="text-center text-red-600">
              {deleteError.message || "Error deleting FAQ"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
