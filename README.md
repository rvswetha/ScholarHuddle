### **STUDYHUDDLE**



StudyHuddle is a full-stack productivity ecosystem designed for students. It combines deep-work tools like a Pomodoro Timer and Eye-Care (Screen Break) Alerts with collaborative features like AI-Powered Flashcard Generation and Real-time Study Group Chatrooms.



##### KEY FEATURES

&nbsp;  -AI Flashcard Generator: Upload PDFs or paste notes to instantly generate study decks using Google Gemini AI.

&nbsp;  -Deep Work Suite: Custom Pomodoro Timer syncs study sessions across the app to track productivity points.

&nbsp;  -Screen Break Mode: Automatic reminders to follow the 20-20-20 rule, reducing digital eye strain.

&nbsp;  -Collaborative Study Rooms:

* &nbsp;      Real-time Chat: Powered by Supabase WebSockets for instant communication.
* &nbsp;      Cross-Platform Notifications: Integrated with Firebase Cloud Messaging (FCM) to alert group members of new messages even when they are offline.

&nbsp;   -Resource Sharing: Share generated flashcards directly into group chats for peer-to-peer learning.



##### THE TEACH STACK

The Layers and it's Technology

* &nbsp;	Frontend : React.js, Vite, Axios
* &nbsp;	Backend : Node.js, Express.js
* &nbsp;	Database \& Auth : Supabase (PostgreSQL)
* &nbsp;	Real-time : Supabase Realtime (WebSockets)
* &nbsp;	AI Engine : Google Gemini API
* &nbsp;	Notifications : Firebase Cloud Messaging (FCM) \& Native Browser Notification API



##### TECHNICAL HIGHLIGHTS

###### 1\. Native Browser Integration

&nbsp;  To keep the app lean, the Pomodoro and Screen Break timers utilize the Native Browser Notification API and Web Audio API. This ensures reliable alerts without the overhead of third-party libraries.



###### 2\. Notification Pipeline

&nbsp;  Built a secure bridge between the frontend and backend to handle offline notifications:

&nbsp;  	a. **Client**: Requests permission and generates an FCM token.

&nbsp;	b. **Supabase**: Stores user tokens securely in the profiles table.

&nbsp;	c. **Backend**: A Node.js service uses the Firebase Admin SDK to dispatch push notifications to group members whenever new messages are detected.



###### 3\. Scalable State Management

&nbsp;  Utilized Custom React Hooks (usePomodoro) to share complex timer logic across multiple UI components (Main Timer page vs. Sidebar Widget), ensuring a "Single Source of Truth" for session data.

