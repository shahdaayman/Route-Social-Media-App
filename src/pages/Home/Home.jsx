import { useEffect, useState, useRef } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiServices } from "../../services/api";
import { authContext } from "../../contexts/authContext";
import {
  Image,
  Smile,
  Send,
  Users,
  Bookmark,
  Newspaper,
  UserPlus,
  Search,
} from "lucide-react";
import PostCard from "../../components/PostCard/PostCard";
import profilePic from "../../assets/image2.png";

export default function Home() {
  const { userToken } = useContext(authContext);
  const [posts, setPosts] = useState([]);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const displayName = currentUser?.name || "User";
  const displayAvatar =
    currentUser?.photo || currentUser?.image || "https://i.pravatar.cc/40";

  const handleDelete = async (postId) => {
    console.log("attempting delete for postId", postId, "token", userToken);
    if (!userToken) {
      console.warn("no userToken, cannot delete");
      return;
    }
    try {
      apiServices.setToken(userToken);
      const res = await apiServices.deletePost(postId);
      console.log("delete response", res);
      setPosts((prev) => {
        const next = prev.filter((p) => p._id !== postId);
        console.log("posts before", prev.length, "after", next.length);
        return next;
      });
      await getPosts();
    } catch (err) {
      console.error(
        "Failed to delete post:",
        err.response?.data || err.message,
      );
    }
  };

  const handleUpdate = async (postId, updateData) => {
    console.log("attempting update for", postId, updateData);
    if (!userToken) {
      console.warn("no token, cannot update");
      return;
    }
    try {
      apiServices.setToken(userToken);
      const res = await apiServices.updatePost(postId, updateData);
      console.log("update response", res);
      const updatedPost =
        (res && (res.data || res.post || res.updatedPost)) || null;
      if (updatedPost) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, ...updatedPost } : p)),
        );
      } else {
        await getPosts();
      }
    } catch (err) {
      console.error(
        "Failed to update post:",
        err.response?.data || err.message,
      );
      alert(
        "Could not update post: " +
          (err.response?.data?.message || err.message),
      );
    }
  };
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [creating, setCreating] = useState(false);

  async function getPosts() {
    try {
      apiServices.setToken(userToken);
      const response = await apiServices.getPosts();

      console.log("API Response:", response);

      const postsData =
        response?.data?.posts || response?.posts || response || [];
      setPosts(Array.isArray(postsData) ? postsData : []);
      console.log("Posts set:", Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.error(
        "Error fetching posts:",
        error.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userToken) {
      getPosts();
    } else {
      setLoading(false);
      setPosts([]);
    }
  }, [userToken]);

  const friends = [
    {
      id: 1,
      name: "Ahmed Bahnasy",
      username: "@bahnasy20222",
      followers: 198,
      image: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: 2,
      name: "Ahmed Abd Al...",
      username: "@ahmedmutti",
      followers: 119,
      image: "https://i.pravatar.cc/150?img=5",
    },
    {
      id: 3,
      name: "Ahmed Bahnasy",
      username: "@bahnasy20222w2",
      followers: 96,
      image: "https://i.pravatar.cc/150?img=8",
    },
    {
      id: 4,
      name: "Nourhan",
      username: "@nourhan",
      followers: 63,
      image: "https://i.pravatar.cc/150?img=9",
    },
    {
      id: 5,
      name: "mohamed",
      username: "route user",
      followers: 49,
      image: "https://i.pravatar.cc/150?img=12",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        {/* ================= LEFT SIDEBAR ================= */}

        <div className="col-span-3">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <SidebarItem icon={<Newspaper size={20} />} text="Feed" active />
            <SidebarItem icon={<Users size={20} />} text="My Posts" />
            <SidebarItem icon={<Users size={20} />} text="Community" />
            <SidebarItem icon={<Bookmark size={20} />} text="Saved" />
          </div>
        </div>

        {/* ================= CENTER CONTENT ================= */}
        <div className="col-span-6 space-y-6">
          {/* Create Post */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={displayAvatar}
                alt="avatar"
                onError={(e) => (e.target.src = "https://i.pravatar.cc/40")}
                className="w-10 h-10 rounded-full object-cover"
              />

              <div>
                <h3 className="font-semibold text-gray-800">{displayName}</h3>

                <select className="text-xs bg-gray-100 px-2 py-1 rounded-md mt-1 outline-none">
                  <option>Public</option>
                  <option>Friends</option>
                </select>
              </div>
            </div>

            <textarea
              placeholder={`What's on your mind, ${displayName}?`}
              className="w-full bg-gray-50 rounded-xl p-4 resize-none outline-none border border-gray-200 focus:border-blue-400"
              rows="4"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />

            {selectedImage && (
              <div className="mt-3">
                <div className="bg-gray-100 border rounded-xl overflow-hidden">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="preview"
                    className="w-full max-h-60 object-cover"
                  />
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (file) setSelectedImage(file);
              }}
            />

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-6 text-gray-600">
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <Image size={18} />
                  Photo/video
                </button>
                <button className="flex items-center gap-2 hover:text-yellow-500">
                  <Smile size={18} />
                  Feeling/activity
                </button>
              </div>

              <button
                onClick={async () => {
                  if (!postText && !selectedImage) return;
                  if (!userToken) return;
                  setCreating(true);
                  apiServices.setToken(userToken);

                  const formData = new FormData();
                  if (postText) formData.append("body", postText);
                  if (selectedImage) formData.append("image", selectedImage);

                  try {
                    const res = await apiServices.createPost(formData);
                    await getPosts();

                    setPostText("");
                    setSelectedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = null;
                  } catch (err) {
                    console.error(
                      "Error creating post:",
                      err.response?.data || err.message,
                    );
                  } finally {
                    setCreating(false);
                  }
                }}
                disabled={creating || (!postText && !selectedImage)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-xl transition disabled:opacity-60"
              >
                {creating ? "Posting..." : "Post"}
                <Send size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
              No posts yet. Be the first one to publish.
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))
          )}
        </div>

        <div className="col-span-3 bg-white rounded-2xl shadow-md p-2 h-fit">
          <div className="flex items-center justify-between mb-4 m-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus size={18} className="text-blue-500" />
              Suggested Friends
            </h2>

            <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
              {friends.length}
            </span>
          </div>

          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search friends..."
              className="w-full pl-9 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>

          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div>
                    <h3 className="font-medium text-sm">{friend.name}</h3>
                    <p className="text-gray-500 text-xs">{friend.username}</p>
                    <span className="inline-block mt-1 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                      {friend.followers} followers
                    </span>
                  </div>
                </div>

                <button className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-200 transition">
                  <UserPlus size={14} />
                  Follow
                </button>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm font-medium">
            View more
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, text, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition ${
        active
          ? "bg-blue-50 text-blue-600 font-medium"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      {icon}
      {text}
    </div>
  );
}
