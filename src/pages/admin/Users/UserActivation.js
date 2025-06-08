import React from "react";
import Logo from "../../../images/iDoks.png"
import LogoDark from "../../../images/iDoks.png";
import Head from "../../../layout/head/Head";
import { Block, BlockContent, BlockDes, BlockHead, BlockTitle,Button } from "../../../components/Component";
import { Link, useParams } from "react-router-dom";
import { useEffect,useState } from "react";
import * as API from '../../../utils/API';
import { Modal, Spinner } from "reactstrap";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const UserActivation = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true);
    const [resentloading, setResentLoading] = useState(false);
    const [invaliduser,setInvaliduser] = useState(false);
    const [verified,setVerified] = useState(false);
    const location = useLocation();
    const [isDisabled, setIsDisabled] = useState(false);
    const resendactivationlink=async (e)=>{
        e.preventDefault();
        setResentLoading(true);
        let workspaceResponse = await API.resenduseractivaionlink(token)
        let { status,message } = workspaceResponse;
        if (status) {
          toast.success(message);
          setIsDisabled(true); // Disable button
        }else{
          toast.error(message)
        }
        setResentLoading(false);
    }
    var { token } = useParams();
    if(typeof token==="undefined"){
      token=null;
    }
    const activateuser=async ()=>{
      setLoading(true);
      let workspaceResponse = await API.activateworkspaceuser(token)
      let { status,message } = workspaceResponse;
      if (status) {
        toast.success(message);
        setVerified(true);
      }else{
        toast.error(message)
      }
      if(message=="Token Expired or Used"){
        setInvaliduser(true);
        setTimeout(()=>{
          navigate("/auth/login")
        },1000)
      }
      setLoading(false);
    }

    const checkisuseractivated = async () => {
        let workspaceResponse = await API.getmyworkspaceinfo()
        let { status,data } = workspaceResponse
    
        if (status) {
          //dispatch(setmyworkspaceinfo({ data }))
          let isvalidworkspace=false;
          for(let work of data){
            if(work._id==localStorage.getItem("workspace_id")){
              isvalidworkspace=true;
              if(work.userinfo.user_status.toLowerCase()!="pending"){
                navigate("/auth/login");
              }
              break;
            }
          }
          if(isvalidworkspace==false){
            navigate("/auth/login");
          }
        }
        setLoading(false);
      }
    useEffect(() => {
      if(token!=null){
        activateuser();
      }else{
        checkisuseractivated();
      }
    },[])
    return(<>
     <Head title="Success" />
        <Block className="nk-block-middle nk-auth-body">
         
                {
                    loading?<>
                                <Spinner size="lg" />
                    </>:
                    invaliduser==false?
                    <>
                     <div className="brand-logo pb-5">
                      <Link to={`${process.env.PUBLIC_URL}/home`} className="logo-link">
                        <img className="logo-light logo-img logo-img-lg" src={Logo} alt="logo" />
                        <img className="logo-dark logo-img logo-img-lg" src={LogoDark} alt="logo-dark" />
                      </Link>
                    </div>
                    
                      <BlockContent>
                      {verified==true?
                      <>
                         <BlockDes className="text-success">
                                        <p>You can now sign in with your new password</p>
                                        <Link to={`${process.env.PUBLIC_URL}/auth/login`}>
                                          <Button color="primary" size="lg">
                                            Back to Login
                                          </Button>
                                        </Link>
                        </BlockDes></>:
                        <>
                        <BlockHead>
                        <BlockTitle tag="h4">Verify Your Email Address</BlockTitle>
                        </BlockHead>
                        <BlockDes className="text-info">
                            <p>Thank you for signing up! To complete your registration, please check your email and click on the verification link we sent you.</p>
                            <ul><li><p>Didn't receive the email? Click the Resend Email button below.</p></li></ul>
                            {
                                resentloading?<>
                                <Button disabled color="primary"  size="lg" className="mt-1">
                                <Spinner size="sm" />
                                    Sending...
                                </Button>
                                </>:<>
                                <Button color="primary"  size="lg" onClick={(e)=> resendactivationlink(e)}disabled={isDisabled}>
                                {isDisabled ? "Resend in 30s..." : "Resend Email"}
                                </Button>
                                </>
                                
                            }
                        </BlockDes>
                        </>
                        }
                      </BlockContent>
                    </>:
                    <></>
                }

                  
               
            
        </Block>
    </>)
}

export default UserActivation;