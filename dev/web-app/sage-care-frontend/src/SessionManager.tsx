import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionManager = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const logout = () => {
      localStorage.clear();
      navigate("/login");
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logout, 30 * 60 * 1000); // 30 minutes
    };

    // Listen for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    // Only clear localStorage on tab close, not on refresh
    const handleBeforeUnload = () => {
      // Don't clear localStorage on refresh, only on tab close
      // The session will be maintained
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    resetTimer(); // Start timer

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [navigate]);

  return null;
};

export default SessionManager; 