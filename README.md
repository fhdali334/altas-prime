# Angulus AI - Frontend Application

This `README.md` provides an overview of the Angulus AI frontend application, detailing its transformation from an Angular website to a modern Next.js React application, along with the key features and design enhancements implemented.

## Project Overview

The Angulus AI frontend has undergone a significant migration from an Angular-based website to a robust and scalable application built with Next.js and React. This transition leverages the benefits of React's component-based architecture and Next.js's server-side rendering capabilities, leading to improved performance, better developer experience, and enhanced maintainability.

The application serves as a comprehensive AI-powered platform, offering advanced chat functionalities, intelligent file management, and seamless agent integration.

## Technology Stack

*   **Framework**: Next.js (App Router)
*   **UI Library**: React
*   **Styling**: Tailwind CSS with Shadcn/ui components
*   **Icons**: Lucide React
*   **State Management**: React Context (for authentication, sidebar state, etc.)
*   **API Communication**: Custom API clients (`lib/api.ts`, `lib/auth-api.ts`)

## Key Frontend Features

The following core features have been implemented and refined during the development process:

1.  **Comprehensive Chat System**:
    *   **Real-time Chat**: Users can engage in real-time conversations with AI agents.
    *   **Persistent Chats**: Chat history is persisted, allowing users to resume conversations.
    *   **Typing Indicators**: Visual cues show when an AI agent is typing, enhancing the interactive experience.
    *   **Error Handling**: Robust error handling for API calls and date formatting ensures a smooth user experience.
    *   **Immediate Chat Visibility**: Newly created chats are immediately visible in the chat list without requiring a manual refresh.

2.  **Advanced File Management**:
    *   **Multi-format Support**: Support for various file formats for upload and processing.
    *   **Automatic Text Extraction**: Content from uploaded files is automatically extracted for analysis.
    *   **Usage Analytics**: Tracking and display of file usage metrics.
    *   **Seamless Chat Integration**: Files can be attached to chat messages, providing context to AI agents.
    *   **File CRUD Operations**: Full Create, Read, Update, and Delete capabilities for managing files.

3.  **Agent Integration**:
    *   **Agent API**: A dedicated API for managing AI agents.
    *   **Agent Selection**: Users can select different AI agents for their chats.
    *   **Agent Performance Metrics**: (Planned) Future integration for tracking agent performance.

4.  **Link Analysis API Re-integration**:
    *   The link analysis API has been fully re-integrated into the chat system.
    *   Users can now attach both local files and analyzed web content (via URL input) seamlessly within the `ReplyBox`.
    *   A dedicated "Process Link" tab in the attachment panel provides a clear input field for URLs.

5.  **Authentication & User Management**:
    *   **Registration Flow**: Secure user registration with email verification.
    *   **Login/Logout**: Standard login and logout functionalities.
    *   **Password Reset**: Forgot password and reset password flows.
    *   **Protected Routes**: Ensures only authenticated users can access certain parts of the application.
    *   **Social Login**: (Planned) Integration with social login providers.
    *   **User Profile Page**: (Planned) A dedicated page for managing user profiles.
    *   **Email Resend Feature**: (Planned) Functionality to resend verification emails.

6.  **Dashboard & UI Enhancements**:
    *   **Chat List Organization**: Chats are organized into "All," "General," and "Agent" categories for easy navigation.
    *   **Token Tracking**: A `TokenTracker` component displays token usage.
    *   **Responsive Design**: The application is designed to be fully responsive, providing an optimal experience across various devices (desktop, tablet, mobile).
    *   **Shadcn/ui Components**: Extensive use of Shadcn/ui components for a consistent and modern look and feel.
    *   **Tabbed Attachment Panel**: The `ReplyBox` features a tabbed panel for attaching files and processing links, restoring the original intuitive design.

## Design Changes

The migration to Next.js React and the adoption of Shadcn/ui have brought significant design improvements:

*   **Modern UI/UX**: A cleaner, more intuitive, and visually appealing user interface.
*   **Consistent Design System**: Leveraging Shadcn/ui ensures consistency across all components and pages.
*   **Improved Responsiveness**: Enhanced adaptability to different screen sizes, providing a seamless experience on mobile and desktop.
*   **Optimized Layouts**: Use of Next.js App Router layouts for efficient and structured page rendering.
*   **Enhanced Accessibility**: Focus on accessibility best practices, including semantic HTML and ARIA attributes.

## Getting Started

To run the application locally:

1.  **Clone the repository.**
2.  **Install dependencies:** `npm install` or `yarn install`
3.  **Set up environment variables:** Refer to the `.env.example` file for required variables (e.g., API endpoints).
4.  **Run the development server:** `npm run dev` or `yarn dev`
5.  **Open your browser:** Navigate to `http://localhost:3000`

For detailed API documentation and backend setup, please refer to the respective backend `README.md` or API documentation.
