import { useQuery } from "@tanstack/react-query";
import { Request } from "./request";

const userId = localStorage.getItem("userId");

export const useGetUserDetails = () =>
  useQuery({
    queryKey: ["getUser"],
    queryFn: () =>
      Request.get(`/users/${userId}`)
        .then((res) => res?.data)
        .catch((err) => {
          throw new err();
        }),
  });
