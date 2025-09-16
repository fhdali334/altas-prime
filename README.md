# Angulus AI – Frontend Application

The **Angulus AI frontend** is a modern web application built with **Next.js and React**, migrated from an earlier Angular implementation.  
It delivers a seamless, responsive, and intuitive interface for AI-driven interactions, including real-time chat, file and link management, analytics, and role-based dashboards.

---

## 🚀 Project Overview

This project represents a complete **migration from Angular to Next.js** with React.  
The new frontend emphasizes:

- A **component-based architecture** for scalability and maintainability.
- **Responsive, modern UI/UX** powered by Shadcn/ui and Tailwind CSS.
- **Role-based experiences**, differentiating between regular users and administrators.
- **Real-time features** such as live chat, usage tracking, and analytics dashboards.

---

## 🛠 Technology Stack

- **Framework**: Next.js (App Router)  
- **UI Library**: React  
- **Styling**: Tailwind CSS with Shadcn/ui components  
- **Icons**: Lucide React  
- **State Management**: React Context (authentication, sidebar state, role-based navigation)  
- **Frontend Utilities**: Custom hooks, reusable components, and context-driven layouts  

---

## ✨ Core Frontend Functionalities

### 🔐 Authentication & User Management
- Secure sign-up, login, logout, email verification, and password reset flows.
- Role-based access handling for users and administrators.
- Protected routes to ensure access control.
- Planned enhancements include social login and profile management.

---

### 💬 Chat System
- Real-time AI-powered conversations with typing indicators.
- Persistent chat history with immediate visibility for new chats.
- Organized chat categories (General, Agent-specific, All).
- Seamless integration of files and links within chat conversations.
- Token and usage tracking displayed directly in the chat interface.

---

### 📁 File & Link Management
- Upload support for multiple file formats (PDF, images, etc.).
- Automatic text extraction from uploaded files for AI analysis.
- Attach multiple files to messages for contextual conversations.
- Full file management (view, update, delete).
- Dedicated **link processing panel** for analyzing URLs directly within chat.

---

### 🤖 Agent Integration
- Browse and select AI agents for specific conversations.
- Consistent agent management interface integrated within the chat system.
- Planned enhancements include performance insights and agent usage statistics.

---

### 📊 Usage Tracking & Analytics
- Token usage monitoring integrated into chat sessions.
- Visual indicators (progress bars, warnings) for token consumption.
- User dashboard displaying overall token usage, costs, and trends.
- Analytics-driven insights with charts for daily and monthly usage.
- Real-time updates to help users stay within usage limits.

---

### 🛡️ Admin Panel (Role-Based Features)
- Available only to administrators.
- User management dashboard with search and filtering.
- System statistics and analytics visualized in admin dashboards.
- Role-based navigation ensuring regular users and admins see distinct features.
- Tools for managing agents and monitoring overall platform activity.

---

### 🎨 UI/UX Enhancements
- Clean, modern design built with Shadcn/ui for consistency.
- Responsive layouts optimized for desktop, tablet, and mobile devices.
- Redesigned **ReplyBox** with tabbed attachment options (files and links).
- Accessibility improvements with semantic HTML and ARIA attributes.
- Real-time feedback via progress bars, color-coded warnings, and toast notifications.

---

## ▶️ Getting Started

### Run Locally

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd angulus-ai-frontend
