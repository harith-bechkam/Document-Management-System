import React, { useState, useEffect } from "react";
import UserAvatar from "../../../../components/user/UserAvatar";
import { DropdownToggle, DropdownMenu, Dropdown } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { LinkList, LinkItem } from "../../../../components/links/Links";
import { useTheme, useThemeUpdate } from "../../../provider/Theme";
import { findLogoName } from "../../../../utils/Utils";
import { useMsal } from "@azure/msal-react";
import * as API from '../../../../utils/API';
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

const User = () => {
  const theme = useTheme();
  const themeUpdate = useThemeUpdate();
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((prevState) => !prevState);
  const { instance } = useMsal();
  const [lastLogin, setLastLogin] = useState({});
  const [userData, setUserdata] = useState({});
  const profileUpdateFlag = useSelector(state => state.folders.profileUpdate);

  useEffect(() => {
    async function fetchLastLogin() {
      if (localStorage.getItem('role') == 'User') {
        let response = await API.loginActivity(localStorage.getItem('userId'))

        if (response['data']) {
          setLastLogin(response['data'][0])
        }
        else toast.error(`User Not Found`);
      }
    }
    getUserData()
    fetchLastLogin()
  }, [profileUpdateFlag])

  async function getUserData() {
    const userRespo = await API.getUser(localStorage.getItem('userId'));
    if (userRespo.data) {
      setUserdata(userRespo["data"][0])
    }
  }

  const logout = async () => {
    // localStorage.clear()
    localStorage.removeItem('accessToken');
    localStorage.removeItem('appFeatures');
    localStorage.removeItem('email');
    localStorage.removeItem('privileges');
    localStorage.removeItem('role');
    localStorage.removeItem('timeZone');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userImg');
    localStorage.removeItem('userName');
    localStorage.removeItem('workspace_id');
    // await instance.logout().catch((error) => console.log(error));
    sessionStorage.clear()
  }

  function userAvatar() {
    if (userData?.imgUrl) {
      return <span><img
        src={userData?.imgUrl}
      />
      </span>
    } else {
      return <span>{findLogoName(userData?.userName)}</span>
    }

  }

  return (
    <Dropdown isOpen={open} className="user-dropdown" toggle={toggle}>
      <DropdownToggle
        tag="a"
        href="#toggle"
        className="dropdown-toggle"
        onClick={(ev) => {
          ev.preventDefault();
        }}
      >
        <div className="user-toggle">
          <UserAvatar image={userData?.imgUrl} text={findLogoName(userData?.userName)} className="sm" />
          {/* icon="user-alt" */}
          <div className="user-info d-none d-xl-block">
            <div
              className={`user-status ${theme.skin == 'light' ? 'user-role-light' : ''} ${window.location.pathname.split("/")[2] === "invest" ? "user-status-unverified" : ""
                }`}
            >
              {window.location.pathname.split("/")[2] === "invest" ? "Unverified" : localStorage.getItem('role')}
            </div>
            <div className={` dropdown-indicator ${theme.skin == 'light' ? 'user-name-light' : ''}`}>{userData?.userName}</div>
          </div>
        </div>
      </DropdownToggle>
      <DropdownMenu end className="dropdown-menu-md dropdown-menu-s1">
        <div className="dropdown-inner user-card-wrap bg-lighter d-none d-md-block">
          <div className="user-card sm">
            <div className="user-avatar">
              {userAvatar()}
            </div>

            <div className="user-info">
              <span
                className="lead-text"
              // className="fw-bold"
              >{localStorage.getItem('userName')}</span>
              <span className="sub-text">{localStorage.getItem('email')}</span>
              {localStorage.getItem('role') === 'User' && (<span className="text-base">Last Login: {lastLogin?.['loggedInTime'] ? lastLogin?.['loggedInTime'] : '-'}</span>)}
            </div>
          </div>
        </div>
        <div className="dropdown-inner">
          <LinkList>
            <LinkItem
              link={window.location.pathname.split("/")[2] === "invest" ? "/invest/profile" : "/user-profile-regular"}
              icon="user-alt"
              onClick={toggle}
            >
              View Profile
            </LinkItem>
            <LinkItem
              link={
                window.location.pathname.split("/")[2] === "invest"
                  ? "/invest/profile-setting"
                  : "/user-profile-setting"
              }
              icon="setting-alt"
              onClick={toggle}
            >
              Account Setting
            </LinkItem>
            {localStorage.getItem('role') != 'User' &&
              <LinkItem
                link={
                  window.location.pathname.split("/")[2] === "invest"
                    ? "/invest/profile-activity"
                    : "/user-profile-activity"
                }
                icon="activity-alt"
                onClick={toggle}
              >
                Login Activity
              </LinkItem>
            }

            <li>
              <a className={`dark-switch ${theme.skin === 'dark' ? 'active' : ''}`} href="#"
                onClick={(ev) => {
                  ev.preventDefault();
                  themeUpdate.skin(theme.skin === 'dark' ? 'light' : 'dark');
                  // debugger
                  localStorage.setItem('idoks_theme', theme.skin === 'dark' ? 'light' : 'dark')
                }}>
                {theme.skin === 'dark' ?
                  <><em className="icon ni ni-sun"></em><span>Light Mode</span></>
                  :
                  <><em className="icon ni ni-moon"></em><span>Dark Mode</span></>
                }
              </a>
            </li>
          </LinkList>
        </div>
        <div className="dropdown-inner">
          <LinkList>
            <a href={`/`} onClick={logout}>
              <Icon name="signout"></Icon>
              <span>Sign Out</span>
            </a>
          </LinkList>
        </div>
      </DropdownMenu>
      <Toaster />
    </Dropdown>
  );
};

export default User;
