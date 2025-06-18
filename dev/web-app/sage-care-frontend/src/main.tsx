import React from "react";
import "./index.css";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
