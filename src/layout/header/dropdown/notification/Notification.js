import React, { useEffect, useState } from "react";
import { DropdownToggle, DropdownMenu, UncontrolledDropdown, Container, Button } from "reactstrap";

import Icon from "../../../../components/icon/Icon";
// import data from "./NotificationData";
import * as API from '../../../../utils/API'
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { Offcanvas } from "react-bootstrap"
import { useDispatch } from "react-redux";
import { notify } from "../../../../redux/folderSlice";


const NotificationItem = (props) => {
  const { icon, iconStyle, text, time, id, redirectLink, markParticularMsgToRead, sidebar, setModalOpen } = props;
  const navigate = useNavigate()

  const clickEvent = async (e) => {
    e.preventDefault()
    await markParticularMsgToRead()

    sidebar && setModalOpen(false)
    navigate(redirectLink)
  }

  return (
    <div className="nk-notification-item custom-notify" key={id} id={id}>
      <div className="d-flex" onClick={clickEvent}>
        <div className="nk-notification-icon">
          <Icon name={icon} className={[`icon-circle ${iconStyle ? " " + iconStyle : ""}`]} />
        </div>
        <div className="nk-notification-content">
          <div className="nk-notification-text">{text}</div>
          <div className="nk-notification-time">{time}</div>
        </div>
      </div>
      <div className="d-flex closeIcon" onClick={async () => {
        await markParticularMsgToRead()
      }}>
        <i className="fa fa-times close-button"></i>
      </div>
    </div>
  );
};

