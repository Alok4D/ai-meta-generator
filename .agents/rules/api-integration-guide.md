---
trigger: model_decision
description: you should follow these rules when i ask you to integrate api and give you api integration data like url endpoint, postman code snippet and sample response
---

# API Integration Development Guide

This document outlines the conventions and best practices for integrating new APIs into the niazibeaters Frontend project. We use **Redux Toolkit Query (RTK Query)** for all data fetching and state management related to server-side data.

---

## 🏗️ Project Structure

The API layer is organized to be modular and scalable:

- **`/lib/api/baseApi.tsx`**: Contains the central `baseApi` configuration, including `baseUrl`, global headers (like Auth tokens), and shared `tagTypes` for cache management.
- **`/lib/feature/[FeatureName]/[featureName]Api.ts`**: Contains specific endpoints for a particular feature or module (e.g., `userApi.ts`, `authApi.ts`).
- **`/lib/slice/[FeatureName]/[featureName]Slice.tsx`**: (Optional) For feature-specific client-side state that doesn't belong in RTK Query cache.
- **`/types/`**: Shared TypeScript interfaces and types.

---

## 🌐 Environment Configuration

The application requires several environment variables to function correctly. These should be defined in a `.env` file in the root directory.

| Variable | Description | Default/Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The public endpoint for the API, used for RTK Query client-side fetching. | `http://206.162.244.134:8321/api/v1` |
| `API_BASE_URL` | The base URL for the API, used in server actions and server-side logic. | `http://206.162.244.134:8321/api/v1` |
| `AUTH_SECRET` | A secret key used for signing/verifying authentication tokens or sensitive operations. | `your_secret_here` |



## 🛠️ How to Integrate a New API

To add a new API integration, follow these steps:

### 1. Define Request/Response Types
Define types for your payloads and responses at the top of your API file or in a dedicated types file if they are large.

```typescript
export type TYourFeature = {
    id: string;
    name: string;
    // ... other fields
};

export type CreateFeaturePayload = {
    name: string;
};
```

### 2. Create the Feature API File
Create a new file under `/lib/feature/[YourFeature]/[yourFeature]Api.ts`. Use `baseApi.injectEndpoints` to add your endpoints to the central service.

```typescript
import baseApi from "@/lib/api/baseApi";

export const yourFeatureApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET Query
        getYourFeature: builder.query<TYourFeature[], void>({
            query: () => ({
                url: "/your-endpoint",
                method: "GET",
            }),
            providesTags: ["YourTag"], // Used for cache invalidation
        }),

        // POST/PUT/PATCH/DELETE Mutation
        createYourFeature: builder.mutation<TYourFeature, CreateFeaturePayload>({
            query: (payload) => ({
                url: "/your-endpoint",
                method: "POST",
                body: payload,
            }),
            invalidatesTags: ["YourTag"], // Clears cache after change
        }),
    }),
    overrideExisting: true,
});

// Export auto-generated hooks
export const {
    useGetYourFeatureQuery,
    useCreateYourFeatureMutation,
} = yourFeatureApi;
```

### 3. Add Tags to `baseApi.tsx` (If New)
If you are using a new `tagType` for cache management, you **must** register it in `/lib/api/baseApi.tsx`:

```typescript
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery,
  tagTypes: ["User", "Student", "Trainee", "YourTag"], // Add it here
  endpoints: () => ({}),
});
```

---

## 💡 Best Practices

### 1. Hook Usage in Components
Always use the generated hooks in your functional components.

```tsx
const { data, isLoading, error } = useGetYourFeatureQuery();

// For mutations
const [createFeature, { isLoading: isCreating }] = useCreateYourFeatureMutation();

const handleSave = async () => {
    try {
        await createFeature(payload).unwrap(); // Use .unwrap() to handle errors locally
        toast.success("Saved successfully!");
    } catch (err: any) {
        toast.error(err?.data?.message || "Failed to save");
    }
};
```

### 2. Cache Management
- Use `providesTags` on queries that fetch data.
- Use `invalidatesTags` on mutations that change that same data.
- This ensures the UI automatically refetches fresh data after an update without manual state management.

### 3. Error Handling
- RTK Query provides an `error` object. In this project, we typically check `err?.data?.message` for backend error strings.
- Use `toast` (from `sonner`) to provide immediate visual feedback.

### 4. Loading States
- Always handle `isLoading` or `isFetching` states to show loaders/shimmers to the user.
- Use the `Loader` icon from `lucide-react` for consistent loading animations.

### 5. Authentication
- `baseApi` automatically includes the Bearer token from `localStorage` if it exists. You don't need to manually add Authorisation headers to individual endpoints.

---

## ✅ Consistency Checklist
- [ ] Endpoint is injected into `baseApi`.
- [ ] Types are clearly defined and exported.
- [ ] Tags are registered in `baseApi.tsx` and used for cache invalidation.
- [ ] Hooks are exported following the `useXXQuery` or `useXXMutation` naming convention.
- [ ] Component uses `.unwrap()` or handles error states gracefully.