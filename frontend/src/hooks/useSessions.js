import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionApi } from "../api/sessions";
import toast from "react-hot-toast";

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionApi.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      toast.success("Session created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create session");
    },
  });
};

export const useActiveSessions = () => {
  return useQuery({
    queryKey: ["activeSessions"],
    queryFn: sessionApi.getActiveSessions,
    refetchInterval: 5000,
  });
};

export const useMyRecentSessions = () => {
  return useQuery({
    queryKey: ["recentSessions"],
    queryFn: sessionApi.getMyRecentSessions,
  });
};

export const useSession = (id) => {
  return useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionApi.getSessionById(id),
    enabled: !!id,
  });
};

export const useJoinSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionApi.joinSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      toast.success("Joined session successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to join session");
    },
  });
};

export const useEndSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionApi.endSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeSessions"] });
      queryClient.invalidateQueries({ queryKey: ["recentSessions"] });
      toast.success("Session ended successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to end session");
    },
  });
};
