import { baseApi } from "@/lib/api/baseApi";

export const iamstockApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        searchImstocker: builder.mutation<any, { search: string, sessionId?: string, count?: number, offset?: number }>({
            queryFn: async (arg) => {
                try {
                    const response = await fetch('/api/imstocker', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(arg),
                    });
                    
                    if (!response.ok) {
                        return { error: { status: response.status, data: await response.text() } };
                    }
                    
                    const data = await response.json();
                    return { data };
                } catch (error: any) {
                    return { error: { status: 'CUSTOM_ERROR', error: error.message } };
                }
            },
        }),
    }),
    overrideExisting: true,
});

export const { useSearchImstockerMutation } = iamstockApi;
