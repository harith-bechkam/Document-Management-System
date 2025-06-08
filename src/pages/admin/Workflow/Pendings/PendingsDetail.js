import { useLocation, useNavigate, useParams } from "react-router"
import FileManagerLayout from "../../../app/file-manager/components/Layout"
import FilesBody from "../../../app/file-manager/components/Body"
import { Block, BlockBetween, BlockDes, BlockHead, BlockHeadContent, BlockTitle, CodeBlock, Icon, PreviewAltCard, PreviewCard, ReactDataTable, UserAvatar } from "../../../../components/Component"
import { Badge, Button, Card, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Modal, Row, Spinner, UncontrolledDropdown, Tooltip } from "reactstrap"
import React, { useEffect, useRef, useState } from "react"
import Content from "../../../../layout/content/Content"
import Approve from "../../../../assets/images/Workflow/Approve.svg";
import toast from "react-hot-toast"
import * as API from "../../../../utils/API";
import { useDispatch } from "react-redux"
import { updateLoaderFlag } from "../../../../redux/folderSlice"
import { useSelector } from "react-redux"
import Slider from "react-slick"
import { setUploadFileAction } from "../../../../redux/upload/uploadAction"
import { size, toArray } from "lodash"
import { STATUS_UPLOAD } from '../../../../redux/upload/constants'
import Support from "../../../../components/partials/default/support-request/Support"
import Comments from '../Support/comments/Comments';
import Swal from "sweetalert2"
import { Offcanvas } from "react-bootstrap"
import { getFileType } from "../../../../utils/helper"
import Viewer from "../../../app/file-manager/modals/Viewer"
import { Lightbox } from "react-modal-image"
import { userTimezone } from "../../../../utils/Utils"
import moment from "moment"
import { setDownloadFileAction } from "../../../../redux/download/downloadAction"
import { useSearchParams } from "react-router-dom";

import {
    createComment as createCommentApi,
} from "../Support/api";

