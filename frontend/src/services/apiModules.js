import api from "./api";

export const authApi = {
      login: async (credentials) => {
            const response = await api.post("/auth/login", credentials);
            return response.data;
      },
      getMe: async () => {
            const response = await api.get("/auth/me");
            return response.data;
      }
};

export const categoryApi = {
      getAll: async () => {
            const response = await api.get("/categories");
            return response.data;
      },
      getById: async (id) => {
            const response = await api.get(`/categories/${id}`);
            return response.data;
      },
      create: async (data) => {
            const response = await api.post("/categories", data);
            return response.data;
      },
      update: async (id, data) => {
            const response = await api.put(`/categories/${id}`, data);
            return response.data;
      },
      delete: async (id) => {
            const response = await api.delete(`/categories/${id}`);
            return response.data;
      }
};

export const productApi = {
      getAll: async (params = {}) => {
            const response = await api.get("/products", { params });
            return response.data;
      },
      getById: async (id) => {
            const response = await api.get(`/products/${id}`);
            return response.data;
      },
      create: async (data) => {
            const response = await api.post("/products", data);
            return response.data;
      },
      update: async (id, data) => {
            const response = await api.put(`/products/${id}`, data);
            return response.data;
      },
      delete: async (id) => {
            const response = await api.delete(`/products/${id}`);
            return response.data;
      }
};

export const supplierApi = {
      getAll: async () => {
            const response = await api.get("/suppliers");
            return response.data;
      },
      getById: async (id) => {
            const response = await api.get(`/suppliers/${id}`);
            return response.data;
      },
      create: async (data) => {
            const response = await api.post("/suppliers", data);
            return response.data;
      },
      update: async (id, data) => {
            const response = await api.put(`/suppliers/${id}`, data);
            return response.data;
      },
      delete: async (id) => {
            const response = await api.delete(`/suppliers/${id}`);
            return response.data;
      }
};

export const stockApi = {
      stockIn: async (data) => {
            const response = await api.post("/stock/in", data);
            return response.data;
      },
      stockOut: async (data) => {
            const response = await api.post("/stock/out", data);
            return response.data;
      },
      updateOrder: async (data) => {
            const response = await api.post("/stock/update-order", data);
            return response.data;
      },
      deleteOrder: async (data) => {
            const response = await api.post("/stock/delete-order", data);
            return response.data;
      },
      stockAdjustment: async (data) => {
            const response = await api.post("/stock/adjustment", data);
            return response.data;
      },
      getHistory: async (params = {}) => {
            const response = await api.get("/stock/history", { params });
            return response.data;
      },
      getLowStock: async () => {
            const response = await api.get("/stock/low-stock");
            return response.data;
      }
};

export const uploadApi = {
      uploadImage: async (file) => {
            const formData = new FormData();
            formData.append("image", file);
            const response = await api.post("/upload/image", formData, {
                  headers: {
                        "Content-Type": "multipart/form-data"
                  }
            });
            return response.data;
      }
};

export const dashboardApi = {
      getStats: async () => {
            const response = await api.get("/dashboard");
            return response.data;
      }
};
