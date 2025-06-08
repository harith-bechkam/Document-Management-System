import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../images/logo.png";
import LogoDark from "../../images/logo-dark.png";
import Head from "../../layout/head/Head";
import AuthFooter from "./AuthFooter";
import {
  Block,
  BlockContent,
  BlockDes,
  BlockHead,
  BlockTitle,
  Button,
  Icon,
  PreviewCard,
} from "../../components/Component";
import { Form, Spinner, Alert } from "reactstrap";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import * as API from "../../utils/API";
import {
  // AuthenticatedTemplate,
  // UnauthenticatedTemplate,
  useMsal,
  useIsAuthenticated,
} from "@azure/msal-react";
import { loginRequest } from '../../utils/auth-config';
import { useSelector } from "react-redux";
import iDoks from "../../images/iDoks.png";


const Login = () => {
  const [loading, setLoading] = useState(false);
  const [passState, setPassState] = useState(false);
  const [errorVal, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const isLinkClicked = useSelector(state => state.folders.documentUrl);

  const onFormSubmit = async (formData) => {
    setLoading(true);
    let response = await API.login(formData.email, formData.passcode)

    if (response?.status) {

     await API.setloginstoragechanges(response)
      navigate(`/${response?.workspace?.workspace_id}/home`)
      return

    }
    else {
      let msg = response?.message

      setTimeout(() => {
        if(msg=='User not found'){
          msg = 'Email Not Registered'
        }
        setError(msg && typeof msg == "string" ? msg.replace(/\b\w/g, char => char.toUpperCase()) : "Cannot login with credentials")
        setLoading(false)
      }, 1000)

    }

  }

  return <>
    <Head title="Login" />
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
            <BlockTitle tag="h4">Sign-In</BlockTitle>
            <BlockDes>
              <p>Access iDoks using your email and password.</p>
            </BlockDes>
          </BlockContent>
        </BlockHead>
        {errorVal && (
          <div className="mb-3">
            <Alert color="danger" className="alert-icon">
              <Icon name="alert-circle" /> {errorVal || `Unable to login with credentials`}{" "}
            </Alert>
          </div>
        )}
        <Form className="is-alter" onSubmit={handleSubmit(onFormSubmit)}>
          <div className="form-group">
            <div className="form-label-group">
              <label className="form-label" htmlFor="default-01">
                Email
              </label>
            </div>
            <div className="form-control-wrap">
              <input
                type="text"
                id="default-01"
                // {...register('name', { required: "This field is required" })}
                {...register('email', {
                  required: "This field is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address"
                  }
                })}
                placeholder="Enter your email address"
                className="form-control-lg form-control" />
              {errors.email && <span className="invalid">{errors.email.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <Link className="link link-primary link-sm" to={`${process.env.PUBLIC_URL}/auth/forgot-password`}>
                Forgot Password?
              </Link>
            </div>

            <div className="form-control-wrap">
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
                // {...register('passcode', { required: "This field is required" })}
                {...register('passcode', {
                  required: "Password is required"
                })}

                // defaultValue="123456"
                placeholder="Enter your passcode"
                className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`} />
              {errors.passcode && <span className="invalid">{errors.passcode.message}</span>}
            </div>

          </div>

          <div className="form-group">
            <Button size="lg" className="btn-block" type="submit" color="primary">
              {loading ? <Spinner size="sm" color="light" /> : "Sign In"}
            </Button>

            <div class="form-note-s2 text-center pt-4">New on our platform? <a href="/#/auth/registration">Create an account</a></div>

            {<>
              <div class="text-center pt-4 pb-3"><h6 class="overline-title overline-title-sap"><span>OR</span></h6></div>
              <ul class="nav justify-center gx-4">
                <li class="nav-item"><a class="nav-link" href={process.env.REACT_APP_BE_URL + "/auth/microsoft"} onClick={(ev) => {
                  ev.preventDefault();
                  API.handleSSO("Microsoft", process.env.REACT_APP_BE_URL + "/auth/microsoft");
                }}>Microsoft</a></li>
                <li class="nav-item"><a class="nav-link" href={process.env.REACT_APP_BE_URL + "/auth/google"} onClick={(ev) => {
                  ev.preventDefault();
                  API.handleSSO("Google", process.env.REACT_APP_BE_URL + "/auth/google");
                }}>Google</a></li>
              </ul>
            </>
            }
          </div>
        </Form>

      </PreviewCard>
    </Block>

    {/* <AuthFooter /> */}
  </>;
};
export default Login;
