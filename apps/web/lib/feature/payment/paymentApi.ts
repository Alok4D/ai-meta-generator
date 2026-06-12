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
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useVerifySessionMutation,
  useGetUserTransactionsQuery,
  useGetAllTransactionsQuery,
} = paymentApi;
