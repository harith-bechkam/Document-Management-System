import { Route, Routes, Navigate, useLocation } from 'react-router-dom'

import Layout from "../layout/Index";
import FileManager from "../pages/app/file-manager/FileManager";
import FileManagerSearch from "../pages/app/file-manager/FileManagerSearch";
import FileManagerShared from "../pages/app/file-manager/FileManagerShared";
import FileManagerStarred from "../pages/app/file-manager/FileManagerStarred";
import FileManagerRecovery from "../pages/app/file-manager/FileManagerRecovery";
import Error404Modern from "../pages/error/404-modern";
import AccessOverview from '../pages/admin/AccessOverview';
import FileManagerFolders from '../pages/app/file-manager/FileManagerFolders';

import UserActivation from "../pages/admin/Users/UserActivation"
import UserProfileRegular from "../pages/pre-built/user-manage/UserProfileRegular";
import UserProfileNotification from "../pages/pre-built/user-manage/UserProfileNotification";
import UserProfileActivity from "../pages/pre-built/user-manage/UserProfileActivity";
import UserProfileSetting from "../pages/pre-built/user-manage/UserProfileSetting";
import WorkspaceSetting from "../pages/pre-built/user-manage/WorkspaceSetting";
import WorkspaceSubscription from "../pages/pre-built/user-manage/WorkspaceSubscription";
import List from '../pages/admin/Users/List';
import Form from '../pages/admin/Users/Form';
import ListUserGroups from '../pages/admin/UserGroups/ListGroups';

import Flow from '../pages/admin/Workflow/Flow';
import SetUpWorkflow from '../pages/admin/Workflow/setUp/SetUpWorkflow';

import WorkflowList from '../pages/admin/Workflow/List';
import PendingsList from '../pages/admin/Workflow/Pendings/PendingsList';
import PendingsDetail from '../pages/admin/Workflow/Pendings/PendingsDetail';

import MetaList from '../pages/admin/MetaData/List';
import DocumentTypeList from '../pages/admin/MetaData/DocumentType/List';
import SecondaryDocumentTypeList from '../pages/admin/MetaData/SecondaryDocumentType/List';
import KeywordsList from '../pages/admin/MetaData/Keywords/List';
import MetadataApproval from '../pages/admin/MetaData/Approval';


import FormBuilderList from '../pages/admin/FormBuilder/List';
import Build from '../pages/admin/FormBuilder/Build';
import StepBuild from '../pages/admin/FormBuilder/StepBuild';
import ViewForm from '../pages/admin/FormBuilder/ViewForm';
import StepViewForm from '../pages/admin/FormBuilder/StepViewForm';

import UnSupportFilesViewer from '../pages/app/file-manager/views/unsupportfileViewer';
import FormViewer from '../pages/admin/FormBuilder/FormViewer';
import Details from '../pages/app/file-manager/views/Details';
import FileView from '../pages/app/file-manager/components/FileView';
import WorkflowVersionsTable from '../pages/app/file-manager/views/WorkflowVersionsTable';
import FileEdit from '../pages/app/file-manager/components/FileEdit';
import Error404Classic from '../pages/error/404-classic';
import WorkflowError from '../pages/admin/Workflow/WorkflowError';
import MyDrive from '../pages/app/file-manager/MyDrive';
import MyFolderTree from '../pages/app/file-manager/MyDriveTree';
import MyStepOnwardsHistory from '../pages/admin/Workflow/Pendings/MyStepOnwardsHistory';
import OwnerHistory from '../pages/admin/Workflow/Pendings/OwnerHistory';
import { useEffect } from 'react';
import FormReports from '../pages/app/file-manager/views/FormReports';
import IntegrationSettingPage from '../pages/pre-built/user-manage/IntegrationSetting';

