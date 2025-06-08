import React, { useState } from "react";
import Logo from "../../images/logo.png";
import LogoDark from "../../images/logo-dark.png";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import { Block, BlockContent, BlockDes, BlockHead, BlockTitle, Button, PreviewCard } from "../../components/Component";
import { Link } from "react-router-dom";
import * as API from "../../utils/API";
import toast, { Toaster } from "react-hot-toast";
import iDoks from "../../images/iDoks.png";
import { Spinner } from "reactstrap";

const ForgotPassword = () => {


  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('')
  const [toastId, setToastId] = useState(null)


  const sendLink = async (ev) => {
    ev.preventDefault()
    setLoading(true)

    try {
      let response = await API.forgotPassword(email)


      if (response.status) {
        setEmail("")
        showToast(`${response["message"]}`, 'success')
      }
      else {
        showToast(`${response["message"]}`.replace(/\b\w/g, (char) => char.toUpperCase()), 'error')
      }
    }
    catch (error) {
      console.error(error)
      showToast("Something went wrong. Please Try Again", 'error')
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
      <Head title="Forgot-Password" />
      <Block className="nk-block-middle nk-auth-body wide-xs">
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
              <BlockDes>
                <p>If you forgot your password, well, then we’ll email you instructions to reset your password.</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>
          <form>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="default-01"
                >
                  Email
                </label>
              </div>
              <input
                type="text"
                className="form-control form-control-lg"
                id="default-01"
                placeholder="Enter your email address"
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
                value={email}
              />
            </div>
            <div className="form-group">
              <Button color="primary" size="lg" className="btn-block" onClick={(ev) => { sendLink(ev) }}>
                {loading ? <Spinner size="sm" color="light" /> : "Send Reset Link"}
              </Button>
            </div>
          </form>
          <div className="form-note-s2 text-center pt-4">
            <Link to={`${process.env.PUBLIC_URL}/auth/login`}>
              <strong>Return to login</strong>
            </Link>
          </div>
        </PreviewCard>
      </Block>
      <Toaster />
      {/* <AuthFooter /> */}
    </>
  );
};
export default ForgotPassword;
