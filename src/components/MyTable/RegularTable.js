import React, { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
    DropdownItem,
    Badge,
    Progress,
    Modal,
} from "reactstrap";
import {
    Block,
    Icon,
    UserAvatar,
    PaginationComponent,
    Button,
    DataTable,
    DataTableBody,
    DataTableHead,
    DataTableRow,
    DataTableItem,
    TooltipComponent,
    RSelect
} from "../Component";
import { findLogoName } from "../../utils/Utils";
import { useLocation, useNavigate } from "react-router";
import moment from "moment";
import GroupMembers from "../../pages/app/file-manager/modals/UserGroupMembers";

const Table = ({
    op,
    columns,
    extraColumns,
    setColumns,
    setExtraColumns,
    data,
    itemPerPage,
    setItemPerPage,
    setCurrentPage,
    handlePagination,
    privilege,
    onEditClick,
    onRowClick,
    onEyeClick,
    suspendUser,
    sortData,
    filterComp,
    onSearchText,
    onSearchChange,
}) => {

    const [tablesm, updateTableSm] = useState(false)
    const [onSearch, setonSearch] = useState(true)
    const [sort, setSort] = useState(true)
    const location = useLocation();
    const [placeholder, setPlaceholder] = useState('')
    const [deleteText, setDeleteText] = useState('Delete');
    const [editAccess, setEditAccess] = useState(false);
    const [deleteAccess, setDeleteAcess] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupMembers, setGroupMembers] = useState(false);
    const navigate = useNavigate()

    async function placeholderSetter() {
        const Privilege = JSON?.parse(localStorage.getItem('privileges'));
        const privileges = {
            viewAccessOverview: Privilege?.accessOverview?.viewAccessOverview,
            viewMetaData: Privilege?.metaData?.viewMetaData,
            updateMetaData: Privilege?.metaData?.updateMetaData,
            deleteMetaData: Privilege?.metaData?.deleteMetaData,
            viewWorkflow: Privilege?.workflow?.viewWorkflow,
            viewUser: Privilege?.user?.viewUser,
            addWorkflow: Privilege?.workflow?.addWorkflow,
            updateWorkflow: Privilege?.workflow?.updateWorkflow,
            deleteWorkflow: Privilege?.workflow?.deleteWorkflow,
            addUser: Privilege?.user?.addUser,
            updateUser: Privilege?.user?.updateUser,
            deleteUser: Privilege?.user?.deleteUser,
            viewUserGroup: Privilege?.userGroup?.viewuserGroup,
            updateuserGroup: Privilege?.userGroup?.updateuserGroup,
            deleteuserGroup: Privilege?.userGroup?.deleteuserGroup,
        }
        if (location.pathname.includes('users')) {
            if (privileges.updateUser) {
                setEditAccess(true);
            }
            if (privileges.deleteUser) {
                setDeleteAcess(true);
            }
            setPlaceholder('Search Users')
            setDeleteText('Delete User')
        } else if (location.pathname.includes('usergroups')) {
            if (privileges.updateuserGroup) {
                setEditAccess(true);
            }
            if (privileges.deleteuserGroup) {
                setDeleteAcess(true);
            }
            setPlaceholder('Search User Groups')
            setDeleteText('Delete Group')
        } else if (location.pathname.includes('workflowPendings')) {
            if (privileges.updateWorkflow) {
                setEditAccess(true);
            }
            if (privileges.deleteWorkflow) {
                setDeleteAcess(true);
            }
            setPlaceholder('Search on your Pending Approvals')
            setDeleteText('Delete your Pending Approvals')
        }
        else if (location.pathname.includes('approvalHistory')) {
            if (privileges.updateWorkflow) {
                setEditAccess(true);
            }
            if (privileges.deleteWorkflow) {
                setDeleteAcess(true);
            }
            setPlaceholder('Search on your Approvals')
            setDeleteText('Delete Approval History')
        }
        else if (location.pathname.includes('ownerHistory')) {
            if (privileges.updateWorkflow) {
                setEditAccess(true);
            }
            if (privileges.deleteWorkflow) {
                setDeleteAcess(true);
            }
            setPlaceholder('Search on Submitted Documents')
            setDeleteText('Delete Submitted Documents')
        }
        else if (location.pathname.includes('metaData')) {
            if (privileges.updateMetaData) {
                setEditAccess(true);
            }
            if (privileges.deleteMetaData) {
                setDeleteAcess(true);
            }
            setPlaceholder('Search Metadata')
            setDeleteText('Delete Metadata')
        } else if (location.pathname.includes('DocumentType')) {
            if (privileges.updateMetaData) {
                setEditAccess(true);
            }
            if (privileges.deleteMetaData) {
                setDeleteAcess(true);
            }
            setPlaceholder('Search Document Type')
            setDeleteText('Delete Document Type')
        } else if (location.pathname.includes('keywords')) {
            if (privileges.updateMetaData) {
                setEditAccess(true);
            }
            if (privileges.deleteMetaData) {
                setDeleteAcess(true);
            }
            setPlaceholder('Search Keywords')
            setDeleteText('Delete Keyword')
        } else if (location.pathname.includes('workflow')) {
            if (privileges.updateWorkflow) {
                setEditAccess(true);
            }
            if (privileges.deleteWorkflow) {
                setDeleteAcess(true);
            }
            setPlaceholder('Search Workflows')
            setDeleteText('Delete Workflow')
        } else if (location.pathname.includes('formBuild')) {
            if (privileges.updateWorkflow) {
                setEditAccess(true);
            }
            if (privileges.deleteWorkflow) {
                setDeleteAcess(true);
            }
            setPlaceholder('Search Form Templates')
            setDeleteText('Delete Template')
        } else {
            if (localStorage.getItem('role') == 'Super Admin') {
                setEditAccess(true);
                setDeleteAcess(true);
            }
            setPlaceholder('Search')
            setDeleteText('Delete')
        }
    }

    function toggleGroupMemberModal() {
        setShowGroupModal(!showGroupModal)
    }

    useEffect(() => {
        placeholderSetter()
    }, [location.pathname])

    const toggle = () => setonSearch(!onSearch)

    const updateOrPushItem = (itemName, itemLabel, checked) => {
        const index = columns.findIndex(column => column.name === itemName)

        if (index !== -1) {
            setColumns(prevColumns => {
                const updatedColumns = [...prevColumns]
                updatedColumns[index] = { ...updatedColumns[index] }
                updatedColumns[index]['show'] = checked
                updatedColumns[index]['sort'] = true
                return updatedColumns;
            })
        } else {
            setColumns(prevColumns => [
                ...prevColumns,
                { name: itemName, label: itemLabel, show: checked, sort: true }
            ])
        }
    }


    const extraToggleChecked = (columnName, columnLabel) => {

        const updatedColumns = extraColumns.map(column => {
            if (column.name === columnName) {
                var obj = {
                    ...column,
                    checked: !column.checked
                }
                updateOrPushItem(columnName, columnLabel, obj.checked)
                return obj
            }
            return column
        })

        setExtraColumns(updatedColumns)
    }

    const filterStatusOptions = [
        { value: "Pending", label: "Pending" },
        { value: "Rejected", label: "Rejected" },
        { value: "Completed", label: "Completed" }
    ];

    function generateAvatarBase64(char, backgroundColor) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 24;
        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = backgroundColor;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, size / 2, size / 2);

        return canvas.toDataURL();
    }

    function printGroupMembersModal(groupArr) {
        let array = JSON.parse(JSON.stringify(groupArr))
        array.forEach((elem, idx) => {
            if (!elem.profileImg) {
                elem.profileImg = generateAvatarBase64(
                    elem.username.split(' ')?.slice(0, 2)?.map((w) => w[0].toUpperCase())?.join(''),
                    '#ccc'
                )
            }
        })
        setGroupMembers(array);
        setShowGroupModal(true);
    }


    const getColumns = (item, columnName) => {
        switch (columnName) {

            //user columns
            case 'userName':
                return (
                    <div className="user-card">
                        {!item['imgUrl'] ? <UserAvatar text={findLogoName(item.userName)} image={item['imgUrl']} className="sm" /> :
                            <img src={item['imgUrl']} width={38} height={38} />
                        }
                        <div className="user-info">
                            <span className="tb-lead">
                                {item.userName}{" "}
                                <span
                                    className={`dot dot-${item.isActive
                                        ? "success"
                                        : "danger"
                                        } d-md-none ms-1`}></span>
                            </span>
                            <span>{item?.email}</span>
                        </div>
                    </div>
                )
            case 'mobile':
                return item.mobile
            case 'roleDetails':
                return item.roleDetails?.role || ''
            case 'city':
                return item.city
            case 'state':
                return item.state

            case 'country':
                return item.country

            case 'created':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">By:&nbsp;&nbsp; </label> {item.createdByName ? item.createdByName : '-'}</span>
                        <span className="sub-text"><label className="form-label">At:&nbsp;&nbsp; </label> {moment(item.createdAt).format('lll')}</span>
                    </div>
                )

            case 'updated':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">By:&nbsp;&nbsp; </label> {item.updatedByName ? item.updatedByName : '-'}</span>
                        <span className="sub-text"><label className="form-label">At:&nbsp;&nbsp; </label> {item.updatedAt ? moment(item.updatedAt).format('lll') : '-'}</span>
                    </div>
                )



            // workflow columns
            case 'workflowName':
                return item.workflowName
            case 'workflowDisplayName':
                return item.workflowDisplayName


            case 'isActive':
                return (
                    <span
                        className={
                            `tb-status text-${(item['isActive'] && item['status'] == null && "success") ||
                            (item['isActive'] && item['status'] == 'Pending' && "warning") ||
                            (!item['isActive'] && item['status'] == null && "danger")
                            }`
                        }
                    >
                        {item['isActive'] && item['status'] == 'Pending' && "Pending"}
                        {item['isActive'] && item['status'] == null && "Active"}
                        {!item['isActive'] && item['status'] == null && "InActive"}

                    </span>
                )

            case 'groupName':
                return item.groupName

            case 'members':
                return (
                    <div className="user-avatar-group" onClick={() => printGroupMembersModal(item.members)}>
                        {item.members.length <= 4 ? item.members.slice(0, 4).map((member, index) =>
                            <div key={index} className="user-avatar xs members_avatar">
                                {member.profileImg ?
                                    <img src={member.profileImg} alt="" /> :
                                    <span>{member.username.charAt(0).toUpperCase()}</span>
                                }
                            </div>
                        ) : item.members.slice(0, 3).map((member, index) =>
                            <div key={index} className="user-avatar xs members_avatar">
                                {member.profileImg ?
                                    <img src={member.profileImg} alt="" /> :
                                    <span>{member.username.charAt(0).toUpperCase()}</span>
                                }
                            </div>
                        )}
                        {item.members.length > 4 &&
                            <div className="user-avatar xs members_avatar">
                                <span>{item.members.length - 3}+</span>
                            </div>
                        }
                    </div>
                )

            //workflow - myStepOnwardsHistory
            case 'workflow_mystep_onward_document':
                return (
                    <div className="form-group">

                        {item.Actions.status ?
                            <span className="sub-text" onClick={() => navigate(`${item.Actions.link}`)} >{item.docName} &nbsp; {item?.versionNo && <Badge className="badge-outline" pill color="primary">v{item.versionNo}</Badge>}</span>
                            :
                            <span className="sub-text">{item.docName} &nbsp; {item?.versionNo && <Badge className="badge-outline" pill color="primary">v{item.versionNo}</Badge>}</span>

                        }
                        <span className="sub-text"><label className="form-label">Type:&nbsp;&nbsp; </label> {item.type}</span>
                    </div>
                )
            case 'workflow_mystep_onward_owner':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">By:&nbsp;&nbsp; </label>{item.owner_of_doc}</span>
                        <span className="sub-text"><label className="form-label">At:&nbsp;&nbsp; </label>{item.workflow_start_time}</span>
                    </div>
                )

            case 'workflow_mystep_onward_workflow_start_time':
                return item.workflow_start_time

            case 'workflow_mystep_onward_current_step_name':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">Name:&nbsp;&nbsp; </label>{item.current_step.name}</span>
                        <span className="sub-text"><label className="form-label">Status:&nbsp;&nbsp; </label>{item.current_step.status}</span>
                        {typeof item.current_step?.access != undefined && item.current_step?.access?.length > 0 &&
                            <span className="d-flex sub-text"><label className="form-label">Collaborator{item?.current_step?.access?.length > 1 && 's'}:&nbsp;&nbsp; </label>
                                <div className="user-avatar-group" onClick={() => printGroupMembersModal(item.current_step?.access)}>
                                    {item.current_step?.access.length <= 4 ? item.current_step?.access.slice(0, 4).map((member, index) =>
                                        <div key={index} className="user-avatar xs members_avatar">
                                            {member.profileImg ?
                                                <img src={member.profileImg} alt="" /> :
                                                <span>{member.username.charAt(0).toUpperCase()}</span>
                                            }
                                        </div>
                                    ) : item.current_step?.access.slice(0, 3).map((member, index) =>
                                        <div key={index} className="user-avatar xs members_avatar">
                                            {member.profileImg ?
                                                <img src={member.profileImg} alt="" /> :
                                                <span>{member.username.charAt(0).toUpperCase()}</span>
                                            }
                                        </div>
                                    )}
                                    {item.current_step?.access.length > 4 &&
                                        <div className="user-avatar xs members_avatar">
                                            <span>{item.current_step?.access.length - 3}+</span>
                                        </div>
                                    }
                                </div>
                            </span>
                        }
                    </div>
                )

            case 'workflow_mystep_onward_due_date':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">Initiated At:&nbsp;&nbsp; </label>{item.current_step.startDate}</span>
                        <span className="sub-text"><label className="form-label">Due On:&nbsp;&nbsp; </label>{item.current_step.endDate}</span>
                    </div>
                )

            case 'workflow_mystep_onward_actions':
                return (
                    <div style={{ display: "flex" }}>
                        <span onClick={() => onEyeClick(item, item.startcommentsFromthisStep)}>
                            <TooltipComponent
                                tag="a"
                                containerClassName="btn btn-trigger btn-icon"
                                id={"view" + item?.workflowHistoryId}
                                icon="eye-fill"
                                direction="top"
                                text="View Activities"
                            />
                        </span>

                        {item.Actions.status &&
                            <span onClick={() => navigate(`${item.Actions.link}`)} >
                                <TooltipComponent
                                    tag="a"
                                    containerClassName="btn btn-trigger btn-icon"
                                    id={"action" + item?.workflowHistoryId}
                                    icon="external"
                                    direction="top"
                                    text="Action Page"

                                />
                            </span>
                        }
                    </div>
                )
            case 'workflow_mystep_onward_progress':
                return (
                    <>
                        {item['Progress']['show']}
                        <Progress className="progress-lg" animated value={item.Progress.barcnt} color="success">
                            {item.Progress.barcnt.toFixed(0)}%
                        </Progress>
                    </>
                )

            case 'workflow_mystep_onward_WorkflowEndTime':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label"></label>{item['WorkflowEndTime']}</span>
                    </div>
                )

            case 'workflow_mystep_onward_isWorkflowCompletedStatus':
                return (
                    <div className="form-group">
                        <span className="tb-odr-status">
                            <Badge
                                color={
                                    item['isWorkflowCompletedStatus'] === "Completed"
                                        ? "success"
                                        : item['isWorkflowCompletedStatus'] === "Pending"
                                            ? "warning"
                                            : item['isWorkflowCompletedStatus'] === "Cancelled"
                                                ? "danger"
                                                : "secondary"
                                }
                                className="badge-dot"
                            >
                                {item['isWorkflowCompletedStatus']}

                            </Badge>
                        </span>

                        {item['WorkflowEndTime'] != '-' &&
                            <span className="sub-text"><label className="form-label">At:&nbsp;&nbsp; </label>
                                {item['WorkflowEndTime']}
                            </span>
                        }
                    </div>
                )
            case 'workflow_mystep_onward_updatedAt':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">Updated On:&nbsp;&nbsp; </label>{item.updatedAt ? item.updatedAt : '-'}</span>
                        <span className="sub-text"><label className="form-label">Updated By :&nbsp;&nbsp; </label>{item.updatedBy || '-'}</span>

                        {/* <p>{item.type}</p> */}
                    </div>
                )

            //workflow - myownstep
            case 'workflow_myownstep_document':
                return (
                    <div className="form-group">
                        {item.Actions.status ?
                            <span className="sub-text" onClick={() => navigate(`${item.Actions.link}`)} >{item.docName} &nbsp; {item?.versionNo && <Badge className="badge-outline" pill color="primary">v{item.versionNo}</Badge>}</span>
                            :
                            <span className="sub-text">{item.docName} &nbsp; {item?.versionNo && <Badge className="badge-outline" pill color="primary">v{item.versionNo}</Badge>}</span>

                        }
                        <span className="sub-text"><label className="form-label">Type:&nbsp;&nbsp; </label> {item.type}</span>
                    </div>
                )
            case 'workflow_myownstep_owner':
                return item.owner_of_doc

            case 'workflow_myownstep_workflow_start_time':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">By:&nbsp;&nbsp; </label>{item.owner_of_doc}</span>
                        <span className="sub-text"><label className="form-label">At:&nbsp;&nbsp; </label>{item.workflow_start_time}</span>
                    </div>
                )

            case 'workflow_myownstep_current_step_name':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">Name:&nbsp;&nbsp; </label>{item.current_step.name}</span>
                        <span className="sub-text"><label className="form-label">Status:&nbsp;&nbsp; </label>{item.current_step.status}</span>
                        {typeof item.current_step?.access != undefined && item.current_step.access?.length > 0 &&
                            <span className="d-flex sub-text"><label className="form-label">Collaborator{item?.current_step.access?.length > 1 && 's'}:&nbsp;&nbsp; </label>
                                <div className="user-avatar-group" onClick={() => printGroupMembersModal(item.current_step?.access)}>
                                    {item.current_step?.access.length <= 4 ? item.current_step?.access.slice(0, 4).map((member, index) =>
                                        <div key={index} className="user-avatar xs members_avatar">
                                            {member.profileImg ?
                                                <img src={member.profileImg} alt="" /> :
                                                <span>{member.username.charAt(0).toUpperCase()}</span>
                                            }
                                        </div>
                                    ) : item.current_step?.access.slice(0, 3).map((member, index) =>
                                        <div key={index} className="user-avatar xs members_avatar">
                                            {member.profileImg ?
                                                <img src={member.profileImg} alt="" /> :
                                                <span>{member.username.charAt(0).toUpperCase()}</span>
                                            }
                                        </div>
                                    )}
                                    {item.current_step?.access.length > 4 &&
                                        <div className="user-avatar xs members_avatar">
                                            <span>{item.current_step?.access.length - 3}+</span>
                                        </div>
                                    }
                                </div>
                            </span>
                        }
                    </div>
                )

            case 'workflow_myownstep_due_date':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">Initiated At:&nbsp;&nbsp; </label>{item.current_step.startDate}</span>
                        <span className="sub-text"><label className="form-label">Due On:&nbsp;&nbsp; </label>{item.current_step.endDate}</span>
                    </div>
                )


            case 'workflow_myownstep_actions':
                return (
                    <div style={{ display: "flex" }}>
                        <span onClick={() => onEyeClick(item)}    >
                            <TooltipComponent
                                tag="a"
                                containerClassName="btn btn-trigger btn-icon"
                                id={"view" + item?.workflowHistoryId}
                                icon="eye-fill"
                                direction="top"
                                text="View Activities"
                            />
                        </span>
                        {item.Actions.status &&
                            <span onClick={() => navigate(`${item.Actions.link}`)} >
                                <TooltipComponent
                                    tag="a"
                                    containerClassName="btn btn-trigger btn-icon"
                                    id={"action" + item?.workflowHistoryId}
                                    icon="external"
                                    direction="top"
                                    text="Action Page"

                                />
                            </span>
                        }
                    </div>
                )
            case 'workflow_myownstep_progress':
                return (
                    <>
                        {item['Progress']['show']}
                        <Progress className="progress-lg" animated value={item.Progress.barcnt} color="success">
                            {item.Progress.barcnt.toFixed(0)}%
                        </Progress>
                    </>
                )

            case 'workflow_myownstep_latest_approver':
                return item.Latest_Approver

            case 'workflow_myownstep_WorkflowEndTime':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label"></label>{item['WorkflowEndTime']}</span>
                    </div>
                )

            case 'workflow_myownstep_isWorkflowCompletedStatus':
                return (
                    <div className="form-group">
                        <span className="tb-odr-status">
                            <Badge
                                color={
                                    item['isWorkflowCompletedStatus'] === "Completed"
                                        ? "success"
                                        : item['isWorkflowCompletedStatus'] === "Pending"
                                            ? "warning"
                                            : item['isWorkflowCompletedStatus'] === "Cancelled"
                                                ? "danger"
                                                : "secondary"
                                }
                                className="badge-dot"
                            >
                                {item['isWorkflowCompletedStatus']}

                            </Badge>
                        </span>

                        {item['WorkflowEndTime'] != '-' &&
                            <span className="sub-text"><label className="form-label">At:&nbsp;&nbsp; </label>
                                {item['WorkflowEndTime']}
                            </span>
                        }
                    </div>
                )
            case 'workflow_myownstep_updatedAt':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">Updated On:&nbsp;&nbsp; </label>{item.updatedAt ? item.updatedAt : '-'}</span>
                        <span className="sub-text"><label className="form-label">Updated By :&nbsp;&nbsp; </label>{item.updatedBy || '-'}</span>

                        {/* <p>{item.type}</p> */}
                    </div>
                )



            //Workflow Pendings - myapprovals
            case 'workflow_owner':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">By:&nbsp;&nbsp; </label>{item.owner_of_doc}</span>
                        <span className="sub-text"><label className="form-label">At:&nbsp;&nbsp; </label>{item.workflow_start_time}</span>
                    </div>
                )

            case 'workflow_isWorkflowCompletedStatus':
                return (
                    <div className="form-group">
                        <span className="tb-odr-status">
                            <Badge
                                color={
                                    item['isWorkflowCompletedStatus'] === "Completed"
                                        ? "success"
                                        : item['isWorkflowCompletedStatus'] === "Pending"
                                            ? "warning"
                                            : item['isWorkflowCompletedStatus'] === "Cancelled"
                                                ? "danger"
                                                : "secondary"
                                }
                                className="badge-dot"
                            >
                                {item['isWorkflowCompletedStatus']}

                            </Badge>
                        </span>

                        {item['WorkflowEndTime'] != '-' &&
                            <span className="sub-text"><label className="form-label">At:&nbsp;&nbsp; </label>
                                {item['WorkflowEndTime']}
                            </span>
                        }
                    </div>
                )

            case 'workflow_progress':
                return (
                    <>

                        {typeof item['Progress'] !== "undefined" && item['Progress']['show']}
                        <Progress className="progress-lg" animated value={item.Progress.barcnt} color="success">
                            {item.Progress.barcnt.toFixed(0)}%
                        </Progress>
                    </>
                )

            case 'workflow_actions':
                return (
                    <>
                        <div style={{ display: "flex" }}>
                            <span onClick={() => onEyeClick(item)}>
                                <TooltipComponent
                                    tag="a"
                                    containerClassName="btn btn-trigger btn-icon"
                                    id={"view" + item?.workflowHistoryId}
                                    icon="eye-fill"
                                    direction="top"
                                    text="View Activities"
                                />
                            </span>

                            <span onClick={() => onRowClick(item['type'], item['fileId'], item['role'], item['historyId'])}>
                                <TooltipComponent
                                    tag="a"
                                    containerClassName="btn btn-trigger btn-icon"
                                    id={"action" + item?.historyId}
                                    icon="external"
                                    direction="top"
                                    text="Action Page"
                                />
                            </span>
                        </div>


                    </>
                )
            case 'fileName':
                return item.fileName
            // return (
            //     <div className="form-group">
            //         <span className="sub-text">{item.fileName} &nbsp; {item?.versionNo && <Badge className="badge-outline" pill color="primary">v{item.versionNo}</Badge>}</span>
            //         <span className="sub-text"><label className="form-label">Type:&nbsp;&nbsp; </label> {item.type}</span>
            //     </div>
            // )
            case 'role':
                return item.role
            case 'type':
                return item.type
            case 'stepName':
                return item.stepName
            case 'stepStartedAt':
                return item.stepStartedAt
            case 'dueDate':
                return item.dueDate

            case 'workflow_document':
                return (
                    <div className="form-group">
                        <span className="sub-text" onClick={() => onRowClick(item['type'], item['fileId'], item['role'], item['historyId'])}>{item.fileName} &nbsp; {item?.versionNo && <Badge className="badge-outline" pill color="primary">v{item.versionNo}</Badge>}</span>
                        <span className="sub-text"><label className="form-label">Type:&nbsp;&nbsp; </label> {item.type}</span>
                    </div>
                )

            case 'workflow_workflowName':
                return (
                    <div className="form-group">
                        <span className="sub-text">{item.workflowName}</span>
                        <span className="sub-text">&nbsp;</span>

                    </div>
                )
            case 'workflow_stepName':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">Name:&nbsp;&nbsp; </label>{item.stepName}</span>
                        <span className="sub-text"><label className="form-label">Status:&nbsp;&nbsp; </label>{item.stepStatus}</span>
                        {typeof item?.stepAccess != undefined && item?.stepAccess?.length > 0 &&
                            <span className="d-flex sub-text"><label className="form-label">Collaborator{item?.stepAccess?.length > 1 && 's'}:&nbsp;&nbsp; </label>
                                <div className="user-avatar-group" onClick={() => printGroupMembersModal(item?.stepAccess)}>
                                    {item.stepAccess.length <= 4 ? item.stepAccess.slice(0, 4).map((member, index) =>
                                        <div key={index} className="user-avatar xs members_avatar">
                                            {member?.profileImg ?
                                                <img src={member?.profileImg} alt="" /> :
                                                <span>{member?.username?.charAt(0).toUpperCase()}</span>
                                            }
                                        </div>
                                    ) : item.stepAccess.slice(0, 3).map((member, index) =>
                                        <div key={index} className="user-avatar xs members_avatar">
                                            {member.profileImg ?
                                                <img src={member?.profileImg} alt="" /> :
                                                <span>{member?.username?.charAt(0).toUpperCase()}</span>
                                            }
                                        </div>
                                    )}
                                    {item?.stepAccess.length > 4 &&
                                        <div className="user-avatar xs members_avatar">
                                            <span>{item?.stepAccess.length - 3}+</span>
                                        </div>
                                    }
                                </div>
                            </span>
                        }
                    </div>
                )

            case 'workflow_workflowDate':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">Initiated At:&nbsp;&nbsp; </label>{item.stepStartedAt}</span>
                        <span className="sub-text"><label className="form-label">Due On:&nbsp;&nbsp; </label>{item.dueDate}</span>
                        {/* <p>{item.type}</p> */}
                    </div>
                )

            case 'workflow_updatedAt':
                return (
                    <div className="form-group">
                        <span className="sub-text"><label className="form-label">Updated On:&nbsp;&nbsp; </label>{item.updatedAt ? item.updatedAt : '-'}</span>
                        <span className="sub-text"><label className="form-label">Updated By :&nbsp;&nbsp; </label>{item.updatedBy || '-'}</span>

                        {/* <p>{item.type}</p> */}
                    </div>
                )

            case 'stepStatus':
                return (
                    <>
                        {item['stepStatus'] == 'YTS' && <span>Yet to Start</span>}
                        {item['stepStatus'] == 'IP' && <span>In Progress</span>}
                        {item['stepStatus'] == 'Completed' && <span>Completed</span>}
                    </>
                )

            //workflow Versions Table
            case 'version':
                return (
                    <>
                        {item?.userHasAccessToViewStep ? (
                            <a
                                href={`#/${localStorage.getItem("workspace_id")}/workflow/detail/${item?.['data']?.['fileId'] != undefined ? 'File' : 'Form'
                                    }/${item?.['data']?.['fileId'] != undefined ? item['data']['fileId'] : item['data']['formId']
                                    }/${item.data._id.toString()}`}
                            >
                                v{item.version}{item?.['data']?.isCancelled == false ? (<>{" "}<Icon name="external-alt" /></>) : null}
                            </a>
                        ) : (
                            <>v{item.version}</>
                        )}
                    </>
                )

            case 'stepVersionStartedAt':
                return item.stepVersionStartedAt
            case 'stepVersionStartedBy':
                return item.stepVersionStartedBy ? item.stepVersionStartedBy : '-'
            case 'stepVersionEndedAt':
                return item.stepVersionEndedAt ? item.stepVersionEndedAt : '-'
            case 'stepVersionEndedBy':
                return item.stepVersionEndedBy ? item.stepVersionEndedBy : '-'
            case 'currentStepStatus':
                return (
                    <>
                        {item.currentStepStatus == 'YTS'
                            ? 'Yet To Start' :
                            item.currentStepStatus == 'IP'
                                ? 'In Progress' : item.currentStepStatus}
                    </>
                )
            case 'stepVersionStatus':
                return (
                    <Badge
                        className="badge-sm badge-dim d-none d-md-inline-flex"
                        color={`outline-${item.stepVersionStatus.toLowerCase() == "completed"
                            ? "success"
                            : (item.stepVersionStatus.toLowerCase() == "rejected" || item.stepVersionStatus.toLowerCase() == "cancelled")
                                ? "danger"
                                : "info"
                            }`}
                    >
                        {item.stepVersionStatus}
                    </Badge>
                )


            //meta
            case 'name':
                return item.name

            case 'desc':
                return item.desc

            case 'type':
                return item.type

            case 'options':
                return (
                    <>
                        {item.options.length == 0 ? '-' :
                            <div>
                                {item.options.map(val => (<span>{val + " "}</span>))}
                            </div>
                        }
                    </>
                )

            default:
                return '-'
        }
    }


    return (
        <Block>
            <DataTable className="card-stretch table-box">
                <div className="card-inner position-relative card-tools-toggle">
                    <div className="card-title-group">
                        <div className="card-tools">
                            <div className="form-inline flex-nowrap gx-3">
                            </div>
                        </div>
                        <div className="card-tools me-n1">
                            <ul className="btn-toolbar gx-1">
                                <li>
                                    <a
                                        href="#search"
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            toggle();
                                        }}
                                        className="btn btn-icon search-toggle toggle-search"
                                    >
                                        <Icon name="search"></Icon>
                                    </a>
                                </li>
                                <li className="btn-toolbar-sep"></li>
                                <li>
                                    <div className="toggle-wrap">
                                        <Button
                                            className={`btn-icon btn-trigger toggle ${tablesm ? "active" : ""}`}
                                            onClick={() => updateTableSm(true)}
                                        >
                                            <Icon name="menu-right"></Icon>
                                        </Button>
                                        <div className={`toggle-content ${tablesm ? "content-active" : ""}`}>
                                            <ul className="btn-toolbar gx-1">
                                                <li className="toggle-close">
                                                    <Button className="btn-icon btn-trigger toggle" onClick={() => updateTableSm(false)}>
                                                        <Icon name="arrow-left"></Icon>
                                                    </Button>
                                                </li>
                                                <li>{filterComp} </li>
                                                <li>
                                                    <UncontrolledDropdown>
                                                        <DropdownToggle color="tranparent" className="btn btn-trigger btn-icon dropdown-toggle">
                                                            <Icon name="setting"></Icon>
                                                        </DropdownToggle>
                                                        <DropdownMenu end className="dropdown-menu-xs">
                                                            <ul className="link-check">
                                                                <li>
                                                                    <span>Show</span>
                                                                </li>
                                                                <li className={itemPerPage === 10 ? "active" : ""}>
                                                                    <DropdownItem
                                                                        tag="a"
                                                                        href="#dropdownitem"
                                                                        onClick={(ev) => {
                                                                            ev.preventDefault();
                                                                            setCurrentPage(1)
                                                                            setItemPerPage(10);
                                                                        }}
                                                                    >
                                                                        10
                                                                    </DropdownItem>
                                                                </li>
                                                                <li className={itemPerPage === 15 ? "active" : ""}>
                                                                    <DropdownItem
                                                                        tag="a"
                                                                        href="#dropdownitem"
                                                                        onClick={(ev) => {
                                                                            ev.preventDefault();
                                                                            setCurrentPage(1)
                                                                            setItemPerPage(15);
                                                                        }}
                                                                    >
                                                                        15
                                                                    </DropdownItem>
                                                                </li>
                                                                <li className={itemPerPage === 20 ? "active" : ""}>
                                                                    <DropdownItem
                                                                        tag="a"
                                                                        href="#dropdownitem"
                                                                        onClick={(ev) => {
                                                                            ev.preventDefault();
                                                                            setCurrentPage(1)
                                                                            setItemPerPage(20);
                                                                        }}
                                                                    >
                                                                        20
                                                                    </DropdownItem>
                                                                </li>
                                                                <li className={itemPerPage === 25 ? "active" : ""}>
                                                                    <DropdownItem
                                                                        tag="a"
                                                                        href="#dropdownitem"
                                                                        onClick={(ev) => {
                                                                            ev.preventDefault();
                                                                            setCurrentPage(1)
                                                                            setItemPerPage(25);
                                                                        }}
                                                                    >
                                                                        25
                                                                    </DropdownItem>
                                                                </li>
                                                            </ul>
                                                        </DropdownMenu>
                                                    </UncontrolledDropdown>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className={`card-search search-wrap ${!onSearch && "active"}`}>
                        <div className="card-body">
                            <div className="search-content">
                                <Button
                                    className="search-back btn-icon toggle-search active"
                                    onClick={() => {
                                        toggle();
                                    }}
                                >
                                    <Icon name="arrow-left"></Icon>
                                </Button>
                                <input
                                    type="text"
                                    className="border-transparent form-focus-none form-control"
                                    placeholder={placeholder}
                                    value={onSearchText}
                                    onChange={(e) => onSearchChange(e)}
                                />
                                <Button className="search-submit btn-icon">
                                    <Icon name="search"></Icon>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="datatable-class">
                    <DataTableBody>
                        {/* head */}
                        <DataTableHead>
                            {columns.filter(item => item['show']).map((item) => (
                                <DataTableRow>
                                    <h2
                                        className="sub-text"
                                        size="lg"
                                        onClick={() => {
                                            if (item.sort) {
                                                setSort(prev => {
                                                    const newSort = !prev
                                                    sortData(item.name, newSort)
                                                    return newSort
                                                })
                                            }
                                        }}
                                    >
                                        {item.label}
                                        {item.sort && (
                                            item.sortOrder === 0 ? (
                                                <span className="custom-sort">
                                                    <span>&darr;</span>
                                                    <span>&uarr;</span>
                                                </span>
                                            ) : (
                                                <span className="custom-sort">
                                                    {item.sortOrder === 1 && <span>&darr;</span>}
                                                    {item.sortOrder === -1 && <span>&uarr;</span>}
                                                </span>
                                            )
                                        )}

                                    </h2>

                                </DataTableRow>
                            ))}
                            <DataTableRow className="nk-tb-col-tools text-end">
                                <UncontrolledDropdown>
                                    {/* <DropdownToggle
                                    color="tranparent"
                                    className="btn btn-xs btn-outline-light btn-icon dropdown-toggle"
                                >
                                    <Icon name="plus"></Icon>
                                </DropdownToggle> */}

                                    <DropdownMenu end className="dropdown-menu-xs">
                                        <ul className="link-tidy sm no-bdr">
                                            {extraColumns.map((item) =>
                                                <li>
                                                    <div className="custom-control custom-control-sm custom-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            id={`${item.label}`}
                                                            className="custom-control-input"
                                                            onChange={() => extraToggleChecked(item.name, item.label)}
                                                            checked={item.checked}
                                                            value={item.checked}
                                                        />
                                                        <label className="custom-control-label" htmlFor={`${item.label}`}>
                                                            {item.label}
                                                        </label>
                                                    </div>
                                                </li>
                                            )}
                                        </ul>
                                    </DropdownMenu>

                                </UncontrolledDropdown>
                            </DataTableRow>

                        </DataTableHead>

                        {/* row datas */}
                        {data['data']?.length > 0
                            ? data['data']?.map((item) => {
                                return (
                                    <DataTableItem key={item._id}>

                                        {columns.map(column => (
                                            <>
                                                {column['clickable'] == undefined ?
                                                    <>
                                                        {column['show'] &&
                                                            <DataTableRow size="mb">
                                                                <span className="datatable-column-custom sub-text" size="lg">
                                                                    {getColumns(item, column.name)}
                                                                </span>
                                                            </DataTableRow>
                                                        }
                                                    </> :
                                                    <>
                                                        {column['show'] &&
                                                            <DataTableRow size="mb">
                                                                <span
                                                                    style={{ cursor: "pointer" }} className="datatable-column-custom sub-text" size="lg">
                                                                    {getColumns(item, column.name)}
                                                                </span>
                                                            </DataTableRow>
                                                        }
                                                    </>
                                                }

                                            </>
                                        ))}

                                        <DataTableRow className="nk-tb-col-tools" >
                                            {op == "WorkflowVersions" ?
                                                <ul className="nk-tb-actions gx-1">
                                                    {privilege['deleteAccess'] &&
                                                        <li className="nk-tb-action-hidden"
                                                            onClick={() =>
                                                                suspendUser(item)
                                                            }
                                                        >
                                                            <TooltipComponent
                                                                tag="a"
                                                                containerClassName="bg-white btn btn-sm btn-outline-light btn-icon btn-tooltip"
                                                                id={"details" + item['_id']}
                                                                icon={"eye"}
                                                                direction="top"
                                                                // text={item['isActive'] ? "Delete" : "Restore"}
                                                                text={"Details"}
                                                            />
                                                        </li>
                                                    }
                                                </ul>
                                                :
                                                <>
                                                    {op == 'workflowPendings' ||
                                                        op == 'workflowMyStepOnwardsHistory' || op == 'workflowownerHistory' ?
                                                        <></>
                                                        :
                                                        <ul className="nk-tb-actions gx-1">
                                                            {editAccess &&
                                                                <li className="nk-tb-action-hidden"
                                                                    onClick={() => onEditClick(item['_id'], item)}
                                                                >
                                                                    <TooltipComponent
                                                                        tag="a"
                                                                        containerClassName="btn btn-trigger btn-icon"
                                                                        id={"edit" + item['_id']}
                                                                        icon="edit-alt-fill"
                                                                        direction="top"
                                                                        text="Edit"
                                                                    />
                                                                </li>
                                                            }
                                                            {deleteAccess &&
                                                                <li className="nk-tb-action-hidden"
                                                                    onClick={() =>
                                                                        suspendUser(item['_id'])
                                                                    }
                                                                >
                                                                    <TooltipComponent
                                                                        tag="a"
                                                                        containerClassName="btn btn-trigger btn-icon"
                                                                        id={"suspend" + item['_id']}
                                                                        icon={item['isActive'] ? "user-cross-fill" : "user-add-fill"}
                                                                        direction="top"
                                                                        text={item['isActive'] ? "Delete" : "Restore"}
                                                                    />
                                                                </li>
                                                            }


                                                            <li>
                                                                <UncontrolledDropdown>
                                                                    {(editAccess || deleteAccess) && <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon btn-trigger">
                                                                        <Icon name="more-h"></Icon>
                                                                    </DropdownToggle>}
                                                                    <DropdownMenu end>
                                                                        <ul className="link-list-opt no-bdr">
                                                                            {editAccess &&
                                                                                <li onClick={() => onEditClick(item['_id'], item)}>
                                                                                    <DropdownItem
                                                                                        tag="a"
                                                                                        href="#edit"
                                                                                        onClick={(ev) => {
                                                                                            ev.preventDefault();
                                                                                        }}
                                                                                    >
                                                                                        <Icon name="edit"></Icon>
                                                                                        <span>Edit</span>
                                                                                    </DropdownItem>
                                                                                </li>
                                                                            }
                                                                            {deleteAccess && (
                                                                                <React.Fragment>
                                                                                    <li className="divider"></li>
                                                                                    <li
                                                                                        onClick={() => suspendUser(item['_id'])}
                                                                                    >
                                                                                        <DropdownItem
                                                                                            tag="a"
                                                                                            href="#suspend"
                                                                                            onClick={(ev) => {
                                                                                                ev.preventDefault();
                                                                                            }}
                                                                                        >
                                                                                            <Icon name="na"></Icon>
                                                                                            <span>{deleteText}</span>
                                                                                        </DropdownItem>
                                                                                    </li>
                                                                                </React.Fragment>
                                                                            )}
                                                                        </ul>
                                                                    </DropdownMenu>
                                                                </UncontrolledDropdown>
                                                            </li>
                                                        </ul>
                                                    }
                                                </>

                                            }

                                        </DataTableRow>
                                    </DataTableItem>
                                );
                            })
                            : null}
                    </DataTableBody>
                </div>
                <div className={"card-inner" + (data['data']?.length > 0 ? ' floatright' : '')}>
                    {data['data']?.length > 0 ? (
                        <PaginationComponent
                            itemPerPage={data['perPage']}
                            totalItems={data['totalCount']}
                            paginate={handlePagination}
                            currentPage={data['currentPage']}
                        />
                    ) : (
                        <div className="text-center">
                            <span className="text-silent">No data found</span>
                        </div>
                    )}
                </div>
            </DataTable>

            <Modal isOpen={showGroupModal} size="sm" toggle={toggleGroupMemberModal}>
                <GroupMembers members={groupMembers} toggle={toggleGroupMemberModal} />
            </Modal>
        </Block >
    )
}

export default Table