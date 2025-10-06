import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useGetUserDetails = () => {
  const userId = localStorage.getItem("userId");
  
  return useQuery({
    queryKey: ["getUser", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("No user ID found");
      }
      
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      
      if (token) {
        headers["token"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      
      return response.json();
    },
    enabled: !!userId, // Only run query if userId exists
  });
};

export const useUpdateUserProfile = () => {
  const userId = localStorage.getItem("userId");
  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!userId) throw new Error("No user ID found");
      
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      
      if (token) {
        headers["token"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PATCH',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }
      
      return response.json();
    },
  });
};
