import { baseApi } from "@/lib/api/baseApi";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
  overrideExisting: true,
});

export const {
  useUploadImageMutation,
  useGetHistoryQuery,
} = uploadApi;
