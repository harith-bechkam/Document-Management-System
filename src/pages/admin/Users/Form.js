import React, { useState, useEffect, forwardRef, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import Content from "../../../layout/content/Content";
import Head from "../../../layout/head/Head";
import { BlockHead, BlockBetween, BlockHeadContent, BlockTitle, PreviewCard, BlockDes, Button, Icon, Block } from "../../../components/Component";
import { Controller, useForm } from "react-hook-form";
import { Row, Col, Label, Form, Input } from "reactstrap";
import classNames from "classnames";
import * as API from "../../../utils/API";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'
import Select from "react-select";
import countryList from 'react-select-country-list'
import { State, City } from "country-state-city";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useTimezoneSelect, allTimezones } from "react-timezone-select";
import toast, { Toaster } from "react-hot-toast";
import FileManagerLayout from "../../app/file-manager/components/Layout";
import FilesBody from "../../app/file-manager/components/Body";
import moment from "moment";
// import parsePhoneNumberFromString from "libphonenumber-js/core";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { updateLoaderFlag } from "../../../redux/folderSlice";
import { useDispatch } from "react-redux";

const Add = ({ alter, id }) => {

    const navigate = useNavigate()
    let { userId } = useParams();
    const dispatch = useDispatch();
    const { register, handleSubmit, setValue, reset, clearErrors, control, setError, formState: { errors } } = useForm();

    const [editMode, setEditMode] = useState(false)
    const [dob, setDob] = useState('');
    const dobRef = useRef('')

    const [role, setRoleValue] = useState('')
    const [roleOptions, setRoleOptions] = useState([])

    const [country, setCountryValue] = useState('')
    const countryOptions = useMemo(() => countryList().getData(), [])

    const [state, setStateValue] = useState('')
    const [stateOptions, setStateOptions] = useState([])

    const [city, setCityValue] = useState('')
    const [cityOptions, setCityOptions] = useState([])

    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);

    const [mobile, setMobile] = useState('');

    const [userImg, setUserImg] = useState('')

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

    const [reportingTo, setReportingTo] = useState([])
    const [userOptions, setUserOptions] = useState([])

    useEffect(() => {
        async function intial() {
            await fetchData();
            if (userId) {
                setEditMode(true)
                await getuser(userId)
            }
            else setEditMode(false)
        }
        intial()
    }, [])


    const fetchData = async (
        search = "",
        status = "Active",
        role = ""
    ) => {
        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let roleResponse = await API.getAllRoles()
        let userResponse = await API.getAllUsers(currentPage, itemPerPage, search, status, role)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        if (roleResponse['status']) {
            setRoleOptions(roleResponse['data'].map((v) => ({ label: v.role, value: v._id })))
        }

        if (userResponse['status']) {
            var user = userResponse['data'].map((v) => ({ label: v.userName, value: v._id }))

            if (editMode == false) setUserOptions(user.filter(item => item['value'] != localStorage.getItem('userId')))
            else setUserOptions(user.filter(item => item['value'] != userId))
        }

        var tz = time_zone?.filter((p) => p.value === time)[0]?.label === undefined
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
    }


    const formClass = classNames({
        "form-validate": true,
        "is-alter": alter,
    })

    const onFormSubmit = async (data) => {
        data['dob'] = dobRef.current;
        if (editMode == false) {

            if (!data['timeZone']) data['timeZone'] = "Asia/Kolkata"

            data['isActive'] = true
            data['status'] = 'Pending'
            
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            let userResponse = await API.addUser(data)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            if (userResponse['status']) {
                navigate(`/users`)
                toast.success(`${userResponse['message']}`)
            }
            else toast.error(`${userResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
        }
        else {
            for (let prop in data) {
                if (data[prop] === undefined || data[prop] === null)
                    data[prop] = ""
            }

            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            let userResponse = await API.updateUser(userId, data)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

            if (userResponse['status']) {
                navigate(`/users`)
                toast.success(`${userResponse['message']}`)
            }
            else toast.error(`${userResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
        }

    }

    const ExampleCustomInput = forwardRef(({ value, onClick, onChange }, ref) => (
        <div onClick={onClick} ref={ref}>
            <div className="form-icon form-icon-left">
                <Icon name="calendar"></Icon>
            </div>
            <input className="form-control date-picker" type="text" value={value} onChange={onChange} id='dob' placeholder="Select your DOB" autoComplete="off" {...register('dob', { required: false })} />
        </div>
    ))

    const changeRoleHandler = async (selectedOption) => {
        setRoleValue(selectedOption)
        setValue('role', selectedOption?.value)
    }

    const changeCountryHandler = async (selectedOption) => {
        setCountryValue(selectedOption)
        setValue('country', selectedOption?.value)

        var states = await State.getStatesOfCountry(selectedOption?.value)
            .filter((res) => res.countryCode === selectedOption?.value)
            .map((s) => {
                return { label: s.name, value: s.name, code: s }
            })
        setStateOptions(states)

    }

    const changeStateHandler = async (selectedOption) => {
        setStateValue(selectedOption)
        setValue('state', selectedOption?.value)

        var cities = await City.getCitiesOfState(
            selectedOption?.code.countryCode,
            selectedOption?.code.isoCode
        ).map((s) => {
            return { label: s.name, value: s.name, code: s };
        });
        setCityOptions(cities)
    }

    const changeCityHandler = async (selectedOption) => {
        setCityValue(selectedOption)
        setValue('city', selectedOption?.value)
    }

    const changeMobileHandler = async (mobile) => {
        setMobile(mobile)
        setValue('mobile', mobile)
    }

    const changetimeZoneHandler = async (tz) => {
        setTimeZone(tz)
        setValue('timeZone', tz?.value)
    }

    const changeReportingHandler = async (value) => {
        setReportingTo(value)
        setValue('reportingTo', value.map(v => ({ id: v?.value, userName: v?.label })))
    }

    const changeUserImageHandler = async (file) => {
        setUserImg(URL.createObjectURL(file))

        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let imgResponse = await API.uploadImage(file)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        if (imgResponse['status']) {
            setValue('imgUrl', imgResponse['imageurl'])
        }
    }

    const getuser = async (userId) => {
        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        var userResponse = await API.getUser(userId)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        if (userResponse['status']) {
            if (userResponse['data']) {
                let userData = userResponse['data'][0]
                setValue('userName', userData?.['userName'])
                setValue('email', userData?.['email'])

                if (userData?.['role']) {
                    var roleOption = { label: userData['role']['role'], value: userData['role']['_id'] }
                    setRoleValue(roleOption)
                    setValue('role', roleOption['value'])
                }

                // setValue('dob', new Date(userData['dob']))
                // setDob('dob', new Date())


                setValue('gender', userData?.['gender'])
                setValue('address1', userData?.['address1'])
                setValue('address2', userData?.['address2'])

                if (userData?.['country']) {

                    var selectedCountryValue = countryOptions?.find(item => item['value'] == userData['country'])
                    setCountryValue(selectedCountryValue)
                    setValue('country', selectedCountryValue['value'])

                    var states = await State.getStatesOfCountry(selectedCountryValue?.value)
                        .filter((res) => res.countryCode === selectedCountryValue?.value)
                        .map((s) => {
                            return { label: s.name, value: s.name, code: s }
                        })
                    setStateOptions(states)

                    var selectedStateValue = states?.find(item => item['value'] == userData['state'])
                    setStateValue(selectedStateValue)
                    setValue('state', selectedStateValue?.value)

                    var cities = await City.getCitiesOfState(
                        selectedStateValue?.code.countryCode,
                        selectedStateValue?.code.isoCode
                    ).map((s) => {
                        return { label: s.name, value: s.name, code: s };
                    });
                    setCityOptions(cities)

                    var selectedCityValue = cities?.find(item => item['value'] == userData['city'])
                    setCityValue(selectedCityValue)
                    setValue('city', selectedCityValue?.value)

                }

                setValue('zipcode', userData?.['zipcode'])

                if (userData?.['mobile']) {
                    setMobile(userData['mobile'])
                    setValue('mobile', userData['mobile'])
                }

                if (userData?.imgUrl) {
                    setUserImg(userData?.imgUrl)
                }

                if (userData?.['dob']) {
                    const date1 = new Date(userData['dob'])
                    setDob(date1)
                    setValue('dob', date1)
                }

                if (userData?.['timeZone']) {
                    changetimeZoneHandler({ label: userData['timeZone'], value: userData['timeZone'] })
                }

                if (userData?.['reportingTo']) {
                    let reportingUsers = userData['reportingTo'].map(item => ({ value: item['id'], label: item['userName'] }))
                    changeReportingHandler(reportingUsers)
                }

                // setValue('userName', userData['userName'])
            }
        }

    }

    var maxBirthdayDate = new Date();

    const minBirthdayDate = new Date();
    minBirthdayDate.setFullYear(maxBirthdayDate.getFullYear() - 100);

    function handleDOB(e) {
        dobRef.current = moment(e).format('MM/DD/YYYY');
        setDob(e)
        setValue('dob', e);
    }

    return (
        <React.Fragment>
            <Head title={'Users'} />
            <FileManagerLayout>
                <FilesBody  >
                    <Content>
                        <Row className="g-gs">
                            <Col lg="12">
                                <PreviewCard className="h-100">
                                    <div className="card-head">
                                        <h5 className="card-title">Add User</h5>
                                    </div>

                                    <Form className={formClass} onSubmit={handleSubmit(onFormSubmit)}>
                                        <div className="form-group">
                                            <Label className="form-label" htmlFor="userName">
                                                Name <span className="required">*</span>
                                            </Label>
                                            <div className="form-control-wrap">
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    id="userName"
                                                    placeholder='Enter Name'
                                                    {...register('userName', { required: true })}
                                                />
                                                {errors.userName && <span className="invalid">UserName is required</span>}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <Label className="form-label" htmlFor="email">
                                                Email <span className="required">*</span>
                                            </Label>
                                            <div className="form-control-wrap">
                                                <input
                                                    className="form-control"
                                                    type="email"
                                                    id="email"
                                                    placeholder='Enter Email'
                                                    {...register('email', {
                                                        required: true,
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: "Invalid email address",
                                                        },
                                                    })}
                                                />
                                                {errors.email && errors.email.type == "required" && <span className="invalid">Email is required</span>}
                                                {errors.email && errors.email.type == "pattern" && (
                                                    <span className="invalid">{errors.email.message}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <Label className="form-label" htmlFor="role">
                                                Role <span className="required">*</span>
                                            </Label>

                                            <div className="form-control-wrap">
                                                <Select
                                                    id="role"
                                                    options={roleOptions}
                                                    value={role}
                                                    placeholder='Select Role'
                                                    {...register('role', { required: true })}
                                                    onChange={changeRoleHandler}
                                                />

                                                <div className="form-note">
                                                    {errors.role && <span className="invalid" style={{ color: "#e85347" }}>Role is required</span>}
                                                </div>

                                            </div>

                                        </div>

                                        <div className="form-group">
                                            <Label className="form-label" htmlFor="dob">
                                                Date of Birth
                                            </Label>
                                            <div className="form-control-wrap">
                                                <div className="form-icon form-icon-left">
                                                    <Icon name="calendar"></Icon>
                                                </div>
                                                <DatePicker
                                                    selected={dob}
                                                    className="form-control date-picker"
                                                    maxDate={maxBirthdayDate}
                                                    minDate={minBirthdayDate}
                                                    dateFormat="dd MMM, yyyy"
                                                    onChange={handleDOB}

                                                    customInput={<ExampleCustomInput />}
                                                    showYearDropdown
                                                    scrollableYearDropdown
                                                    yearDropdownItemNumber={100}
                                                />
                                            </div>
                                            {/* <div className="form-note">
                                        Date Format <code>mm/dd/yyyy</code>
                                    </div> */}
                                        </div>

                                        <div className="form-group">
                                            <Label className="form-label" htmlFor="gender">
                                                Gender
                                            </Label>

                                            <div className="form-control-wrap">
                                                <div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="Male" {...register('gender', { required: false })} />
                                                        <label class="form-check-label" for="inlineRadio1">Male</label>
                                                    </div>

                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="Female" {...register('gender', { required: false })} />
                                                        <label class="form-check-label" for="inlineRadio2">Female</label>
                                                    </div>

                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio3" value="Others" {...register('gender', { required: false })} />
                                                        <label class="form-check-label" for="inlineRadio3">Others</label>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        {/* <div className="form-group">
                                            <Label className="form-label" htmlFor="mobile">
                                                Mobile Number
                                            </Label>
                                            <div className="form-control-wrap" >
                                                <PhoneInput
                                                    placeholder="Enter Mobile Number"
                                                    style={{display:'flex'}}
                                                    className="form-control  form-control-lg p-2 border-0"
                                                    value={mobile}
                                                    maxLength={15}
                                                    onChange={changeMobileHandler}
                                                />

                                            </div>
                                        </div> */}
                                        <div className="form-group">
                                            <Label className="form-label" htmlFor="mobile">
                                                Mobile Number
                                            </Label>
                                            <div className="form-control-wrap">
                                                <Controller
                                                    name="mobile"
                                                    control={control}
                                                    rules={{
                                                        // required: "Mobile number is required",
                                                        // pattern: {
                                                        //     value: /^[0-9]{10,15}$/,
                                                        //     message: "Enter a valid mobile number"

                                                        // value: /^\+91\s\d{5}\s\d{5}$/, 
                                                        // message: "Enter a valid mobile number in +91 XXXXX XXXXX format"

                                                        // }

                                                        validate: (value) => {
                                                            if (!value) return true;
                                                            const phoneNumber = parsePhoneNumberFromString(value);
                                                            return phoneNumber && phoneNumber.isValid() ? true : "Enter a valid mobile number";
                                                        },

                                                    }}
                                                    render={({ field }) => (
                                                        <PhoneInput
                                                            placeholder="Enter Mobile Number"
                                                            style={{ display: 'flex' }}
                                                            // defaultCountry="IN"
                                                            className={`form-control form-control-lg border-0`}//${errors.mobile ? "is-invalid" : ""}
                                                            {...field}
                                                            // limitMaxLength={15}
                                                            maxlength={15}
                                                        />
                                                    )}
                                                />
                                                {errors.mobile && <span className="invalid" style={{ color: "#e85347" }}>{errors.mobile.message}</span>}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <Label className="form-label" htmlFor="timezone">
                                                Timezone
                                            </Label>
                                            <div className="form-control-wrap">
                                                <Select options={timeZoneOptions}
                                                    placeholder='Enter Timezone'
                                                    value={timezone} onChange={changetimeZoneHandler} />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <Label className="form-label" htmlFor="ReportingTo">
                                                Reporting To
                                            </Label>
                                            <div className="form-control-wrap">
                                                <Select options={userOptions}
                                                    placeholder='Select Users To Whom Reports To'
                                                    value={reportingTo} onChange={changeReportingHandler} isMulti={true} />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <Label className="form-label" htmlFor="userimg">
                                                User Image
                                            </Label>
                                            {userImg && <div className="form-control-wrap">
                                                <img
                                                    height={'200px'}
                                                    width={'150px'}
                                                    src={userImg}
                                                />
                                            </div>}
                                            <div className="form-control-wrap">
                                                <input
                                                    type="file"
                                                    placeholder="Image input"
                                                    id="picker"
                                                    // defaultValue={addData?.imgUrl}
                                                    className="form-control"
                                                    onChange={(e) => {
                                                        changeUserImageHandler(e.target.files[0])
                                                    }}
                                                />
                                            </div>
                                        </div>


                                        <div className="d-flex justify-content-center align-items-center">
                                            <Button type="submit" color="primary" size="lg" className='custom-margin-right' >
                                                {editMode ? 'Update User' : 'Add User'}
                                            </Button>
                                            <Button color="primary" size="lg" className='.gap-md' onClick={() => {
                                                reset()
                                                clearErrors()
                                                setReportingTo([])
                                                setTimeZone('')
                                                setMobile('')
                                                setCityValue('')
                                                setStateValue('')
                                                setCountryValue('')
                                                setRoleValue('')
                                                setDob(null)
                                            }}
                                            >
                                                Reset
                                            </Button>
                                        </div>

                                    </Form>
                                </PreviewCard>
                            </Col>
                        </Row>
                        <Toaster />
                    </Content>
                </FilesBody>
            </FileManagerLayout>
        </React.Fragment>
    )
}

export default Add;