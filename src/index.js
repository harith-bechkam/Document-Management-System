import React, { useState, useEffect } from "react";
import { useParams, useLocation, Navigate, useNavigate } from 'react-router';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import "./assets/scss/dashlite.scss";
import "./assets/scss/style-email.scss";
import reportWebVitals from "./reportWebVitals";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import store from "./redux/store";
import { PublicClientApplication, EventType, LogLevel } from "@azure/msal-browser";
import { msalConfig } from "./utils/auth-config";
import * as API from './utils/API';
import { HelmetProvider } from "react-helmet-async";

const msalInstance = new PublicClientApplication(msalConfig)

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
    const account = event.payload.account
    msalInstance.setActiveAccount(account)
  }
})

const root = ReactDOM.createRoot(document.getElementById('root'))

const Root = () => {

  const getBaseUrl = () => {
    return localStorage.getItem('accessToken') && localStorage.getItem('workspace_id')
      ? `/${localStorage.getItem('workspace_id')}`
      : '/';
  };

  const [basename, setBasename] = useState(getBaseUrl());

  const updateBasename = async () => {
    setBasename(getBaseUrl());
  };

  useEffect(() => {
    updateBasename();
    window.addEventListener('storage', updateBasename); // Listen for storage changes
    API.checkredirectURL();
    return () => {
      window.removeEventListener('storage', updateBasename);
    };
  }, []);




  return (
    <HelmetProvider>
      <Provider store={store}>
        <HashRouter basename={basename}>
          <DndProvider backend={HTML5Backend}>
            <App instance={msalInstance} />
          </DndProvider>
        </HashRouter>
      </Provider>
    </HelmetProvider>
  );
};
root.render(<Root />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
