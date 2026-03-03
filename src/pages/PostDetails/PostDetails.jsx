import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { authContext } from "../../contexts/authContext";
import {
  MoreHorizontal,
  X,
  ThumbsUp,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Smile,
  Send,
} from "lucide-react";
import ActionButton from "../../components/ActionButton/ActionButton";
import { apiServices } from "../../services/api";
import profilePic from "../../assets/image2.png";

export default function PostDetails() {
  const { id } = useParams(); // postId
  const navigate = useNavigate();
  const { userToken } = useContext(authContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState(null);

  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [openCommentMenuId, setOpenCommentMenuId] = useState(null);

  const [commentContent, setCommentContent] = useState("");
  const [commentImages, setCommentImages] = useState([]); 
  const [commentLoading, setCommentLoading] = useState(false);
  const commentFileRef = useRef(null);
  const commentFormRef = useRef(null);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [editCommentImage, setEditCommentImage] = useState(null);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const currentUserId = currentUser?._id || null;

  const postOwnerId = post?.user?._id || post?.user || null;
  const isPostOwner =
    !!currentUserId && !!postOwnerId && currentUserId === postOwnerId;

  useEffect(() => {
    const close = () => {
      setPostMenuOpen(false);
      setOpenCommentMenuId(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (post) {
      setEditBody(post.body || "");
      setEditImageUrl(post.image || null);
      setEditImage(null);
    }
  }, [post]);

  useEffect(() => {
    if (!id || !userToken) return;

    const fetchPost = async () => {
      const resp = await axios.get(
        `https://route-posts.routemisr.com/posts/${id}`,
        { headers: { token: userToken } },
      );

      const p =
        resp.data?.data?.post ||
        (Array.isArray(resp.data?.data?.posts) && resp.data.data.posts[0]) ||
        null;

      setPost(p);
    };

    const fetchComments = async () => {
      const resp = await axios.get(
        `https://route-posts.routemisr.com/posts/${id}/comments?page=1&limit=50`,
        { headers: { token: userToken } },
      );
      setComments(resp.data?.data?.comments || []);
    };

    Promise.all([fetchPost(), fetchComments()])
      .catch((err) => {
        console.error(
          "PostDetails fetch error:",
          err.response?.data || err.message,
        );
      })
      .finally(() => setLoading(false));
  }, [id, userToken]);


  const safeMergePost = (prev, updated) => {
    if (!updated) return prev;

    const next = { ...prev, ...updated };

    const updatedUser = updated?.user;

    const updatedUserIsBad =
      !updatedUser ||
      typeof updatedUser === "string" ||
      (typeof updatedUser === "object" &&
        !updatedUser.name &&
        !updatedUser.username &&
        !updatedUser.photo);

    if (updatedUserIsBad) {
      next.user = prev.user;
    } else {
      next.user = { ...prev.user, ...updatedUser };
    }

    return next;
  };

  const handleSave = async () => {
    if (!userToken || !post?._id) return;

    const form = new FormData();
    if (editBody) form.append("body", editBody);
    if (editImage) form.append("image", editImage);

    try {
      const resp = await axios.put(
        `https://route-posts.routemisr.com/posts/${post._id}/`,
        form,
        { headers: { token: userToken } },
      );

      const updated =
        resp.data?.data?.post || resp.data?.data || resp.data || null;

      setPost((prev) => safeMergePost(prev, updated));
      setEditing(false);
    } catch (err) {
      console.error("update post error", err.response?.data || err.message);
      alert(
        "Failed to update post: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDeletePost = async () => {
    if (!userToken || !post?._id) return;
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(
        `https://route-posts.routemisr.com/posts/${post._id}/`,
        { headers: { token: userToken } },
      );
      navigate("/profile");
    } catch (err) {
      console.error("delete post error", err.response?.data || err.message);
      alert(
        "Failed to delete post: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handlePickCommentImages = (e) => {
    e.stopPropagation();
    commentFileRef.current?.click();
  };

  const handleCommentFiles = (files) => {
    const picked = Array.from(files || []);
    const onlyImages = picked.filter((f) => f.type.startsWith("image/"));

    const mapped = onlyImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setCommentImages((prev) => [...prev, ...mapped]);
  };

  const removeCommentImage = (idx) => {
    setCommentImages((prev) => {
      const next = [...prev];
      const removed = next.splice(idx, 1)[0];
      if (removed?.url) URL.revokeObjectURL(removed.url);
      return next;
    });
  };

  const canSendComment =
    commentContent.trim().length > 0 || commentImages.length > 0;

  const handleCreateComment = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userToken) return alert("Please login first");
    if (!id) return;

    if (!canSendComment) return;

    const form = new FormData();
    if (commentContent.trim()) form.append("content", commentContent.trim());
    commentImages.forEach((x) => form.append("image", x.file));

    try {
      setCommentLoading(true);

      const resp = await axios.post(
        `https://route-posts.routemisr.com/posts/${id}/comments`,
        form,
        { headers: { token: userToken } },
      );

      const created = resp.data?.data?.comment || resp.data?.data || null;

      if (created) {
        setComments((prev) => [created, ...prev]);
      } else {
        const r = await axios.get(
          `https://route-posts.routemisr.com/posts/${id}/comments?page=1&limit=50`,
          { headers: { token: userToken } },
        );
        setComments(r.data?.data?.comments || []);
      }

      setCommentContent("");
      commentImages.forEach((x) => URL.revokeObjectURL(x.url));
      setCommentImages([]);
    } catch (err) {
      console.error("create comment error", err.response?.data || err.message);
      alert(
        "Failed to create comment: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setCommentLoading(false);
    }
  };

  const handleUpdateComment = async (postId, commentId) => {
    if (!userToken) return;

    const form = new FormData();
    if (editCommentContent) form.append("content", editCommentContent);
    if (editCommentImage) form.append("image", editCommentImage);

    try {
      apiServices.setToken(userToken);
      const resp = await apiServices.updateComment(postId, commentId, form);

      const updated =
        resp?.data?.comment || resp?.comment || resp?.data || null;

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                content: updated?.content ?? editCommentContent,
                image: updated?.image ?? c.image,
              }
            : c,
        ),
      );

      setEditingCommentId(null);
      setEditCommentContent("");
      setEditCommentImage(null);
    } catch (err) {
      console.error("update comment error", err.response?.data || err.message);
      alert(
        "Failed to update comment: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!userToken) return;
    if (!window.confirm("Delete this comment?")) return;

    try {
      apiServices.setToken(userToken);
      await apiServices.deleteComment(postId, commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("delete comment error", err.response?.data || err.message);
      alert(
        "Failed to delete comment: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        <p>Post not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const topComment = post.topComment || (comments[0] ?? null);

  const displayPostName = post?.user?.name || "User";
  const displayPostAvatar = post?.user?.photo || "https://i.pravatar.cc/40";

  const meName = currentUser?.name || "user";
  const meAvatar =
    post.user.image || currentUser?.photo || "https://i.pravatar.cc/40";

  return (
    <div className="min-h-screen bg-gray-100 px-100 py-7 pt-30">
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <img
              src={displayPostAvatar}
              alt="avatar"
              onError={(e) => (e.target.src = "https://i.pravatar.cc/40")}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-800">{displayPostName}</h3>
              <p className="text-sm text-gray-500">
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString()
                  : "now"}{" "}
                · Public
              </p>
            </div>
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => setPostMenuOpen((p) => !p)}
            >
              <MoreHorizontal size={20} className="text-gray-600" />
            </button>

            {postMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">
                  Save post
                </button>

                {isPostOwner && (
                  <>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => {
                        setPostMenuOpen(false);
                        setEditBody(post.body || "");
                        setEditImageUrl(post.image || null);
                        setEditImage(null);
                        setEditing(true);
                      }}
                    >
                      Edit post
                    </button>

                    <button
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                      onClick={() => {
                        setPostMenuOpen(false);
                        handleDeletePost();
                      }}
                    >
                      Delete post
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-3 mt-2">
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
                onClick={handleSave}
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
            <p className="text-gray-800 mt-2">{post.body}</p>
            {post.image && (
              <div className="bg-gray-100 border rounded-xl overflow-hidden mt-2">
                <img src={post.image} alt="Post" className="w-full" />
              </div>
            )}
          </>
        )}

        <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
          <span>👍 {post?.likesCount || 0} likes</span>
          <div className="flex gap-4">
            <span>{post?.sharesCount || 0} shares</span>
            <span>{post?.commentsCount || comments.length || 0} comments</span>
          </div>
        </div>

        <div className="flex justify-around border-t pt-3 text-gray-600">
          <ActionButton icon={<ThumbsUp size={18} />} text="Like" />
          <ActionButton
            icon={<MessageCircle size={18} />}
            text="Comment"
            onClick={() =>
              commentFormRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
            }
          />
          <ActionButton icon={<Share2 size={18} />} text="Share" />
        </div>

        {topComment && comments.length > 1 && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500">TOP COMMENT</p>
            <div className="flex gap-3">
              <img
                src={topComment.commentCreator?.image || profilePic}
                alt="avatar"
                onError={(e) => (e.target.src = "https://i.pravatar.cc/35")}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="font-medium text-sm">
                  {topComment.commentCreator?.name || "User"}
                </p>
                <p className="text-sm text-gray-600">{topComment.content}</p>
              </div>
            </div>
          </div>
        )}

        {comments.length > 0 && (
          <div className="space-y-4 mt-4">
            {comments.map((c) => {
              const commentOwnerId = c.commentCreator?._id || null;
              const isOwner =
                !!currentUserId && currentUserId === commentOwnerId;

              return (
                <div key={c._id} className="flex gap-3">
                  <img
                    src={c.commentCreator?.image || "https://i.pravatar.cc/35"}
                    alt="avatar"
                    onError={(e) => (e.target.src = "https://i.pravatar.cc/35")}
                    className="w-8 h-8 rounded-full"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">
                          {c.commentCreator?.name || "User"}
                        </p>

                        {editingCommentId === c._id ? (
                          <div className="space-y-2 mt-2">
                            <textarea
                              value={editCommentContent}
                              onChange={(e) =>
                                setEditCommentContent(e.target.value)
                              }
                              className="w-full p-2 border rounded-lg"
                              rows={3}
                            />

                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setEditCommentImage(e.target.files?.[0] || null)
                              }
                            />

                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="px-3 py-1 bg-blue-500 text-white rounded-lg"
                                onClick={() => handleUpdateComment(id, c._id)}
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                className="px-3 py-1 bg-gray-200 rounded-lg"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditCommentContent("");
                                  setEditCommentImage(null);
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 mt-1">
                              {c.content}
                            </p>
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

                      {/* Comment menu */}
                      {isOwner && editingCommentId !== c._id && (
                        <div
                          className="relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="p-1 rounded-full hover:bg-gray-100"
                            onClick={() =>
                              setOpenCommentMenuId(
                                openCommentMenuId === c._id ? null : c._id,
                              )
                            }
                          >
                            <MoreHorizontal
                              size={18}
                              className="text-gray-600"
                            />
                          </button>

                          {openCommentMenuId === c._id && (
                            <div className="absolute right-0 mt-2 w-28 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2">
                              <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                onClick={() => {
                                  setOpenCommentMenuId(null);
                                  setEditingCommentId(c._id);
                                  setEditCommentContent(c.content || "");
                                  setEditCommentImage(null);
                                }}
                              >
                                Edit
                              </button>

                              <button
                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                                onClick={() => {
                                  setOpenCommentMenuId(null);
                                  handleDeleteComment(id, c._id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <form
          ref={commentFormRef}
          onSubmit={handleCreateComment}
          onClick={(e) => e.stopPropagation()}
          className="mt-4 pt-10"
        >
          <div className="flex items-start gap-3">
            <img
              src={meAvatar}
              alt="me"
              onError={(e) => (e.target.src = "https://i.pravatar.cc/40")}
              className="w-10 h-10 rounded-full object-cover"
            />

            <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 border border-gray-200">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                rows={1}
                placeholder={`Comment as ${meName}...`}
                className="w-full resize-none bg-transparent outline-none text-gray-800 placeholder:text-gray-500"
              />

              {commentImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {commentImages.map((img, idx) => (
                    <div
                      key={img.url}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-white"
                    >
                      <img
                        src={img.url}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeCommentImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/70 text-white rounded-full p-1"
                        aria-label="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handlePickCommentImages}
                    className="text-gray-500 hover:text-gray-700"
                    title="Add image"
                  >
                    <ImageIcon size={18} />
                  </button>

                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    title="Emoji"
                    onClick={() => setCommentContent((t) => t + " 😊")}
                  >
                    <Smile size={18} />
                  </button>

                  <input
                    ref={commentFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleCommentFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSendComment || commentLoading}
                  aria-busy={commentLoading}
                  className={[
                    "w-10 h-10 rounded-full flex items-center justify-center transition",
                    !canSendComment || commentLoading
                      ? "bg-blue-200 text-white cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white",
                  ].join(" ")}
                  title={commentLoading ? "Posting..." : "Send"}
                >
                  <Send
                    size={18}
                    className={commentLoading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
