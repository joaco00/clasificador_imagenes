import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const getImages = async (skip = 0, limit = 1) => {
  const res = await axios.get(`${API_URL}/images/?skip=${skip}&limit=${limit}`);
  return res.data;
};

export const getFilters = async () => {
  const res = await axios.get(`${API_URL}/filters/`);
  return res.data;
};

export const createFilter = async (name) => {
  const res = await axios.post(`${API_URL}/filters/`, { name });
  return res.data;
};

export const addFilterToImage = async (imageId, filterId) => {
  const res = await axios.post(`${API_URL}/images/${imageId}/filters/${filterId}`);
  return res.data;
};

export const getProcessedImages = async () => {
  const res = await axios.get(`${API_URL}/images/processed`);
  return res.data;
};

export const getUnprocessedImages = async () => {
  const res = await axios.get(`${API_URL}/images/unprocessed`);
  return res.data;
};
