import React, { useState, createContext, useContext, useEffect } from 'react';
import classNames from "classnames";
const ThemeContext = createContext();
const ThemeUpdateContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeUpdate() {
  return useContext(ThemeUpdateContext);
}


const ThemeProvider = ({ ...props }) => {

  const defaultTheme = {
    main: "default", //other value can be passed "clean,shady,softy"
    sidebarVisibility: false,
    sidebarMobile: false,
    header: "theme", //other value can be passed "light,dark,white,theme"
    skin: localStorage.getItem('idoks_theme') ? localStorage.getItem('idoks_theme') : "light", //other value can be passed "dark"
  }
  const [theme, setTheme] = useState(defaultTheme);

  const themeUpdate = {
    uistyle: function (value) {
      setTheme({ ...theme, main: value })
    },
    sidebarVisibility: function (e) {
      setTheme({ ...theme, sidebarVisibility: !theme.sidebarVisibility })
    },
    sidebarHide: function (e) {
      setTheme({ ...theme, sidebarVisibility: false })
    },
    header: function (value) {
      setTheme({ ...theme, header: value })
    },
    skin: function (value) {
      setTheme({ ...theme, skin: value })
    },
    reset: function (e) {
      setTheme({ ...theme, main: defaultTheme.main, sidebar: defaultTheme.sidebar, header: defaultTheme.header, skin: defaultTheme.skin })
    },
  }

  const bodyClass = classNames({
    "nk-body bg-lighter npc-invest has-touch nk-nio-theme": true,
  });

  useEffect(() => {
    const body = document.querySelector('body');
    body.className = bodyClass;
  }, []);

  useEffect(() => {
    const body = document.querySelector('body');
    if (theme.main === "default") {
      body.classList.add("ui-default")
      body.classList.remove("ui-clean", "ui-shady", "ui-softy")
    }
    if (theme.main === "clean") {
      body.classList.add(`ui-clean`)
      body.classList.remove("ui-default", "ui-shady", "ui-softy")
    }
    if (theme.main === "shady") {
      body.classList.add(`ui-shady`)
      body.classList.remove("ui-default", "ui-clean", "ui-softy")
    }
    if (theme.main === "softy") {
      body.classList.add(`ui-softy`)
      body.classList.remove("ui-default", "ui-clean", "ui-shady")
    }
    if (theme.skin === "dark") {
      // if(localStorage.getItem('idoks_theme')!='dark')
      body.classList.add(`dark-mode`)
    } else {
      // if(localStorage.getItem('idoks_theme')=='dark')
      body.classList.remove("dark-mode")
    }
    if (theme.sidebarVisibility === true) {
      body.classList.add("nav-shown")
    } else {
      body.classList.remove("nav-shown")
    }
  }, [theme]);

  useEffect(() => {
    const handleMobileSidebar = () => {
      if (window.innerWidth < 992) {
        setTheme({ ...theme, skin: "abc", sidebarMobile: true })
      } else {
        setTheme({ ...theme, skin: localStorage.getItem('idoks_theme') ? localStorage.getItem('idoks_theme') : "light", sidebarMobile: false, sidebarVisibility: false })
      }
    }

    handleMobileSidebar();
    window.addEventListener('resize', handleMobileSidebar);
    return () => {
      window.removeEventListener('resize', handleMobileSidebar);
    };
  }, []);

  console.log(window.innerWidth, theme, "innerWidth")


  return (
    <ThemeContext.Provider value={theme} >
      <ThemeUpdateContext.Provider value={themeUpdate}>
        {props.children}
      </ThemeUpdateContext.Provider>
    </ThemeContext.Provider>
  )
}
export default ThemeProvider;