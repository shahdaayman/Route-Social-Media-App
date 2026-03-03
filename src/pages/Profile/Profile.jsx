import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import { authContext } from "../../contexts/authContext";
import PostCard from "../../components/PostCard/PostCard";
import { Mail, Users, FileText, Bookmark } from "lucide-react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const { userToken } = useContext(authContext);

  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const handleDelete = async (postId) => {
    if (!userToken) return;
    try {
      await axios.delete(`https://route-posts.routemisr.com/posts/${postId}/`, {
        headers: { token: userToken },
      });
      setMyPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error(
        "Failed to delete post from profile:",
        err.response?.data || err.message,
      );
      alert(
        "Could not delete post: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleUpdate = async (postId, updateData) => {
    if (!userToken) return;
    try {
      const res = await axios.put(
        `https://route-posts.routemisr.com/posts/${postId}/`,
        updateData,
        { headers: { token: userToken } },
      );

      const updated = res.data?.data?.post || res.data || null;

      if (updated) {
        setMyPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, ...updated } : p)),
        );
      }
    } catch (err) {
      console.error(
        "Failed to update post from profile:",
        err.response?.data || err.message,
      );
      alert(
        "Could not update post: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  useEffect(() => {
    if (!userToken || !userInfo) {
      setLoadingPosts(false);
      return;
    }

    const fetchPosts = async () => {
      setLoadingPosts(true);

      try {
        try {
          const directResp = await axios.get(
            `https://route-posts.routemisr.com/posts?user=${userInfo._id}`,
            { headers: { token: userToken } },
          );

          const directPosts =
            directResp.data?.data?.posts ||
            directResp.data?.posts ||
            directResp.data ||
            [];

          if (Array.isArray(directPosts)) {
            setMyPosts(directPosts);
            return;
          }
        } catch (err) {
          console.warn("direct user query failed", err.message);
        }

        const pageSize = 20;
        let page = 1;
        const collected = [];

        while (page <= 10) {
          const resp = await axios.get(
            `https://route-posts.routemisr.com/posts?page=${page}&limit=${pageSize}`,
            { headers: { token: userToken } },
          );

          const all =
            resp.data?.data?.posts || resp.data?.posts || resp.data || [];
          if (!Array.isArray(all) || all.length === 0) break;

          const filteredOnPage = all.filter((p) => {
            const ownerId = p?.user?._id || p?.user || null;
            return ownerId === userInfo._id;
          });

          collected.push(...filteredOnPage);

          if (all.length < pageSize) break;
          page += 1;
        }

        setMyPosts(collected);
      } catch (err) {
        console.error(
          "Error loading profile posts:",
          err.response?.data || err.message,
        );
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [userToken, userInfo]);

  const normalizedPosts = useMemo(() => {
    return myPosts.map((p) => {
      const u = p?.user;

      const safeUser =
        u && typeof u === "object"
          ? {
              ...u,
              name: u.name ?? userInfo?.name,
              username: u.username ?? userInfo?.username,
              photo: u.photo ?? userInfo?.photo,
              _id: u._id ?? userInfo?._id,
            }
          : {
              _id: userInfo?._id,
              name: userInfo?.name,
              username: userInfo?.username,
              photo: userInfo?.photo,
            };

      return { ...p, user: safeUser };
    });
  }, [myPosts, userInfo]);

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto pt-30">
      <div className="h-64 rounded-3xl bg-gradient-to-r from-slate-800 via-blue-900 to-blue-400" />

      <div className="-mt-20 bg-white rounded-3xl shadow-lg p-8 relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-6">
            <img
              src={userInfo?.photo || "https://i.pravatar.cc/150?img=12"}
              alt="profile"
              className="w-28 h-28 rounded-full border-4 border-white shadow-md"
            />

            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {userInfo?.name || "Unnamed"}
              </h2>
              <p className="text-gray-500 text-lg">
                @{userInfo?.username || "user"}
              </p>

              <span className="inline-flex items-center gap-2 mt-3 bg-blue-100 text-blue-600 text-sm px-4 py-1.5 rounded-full font-medium">
                <Users size={16} />
                Route Posts member
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {["Followers", "Following", "Bookmarks"].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 border rounded-2xl px-8 py-5 text-center min-w-[140px]"
              >
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {item}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">0</h3>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          <div className="lg:col-span-2 bg-gray-50 border rounded-2xl p-6">
            <h3 className="font-semibold text-gray-700 mb-4">About</h3>

            <div className="flex items-center gap-3 text-gray-600 mb-3">
              <Mail size={18} />
              <span>{userInfo?.username}@gmail.com</span>
            </div>

            <div className="flex items-center gap-3 text-gray-600">
              <Users size={18} />
              <span>Active on Route Posts</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <p className="text-xs font-semibold text-blue-600 uppercase">
                My Posts
              </p>
              <h3 className="text-3xl font-bold mt-2">{myPosts.length}</h3>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <p className="text-xs font-semibold text-blue-600 uppercase">
                Saved Posts
              </p>
              <h3 className="text-3xl font-bold mt-2">0</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between mt-5">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "posts"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <FileText size={16} />
            My Posts
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === "saved"
                ? "bg-white shadow text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <Bookmark size={16} />
            Saved
          </button>
        </div>

        <div className="bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1 rounded-full">
          {myPosts.length}
        </div>
      </div>

      {activeTab === "posts" && (
        <div className="mt-5 space-y-4">
          {loadingPosts ? (
            <p className="text-gray-500">Loading posts...</p>
          ) : normalizedPosts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between mt-5">
              <p className="text-gray-500 text-sm">You have not posted yet.</p>
            </div>
          ) : (
            normalizedPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "saved" && (
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between mt-5">
          <p className="text-gray-500 text-sm">No saved posts yet.</p>
        </div>
      )}
    </div>
  );
}
