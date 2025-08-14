# Plan for Creating the /embaixadors Page

This plan outlines the steps to create a new page at the `/embaixadors` URL, which will be a copy of the main page but with different overlay images. The plan also includes refactoring the code to be more modular.

## 1. Create a Reusable Layout Component

- **Goal:** To create a reusable layout component that includes the header and footer.
- **File to create:** `src/components/Layout.tsx`
- **Details:**
  - This component will accept `children` to render the page-specific content.
  - It will also accept props for the header text to make it configurable.

## 2. Create a Generic Page Component

- **Goal:** To create a generic page component that uses the `Layout` and contains the image editors.
- **File to create:** `src/components/ImageEditingPage.tsx`
- **Details:**
  - This component will accept props for the overlay images for `FeedImageEditor` and `StoryImageEditor`.
  - This will allow us to reuse the same page structure with different images.

## 3. Update the Index Page

- **Goal:** To update the existing `Index.tsx` page to use the new reusable components.
- **File to modify:** `src/pages/Index.tsx`
- **Details:**
  - The `Index` component will use the `ImageEditingPage` component.
  - It will pass the current overlay images as props.

## 4. Create the New Embaixadors Page

- **Goal:** To create the new page for the `/embaixadors` route.
- **File to create:** `src/pages/Embaixadors.tsx`
- **Details:**
  - This page will also use the `ImageEditingPage` component.
  - It will pass a *different* set of overlay images as props.
  - We will need to add the new overlay images to the `public` folder.

## 5. Update Routing

- **Goal:** To add the new route for the `/embaixadors` page.
- **File to modify:** `src/App.tsx` (or wherever the router is configured)
- **Details:**
  - Add a new route that maps the `/embaixadors` path to the `Embaixadors` component.

## 6. Add New Overlay Images

- **Goal:** To add the new overlay images for the embaixadors page.
- **Action:** The user will need to provide the new overlay images. I will ask for them at the appropriate time. The new images should be placed in the `public/lovable-uploads` directory.
