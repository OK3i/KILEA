import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import { AppLayout } from "./components/AppLayout.jsx";
import { RequireAuth, RequireRole } from "./components/RouteGuards.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { CatalogPage } from "./pages/CatalogPage.jsx";
import { CreateProjectPage } from "./pages/CreateProjectPage.jsx";
import { FavoritesPage } from "./pages/FavoritesPage.jsx";
import { ProjectDetailPage } from "./pages/ProjectDetailPage.jsx";
import { RoleLandingPage } from "./pages/RoleLandingPage.jsx";
import { ToastNotifications } from "./components/ToastNotifications.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastNotifications />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<CatalogPage />} />
            <Route path="projects/:projectId" element={<ProjectDetailPage />} />
            <Route element={<RequireAuth />}>
              <Route element={<RequireRole roles={["author", "admin"]} />}>
                <Route
                  path="projects/:projectId/edit"
                  element={<CreateProjectPage />}
                />
              </Route>
            </Route>
            <Route path="login" element={<AuthPage mode="login" />} />
            <Route path="register" element={<AuthPage mode="register" />} />
            <Route element={<RequireAuth />}>
              <Route path="favorites" element={<FavoritesPage />} />
              <Route element={<RequireRole roles={["author", "admin"]} />}>
                <Route path="projects/new" element={<CreateProjectPage />} />
              </Route>
              <Route element={<RequireRole roles={["author", "admin"]} />}>
                <Route
                  path="author"
                  element={<RoleLandingPage title="Author studio" />}
                />
              </Route>
              <Route element={<RequireRole roles={["admin"]} />}>
                <Route
                  path="admin"
                  element={<RoleLandingPage title="Admin workspace" />}
                />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
