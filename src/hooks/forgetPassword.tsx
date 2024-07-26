import { useState } from "react";
import axios from "../axios";

const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendResetLink = async (email: string) => {
    try {
      setLoading(true);
      setError("");
      await axios.post("/auth/forgot-password", { email });
      setLoading(false);
      alert("Password reset link sent!");
    } catch (err) {
      setLoading(false);
      setError("Failed to send reset link.");
    }
  };

  return { loading, error, sendResetLink };
};

export default useForgotPassword;
