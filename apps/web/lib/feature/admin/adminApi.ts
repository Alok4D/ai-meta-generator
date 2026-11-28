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
    getMagicWord: builder.query<{ magicWord: string; updatedAt: string | null; source: string }, void>({
      query: () => '/admin/magic-word',
    }),
    updateMagicWord: builder.mutation<{ magicWord: string; updatedAt: string; source: string }, { magicWord: string }>({
      query: (body) => ({
        url: '/admin/magic-word',
        method: 'PUT',
        body,
      }),
    }),
    getSearchCacheTtl: builder.query<{ ttlHours: number; updatedAt: string | null; source: string }, void>({
      query: () => '/admin/search-cache-ttl',
    }),
    updateSearchCacheTtl: builder.mutation<{ ttlHours: number; updatedAt: string; source: string }, { ttlHours: number }>({
      query: (body) => ({
        url: '/admin/search-cache-ttl',
        method: 'PUT',
        body,
      }),
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
  useGetMagicWordQuery,
  useUpdateMagicWordMutation,
  useGetSearchCacheTtlQuery,
  useUpdateSearchCacheTtlMutation,
} = adminApi;
