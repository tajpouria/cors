const EXAMPLE_SERVER_URL = "http://localhost:8000";

export const exampleServerAPI = {
  async getStaticIndex() {
    const res = await fetch(`${EXAMPLE_SERVER_URL}/index.html`);
    await res.text();
    return res;
  },

  async getBooksResponse(reqInit: RequestInit = {}) {
    const res = await fetch(`${EXAMPLE_SERVER_URL}/book`, reqInit);
    await res.text();
    return res;
  },

  async getBookByIdResponse(id = 1) {
    const res = await fetch(`${EXAMPLE_SERVER_URL}/book/${id}`);
    await res.text();
    return res;
  },

  async deleteBookById(id = 1) {
    const res = await fetch(`${EXAMPLE_SERVER_URL}/book/${id}`, {
      method: "DELETE",
    });
    await res.text();
    return res;
  },
};
