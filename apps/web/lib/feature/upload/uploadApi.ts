import { baseApi } from "@/lib/api/baseApi";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['History', 'Uploads'],
    }),
    getHistory: builder.query({
      query: () => '/upload/history',
      providesTags: ['History'],
    }),
    deleteHistory: builder.mutation({
      query: (id) => ({
        url: `/upload/history/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['History', 'Uploads'],
    }),
    regenerateMetadata: builder.mutation({
      query: (data) => ({
        url: '/upload/regenerate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['History', 'Uploads'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useUploadImageMutation,
  useGetHistoryQuery,
  useDeleteHistoryMutation,
  useRegenerateMetadataMutation,
} = uploadApi;
