import { baseApi } from "@/lib/api/baseApi";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query({
      query: () => '/admin/overview',
      providesTags: ['Users'],
    }),
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 12, search = '', role = 'all' }: { page?: number; limit?: number; search?: string; role?: string } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (role && role !== 'all') params.append('role', role);
        return `/admin/users?${params.toString()}`;
      },
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
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
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
  useDeleteUserMutation,
} = adminApi;