const Notification = () => {

  const [data, setData] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const dispatch = useDispatch()

  const iconPattern = {
    "Assigned": {
      icon: "file-plus",
      iconStyle: "bg-warning-dim",
    },
    "assigned": {
      icon: "file-plus",
      iconStyle: "bg-warning-dim",
    },
    "Metadata": {
      icon: "files",
      iconStyle: "bg-warning-dim",
    },
    "OVERDUE": {
      icon: "files",
      iconStyle: "bg-warning-dim",
    },
    "Modified": {
      icon: "files",
      iconStyle: "bg-warning-dim",
    },
    "Comment": {
      icon: "cc-alt",
      iconStyle: "bg-warning-dim",
    },
    "Approved": {
      icon: "check-circle-fill",
      iconStyle: "bg-success-dim",
    },
    "Published": {
      icon: "upload",
      iconStyle: "bg-success-dim",
    },
    "Rejected": {
      icon: "alert-circle",
      iconStyle: "bg-danger-dim",
    },
    "Shared": {
      icon: "share-fill",
      iconStyle: "bg-success-dim",
    },
    "Membership Added": {
      icon: "user-group-fill",
      iconStyle: "bg-success-dim",
    },
    "Membership Revoked": {
      icon: "user-group-fill",
      iconStyle: "bg-danger-dim",
    },
  }

  useEffect(() => {
    fetchNotifications()

    const intervalId = setInterval(fetchNotifications, 30000)
    toast.remove();
    return () => {
      toast.remove()
      clearInterval(intervalId)
    }

  }, [])

  const fetchNotifications = async () => {
    try {
      const notifyResponse = await API.getNotify()

      if (!notifyResponse.status) return; // toast.error(`Error occured in while fetching notifications`)
      dispatch(notify(notifyResponse['data']))

      var notdata = await modifyData(notifyResponse?.['data']?.['notifyData'])
      setData(notdata)
    }
    catch (error) {
      console.error(error)
    }
  }

  const markAll = async (e) => {
    try {
      e.preventDefault()
      const notifyResponse = await API.markAllAsRead()
      if (!notifyResponse.status) return toast.error(`Error Occured While Updating Notifications`)

      await fetchNotifications()

    }
    catch (error) {
      console.error(error)
    }
  }

  const markParticularMsgToRead = async (id) => {
    try {
      const notifyResponse = await API.markParticularMsgToRead(id)
      if (!notifyResponse.status) return toast.error(`Error Occured While Updating Notifications`)

      await fetchNotifications()

    }
    catch (error) {
      console.error(error)
    }
  }

  const modifyData = async (data) => {
    const modified = [];

    for (let item of data) {
      const clonedItem = { ...item }; // clone to make it extensible

      clonedItem['displayTime'] = await getRelativeTime(item['createdAt'], localStorage.getItem('timeZone'));

      const notificationText = item['notificationText'];

      for (let action in iconPattern) {
        if (notificationText.includes(action)) {
          clonedItem['icon'] = iconPattern[action].icon;
          clonedItem['iconStyle'] = iconPattern[action].iconStyle;
          break;
        }
      }

      modified.push(clonedItem);
    }

    return modified;
  }



  async function getRelativeTime(fromDate, tz) {
    const localTime = userTimezone(fromDate, tz)

    const now = new Date()
    const then = new Date(localTime)

    const seconds = Math.floor((now - then) / 1000);  // Get the difference in seconds
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });  // RelativeTimeFormat instance

    if (seconds < 60) {
      return rtf.format(-seconds, 'second');  // Less than a minute
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return rtf.format(-minutes, 'minute');  // Less than an hour
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return rtf.format(-hours, 'hour');  // Less than a day
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
      return rtf.format(-days, 'day');  // Less than a month
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return rtf.format(-months, 'month');  // Less than a year
    }

    const years = Math.floor(months / 12);
    return rtf.format(-years, 'year');  // More than a year
  }

  const userTimezone = (utcString, tz) => {
    try {
      const options = {
        timeZone: tz,
        hour12: true,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };

      const localTime = new Date(utcString).toLocaleString("en-US", options);

      const localDate = new Date(localTime);

      if (isNaN(localDate)) {
        console.error("Invalid time zone conversion:", localTime);
        return null
      }

      return localDate.toISOString()
    } catch (error) {
      console.error("Error in time zone conversion:", error);
      return null;
    }
  }

  const toggleModal = () => setModalOpen(!modalOpen)

  return (
    <UncontrolledDropdown className="user-dropdown">
      <DropdownToggle tag="a" className="dropdown-toggle nk-quick-nav-icon">
        {
          data.length == 0 ? <Icon name="bell" /> :
            <div className="icon-status icon-status-info">
              <Icon name="bell" />
            </div>
        }


      </DropdownToggle>

      <DropdownMenu end className="dropdown-menu-xl dropdown-menu-s1">
        {data.length == 0 ? <>
          <div className={`dropdown-body ${data.length == 0 && 'p-5'}`}>
            <div className="nk-notification m-5">
              <center>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 118">
                  <path fill="#f6faff" d="M8.916 93.745C-.318 78.153-2.164 57.569 2.382 39.578 7.155 20.69 19.045 8.451 35.162 3.32 46.609-.324 58.716-.669 70.456.845 84.683 2.68 99.57 7.694 108.892 20.408c10.03 13.679 12.071 34.71 10.747 52.054-1.173 15.359-7.441 27.489-19.231 34.494-10.689 6.351-22.92 8.733-34.715 10.331-16.181 2.192-34.195-.336-47.6-12.281a47.243 47.243 0 01-9.177-11.261z" />
                  <rect width="84" height="50" x="18" y="32" fill="#fff" rx="4" ry="4" />
                  <rect width="20" height="12" x="26" y="44" fill="#e5effe" rx="1" ry="1" />
                  <rect width="20" height="12" x="50" y="44" fill="#e5effe" rx="1" ry="1" />
                  <rect width="20" height="12" x="74" y="44" fill="#e5effe" rx="1" ry="1" />
                  <rect width="20" height="12" x="38" y="60" fill="#e5effe" rx="1" ry="1" />
                  <rect width="20" height="12" x="62" y="60" fill="#e5effe" rx="1" ry="1" />
                  <path fill="#798bff" d="M98 31H22a5.006 5.006 0 00-5 5v42a5.006 5.006 0 005 5h30v8h-7a2 2 0 00-2 2v4a2 2 0 002 2h28a2 2 0 002-2v-4a2 2 0 00-2-2h-7v-8h32a5.006 5.006 0 005-5V36a5.006 5.006 0 00-5-5zM73 93v4H45v-4zm-9-2H54v-8h10zm37-13a3 3 0 01-3 3H22a3 3 0 01-3-3V36a3 3 0 013-3h76a3 3 0 013 3z" />
                  <path fill="#6576ff" d="M61.444 40H40.111L33 47.143V18.7a3.632 3.632 0 013.556-3.7h24.888A3.632 3.632 0 0165 18.7v17.6a3.632 3.632 0 01-3.556 3.7z" />
                  <path fill="none" stroke="#6576ff" strokeMiterlimit="10" strokeWidth="2" d="M61.444 40H40.111L33 47.143V18.7a3.632 3.632 0 013.556-3.7h24.888A3.632 3.632 0 0165 18.7v17.6a3.632 3.632 0 01-3.556 3.7z" />
                  <path fill="none" stroke="#fffffe" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M40 22L57 22" />
                  <path fill="none" stroke="#fffffe" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M40 27L57 27" />
                  <path fill="none" stroke="#fffffe" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M40 32L50 32" />
                  <path fill="none" stroke="#9cabff" strokeLinecap="round" strokeLinejoin="round" d="M30.5 87.5L30.5 91.5" />
                  <path fill="none" stroke="#9cabff" strokeLinecap="round" strokeLinejoin="round" d="M28.5 89.5L32.5 89.5" />
                  <path fill="none" stroke="#9cabff" strokeLinecap="round" strokeLinejoin="round" d="M79.5 22.5L79.5 26.5" />
                  <path fill="none" stroke="#9cabff" strokeLinecap="round" strokeLinejoin="round" d="M77.5 24.5L81.5 24.5" />
                  <circle cx="90.5" cy="97.5" r="3" fill="none" stroke="#9cabff" strokeMiterlimit="10" />
                  <circle cx="24" cy="23" r="2.5" fill="none" stroke="#9cabff" strokeMiterlimit="10" />
                </svg>

                <span> No Notifications</span>
              </center>
            </div>
          </div>
        </> :
          <>
            <div className="dropdown-head">
              <span className="sub-title nk-dropdown-title">Notifications</span>
              <a href="#markasread" onClick={(ev) => {
                markAll(ev)
              }}>
                Mark All as Read
              </a>
            </div>
            <div className="dropdown-body">
              <div className="nk-notification">
                {data?.map((item) => {
                  return (
                    <NotificationItem
                      key={item?._id}
                      id={item?._id}
                      icon={item?.icon}
                      iconStyle={item?.iconStyle}
                      text={item?.notificationText}
                      redirectLink={item?.redirectLink}
                      time={item?.displayTime || ''}
                      markParticularMsgToRead={async () => await markParticularMsgToRead(item?._id)}
                      sidebar={false}
                      setModalOpen={(val) => setModalOpen(val)}
                    />
                  )
                })}
              </div>
            </div>
            <div className="dropdown-foot center">
              <a href="#viewall" onClick={(ev) => {
                ev.preventDefault()
                setModalOpen(true)
              }}>
                View All
              </a>
            </div>
          </>
        }
      </DropdownMenu>

      <Offcanvas show={modalOpen} onHide={toggleModal} placement="end" style={{ width: '25%', maxWidth: 'none' }} >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title>
            <h5 className="card-title fw-bolder text-dark">
              Notifications &nbsp;
            </h5>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>

          <div>
            {true ? (
              <div className="nk-notification">
                {data?.map((item) => {
                  return (
                    <NotificationItem
                      key={item?._id}
                      id={item?._id}
                      icon={item?.icon}
                      iconStyle={item?.iconStyle}
                      text={item?.notificationText}
                      redirectLink={item?.redirectLink}
                      time={item?.displayTime || ''}
                      markParticularMsgToRead={async () => await markParticularMsgToRead(item?._id)}
                      sidebar={true}
                      setModalOpen={(val) => setModalOpen(val)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="text-muted text-center" style={{ marginTop: '2rem' }}>
                <div className="nk-notification m-5">
                  <center>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 118">
                      <path fill="#f6faff" d="M8.916 93.745C-.318 78.153-2.164 57.569 2.382 39.578 7.155 20.69 19.045 8.451 35.162 3.32 46.609-.324 58.716-.669 70.456.845 84.683 2.68 99.57 7.694 108.892 20.408c10.03 13.679 12.071 34.71 10.747 52.054-1.173 15.359-7.441 27.489-19.231 34.494-10.689 6.351-22.92 8.733-34.715 10.331-16.181 2.192-34.195-.336-47.6-12.281a47.243 47.243 0 01-9.177-11.261z" />
                      <rect width="84" height="50" x="18" y="32" fill="#fff" rx="4" ry="4" />
                      <rect width="20" height="12" x="26" y="44" fill="#e5effe" rx="1" ry="1" />
                      <rect width="20" height="12" x="50" y="44" fill="#e5effe" rx="1" ry="1" />
                      <rect width="20" height="12" x="74" y="44" fill="#e5effe" rx="1" ry="1" />
                      <rect width="20" height="12" x="38" y="60" fill="#e5effe" rx="1" ry="1" />
                      <rect width="20" height="12" x="62" y="60" fill="#e5effe" rx="1" ry="1" />
                      <path fill="#798bff" d="M98 31H22a5.006 5.006 0 00-5 5v42a5.006 5.006 0 005 5h30v8h-7a2 2 0 00-2 2v4a2 2 0 002 2h28a2 2 0 002-2v-4a2 2 0 00-2-2h-7v-8h32a5.006 5.006 0 005-5V36a5.006 5.006 0 00-5-5zM73 93v4H45v-4zm-9-2H54v-8h10zm37-13a3 3 0 01-3 3H22a3 3 0 01-3-3V36a3 3 0 013-3h76a3 3 0 013 3z" />
                      <path fill="#6576ff" d="M61.444 40H40.111L33 47.143V18.7a3.632 3.632 0 013.556-3.7h24.888A3.632 3.632 0 0165 18.7v17.6a3.632 3.632 0 01-3.556 3.7z" />
                      <path fill="none" stroke="#6576ff" strokeMiterlimit="10" strokeWidth="2" d="M61.444 40H40.111L33 47.143V18.7a3.632 3.632 0 013.556-3.7h24.888A3.632 3.632 0 0165 18.7v17.6a3.632 3.632 0 01-3.556 3.7z" />
                      <path fill="none" stroke="#fffffe" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M40 22L57 22" />
                      <path fill="none" stroke="#fffffe" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M40 27L57 27" />
                      <path fill="none" stroke="#fffffe" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M40 32L50 32" />
                      <path fill="none" stroke="#9cabff" strokeLinecap="round" strokeLinejoin="round" d="M30.5 87.5L30.5 91.5" />
                      <path fill="none" stroke="#9cabff" strokeLinecap="round" strokeLinejoin="round" d="M28.5 89.5L32.5 89.5" />
                      <path fill="none" stroke="#9cabff" strokeLinecap="round" strokeLinejoin="round" d="M79.5 22.5L79.5 26.5" />
                      <path fill="none" stroke="#9cabff" strokeLinecap="round" strokeLinejoin="round" d="M77.5 24.5L81.5 24.5" />
                      <circle cx="90.5" cy="97.5" r="3" fill="none" stroke="#9cabff" strokeMiterlimit="10" />
                      <circle cx="24" cy="23" r="2.5" fill="none" stroke="#9cabff" strokeMiterlimit="10" />
                    </svg>

                    <span> No Notifications</span>
                  </center>
                </div>
              </div>
            )}
          </div>


        </Offcanvas.Body>
      </Offcanvas>
    </UncontrolledDropdown>
  );
};

export default Notification;
