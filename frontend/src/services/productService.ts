import axios from "./api";

export const getProducts = async () => {
  const res = await axios.get("/products");
  return res.data;
};
