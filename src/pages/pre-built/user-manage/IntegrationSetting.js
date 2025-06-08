import React, { useState, useEffect } from "react";
import Content from "../../../layout/content/Content";
import { Card, Badge, Modal, Spinner } from "reactstrap";
import Head from "../../../layout/head/Head";
import {
  Block,
  BlockBetween,
  BlockDes,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  Icon,
  InputSwitch,
  Button,
} from "../../../components/Component";
import toast, { Toaster } from "react-hot-toast";
import UserProfileAside from "./UserProfileAside";
import UpdateProfileModal from "./UpdateProfileModal";
import { getsitelist, verifymicrosofttoken, removeonedriveaccess, syncNow } from "../../../utils/API";
import MicroSoftSitesConfigurationModal from "./MicroSoftSitesConfigurationModal";
import { getTimezoneInDiffFormat } from "../../../utils/Utils";
import moment from "moment";
const IntegrationSettingPage = () => {
  const [sm, updateSm] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [microsoftstatus, setMicrosoftstatus] = useState(0);
  const [siteapiloading, setSiteapiloading] = useState(true);
  const [lastsyncedAt, setLastsyncedAt] = useState(null);
  const [isloading, setIsloading] = useState(false);
  const [onedrivesites, setOnedrivesites] = useState([]);
  const [microsoftSiteConfigureModal,setMicrosoftSiteConfigureModal]= useState(false);
  
  const toggleProfileModal = () => {
    setProfileModal(!profileModal);
  }

  const toggleMicrosoftSiteConfigureModal = () => {
    setMicrosoftSiteConfigureModal(!microsoftSiteConfigureModal);
  }
  
  const integratewithonedrive = () => {
    const token = localStorage.getItem('accessToken');
    const workspace_id = localStorage.getItem('workspace_id');
    window.location.href=`${process.env.REACT_APP_BE_URL}/auth/integration/microsoft/?workspace_id=${workspace_id}&accessToken=${token}`
  }

  const domicrosoftconfigure= () => {
      setSiteapiloading(true);
      setMicrosoftSiteConfigureModal(true);
      getsitelist().then((res) => {
        if(res.status==true){
            setOnedrivesites(res.data.sites);

        }else{
          setOnedrivesites([]);
        }
        setSiteapiloading(false);
      })
  }

  const rejectmicrosoftconfigure=()=>{
      setIsloading(true);
      removeonedriveaccess().then((res) => {
        setIsloading(false);
        if(res.status==true){
          window.location.href=`${process.env.REACT_APP_BE_URL}/auth/integration/microsoft/logout?redirectto=${encodeURIComponent(window.location.href)}`
        }
      })
  } 

  const triggerSyncNow=()=>{
   setIsloading(true);
      syncNow().then((res) => {
        setIsloading(false);
        if(res.status==true){
          toast.success(`Sync is In-Progress`); 
        }else{
          toast.error(`Unable to trigger sync now, contact your Administrator on this`);
        }
      })    
  }

  // function to change the design view under 990 px
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

    verifymicrosofttoken().then((res) => {
        if(res.status==true){
            if(res.data.statuscode==200){
              setLastsyncedAt(moment(res.data.lastSyncedAt).local().format('LLL'))
            }else{
              setLastsyncedAt(null)
            }
            setMicrosoftstatus(res.data.statuscode)
        }else if(res.status==false){
             setMicrosoftstatus(res.data.statuscode)
              setLastsyncedAt(null)
        }else{
          setMicrosoftstatus(0)
           setLastsyncedAt(null)
        }
      
    })
    window.addEventListener("load", viewChange);
    window.addEventListener("resize", viewChange);
    document.getElementsByClassName("nk-header")[0].addEventListener("click", function () {
      updateSm(false);
    });
    return () => {
      window.removeEventListener("resize", viewChange);
      window.removeEventListener("load", viewChange);
    };
  }, []);

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
              <UserProfileAside updateSm={updateSm} sm={sm} setModal={setProfileModal}/>
            </div>
            <div className="card-inner card-inner-lg">
              {sm && mobileView && <div className="toggle-overlay" onClick={() => updateSm(!sm)}></div>}
              <BlockHead size="lg">
                <BlockBetween>
                  <BlockHeadContent>
                    <BlockTitle tag="h4">Integrations</BlockTitle>
                    <BlockDes>
                      {/* <p>These settings will help you to keep your account secure.</p> */}
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
                <Card className="card-bordered">
                  <div className="card-inner-group">

                    {/* <div className="card-inner">
                      <div className="between-center flex-wrap flex-md-nowrap g-3">
                        <div className="nk-block-text">
                          <h6>Save my Activity Logs</h6>
                          <p>You can save your all activity logs including unusual activity detected.</p>
                        </div>
                        <div className="nk-block-actions">
                          <ul className="align-center gx-3">
                            <li className="order-md-last">
                              <div className="custom-control custom-switch me-n2">
                                <InputSwitch checked id="activity-log" />
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div> */}

                    <div className="card-inner">
                        {
                            isloading?<>
                            <Button disabled color="primary" className="position-absolute top-50 start-50 translate-middle">
                              <Spinner size="sm" />
                              <span> Loading... </span>
                            </Button></>
                            :<></>
                          }
                      <div className="between-center flex-wrap g-3">
                        <div className="nk-block-text">
                          <h6>Microsoft</h6> 
                          { 
                            (lastsyncedAt!=null)?
                            <p>Last Synced at {lastsyncedAt}</p> 
                            :<></>
                          }
                        </div>
                        <div className="nk-block-actions flex-shrink-sm-0">
                         
                          <ul className="align-center flex-wrap flex-sm-nowrap gx-3 gy-2">
                            <li className="order-md-last">
                              {
                                microsoftstatus==0 || microsoftstatus==500?
                                <Button color="secondary">Checking</Button> 
                                :microsoftstatus==200?
                                <><Button color="primary" onClick={() => domicrosoftconfigure()} >Configure Sites</Button> <Button color="danger"  onClick={() => rejectmicrosoftconfigure()}>Disconnect</Button> <Button color="success"  onClick={() => triggerSyncNow()}>Sync Now</Button></>
                                :microsoftstatus==401?
                                <Button onClick={() => integratewithonedrive()} color="danger">Expired</Button>
                                :
                                <Button onClick={() => integratewithonedrive()} color="primary">Add</Button>
                            }
                            </li>
                            {/* <li>
                              <em className="text-soft text-date fs-12px">
                                Last changed: <span>Oct 2, 2019</span>
                              </em>
                            </li> */}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* <div className="card-body">
                      <div className="between-center flex-wrap flex-md-nowrap g-3">
                        <div className="nk-block-text">
                          <h6>
                            2 Factor Auth &nbsp; <Badge color="success" className="ml-0">Enabled</Badge>
                          </h6>
                          <p>
                            Secure your account with 2FA security. When it is activated you will need to enter not only your
                            password, but also a special code using app. You will receive this code via mobile application.{" "}
                          </p>
                        </div>
                        <div className="nk-block-actions">
                          <Button color="primary">Disable</Button>
                        </div>
                      </div>
                    </div> */}

                  </div>
                </Card>
              </Block>
            </div>
          </div>
        </Card>
          <Modal isOpen={profileModal} size="lg" toggle={toggleProfileModal}>
                  <UpdateProfileModal toggle={toggleProfileModal} />
          </Modal>

          <Modal className="modal-90vh"  isOpen={microsoftSiteConfigureModal} size="lg" toggle={toggleMicrosoftSiteConfigureModal}>
                  <MicroSoftSitesConfigurationModal toggle={toggleMicrosoftSiteConfigureModal} sites={onedrivesites} isloading={siteapiloading}  />
          </Modal>
      </Content>
    </React.Fragment>
  );
};

export default IntegrationSettingPage;
