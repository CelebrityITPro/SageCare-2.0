import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Request } from "./request";

export const useGetUserDetails = () => {
  const userId = localStorage.getItem("userId");
  
  return useQuery({
    queryKey: ["getUser", userId],
    queryFn: () => {
      if (!userId) {
        throw new Error("No user ID found");
      }
      return Request.get(`/users/${userId}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw new err();
        });
    },
    enabled: !!userId, // Only run query if userId exists
  });
};

export const useUpdateUserProfile = () => {
  const userId = localStorage.getItem("userId");
  return useMutation({
    mutationFn: (formData: FormData) => {
      if (!userId) throw new Error("No user ID found");
      return Request.patch(`/users/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then((res) => res?.data);
    },
  });
};
