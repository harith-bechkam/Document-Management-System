import { useEffect, useRef, useState } from "react";
import {
    Block,
    BlockTitle,
    Button,
    Icon,
    ReactDataTable,
    Row,
    UserAvatar,
} from "../../../../components/Component"
import FilesBody from "../components/Body"
import FileManagerLayout from "../components/Layout"
import { Badge, Breadcrumb, BreadcrumbItem, Card, Modal, ModalBody, Tooltip } from "reactstrap";
import * as API from '../../../../utils/API';
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import { saveDirectory, saveSearchDirectory, saveWorkflowCurrClickedItem, triggerOpenGraphArgs, updateLoaderFlag, updateMoveFlag } from "../../../../redux/folderSlice";
import toast, { Toaster } from "react-hot-toast";
import Head from "../../../../layout/head/Head";
import Content from "../../../../layout/content/Content";
import MetaDataForm from "../components/MultiStep/MetaDataForm";
import CustomMetaData from "../../../admin/MetaData/Modals/CustomMetaData";
import Filter3 from "../../../../components/Filter/Filter3";
import UploadVersion from "./UploadVersion";
import { useSelector } from "react-redux";
import { userTimezone } from "../../../../utils/Utils";
import WorkflowVersion from "./WorkflowVersion";
import { CardTitle } from "reactstrap";
import FormRevisionHistories from "../modals/FormReportModal";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Swal from "sweetalert2";
import { Lightbox } from "react-modal-image";
import Viewer from "../modals/Viewer";
import { getFileType } from "../../../../utils/helper";
import OpenGraphMeta from "../../../../layout/OpenGraph";
import Reports from "./Reports";

