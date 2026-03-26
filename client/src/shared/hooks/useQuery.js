/**
 * React Query Hooks Wrapper
 * Centralized data fetching and mutations using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listingAPI, chatAPI, userAPI, authAPI } from "@/shared/services/api";
import { notify } from "@/shared/services/notify";

// ── Query Keys ────────────────────────────────────────
export const queryKeys = {
  listings: () => ["listings"],
  listingsList: (filters) => ["listings", "list", filters],
  listingDetail: (id) => ["listings", id],
  myListings: (page, limit) => ["listings", "my", { page, limit }],
  suggestions: (query) => ["listings", "suggestions", query],

  chats: () => ["chats"],
  chatInbox: () => ["chats", "inbox"],
  chatWindow: (chatId) => ["chats", chatId],
  chatMessages: (chatId) => ["chats", chatId, "messages"],

  user: () => ["user"],
  userProfile: () => ["user", "profile"],
  userPublicProfile: (userId) => ["user", userId],

  auth: () => ["auth"],
  colleges: () => ["auth", "colleges"],
};

// ── Listings Queries ──────────────────────────────────
export const useListingsQuery = (filters, options = {}) => {
  return useQuery({
    queryKey: queryKeys.listingsList(filters),
    queryFn: () => listingAPI.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useListingDetailQuery = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.listingDetail(id),
    queryFn: () => listingAPI.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useMyListingsQuery = (page = 1, limit = 9, options = {}) => {
  return useQuery({
    queryKey: queryKeys.myListings(page, limit),
    queryFn: () => listingAPI.getAll({ page, limit, myListings: true }),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useSuggestionsQuery = (searchInput, options = {}) => {
  return useQuery({
    queryKey: queryKeys.suggestions(searchInput),
    queryFn: () => listingAPI.getSuggestions(searchInput),
    enabled: !!searchInput && searchInput.length > 0,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// ── Listings Mutations ────────────────────────────────
export const useCreateListingMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => listingAPI.create(formData),
    onSuccess: (data) => {
      notify.success("Listing created!");
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      notify.error(error?.response?.data?.message || "Failed to create listing");
      options.onError?.(error);
    },
    ...options,
  });
};

export const useUpdateListingMutation = (id, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => listingAPI.update(id, formData),
    onSuccess: (data) => {
      notify.success("Listing updated!");
      queryClient.invalidateQueries({ queryKey: queryKeys.listingDetail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      notify.error(error?.response?.data?.message || "Failed to update listing");
      options.onError?.(error);
    },
    ...options,
  });
};

export const useDeleteListingMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => listingAPI.delete(id),
    onSuccess: () => {
      notify.success("Listing deleted!");
      queryClient.invalidateQueries({ queryKey: queryKeys.myListings() });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings() });
      options.onSuccess?.();
    },
    onError: (error) => {
      notify.error(error?.response?.data?.message || "Failed to delete listing");
      options.onError?.(error);
    },
    ...options,
  });
};

// ── Chat Queries ──────────────────────────────────────
export const useChatInboxQuery = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.chatInbox(),
    queryFn: () => chatAPI.getInbox(),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
};

export const useChatWindowQuery = (chatId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.chatWindow(chatId),
    queryFn: () => chatAPI.getChatWindow(chatId),
    enabled: !!chatId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useChatMessagesQuery = (chatId, page = 1, limit = 30, options = {}) => {
  return useQuery({
    queryKey: queryKeys.chatMessages(chatId),
    queryFn: () => chatAPI.getChatMessages(chatId, page, limit),
    enabled: !!chatId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

// ── Chat Mutations ────────────────────────────────────
export const useStartChatMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => chatAPI.startChat(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatInbox() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      notify.error(error?.response?.data?.message || "Failed to start chat");
      options.onError?.(error);
    },
    ...options,
  });
};

export const useSendMessageMutation = (chatId, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text) => chatAPI.sendMessage(chatId, text),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatMessages(chatId) });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      notify.error(error?.response?.data?.message || "Failed to send message");
      options.onError?.(error);
    },
    ...options,
  });
};

export const useDeleteChatMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId) => chatAPI.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatInbox() });
      notify.success("Chat deleted");
      options.onSuccess?.();
    },
    onError: (error) => {
      notify.error(error?.response?.data?.message || "Failed to delete chat");
      options.onError?.(error);
    },
    ...options,
  });
};

// ── User Queries ──────────────────────────────────────
export const useUserProfileQuery = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: () => userAPI.getProfile(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useUserPublicProfileQuery = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.userPublicProfile(userId),
    queryFn: () => userAPI.getUserPublicProfile(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

// ── User Mutations ────────────────────────────────────
export const useUpdateProfileMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => userAPI.updateProfile(data),
    onSuccess: (data) => {
      notify.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile() });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      notify.error(error?.response?.data?.message || "Failed to update profile");
      options.onError?.(error);
    },
    ...options,
  });
};

export const useChangePasswordMutation = (options = {}) => {
  return useMutation({
    mutationFn: (data) => userAPI.changePassword(data),
    onSuccess: () => {
      notify.success("Password changed successfully!");
      options.onSuccess?.();
    },
    onError: (error) => {
      notify.error(error?.response?.data?.message || "Failed to change password");
      options.onError?.(error);
    },
    ...options,
  });
};

// ── Auth Queries ──────────────────────────────────────
export const useCollegesQuery = () => {
  return useQuery({
    queryKey: ['colleges'],
    queryFn: async () => {
      const res = await authAPI.getColleges();
      return res.data.data.colleges; // ← unwrap here
    }
  });
};
