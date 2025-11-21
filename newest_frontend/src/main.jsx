import './styles/global/index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import Login from './pages/Authentication/Login';
import DeviceManagement from './pages/DeviceManagement/page';
import ManagementLayout from './Layout/management/Layout';

import UserManagement from './pages/UserManagement/page';
import OrganizationManagement from './pages/OrganizationManagement/page';
import BrandManagement from './pages/BrandManagement/page';
import VenueManagement from './pages/VenueManagement/page';
import Dashboard from './pages/Dashboard/page'
import App from './App';
import { Provider } from 'react-redux';
import store from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor } from './store/store';
import { StoreProvider } from './contexts/storecontexts';
import DashboardRoute from './Routes/DashboardRoute';
import ProtectedRoute from './Routes/ProtectedRoute';
import UserRoute from './Routes/UserRoute';
import AdminRoute from './Routes/AdminRoute';
import VerifyOtp from './pages/Authentication/VerifyOtp';
import SetupPassword from './pages/Authentication/SetupPassword';
import ForgotPassword from './pages/Authentication/ForgotPassword';
import ResetPassword from './pages/Authentication/ResetPassword';
import PublicRoute from './Routes/PublicRoute';
import NotFound from './pages/Notfound';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StoreProvider>
          <BrowserRouter>
            <Routes>

              {/* --------------------------
                  Public routes (wrapped)
                 -------------------------- */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <App />
                  </PublicRoute>
                }
              >
                {/* NOTE: child paths are relative (no leading "/") */}
                <Route index element={<Login />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password/:token" element={<ResetPassword />} />
                <Route path="setup-password/:token" element={<SetupPassword />} />
                <Route path="verify-otp/:token" element={<VerifyOtp />} />
              </Route>

              {/* --------------------------
                  Protected (authenticated)
                 -------------------------- */}
              <Route element={<ProtectedRoute />}>
                {/* User-only routes */}
                <Route element={<UserRoute />}>
                  <Route element={<DashboardRoute />}>
                    <Route path="management" element={<ManagementLayout />}>
                      <Route index element={<Dashboard />} />
                     </Route>
                  </Route>
                </Route>

                {/* Admin-only routes */}
                <Route element={<AdminRoute />}>
                  <Route element={<DashboardRoute />}>
                    {/* note: top-level admin path */}
                    <Route path="admin/management" element={<ManagementLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="organization" element={<OrganizationManagement />} />
                      <Route path="device" element={<DeviceManagement />} />
                      <Route path="venue" element={<VenueManagement />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="brands" element={<BrandManagement />} />  
                    </Route>
                  </Route>
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StoreProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);


