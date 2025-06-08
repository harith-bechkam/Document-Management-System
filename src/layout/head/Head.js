import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useParams } from "react-router";
import * as API from '../../utils/API';

const Head = ({ ...props }) => {
  const location = useLocation();
  const params = useParams();
  const [grantAccess, setGrantAccess] = useState(false);
  const access = useRef(false);
  useEffect(() => {
    //console.log(`location`, window.origin, 'test', location)
    if (typeof params.externalusertoken !== "undefined" && params.externalusertoken != null) {
      //do nothing
    } else {
      getUserAccess(location)
    }
  }, [])

  async function getUserAccess(location) {
    const loggedInUser = localStorage.getItem('userId');
    if (location.pathname.includes('section')) {
      const documentId = params.sectionId
      const documentResponse = await API.getSection(documentId);
      // debugger
      if (documentResponse?.data?.owner == loggedInUser) {
        // debugger
        setGrantAccess(true);
        access.current = true;
      }
    }
    if ((location.pathname.includes('folder') && params.id) ||
      location.pathname.includes('details') ||
      (location.pathname.includes('share') && params.id)) {
      // debugger
      const documentId = params.id
      const documentResponse = await API.getDetails(documentId)
      const documentDetails = documentResponse?.data?.data;
      // debugger
      if (documentDetails.createdBy == loggedInUser) {
        // debugger
        setGrantAccess(true);
        access.current = true;
      } else {
        if (documentDetails.sharedWith.users.some(user => user.user == loggedInUser)) {
          setGrantAccess(true);
          access.current = true;
        } else {
          debugger
          const memberTeamsResponse = await API.getAllGroupsContainingUser();
          const userGroups = memberTeamsResponse.data;
          const sharedUserGroups = documentDetails.sharedWith?.userGroups || [];
          const isGroupShared = sharedUserGroups.some(group =>
            userGroups.some(userGroup =>
              userGroup._id?.toString() == group.group?.toString()
            )
          );
          if (isGroupShared) {
            setGrantAccess(true);
            access.current = true;
          }
        }
      }
    }
    if ((location.pathname.includes('share') && params.id)) {
      // debugger
      const documentId = params.id
      const documentResponse = await API.getDetails(documentId)
      const documentDetails = documentResponse?.data?.data;
      // debugger
      if (documentDetails.owner == loggedInUser) {
        // debugger
        setGrantAccess(true);
        access.current = true;
        window.location.href = `/#/folder/${documentId}`
      }
    }
    // if (location.pathname.includes('share') && params.id) {
    //   debugger
    // }
    const privilege = JSON?.parse(localStorage.getItem('privileges'));
    if (location.pathname.includes('accessOverview')) {
      if (privilege?.accessOverview?.viewAccessOverview) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('accessOverview')) {
      if (privilege?.accessOverview?.viewAccessOverview) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('formBuild') && location.pathname.includes('add')) {
      if (privilege?.workflow?.addWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('formBuild') && location.pathname.includes('edit')) {
      if (privilege?.workflow?.updateWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('formBuild')) {
      if (privilege?.workflow?.viewWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('metaData') ||
      location.pathname.includes('DocumentType') ||
      location.pathname.includes('keywords')) {
      if (privilege?.metaData?.viewMetaData) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('WorkflowVersionsTable') && params.fileType) {
      if (privilege?.workflow?.viewWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('WorkflowVersionsTable') && params.fileType) {
      if (privilege?.workflow?.viewWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('workflow') && location.pathname.includes('detail') && params.fileType) {
      if (privilege?.workflow?.viewWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('workflow') && location.pathname.includes('edit')) {
      if (privilege?.workflow?.updateWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('workflow') && location.pathname.includes('file')) {
      if (privilege?.workflow?.updateWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('workflow') && location.pathname.includes('add')) {
      if (privilege?.workflow?.addWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('workflowPendings')) {
      if (privilege?.workflow?.viewWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('approvalHistory')) {
      if (privilege?.workflow?.viewWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('ownerHistory')) {
      if (privilege?.workflow?.viewWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('setUpWorkflow')) {
      if (privilege?.workflow?.addWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('workflow')) {
      if (privilege?.workflow?.viewWorkflow) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('user-profile-activity')) {
      if (localStorage.getItem('role') != 'User') {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('integration')) {
        setGrantAccess(true);
        access.current = true;
    }
    if (location.pathname.includes('usergroups')) {
      // debugger
      if (privilege?.userGroup?.viewuserGroup) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('users') && location.pathname.includes('add')) {
      if (privilege?.user?.addUser) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('users') && location.pathname.includes('edit')) {
      if (privilege?.user?.updateUser) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('users')) {
      if (privilege?.user?.viewUser) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (location.pathname.includes('metadataApproval')) {
      if (privilege?.user?.viewMetaData) {
        setGrantAccess(true);
        access.current = true;
      }
    }
    if (
      location.pathname.includes('home') ||
      location.pathname.includes('auth') ||
      location.pathname.includes('shared') ||
      location.pathname.includes('starred') ||
      location.pathname.includes('recovery') ||
      location.pathname.includes('search') ||
      location.pathname.includes('file') ||
      location.pathname.includes('foldertree') ||
      location.pathname.includes('search') ||
      location.pathname.includes('formreports')||
      location.pathname.includes('viewForm') ||
      location.pathname.includes('user-profile-notification') ||
      location.pathname.includes('user-profile-regular') ||
      location.pathname.includes('user-profile-setting') ||
      location.pathname.includes('workspace-setting') ||
      location.pathname.includes('user-activation') ||
      location.pathname.includes('metadataApproval') ||
      location.pathname.includes('workspace-subscription')
    ) {
      setGrantAccess(true);
      access.current = true;
    }
    // debugger
    if (!access.current) {
      if (localStorage.getItem('workspace_id') != null) {
        window.location.href = `/#/${localStorage.getItem('workspace_id')}/noaccess`
      } else {
        window.location.href = `/#/noaccess`
      }
    }
    // debugger
  }
  return (
    <Helmet>
      <title>{props.title ? props.title + " | " : null} DMS</title>
    </Helmet>
  );
};
export default Head;
