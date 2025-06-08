import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import Logo from "../../images/logo.png";
import LogoDark from "../../images/logo-dark.png";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import { Block, BlockContent, BlockDes, BlockHead, BlockTitle, Button, PreviewCard } from "../../components/Component";
import { Link } from "react-router-dom";
import * as API from "../../utils/API";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import iDoks from "../../images/iDoks.png";

const CreatePassword = () => {

    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

    const { id } = useParams();
    const navigate = useNavigate()
    const [toastId, setToastId] = useState(null)


    useEffect(() => {
        if (id) {
            //token presernt in link
            checkLinkValidity()
        }
        else {
            //token not present in link,so do changes in fe
            navigate(`/auth/no-token`)
            return
        }
    }, [])


    const checkLinkValidity = async () => {
        let response = await API.checkLinkValidity(location.pathname, id)
        let { status, statusCode, message } = response

        //redirect to 401 page
        if (message == 'Invalid Recover Token' && statusCode == 401 && !status) {
            navigate(`/auth/invalid-no-token`)
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

        if (!data['password']) {
            toast('Please Enter Password', { icon: '⚠️' })
            return
        }

        let response = await API.createPassword(data['password'], id)

        if (response.status) {

            showToast(`${response['message']}`, 'success')//.replace(/\b\w/g, char => char.toUpperCase())
            reset()

            setTimeout(() => {
                navigate(`/`)
            }, 2000)
        }
        else {
            showToast(`${response['message']}`, 'error')//.replace(/\b\w/g, char => char.toUpperCase())
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
            <Head title="Create-Password" />
            <Block className="nk-block-middle nk-auth-body  wide-xs">
                <div className="brand-logo pb-4 text-center">
                    {/* <Link to={process.env.PUBLIC_URL + "/home"} className="logo-link">
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
                            <BlockTitle tag="h5">Create password</BlockTitle>
                        </BlockContent>
                    </BlockHead>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <div className="form-label-group">
                                <label className="form-label" htmlFor="default-01">
                                    Create Password
                                </label>
                            </div>
                            <input
                                type="password"
                                className="form-control form-control-lg"
                                id="default-02"
                                placeholder="Enter your Password"
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
                            />
                            {errors.password && <span className="invalid">{errors.password.message}</span>}
                        </div>

                        <div className="form-group">
                            <div className="form-label-group">
                                <label className="form-label" htmlFor="confirm-password">
                                    Confirm Password
                                </label>
                            </div>
                            <input
                                type="password"
                                className="form-control form-control-lg"
                                id="confirm-password"
                                placeholder="Confirm your new password"
                                {...register('confirmPassword', {
                                    required: "Please confirm your password",
                                    validate: value =>
                                        value === watch('password') || "Passwords do not match"
                                })}
                            />
                            {errors.confirmPassword && <span className="invalid">{errors.confirmPassword.message}</span>}
                        </div>

                        <div className="form-group">
                            <Button color="primary" size="lg" className="btn-block" type="submit">
                                Submit
                            </Button>
                        </div>
                    </form>


                    <div className="form-note-s2 text-center pt-4">
                        <Link to={`/`}>
                            <strong>Return to login</strong>
                        </Link>
                    </div>
                </PreviewCard>
            </Block>
            <Toaster />
            {/* <AuthFooter /> */}
        </>)
}

export default CreatePassword;