const PrivateRoutes = () => {
    const location = useLocation()

    const Privilege = JSON?.parse(localStorage.getItem('privileges'));
    const privileges = {
        viewAccessOverview: Privilege?.accessOverview?.viewAccessOverview,
        viewMetaData: Privilege?.metaData?.viewMetaData,
        viewWorkflow: Privilege?.workflow?.viewWorkflow,
        viewUser: Privilege?.user?.viewUser,
        addWorkflow: Privilege?.workflow?.addWorkflow,
        updateWorkflow: Privilege?.workflow?.updateWorkflow,
        addUser: Privilege?.user?.addUser,
        updateUser: Privilege?.user?.updateUser,
        viewSection: Privilege?.section?.viewSection,
        viewUserGroup: Privilege?.userGroup?.viewuserGroup
    }



    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="auth/*" element={<Navigate to="/home" />} />
                {/* LAYOUT */}
                <Route path="search" element={<FileManagerSearch />} />
                <Route path="home" element={<FileManager />} />
                {/* <Route path="files" element={<FileManagerFiles />} /> */}
                <Route path="starred" element={<FileManagerStarred />} />
                <Route path="shared" element={<FileManagerShared />} />
                <Route path="share/:id" element={<FileManagerShared />} />
                <Route path="recovery" element={<FileManagerRecovery />} />

                {privileges.viewSection && <Route path="section/:sectionId" element={<FileManagerFolders />} />}
                <Route path="folder/:id" element={<FileManagerFolders />} />
                <Route path="details/:id" element={<Details />} />
                <Route path="file/:id/:externalusertoken" element={<UnSupportFilesViewer />} />
                <Route path="form/:id/:externalusertoken" element={<FormViewer />} />
                <Route path="formreports/:id" element={<FormReports />} />

                <Route path="file/view/:id" element={<FileView />} />
                <Route path="file/view/:id/:externalusertoken" element={<FileView />} />
                <Route path="file/workflow/edit/:workflowHisId" element={<FileEdit />} />
                


                {/* <Route path="foldertree" element={<MyDrive />} /> */}
                <Route path="foldertree" element={<MyFolderTree />} />

                {/* ADMIN */}
                {privileges.viewAccessOverview && <Route path="accessOverview" element={<AccessOverview />} />}

                {privileges.viewMetaData && <Route path="metaData" element={<MetaList />} />}
                {privileges.viewMetaData && <Route path="DocumentType" element={<DocumentTypeList />} />}
                {privileges.viewMetaData && <Route path="secondaryDocumentType" element={<SecondaryDocumentTypeList />} />}
                {privileges.viewMetaData && <Route path="keywords" element={<KeywordsList />} />}


                {privileges.viewWorkflow && <Route path="workflow" element={<WorkflowList />} />}
                {privileges.addWorkflow && <Route path="workflow/add" element={<Flow />} />}
                {privileges.updateWorkflow && <Route path="workflow/edit/:workflowId" element={<Flow />} />}
                {privileges.addWorkflow && <Route path="workflow/setUpWorkflow/:togoName/:togoId/:op" element={<SetUpWorkflow />} />}
                {/* tables */}
                {privileges.viewWorkflow && <Route path="workflowPendings" element={<PendingsList />} />}
                {privileges.viewWorkflow && <Route path="approvalHistory" element={<MyStepOnwardsHistory />} />}
                {privileges.viewWorkflow && <Route path="ownerHistory" element={<OwnerHistory />} />}

                {privileges.viewWorkflow && <Route path="workflow/detail/:fileType/:fileId/:hisId" element={<PendingsDetail />} />}
                {privileges.viewWorkflow && <Route path="WorkflowVersionsTable/:fileType/:fileId" element={<WorkflowVersionsTable />} />}
                <Route path="workflow/accessDenied" element={<WorkflowError/>} />



                {privileges.viewWorkflow && <Route path="formBuild" element={<FormBuilderList />} />}
                {privileges.addWorkflow && <Route path="formBuild/add" element={<Build />} />}
                {privileges.updateWorkflow && <Route path="formBuild/edit/:formBuilderId/:formBuilderName" element={<Build />} />}
                {privileges.addWorkflow && <Route path="formBuild/step/add" element={<StepBuild />} />}
                {privileges.updateWorkflow && <Route path="formBuild/step/edit/:formBuilderId/:formBuilderName" element={<StepBuild />} />}

                {1 && <Route path="viewForm/single/:op/:formId/:formName" element={<ViewForm />} />}
                {1 && <Route path="viewForm/step/:op/:formId/:formName" element={<StepViewForm />} />}
                {1 && <Route path="viewForm/:prefix/:hisId/single/:op/:formId/:formName" element={<ViewForm />} />}
                {1 && <Route path="viewForm/:prefix/:hisId/step/:op/:formId/:formName" element={<StepViewForm />} />}


                {privileges.viewUser && <Route path="users" element={<List />} />}
                {privileges.addUser && <Route path="users/add" element={<Form />} />}
                {privileges.updateUser && <Route path="users/edit/:userId" element={<Form />} />}

                {privileges.viewUserGroup && <Route path="usergroups" element={<ListUserGroups />} />}

                {privileges.viewMetaData && <Route path="metadataApproval" element={<MetadataApproval />} />}

                <Route path="user-activation/:token?" element={<UserActivation />} ></Route>

                {/* PROFILE */}
                <Route path="user-profile-notification" element={<UserProfileNotification />} ></Route>
                <Route path="user-profile-regular" element={<UserProfileRegular />}></Route>
                {localStorage.getItem('role') != 'User' && <Route path="user-profile-activity" element={<UserProfileActivity />}></Route>}
                <Route path="user-profile-setting" element={<UserProfileSetting />}></Route>
                <Route path="integration" element={<IntegrationSettingPage />}></Route>
                <Route path="workspace-setting" element={<WorkspaceSetting />}></Route>
                <Route path="workspace-subscription" element={<WorkspaceSubscription />}></Route>
                <Route path="noaccess" element={<Error404Classic/>} />
                <Route path="*" element={<Error404Modern />} />
            </Route>
        </Routes>
    )

}
export { PrivateRoutes };