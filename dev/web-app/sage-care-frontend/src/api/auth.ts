import { useMutation } from "@tanstack/react-query";
import { Request } from "./request";

export const useSignUp = () => {
  return useMutation({
    mutationFn: ({ data }: { data: unknown }) =>
      Request.post(`/auth/sign-up`, data)
        .then((res) => res?.data)
        .catch((err) => {
          throw new err();
        }),
    onSuccess: (data) => {
      console.log(data);
    },
  });
};

export const useLoginUser = () => {
  return useMutation({
    mutationFn: ({ data }: { data: unknown }) =>
      Request.post(`/auth/login`, data)
        .then((res) => {
          const data = res?.data;
          if (data.accessToken) {
            localStorage.setItem("token", data?.accessToken);
            localStorage.setItem("userId", data?._id);
            // Store the full user object (excluding password and accessToken)
            const { password, accessToken, ...userData } = data;
            localStorage.setItem("user", JSON.stringify(userData));
            return res?.data;
          }
          throw new Error("No access token");
        })
        .catch((err) => {
          throw err?.response?.data;
        }),
  });
};
