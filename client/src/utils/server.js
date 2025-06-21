import { useMutation, useQueryClient } from "@tanstack/react-query";
import Instance from "./Instance";

export const useRegister = () => {
  //   const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        console.log("DATAAA", data);

        const res = await Instance.post(
          `/auth/register/`,
          data?.requestData || {}
        );

        return res;
      } catch (error) {
        console.error("Error register", error);
        throw error;
      }
    },
    onSuccess: (data, vars) => {
      //   console.log("SUCCES DATA", data);
      //   console.log("SUCCES vars", vars);

      if (vars?.onSuccess) {
        vars?.onSuccess(data);
      }

      // queryClient.invalidateQueries(["Regions"]);
    },
    onError: (data, vars) => {
      if (vars?.onError) {
        vars?.onError(data);
      }
    },
  });
};
