import React, { useState, useEffect, useRef, forwardRef } from "react";
import Content from "../../../layout/content/Content";
import { Card, Label } from "reactstrap";
import Head from "../../../layout/head/Head";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { Modal, ModalBody } from "reactstrap";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  Row,
  Col,
  Button,
  RSelect
} from "../../../components/Component";
import { countryOptions, userData } from "./UserData";
import { getDateStructured } from "../../../utils/Utils";

import UserProfileAside from "./UserProfileAside";
import moment from "moment";
import * as API from '../../../utils/API';
import { allTimezones, useTimezoneSelect } from "react-timezone-select";
import toast, { Toaster } from "react-hot-toast";
import { toaster } from "rsuite";
import { useDispatch } from "react-redux";
import { updateProfileFlag } from "../../../redux/folderSlice";
import Swal from "sweetalert2";
import parsePhoneNumberFromString from "libphonenumber-js";
import { Controller, useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import UpdateProfileModal from "./UpdateProfileModal";

const UserProfileRegularPage = () => {
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const dispatch = useDispatch();
  const [modalTab, setModalTab] = useState("1");
  // const [userInfo, setUserInfo] = useState(userData[0]);
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('user')));
  const [userDetails, setUserData] = useState(JSON.parse(localStorage.getItem('user')))
  const [userProfile, setUserProfile] = useState({})
  const [formData, setFormData] = useState({
    name: userDetails?.userName || '',
    displayName: userDetails?.userName || '',
    phone: userDetails?.mobile || '',
    dob: userDetails?.dob || '',
    // address: userDetails?.dob||'',
    // address2: "",
    // state: "Kentucky",
    // country: "Canada",
  });
  const [modal, setModal] = useState(false);
  const [file, setFile] = useState(null);
  const [fileErr, setFileErr] = useState(null);
  const [fileError, setFileError] = useState(false);
  const [fileTypeError, setFileTypeError] = useState(`Upload an Image File`);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const Privilege = JSON?.parse(localStorage.getItem('privileges'));
  const [roleEdited, setRoleEdited] = useState(false);

  const privileges = {
    viewAccessOverview: Privilege?.accessOverview?.viewAccessOverview,
    updateUser: Privilege?.user?.updateUser,
  }
  const [roleOptions, setRoleOptions] = useState([])
  const [role, setRole] = useState('')

  const [nameError, setNameError] = useState('');
  const [nameErr, setNameErr] = useState(false);
  const [phoneerror, setPhoneError] = useState("");

  const labelStyle = "original";
  const time = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezones = {
    ...allTimezones,
    "Europe/Berlin": "Frankfurt",
  }
  const { options: time_zone, parseTimezone } = useTimezoneSelect({
    labelStyle,
    timezones,
  })
  const [timezone, setTimeZone] = useState('');
  const [timeZoneOptions, setTimeZoneOptions] = useState([])

  const inputRef = useRef(null);




  const onInputChange = (e, mobile = false, tz = false, role = false) => {
    if (role) {
      setRole(e);
      setUserProfile({ ...userProfile, "role": e.value });
    }
    else if (mobile) {
      setUserProfile({ ...userProfile, "mobile": e });
    }
    else if (tz) {
      setTimeZone(e)
      setUserProfile({ ...userProfile, "timeZone": e.value });
    } else {
      setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
    }
  };

  const submitForm = async () => {

    if (userProfile.userName == '') {
      setNameError('Name should not be empty');
      setNameErr(true);
      return
    }

    if (userProfile?.mobile != '') {
      const phoneNumber = parsePhoneNumberFromString(userProfile?.mobile)
      if (!phoneNumber || !phoneNumber.isValid()) {
        setPhoneError("Enter a valid Mobile Number")
        return
      }
    }




    function getBase64(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsDataURL(file);
      });
    }

    let imageToBase64 = '';
    if (file) {
      imageToBase64 = await getBase64(file)
    }
    let updatedForm = userProfile;
    if (file) {
      updatedForm["imgUrl"] = imageToBase64;
    }
    // setProfileUpdated(prev => !prev);
    // dispatch(updateProfileFlag({}))
    const updateResponse = await API.updateUser(userProfile._id, updatedForm);
    if (!updateResponse.status) {
      return toast.error(updateResponse.message.replace(/\b\w/g, char => char.toUpperCase()))
    }
    if (roleEdited) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/'
    }
    setProfileUpdated(prev => !prev);
    dispatch(updateProfileFlag({}))
    localStorage.setItem('user', JSON.stringify(updateResponse['data']));
    localStorage.setItem('userImg', updateResponse['data']?.imgUrl);
    toast.success('Profile updated successfully')
    // debugger
    setModal(false);

  };

  const viewChange = () => {
    if (window.innerWidth < 990) {
      setMobileView(true);
    } else {
      setMobileView(false);
      updateSm(false);
    }
  };

  useEffect(() => {
    viewChange();
    window.addEventListener("load", viewChange);
    window.addEventListener("resize", viewChange);
    document.getElementsByClassName("nk-header")[0].addEventListener("click", function () {
      updateSm(false);
    });
    fileData()
    // inputRef && inputRef.current.focus();
    return () => {
      window.removeEventListener("resize", viewChange);
      window.removeEventListener("load", viewChange);
    };
  }, [profileUpdated]);

  const [profileModal, setProfileModal] = useState(false);
    
    const toggleProfileModal = () => {
      setProfileModal(!profileModal);
    }

  async function fileData() {

    let tz = time_zone?.filter((p) => p.value === time)[0]?.label === undefined
      ? "Asia/Kolkata"
      : time_zone?.filter((p) => p.value === time)[0]?.label
    setTimeZone({
      label: tz,
      value: tz
    })
    setTimeZoneOptions(time_zone.map(p => ({
      label: p?.label,
      value: p?.value
    })))

    const userRespo = await API.getUser(localStorage.getItem('userId'));
    let roleResponse = await API.getAllRoles();
    if (roleResponse['status']) {
      setRoleOptions(roleResponse['data'].map((v) => ({ label: v.role, value: v._id })))
    }
    if (userRespo.data) {
      setUserProfile(userRespo["data"][0]);
      const currentUserRole = userRespo.data[0]?.role;
      if (currentUserRole) {
        const roleData = roleResponse['data'].map((v) => ({ label: v.role, value: v._id }))
        const selectedRole = roleData.find((role) => role.value == currentUserRole._id);
        if (selectedRole) {
          setRole(selectedRole);
        }
      }
      if (userRespo.data[0]?.imgUrl) {
        setSelectedFile(userRespo["data"][0]?.imgUrl)
        setFileErr(false);
      } else {
        setFileErr(true);
      }
    }
  }

  const openModal = () => {
    setNameError('')
    setNameErr(false)
    setPhoneError("")
    setModal(true)
  }

  var maxBirthdayDate = new Date();

  const minBirthdayDate = new Date();
  minBirthdayDate.setFullYear(maxBirthdayDate.getFullYear() - 100);

  function handleDOB(e) {
    setUserProfile({ ...userProfile, "dob": moment(e).format('MM/DD/YYYY') })
  }

  const ExampleCustomInput = forwardRef(({ value, onClick, onChange }, ref) => (
    <div onClick={onClick} ref={ref}>
      <div className="form-icon form-icon-left">
        <Icon name="calendar"></Icon>
      </div>
      <input className="form-control date-picker" type="text" value={value} onChange={onChange} id='dob' placeholder="Select your DOB" autoComplete="off" />
    </div>
  ))




  return (
    <React.Fragment>
      <Head title="User List - Profile"></Head>
      <Content>
        <Card className="card-bordered">
          <div className="card-aside-wrap">
            <div
              className={`card-aside card-aside-left user-aside toggle-slide toggle-slide-left toggle-break-lg ${sm ? "content-active" : ""
                }`}
            >
              <UserProfileAside updateSm={updateSm} sm={sm} profileUpdated={profileUpdated} setModal={setProfileModal} />
            </div>
            <div className="card-inner card-inner-lg">
              {sm && mobileView && <div className="toggle-overlay" onClick={() => updateSm(!sm)}></div>}
              <BlockHead size="lg">
                <BlockBetween>
                  <BlockHeadContent>
                    <BlockTitle tag="h4">Personal Information</BlockTitle>
                    <BlockDes>
                      <p>Basic info, like your name and email, that you use on iDoks.</p>
                    </BlockDes>
                  </BlockHeadContent>
                  <BlockHeadContent className="align-self-start d-lg-none">
                    <Button
                      className={`toggle btn btn-icon btn-trigger mt-n1 ${sm ? "active" : ""}`}
                      onClick={() => updateSm(!sm)}
                    >
                      <Icon name="menu-alt-r"></Icon>
                    </Button>
                  </BlockHeadContent>
                </BlockBetween>
              </BlockHead>

              <Block>
                <div className="nk-data data-list">
                  <div className="data-head">
                    <h6 className="overline-title">Details</h6>
                  </div>
                  <div className="data-item" onClick={()=>setProfileModal(true)}>
                    <div className="data-col">
                      <span className="data-label">Username</span>
                      <span className="data-value">{userProfile?.userName}</span>
                    </div>
                    <div className="data-col data-col-end">
                      <span className="data-more">
                        <Icon onClick={()=>setProfileModal(true)}  name="forward-ios"></Icon>
                      </span>
                    </div>
                  </div>
                  <div className="data-item"
                    onClick={() => {
                      if (privileges.updateUser) {
                        setProfileModal(true)
                        setNameError('')
                        setNameErr(false)
                        setPhoneError("")
                        setModal(true)
                      }
                    }}
                  >
                    <div className="data-col" >
                      <span className="data-label">Role</span>
                      <span className="data-value">{userProfile?.role?.role}</span>
                    </div>
                    <div className="data-col data-col-end">
                      <span className="data-more">
                        {privileges.updateUser ? <Icon onClick={()=>setProfileModal(true)} name="forward-ios"></Icon> : <Icon name="lock-alt"></Icon>}
                      </span>
                    </div>
                  </div>
                  <div className="data-item">
                    <div className="data-col">
                      <span className="data-label">Email</span>
                      <span className="data-value">{userProfile?.email}</span>
                    </div>
                    <div className="data-col data-col-end">
                      <span className="data-more disable">
                        <Icon name="lock-alt"></Icon>
                      </span>
                    </div>
                  </div>
                  <div className="data-item" onClick={()=>setProfileModal(true)}>
                    <div className="data-col">
                      <span className="data-label">Phone Number</span>
                      <span className="data-value text-soft">{userProfile?.mobile}</span>
                    </div>
                    <div className="data-col data-col-end">
                      <span className="data-more">
                        <Icon onClick={()=>setProfileModal(true)}  name="forward-ios"></Icon>
                      </span>
                    </div>
                  </div>
                  <div className="data-item" onClick={()=>setProfileModal(true)}>
                    <div className="data-col">
                      <span className="data-label">Date of Birth</span>
                      <span className="data-value">{userProfile?.dob ? moment(userProfile?.dob)?.format('ll') : '-'}</span>
                    </div>
                    <div className="data-col data-col-end">
                      <span className="data-more">
                        <Icon onClick={()=>setProfileModal(true)}  name="forward-ios"></Icon>
                      </span>
                    </div>
                  </div>
                  <div className="data-item" onClick={()=>setProfileModal(true)}>
                    <div className="data-col">
                      <span className="data-label">Time Zone</span>
                      <span className="data-value">{userProfile?.timeZone}</span>
                    </div>
                    <div className="data-col data-col-end">
                      <span className="data-more">
                        <Icon onClick={()=>setProfileModal(true)}  name="forward-ios"></Icon>
                      </span>
                    </div>
                  </div>
                  <div className="data-item" onClick={()=>setProfileModal(true)}>
                    <div className="data-col">
                      <span className="data-label">Gender</span>
                      <span className="data-value">{userProfile?.gender}</span>
                    </div>
                    <div className="data-col data-col-end">
                      <span className="data-more">
                        <Icon onClick={()=>setProfileModal(true)}  name="forward-ios"></Icon>
                      </span>
                    </div>
                  </div>
                </div>
              </Block>

              {/* <Modal isOpen={modal} className="modal-dialog-centered" size="lg" toggle={() => setModal(false)}>
                <a
                  href="#dropdownitem"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setModal(false);
                  }}
                  className="close"
                >
                  <Icon name="cross-sm"></Icon>
                </a>
                <ModalBody>
                  <div className="p-2">
                    <h5 className="title mb-4">Update Profile</h5>
                    <div className="tab-content">
                      <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="personal">
                        <Row className="gy-4">
                          <Col md="12">
                            <div className="form-group">
                              <label className="form-label" htmlFor="full-name">
                                UserName
                              </label>

                              <input
                                type="text"
                                id="full-name"
                                className="form-control"
                                name="userName"
                                onChange={(e) => {
                                  setNameErr(false);
                                  setNameError('');
                                  onInputChange(e)
                                }}
                                defaultValue={userProfile?.userName}
                                placeholder="Enter UserName"
                              // ref={inputRef}
                              />
                              {nameErr && <span className="invalid">{nameError}</span>}
                            </div>
                          </Col>

                          <Col md="6">
                            <div className="form-group">
                              <Label className="form-label" htmlFor="mobile">
                                Mobile Number
                              </Label>
                              <div className="form-control-wrap">
                                <div className="form-control form-control-lg d-flex align-items-center">
                                  <PhoneInput
                                    defaultCountry="IN"
                                    placeholder="Enter Mobile Number"
                                    style={{ display: "flex",border:0 }}
                                    value={userProfile?.mobile}
                                    defaultValue={userProfile?.mobile}
                                    // className="form-control form-control-lg" 
                                    onChange={(e) => onInputChange(e, true)}
                                    // onBlur={handleMobileBlur}
                                    maxLength={15}
                                  // inputComponent={(props) => (
                                  //   <input {...props} className="form-control form-control-lg" />
                                  // )}
                                  />
                                </div>
                                {phoneerror && <span className="invalid">{phoneerror}</span>}
                              </div>
                            </div>
                          </Col>



                          <Col md="6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="birth-day">
                                Date of Birth
                              </label>
                              <DatePicker
                                selected={userProfile?.dob ? new Date(moment(userProfile?.dob)?.format('ll')) : ''}
                                className="form-control date-picker"
                                maxDate={maxBirthdayDate}
                                minDate={minBirthdayDate}
                                dateFormat="dd MMM, yyyy"
                                onChange={handleDOB}
                                name="dob"
                                customInput={<ExampleCustomInput />}
                                showYearDropdown
                                scrollableYearDropdown
                                yearDropdownItemNumber={100}

                              />
                            </div>
                          </Col>

                          <Col md="6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="phone-no">
                                Timezone
                              </label>
                              <div className="form-control-wrap">
                                <Select options={timeZoneOptions}
                                  placeholder='Enter Timezone'
                                  defaultValue={timezone} onChange={(e) => onInputChange(e,false, true, false)} />
                              </div>
                            </div>
                          </Col>

                          <Col md="6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="phone-no">
                                Gender
                              </label>
                              <div className="form-control-wrap">
                                <div>
                                  <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="gender" id="inlineRadio1"
                                      value="Male"
                                      checked={userProfile?.gender == 'Male'}
                                      onChange={(e) => onInputChange(e)}
                                    />
                                    <label class="form-check-label" for="inlineRadio1">Male</label>
                                  </div>

                                  <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="gender" id="inlineRadio2"
                                      value="Female"
                                      checked={userProfile?.gender == 'Female'}
                                      onChange={(e) => onInputChange(e)}
                                    />
                                    <label class="form-check-label" for="inlineRadio2">Female</label>
                                  </div>

                                  <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="radio" name="gender" id="inlineRadio3"
                                      value="Others"
                                      checked={userProfile?.gender == 'Others'}
                                      onChange={(e) => onInputChange(e)}
                                    />
                                    <label class="form-check-label" for="inlineRadio3">Others</label>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </Col>
                          <Col md="12">
                            <div className="form-group">
                              <label className="form-label" htmlFor="display-name">
                                Profile Image
                              </label>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                  <input
                                    type="file"
                                    id="profileImg"
                                    className="form-control"
                                    style={{
                                      width: '200px',
                                      height: '30px'
                                    }}
                                    name="profileImg"
                                    onChange={(e) => {
                                      if (e.target.files[0]?.type?.includes('image')) {
                                        if (e.target.files[0].size > 1024 * 1024) {
                                          setFileTypeError('File Size Exceeds limit of 1 MB')
                                          setFileError(true);
                                          setFileErr(true);
                                        } else {
                                          setSelectedFile(URL.createObjectURL(e.target.files[0]))
                                          setFileErr(false);
                                          setFileError(false);
                                          setFile(e.target.files[0])
                                        }
                                      } else {
                                        setFileTypeError('Upload An Image File')
                                        setFileError(true);
                                        setFileErr(true);
                                      }
                                    }}
                                  />
                                  {fileError && <p style={{ color: 'red' }}>{fileTypeError}</p>}
                                </div>

                                {!fileErr && <img
                                  style={{ height: '100px', width: '100px' }}
                                  src={selectedFile}
                                />}
                              </div>
                            </div>
                          </Col>
                          {privileges.updateUser && <Col md="6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="phone-no">
                                Role
                              </label>
                              <div className="form-control-wrap">
                                <Select
                                  id="role"
                                  options={roleOptions}
                                  value={role}
                                  placeholder='Select Role'
                                  onChange={(e) => {
                                    Swal.fire({
                                      title: "Confirm Edit Role!",
                                      text: "You will be logged out after editing the role!",
                                      icon: "warning",
                                      showCancelButton: true,
                                      confirmButtonText: "Yes, Update Role!",
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        setRoleEdited(true);
                                        onInputChange(e, false, false, true)
                                      }

                                    });
                                    // onInputChange(e, false, true)
                                  }}
                                />
                              </div>
                            </div>
                          </Col>}
                          <Col size="12">
                            <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                              <li>
                                <Button
                                  color="primary"
                                  size="lg"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    submitForm();
                                  }}
                                >
                                  Update Profile
                                </Button>
                              </li>
                              <li>
                                <a
                                  href="#dropdownitem"
                                  onClick={(ev) => {
                                    ev.preventDefault();
                                    setModal(false);
                                  }}
                                  className="link link-light"
                                >
                                  Cancel
                                </a>
                              </li>
                            </ul>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </Modal> */}

              <Modal isOpen={profileModal} size="lg" toggle={toggleProfileModal}>
                <UpdateProfileModal toggle={toggleProfileModal} />
              </Modal>
            </div>
          </div>
        </Card>
        <Toaster />
      </Content>
    </React.Fragment>
  );
};

export default UserProfileRegularPage;
