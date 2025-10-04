import axios from 'axios';
const API_URL = 'http://localhost:5000/users'; // match backend

export const getUsers = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const registerUser = async (user) => {
  const res = await axios.post(API_URL, user); // just POST to /users
  return res.data;
};
