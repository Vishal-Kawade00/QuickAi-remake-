1. Overall Architecture (Modular Monolith)

Tech Stack: MERN Stack (MongoDB, Express.js, React.js, Node.js).

Design Pattern: Layered MVC architecture separating routes, controllers, and services, making the backend highly scalable and ready for future microservice extraction.

Database: MongoDB tracks user profiles, standard generation history, complex study sessions, and stateful chat memory.

2. Security & Authentication

Custom Authentication: A built-from-scratch, stateless JWT (JSON Web Token) system combined with bcrypt for password hashing.

Cross-Origin Syncing: The authentication state is securely shared between the main React web dashboard and the Chrome Extension, allowing seamless API requests from either client.

3. Standard Web Dashboard Features

AI Tooling: Integration with Google Gemini API, Cloudinary, and Remove.bg.

Capabilities: Users can generate articles and blog titles, create AI images, remove image backgrounds/objects, and upload PDF resumes (handled via Multer) for AI-driven feedback.

4. The YouTube AI Chrome Extension (Core USP)
The extension extracts YouTube video transcripts and interfaces with the backend to provide three major features:

Summarize (Single-Shot): Sends the transcript to the backend for a quick, one-off Gemini API call to generate a brief video overview.

Conversation (Stateful Agent): Injects a chat UI onto the YouTube page. The backend uses the transcript as context and stores ongoing message history in MongoDB, allowing users to have persistent, back-and-forth Q&A sessions with the video content.

Detailed Notes (Chunking Pipeline): The backend algorithm splits long (30+ minute) video transcripts into 2-minute segments to bypass API token limits. It iterates through these chunks to generate expansive, textbook-style notes and dynamically renders Mermaid.js diagrams on the frontend to visualize complex topics.






Phase 1: Backend Architecture & Database Initialization
Step 1: Initialize the Node.js project, set up environment variables, and create your modular monolith folder structure (Routes, Controllers, Services, Middlewares).

Step 2: Connect to MongoDB Atlas and write the Mongoose schemas (User, StudySession, ChatHistory).

Step 3: Build the custom stateless JWT authentication system. This includes password hashing with bcrypt in the auth.service.js and cookie/header management.

Step 4: Set up the global error handler and the authentication middleware to protect future API routes.

Phase 2: React Dashboard & Standard AI Tools
Step 1: Initialize the React application using Vite, configure Tailwind CSS, and set up your routing architecture.

Step 2: Build the AuthContext to manage the JWT state on the frontend, ensuring users stay logged in across sessions.

Step 3: Develop the foundational UI components (Sidebar, Dashboard layout) and build the forms for the standard AI tools.

Step 4: Integrate Cloudinary and Multer for handling file uploads (PDFs and images). Connect the Google Gemini API to handle standard, single-shot content generation.

Phase 3: Core AI Business Logic (Web Environment)
Step 1: Develop the chunking algorithm (transcript.service.js) in your backend to safely pass large text inputs to the Gemini API without exceeding token limits.

Step 2: Implement the stateful conversational agent logic. Your backend needs to read the current context, query the Gemini API, and append the Q&A to the ChatHistory collection in MongoDB.

Step 3: Build the frontend renderers. Create the MarkdownViewer.jsx for clean text formatting and integrate mermaid.js to render complex diagrams dynamically from the AI's output.

Step 4: Test this entire pipeline inside your React web app using mock YouTube transcripts or large text blocks to ensure the heavy AI logic is flawless before touching the extension.

Phase 4: The Chrome Extension
Step 1: Create the extension folder structure and configure the manifest.json (Manifest V3) with the correct permissions for YouTube and local storage.

Step 2: Write the scraper.js content script to successfully navigate the YouTube DOM and extract the closed captions/transcript data.

Step 3: Implement cross-origin authentication so your background worker can securely grab the JWT from your React web dashboard, authenticating the user inside the extension.

Step 4: Inject your React-based chat UI into the YouTube page and connect it to the youtube.routes.js endpoints on your backend.

Phase 5: Polish & Deployment
Step 1: Conduct end-to-end testing. Handle edge cases like YouTube videos with disabled captions or API rate limits.

Step 2: Deploy your Node.js backend to a cloud provider (e.g., Render) and ensure your MongoDB Atlas is configured for production access.

Step 3: Deploy your Vite React frontend to a global CDN (e.g., Vercel or Netlify).

Step 4: Create high-quality architecture diagrams and write a comprehensive README.md to finalize this as a premium portfolio piece.
