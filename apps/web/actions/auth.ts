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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return {
      message: data.message || "Password reset email sent",
      success: true,
    };
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
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to resend OTP");
    }

    return {
      success: true,
      message: data.message || "OTP resent successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error. Please try again.",
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

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || (data.errorMessages && data.errorMessages[0]?.message) || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return {
      message: data.message || "Password updated successfully",
      success: true,
    };
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
      `${BACKEND_API_URL}/auth/verify-reset-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || (data.errorMessages && data.errorMessages[0]?.message) || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    // Check if the backend returned a success message or token
    if (data.success || data.token || data._id) {
      return {
        message: data.message || "OTP verified successfully",
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
