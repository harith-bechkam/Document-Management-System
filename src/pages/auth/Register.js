import React, { useState } from "react";
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
import { Spinner } from "reactstrap";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import iDoks from "../../images/iDoks.png";
import * as API from "../../utils/API";
import toast from "react-hot-toast"
import Swal from "sweetalert2";


const Register = () => {
  const [passState, setPassState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showsuccessmsg, setShowsuccessmsg] = useState(false);
  const { register, handleSubmit,watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const handleFormSubmit = async (data) => {
    setLoading(true);
    let response = await API.registernewuser(data);
    if(response.status==true){
      setShowsuccessmsg(true)
    }
    else{
      setLoading(false);  
      Swal.fire("Error!", `Something went wrong, please try again later`, "error");
    }
  };
  const checkEmailExists = async (email) => {
    let response = await API.checkEmailIdExists(email);
    return (response?.status && response?.emailexistsstatus)?response.emailexistsstatus:false; 
  };
  return <>
    <Head title="Register" />
    <Block className="nk-block-middle nk-auth-body  wide-xs">
      <div className="brand-logo pb-4 text-center">
        <Link to={`${process.env.PUBLIC_URL}/`} className="logo-link">
          {/* <img className="logo-light logo-img logo-img-lg" src={Logo} alt="logo" />
            <img className="logo-dark logo-img logo-img-lg" src={LogoDark} alt="logo-dark" /> */}
          <img className="login-page-title" src={iDoks} alt="iDoks" style={{ width: "7rem" }} />
        </Link>
      </div>
      {
      (showsuccessmsg)?
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
      <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
        <BlockHead>
          <BlockContent>
            <BlockTitle tag="h4">Register</BlockTitle>
            <BlockDes>
              <p>Create New iDoks Account</p>
            </BlockDes>
          </BlockContent>
        </BlockHead>
        <form className="is-alter" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <div className="form-control-wrap">
              <input
                type="text"
                id="name"
                {...register('name', { required: true })}
                placeholder="Enter your name"
                className="form-control-lg form-control" />
              {errors.name && <p className="invalid">Name is required</p>}
            </div>
          </div>
          <div className="form-group">
            <div className="form-label-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
            </div>
            <div className="form-control-wrap">
              <input
                type="email"
                bssize="lg"
                id="email"
                {...register("email", {
                  required: "Email Id is required",
                  validate: async (value) =>
                    !(await checkEmailExists(value)) || "Email already exists",
                })}
                className="form-control-lg form-control"
                placeholder="Enter your email address" />
                {errors.email && <p className="invalid">{errors.email.message}</p>}
          </div>
          </div>
          <div className="form-group">
            <div className="form-label-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
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
                {...register('password', { required: "Password is required",minLength: {
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
                } })}
                placeholder="Enter your password"
                className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`} />
              {errors.passcode && <span className="invalid">{errors.passcode.message}</span>}
            </div>
          </div>
          <div className="form-group">
            <div className="form-label-group">
              <label className="form-label" htmlFor="password">
                Confirm Password
              </label>
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
                id="confirmpassword"
                {...register("confirmpassword", {
                  required: "Confirm Password is required",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
                placeholder="Enter your confirm password here"
                className={`form-control-lg form-control ${passState ? "is-hidden" : "is-shown"}`} />
              {errors.confirmpassword && <span className="invalid">{errors.confirmpassword.message}</span>}
            </div>
          </div>
          <div className="form-group">
            <Button type="submit" color="primary" size="lg" className="btn-block">
              {loading ? <Spinner size="sm" color="light" /> : "Register"}
            </Button>
          </div>
        </form>
        <div className="form-note-s2 text-center pt-4">
          {" "}
          Already have an account?{" "}
          <Link to={`${process.env.PUBLIC_URL}/auth/login`}>
            <strong>Sign in instead</strong>
          </Link>
            {<>
              <div class="text-center pt-4 pb-3"><h6 class="overline-title overline-title-sap"><span>OR</span></h6></div>
              <ul class="nav justify-center gx-4">
                <li class="nav-item"><a class="nav-link" href={process.env.REACT_APP_BE_URL+"/auth/microsoft"} onClick={(ev) => {
                                ev.preventDefault();
                                API.handleSSO("Microsoft",process.env.REACT_APP_BE_URL+"/auth/microsoft");
                            }}>Microsoft</a></li>
                <li class="nav-item"><a class="nav-link" href={process.env.REACT_APP_BE_URL+"/auth/google"} onClick={(ev) => {
                                ev.preventDefault();
                                API.handleSSO("Google",process.env.REACT_APP_BE_URL+"/auth/google");
                            }}>Google</a></li>
              </ul>
            </>
           }
          </div>
      </PreviewCard>
      }
      
    </Block>
  </>;
};
export default Register;