const Details = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const moveFlag = useSelector(state => state.folders.moveFlag);
    const params = useParams();

    const [directoryPath, setDirectoryPath] = useState([]);
    const [directoryPathSection, setDirectoryPathSection] = useState({})
    const [DetailsData, setDetailsData] = useState({})
    const [currentPage, setCurrentPage] = useState(1)
    const [searchText, setSearchText] = useState("")
    const [rowsPerPageS, setRowsPerPage] = useState(10)
    const [modal, setModal] = useState(false);

    //DefaultMetaFields
    const [docNum, setDocNum] = useState('')
    const [notes, setNotes] = useState('')
    const [docTypeData, setDocTypeData] = useState([])
    const [secdocTypeData, setSecDocTypeData] = useState([])

    const [keywordsData, setKeywordsData] = useState([])
    const [docTypeOptionsData, setDocTypeOptionsData] = useState([])
    const [secdocTypeOptionsData, setsecDocTypeOptionsData] = useState([])

    const [keywordOptionsData, setKeywordOptionsData] = useState([]);
    const [uploadModal, setUploadModal] = useState(false);
    const [revisionModal, setRevisionModal] = useState(false);
    const [revisionInputDatas, setRevisionInputDatas] = useState(null)

    //customMetaFields
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [customMetaDataOptions, setCustomMetaDataOptions] = useState([])
    const [selectedMetaDataOptions, setSelectedMetaDataOptions] = useState([])
    const [customMetaData, setCustomMetaData] = useState({})

    const [customMetaModal, setCustomMetaModal] = useState(false)

    const [modalTab, setModalTab] = useState("1");
    const [documentid, setDocumentid] = useState('')
    const [activityData, setActivityData] = useState([])
    const [revisionData, setRevisionData] = useState([])
    const [submissionData, setSubmissionData] = useState([])

    const [showRevisionHistoryTav, setShowRevisionHistoryTab] = useState(false);
    const [showSubmissionTab, setShowSubmissionTab] = useState(false);

    const [formObject, setFormObject] = useState({});
    const [formViewAccess, setFormViewAccess] = useState(false);
    const [formEditAccess, setFormEditAccess] = useState(false);
    const [formCreateAccess, setFormCreateAccess] = useState(false);
    const [formDeleteAccess, setFormDeleteAccess] = useState(false);
    const [formReportAccess, setFormReportAccess] = useState(false);
    const [documentDetails, setDocumentDetails] = useState({})

    const formSubmittedFlag = useSelector(state => state.folders.formSubmitted);
    const auditLogRef = useRef(null);

    const [updatePage, setUpdatePage] = useState(false);

    // this state is for the history canvas
    const [reportModal, setReportModal] = useState(false);
    const [workflowHistoryModal, setWorkflowHistoryModal] = useState(false);

    // this state is for the full screen report modal
    const [pivotReportModal, setPivotReportModal] = useState(false);

    const togglePivotReportModal = () => {
        setPivotReportModal(!pivotReportModal);
    }

    const currentAccessedDirectory = useSelector(state => state.folders.accessedDrive);

    const [activeTab, setActiveTab] = useState('Steps');
    const [isShared, setIsShared] = useState(false);

    const [activityOptions, setActivityOptions] = useState([{
        value: 'Upload',
        label: 'Upload'
    }, {
        value: 'Copy',
        label: 'Copy'
    }, {
        value: 'Move',
        label: 'Move'
    }, {
        value: 'Rename',
        label: 'Rename'
    }, {
        value: 'Share',
        label: 'Share'
    }])
    const [filter, setFilter] = useState({
        activity: null,
    })

    const [workflowEnableBtn, setWorkflowEnableBtn] = useState(false)
    const [workfloweBtns, setWorkflowBtns] = useState(false)
    const [lastRevisionNo, setLastRevisionNo] = useState('-')

    useEffect(() => {
        if (!location) return

        const pathname = location.pathname
        const detailsRegex = /^\/details\/([a-fA-F0-9]{24})$/
        const detailsMatched = detailsRegex.exec(pathname)

        if (detailsMatched) {
            // getPath(detailsMatched[1])
            const documentId = detailsMatched[1]

            const fetchData = async () => {
                try {
                    let detailsValue = await fetchDetails(documentId)

                    getPath(detailsMatched[1], detailsValue)
                    await checkWorkflowBtns(detailsValue)
                    let { status, message, lastRevisionNo } = await checkBeforeEnableThisBtn(detailsValue['data']['_id'], detailsValue['type'])
                    setLastRevisionNo(lastRevisionNo)



                    if (message == "File is not inside Workflow!") {
                        setWorkflowEnableBtn(false)
                    }
                    else {
                        setWorkflowEnableBtn(true)

                    }

                    setDocumentid(documentId)

                    fetchActivityData('', '', documentId)


                    if (detailsValue && detailsValue['type'] !== 'form') {
                        fetchRevisionData('', '', documentId)
                    }

                    if (detailsValue && detailsValue['type'] == 'form') {
                        setModalTab('3')
                        await fetchSubmissionsData('', '', documentId, detailsValue)
                    }
                }
                catch (error) {
                    console.error(error)
                }
            }

            fetchData()
        }
    }, [location, currentPage, rowsPerPageS, moveFlag, updatePage])


    const checkWorkflowBtns = async (data) => {

        let base = data && (data['type'] == 'file' || data['type'] == 'form') && data['data']['owner'] == localStorage.getItem('userId')
        if (base) {
            setWorkflowBtns(true)
            return
        }

        if (data && (data['type'] == 'folder')) {
            setWorkflowBtns(false)
            return
        }
        else {
            //shared
            const checkShareWithUsers = async (detail) => {

                return detail['data']['sharedWith']['users'].some(item => item['user'] == localStorage.getItem('userId') && item['access'].includes('edit'))
            }

            function checkUserInGroup(respoData, groups, userId) {
                for (const group of respoData) {
                    if (groups.includes(group._id)) {
                        const hasUser = group.members.some(member => member.userId == userId)

                        if (hasUser) {
                            return true
                        }
                    }
                }
                return false
            }

            const checkShareWithUsersGroup = async (detail) => {
                let groups = []

                if (detail['data']['sharedWith']['userGroups'].length != 0) {
                    groups = detail['data']['sharedWith']['userGroups'].map(item => {
                        if (item['access'].toLowerCase() == 'edit') {
                            return item.group
                        }
                    })
                }

                const respo = await API.getAllUserGroups()

                if (respo['status']) {
                    return checkUserInGroup(respo['data'], groups, localStorage.getItem('userId'))
                }
                else {
                    toast.error(`Error While fetching Data in User Groups`)
                    return false
                }

            }


            let bool = await checkShareWithUsers(data) || await checkShareWithUsersGroup(data)
            setWorkflowBtns(bool)
        }

    }



    const toggleUploadModal = async () => {
        setUploadModal(!uploadModal);
    };

    // reponse history states

    const [responseHistory, setResponseHistory] = useState([]);
    const [backUpResponseHistory, setBackUpResponseHistory] = useState([])
    const [fieldnameOptions, setFieldnameOptions] = useState([]);
    const [selectedFiledNames, setSelectedFieldnames] = useState([]);
    const [selectedUsers, setSelectedusers] = useState([]);
    const [userNameOptions, setUserNameOptions] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [imageFlag, setImageFlag] = useState(false);
    const [imageFile, setImageFile] = useState({})
    const [viewDoc, setViewDoc] = useState({})
    const [codeContent, setCodeContent] = useState('')
    const [viewerModal, setViewerModal] = useState(false);

    const toggleRevisionModal = async () => {
        setRevisionModal(!revisionModal);
    };

    const toggleViewerModal = () => {
        setViewerModal(!viewerModal);
    };

    const toggleWorkfloHistoryModal = async () => {
        setWorkflowHistoryModal(!workflowHistoryModal)
    }

    const [tooltipOpen, setTooltipOpen] = useState({});
    const toolTipToggle = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const toggleReportModal = async () => {
        setReportModal(!reportModal);
    }

    const showhistoryinfo = async (submissionid) => {
        toggleReportModal();
        const formResponse = await API.getForm(documentid);
        const temp = [];
        for (let key in formResponse.data.templateSchema[0]) {
            formResponse.data.templateSchema.forEach(elem => {
                temp.push({
                    label: elem.label,
                    value: elem.id,
                    type: elem.element
                })
            })
        }
        // for (let key in formResponse.data.templateSchema[0]) {
        //     formResponse.data.templateSchema[0][key]["task_data"].forEach(elem => {
        //         formResponse.data.templateSchema.forEach(elem => {
        //             temp.push({
        //                 label: elem.label,
        //                 value: elem.id,
        //                 type: elem.element
        //             })
        //         })
        //     })
        // }
        setFieldnameOptions(temp)
        if (!formResponse.status) {
            return toast.error('could not get form'.replace(/\b\w/g, char => char.toUpperCase()));
        }
        const historyResponse = await API.getFormResponseHistory(documentid, submissionid);
        if (!historyResponse.status) {
            return toast.error('could not get history'.replace(/\b\w/g, char => char.toUpperCase()));
        }

        const arr = [];

        historyResponse.data.forEach(elem => {
            const actArr = [];
            elem.activity.forEach(item => {
                actArr.push({
                    img: item.img,
                    name: item.user,
                    userId: item.userId,
                    fieldtype: item.fieldtype,
                    fieldlabel: item.fieldlabel,
                    fieldId: item.fieldId,
                    description: item.description,
                    currentValue: item.currentValue,
                    previousValue: item.previousValue,
                    time: item.time,
                    activity: item.previousValue
                        ? (
                            item.currentValue === ""
                                ? (
                                    <span>
                                        <span style={{ color: 'red' }}>Removed</span> <b>{item.fieldlabel}</b>
                                    </span>
                                )
                                : (
                                    <span>
                                        Changed <b>{item.fieldlabel}</b> from <span style={{ color: 'red' }}>{item.previousValue}</span> to <span style={{ color: 'blue', textDecoration: 'underline' }}>{item.currentValue}</span>
                                    </span>
                                )
                        )
                        : (
                            item.currentValue === ""
                                ? (
                                    <span>
                                        Removed initial value from <b>{item.fieldlabel}</b>
                                    </span>
                                )
                                : (
                                    <span>
                                        Added {item.currentValue} at <b>{item.fieldlabel}</b>
                                    </span>
                                )
                        ),
                });
            })
            arr.push({
                timeAgo: elem.time,
                activity: actArr
            })
        });
        // debugger
        const tempUserArr = [];
        historyResponse.data.forEach(elem => {
            elem.activity.forEach(item => {
                const checkExist = tempUserArr.find(val => val.value == item.userId);
                if (!checkExist)
                    tempUserArr.push({
                        value: item.userId,
                        label: item.name,
                    });
            })
        });
        setBackUpResponseHistory(arr);
        setResponseHistory(arr);
        setUserNameOptions(tempUserArr);
    };

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    function updateHistoryData() {
        let filteredOptionsData = responseHistory;
        let filteredUsersData = responseHistory;

        if (selectedFiledNames.length > 0) {
            filteredOptionsData = responseHistory.filter(item => selectedFiledNames.includes(item.fieldId));
        }

        if (selectedUsers.length > 0) {
            filteredUsersData = responseHistory.filter(item => selectedUsers.includes(item.userId));
        }

        // Combine both filters and remove duplicates
        const combinedFilteredData = [...new Set([...filteredOptionsData, ...filteredUsersData])];

        setResponseHistory(combinedFilteredData);
    }
    function resetHistoryData() {
        setSelectedFieldnames([]);
        setSelectedusers([]);
        setResponseHistory(backUpResponseHistory);
    }


    useEffect(() => {
        toast.remove();
        return () => {
            toast.remove()
        }
    }, [])

    useEffect(() => {
        // if (auditLogRef.current) {
        //     auditLogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // }

        scrollIntoSubmissions()


    }, [])

    async function openSharedFile(fileDetails) {
        const mode = getFileType(fileDetails.fileType)
        if (mode == 'image') {
            setImageFile(fileDetails);
            setImageFlag(true);
        } else if (mode == 'code') {
            const fileResponse = await API.readFile(fileDetails._id);
            if (!fileResponse.status) return toast.error('error reading file'.replace(/\b\w/g, char => char.toUpperCase()));
            setCodeContent(fileResponse.content);
            setViewDoc(fileDetails);
            toggleViewerModal();

        } else {
            setViewDoc(fileDetails);
            toggleViewerModal();

        }
    }

    const getPath = async (pathId, itemData) => {
        if (itemData.data.createdBy == localStorage.getItem('userId')) {
            let pathRespo = await API.getDirectoryPath(pathId);
            if (!pathRespo.status) return toast.error(`path cannot be found! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()));
            dispatch(saveDirectory([...pathRespo.data]));
            localStorage.removeItem('currentBreadCrumb');
            dispatch(saveSearchDirectory([...pathRespo.data]));

            setDirectoryPathSection(pathRespo.data[0]);
            const arr = pathRespo.data;
            arr.shift();
            setDirectoryPath(arr)
        } else {
            setIsShared(true)
            let pathRespo = await API.getSharedWithDirectoryDetailsPath(pathId);
            if (!pathRespo.status) return toast.error(`path cannot be found! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()));
            dispatch(saveDirectory([...pathRespo.data]));
            localStorage.removeItem('currentBreadCrumb');
            dispatch(saveSearchDirectory([...pathRespo.data]));

            setDirectoryPathSection(pathRespo.data[0]);
            const arr = pathRespo.data;
            arr.shift();
            setDirectoryPath(arr)
        }

    }

    async function scrollIntoSubmissions() {
        if (formSubmittedFlag) {
            setModalTab('3')
            if (auditLogRef.current) {
                auditLogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

    }

    async function fetchActivityData(search = "", activity = {}, docId, exportData = false) {
        let searchElem = '';
        if (search) {
            searchElem = search
        }
        if (activity) {
            searchElem = activity.value
        }
        let response = await API.getActivityLog(docId, searchElem, currentPage, rowsPerPageS, exportData)
        if (!exportData) {
            let { status, ...rem } = response
            if (status) {
                setActivityData({
                    activityData: response['data'],
                    ...rem
                })
            }
        }
    }

    async function fetchRevisionData(search = "", activity = {}, docId, exportData = false) {
        let searchElem = '';
        if (search) {
            searchElem = search
        }
        if (activity) {
            searchElem = activity.value
        }
        let response = await API.getRevisionLog(docId, searchElem, currentPage, rowsPerPageS, exportData)
        if (!exportData) {
            if (response) {
                let { status, ...rem } = response
                if (status) {
                    setRevisionData({
                        revisionData: response['data'],
                        ...rem
                    })
                }
            }
        }
    }

    const fetchSubmissionsData = async (search = "", activity = "", docId, detailsValue) => {
        let formSubmissionResponse = await API.getSubmissionDatas(docId, search, currentPage, rowsPerPageS)

        if (!formSubmissionResponse['status'])
            return toast.error(`${formSubmissionResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

        if (formSubmissionResponse) {
            let { status, ...rem } = formSubmissionResponse
            if (status) {

                setSubmissionData({
                    submissionData: formSubmissionResponse['data'],
                    ...rem
                })

                if (detailsValue) {
                    const searchParams = new URLSearchParams(location?.search)
                    const isFormSubmitted = searchParams.get('isFormSubmitted')

                    if (detailsValue?.['type'] == 'form' && detailsValue?.['data']?.['submissionCount'] != 0 && isFormSubmitted == 'true') {
                        dispatch(updateLoaderFlag({ loader: true, text: 'Configuring Workflow' }))
                        await checkAndStartWorkflow(detailsValue?.['data'])
                        dispatch(updateLoaderFlag({ loader: false, text: '' }))
                    }
                }

            }
        }
    }

    async function updateFileVersion(row) {
        dispatch(updateLoaderFlag({ loader: true, text: 'Reverting' }))
        const body = {
            "filename": row.fileStorageInfo["filename"],
            "documentId": row.documentId,
            "revisionNumber": row.fileStorageInfo["revisionNumber"],
            "contentType": row.fileStorageInfo["contentType"],
            "bucket": row.fileStorageInfo["bucket"],
            "etag": row.fileStorageInfo["etag"],
            // "content": row.fileStorageInfo["content"],
            "fileSize": row.fileStorageInfo["fileSize"]
        }
        const revisionRespo = await API.revertVersion(body);
        if (!revisionRespo.status) {
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            return toast.error('File Revision Error');
        }
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        toast.success(`File revised to ${row.fileStorageInfo["filename"]} successfully`)
        window.scrollTo({ top: 0 });
        dispatch(updateMoveFlag({}))
    }

    function revertFormatter(row) {
        if (row.docCurrentRevisionNumber == row.fileStorageInfo["revisionNumber"]) {
            return <span>Current Version</span>
        } else {
            return <div style={{ cursor: 'pointer' }} onClick={() => updateFileVersion(row)}>
                <Icon name={'undo'} id='Revise'></Icon>
                <Tooltip
                    placement="bottom"
                    isOpen={tooltipOpen[`Revise`] || false}
                    target={`Revise`}
                    toggle={() => toolTipToggle(`Revise`)}
                >
                    {'Revise'}
                </Tooltip>
            </div>
        }
    }

    function actionsFormatter(row) {
        let { data } = DetailsData
        let role = localStorage.getItem('role')

        const handleView = (e) => {
            e.preventDefault();
            formRender(row, "ACTIONS", 'view')
        }


        const handleEdit = (e) => {
            e.preventDefault();
            formRender(row, "ACTIONS", 'edit')
        }

        const handleDelete = (e) => {
            e.preventDefault();
            formRender(row, "ACTIONS", 'delete')
        }

        return (
            <div style={{ display: 'flex', cursor: 'pointer' }}>
                <div id='View'>
                    <Icon name="eye" className='mx-2' onClick={handleView} />
                    <Tooltip
                        placement="bottom"
                        isOpen={tooltipOpen[`View`] || false}
                        target={`View`}
                        toggle={() => toolTipToggle(`View`)}
                    >
                        {'View'}
                    </Tooltip>
                </div>
                {/* {(data['isEditResponseAllowed'] || role == "Super Admin") && <Icon name="edit" title='Edit' onClick={handleEdit}></Icon>} */}
                {formEditAccess && <div id="Edit">
                    <Icon name="edit" style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }} onClick={handleEdit}></Icon>
                    <Tooltip
                        placement="bottom"
                        isOpen={tooltipOpen[`Edit`] || false}
                        target={`Edit`}
                        toggle={() => toolTipToggle(`Edit`)}
                    >
                        {'Edit'}
                    </Tooltip>
                </div>}
                {formDeleteAccess && <div id="Delete">
                    <Icon name="trash" style={{ marginLeft: '0.5rem' }} onClick={handleDelete}></Icon>
                    <Tooltip
                        placement="bottom"
                        isOpen={tooltipOpen[`Delete`] || false}
                        target={`Delete`}
                        toggle={() => toolTipToggle(`Delete`)}
                    >
                        {'Delete'}
                    </Tooltip>

                </div>}
                {formReportAccess && <div id='History_Track'>

                    <Icon name="file-text" style={{ marginLeft: '0.5rem' }} onClick={() => showhistoryinfo(row._id.toString())} ></Icon>
                    <Tooltip
                        placement="bottom"
                        isOpen={tooltipOpen[`History_Track`] || false}
                        target={`History_Track`}
                        toggle={() => toolTipToggle(`History_Track`)}
                    >
                        {'History Track'}
                    </Tooltip>
                </div>}
            </div>
        )

    }



    const dataTableColumns = [
        {
            name: "Date",
            selector: (row) => userTimezone(row.date, localStorage.getItem("timeZone")),
            sortable: true,
        },
        {
            name: "User",
            selector: (row) => row.user,
            sortable: true,
        },
        {
            name: "Action",
            selector: (row) => row.action,
            sortable: true,
        },
        {
            name: "Description",
            selector: (row) => row.description,
            sortable: true,
        }
    ]

    const revisionTableColumns = [
        {
            name: "Date",
            selector: (row) => userTimezone(row.date, localStorage.getItem("timeZone")),
            sortable: true,
        },
        {
            name: "Filename",
            selector: (row) => row.fileStorageInfo.filename,
            sortable: true,
        },
        {
            name: "Revert Version",
            selector: revertFormatter,
            sortable: false,
            width: "15%",
            center: true
        }
    ]

    const submissionTableColumns = [
        {
            name: "Submitted Date",
            selector: (row) => userTimezone(row.submittedAt, localStorage.getItem("timeZone")),
            sortable: true,
        },
        {
            name: "Submitted By",
            selector: (row) => row.user,
            sortable: true,
        },
        {
            name: "Actions",
            selector: actionsFormatter,
            sortable: false,
            width: "15%",
            // center: true
        }
    ]

    const onSearchChange = (e) => {
        setSearchText(e.target.value)
        fetchActivityData(e.target.value, filter['activity'], documentid)
    }

    const onSearchChangeRevision = (e) => {
        setSearchText(e.target.value)
        fetchRevisionData(e.target.value, filter['activity'], documentid)
    }

    const onSearchChangeSubmission = (e) => {
        setSearchText(e.target.value)
        fetchSubmissionsData(e.target.value, "", documentid)
    }

    async function getAccess(doc) {
        let editAccess = false;
        let viewAccess = false;
        const userId = localStorage.getItem('userId');
        const memberTeamsResponse = await API.getAllGroupsContainingUser();
        const memberTeams = memberTeamsResponse.data;
        let result = {}
        if (doc?.createdBy == userId) {
            editAccess = true;
        } else if (doc?.sharedWith?.users.some(val => val.user == userId)) {
            const shareStatus = doc?.sharedWith.users.find(val => val.user == userId);
            if (shareStatus.access == 'edit') {
                editAccess = true;
            } else if (shareStatus.access == 'view') {
                viewAccess = true;
            }
        } else {
            const userGroups = memberTeams;
            const sharedUserGroups = doc?.sharedWith?.userGroups || [];
            const isGroupShared = sharedUserGroups.some(group =>
                userGroups.some(userGroup =>
                    userGroup._id?.toString() == group.group?.toString()
                )
            );

            if (isGroupShared) {
                const groupAccess = sharedUserGroups.find(group =>
                    userGroups.some(userGroup =>
                        userGroup._id?.toString() == group?.group?.toString()
                    )
                )?.access;
                if (groupAccess === 'edit') {
                    editAccess = true;
                } else if (groupAccess === 'view') {
                    viewAccess = true;
                }
            }
        }
        result["editAccess"] = editAccess;
        result["viewAccess"] = viewAccess;
        return result;
    }


    const fetchDetails = async (id) => {
        let detailsResponse = await API.getDetails(id)
        setDocumentDetails(detailsResponse.data?.data)

        if (!detailsResponse['data']) {
            toast.error(`Unable to fetch Details from Details API`.replace(/\b\w/g, char => char.toUpperCase()))
            return
        }

        const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const view = urlParams.get('view');

        if (view) {
            if (view == 'true') {
                openSharedFile(detailsResponse.data?.data)
            }
        }

        let showSubmissionBtn = false;

        const mode = getFileType(detailsResponse.data?.data?.fileType)
        if (mode == 'image') {

            dispatch(triggerOpenGraphArgs({
                fileName: detailsResponse.data?.data?.name,
                desc: ``,
                image: `https://vectips.com/wp-content/uploads/2018/12/tutorial-preview-large-1.png`,
                url: `${window.location.origin}/#/${localStorage.getItem("workspace_id")}/details/${params.id}`,
                type: ``
            }))
        } else if (mode == 'code') {
            dispatch(triggerOpenGraphArgs({
                fileName: detailsResponse.data?.data?.name,
                desc: ``,
                image: `https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Visual_Studio_Code_1.35_icon.svg/120px-Visual_Studio_Code_1.35_icon.svg.png`,
                url: `${window.location.origin}/#/${localStorage.getItem("workspace_id")}/details/${params.id}`,
                type: ``
            }))
        } else {
            dispatch(triggerOpenGraphArgs({
                fileName: detailsResponse.data?.data?.name,
                desc: ``,
                image: `https://www.iconpacks.net/icons/2/free-file-icon-1453-thumb.png`,
                url: `${window.location.origin}/#/${localStorage.getItem("workspace_id")}/details/${params.id}`,
                type: ``
            }))
        }

        let arr = [];

        if (detailsResponse.data?.type == 'form') {
            // let thisForm = detailsResponse.data?.data
            setFormObject(detailsResponse.data?.data);
            const sharedWith = detailsResponse.data?.data?.sharedWith.users;
            const currentUserExist = sharedWith.find(val => val.user == localStorage.getItem('userId'));
            if (currentUserExist) {
                showSubmissionBtn = true;
                arr = currentUserExist.access.split(',');
                if (arr.includes('edit')) {

                    setFormEditAccess(true);
                } if (arr.includes('view')) {

                    setFormViewAccess(true);
                } if (arr.includes('delete')) {

                    setFormDeleteAccess(true);
                } if (arr.includes('create')) {

                    setFormCreateAccess(true);
                }
            } else {
                if (detailsResponse.data?.data?.createdBy == localStorage.getItem('userId')) {
                    setFormCreateAccess(true);
                    setFormDeleteAccess(true);
                    setFormViewAccess(true);
                    setFormEditAccess(true);
                    setFormReportAccess(true);
                    showSubmissionBtn = true;
                } else {
                    const memberTeamsResponse = await API.getAllGroupsContainingUser();
                    const memberTeams = memberTeamsResponse.data;

                    let editAccess = false;
                    let viewAccess = false;
                    const userGroups = memberTeams;
                    const sharedUserGroups = detailsResponse.data?.data?.sharedWith?.userGroups || [];
                    const isGroupShared = sharedUserGroups.some(group =>
                        userGroups.some(userGroup =>
                            userGroup._id?.toString() == group.group?.toString()
                        )
                    );

                    if (isGroupShared) {
                        const groupAccess = sharedUserGroups.find(group =>
                            userGroups.some(userGroup =>
                                userGroup._id?.toString() == group?.group?.toString()
                            )
                        )?.access;

                        // if (groupAccess == 'edit') {
                        //     editAccess = true;
                        //     setFormEditAccess(true);
                        //     showSubmissionBtn = true;
                        // } else if (groupAccess == 'view') {
                        //     viewAccess = true;
                        //     showSubmissionBtn = true;
                        // }
                        if (groupAccess.includes('edit')) {
                            editAccess = true;
                            setFormEditAccess(true);
                            showSubmissionBtn = true;
                        }
                        if (groupAccess.includes('create')) {
                            editAccess = true;
                            setFormCreateAccess(true);
                            showSubmissionBtn = true;
                        }
                        if (groupAccess.includes('view')) {
                            // editAccess = true;                            
                            setFormViewAccess(true);
                            showSubmissionBtn = true;
                        }
                        if (groupAccess.includes('delete')) {
                            editAccess = true;
                            setFormDeleteAccess(true);
                            showSubmissionBtn = true;
                        }
                    }
                }
            }
        }

        if (detailsResponse.data["data"].hasOwnProperty('folderId')) {
            const accessToUser = await getAccess(detailsResponse?.data?.data);
            if (accessToUser["editAccess"]) {
                setShowRevisionHistoryTab(true)
            } else {
                setShowRevisionHistoryTab(false)
            }
        }

        let { status } = detailsResponse
        if (!status) {
            toast.error(`${detailsResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
            return
        }

        let filteredResponse = await cleanDetailsResponse(detailsResponse['data'])
        if (filteredResponse) {
            if (filteredResponse['type'] == 'form') {
                setShowRevisionHistoryTab(false)
                // setShowSubmissionTab(true)
                setShowSubmissionTab(showSubmissionBtn)
            }
        }

        setDetailsData(filteredResponse)
        return filteredResponse
    }

    async function cleanDetailsResponse(dataRes) {
        let { data, type } = dataRes

        if (data.defaultMetaData) {
            const { docNum, notes, docTypeDataValue, secondaryDocTypeDataValue, keywordsDataValue } = data.defaultMetaData;

            if (!docNum) {
                data.defaultMetaData['docNum'] = ''
            }

            if (!notes) {
                data.defaultMetaData['notes'] = ''
            }

            if (!docTypeDataValue) {
                data.defaultMetaData['docTypeDataValue'] = []
            }
            if (!secondaryDocTypeDataValue) {
                data.defaultMetaData['secondaryDocTypeDataValue'] = []
            }

            if (!keywordsDataValue) {
                data.defaultMetaData['keywordsDataValue'] = []
            }

        } else {
            data.defaultMetaData = {
                docNum: '',
                notes: '',
                docTypeDataValue: [],
                secondaryDocTypeDataValue: [],
                keywordsDataValue: []
            }
        }

        // if (!data.customMetaData) {
        //     data.customMetaData = {};
        // }

        return { data, type };
    }




    function navigateToSection(deptname) {
        if (isShared) {
            navigate(`/shared`)
        } else {
            navigate(`/section/${deptname}`)
        }
    }

    function navigateToParent(pId) {
        if (isShared) {
            navigate(`/share/${pId}`)
        } else {
            navigate(`/folder/${pId}`)
        }
    }

    const openModal = () => {
        setModal(true)
        fetchMetaDetails()
    }

    const Privilege = JSON?.parse(localStorage.getItem('privileges'));
    const reportPrivileges = {
        createReport: Privilege?.reports?.createReports,
        viewReport: Privilege?.reports?.viewReports,
        updateReport: Privilege?.reports?.updateReports,
        deleteReport: Privilege?.reports?.deleteReports,
    }


    const fetchMetaDetails = async () => {
        var selectedCustMetaOptions = []
        let customMetaDataFieldReponse = await API.getAllCustomMetaDataList()
        let docTypeResponse = await API.getAllDocumentType()
        let keywordsResponse = await API.getAllKeywords()

        if (customMetaDataFieldReponse['status']) {
            selectedCustMetaOptions = customMetaDataFieldReponse['data']
            setCustomMetaDataOptions(customMetaDataFieldReponse['data'])
        }

        if (docTypeResponse?.['status']) {
            setDocTypeOptionsData(docTypeResponse['data']['documentTypeData']?.map(item => ({ label: item['name'], value: item['name'] })))
            setsecDocTypeOptionsData(docTypeResponse['data']['secDocumentTypeData']?.map(item => ({ label: item['name'], value: item['name'] })))
        }
        keywordsResponse['status'] && setKeywordOptionsData(keywordsResponse['data'].map(item => ({ label: item['name'], value: item['name'] })))


        let { data, type } = DetailsData
        let { defaultMetaData, customMetaData } = data

        if (defaultMetaData) {
            const { docNum, notes, docTypeDataValue, secondaryDocTypeDataValue, keywordsDataValue } = defaultMetaData;

            if (docNum) {
                setDocNum(defaultMetaData.docNum)
            }

            if (notes) {
                setNotes(defaultMetaData.notes);
            }

            if (docTypeDataValue && docTypeDataValue?.length != 0) {

                var arr = []
                docTypeDataValue?.map(item => {
                    arr.push({ label: item, value: item })
                })
                setDocTypeData(arr)
            }
            if (secondaryDocTypeDataValue && secondaryDocTypeDataValue?.length != 0) {

                var arr = []
                secondaryDocTypeDataValue?.map(item => {
                    arr.push({ label: item, value: item })
                })
                setSecDocTypeData(arr)
            }

            if (keywordsDataValue && keywordsDataValue.length != 0) {
                var arr = []
                keywordsDataValue.map(item => {
                    arr.push({ label: item, value: item })
                })
                setKeywordsData(arr)
            }

        }

        if (customMetaData) {
            setCustomMetaData(customMetaData)

            let selectedCustMeta = []

            for (let [key, value] of Object.entries(customMetaData)) {
                let selectedCustMetaOpt = selectedCustMetaOptions.find(val => val['_id'] === key);

                if (selectedCustMetaOpt) {
                    selectedCustMeta.push(selectedCustMetaOpt);
                }
            }
            setSelectedMetaDataOptions(selectedCustMeta);


            selectedCustMetaOptions = selectedCustMetaOptions.filter(option => {
                return !selectedCustMeta.some(meta => meta._id == option._id);
            });
            setCustomMetaDataOptions(selectedCustMetaOptions);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        let docTypeDataValue = docTypeData?.map(item => item.value);
        let secondaryDocTypeDataValue = secdocTypeData?.map(item => item.value);
        let keywordsDataValue = keywordsData?.map(item => item.value);

        let defaultMetaData = (!docNum && !notes && docTypeDataValue.length == 0 && secondaryDocTypeDataValue.length == 0 && keywordsDataValue.length == 0) ? null : { docNum, notes, docTypeDataValue, secondaryDocTypeDataValue, keywordsDataValue }
        let custmetafield = Object.keys(customMetaData)?.length == 0 ? null : customMetaData

        let metaUpdateResponse;
        let { data, type } = DetailsData

        metaUpdateResponse = await API.updateMetaDetails(data['_id'], type, defaultMetaData, custmetafield)

        let { status, message } = metaUpdateResponse
        if (!status) return toast.error(`${message}`.replace(/\b\w/g, char => char.toUpperCase()))
        else {

            if (!location) return;

            const pathname = location.pathname
            const detailsRegex = /^\/details\/([a-fA-F0-9]{24})$/;
            const detailsMatched = detailsRegex.exec(pathname)

            if (detailsMatched) {
                let _ = fetchDetails(detailsMatched[1])
            }

            setModal(false);
            return toast.success(`${message}`)
        }
    }

    const handlePagination = (pageNumber) => setCurrentPage(pageNumber)


    const toggleCustomMetaModal = () => {
        setCustomMetaModal(!customMetaModal)
    }



    const checkAndStartWorkflow = async (item) => {
        if (!item) return
        //before his parent & ancestor parent check himself
        let { status, message, lastRevisionNo } = await checkBeforeEnableThisBtn(item?.['_id'], 'form')
        if (lastRevisionNo == '' || !lastRevisionNo || lastRevisionNo == undefined || lastRevisionNo == '-') {
            lastRevisionNo = 0
        }

        if (message == "Form is in under Workflow!") {
            toast(`${message}`, { icon: '⚠️' })
            return
        }

        //check his parent & ancestor parent worklow is present or not,if present update it in current item
        let pathRespo = await API.getDirectoryPath(item?.['_id']);
        if (!pathRespo.status) return toast.error(`Some Error Occured While fetching ${item?.['name']} Parent! Refresh and try again`);

        const result = pathRespo.data.reduce((acc, path) => {
            if (path._id != item?._id && path.workflow !== null) {
                acc.hasWorkflow = true;
                acc.workflows.push(path);
            }
            return acc
        }, { hasWorkflow: false, workflows: [] })



        if (result['hasWorkflow']) {
            let parentData = result['workflows'][result['workflows'].length - 1]
            let togoName = 'form'
            let togoId = item?.['_id']
            parentData['workflow']['revisionNo'] = lastRevisionNo + 1 || 1

            try {
                var updateWorkflowResponse = await API.updateWorkflowInFiles(parentData['workflow'], togoName, togoId, lastRevisionNo + 1 || 1)
                if (updateWorkflowResponse['status']) {
                    setWorkflowEnableBtn(true)
                }
            }
            catch (err) {
                toast.error(`An Error Occurred While Starting Workflow - ${err}`)
                console.error('An Error Occurred While Starting Workflow -', err)
            }
        }
        // else {
        //     // if not setUp the workflow
        // toast(`Please SetUp the Workflow!`, { icon: '⚠️' })
        // }
    }

    const checkBeforeEnableThisBtn = async (detailsId, detailsType) => {
        let workflowDetailResponse = await API.checkFileInWorkflow(detailsId, detailsType)
        let { status, message, lastRevisionNo } = workflowDetailResponse
        return { status, message, lastRevisionNo }
    }

    const checkBeforeEnableThisBtnclick = async (detailsId, detailsType) => {
        let workflowDetailResponse = await API.checkFileInWorkflow(detailsId, detailsType)
        let { status, message, lastRevisionNo } = workflowDetailResponse
        if (!status) {
            toast.error(message.replace(/\b\w/g, char => char.toUpperCase()))
        }
        if (message == "File is not inside Workflow!") {
            setWorkflowEnableBtn(false)
        }
        else {
            setWorkflowEnableBtn(true)
        }
        setWorkflowEnableBtn(false)
        return status
    }

    const checkUserValidity = async (id, type) => {
        let formResponse = await API.formValidity(id, type)

        if (!formResponse['status'])
            return toast.error(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

        return formResponse['data']
    }

    const formRender = async (item, op, link = '') => {

        if (op == "ADD SUBMISSION") {
            //here item is DetailsData

            if (item['templateType'] == 'single') {
                navigate(`/viewForm/single/create/${item['_id']}/${item['name']}`, { state: { formData: item } })
            }
            else if (item['templateType'] == 'step') {
                navigate(`/viewForm/step/create/${item['_id']}/${item['name']}`, { state: { formData: item } })
            }
            else {
                toast.error('Different Type of Form is Detected')
                return
            }
        }

        if (op == "ACTIONS") {
            //here item is formResponse

            let { data } = DetailsData

            if (link == 'delete') {

                const deleteFormResponse = await API.deleteresponse(item._id, item.formId, item.submittedBy);
                if (!deleteFormResponse.status) return toast.error('could not delete response'.replace(/\b\w/g, char => char.toUpperCase()));
                toast.success('Response deleted successfully')
                // debugger
                navigate(`/details/${item.formId}`)
                // setUpdatePage(x=>!x);
                return
            }

            if (data['templateType'] == 'single') {
                navigate(`/viewForm/single/${link}/${data['_id']}/${data['name']}`, { state: { formData: item } })
            }
            else if (data['templateType'] == 'step') {
                navigate(`/viewForm/step/${link}/${data['_id']}/${data['name']}`, { state: { formData: item } })
            }
            else {
                toast.error('Different Type of Form is Detected')
                return
            }
        }

    }

    const handleSubmission = async (e) => {
        e.preventDefault();

        var { data } = DetailsData

        let { proceed, msg } = await checkUserValidity(data['_id'], data['type']);

        if (data['type'] == 'Single Submission') {
            if (proceed == false) {
                toast(`${msg}`, { icon: '⚠️' })
                return;
            }
        }

        if (data['type'] == 'Multiple Submission') {
            if (proceed == false) {
                toast(`${msg}`, { icon: '⚠️' })
                return;
            }
        }

        formRender(data, 'ADD SUBMISSION')
    }



    const cancelWorkflow = async (e) => {
        e.preventDefault();


        Swal.fire({
            title: "Cancel workflow?",
            text: "This action cannot be undone. Confirm?",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: 'Ignore',
            confirmButtonText: "Yes, Cancel it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                let item = DetailsData['data']

                let cancelResponse = await API.cancelWorkflow(item['_id'], DetailsData['type']);
                if (!cancelResponse.status) return toast.error(`Some Error Occured While Cancelling ${item['name']}. Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()));

                toast.success(`${cancelResponse['message']}`)
                setWorkflowEnableBtn(false)

                let { status, message, lastRevisionNo } = await checkBeforeEnableThisBtn(item['_id'], DetailsData['type'])
                setLastRevisionNo(lastRevisionNo)
            }
        })


    }

    const setUpWorkflow = async (e) => {
        e.preventDefault()

        let item = DetailsData['data']
        //store in redux which item is clicked
        // dispatch(saveWorkflowCurrClickedItem(item))


        //before his parent & ancestor parent check himself
        // if (item['workflow'] != null) {
        //     navigate(`/workflow/setUpWorkflow/${DetailsData['type']}/${item['_id']}/edit/${item['workflow']?.['workflowId']}`)
        //     return
        // }

        //check his parent & ancestor parent worklow is present or not,if present update it in current item
        let pathRespo = await API.getDirectoryPath(item['_id']);
        if (!pathRespo.status) return toast.error(`Some Error Occured While fetching ${item['name']} Parent! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()));

        const result = pathRespo.data.reduce((acc, path) => {
            if (path._id != item._id && path.workflow !== null) {
                acc.hasWorkflow = true;
                acc.workflows.push(path);
            }
            return acc
        }, { hasWorkflow: false, workflows: [] })

        setRevisionInputDatas({ result, DetailsData, item })


        if (result['hasWorkflow']) {

            // navigate(`/workflow/setUpWorkflow/${togoName}/${togoId}/edit/${parentData['workflow']?.['workflowId']}`)
            await toggleRevisionModal(true)
        }
        else {
            // if not setUp the workflow
            navigate(`/workflow/setUpWorkflow/${DetailsData['type']}/${item['_id']}/create`)
        }

    }

    function uploadNewRevisionButton() {
        let createAccess = false;
        if (documentDetails.sharedWith) {
            const loggedInUserObj = documentDetails.sharedWith.users.find(val => val.user == localStorage.getItem('userId'));
            if (loggedInUserObj && loggedInUserObj.access == 'edit') {
                createAccess = true
            }
            if (documentDetails.createdBy == localStorage.getItem('userId')) {
                createAccess = true
            }
        }
        // if (showRevisionHistoryTav){}
        if (createAccess) {
            return <button className="btn btn-primary" onClick={() => toggleUploadModal()}>New Revision</button>
        }
    }

    function viewAndUpdateMetaData() {
        let createAccess = false;
        if (documentDetails.sharedWith) {
            const loggedInUserObj = documentDetails.sharedWith.users.find(val => val.user == localStorage.getItem('userId'));
            if (loggedInUserObj && loggedInUserObj.access == 'edit') {
                createAccess = true
            }
            if (documentDetails.createdBy == localStorage.getItem('userId')) {
                createAccess = true
            }
        }
        // if (showRevisionHistoryTav){}
        if (createAccess) {
            return <div className="data-col data-col-end">
                <span className="data-more">
                    <Icon name="forward-ios"></Icon>
                </span>
            </div>
        }
    }

    function handleDetailsClick() {
        let createAccess = false;
        if (documentDetails.sharedWith) {
            const loggedInUserObj = documentDetails.sharedWith.users.find(val => val.user == localStorage.getItem('userId'));
            if (loggedInUserObj && loggedInUserObj.access == 'edit') {
                createAccess = true
            }
            if (documentDetails.createdBy == localStorage.getItem('userId')) {
                createAccess = true
            }
        }
        if (createAccess) {
            openModal();
        }
    }

    function exportBtn() {
        console.log(modalTab);
        debugger
    }

    return (
        <FileManagerLayout>
            <Head title="Details"></Head>
            <OpenGraphMeta />
            <FilesBody
                viewFilter={false}
                title={
                    <BlockTitle page>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Breadcrumb className="breadcrumb-arrow">
                                <BreadcrumbItem>
                                    <span
                                        className="breadcrumbforward"
                                        onClick={() => navigateToSection(directoryPathSection._id)}
                                    >
                                        {directoryPathSection.name}
                                    </span>

                                </BreadcrumbItem>
                                {directoryPath.map((item, index) => (

                                    <BreadcrumbItem key={item.id} active={index === directoryPath.length - 1}>
                                        {index !== directoryPath.length - 1 ?
                                            <span
                                                className="breadcrumbforward"
                                                onClick={() => navigateToParent(item._id)}
                                            >
                                                {item.name}
                                            </span>
                                            : (
                                                <span className="breadcrumbforward"
                                                    onClick={() => {
                                                        if (item.type == 'folder') {
                                                            navigateToParent(item._id)
                                                        }
                                                    }}
                                                >{item.name}</span>
                                            )}
                                    </BreadcrumbItem>

                                ))}
                            </Breadcrumb>
                            {workfloweBtns &&
                                <div className="d-flex align-items-center">
                                    {!workflowEnableBtn && <button className="btn btn-primary" style={{ marginRight: "1rem" }} onClick={(e) => setUpWorkflow(e)}>Start Workflow</button>}
                                    {workflowEnableBtn && <Button color="danger" onClick={(e) => cancelWorkflow(e)}>Cancel Workflow</Button>}
                                    <Icon name="info" onClick={() => {
                                        navigate(`/WorkflowVersionsTable/${DetailsData['type']}/${DetailsData['data']['_id']}`)
                                        // setWorkflowHistoryModal(true)
                                    }}
                                        style={{ marginLeft: "1rem", cursor: "pointer" }}
                                    ></Icon>
                                </div>
                            }
                        </div>
                    </BlockTitle>
                }
            >

                <Card className="card-bordered">
                    <div className="p-2" ref={auditLogRef}
                    >
                        <div className="version_upload">
                            <h5 className="title">Audit Log</h5>
                            {/* {uploadNewRevisionButton()} */}

                            {showRevisionHistoryTav && <button className="btn btn-primary" disabled={workflowEnableBtn} onClick={async () => {
                                let status = await checkBeforeEnableThisBtnclick()
                                status && await toggleUploadModal()
                            }}>New Revision</button>}

                            {reportPrivileges.viewReport && showSubmissionTab && submissionData?.data?.length > 0 ? (
                                <div className="d-flex justify-end">
                                    <button
                                        className="btn btn-primary mx-2"
                                        // onClick={() => setPivotReportModal(true)}
                                        onClick={()=>navigate(`/formreports/${documentid}`)}
                                    >
                                        Reports
                                    </button>

                                    <button
                                        className="btn btn-primary"
                                        disabled={workflowEnableBtn}
                                        onClick={async (e) => {
                                            let status = await checkBeforeEnableThisBtnclick();
                                            if (status) await handleSubmission(e);
                                        }}
                                    >
                                        Add Submission
                                    </button>
                                </div>
                            ) : (
                                showSubmissionTab && (
                                    <button
                                        className="btn btn-primary"
                                        disabled={workflowEnableBtn}
                                        onClick={async (e) => {
                                            let status = await checkBeforeEnableThisBtnclick();
                                            if (status) await handleSubmission(e);
                                        }}
                                    >
                                        Add Submission
                                    </button>
                                )
                            )}



                        </div>
                        <ul className="nk-nav nav nav-tabs">
                            {showSubmissionTab && <li className="nav-item">
                                <a
                                    className={`nav-link ${modalTab === "3" && "active"}`}
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        setModalTab("3");
                                    }}
                                    href="#"
                                >
                                    Submissions
                                </a>
                            </li>
                            }
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${modalTab === "1" && "active"}`}
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        setModalTab("1");
                                    }}
                                    href="#"
                                >
                                    Activities
                                </a>
                            </li>
                            {showRevisionHistoryTav && <li className="nav-item">
                                <a
                                    className={`nav-link ${modalTab === "2" && "active"}`}
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        setModalTab("2");
                                    }}
                                    href="#"
                                >
                                    Revisions
                                </a>
                            </li>}

                        </ul>
                        <div className="tab-content">
                            <div className={`tab-pane ${modalTab === "1" ? "active" : ""}`} id="Activities">
                                <Row className="gy-4">
                                    <ReactDataTable
                                        data={activityData}
                                        fetchData={fetchActivityData}
                                        docId={documentid}
                                        columns={dataTableColumns}
                                        expandableRows
                                        modalTab={modalTab}
                                        actions
                                        onSearchChange={onSearchChange}
                                        rowsPerPageS={rowsPerPageS}
                                        setRowsPerPage={setRowsPerPage}
                                        handlePagination={handlePagination}
                                        filterComp={
                                            <Filter3
                                                docId={documentid}
                                                filter={filter}
                                                setFilter={setFilter}
                                                activityOptions={activityOptions}
                                                fetchData={fetchActivityData}
                                                searchText={searchText}
                                            />
                                        }
                                    />
                                </Row>
                            </div>

                            <div className={`tab-pane ${modalTab === "2" ? "active" : ""}`} id="Revisions">
                                <Row className="gy-4">
                                    <ReactDataTable
                                        data={revisionData}
                                        fetchData={fetchRevisionData}
                                        columns={revisionTableColumns}
                                        modalTab={modalTab}
                                        docId={documentid}
                                        expandableRows
                                        actions
                                        onSearchChange={onSearchChangeRevision}
                                        rowsPerPageS={rowsPerPageS}
                                        setRowsPerPage={setRowsPerPage}
                                        handlePagination={handlePagination}
                                        filterComp={
                                            <Filter3
                                                docId={documentid}
                                                filter={filter}
                                                setFilter={setFilter}
                                                activityOptions={activityOptions}
                                                fetchData={fetchRevisionData}
                                                searchText={searchText}
                                            />
                                        }
                                    />
                                </Row>
                            </div>

                            <div className={`tab-pane ${modalTab === "3" ? "active" : ""}`} id="Submissions">
                                <Row className="gy-4">
                                    <ReactDataTable
                                        data={submissionData}
                                        fetchData={fetchSubmissionsData}
                                        columns={submissionTableColumns}
                                        modalTab={modalTab}
                                        expandableRows
                                        actions
                                        onSearchChange={onSearchChangeSubmission}
                                        rowsPerPageS={rowsPerPageS}
                                        setRowsPerPage={setRowsPerPage}
                                        handlePagination={handlePagination}
                                        filterComp={
                                            // <Filter3
                                            //     docId={documentid}
                                            //     filter={filter}
                                            //     setFilter={setFilter}
                                            //     activityOptions={activityOptions}
                                            //     fetchData={fetchRevisionData}
                                            //     searchText={searchText}
                                            // />
                                            <></>
                                        }
                                    />
                                </Row>
                            </div>

                        </div>
                    </div>
                </Card>

                {/* metadata */}
                <Card className="card-bordered" >
                    <div className="card-aside-wrap">
                        <div className="card-inner card-inner-lg">

                            <Block>
                                <div className="nk-data data-list">

                                    {DetailsData?.['data']?.['defaultMetaData'] &&
                                        <>
                                            <div className="data-head">
                                                <h6 className="overline-title">Default MetaData</h6>
                                            </div>

                                            {(DetailsData?.['data']?.['defaultMetaData']?.['docNum'] == "" || DetailsData?.['data']?.['defaultMetaData']?.['docNum']) &&
                                                <div className="data-item"
                                                    // onClick={openModal}
                                                    onClick={() => handleDetailsClick()}
                                                >
                                                    <div className="data-col">
                                                        <span className="data-label">
                                                            {Object.keys(DetailsData).length != 0 &&
                                                                DetailsData?.['type'].toLowerCase() == 'file' ? "Document" : DetailsData?.['type']?.charAt(0)?.toUpperCase() + DetailsData?.['type']?.slice(1)} Number
                                                        </span>
                                                        <span className="data-value">{DetailsData?.['data']?.['defaultMetaData']?.['docNum']}</span>
                                                    </div>
                                                    {/* <div className="data-col data-col-end">
                                                        <span className="data-more">
                                                            <Icon name="forward-ios"></Icon>
                                                        </span>
                                                    </div> */}
                                                    {viewAndUpdateMetaData()}
                                                </div>
                                            }

                                            {DetailsData?.['data']?.['defaultMetaData']?.['docTypeDataValue'] &&
                                                <div className="data-item"
                                                    // onClick={openModal}
                                                    onClick={() => handleDetailsClick()}
                                                >
                                                    <div className="data-col">
                                                        <span className="data-label"> Primary {Object.keys(DetailsData).length != 0 &&
                                                            DetailsData?.['type'].toLowerCase() == 'file' ? "Document" : DetailsData?.['type']?.charAt(0)?.toUpperCase() + DetailsData?.['type']?.slice(1)} Type</span>
                                                        <span className="data-value">
                                                            {DetailsData?.['data']?.['defaultMetaData']?.['docTypeDataValue']?.map(item => (<Badge pill className="mx-1"> {item} </Badge>))}
                                                        </span>
                                                    </div>
                                                    {viewAndUpdateMetaData()}
                                                </div>
                                            }

                                            {/* {DetailsData?.['data']?.['defaultMetaData']?.['secondaryDocTypeDataValue'] && */}
                                            <div className="data-item"
                                                // onClick={openModal}
                                                onClick={() => handleDetailsClick()}
                                            >
                                                <div className="data-col">
                                                    <span className="data-label"> Secondary {Object.keys(DetailsData).length != 0 &&
                                                        DetailsData?.['type'].toLowerCase() == 'file' ? "Document" : DetailsData?.['type']?.charAt(0)?.toUpperCase() + DetailsData?.['type']?.slice(1)} Type</span>
                                                    <span className="data-value">
                                                        {DetailsData?.['data']?.['defaultMetaData']?.['secondaryDocTypeDataValue']?.map(item => (<Badge pill className="mx-1"> {item} </Badge>))}
                                                    </span>
                                                </div>

                                                {viewAndUpdateMetaData()}
                                            </div>
                                            {/* } */}

                                            {DetailsData?.['data']?.['defaultMetaData']?.['keywordsDataValue'] &&
                                                <div className="data-item"
                                                    // onClick={openModal}
                                                    onClick={() => handleDetailsClick()}
                                                >
                                                    <div className="data-col">
                                                        <span className="data-label">Keywords</span>
                                                        <span className="data-value">
                                                            {DetailsData?.['data']?.['defaultMetaData']?.['keywordsDataValue']?.map(item => (<Badge pill className="mx-1"> {item} </Badge>))}
                                                        </span>
                                                    </div>
                                                    {viewAndUpdateMetaData()}
                                                </div>
                                            }

                                            {(DetailsData?.['data']?.['defaultMetaData']?.['notes'] == "" || DetailsData?.['data']?.['defaultMetaData']?.['notes']) &&
                                                <div className="data-item"
                                                    // onClick={openModal}
                                                    onClick={() => handleDetailsClick()}
                                                >
                                                    <div className="data-col">
                                                        <span className="data-label">Notes</span>
                                                        <span className="data-value">{DetailsData?.['data']?.['defaultMetaData']?.['notes']}</span>
                                                    </div>
                                                    {/* <div className="data-col data-col-end">
                                                        <span className="data-more">
                                                            <Icon name="forward-ios"></Icon>
                                                        </span>
                                                    </div> */}
                                                    {viewAndUpdateMetaData()}
                                                </div>
                                            }
                                        </>
                                    }

                                    {DetailsData?.['data']?.['customMetaData'] &&
                                        <>
                                            <div className="data-head">
                                                <h6 className="overline-title">Custom MetaData</h6>
                                            </div>

                                            {Object.entries(DetailsData?.['data']?.['customMetaData']).map(([key, meta]) => (
                                                <>
                                                    <div className="data-item" onClick={openModal} key={key}>
                                                        <div className="data-col">
                                                            <span className="data-label">{meta?.name}</span>
                                                            <span className="data-value">{meta?.value}</span>
                                                        </div>
                                                        <div className="data-col data-col-end">
                                                            <span className="data-more">
                                                                <Icon name="forward-ios"></Icon>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            ))}

                                        </>
                                    }

                                </div>

                            </Block>

                        </div>
                    </div>
                </Card >


                <Modal isOpen={modal} className="modal-dialog-centered" size="lg" toggle={() => setModal(false)}>
                    <a
                        href="#dropdownitem"
                        onClick={(ev) => {
                            ev.preventDefault();
                            setModal(false);
                        }}
                        className="close"
                    >
                        <Icon name="cross-sm"></Icon>
                    </a>
                    <ModalBody>
                        <h5 className="title mb-4">MetaData</h5>
                        <MetaDataForm
                            defaultMetaData={[
                                {
                                    fieldName: `${Object.keys(DetailsData).length != 0 && DetailsData?.['type']?.toLowerCase() == 'file' ? 'Document' : DetailsData?.['type']?.charAt(0)?.toUpperCase() + DetailsData?.['type']?.slice(1)} Number`,
                                    type: 'text',
                                    id: "docNum",
                                    placeholder: `Enter ${Object.keys(DetailsData).length != 0 && DetailsData?.['type']?.toLowerCase() == 'file' ? 'Document' : DetailsData?.['type']?.charAt(0)?.toUpperCase() + DetailsData?.['type']?.slice(1)} Number`,
                                    required: false
                                },
                                {
                                    fieldName: `Primary ${Object.keys(DetailsData).length != 0 && DetailsData?.['type']?.toLowerCase() == 'file' ? 'Document' : DetailsData?.['type']?.charAt(0)?.toUpperCase() + DetailsData?.['type']?.slice(1)} Type`,
                                    type: 'tag',
                                    id: "doctype",
                                    placeholder: `Enter Primary ${Object.keys(DetailsData).length != 0 && DetailsData?.['type']?.toLowerCase() == 'file' ? 'Document' : DetailsData?.['type']?.charAt(0)?.toUpperCase() + DetailsData?.['type']?.slice(1)} Type`,
                                    required: true,
                                },
                                {
                                    fieldName: `Secondary ${Object.keys(DetailsData).length != 0 && DetailsData?.['type']?.toLowerCase() == 'file' ? 'Document' : DetailsData?.['type']?.charAt(0)?.toUpperCase() + DetailsData?.['type']?.slice(1)} Type`,
                                    type: 'tag',
                                    id: "doctype",
                                    placeholder: `Enter Secondary ${Object.keys(DetailsData).length != 0 && DetailsData?.['type']?.toLowerCase() == 'file' ? 'Document' : DetailsData?.['type']?.charAt(0)?.toUpperCase() + DetailsData?.['type']?.slice(1)} Type`,
                                    required: true,
                                },
                                {
                                    fieldName: 'Keywords',
                                    type: 'tag',
                                    id: "keywords",
                                    placeholder: "Enter Keywords",
                                    required: false,
                                },
                                {
                                    fieldName: 'Notes',
                                    type: 'textarea',
                                    id: "notes",
                                    placeholder: "Enter Notes",
                                    required: false
                                }
                            ]}
                            dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen}
                            customMetaDataOptions={customMetaDataOptions} setCustomMetaDataOptions={setCustomMetaDataOptions}
                            selectedMetaDataOptions={selectedMetaDataOptions} setSelectedMetaDataOptions={setSelectedMetaDataOptions}
                            customMetaData={customMetaData} setCustomMetaData={setCustomMetaData}


                            docNum={docNum} setDocNum={setDocNum}
                            notes={notes} setNotes={setNotes}

                            docTypeOptionsData={docTypeOptionsData} setDocTypeOptionsData={setDocTypeOptionsData}
                            docTypeData={docTypeData} setDocTypeData={setDocTypeData}

                            secdocTypeOptionsData={secdocTypeOptionsData} setsecDocTypeOptionsData={setsecDocTypeOptionsData}
                            secdocTypeData={secdocTypeData} setSecDocTypeData={setSecDocTypeData}


                            keywordsData={keywordsData} setKeywordsData={setKeywordsData}
                            keywordOptionsData={keywordOptionsData} setKeywordOptionsData={setKeywordOptionsData}


                            toggleCustomMetaModal={toggleCustomMetaModal}
                        />

                        <div className="multi-step-buttons" style={{ display: "flex", justifyContent: "flex-end" }}>
                            <ul className="btn-toolbar g-4 align-center justify-end mx-3">
                                <li>
                                    <a
                                        href="#"
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            setModal(false);
                                        }}
                                    >
                                        Cancel
                                    </a>

                                </li>
                            </ul>
                            <ul className="btn-toolbar g-4 align-center justify-end">
                                <li>
                                    <Button
                                        type="button"
                                        color="primary"
                                        onClick={handleSubmit}
                                    >
                                        Submit
                                    </Button>
                                </li>
                            </ul>
                        </div>

                    </ModalBody>
                </Modal>

                <Modal isOpen={customMetaModal} size="md" toggle={toggleCustomMetaModal}>
                    <CustomMetaData toggle={toggleCustomMetaModal} op={"Normal Modal"} setCustomMetaDataOptions={setCustomMetaDataOptions} />
                </Modal>

                <Modal isOpen={uploadModal} size="md" toggle={toggleUploadModal}>
                    <UploadVersion toggle={toggleUploadModal} fileId={documentid} />
                </Modal>

                <Modal isOpen={revisionModal} size="md" toggle={toggleRevisionModal}>
                    <WorkflowVersion toggle={toggleRevisionModal} revisionInputDatas={revisionInputDatas} fetchDetails={(togoId) => fetchDetails(togoId)} workflowEnableBtn={(data) => setWorkflowEnableBtn(data)} lastRevisionNo={lastRevisionNo} />
                </Modal>

                <Offcanvas show={reportModal} onHide={toggleReportModal} placement="end">
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Revisions</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <div className="nk-fmg-listing">
                            <div className="nk-files nk-files-view-list is-compact">
                                {responseHistory.map((item) => (
                                    <>
                                        <h6>{item.timeAgo}</h6>
                                        <ul>
                                            {
                                                item.activity.map((elem => {
                                                    return <li className="nk-activity-item" key={elem.name}>

                                                        {<span title={elem.name}><UserAvatar
                                                            className="nk-activity-media"
                                                            theme="success"
                                                            image={elem.img}
                                                            text={elem.name[0]}
                                                        ></UserAvatar></span>
                                                        }
                                                        <div style={{ paddingLeft: '20px' }} className="nk-activity-data">
                                                            <div className="label">{elem.activity}</div>
                                                            {/* <span className="time">{elem.time}</span> */}
                                                        </div>
                                                    </li>
                                                }))
                                            }
                                        </ul>
                                    </>
                                ))}
                            </div>
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>

                <Modal isOpen={viewerModal} size="lg" toggle={toggleViewerModal}>
                    <Viewer toggle={toggleViewerModal} file={viewDoc} codeContent={codeContent} />
                </Modal>

                {imageFlag && <Lightbox
                    medium={`${process.env.REACT_APP_BE_URL}/file/documents/${imageFile._id}/${localStorage.getItem("workspace_id")}`}
                    large={`${process.env.REACT_APP_BE_URL}/file/documents/${imageFile._id}/${localStorage.getItem("workspace_id")}`}
                    alt={imageFile.name}
                    hideZoom={true}
                    hideDownload={false}
                    onClose={() => setImageFlag(false)}
                />}

                <Modal isOpen={pivotReportModal} toggle={togglePivotReportModal} fullscreen>
                    <Reports
                        toggle={togglePivotReportModal}
                        formId={documentid}
                    />
                </Modal>
            </FilesBody >
        </FileManagerLayout >
    )
}

export default Details