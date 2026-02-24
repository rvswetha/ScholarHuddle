import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";
import { AuthProvider } from './context/AuthContext.jsx'; 
import { PomodoroProvider } from './context/PomodoroContext.jsx';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <PomodoroProvider> 
        <RouterProvider router={router} />
      </PomodoroProvider>
    </AuthProvider>
  </React.StrictMode>
);