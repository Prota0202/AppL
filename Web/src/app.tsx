import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { MetaProvider, Title } from "@solidjs/meta";
import { ToastProvider } from "./components/toast/toast";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Solo Leveling</Title>
          <div id="toast" />
          <ToastProvider>
            <Suspense>
              {props.children}
            </Suspense>
          </ToastProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}