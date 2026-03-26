/**
 * Custom Auth Hooks
 * Centralized authentication flows with error handling
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/shared/services/api";
import { notify } from "@/shared/services/notify";
import { useAuth } from "@/context/AuthContext";

// ── Login Hook ─────────────────────────────────────────
export const useLoginMutation = (options = {}) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials) => authAPI.login(credentials),
    onSuccess: (response) => {
      const userData = response.data.data.user;
      login(userData);
      notify.success(`Welcome back, ${userData.firstName}!`);
      options.onSuccess?.(response);
      navigate("/listings");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Login failed";
      notify.error(message);
      options.onError?.(error);
    },
  });
};

// ── Register Hook ──────────────────────────────────────
export const useRegisterMutation = (options = {}) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (formData) => authAPI.register(formData),
    onSuccess: (response) => {
      notify.success("OTP sent to your email!");
      options.onSuccess?.(response);
      navigate(`/verify-otp?email=${encodeURIComponent(response.data.data.email)}`);
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Registration failed";
      notify.error(message);
      options.onError?.(error);
    },
  });
};

// ── Verify OTP Hook ───────────────────────────────────
export const useVerifyOTPMutation = (options = {}) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data) => authAPI.verifyOTP(data),
    onSuccess: (data) => {
      notify.success("Account verified successfully! Please login.");
      options.onSuccess?.(data);
      navigate("/login");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Verification failed";
      notify.error(message);
      options.onError?.(error);
    },
  });
};

// ── Logout Hook ────────────────────────────────────────
export const useLogoutMutation = (options = {}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached data
      notify.success("Logged out successfully");
      options.onSuccess?.();
      navigate("/login");
    },
    onError: (error) => {
      notify.error(error?.response?.data?.message || "Logout failed");
      options.onError?.(error);
    },
  });
};
