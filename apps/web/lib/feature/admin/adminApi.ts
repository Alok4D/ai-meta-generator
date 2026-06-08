import { baseApi } from "@/lib/api/baseApi";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query({
      query: () => '/admin/overview',
      providesTags: ['Users'],
    }),
    getAllUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['Users'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminOverviewQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
} = adminApi;
