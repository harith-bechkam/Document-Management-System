import React, { useState, useEffect, useRef, forwardRef } from 'react'
import { Button, Col, Label, Modal, ModalBody, Row } from 'reactstrap';
import PhoneInput from "react-phone-number-input";
import moment from "moment";
import * as API from '../../../utils/API';
import { allTimezones, useTimezoneSelect } from "react-timezone-select";
import toast, { Toaster } from "react-hot-toast";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { useDispatch } from "react-redux";
import { updateProfileFlag } from "../../../redux/folderSlice";
import Swal from "sweetalert2";
import parsePhoneNumberFromString from "libphonenumber-js";
import "react-phone-number-input/style.css";
import { Icon } from '../../../components/Component';



function UpdateProfileModal({ toggle }) {
    const dispatch = useDispatch()
    const [userProfile, setUserProfile] = useState({})
    const Privilege = JSON?.parse(localStorage.getItem('privileges'));
    const [file, setFile] = useState(null);
    const [fileErr, setFileErr] = useState(null);
    const [fileError, setFileError] = useState(false);
    const [fileTypeError, setFileTypeError] = useState(`Upload an Image File`);
    const [selectedFile, setSelectedFile] = useState(null);
    const [profileUpdated, setProfileUpdated] = useState(false);
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

    async function fetchData() {
        const userRespo = await API.getUser(localStorage.getItem('userId'));
        let roleResponse = await API.getAllRoles();
        if (roleResponse['status']) {
            setRoleOptions(roleResponse['data'].map((v) => ({ label: v.role, value: v._id })))
        }
    }

    async function handleSubmit() {
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

        toggle();
    }

    useEffect(() => {
        fileData()
        const phoneInputCountry = document.querySelector(".PhoneInputInput");
        if (phoneInputCountry) {
          phoneInputCountry.classList.add("form-control");
        }
    }, [])


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
        <ModalBody>
            <div className="p-2">
                <h5 className="title mb-4">Update Profile</h5>
                <div className="tab-content">
                    <div className={`tab-pan active`} id="personal">
                        <Row className="gy-4">
                            <Col md="12">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="full-name">
                                        User Name
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
                                    <div className="form-control-wrap p-0">
                                        <div className="form-control d-flex align-items-center phone-input-box p-0">
                                            <PhoneInput
                                                defaultCountry="IN"
                                                placeholder="Enter Mobile Number"
                                                style={{ display: "flex", border: 0 }}
                                                value={userProfile?.mobile}
                                                defaultValue={userProfile?.mobile}
                                                className="form-control form-control-lg"
                                                onChange={(e) => onInputChange(e, true)}
                                                // onBlur={handleMobileBlur}
                                                maxLength={15}
                                                // inputComponent={(props) => (
                                                //     <input {...props} className="form-control form-control-lg" />
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
                                        <Select
                                            options={timeZoneOptions}
                                            placeholder='Enter Timezone'
                                            defaultValue={timezone}
                                            onChange={(e) => onInputChange(e, false, true, false)}
                                        />
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

                            <Col md="6">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="display-name">
                                        Profile Image
                                    </label>
                                    <div className='user-profile-image'>
                                        <div className='col-12'>
                                            <input
                                                type="file"
                                                id="profileImg"
                                                className="form-control user-image-field w-100"

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
                                    </div>
                                </div>
                                <div className="form-group">
                                    {!fileErr && <img
                                        style={{ height: '100px', width: '100px' }}
                                        src={selectedFile}
                                    />}
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

                        </Row>
                    </div>
                    <div style={{ marginTop: '2rem' }}>
                        <ul className="align-center flex-wrap flex-sm-nowrap gx-4 gy-2">
                            <li>
                                <Button
                                    color="primary"
                                    size="lg"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        handleSubmit();
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
                                        toggle()
                                    }}
                                    className="link link-light"
                                >
                                    Cancel
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </ModalBody>
    )
}

export default UpdateProfileModal