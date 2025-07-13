import axios from 'axios';

const API_URL = 'http://localhost:5678'; // Update with your backend URL

export const ingestDocument = async (url) => {
  const response = await axios.post(`${API_URL}/ingest`, { url });
  return response.data;
};

export const askQuestion = async (question) => {
  const response = await axios.post(`${API_URL}/rag`, { query: question });
  return response.data;
};