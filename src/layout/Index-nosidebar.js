import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Head from "./head/Head";

const Layout = ({ title, ...props }) => {
  const location = useLocation();
  return (
    <>
      <Head title={!title && 'Loading'} />
      <div className="nk-app-root">
          <div className={`nk-wrap nk-wrap-nosidebar ${(location.pathname.includes('viewForm')||(location.pathname.includes('form')))?'form-wrap':''}`}>
            <div className={location.pathname.includes('auth') ? `nk-content auth-background` : `nk-content`}>
              <Outlet />
            </div>
        </div>
      </div>
    </>
  );
};
export default Layout;
