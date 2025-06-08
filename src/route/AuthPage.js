import { Route, Routes } from 'react-router-dom'
import LayoutNoSidebar from "../layout/Index-nosidebar";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Error404Modern from "../pages/error/404-modern";
import FileView from '../pages/app/file-manager/components/FileView';


const AuthPage = () => (
    <Routes>
        <Route element={<LayoutNoSidebar />}>
            <Route path='login' element={<Login />} />
            <Route path='registration' element={<Register />} />
            <Route path='forgot-password' element={<ForgotPassword />} />
            <Route index element={<Login />} />
            <Route path="*" element={<Error404Modern />} />
        </Route>
    </Routes>
)

export { AuthPage }