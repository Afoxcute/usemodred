import { createRoot } from "react-dom/client";
import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider } from "thirdweb/react";
import App from "./App.tsx";
import "./index.css";

const client = createThirdwebClient({
  clientId: "c0016c054a796a6fa54b18dd24ed5f77",
});

createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider>
    <App thirdwebClient={client} />
  </ThirdwebProvider>
);
