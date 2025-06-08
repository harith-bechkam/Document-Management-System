import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon, UserAvatar } from "../../../components/Component";
import { findLogoName } from "../../../utils/Utils";
import { DropdownItem, UncontrolledDropdown, DropdownMenu, DropdownToggle } from "reactstrap";
import * as API from '../../../utils/API';
import { useSelector } from "react-redux";

const UserProfileAside = ({ updateSm, sm, profileUpdated, setModal }) => {
    const [profileName, setProfileName] = useState(localStorage.getItem('userName'));
    const [userData, setUserdata] = useState({});

    let store = useSelector(state => state.folders);


    useEffect(() => {
        sm ? document.body.classList.add("toggle-shown") : document.body.classList.remove("toggle-shown");
        getUserData();
    }, [sm, profileUpdated])

    async function getUserData() {
        const userRespo = await API.getUser(localStorage.getItem('userId'));
        if (userRespo.data) {
            setUserdata(userRespo["data"][0])
        }
    }

    return (
        <div className="card-inner-group">
            <div className="card-inner">
                <div className="user-card">
                    <UserAvatar image={userData?.imgUrl} text={findLogoName(userData?.userName)} theme="primary" />
                    <div className="user-info">
                        <span
                         className="lead-text"
                        >{userData?.userName}</span>
                        <span className="sub-text">{localStorage.getItem('email')}</span>
                    </div>
                    <div className="user-action">
                        <UncontrolledDropdown>
                            <DropdownToggle tag="a" className="btn btn-icon btn-trigger me-n2"> 
                                <Icon name="more-v"></Icon>
                            </DropdownToggle>
                            <DropdownMenu end>
                                <ul className="link-list-opt no-bdr">
                                    {/* <li>
                                        <DropdownItem
                                            tag="a"
                                            href="#dropdownitem"
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                            }}
                                        >
                                            <Icon name="camera-fill"></Icon>
                                            <span>Change Photo</span>
                                        </DropdownItem>
                                    </li> */}
                                    <li>
                                        <DropdownItem
                                            tag="a"
                                            href="#dropdownitem"
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                                setModal(true);
                                            }}
                                        >
                                            <Icon name="edit-fill"></Icon>
                                            <span>Update Profile</span>
                                        </DropdownItem>
                                    </li>
                                </ul>
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    </div>
                </div>
            </div>
            {/* <div className="card-inner">
        <div className="user-account-info py-0">
        <h6 className="overline-title-alt">Nio Wallet Account</h6>
        <div className="user-balance">
            12.395769 <small className="currency currency-btc">BTC</small>
        </div>
        <div className="user-balance-sub">
            Locked{" "}
            <span>
            0.344939 <span className="currency currency-btc">BTC</span>
            </span>
        </div>
        </div>
    </div> */}
            <div className="card-inner p-0">
                <ul className="link-list-menu">
                    <li onClick={() => updateSm(false)}>
                        <Link
                            to={`${process.env.PUBLIC_URL}/user-profile-regular`}
                            className={
                                window.location.href.indexOf("/user-profile-regular") != -1 ? "active" : ""
                            }
                        >
                            <Icon name="user-fill-c"></Icon>
                            <span>Personal Information</span>
                        </Link>
                    </li>
                    {/* <li onClick={() => updateSm(false)}>
                        <Link
                            to={`${process.env.PUBLIC_URL}/user-profile-notification`}
                            className={
                                window.location.pathname === `${process.env.PUBLIC_URL}/user-profile-notification`
                                    ? "active"
                                    : ""
                            }
                        >
                            <Icon name="bell-fill"></Icon>
                            <span>Notification</span>
                        </Link>
                    </li> */}
                    {localStorage.getItem('role') != 'User' &&
                        <li onClick={() => updateSm(false)}>
                            <Link
                                to={`${process.env.PUBLIC_URL}/user-profile-activity`}
                                className={
                                    window.location.href.indexOf("/user-profile-activity") != -1 ? "active" : ""
                                }
                            >
                                <Icon name="activity-round-fill"></Icon>
                                <span>Account Activity</span>
                            </Link>
                        </li>
                    }
                    <li onClick={() => updateSm(false)}>
                        <Link
                            to={`${process.env.PUBLIC_URL}/user-profile-setting`}
                            className={
                                window.location.href.indexOf("/user-profile-setting") != -1 ? "active" : ""
                            }
                        >
                            <Icon name="lock-alt-fill"></Icon>
                            <span>Security Setting</span>
                        </Link>
                    </li>
                    <li onClick={() => updateSm(false)}>
                        <Link
                            to={`${process.env.PUBLIC_URL}/workspace-setting`}
                            className={
                                window.location.href.indexOf("/workspace-setting") != -1 ? "active" : ""
                            }
                        >
                            <Icon name="tree-structure-fill" />
                            <span>Workspace Setting</span>
                        </Link>
                    </li>
                    <li onClick={() => updateSm(false)}>
                        <Link
                            to={`${process.env.PUBLIC_URL}/integration`}
                            className={
                                window.location.href.indexOf("/integration") != -1 ? "active" : ""
                            }
                        >
                           <Icon name="traffic-signal-fill"/>
                            <span>Integration</span>
                        </Link>
                    </li>
                    {
                        store?.myworkspace?.map(work => (
                            <>
                                {
                                    localStorage.getItem("workspace_id") == work?._id?.toString() &&
                                    (
                                        work?.owner == work?.userinfo?.userId && work?.owner == localStorage?.getItem('userId')
                                    )
                                    &&
                                    <li onClick={() => updateSm(false)}>
                                        <Link
                                            to={`${process.env.PUBLIC_URL}/workspace-subscription`}
                                            className={
                                                window.location.href?.indexOf("/workspace-subscription") != -1 ? "active" : ""
                                            }
                                        >
                                            <Icon name="user-switch-fill" />
                                            <span>My Subscription</span>
                                        </Link>
                                    </li>
                                }
                            </>
                        ))
                    }


                </ul>
            </div>
        </div>
    );
};

export default UserProfileAside;
