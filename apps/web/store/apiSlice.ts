import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state.auth.user?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['History', 'Users'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    googleLogin: builder.mutation({
      query: (userData) => ({
        url: '/auth/google',
        method: 'POST',
        body: userData,
      }),
    }),
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['History'],
    }),
    getHistory: builder.query({
      query: () => '/upload/history',
      providesTags: ['History'],
    }),
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
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGoogleLoginMutation,
  useUploadImageMutation,
  useGetHistoryQuery,
  useGetAdminOverviewQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useSubmitSupportMessageMutation,
  useGetAdminSupportMessagesQuery,
  useUpdateSupportMessageStatusMutation,
} = apiSlice;
