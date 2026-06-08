import { baseApi } from "@/lib/api/baseApi";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitSupportMessage: builder.mutation({
      query: (data) => ({
        url: '/support',
        method: 'POST',
        body: data,
      }),
    }),
    getAdminSupportMessages: builder.query({
      query: () => '/admin/support',
    }),
    updateSupportMessageStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/support/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useSubmitSupportMessageMutation,
  useGetAdminSupportMessagesQuery,
  useUpdateSupportMessageStatusMutation,
} = supportApi;
