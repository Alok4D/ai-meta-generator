import { baseApi } from "@/lib/api/baseApi";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOverview: builder.query({
      query: () => '/admin/overview',
      providesTags: ['Users', 'Uploads', 'Transactions'],
    }),
    getAnalytics: builder.query({
      query: () => '/admin/analytics',
      providesTags: ['Uploads'],
    }),
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 12, search = '', role = 'all', plan = 'all' }: { page?: number; limit?: number; search?: string; role?: string; plan?: string } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (role && role !== 'all') params.append('role', role);
        if (plan && plan !== 'all') params.append('plan', plan);
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
    getAllGenerations: builder.query({
      query: ({ page = 1, limit = 10, search = '', userId = '' }: { page?: number; limit?: number; search?: string; userId?: string } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (userId) params.append('userId', userId);
        return `/admin/images?${params.toString()}`;
      },
      providesTags: ['Uploads'],
    }),
    getUserGenerationStats: builder.query({
      query: ({ page = 1, limit = 12, search = '' }: { page?: number; limit?: number; search?: string } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (search) params.append('search', search);
        return `/admin/generation-stats?${params.toString()}`;
      },
      providesTags: ['Uploads'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminOverviewQuery,
  useGetAnalyticsQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetAllGenerationsQuery,
  useGetUserGenerationStatsQuery,
} = adminApi;
