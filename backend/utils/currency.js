import fetch from "node-fetch";

export const convertCurrency = async (amount, from, to) => {
  // Placeholder: Replace with real currency API call
  // Example API: https://exchangerate-api.com
  // For demo, assume 1 USD = 82 INR
  const rate = (from === "USD" && to === "INR") ? 82 : 1;
  return amount * rate;
};
