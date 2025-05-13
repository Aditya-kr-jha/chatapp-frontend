# Zync - Chat Application Frontend (Vite + React)

Welcome to the frontend repository for Zync, a full-stack, real-time chat application. This frontend is built with **React and Vite**, providing a fast, responsive, and intuitive user interface for interacting with the Zync backend. It enables real-time messaging, file sharing, and dynamic UI updates.

**🚀 Backend Repository:**
This is the frontend component of Zync. The corresponding backend (FastAPI) can be found here:
[Zync Backend Repository](https://github.com/Aditya-kr-jha/ChatApp_v2) 

## Overview

Developed a responsive React frontend for the "Zync" chat application, leveraging **Vite** for an optimized development experience. It features client-side WebSocket management for seamless user interaction, instant messaging, and dynamic UI updates. This frontend handles user authentication, channel browsing, real-time message display, file uploads, and secure multimedia content access, communicating with a high-performance Python (FastAPI) backend.

## Table of Contents

- [Features](#features)
- [Technical Stack](#technical-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Run the Development Server](#4-run-the-development-server)
  - [5. Build for Production](#5-build-for-production)
- [User Experience Flow](#user-experience-flow)
- [Key Components](#key-components)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

-   **User Authentication:** Intuitive Login and Sign Up forms.
-   **Session Management:** Persistent sessions using JWTs stored in `localStorage`, managed via React Context API.
-   **Protected Routes:** Ensures only authenticated users can access core application features.
-   **Channel Dashboard:** View joined channels and discover new joinable channels.
-   **Real-time Chat View:**
    -   Fetches and displays message history.
    -   Establishes WebSocket connections for real-time message updates.
    -   Send text messages and upload files (images, videos, audio, generic).
    -   Displays file previews (images, videos, audio) and download links.
    -   Image modal for viewing full-size images.
-   **Responsive Design:** Styled with custom CSS for a consistent experience.
-   **API Integration:** Dedicated service layer (using Axios) for all backend communications, including automatic JWT attachment.
-   **Loading & Error States:** User-friendly indicators for API calls, file uploads, and WebSocket connections.
-   **Optimized Development:** Fast development server and build process powered by Vite.

## Technical Stack

-   **Framework/Library:** React (v19) with Hooks
-   **Build Tool & Dev Server:** Vite
-   **Routing:** React Router DOM (v7.5)
-   **HTTP Client:** Axios (v1.8.4)
-   **Real-time Communication:** Native Browser WebSockets
-   **State Management:** React Context API (for authentication)
-   **Styling:** Custom CSS (utilizing CSS variables)
-   **Linting:** ESLint
-   **Type Checking (Props):** PropTypes

## Prerequisites

-   Node.js (LTS version recommended, e.g., v18 or v20)
-   npm (comes with Node.js) or yarn
-   Git
-   A running instance of the [Zync Backend API](https://github.com/Aditya-kr-jha/zync-backend) (*Update this link if your backend repository URL is different*).

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Aditya-kr-jha/chatapp-frontend.git
cd chatapp-frontend
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```
Or using yarn:
```bash
yarn install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project. Vite uses this file to expose environment variables to your application, prefixed with `VITE_`.

```env
# .env

# URL for the backend API (adjust if your backend router prefix is different)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Base URL for WebSocket connections (scheme depends on backend deployment, ws for local dev)
VITE_WS_BASE_URL=ws://localhost:8000
```
-   `VITE_API_BASE_URL`: Should point to your running Zync backend API.
-   `VITE_WS_BASE_URL`: Should point to the base URL for WebSocket connections on your backend.

### 4. Run the Development Server

Ensure the Zync backend server is running and accessible at the URL specified in `VITE_API_BASE_URL`.

Using npm:
```bash
npm run dev
```
Or using yarn:
```bash
yarn dev
```
The Vite development server will typically start on `http://localhost:5173`.

### 5. Build for Production

To create an optimized production build:

Using npm:
```bash
npm run build
```
Or using yarn:
```bash
yarn build
```
The production-ready files will be located in the `dist/` directory.

## User Experience Flow

1.  User visits the landing page, chooses to Login or Sign Up.
2.  After successful authentication, the user is directed to the Channel Dashboard.
3.  User can view their channels, join new ones, or leave existing ones.
4.  Clicking a channel navigates to the Chat View for real-time messaging.
5.  In Chat View, users can send/receive text and files, with messages appearing instantly.
6.  Users can logout, clearing their session.

## Key Components

-   **`AuthContext.jsx`**: Manages global authentication state and logic.
-   **`api.jsx`**: Centralized Axios instance and API call functions.
-   **`ChannelDashboard.jsx`**: Displays and manages channel lists.
-   **`ChatView.jsx`**: Core interface for real-time chat within a channel.
-   **`MessageList.jsx` & `MessageInput.jsx`**: Handle message display and input.
-   **`App.jsx`**: Main application component setting up routing and context providers.

## Deployment

This frontend application is designed for modern web hosting and is deployed on **AWS CloudFront** for low-latency global delivery.
-   Build the application using `npm run build` (or `yarn build`).
-   Deploy the contents of the generated `dist/` folder to your hosting provider (e.g., an S3 bucket configured with AWS CloudFront).
-   Ensure environment variables (like API URLs) are correctly configured for the production environment. For Vite, these are typically baked in at build time. If runtime configuration is needed, your hosting solution might offer ways to inject them.

## Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-cool-ui-feature`).
3.  Commit your changes (`git commit -m 'Add some cool UI feature'`).
4.  Push to the branch (`git push origin feature/your-cool-ui-feature`).
5.  Open a Pull Request.

Please ensure your code adheres to the project's linting and formatting standards.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
