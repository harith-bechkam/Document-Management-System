import React, { useEffect } from 'react';
import { useNavigate, Outlet } from "react-router";
import Router from "./route/Index";
import {
  // initializeTimeMe, callWhenUserLeaves,
  setupFetchInterceptor
} from './utils/Utils';
import ThemeProvider from "./layout/provider/Theme";
import ChatbotListener from './pages/app/file-manager/components/chatbot/chatbotmessager';
import axios from 'axios'
import { setupAxios } from './utils/Utils'
import { MsalProvider } from "@azure/msal-react";
import { useSelector } from 'react-redux';

setupFetchInterceptor()
setupAxios(axios)
const App = ({ instance }) => {

  const navigate = useNavigate()
  const store = useSelector(state=>state?.folders)

  // useEffect(() => {
  //   initializeTimeMe()
  //   callWhenUserLeaves(() => {
  //     localStorage.clear()
  //     navigate('/auth/login')
  //   })
  // }, [])



  return (
    <ThemeProvider>
      <MsalProvider instance={instance}>
        <Router />
       {store?.myworkspace?.length>0 && <ChatbotListener workspace={store?.myworkspace}/>} 
      </MsalProvider>
    </ThemeProvider>
  )
}
export default App;