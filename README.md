# Story Snap Generator

This is a React application, built with Vite and TypeScript, that allows users to generate images for Instagram Stories and Feed with a custom overlay.

## Features

-   **Modular Architecture:** The application is built with a modular architecture, making it easy to add new pages and features.
-   **Customizable Overlays:** The image editors accept an `overlayImage` prop, allowing for different overlays to be used on different pages.
-   **Two Pages:** The application has two pages:
    -   The main page, which uses the default overlay images.
    -   The "Embaixadores" page, which uses a different set of overlay images.
-   **GitHub Pages Deployment:** The application is configured for easy deployment to GitHub Pages.

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/ruirda/story-snap-generator.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Application

To start the development server, run the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Available Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the application for production.
-   `npm run lint`: Lints the code.
-   `npm run preview`: Starts a local server to preview the production build.
-   `npm run predeploy`: Builds the application before deploying.
-   `npm run deploy`: Deploys the application to GitHub Pages.

## Project Structure

```
.
├── public
│   ├── lovable-uploads
│   │   ├── SDC_Embaixador_feed.png
│   │   ├── SDC_Embaixador_Story.png
│   │   ├── SDC_Eu_vou_feed.png
│   │   └── SDC_Eu_vou_story.png
│   └── 404.html
├── src
│   ├── components
│   │   ├── FeedImageEditor.tsx
│   │   ├── ImageEditingPage.tsx
│   │   ├── Layout.tsx
│   │   └── StoryImageEditor.tsx
│   ├── pages
│   │   ├── Embaixadors.tsx
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── utils
│   │   ├── feedImageProcessing.ts
│   │   └── storyImageProcessing.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts