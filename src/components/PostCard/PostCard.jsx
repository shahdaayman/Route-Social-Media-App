import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useState, useRef } from "react";
import { X, ThumbsUp, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import ActionButton from "../ActionButton/ActionButton";
import { apiServices } from "../../services/api";

export default function PostCard({ post, onDelete, onUpdate }) {
  const [localPost, setLocalPost] = useState(post);

  React.useEffect(() => {
    setLocalPost(post);
  }, [post]);

  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id || null;

  const postOwnerId = localPost?.user?._id || localPost?.user || null;
  const canModify = !!currentUserId && !!postOwnerId && currentUserId === postOwnerId;

  const displayName = localPost?.user?.name || "User";
  const displayUsername =
    localPost?.user?.username || localPost?.user?.name || "user";
  const displayAvatar = localPost?.user?.photo || "https://i.pravatar.cc/40";

  const topComment = localPost?.topComment || null;

  async function addComment(postData) {
    try {
      const response = await apiServices.createComment(localPost._id, postData);
      return response;
    } catch (err) {
      console.error("create comment error", err?.response?.data || err.message);
      throw err;
    }
  }

  const [open, setOpen] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(localPost?.body || "");
  const [editImage, setEditImage] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState(localPost?.image || null);

  const submitEdit = async () => {
    const form = new FormData();
    if (editBody) form.append("body", editBody);
    if (editImage) form.append("image", editImage);

    try {
      if (onUpdate) {
        await onUpdate(localPost._id, form);
      } else {
        await apiServices.updatePost(localPost._id, form);
        setLocalPost((p) => ({ ...p, body: editBody, image: editImageUrl }));
      }
      setEditing(false);
    } catch (err) {
      console.error("edit failed", err.response?.data || err.message);
      alert(
        "Failed to update post: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleViewComments = () => {
    navigate(`/posts/${localPost._id}`);
  };

  const [localCommentsCount, setLocalCommentsCount] = useState(
    localPost?.commentsCount || 0
  );
  const [localTopComment, setLocalTopComment] = useState(topComment);

  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const fileRef = useRef(null);
  const [posting, setPosting] = useState(false);

  const handlePickImages = () => fileRef.current?.click();

  const handleFiles = (files) => {
    const picked = Array.from(files || []);
    const onlyImages = picked.filter((f) => f.type.startsWith("image/"));

    const mapped = onlyImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...mapped]);
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      const next = [...prev];
      const removed = next.splice(idx, 1)[0];
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  const handleCreateComment = () => {
    const formData = new FormData();
    if (text.trim()) formData.set("content", text.trim());
    images.forEach((imgFile) => formData.append("image", imgFile.file || imgFile));

    setPosting(true);

    const capturedText = text.trim();

    addComment(formData)
      .then((res) => {
        const created = (res && (res.data || res.createdComment || res.comment)) || null;

        const newTop =
          created || {
            content: capturedText,
            commentCreator: { name: displayName, image: displayAvatar },
            createdAt: new Date().toISOString(),
          };

        setLocalTopComment(newTop);
        setLocalCommentsCount((c) => c + 1);

        setText("");
        images.forEach((x) => URL.revokeObjectURL(x.url));
        setImages([]);
      })
      .catch(() => {})
      .finally(() => setPosting(false));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <img
            src={displayAvatar}
            alt="avatar"
            onError={(e) => (e.target.src = "https://i.pravatar.cc/40")}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{displayName}</h3>
            <p className="text-sm text-gray-500">
              @{displayUsername} ·{" "}
              {localPost?.createdAt
                ? new Date(localPost.createdAt).toLocaleDateString()
                : "now"}{" "}
              · Public
            </p>
          </div>
        </div>

        <div className="relative inline-block">
          <MoreHorizontal
            size={20}
            className="text-gray-500 cursor-pointer"
            onClick={() => setOpen(!open)}
          />

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                Save post
              </button>

              {canModify && (
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  onClick={() => {
                    setOpen(false);
                    setEditBody(localPost?.body || "");
                    setEditImageUrl(localPost?.image || null);
                    setEditImage(null);
                    setEditing(true);
                  }}
                >
                  Edit post
                </button>
              )}

              {canModify && (
                <button
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  onClick={async () => {
                    setOpen(false);
                    const confirmed = window.confirm(
                      "Are you sure you want to delete this post?"
                    );
                    if (!confirmed) return;

                    try {
                      await onDelete?.(localPost._id);
                    } catch (err) {
                      alert(
                        "Could not delete post: " +
                          (err.response?.data?.message || err.message)
                      );
                    }
                  }}
                >
                  Delete post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="w-full bg-gray-50 rounded-xl p-4 resize-none outline-none border border-gray-200 focus:border-blue-400"
            rows={4}
          />
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                  setEditImage(file);
                  setEditImageUrl(URL.createObjectURL(file));
                }
              }}
            />
            {editImageUrl && (
              <div className="relative">
                <img
                  src={editImageUrl}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setEditImage(null);
                    setEditImageUrl(null);
                  }}
                  className="absolute top-0 right-0 bg-black/50 text-white rounded-full p-1"
                  title="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-xl"
              onClick={submitEdit}
            >
              Save
            </button>
            <button
              className="px-4 py-2 bg-gray-200 rounded-xl"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-800">{localPost?.body}</p>
          {localPost?.image && (
            <div className="bg-gray-100 border rounded-xl overflow-hidden">
              <img src={localPost.image} alt="Post image" className="w-full" />
            </div>
          )}
        </>
      )}

      <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
        <span>👍 {localPost?.likesCount || 0} likes</span>
        <div className="flex gap-4">
          <span>{localPost?.sharesCount || 0} shares</span>
          <span>{localCommentsCount || localPost?.commentsCount || 0} comments</span>
        </div>
      </div>

      <div className="flex justify-around border-t pt-3 text-gray-600">
        <ActionButton icon={<ThumbsUp size={18} />} text="Like" />

        <Link to={`/posts/${localPost._id}`}>
          <ActionButton icon={<MessageCircle size={18} />} text="Comment" />
        </Link>

        <ActionButton icon={<Share2 size={18} />} text="Share" />
      </div>

      {(localTopComment || topComment) && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500">TOP COMMENT</p>

          <div className="flex gap-3">
            <img
              src={
                (localTopComment || topComment)?.commentCreator?.image ||
                "https://i.pravatar.cc/35"
              }
              alt="avatar"
              onError={(e) => (e.target.src = "https://i.pravatar.cc/35")}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-medium text-sm">
                {(localTopComment || topComment)?.commentCreator?.name || "User"}
              </p>
              <p className="text-sm text-gray-600">
                {(localTopComment || topComment)?.content}
              </p>
            </div>
          </div>

          {(localCommentsCount || localPost?.commentsCount || 0) > 1 && (
            <button
              onClick={handleViewComments}
              className="text-blue-600 text-sm hover:underline"
            >
              {`View all ${localCommentsCount || localPost?.commentsCount || 0} comments`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}