const PendingsDetail = () => {
    let { fileType, fileId, hisId } = useParams()


    const [searchParams] = useSearchParams()
    const hasQueryParam = searchParams.has("back")
    const backValue = searchParams.get("back")


    const [tab, setTab] = useState(fileType.toLowerCase() == 'form' ? "4" : "3");

    const [sm, setSm] = useState(false)
    const navigate = useNavigate()
    const [hisdata, setHisData] = useState(null)
    const [headCount, setHeadCount] = useState(null)
    const [submissionData, setSubmissionData] = useState([])


    const dispatch = useDispatch()
    const store = useSelector(state => state.folders)
    const fileInputRef = useRef(null)
    const location = useLocation();


    const [loader, setLoader] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState({
        history: null,
        comments: null,
        backup: null,
    })
    const [activeTab, setActiveTab] = useState('Steps');

    // const uploadStore = useSelector(state => state.upload);
    // const uploadedFileAmount = size(uploadStore.fileProgress)

    const [comments, setComments] = useState([]);

    const [viewDoc, setViewDoc] = useState({})
    const [viewerModal, setViewerModal] = useState(false);

    const [imageFlag, setImageFlag] = useState(false);
    const [imageFile, setImageFile] = useState({})

    const [backUptooltipOpen, setBackUptooltipOpen] = useState({})

    const [codeContent, setCodeContent] = useState('')


    //FORM SUBMISSION STATE
    const [currentPage, setCurrentPage] = useState(1)
    const [searchText, setSearchText] = useState("")
    const [rowsPerPageS, setRowsPerPage] = useState(10)

    const [formEditAccess, setFormEditAccess] = useState(true);
    const [formDeleteAccess, setFormDeleteAccess] = useState(true);
    const [formReportAccess, setFormReportAccess] = useState(true);

    const [responseHistory, setResponseHistory] = useState([]);
    const [backUpResponseHistory, setBackUpResponseHistory] = useState([])
    const [userNameOptions, setUserNameOptions] = useState([]);
    const [reportModal, setReportModal] = useState(false);
    const [fieldnameOptions, setFieldnameOptions] = useState([]);

    const [fileUploadDetect, setFileUploadDetect] = useState(false);

    const [tooltipOpen, setTooltipOpen] = useState({});
    const toolTipToggle = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const uploadStore = useSelector(state => state.upload);
    const pageLoad = useRef(false);
    const [showSubmissionBtn, setShowSubmissionBtn] = useState(false)

    useEffect(() => {
        fetchHisData()

        if (!pageLoad.current) {
            fetchComments()
        }
        const intervalId = setInterval(fetchComments, 5000)
        toast.remove();
        return () => {
            toast.remove()
            clearInterval(intervalId)
        }
    }, [])

    const fetchHisData = async () => {
        let tz = localStorage.getItem('timeZone')

        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let workflowHistoryResponse = await API.getWorkflowHistory(fileType, fileId, hisId, tz)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        var { status, message, data } = workflowHistoryResponse

        if (!status) {

            navigate(`/workflow/accessDenied`)
            toast.error(message?.replace(/\b\w/g, char => char.toUpperCase()))
            return
        }

        if (Object.keys(data).length != 0) {
            await getHeadCount(data)

            if (data?.['type'] == "form") {
                await fetchSubmissionsData('', '', data['formId'], data)
            }

            setHisData(data)
            { fileType.toLowerCase() == 'form' && (await canShowSubmissionBtn(data)) }
        }
        else {
            setHisData(null)
        }
    }

    const canShowSubmissionBtn = async (hisdata) => {
        var data = hisdata ? hisdata['fileData'] : null

        let { proceed, msg } = await checkUserValidity(data['_id'], data['type']);

        if (data['type'] == 'Single Submission') {
            if (proceed == false) {
                setShowSubmissionBtn(false)
            }
            else {
                setShowSubmissionBtn(true)
            }
        }

        if (data['type'] == 'Multiple Submission') {
            if (proceed == false) {
                setShowSubmissionBtn(false)
            }
            else {
                setShowSubmissionBtn(true)
            }
        }
    }

    const getHeadCount = async (value) => {

        var data = value?.['currentStepInfo']?.['access']
        if (value?.['currentStepInfo']?.['access'] == undefined) {
            toast.error(`Error: Missing currentStepInfo key`)
            return
        }

        if (Object.keys(data).length != 0) {
            // const editorUserCount = countUniqueUsers(data.editor)
            // const reviewerUserCount = countUniqueUsers(data.reviewer)
            // const approverUserCount = countUniqueUsers(data.approver)

            if (!data?.collab) {
                return toast.error('Error at Collab Users')
            }
            const collabUserCount = countUniqueUsers(data?.collab)

            // setHeadCount({
            //     editorCount: editorUserCount,
            //     reviewerCount: reviewerUserCount,
            //     approverCount: approverUserCount
            // })
            let cnt = collabUserCount
            setHeadCount(cnt)
        }


        function countUniqueUsers(section) {
            let allUsers = []
            allUsers = allUsers.concat(section.users)
            section.userGroups.forEach(group => {
                allUsers = allUsers.concat(group.userIds)
            })
            const uniqueUsers = Array.from(new Map(allUsers.map(user => [user.userId, user])).values())
            return uniqueUsers.length
        }

    }

    const fetchComments = async () => {
        if (!pageLoad.current) {
            dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Comments' }))
        }
        let commentsResponse = await API.getWorkflowComments(fileType, hisId, false)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        pageLoad.current = true
        var { status, message, data } = commentsResponse

        if (!status) {
            toast.error(message?.replace(/\b\w/g, char => char.toUpperCase()))
            return
        }
        setComments(data?.comments || [])

    }

    function getFileName(fileName) {
        const nameParts = fileName.split('.')
        return nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : fileName
    }

    const download = async () => {

        hisdata['currStorageInfo']['fileName'] = getFileName(hisdata['currStorageInfo']["fileName"])
        // dispatch(updateLoaderFlag({ loader: true, text: 'Downloading File...' }))

        dispatch(setDownloadFileAction([{ file: `workflowDownload-${hisdata['_id']}-${fileId}`, folder: [], fileName: hisdata['currStorageInfo']['fileName'], extension: hisdata['currStorageInfo']['ext'], APIType: 'fileDownloadAPI', type: "single" }]))
        // await API.downloadedFile(`workflowDownload-${hisdata['_id']}-${fileId}`, hisdata['currStorageInfo']['fileName'], hisdata['currStorageInfo']["contentType"], hisdata['currStorageInfo']['ext'])

        // dispatch(updateLoaderFlag({ loader: false, text: '' }))
        if (hisdata['canShowBtn']['status']) {
            await statusChange(hisdata['_id'], hisdata['canShowBtn']['role'], hisdata['fileData']['_id'], 'IP')
        }
    }


    const upload = async () => {
        fileInputRef.current.click()
    }

    const historyView = async () => {
        setModalOpen(true)

        setLoader(true)
        // dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Activities...' }))
        let activitityRedposen = await API.getWorkflowActivities(hisdata['_id'], hisdata['type'])
        let { status, message, data } = activitityRedposen
        // dispatch(updateLoaderFlag({ loader: false, text: '' }))
        setLoader(false)

        if (!status)
            return toast.error(`Error While Fetching Activites - ${message}`.replace(/\b\w/g, char => char.toUpperCase()))

        setModalData({
            history: data['stepInfoView'],
            comments: data['commentView'],
            backup: data['BackUps']
        })

    }

    const downloadDoc = async (e, item) => {
        e.preventDefault();
        e.stopPropagation();


        dispatch(updateLoaderFlag({ loader: true, text: 'Downloading' }))
        var id = `workflowbackupdownload#${modalData['historyid']}#${modalData['docid']}#${item['currentRevisionNumber']}#${item['ext']}#${item['fileName']}`
        await API.readBackupFile(id);
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        // dispatch(setDownloadFileAction([{ file: modalData['docid'], folder: [], fileName: modalData['docname'], extension: modalData['ext'], APIType: 'fileDownloadAPI', type: "single" }]))
        // await API.downloadedFile(item._source["id"], item._source["name"].split('.')[0], '', item._source.fileType)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }


    const statusChange = async (hisId, role, fileId, stat) => {
        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let statusRedposen = await API.changeStatus(hisId, role, fileId, stat, fileType)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        let { status, message, isCurrStepCompleted, isLastStepCompleted } = statusRedposen

        if (!status) {
            return toast.error('Status Not Changed')
        }

        if (stat == 'Approved' || stat == 'Rejected') {
            navigate('/workflowPendings')
            if (isCurrStepCompleted && isLastStepCompleted) {
                toast.success(`Workflow completed and file published`)
            }
        }
    }

    useEffect(() => {

        if (fileUploadDetect && size(uploadStore.fileProgress)) {

            var [latest] = toArray(uploadStore.fileProgress).reverse()

            if (latest['status'] == STATUS_UPLOAD.uploading) {
                dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            }
            else {
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
                fetchHisData()
            }

        }

    }, [uploadStore])

    const handleFileChange = async (event) => {
        const file = event.target.files[0]

        if (file) {
            setFileUploadDetect(true)
            let fileData = []

            fileData.push({
                sectionId: `workflowupload`,
                folderId: `${hisdata['_id']}-${hisdata['fileData']['_id']}-${fileType}-${hisdata['canShowBtn']['role']}-${hisdata['type']}`,
                defaultMetaData: "",
                custmetafield: "",
                metadataMode: "skip",
                file,
                APIType: 'fileUploadAPI'
            })

            dispatch(setUploadFileAction(fileData))
        }
    }

    const addComment = async (text, parentId, file) => {
        if (!hisdata?.['currentStepInfo']?.['id']) return toast.error('StepId is Missing')
        return [{
            id: Math.random().toString(36).substring(2, 9),
            body: text,
            parentId,
            file,
            stepId: hisdata?.['currentStepInfo']?.['id'],
            userId: localStorage.getItem('userId'),
            userName: localStorage.getItem('userName'),
            createdAt: new Date().toISOString(),
        }, ...comments]
    }

    const handleComments = async (newComment) => {
        let latestComment = newComment

        // dispatch(updateLoaderFlag({ loader: true, text: 'Loading...' }))
        if (hisdata['canShowBtn']['status']) {
            await statusChange(hisdata['_id'], hisdata['canShowBtn']['role'], hisdata['fileData']['_id'], 'IP')
        }
        let { status, message } = await API.setWorkflowComments(fileId, hisId, latestComment, hisdata['currentStepInfo']['id'], hisdata['currentStepInfo']['stepName'], hisdata['type'])
        if (!status) {
            return toast.error(`${message || 'Error Occured Inserting new Comment'}`.replace(/\b\w/g, char => char.toUpperCase()))
        }
        // dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }


    const handleApprove = async () => {
        const { value: comment, isConfirmed, isDismissed } = await Swal.fire({
            icon: "warning",
            title: "Confirm Approve",
            input: "textarea",
            inputLabel: "Please provide your approval reason",
            inputPlaceholder: "Type your comment here (Optional)...",
            inputAttributes: {
                'aria-label': 'Type your comment here',
                style: 'min-height: 150px; max-height: 300px; min-width: 300px; max-width: 100%; padding: 10px; font-size: 14px; border-radius: 8px;'
            },
            customClass: {
                input: 'swal2-textarea'
            },
            showCancelButton: true,
            confirmButtonText: "Yes, approve it!",
            cancelButtonText: "Cancel",
            allowOutsideClick: true,
        });

        if (isConfirmed && comment != undefined && hisdata?.canShowBtn?.status) {

            let formatComment = await addComment(comment, null, [])
            await handleComments(formatComment)
            setComments(formatComment)

            await statusChange(hisdata?.['_id'], hisdata?.['canShowBtn']?.['role'], hisdata?.['fileData']?.['_id'], 'Approved')
        }
        else if (!isConfirmed && !isDismissed) {
            // console.log("Cancel clicked");
        }
        else {
            // console.log("Clicked outside, do nothing");
        }
    }




    const toggleViewerModal = () => {
        setViewerModal(!viewerModal);
    };


    const handleRejected = async () => {
        const { value: comment, isConfirmed, isDismissed } = await Swal.fire({
            icon: "warning",
            title: "Confirm Reject",
            input: "textarea",
            inputLabel: "Please provide your Rejection reason",
            inputPlaceholder: "Type your comment here (Optional)...",
            inputAttributes: {
                'aria-label': 'Type your comment here',
                style: 'min-height: 150px; max-height: 300px; min-width: 300px; max-width: 100%; padding: 10px; font-size: 14px; border-radius: 8px;'
            },
            customClass: {
                input: 'swal2-textarea'
            },
            showCancelButton: true,
            confirmButtonText: "Yes, Reject it!",
            cancelButtonText: "Cancel",
            allowOutsideClick: true,
        })

        if (isConfirmed && comment != undefined && hisdata?.canShowBtn?.status) {
            let formatComment = await addComment(comment, null, [])
            await handleComments(formatComment)
            setComments(formatComment)

            await statusChange(hisdata['_id'], hisdata['canShowBtn']['role'], hisdata['fileData']['_id'], 'Rejected')
        }
        else if (!isConfirmed && !isDismissed) {
            // console.log("Cancel clicked")
        }
        else {
            // console.log("Clicked outside, do nothing")
        }
    }

    const toggleModal = () => setModalOpen(!modalOpen)

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    }

    const fileNameClicker = async (e) => {
        e.preventDefault()

        if (hisdata['canShowBtn']['status']) {
            await statusChange(hisdata['_id'], hisdata['canShowBtn']['role'], hisdata['fileData']['_id'], 'IP')
        }

        const docType = getFileType(hisdata.currStorageInfo.ext);

        if (docType == 'unknown') return toast.error('Unsupported File Type');

        if ((docType == 'word') || (docType == 'excel') || (docType == 'ppt') || (docType == 'pdf')) {
            // localStorage.setItem('currentLocation', JSON.stringify(location.pathname));
            window.open(`${window.location.origin}/#/${localStorage.getItem("workspace_id")}/file/workflow/edit/${hisdata['_id']}`, '_blank', 'noopener,noreferrer');
            // navigate(`/file/workflow/edit/${hisdata['_id']}`)
        }
        else {

            if (docType == 'image') {
                var body = {
                    _id: hisdata['_id'],
                    fileType: hisdata['currStorageInfo']['ext']
                }
                setImageFile(body)
                setImageFlag(true)
            }
            else if (docType == 'code') {

                var id = `workflowdownload-${hisdata['_id']}-${hisdata['fileId']}`
                var body = {
                    _id: hisdata['_id'],
                    fileType: hisdata['currStorageInfo']['ext']
                }

                const fileResponse = await API.readFile(id);
                if (!fileResponse.status) return toast.error('Error Reading File');
                setCodeContent(fileResponse.content);
                setViewDoc(body);
                toggleViewerModal();
            }
            else {
                var body = {
                    _id: hisdata['_id'],
                    fileType: hisdata['currStorageInfo']['ext']
                }
                setViewDoc(body);
                toggleViewerModal();
            }

        }
    }

    //FORM SUBMISSION
    const formRender = async (item, op, link = '', detailsData = null) => {


        if (op == "ADD SUBMISSION") {
            //here item is DetailsData

            if (item['templateType'] == 'single') {
                navigate(`/viewForm/workflow/${hisId}/single/create/${item['_id']}/${item['name']}?back=false`, { state: { formData: item } })
            }
            else if (item['templateType'] == 'step') {
                navigate(`/viewForm/workflow/${hisId}/step/create/${item['_id']}/${item['name']}?back=false`, { state: { formData: item } })
            }
            else {
                toast.error('Different Type of Form is Detected')
                return
            }
        }

        if (op == "ACTIONS") {
            //here item is formResponse

            let data = null
            if (detailsData) {
                data = detailsData ? detailsData?.['fileData'] : null
            }
            else {
                data = hisdata ? hisdata['fileData'] : null

            }

            if (link == 'delete') {

                const deleteFormResponse = await API.deleteresponse(item._id, item.formId, item.submittedBy);
                if (!deleteFormResponse.status) return toast.error('Could Not Delete Response');
                await fetchSubmissionsData(searchText, "", hisdata['formId'])
                await canShowSubmissionBtn(detailsData ? detailsData : hisdata)
                toast.success('Response deleted successfully');
                // navigate(`/workflow/detail/Form/${hisdata['formId']}/${hisdata['_id']}`)
                return
            }

            if (data['templateType'] == 'single') {
                navigate(`/viewForm/workflow/${hisId}/single/${link}/${data['_id']}/${data['name']}?back=false`, { state: { formData: item } })

            }
            else if (data['templateType'] == 'step') {
                navigate(`/viewForm/workflow/${hisId}/step/${link}/${data['_id']}/${data['name']}?back=false`, { state: { formData: item } })
            }
            else {
                toast.error('Different Type of Form is Detected')
                return
            }
        }

    }

    function actionsFormatter(row) {

        const handleView = (e) => {
            e.preventDefault();
            formRender(row, "ACTIONS", 'view')
        }


        const handleEdit = (e) => {
            e.preventDefault();
            formRender(row, "ACTIONS", 'edit')
        }

        const handleDelete = async (e) => {
            e.preventDefault();
            formRender(row, "ACTIONS", 'delete')
            await canShowSubmissionBtn(hisdata)
        }

        return (
            <div style={{ display: 'flex', cursor: 'pointer' }}>
                <div id='View'><Icon name="eye" className='mx-2' onClick={handleView} />
                    <Tooltip
                        placement="bottom"
                        isOpen={tooltipOpen[`View`] || false}
                        target={`View`}
                        toggle={() => toolTipToggle(`View`)}
                    >
                        {'View'}
                    </Tooltip>
                </div>

                {hisdata['canShowBtn']['status'] &&
                    <>
                        {formEditAccess && <div id='Edit'>
                            <Icon name="edit" style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }} onClick={handleEdit}>
                                <Tooltip
                                    placement="bottom"
                                    isOpen={tooltipOpen[`Edit`] || false}
                                    target={`Edit`}
                                    toggle={() => toolTipToggle(`Edit`)}
                                >
                                    {'Edit'}
                                </Tooltip>
                            </Icon>
                        </div>
                        }
                    </>
                }

                {hisdata['canShowBtn']['status'] &&
                    <>
                        {formDeleteAccess && <div id='Delete'><Icon name="trash" style={{ marginLeft: '0.5rem' }} onClick={handleDelete}></Icon>
                            <Tooltip
                                placement="bottom"
                                isOpen={tooltipOpen[`Delete`] || false}
                                target={`Delete`}
                                toggle={() => toolTipToggle(`Delete`)}
                            >
                                {'Delete'}
                            </Tooltip>
                        </div>}
                    </>
                }

                {formReportAccess && <div id='History_Track'><Icon name="file-text" style={{ marginLeft: '0.5rem' }} onClick={() => showhistoryinfo(row._id.toString())} ></Icon>
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

    const fetchSubmissionsData = async (search = "", activity = "", docId, detailsData = null) => {
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


                if (!hasQueryParam || (hasQueryParam && backValue == "false")) {
                    if (formSubmissionResponse['data']?.length == 0) {
                        await formRender(detailsData ? detailsData['fileData'] : null, 'ADD SUBMISSION')
                    }
                    else if (formSubmissionResponse['data']?.length == 1) {
                        await formRender(formSubmissionResponse?.['data']?.[0], "ACTIONS", 'view', detailsData)
                    }

                }

            }
        }

    }

    const onSearchChangeSubmission = async (e) => {
        setSearchText(e.target.value)
        await fetchSubmissionsData(e.target.value, "", hisdata['formId'])
    }

    const handlePagination = (pageNumber) => setCurrentPage(pageNumber)

    const toggleReportModal = async () => {
        setReportModal(!reportModal);
    }

    const showhistoryinfo = async (submissionid) => {
        toggleReportModal();
        const formResponse = await API.getForm(hisdata['formId']);
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
            return toast.error('Could not get Form');
        }
        const historyResponse = await API.getFormResponseHistory(hisdata['formId'], submissionid);
        if (!historyResponse.status) {
            return toast.error('Could not get History');
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
                    // activity: item.previousValue
                    //     ? (
                    //         <span>
                    //             Changed <b>{item.fieldlabel}</b> from <span style={{color:'red'}}>{item.previousValue}</span> to <span style={{color:'blue',textDecoration:'underline'}}>{item.currentValue}</span> 
                    //         </span>
                    //     )
                    //     : (
                    //         <span>
                    //             Added {item.currentValue} at <b>{item.fieldlabel}</b>
                    //         </span>
                    //     ),
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

    const checkUserValidity = async (id, type) => {
        let formResponse = await API.formValidity(id, type)

        if (!formResponse['status'])
            return toast.error(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

        return formResponse['data']
    }

    const handleSubmission = async (e) => {
        e.preventDefault();

        var data = hisdata ? hisdata['fileData'] : null

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

    const restoreDoc = async (item) => {
        try {
            if (fileType.toLowerCase() != 'file') {
                toast(`Restore Option is not present for Forms!`, { icon: '⚠️' })
                return
            }

            dispatch(updateLoaderFlag({ loader: true, text: 'Restoring' }))
            let workflowHistoryResponse = await API.restoreWorkflow(fileId, hisId, item)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

            var { status, message } = workflowHistoryResponse
            if (status) {
                setModalOpen(false)
                await fetchHisData()
                toast.success(message)
            }
            else {
                toast.error(message)
            }
        }
        catch (err) {
            toast.error(message)
        }
    }

    const toggleTooltip = (id) => {
        setBackUptooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    return (
        <>
            {hisdata ?
                <FileManagerLayout>
                    <FilesBody>
                        <Card>
                            <PreviewAltCard className="card-full">
                                <div className="card-title-group mb-1">
                                    <div className="card-title w-100">
                                        <div>
                                            <div className="d-flex align-items-center justify-content-between">
                                                {hisdata['type'] == 'file' && <h6 className="title" style={{ fontSize: "1.7rem", cursor: "pointer" }} onClick={(e) => fileNameClicker(e)}> <Icon name="file-docs" />{" "}{hisdata && hisdata['currStorageInfo']['fileName']}</h6>}
                                                {hisdata['type'] == 'form' && <h6 className="title" style={{ fontSize: "1.7rem", cursor: "pointer" }} > <Icon name="clipboad-check" />{" "}{hisdata && hisdata['fileData']['name']}</h6>}

                                                <ul className="d-flex gap-3">
                                                    {hisdata?.['canShowBtn']?.['role'] != null && hisdata?.['canShowBtn']?.['role'].toLowerCase() == 'approver' &&
                                                        <>
                                                            {hisdata['currentStepInfo']['triggers']['accept'] != "" &&
                                                                <li>
                                                                    <Button color="success" onClick={handleApprove}>
                                                                        Approve
                                                                    </Button>
                                                                </li>
                                                            }

                                                            {
                                                                hisdata['currentStepInfo']['triggers']['reject'] != "" &&
                                                                <li>
                                                                    <Button color="danger" className="btn-dim" onClick={handleRejected}>
                                                                        Reject
                                                                    </Button>
                                                                </li>
                                                            }
                                                        </>
                                                    }
                                                    <li>
                                                        <UncontrolledDropdown>
                                                            <DropdownToggle className="dropdown-toggle btn btn-icon btn-light">
                                                                <Icon name="more-h"></Icon>
                                                            </DropdownToggle>
                                                            <DropdownMenu>
                                                                <ul className="link-list-plain">
                                                                    {(hisdata?.['canShowBtn']?.['role'] != null && hisdata?.['canShowBtn']?.['status']) ?
                                                                        (hisdata?.['canShowBtn']?.['role'].toLowerCase() == 'editor' || hisdata?.['canShowBtn']?.['role'].toLowerCase() == 'approver') && (
                                                                            <>
                                                                                {fileType.toLowerCase() == 'file' &&
                                                                                    <li>
                                                                                        <DropdownItem tag="a" href="#links" onClick={(ev) => { ev.preventDefault(); download() }}>
                                                                                            <Icon name="download"></Icon>
                                                                                            <span>Download</span>
                                                                                        </DropdownItem>
                                                                                    </li>
                                                                                }
                                                                                {fileType.toLowerCase() == 'file' &&
                                                                                    <li>
                                                                                        <DropdownItem tag="a" href="#links" onClick={(ev) => { ev.preventDefault(); upload() }}>
                                                                                            <Icon name="upload"></Icon>
                                                                                            <span>Upload</span>
                                                                                        </DropdownItem>
                                                                                    </li>
                                                                                }
                                                                                <li>
                                                                                    <DropdownItem tag="a" href="#links" onClick={(ev) => { ev.preventDefault(); historyView() }}>
                                                                                        <Icon name="virus" />
                                                                                        <span>View Activities</span>
                                                                                    </DropdownItem>
                                                                                </li>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {fileType.toLowerCase() == 'file' &&
                                                                                    <li>
                                                                                        <DropdownItem tag="a" href="#links" onClick={(ev) => { ev.preventDefault(); download() }}>
                                                                                            <Icon name="download"></Icon>
                                                                                            <span>Download</span>
                                                                                        </DropdownItem>
                                                                                    </li>
                                                                                }
                                                                                <li>
                                                                                    <DropdownItem tag="a" href="#links" onClick={(ev) => { ev.preventDefault(); historyView() }}>
                                                                                        <Icon name="virus" />
                                                                                        <span>View Activities</span>
                                                                                    </DropdownItem>
                                                                                </li>
                                                                            </>
                                                                        )}
                                                                </ul>
                                                            </DropdownMenu>
                                                        </UncontrolledDropdown>
                                                    </li>
                                                </ul>

                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    style={{ display: "none" }}
                                                    onChange={handleFileChange}
                                                />

                                            </div>
                                            <p>
                                                {hisdata['canShowBtn']['status'] &&
                                                    <>
                                                        <a
                                                            href="#all"
                                                            onClick={(ev) => {
                                                                ev.preventDefault();
                                                            }}
                                                        >
                                                            {hisdata['canShowBtn']['status'] && <>You are an
                                                                <b> Collaborator
                                                                    {/* {hisdata['canShowBtn']['role']} */}
                                                                </b> of this <b>{hisdata['currentStepInfo']['stepName']} Step</b></>}
                                                        </a>
                                                        <br />
                                                    </>
                                                }

                                                <a
                                                    href="#all"
                                                    onClick={(ev) => {
                                                        ev.preventDefault();
                                                    }}
                                                >
                                                    Start Date: {hisdata['currentStepInfo']['startedAt'] != "" ? hisdata['currentStepInfo']['startedAt'] : '-'}
                                                </a>
                                                <br />
                                                <a
                                                    href="#all"
                                                    onClick={(ev) => {
                                                        ev.preventDefault();
                                                    }}
                                                >
                                                    Last Modified At: {hisdata['updatedAt'] != "" ? hisdata['updatedAt'] : '-'}
                                                </a>
                                                <br />
                                                <a
                                                    href="#all"
                                                    onClick={(ev) => {
                                                        ev.preventDefault();
                                                    }}
                                                >
                                                    Last Modified By: {hisdata['updatedBy'] != "" ? hisdata['updatedBy'] : '-'}
                                                </a>
                                                <br />
                                                <a
                                                    href="#all"
                                                    onClick={(ev) => {
                                                        ev.preventDefault();
                                                    }}
                                                >
                                                    Due Date: {hisdata['currentStepInfo']['endDate'] != "" ? hisdata['currentStepInfo']['endDate'] : '-'}
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ul className="nav nav-tabs nav-tabs-card nav-tabs-xs">
                                    {/* <li className="nav-item" onClick={() => setTab("1")}>
                                        <a
                                            href="#overview"
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                            }}
                                            className={`nav-link${tab === "1" ? " active" : ""}`}
                                        >
                                            Editor{headCount?.['approverCount'] > 1 && 's'}
                                            {headCount?.['editorCount'] != 0 && (<>({headCount?.['editorCount']})</>)}
                                        </a>
                                    </li>
                                    <li className="nav-item" onClick={() => setTab("2")}>
                                        <a
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                            }}
                                            className={`nav-link${tab === "2" ? " active" : ""}`}
                                            href="#year"
                                        >
                                            Reviewer{headCount?.['reviewerCount'] > 1 && 's'}
                                            {headCount?.['reviewerCount'] != 0 && (<>({headCount?.['reviewerCount']})</>)}
                                        </a>
                                    </li> */}
                                    <li className="nav-item" onClick={() => setTab("3")}>
                                        <a
                                            className={`nav-link${tab === "3" ? " active" : ""}`}
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                            }}
                                            href="#all"
                                        >
                                            Collaborator{headCount > 1 && 's'}
                                            {headCount != 0 && (<>({headCount})</>)}
                                        </a>
                                    </li>
                                    {fileType.toLowerCase() == 'form' &&
                                        <li className="nav-item" onClick={() => setTab("4")}>
                                            <a
                                                className={`nav-link${tab === "4" ? " active" : ""}`}
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                }}
                                                href="#all"
                                            >
                                                Submission{submissionData?.['data']?.length > 1 && 's'}
                                                {submissionData?.['data']?.length != 0 && (<>({submissionData?.['data']?.length})</>)}
                                            </a>
                                        </li>
                                    }

                                </ul>
                                <div className="tab-content mt-0">
                                    {/* {tab == "1" && (
                                        <div className={`tab-pane${tab === "1" && " active"}`}>
                                            <div className="invest-ov gy-2">
                                                <Block size="lg" className={"mx-0"}>
                                                    <Row>
                                                        <Col lg="8">
                                                            <Card className={`card-bordered card-full ${(!hisdata['currentStepInfo']['access']['editor']?.users.length && !hisdata['currentStepInfo']['access']['editor']?.userGroups.length) && 'border-0'}`}>
                                                                {hisdata['currentStepInfo']['access'] && <Support data={hisdata['currentStepInfo']['access']} roles={["editor"]} />}
                                                            </Card>
                                                        </Col>
                                                    </Row>
                                                </Block>
                                            </div>
                                        </div>
                                    )} */}

                                    {/* {tab == "2" && (
                                        <div className={`tab-pane${tab === "2" && " active"}`}>
                                            <div className="invest-ov gy-2">
                                                <Block size="lg">
                                                    <Row>
                                                        <Col lg="8">
                                                            <Card className={`card-bordered card-full ${(!hisdata['currentStepInfo']['access']['reviewer']?.users.length && !hisdata['currentStepInfo']['access']['reviewer']?.userGroups.length) && 'border-0'}`}>
                                                                {hisdata['currentStepInfo']['access'] && <Support data={hisdata['currentStepInfo']['access']} roles={["reviewer"]} />}
                                                            </Card>
                                                        </Col>
                                                    </Row>
                                                </Block>
                                            </div>
                                        </div>
                                    )} */}

                                    {/* {tab == "3" && (
                                        <div className={`tab-pane${tab === "3" && " active"}`}>
                                            <div className="invest-ov gy-2">
                                                <Block size="lg">
                                                    <Row>
                                                        <Col lg="8">
                                                            <Card className={`card-bordered card-full ${(!hisdata['currentStepInfo']?.['access']?.['approver']?.users.length && !hisdata['currentStepInfo']?.['access']?.['approver']?.userGroups.length) && 'border-0'}`}>
                                                                {hisdata['currentStepInfo']?.['access'] && <Support data={hisdata['currentStepInfo']?.['access']} roles={["approver"]} />}
                                                            </Card>
                                                        </Col>
                                                    </Row>
                                                </Block>
                                            </div>
                                        </div>
                                    )} */}

                                    {tab == "3" && (
                                        <div className={`tab-pane${tab === "3" && " active"}`}>
                                            <div className="invest-ov gy-2">
                                                <Block size="lg">
                                                    <Row>
                                                        <Col lg="8">
                                                            <Card className={`card-bordered card-full ${(!hisdata['currentStepInfo']?.['access']?.['collab']?.users.length && !hisdata['currentStepInfo']?.['access']?.['collab']?.userGroups.length) && 'border-0'}`}>
                                                                {hisdata['currentStepInfo']?.['access'] && <Support data={hisdata?.['currentStepInfo']?.['access']} roles={["collab"]} />}
                                                            </Card>
                                                        </Col>
                                                    </Row>
                                                </Block>
                                            </div>
                                        </div>
                                    )}
                                    {submissionData?.['data']?.length == 1 &&
                                        <>
                                        </>
                                    }
                                    {fileType.toLowerCase() == 'form' &&
                                        <>
                                            {tab == '4' && (
                                                <div className={`tab-pane${tab === "4" && " active"}`}>
                                                    <div className="invest-ov gy-2">
                                                        <Block size="lg">
                                                            <Row>
                                                                <Col lg="12">
                                                                    {hisdata['type'] == 'form' &&
                                                                        <Card className="card-bordered">
                                                                            <div className="p-2">
                                                                                {hisdata['canShowBtn']['status'] &&
                                                                                    <div className="form_version_upload py-2 ">

                                                                                        {<button className="btn btn-primary pointer"
                                                                                            disabled={showSubmissionBtn == false}
                                                                                            onClick={async (e) => {
                                                                                                await handleSubmission(e)
                                                                                            }}>Add Submission</button>}
                                                                                    </div>
                                                                                }

                                                                                <div className={`tab-pane`} id="Submissions">
                                                                                    <Row className="gy-4">
                                                                                        <ReactDataTable
                                                                                            data={submissionData}
                                                                                            fetchData={fetchSubmissionsData}
                                                                                            columns={submissionTableColumns}
                                                                                            expandableRows
                                                                                            actions
                                                                                            onSearchChange={onSearchChangeSubmission}
                                                                                            rowsPerPageS={rowsPerPageS}
                                                                                            setRowsPerPage={setRowsPerPage}
                                                                                            handlePagination={handlePagination}
                                                                                            filterComp={
                                                                                                // <Filter3
                                                                                                //     docId={hisdata['formId']}
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
                                                                        </Card>
                                                                    }
                                                                </Col>
                                                            </Row>
                                                        </Block>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    }

                                </div>

                                {/*   <hr /> */}


                                <hr />
                                <div>
                                    <Comments
                                        currentUserId={localStorage.getItem('userId')}
                                        data={comments}
                                        fileId={fileId}
                                        historyId={hisId}
                                        type={fileType}
                                        stepId={hisdata['currentStepInfo']['id']}
                                        setdata={async (data) => {
                                            await handleComments(data)
                                            setComments(data)
                                        }}
                                    />
                                </div>

                            </PreviewAltCard>
                        </Card>

                        <Offcanvas show={modalOpen} onHide={toggleModal} placement="end" style={{ width: '45%', maxWidth: 'none' }} >
                            <Offcanvas.Header closeButton className="border-bottom">
                                <Offcanvas.Title>
                                    <h5 className="card-title fw-bolder text-dark">
                                        History & Comments &nbsp;
                                    </h5>
                                </Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <div className="select-history-view" style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                                    <div className="form-check form-switch">
                                        <Container style={{ display: 'flex' }}>
                                            <div className="mask-box">
                                                <div
                                                    className="mask"
                                                    style={{
                                                        transform: `translateX(${activeTab == 'Steps' ? 0 : '150px'})`,
                                                    }}
                                                />
                                                <Button
                                                    variant="outline-primary"
                                                    style={{
                                                        color: activeTab == 'Steps' ? '#ffffff' : '#ffffff',
                                                        background: activeTab == 'Steps' ? '#6576ff' : 'transparent',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                    }}
                                                    onClick={() => handleTabClick('Steps')}
                                                >
                                                    Steps Activites
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    style={{
                                                        color: activeTab == 'Comments' ? '#ffffff' : '#ffffff',
                                                        background: activeTab == 'Comments' ? '#6576ff' : 'transparent',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                    }}
                                                    onClick={() => handleTabClick('Comments')}
                                                >
                                                    Comments
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    style={{
                                                        color: activeTab == 'BackUp' ? '#ffffff' : '#ffffff',
                                                        background: activeTab == 'BackUp' ? '#6576ff' : 'transparent',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                    }}
                                                    onClick={() => handleTabClick('BackUp')}
                                                >
                                                    BackUp
                                                </Button>
                                            </div>
                                        </Container>
                                    </div>
                                </div>


                                {loader ? (
                                    <div className="text-center" style={{ marginTop: '2rem' }}>
                                        <Spinner color="primary" />
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === 'Steps' ? (
                                            <>
                                                {modalData.history?.length > 0 ? (
                                                    modalData.history.map((item, index) => (
                                                        <div key={index} className="timeline d-flex" style={{ marginTop: '2rem' }}>
                                                            <div className="timeline-item"></div>
                                                            <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
                                                                <div className="symbol-label">
                                                                    <i className="bi bi-chat-left-text"></i>
                                                                </div>
                                                            </div>
                                                            <div className="timeline-content mb-10 mt-n1">
                                                                <div className="d-flex align-items-center border border-dashed border-gray-300 rounded px-7 py-3">
                                                                    <div className="symbol-group symbol-hover flex-nowrap flex-grow-1 min-w-100px pe-2 px-2">
                                                                        <div className="symbol symbol-circle symbol-25px">
                                                                            <span className="historycontent historyhighlights">
                                                                                <Badge className="badge-dim" color="primary">{item.stepName}</Badge>
                                                                                {(() => {
                                                                                    if (item.status == 'Cancelled') {
                                                                                        return <>&nbsp;Cancelled at&nbsp;</>
                                                                                    }
                                                                                    if (item.status == 'YTS') {
                                                                                        return <>&nbsp;Initiated at&nbsp;</>
                                                                                    } if (item.endedAt) {
                                                                                        return <>&nbsp;Concluded at&nbsp;</>
                                                                                    } else {
                                                                                        return <>&nbsp;Started at&nbsp;</>
                                                                                    }
                                                                                })()}
                                                                                {item.endedAt ? '' : <>
                                                                                    <Badge className="badge-dim" color="info">{item.startedAt}</Badge>
                                                                                </>}
                                                                                {item.endedAt ? <>
                                                                                    {/* &nbsp;and Closed at&nbsp; */}
                                                                                    <Badge className="badge-dim" color="info">{item.endedAt}</Badge>
                                                                                </> : ''}

                                                                                {item.status != 'Cancelled' &&
                                                                                    <>
                                                                                        {(() => {
                                                                                            if (item.status == 'Rejected') {
                                                                                                return <>&nbsp;as&nbsp;
                                                                                                    <Badge className="badge-dim" color={"danger"}>
                                                                                                        {item.status}
                                                                                                    </Badge>
                                                                                                </>
                                                                                            } else if (item.endedAt) {
                                                                                                return <>&nbsp;as&nbsp;
                                                                                                    <Badge className="badge-dim" color={"success"}>
                                                                                                        {'Approved'}
                                                                                                    </Badge>
                                                                                                </>
                                                                                            }
                                                                                        })()}
                                                                                    </>
                                                                                }
                                                                                &nbsp;By&nbsp;
                                                                                <Badge className="badge-dim" color="warning">{item.endedBy || item.startedBy}</Badge>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-muted text-center" style={{ marginTop: '2rem' }}>
                                                        No Steps found
                                                    </div>
                                                )}
                                            </>
                                        ) :
                                            activeTab === 'BackUp' ? (
                                                <div className="" style={{ marginTop: '2rem' }}>
                                                    {modalData.backup?.length > 0 ? (
                                                        modalData.backup.map((backup, index) => (
                                                            <div key={index} className="mb-2">
                                                                <div className="d-flex mb-2">
                                                                    <Badge className="badge-dim" color="primary">{backup.stepName}</Badge>
                                                                </div>
                                                                {backup['storageInfo']?.map((bs, idx) => {
                                                                    const tooltipId = `backup_${bs['tooltipId'] || idx}`
                                                                    return (
                                                                        <>
                                                                            {/* <div key={idx} className="d-flex align-items-center" style={{ marginLeft: "5rem" }}>

                                                                                &emsp; - {bs.createdAt} - &emsp;
                                                                                <Badge className="badge-dim" color="warning">{bs.createdBy}</Badge>
                                                                                <br />

                                                                            </div> */}
                                                                            <div key={idx} className="timeline d-flex" style={{ marginTop: '2rem' }}>
                                                                                <div className="timeline-item"></div>
                                                                                <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
                                                                                    <div className="symbol-label">
                                                                                        <i className="bi bi-chat-left-text"></i>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="timeline-content mb-10 mt-n1">
                                                                                    <div className="d-flex align-items-center border border-dashed border-gray-300 rounded px-7 py-3">
                                                                                        <div className="symbol-group symbol-hover flex-nowrap flex-grow-1 min-w-100px pe-2 px-2">
                                                                                            <div className="symbol symbol-circle symbol-25px">
                                                                                                <span className="historycontent historyhighlights">
                                                                                                    <Badge className="badge-dim" color="primary">{bs['fileName']}</Badge>
                                                                                                    &nbsp;was created on&nbsp;
                                                                                                    <Badge className="badge-dim" color="info">{moment(Date(bs.createdAt)).format('ll')}</Badge>
                                                                                                    &nbsp;at&nbsp;
                                                                                                    <Badge className="badge-dim" color="info">{bs.createdAt?.slice(10)}</Badge>
                                                                                                    &nbsp;by&nbsp;
                                                                                                    <Badge className="badge-dim" color="warning">{bs.createdBy}</Badge>
                                                                                                    &nbsp;<span
                                                                                                        id={tooltipId}
                                                                                                        style={{ cursor: "pointer" }}
                                                                                                        onClick={() => restoreDoc(bs)}
                                                                                                    >
                                                                                                        <Icon name="undo" />
                                                                                                    </span>
                                                                                                    <Tooltip
                                                                                                        placement="right"
                                                                                                        isOpen={backUptooltipOpen[tooltipId] || false}
                                                                                                        target={tooltipId}
                                                                                                        toggle={() => toggleTooltip(tooltipId)}
                                                                                                    >
                                                                                                        {bs['fileName']}
                                                                                                    </Tooltip>
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </>
                                                                    );
                                                                })}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-muted">No Backup History is Available</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    {modalData.comments?.length > 0 ? (


                                                        <Comments
                                                            currentUserId={localStorage.getItem('userId')}
                                                            data={comments}
                                                            fileId={fileId}
                                                            historyId={hisId}
                                                            type={fileType}
                                                            stepId={hisdata['currentStepInfo']['id']} // No use of it
                                                            setdata={async (data) => {
                                                                // await handleComments(data)
                                                                // setComments(data)
                                                            }}
                                                            op={"Viewer"}
                                                        />

                                                        // modalData.comments.map((comment, index) => (
                                                        //     <div key={index} className="timeline d-flex" style={{ marginTop: '2rem' }}>
                                                        //         <div className="timeline-item"></div>
                                                        //         <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
                                                        //             <div className="symbol-label">
                                                        //                 <i className="bi bi-chat-left-text"></i>
                                                        //             </div>
                                                        //         </div>
                                                        //         <div className="timeline-content mb-10 mt-n1">
                                                        //             <div className="d-flex align-items-center border border-dashed border-gray-300 rounded px-7 py-3">
                                                        //                 <div className="symbol-group symbol-hover flex-nowrap flex-grow-1 min-w-100px pe-2 px-2">
                                                        //                     <div className="symbol symbol-circle symbol-25px">
                                                        //                         <span className="historycontent historyhighlights">
                                                        //                             <Badge className="badge-dim" color="primary">Step {comment.stepId}</Badge>
                                                        //                             &nbsp;Commented:&nbsp;
                                                        //                             <Badge className="badge-dim" color="info">{comment.bodyText}</Badge>

                                                        //                             {comment.fileText.length > 0 && (
                                                        //                                 <span>
                                                        //                                     &nbsp;and Files:&nbsp;
                                                        //                                     {comment.fileText.map((file, fileIndex) => (
                                                        //                                         <span
                                                        //                                             key={fileIndex}
                                                        //                                             onClick={(e) => commentFileDownload(e, file, comment.historyId, comment.fileId)}
                                                        //                                             style={{ cursor: 'pointer' }}
                                                        //                                         >
                                                        //                                             <Badge className="badge-dim" color="secondary">
                                                        //                                                 {file.fileName}
                                                        //                                             </Badge>
                                                        //                                         </span>
                                                        //                                     ))}
                                                        //                                 </span>
                                                        //                             )}

                                                        //                             &nbsp;by&nbsp;
                                                        //                             <Badge className="badge-dim" color="warning">
                                                        //                                 {comment.userName}
                                                        //                             </Badge>
                                                        //                             &nbsp;at&nbsp;
                                                        //                             <Badge className="badge-dim" color="success">
                                                        //                                 {comment.commentedDate}
                                                        //                             </Badge>
                                                        //                         </span>
                                                        //                     </div>
                                                        //                 </div>
                                                        //             </div>
                                                        //         </div>
                                                        //     </div>
                                                        // ))
                                                    ) : (
                                                        <div className="text-muted text-center" style={{ marginTop: '2rem' }}>
                                                            No comments available
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                    </>
                                )}



                            </Offcanvas.Body>
                        </Offcanvas>

                    </FilesBody>
                </FileManagerLayout>
                :
                <div className={`${store?.loader && 'loading'}`}>

                </div>
            }
            <Modal isOpen={viewerModal} size="md" toggle={toggleViewerModal}>
                <Viewer toggle={toggleViewerModal} file={viewDoc} codeContent={codeContent} op={"WorkflowFileViewer"} />
            </Modal>

            {imageFlag && <Lightbox
                medium={`${process.env.REACT_APP_BE_URL}/workflow/file/documents/${imageFile._id}/1/${localStorage.getItem("workspace_id")}`}
                large={`${process.env.REACT_APP_BE_URL}/workflow/file/documents/${imageFile._id}/1/${localStorage.getItem("workspace_id")}`}
                alt={imageFile.name}
                hideZoom={true}
                hideDownload={false}
                onClose={() => setImageFlag(false)}
            />}

            <Offcanvas show={reportModal} onHide={toggleReportModal} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Revisions</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className="nk-fmg-listing">
                        <div className="nk-files nk-files-view-list is-compact">
                            {/* <div className="card-inner border-bottom">
                                    <div className="card-title-group">
                                        <div className="card-tools" style={{ position: 'relative' }}>
                                            <ul className="card-tools-nav">
                                                <Icon
                                                    style={{ cursor: 'pointer' }}
                                                    name={'filter-alt'}
                                                    onClick={toggleFilter}
                                                />
                                                {isFilterOpen && (
                                                    <div
                                                        className="filter-box"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            right: 0,
                                                            zIndex: 10,
                                                            background: 'white',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '4px',
                                                            padding: '10px',
                                                            boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
                                                            width: '250px',
                                                        }}
                                                    >
                                                        <div
                                                        // style={{ display: 'flex', justifyContent: 'space-between' }}
                                                        >
                                                            <label>Field Name</label>
                                                            <CheckPicker
                                                                style={{ width: 350 }}
                                                                data={fieldnameOptions}
                                                                value={selectedFiledNames}
                                                                onChange={(e) => setSelectedFieldnames(e)}
                                                            />
                                                        </div>
                                                        <div
                                                            style={{
                                                                marginTop: '10px',
                                                                //  display: 'flex',
                                                                //   justifyContent: 'space-between'
                                                            }}
                                                        >
                                                            <label>User</label>
                                                            <CheckPicker
                                                                style={{ width: 350, marginBottom: '10px' }}
                                                                data={userNameOptions}
                                                                value={selectedUsers}
                                                                onChange={(e) => setSelectedusers(e)}
                                                            />
                                                        </div>
                                                        <div
                                                            style={{
                                                                marginTop: '5px',
                                                                // display: 'flex', 
                                                                // justifyContent: 'space-between' 
                                                            }}
                                                        >
                                                            <button onClick={() => updateHistoryData()} className="btn btn-primary">Filter</button>
                                                            <button style={{ marginLeft: '10px' }} onClick={() => resetHistoryData()} className="btn btn-secondary">Reset</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div> */}

                            {responseHistory.map((item) => (
                                <>
                                    <h6>{item.timeAgo}</h6>
                                    <ul>
                                        {
                                            item.activity.map((elem => {
                                                return <li className="nk-activity-item" key={elem.name}>
                                                    <UserAvatar
                                                        className="nk-activity-media"
                                                        theme="success"
                                                        image={elem.img}
                                                        text={elem.name[0]}
                                                    ></UserAvatar>
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

        </>

    )
}

export default PendingsDetail