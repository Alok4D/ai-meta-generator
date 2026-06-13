"use server";

import { BACKEND_API_URL } from "@/constants";
import { isApiError, isApiSuccess } from "@/utils/authResponseGuard";

export type ForgotPasswordApiResponse = {
  success: boolean;
  message: string;
  errorMessages?: { message: string }[];
};

export type ResendOtpResponse = {
  success: boolean;
  message: string;
  errorMessages?: { message: string }[];
};

export type ResetPasswordApiResponse = {
  success: boolean;
  message: string;
  errorMessages?: { message: string }[];
};

export type VerifyOtpApiResponse = {
  success: boolean;
  message: string;
  errorMessages?: { message: string }[];
};

type ForgotPasswordUserData = {
  email: string;
};

type ForgotPasswordResponse = {
  message: string;
  success: boolean;
};

export async function forgotPassword(
  userData: ForgotPasswordUserData
): Promise<ForgotPasswordResponse> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data: ForgotPasswordApiResponse = await response.json();

    if (!response.ok) {
      const message =
        isApiError(data) && data.message
          ? data.message
          : `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    if (isApiError(data)) {
      throw new Error(data.errorMessages?.[0]?.message || data.message || "An error occurred");
    }

    if (isApiSuccess(data) && data.success) {
      return {
        message: data.message,
        success: true,
      };
    }

    throw new Error("Unexpected response from server");
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to send password reset email due to unknown error";

    return {
      message: errorMessage,
      success: false,
    };
  }
}

type ResendOtpResult = {
  success: boolean;
  message: string;
};

export async function resendOTP(email: string): Promise<ResendOtpResult> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data: ResendOtpResponse = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message ?? "Failed to resend OTP",
      };
    }

    if (isApiError(data)) {
      return {
        success: false,
        message: data.message,
      };
    }

    if (isApiSuccess(data)) {
      return {
        success: true,
        message: data.message,
      };
    }

    return {
      success: false,
      message: "Unexpected server response",
    };
  } catch (error) {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}

type ResetPasswordUserData = {
  email: string;
  otp: string;
  newPassword: string;
};

type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

export async function resetPassword(
  userData: ResetPasswordUserData
): Promise<ResetPasswordResponse> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data: ResetPasswordApiResponse = await response.json();

    if (!response.ok) {
      const message =
        isApiError(data) && data.message
          ? data.errorMessages?.[0]?.message || data.message
          : `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    if (isApiError(data)) {
      throw new Error(data.errorMessages?.[0]?.message || data.message || "An error occurred");
    }

    if (isApiSuccess(data) && data.success) {
      return {
        message: data.message,
        success: true,
      };
    }

    throw new Error("Unexpected response from server");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update password";

    return {
      message: errorMessage,
      success: false,
    };
  }
}

type VerifyOtpUserData = {
  email: string;
  otp: string;
};

type VerifyOtpResponseData = {
  message: string;
  success: boolean;
};

export async function verifyOTP(
  userData: VerifyOtpUserData
): Promise<VerifyOtpResponseData> {
  try {
    const response = await fetch(
      `${BACKEND_API_URL}/auth/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    const data: VerifyOtpApiResponse = await response.json();

    if (!response.ok) {
      const message =
        isApiError(data) && data.message
          ? data.message
          : `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    if (isApiError(data)) {
      throw new Error(data.errorMessages?.[0]?.message || data.message || "An error occurred");
    }

    if (isApiSuccess(data) && data.success) {
      return {
        message: data.message,
        success: true,
      };
    }

    throw new Error("Unexpected response from server");
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to verify OTP due to unknown error";
    return {
      message: errorMessage,
      success: false,
    };
  }
}
