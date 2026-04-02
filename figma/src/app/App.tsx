import { ThemeProviderWrapper } from "./components/theme-provider";
import { AppSidebar } from "./components/app-shell/sidebar";
import { Header } from "./components/app-shell/header";
import { CommandPalette } from "./components/app-shell/command-palette";
import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <ThemeProviderWrapper>
      <RouterProvider router={router} />
    </ThemeProviderWrapper>
  );
}
