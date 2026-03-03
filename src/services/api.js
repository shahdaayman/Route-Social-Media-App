import axios from "axios";

class ApiServices {
  token = localStorage.getItem("token");

  setToken(token) {
    this.token = token;
  }

  async getPosts() {
    const { data } = await axios.get(
      "https://route-posts.routemisr.com/posts",
      { headers: { token: this.token } },
    );
    return data;
  }

  async createPost(formData) {
    const { data } = await axios.post(
      "https://route-posts.routemisr.com/posts",
      formData,
      {
        headers: {
          token: this.token,
        },
      },
    );

    return data;
  }

  async createComment(postId, formData) {
    const { data } = await axios.post(
      "https://route-posts.routemisr.com/posts/" + postId + "/comments",
      formData,
      {
        headers: {
          token: this.token,
        },
      },
    );
    return data;
  }

  async deletePost(postId) {
    console.log("apiServices.deletePost called", postId, "token", this.token);
    const { data } = await axios.delete(
      `https://route-posts.routemisr.com/posts/${postId}/`,
      { headers: { token: this.token } },
    );
    console.log("apiServices.deletePost response", data);
    return data;
  }

  async updatePost(postId, formData) {
    console.log("apiServices.updatePost called", postId);
    const { data } = await axios.put(
      `https://route-posts.routemisr.com/posts/${postId}/`,
      formData,
      { headers: { token: this.token } },
    );
    console.log("apiServices.updatePost response", data);
    return data;
  }
  async updateComment(postId, commentId, formData) {
    const { data } = await axios.put(
      `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/`,
      formData,
      { headers: { token: this.token } },
    );
    return data;
  }

  async deleteComment(postId, commentId) {
    const { data } = await axios.delete(
      `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/`,
      { headers: { token: this.token } },
    );
    return data;
  }

  async changePassword(password, newPassword) {
    const { data } = await axios.patch(
      "https://route-posts.routemisr.com/users/change-password",
      { password, newPassword },
      { headers: { token: this.token } },
    );
    return data;
  }
}

export const apiServices = new ApiServices();
