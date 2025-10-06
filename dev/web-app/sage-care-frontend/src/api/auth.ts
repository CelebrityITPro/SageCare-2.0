import { useMutation } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useSignUp = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: unknown }) => {
      const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData || new Error('Sign up failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });
};

export const useLoginUser = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: unknown }) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData || new Error('Login failed');
      }
      
      const responseData = await response.json();
      
      if (responseData.accessToken) {
        localStorage.setItem("token", responseData.accessToken);
        localStorage.setItem("userId", responseData._id);
        // Store the full user object (excluding password and accessToken)
        const { password, accessToken, ...userData } = responseData;
        localStorage.setItem("user", JSON.stringify(userData));
        return responseData;
      }
      throw new Error("No access token");
    },
  });
};
