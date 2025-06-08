import React, { useState, useEffect } from "react";
import Content from "../../../layout/content/Content";
import { Card, Badge, Modal } from "reactstrap";
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
import UserProfileAside from "./UserProfileAside";
import ChangePassword from "../../auth/ChangePassword";
import { Form, Spinner, Alert } from "reactstrap";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as API from '../../../utils/API';
import { getAllSections, getUsetStorageData, saveMyHierarchy, saveMyHierarchyIDS, setmyworkspaceinfo } from "../../../redux/folderSlice";
import { useDispatch, useSelector } from "react-redux";
import UpdateProfileModal from "./UpdateProfileModal";

const WorkspaceSetting = () => {
  const [loading, setLoading] = useState(true);
  const [workspacename, setWorkspacename] = useState("");
  const [workspaceid, setWorkspaceid] = useState("");
  const [errorVal, setError] = useState("");
  const { register, handleSubmit,setValue,formState: { errors } } = useForm();
  const [sm, updateSm] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
    
    const toggleProfileModal = () => {
      setProfileModal(!profileModal);
    }
  const dispatch = useDispatch();

  const onFormSubmit = async (formData) => {
    setLoading(true);
    let response = await API.updateworkspace(formData.name, workspaceid)
    let {status,data}=response;
    if (response?.status) {
      toast.success("Workspace updated successfully");
        let workspaceResponse = await API.getmyworkspaceinfo();
        let { status,data,message } = workspaceResponse
    
        if (status) {
          dispatch(setmyworkspaceinfo({ data }))
        }
        setLoading(false);
    } else {
      toast.error("Server Error, please try again later")
    }
  }

  const fetchworkspaceinfo =  async () => {

    let workspaceResponse = await API.getmyworkspaceinfo();
    let { status,data,message } = workspaceResponse

    if (status) {
      
      for(let work of data){
        if(work._id==localStorage.getItem("workspace_id")){
          setValue("name",work.name);
          setWorkspaceid(work._id);
          break;
        }
      }
      setLoading(false);
    }else{
        toast.error(message)
    }
    
  }

  useEffect(() => {    
    fetchworkspaceinfo();
  },[])

  useEffect(() => {

  },[setValue])

  


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
              <BlockHead size="lg">
                <BlockBetween>
                  <BlockHeadContent>
                    <BlockTitle tag="h4">Workspace Settings</BlockTitle>
                    <BlockDes>
                    <Form className="is-alter" onSubmit={handleSubmit(onFormSubmit)}>
                    <div className="form-group">
                      <div className="form-control-wrap">
                        <input
                          type="text"
                          id="name"
                          {...register('name', { required: "This field is required" })}
                          // defaultValue="info@softnio.com"
                          placeholder="Enter Workspace name"
                          className="form-control-lg form-control" />
                        {errors.name && <span className="invalid">{errors.name.message}</span>}
                      </div>
                    </div>
                     <div className="form-group">
                            <Button size="lg" className="btn-block" type="submit" color="primary">
                              {loading ? <Spinner size="sm" color="light" /> : "Save"}
                            </Button>
                       </div>
                    </Form>
                    </BlockDes>
                  </BlockHeadContent>
                </BlockBetween>
              </BlockHead>

            </div>
          </div>
        </Card>
      </Content>
      <Modal isOpen={profileModal} size="lg" toggle={toggleProfileModal}>
          <UpdateProfileModal toggle={toggleProfileModal} />
        </Modal>
    </React.Fragment>
  );
};

export default WorkspaceSetting;
