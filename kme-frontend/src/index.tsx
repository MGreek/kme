import dotenv from "dotenv";
import { createRoot } from "react-dom/client";
import App from "./App";

dotenv.config();

const container = document.getElementById("app");
if (container == null) {
  throw new Error(`No element with id="app"`);
}
const root = createRoot(container);
root.render(<App />);
