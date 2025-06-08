import React, { useLayoutEffect,useEffect } from "react";
import { Routes, Route, useLocation, Navigate,useNavigate } from "react-router-dom";
import LayoutNoSidebar from "../layout/Index-nosidebar";
import { AuthPage } from "./AuthPage";
import { PrivateRoutes } from "./PrivateRoutes";
import CreatePassword from "../pages/auth/CreatePassword";
import ResetPassword from "../pages/auth/ResetPassword";
import { useDispatch } from "react-redux";
import { updateDocumentUrl } from "../redux/folderSlice";
import InvalidRecoverToken from "../pages/auth/InvalidRecoverToken";
import NoRecoverToken from "../pages/auth/NoRecoverToken";
import NoCreatePasswordToken from "../pages/auth/NoCreatePasswordToken";
import InvalidCreatePasswordToken from "../pages/auth/InvalidCreatePasswordToken";
import UserActivation from "../pages/admin/Users/UserActivation"
import * as API from '../utils/API';
import FileView from '../pages/app/file-manager/components/FileView';
import UnSupportFilesViewer from '../pages/app/file-manager/views/unsupportfileViewer';
import FormViewer from '../pages/admin/FormBuilder/FormViewer';
import Details from "../pages/app/file-manager/views/Details";

const Router = () => {
  const navigate = useNavigate();
  const location = useLocation()
  const dispatch = useDispatch();
  // useEffect(() => {
  //   console.log("path ",location.pathname)
  //   API.checkredirectURL();
  //   window.scrollTo(0, 0)
  // }, [location.search, location.pathname])



  return (
    <Routes>
      <Route element={<LayoutNoSidebar />}>
        <Route path=":workspaceId/file/view/:id" element={<FileView />}/>
        {/* <Route path=":workspaceId/details/:id" element={<Details />} /> */}

        <Route path='auth/resetPassword/:id?' element={<ResetPassword />} />
        <Route path='auth/createPassword/:id?' element={<CreatePassword />} />

        <Route path='auth/invalid-recover-token' element={<InvalidRecoverToken />} />
        <Route path='auth/no-recover-token' element={<NoRecoverToken />} />
        <Route path='auth/invalid-no-token' element={<InvalidCreatePasswordToken />} />
        <Route path='auth/no-token' element={<NoCreatePasswordToken />} />
        <Route path=":workspace_id/file/view/:id/:externalusertoken" element={<FileView />} />
        <Route path="/:workspaceId/file/:id/:externalusertoken" element={<UnSupportFilesViewer />} />
        <Route path="/:workspaceId/form/:id/:externalusertoken" element={<FormViewer />} />
      </Route>

      {localStorage.getItem("accessToken")  && localStorage.getItem('workspace_id')? (
        <>
          <Route path="/*" element={<PrivateRoutes />} />
          
          <Route index element={<Navigate to="/home" />} />
        </>
      ) : (
        <>
          <Route path="/:workspaceId/user-activation/:token?"  element={<UserActivation />} />
          <Route path="auth/*" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </>
      )}
    </Routes>
  )
}
export default Router;
