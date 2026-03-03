import { useState } from "react";
import { apiServices } from "../../services/api";

export default function CommentsList({ initialComments = [], onChanged }) {
  const [comments, setComments] = useState(initialComments);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editImage, setEditImage] = useState(null);

  const startEdit = (c) => {
    setEditingId(c._id);
    setEditText(c.content || "");
    setEditImage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditImage(null);
  };

  const submitEdit = async (commentId) => {
    const fd = new FormData();
    if (editText.trim()) fd.append("content", editText.trim());
    if (editImage) fd.append("image", editImage);

    try {
      const res = await apiServices.updateComment(commentId, fd);

      const updated =
        res?.data || res?.comment || res?.updatedComment || null;

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                content: updated?.content ?? editText.trim(),
                image: updated?.image ?? c.image,
              }
            : c
        )
      );

      cancelEdit();
      onChanged?.(); 
    } catch (err) {
      alert(
        "Failed to update comment: " +
          (err?.response?.data?.message || err.message)
      );
    }
  };

  const handleDelete = async (commentId) => {
    const ok = window.confirm("Delete this comment?");
    if (!ok) return;

    try {
      await apiServices.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      onChanged?.(); 
    } catch (err) {
      alert(
        "Failed to delete comment: " +
          (err?.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c._id} className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-sm font-semibold">
                {c.commentCreator?.name || "User"}
              </div>

              {editingId === c._id ? (
                <>
                  <textarea
                    className="w-full mt-2 p-2 rounded-lg border"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                  />
                  <input
                    className="mt-2"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                  />

                  <div className="mt-2 flex gap-2">
                    <button
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white"
                      onClick={() => submitEdit(c._id)}
                    >
                      Save
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg bg-gray-200"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-700 mt-1">{c.content}</div>
                  {c.image && (
                    <img
                      src={c.image}
                      alt="comment"
                      className="mt-2 max-w-xs rounded-lg"
                    />
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                className="text-sm text-blue-600"
                onClick={() => startEdit(c)}
              >
                Edit
              </button>
              <button
                className="text-sm text-red-600"
                onClick={() => handleDelete(c._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}