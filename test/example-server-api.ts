const EXAMPLE_SERVER_URL = "http://localhost:8000";

export const exampleServerAPI = {
  async getStaticIndex() {
    const res = await fetch(`${EXAMPLE_SERVER_URL}/index.html`);
    await res.text();
    return res;
  },

  async getBooksResponse() {
    const res = await fetch(`${EXAMPLE_SERVER_URL}/book`);
    await res.text();
    return res;
  },

  async getBookByIdResponse(id: number) {
    const res = await fetch(`${EXAMPLE_SERVER_URL}/book/${id}`);
    await res.text();
    return res;
  },
};
