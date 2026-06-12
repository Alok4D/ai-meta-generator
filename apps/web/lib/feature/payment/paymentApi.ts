import { baseApi } from "@/lib/api/baseApi";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (data) => ({
        url: "/payments/create-checkout-session",
        method: "POST",
        body: data,
      }),
    }),
    verifySession: builder.mutation({
      query: (data) => ({
        url: "/payments/verify-session",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transactions"],
    }),
    getUserTransactions: builder.query({
      query: () => "/payments/history",
      providesTags: ["Transactions"],
    }),
    getAllTransactions: builder.query({
      query: () => "/payments/all",
      providesTags: ["Transactions"],
    }),
    cancelSubscription: builder.mutation({
      query: () => ({
        url: "/payments/cancel-subscription",
        method: "POST",
      }),
      invalidatesTags: ["Transactions"],
    }),
    submitManualPayment: builder.mutation({
      query: (data) => ({
        url: "/payments/manual",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transactions"],
    }),
    getPendingManualPayments: builder.query({
      query: () => "/payments/manual/pending",
      providesTags: ["Transactions"],
    }),
    verifyManualPayment: builder.mutation({
      query: (data) => ({
        url: "/payments/manual/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Transactions"],
    }),
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transactions"],
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useVerifySessionMutation,
  useGetUserTransactionsQuery,
  useGetAllTransactionsQuery,
  useCancelSubscriptionMutation,
  useSubmitManualPaymentMutation,
  useGetPendingManualPaymentsQuery,
  useVerifyManualPaymentMutation,
  useDeleteTransactionMutation,
} = paymentApi;
