import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import Head from "./head/Head";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import AppRoot from "./global/AppRoot";
import AppWrap from "./global/AppWrap";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import FileManagerProvider from "../pages/app/file-manager/components/Context";
import { getAllSections, getUsetStorageData, saveMyHierarchy, saveMyHierarchyIDS, setmyworkspaceinfo, setAppFeatures } from "../redux/folderSlice";
import * as API from '../utils/API';
import _ from 'lodash';


const Layout = ({ title, ...props }) => {
  const navigate = useNavigate()
  const params = useParams();
  const Privilege = JSON?.parse(localStorage.getItem('privileges'));
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {

    if (typeof params.externalusertoken !== "undefined" && params.externalusertoken != null) {

    } else {
      Privilege?.section?.viewSection && fetchSectionData()
      fetchUserStorage()
      fetchworkspaceinfo();
    }
  }, [])

  const fetchSectionData = async () => {
    let sectionResponse = await API.getAllSections()
    let { status } = sectionResponse

    if (status) dispatch(getAllSections({ sections: sectionResponse?.['data'] }))
    else toast.error(`${sectionResponse?.['message']}`)
  }

  const fetchworkspaceinfo = async () => {
    let workspaceResponse = await API.getmyworkspaceinfo()
    let { status, data } = workspaceResponse

    if (status) {
      for (let work of data) {
        if (work._id == localStorage.getItem("workspace_id")) {

          const planDetails = work?.planDetails
          var aisummary = false
          if (planDetails?.isActivePlan) {
            aisummary = planDetails?.grantedFeatures?.hasOwnProperty('AISummary') && planDetails?.grantedFeatures?.AISummary == "yes"
          }

          let appFeatures = { aisummary }

          if (work.owner == work.userinfo.userId && work.owner == localStorage.getItem('userId')) {
            appFeatures['ismarketDetailsCompleted'] = work.ismarketDetailsCompleted
          }

          localStorage.setItem("appFeatures", JSON.stringify(appFeatures))
          window.dispatchEvent(new Event("storage"));
        }
      }


      dispatch(setmyworkspaceinfo({ data }));
      let isvalidworkspace = false;
      for (let work of data) {
        if (work._id == localStorage.getItem("workspace_id")) {
          isvalidworkspace = true;
          if (work.userinfo.user_status.toLowerCase() == "pending" && !location.pathname.startsWith(`/user-activation`)) {

            navigate("/user-activation")
          }
          break;
        }
      }
    }
    else toast.error(`${workspaceResponse?.['message']}`)
  }

  const fetchUserStorage = async () => {
    let storageResponse = await API.getUserStorage()
    let { status, data } = storageResponse

    if (status) dispatch(getUsetStorageData({ storage: data }))
    else toast.error(`${storageResponse?.['message']}`)
  }

  // const fetchMyHierarchy = async () => {

  //   const folderRespo = await API.getMyHierarchy()
  //   if (!folderRespo.status) {
  //     return toast.error('Could Not Form Hierarchy for Folder Filter')
  //   }

  //   if (folderRespo['data']?.length != 0) {
  //     let clonedata = _.cloneDeep(folderRespo['data'])
  //     dispatch(saveMyHierarchy(clonedata))
  //     dispatch(saveMyHierarchyIDS(folderRespo['allIDs']))
  //   }
  // }

  return (
    <FileManagerProvider>
      <Head title={!title && 'Loading'} />
      <AppRoot>
        <AppWrap className={`nowrap ${location.pathname.includes('viewForm') ? 'form-wrapper' : ''}`}>
          {(typeof params.externalusertoken !== "undefined" && params.externalusertoken != null) || (location.pathname.startsWith('/file/view') || (location.pathname.startsWith('/file/workflow/edit')) || (location.pathname.startsWith('/formreports')) || (location.pathname.startsWith('/workflow/add')) || (location.pathname.startsWith('/workflow/edit')) || (location.pathname.startsWith('/formBuild/step/add')) || (location.pathname.startsWith('/formBuild/add')) || (location.pathname.startsWith('/formBuild/edit')) || (location.pathname.startsWith('/viewForm/step')) || (location.pathname.startsWith('/viewForm/workflow')) || (location.pathname.startsWith('/formBuild/step/edit')) || (location.pathname.startsWith('/user-activation')) || (location.pathname.startsWith('/metadataApproval'))) ? '' : <Header fixed />}
          <Outlet />
          <Toaster />
          {(typeof params.externalusertoken !== "undefined" && params.externalusertoken != null) || location.pathname.startsWith('/file/view') || (location.pathname.startsWith('/file/workflow/edit')) || (location.pathname.startsWith('/workflow/add')) || (location.pathname.startsWith('/workflow/edit')) || (location.pathname.startsWith('/formBuild/step/add') || (location.pathname.startsWith('/formBuild/add')) || (location.pathname.startsWith('/formBuild/edit')) || (location.pathname.startsWith('/viewForm/step')) || (location.pathname.startsWith('/viewForm/workflow')) || (location.pathname.startsWith('/formBuild/step/edit')) || (location.pathname.startsWith('/metadataApproval'))) ? '' : <Footer />}
        </AppWrap>
      </AppRoot>
    </FileManagerProvider>
  );
};
export default Layout;
