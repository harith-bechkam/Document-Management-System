import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useForm } from "react-hook-form";
import Logo from "../../images/logo.png";
import LogoDark from "../../images/logo-dark.png";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import { Block, BlockContent, BlockDes, BlockHead, BlockTitle, Button, Icon, PreviewCard } from "../../components/Component";
import * as API from "../../utils/API";
import toast, { Toaster } from "react-hot-toast";
import iDoks from "../../images/iDoks.png";
import { Spinner } from "reactstrap";

const ResetPassword = () => {
    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation()
    const [toastId, setToastId] = useState(null)
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false)
    const [passState, setPassState] = useState(false);
    const [passState1, setPassState1] = useState(false);


    useEffect(() => {
        if (id) {
            //token presernt in link
            checkLinkValidity()
        }
        else {
            //token not present in link,so do changes in fe
            navigate(`/auth/no-recover-token`)
            return
        }
    }, [])

    const checkLinkValidity = async () => {
        let response = await API.checkLinkValidity(location.pathname, id)
        let { status, statusCode, message } = response

        //redirect to 401 page
        if (message == 'Invalid Recover Token' && statusCode == 401 && !status) {
            navigate(`/auth/invalid-recover-token`)
            return
        }

        //show toast
        if (message == 'Recover Token has Expired or Used' && statusCode == 403 && !status) {
            showToast(`${message}`, 'errorlargetime')
        }

        //do allow reset page
        if (message == 'valid Recover Token' && statusCode == 200 && status) {
            return
        }
    }

    const onSubmit = async (data) => {
        setLoading(true)

        try {
            let response = await API.resetPassword(data.password, id)

            if (response.status) {
                showToast(`${response['message']}`, 'success')

                setSuccess(true)
                reset()

                // setTimeout(() => {
                //     navigate(`/`)
                // }, 2000)

            }
            else {
                setSuccess(false)
                showToast(`${response['message']}`, 'error')
            }
        }
        catch (error) {
            setSuccess(false)
            consol.error(error)
            showToast("Something went wrong. Please Try Again", "error")
        }
        finally {
            setLoading(false)
        }
    }

    const showToast = (message, type = 'success') => {
        if (toastId) {
            toast.remove(toastId)
            toast.remove()
        }

        let id;
        if (type == 'success') {
            id = toast.success(message, {
                duration: 4000,
                position: 'top-center',
            })
        }
        else if (type == 'error') {
            id = toast.error(message, {
                duration: 4000,
                position: 'top-center',

            })
        }
        else if (type == 'errorlargetime') {
            id = toast.error(message, {
                duration: 10000,
                position: 'top-center',

            })
        }

        setToastId(id)
    }

    return (
        <>
            <Head title="Reset-Password" />
            <Block className="nk-block-middle nk-auth-body  wide-xs">
                {success ?
                    <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
                        <BlockHead>
                            <BlockContent>
                                <BlockTitle tag="h4">Thank you for submitting form</BlockTitle>
                                <BlockDes className="text-success">
                                    <p>You can now sign in with your new password</p>
                                    <Link to={`${process.env.PUBLIC_URL}/auth/login`}>
                                        <Button color="primary" size="lg">
                                            Back to Login
                                        </Button>
                                    </Link>
                                </BlockDes>
                            </BlockContent>
                        </BlockHead>
                    </PreviewCard>
                    :
                    <>
                        <div className="brand-logo pb-4 text-center">
                            {/* <Link to={process.env.PUBLIC_URL + "/"} className="logo-link">
                        <img className="logo-light logo-img logo-img-lg" src={Logo} alt="logo" />
                        <img className="logo-dark logo-img logo-img-lg" src={LogoDark} alt="logo-dark" />
                    </Link> */}
                            <Link to={`${process.env.PUBLIC_URL}/`}>
                                {/* <h1 className="login-page-title" style={{ fontSize: "3rem", fontWeight: "bold" }}>iDoks</h1> */}
                                <img className="login-page-title" src={iDoks} alt="iDoks" style={{ width: "7rem" }} />
                            </Link>
                        </div>
                        <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
                            <BlockHead>
                                <BlockContent>
                                    <BlockTitle tag="h5">Reset password</BlockTitle>
                                </BlockContent>
                            </BlockHead>
                            <form onSubmit={handleSubmit(onSubmit)}>

                                <div className="form-label-group">
                                    <label className="form-label" htmlFor="default-01">
                                        New Password
                                    </label>
                                </div>

                                <div className="form-control-wrap my-2">
                                    <a
                                        href="#password"
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            setPassState(!passState);
                                        }}
                                        className={`form-icon lg form-icon-right passcode-switch ${passState ? "is-hidden" : "is-shown"}`}
                                    >
                                        <Icon name="eye" className="passcode-icon icon-show"></Icon>
                                        <Icon name="eye-off" className="passcode-icon icon-hide"></Icon>
                                    </a>

                                    <input
                                        type={passState ? "text" : "password"}
                                        id="password"
                                        {...register('password', {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters long"
                                            },
                                            maxLength: {
                                                value: 20,
                                                message: "Password must be less than 20 characters long"
                                            },
                                            pattern: {
                                                value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/,
                                                message: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
                                            }
                                        })}
                                        placeholder="Enter your new Password"
                                        className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`}
                                    />
                                    {errors.password && <span className="invalid">{errors.password.message}</span>}
                                </div>


                                <div className="form-label-group">
                                    <label className="form-label" htmlFor="confirmPassword">
                                        Confirm Password
                                    </label>
                                </div>

                                <div className="form-control-wrap my-2">
                                    <a
                                        href="#confirmPassword"
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            setPassState1(!passState1);
                                        }}
                                        className={`form-icon lg form-icon-right passcode-switch ${passState1 ? "is-hidden" : "is-shown"}`}
                                    >
                                        <Icon name="eye" className="passcode-icon icon-show"></Icon>
                                        <Icon name="eye-off" className="passcode-icon icon-hide"></Icon>
                                    </a>

                                    <input
                                        type={passState1 ? "text" : "password"}
                                        id="confirmPassword"
                                        {...register('confirmPassword', {
                                            required: "Please confirm your password",
                                            validate: value =>
                                                value === watch('password') || "Passwords do not match"
                                        })}
                                        placeholder="Enter your new Password"
                                        className={`form-control-lg form-control ${passState1 ? "is-hidden" : "is-shown"}`}
                                    />

                                    {errors.confirmPassword && <span className="invalid">{errors.confirmPassword.message}</span>}
                                </div>




                                {/* <div className="form-group">
                                </div> */}



                                <div className="form-group">
                                    <Button color="primary" size="lg" className="btn-block" type="submit">
                                        {loading ? <Spinner size="sm" color="light" /> : "Submit"}
                                    </Button>
                                </div>
                            </form>
                            <div className="form-note-s2 text-center pt-4">
                                <Link to={`/`}>
                                    <strong>Return to login</strong>
                                </Link>
                            </div>
                        </PreviewCard>
                    </>
                }
            </Block>
            <Toaster />




            {/* <AuthFooter /> */}
        </>
    );
}

export default ResetPassword;
