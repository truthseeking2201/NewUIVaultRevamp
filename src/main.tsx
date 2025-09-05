// Sentry initialization should be imported first!
import "./instrument";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Simplify the rendering process to reduce potential errors
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found!");
} else {
  // Mount app immediately
  const root = createRoot(rootElement);
  root.render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>
  );
}
