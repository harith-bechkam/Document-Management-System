import React, { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router"
import Content from "../../../layout/content/Content"
import Head from "../../../layout/head/Head"
import * as API from "../../../utils/API"
import toast from "react-hot-toast"
import FileManagerLayout from "../../app/file-manager/components/Layout"
import FilesBody from "../../app/file-manager/components/Body"

// import { ReactFormGenerator } from 'react-form-builder2'
// import 'react-form-builder2/dist/app.css'
// import './scss/bootstrap/bootstrap.scss'
// import '@fortawesome/fontawesome-free/css/all.min.css'


import FormBuilder, { Registry, ReactFormGenerator } from './Lib/src/index';
import './Lib/scss/application.scss'
import './scss/bootstrap/bootstrap.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { Block, Icon } from "../../../components/Component"
import { Button, Card, CardHeader, CardTitle, Tooltip } from "reactstrap"
import FormGenerator from "./FormGenerator"
import { useDispatch } from "react-redux"
import { updateFormSubmit, updateLoaderFlag } from "../../../redux/folderSlice"
import { Offcanvas } from "react-bootstrap"
import Comments from "../Workflow/Support/comments/Comments"
import Swal from "sweetalert2"
import { useSearchParams } from "react-router-dom";


const StepViewForm = () => {
    const location = useLocation()
    const navigate = useNavigate()
    let { prefix, hisId, op, formId, formName } = useParams()

    const [searchParams] = useSearchParams()
    const hasQueryParam = searchParams.has("back")
    const backValue = searchParams.get("back")


    const [formData, setFormData] = useState(location.state?.formData || null)
    const [filledValues, setFilledValues] = useState([]) // to hold values for the current step
    const dispatch = useDispatch();
    const [currentStep, setCurrentStep] = useState(0)
    const [stepsHeader, setStepsHeader] = useState([])
    const [templateSchemaData, setTemplateSchemaData] = useState([])
    const [storeFullResponse, setStoreFullResponse] = useState(null)//->it will be needed only at the edit for sending _id in edit api call,no need in create mode

    const [stepSubmissions, setStepSubmissions] = useState([])

    const [workflow, setWorkflow] = useState(false)
    const [commentIcon, setCommentIcon] = useState(false)
    const [comments, setComments] = useState([])
    const [workflowHistoryData, setWorkflowHistoryData] = useState(null)
    const [hisdata, setHisData] = useState(null)
    const [tooltipOpen, setTooltipOpen] = useState({});
    const [submissionData, setSubmissionData] = useState([])
    const [allowSubmission, setAllowSubmission] = useState(false)
    const [rootPage, setRootPage] = useState('detail')

    const toolTipToggle = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };


    useEffect(() => {
        fetchData()
    }, [formId, op])

    const fetchData = async () => {
        if (hisId) {
            setRootPage('workflowDetail')
            await fetchHisData(hisId)
        }
        else {
            setRootPage('detail')
        }

        let workflowDetect = prefix ? (prefix?.toLowerCase() == 'workflow') : false
        setWorkflow(workflowDetect)
        workflowDetect && await fetchComments(hisId)


        if (op == 'create') {
            if (!formData) {
                fetchFormDetails()
            } else {
                let convertedPreview = await convertPreviewData(formData['templateSchema'] ? formData['templateSchema'][0] : null)

                if (convertedPreview.length !== 0) {
                    // debugger
                    // const headerData = convertedPreview.map((_, i) => ({
                    //     step: i,
                    //     label: `Step ${i + 1}`
                    // }))
                    const headerData = [];
                    for (let key in formData['templateSchema'][0]) {
                        headerData.push({
                            step: key,
                            label: formData['templateSchema'][0][key].step_name
                        })
                    }
                    // debugger

                    setStepsHeader(headerData)
                }

                convertedPreview = convertedPreview.map(step => ({
                    schema: step,
                    response: []
                }))
                setTemplateSchemaData(convertedPreview)
            }
        }

        if (op == 'view' || op == 'edit') {
            if (!formData) {
                //formResponse missing, now go fetch formResponse
                //formData['schema'] missing, now go fetch formData

                fetchFormResponseDetails() //-> this api will give formData & formResponse

            } else {
                //formResponse got, now go fetch FormTemplateSchema

                dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
                const formResponse = await API.getForm(formId)
                dispatch(updateLoaderFlag({ loader: false, text: '' }))

                if (!formResponse.status) {
                    return toast.error(`${formResponse.message}`.replace(/\b\w/g, char => char.toUpperCase()))
                }

                let convertedPreview = await convertPreviewData(formResponse['data']['templateSchema'] ? formResponse['data']['templateSchema'][0] : null)

                if (convertedPreview.length !== 0) {
                    // const headerData = convertedPreview.map((_, i) => ({
                    //     step: i,
                    //     label: `Step ${i + 1}`
                    // }))

                    const headerData = [];
                    for (let key in formResponse['data']['templateSchema'][0]) {
                        headerData.push({
                            step: key,
                            label: formResponse['data']['templateSchema'][0][key].step_name
                        })
                    }

                    setStepsHeader(headerData)
                }

                convertedPreview = convertedPreview.map((step, idx) => ({
                    schema: step,
                    response: (formData['response'] && formData['response']?.length != 0) ? formData['response'][idx] : []
                }))

                for (let item of convertedPreview) {
                    item['response'] = (await traverseFormatResponse(new Array(item['response']), "generatingTime")).flat(Infinity)
                }

                setStoreFullResponse(formData)//store's full response
                setTemplateSchemaData(convertedPreview)//store template & it's response
                setFormData(formResponse.data)//store formData

            }
        }
    }

    const fetchHisData = async (hisId) => {
        let tz = localStorage.getItem('timeZone')

        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let workflowHistoryResponse = await API.getWorkflowHistory('form', formId, hisId, tz)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        var { status, message, data } = workflowHistoryResponse

        if (!status) {
            navigate(`/workflow/accessDenied`)
            toast.error(message?.replace(/\b\w/g, char => char.toUpperCase()))
            return
        }

        if (Object.keys(data).length != 0) {
            setHisData(data)

            var proceed = await canShowSubmissionBtn(data)
            setAllowSubmission(proceed)
        }
        else {
            setHisData(null)
        }
    }

    const fetchComments = async (hisId) => {

        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Comments' }))
        let commentsResponse = await API.getWorkflowComments('form', hisId, false, 'fromformworkflow')
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        var { status, message, data } = commentsResponse

        if (!status) {
            toast.error(message.replace(/\b\w/g, char => char.toUpperCase()))
            return
        }

        // console.log(data,"commentsdata")
        setComments(data?.comments || [])
        setWorkflowHistoryData(data?.historyData || null)

    }

    const fetchFormDetails = async () => {
        try {
            const formResponse = await API.getForm(formId)
            if (!formResponse.status) {
                return toast.error(`${formResponse.message}`.replace(/\b\w/g, char => char.toUpperCase()))
            }
            setFormData(formResponse.data)

            let convertedPreview = await convertPreviewData(formResponse['data']['templateSchema'] ? formResponse['data']['templateSchema'][0] : null)

            if (convertedPreview.length !== 0) {
                const headerData = convertedPreview.map((_, i) => ({
                    step: i,
                    label: `Step ${i + 1}`
                }))

                setStepsHeader(headerData)
            }

            convertedPreview = convertedPreview.map(step => ({
                schema: step,
                response: []
            }))
            setTemplateSchemaData(convertedPreview)


        } catch (error) {
            toast.error("Failed to Load Form")
        }
    }

    const fetchFormResponseDetails = async () => {
        try {
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            const formResponse = await API.getSubmission(formId)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

            if (!formResponse.status) {
                return toast.error(`${formResponse.message}`.replace(/\b\w/g, char => char.toUpperCase()))
            }

            let { formData, formResponseData } = formResponse['data']
            setFormData(formData)//store formData
            setStoreFullResponse(formResponseData)

            let convertedPreview = await convertPreviewData(formData['templateSchema'] ? formData['templateSchema'][0] : null)

            if (convertedPreview.length !== 0) {
                const headerData = convertedPreview.map((_, i) => ({
                    step: i,
                    label: `Step ${i + 1}`
                }))

                setStepsHeader(headerData)
            }

            convertedPreview = convertedPreview.map((step, idx) => ({
                schema: step,
                response: (formResponseData['response'] && formResponseData['response']?.length != 0) ? formResponseData['response'][idx] : []
            }))

            for (let item of convertedPreview) {
                item['response'] = (await traverseFormatResponse(new Array(item['response']), "generatingTime")).flat(Infinity)
            }

            setTemplateSchemaData(convertedPreview)//store template & it's response



        } catch (error) {
            console.log(error, "error")
            toast.error("Failed to Load Form Details")
        }
    }

    const convertPreviewData = async (data) => {
        let allTaskData = []

        Object.keys(data).forEach(key => {
            if (data[key].task_data && Array.isArray(data[key].task_data)) {
                allTaskData.push(data[key].task_data)
            }
        })
        return allTaskData
    }

    const handleFormChange = (updatedValues) => {
        // console.log('test123', updatedValues);
        // debugger
        let updatedData = [...templateSchemaData]
        updatedData[currentStep] = { schema: updatedData[currentStep].schema, response: updatedValues }
        setTemplateSchemaData(updatedData)
    }

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result) // Base64 result
            reader.onerror = (error) => reject(error)
            reader.readAsDataURL(blob) // Converts Blob/File to Base64 string
        })
    }

    const traverseFormatResponse = async (data, op) => {
        for (const innerArray of data) {
            for (const item of innerArray) {


                if (op == "submitTime") {

                    if (item.name.startsWith("camera")) {
                        if (item.value instanceof File) {
                            item.value = await blobToBase64(item.value);
                        }
                    }

                }




                // var fileObject = item['value'] || null
                // let stringifiedValue = ""
                // if (fileObject) {
                //     let fileData = {
                //         lastModified: fileObject.lastModified,
                //         name: fileObject.name,
                //         size: fileObject.size,
                //         type: fileObject.type,
                //         webkitRelativePath: fileObject.webkitRelativePath
                //     }
                //     stringifiedValue = JSON.stringify(fileData);
                // }
                // item['value'] = stringifiedValue


                // if (op == "generatingTime") {
                //     // convert string -> File

                //     if (item['value']) {
                //         let parsedData = JSON.parse(item['value'])
                //         if (parsedData) {
                //             const fileDataArray = new Uint8Array(parsedData.size)

                //             let restoredFile = new File([fileDataArray], parsedData.name, {
                //                 type: parsedData.type,
                //                 lastModified: parsedData.lastModified
                //             })
                //             item['value'] = restoredFile
                //         }
                //     }
                // }
            }
        }
        return data
    }

    const handleFormSubmit = async (submittedValues) => {

        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))

        //somehow if you got the link and when u try to submit time it throw error
        if (rootPage == 'workflowDetail' && op == 'create') {
            var proceed = await canShowSubmissionBtn(hisdata)
            if (proceed == false) return;
        }

        var existingdata = stepSubmissions;
        existingdata.push(submittedValues);
        // alert(existingdata?.length)
        setStepSubmissions(existingdata)
        const temp = JSON.parse(JSON.stringify(submittedValues));
        // debugger
        if (currentStep + 1 == stepsHeader.length) {
            submittedValues = templateSchemaData.map(item => item.response)
            // submittedValues = await traverseFormatResponse(submittedValues, "submitTime")
            // debugger
            if (submittedValues.flat().length == 0) {
                submittedValues[0] = temp
            }
            // debugger
            let formResponse = null

            const formDataObj = new FormData();
            // formId, submittedValues, op, formResponseId
            formDataObj.append('formId', formId);
            // formDataObj.append('submittedValues', JSON.stringify(submittedValues));
            formDataObj.append('op', op);

            // for(let i =0;i<submittedValues.length;i++){
            //     if(submittedValues[i].value instanceof File ){
            //         formDataObj.append('document',submittedValues[i].value);
            //         submittedValues[i]["filename"] = submittedValues[i].value.name;
            //     }    
            // }

            // console.log(stepSubmissions);
            // formDataObj.append('submittedValues',JSON.stringify(submittedValues));

            for (let i = 0; i < stepSubmissions.length; i++) {
                for (let j = 0; j < stepSubmissions[i].length; j++) {
                    if (stepSubmissions[i][j].value instanceof File) {
                        formDataObj.append('document', stepSubmissions[i][j].value);
                        stepSubmissions[i][j]["filename"] = stepSubmissions[i][j].value.name;
                    }
                }

            }
            formDataObj.append('submittedValues', JSON.stringify(stepSubmissions));



            if (op === "create") {
                formDataObj.append('formResponseId', "");
                dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
                formResponse = await API.saveFormResponse(formDataObj)
                dispatch(updateLoaderFlag({ loader: false, text: '' }))

            }
            if (op === "edit") {
                // console.log(storeFullResponse);
                // formDataObj.append('formResponseId', storeFullResponse['_id']);
                formDataObj.append('formResponseId', storeFullResponse['_id']);
                dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
                formResponse = await API.saveFormResponse(formDataObj)
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
            }

            if (!formResponse['status'])
                return toast.error(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

            if (/form/i.test(formName)) {
                formName = formName.replace(/form/i, '').trim()
            }

            dispatch(updateFormSubmit({}));


            if (workflow) {

                //if need to go to detail page
                // navigate(`/workflow/detail/Form/${workflowHistoryData['formId']}/${workflowHistoryData['_id']}`) 

                op === "create" && (await fetchSubmissionsData('', '', hisdata['formId'], hisdata, 'view'))
                op === "edit" && (await fetchSubmissionsData('', '', hisdata['formId'], hisdata, 'view'))
            }
            else {
                navigate(`/details/${formId}?isFormSubmitted=true`)
            }

            op === "create" && toast.success(`${formName} submitted successfully`)
            op === "edit" && toast.success(`${formName} updated successfully`)
            setStepSubmissions([])
            
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
        }
        else {
            handleNext()
        }
    }

    const handlePrevious = () => {
        setCurrentStep((prevStep) => {
            const newStep = Math.max(prevStep - 1, 0)
            setFilledValues(templateSchemaData[newStep]?.response || [])
            return newStep
        })
    }

    const handleNext = () => {
        setCurrentStep((prevStep) => {
            const newStep = Math.min(prevStep + 1, stepsHeader.length - 1)
            setFilledValues(templateSchemaData[newStep]?.response || [])
            return newStep
        })
    }

    let handleViewPrevious = () => {
        setCurrentStep(prevStep => Math.max(prevStep - 1, 0));
    };

    const handleViewNext = () => {
        setCurrentStep(prevStep => Math.min(prevStep + 1, stepsHeader.length - 1));
    }

    const handleComments = async (newComment) => {
        let latestComment = newComment

        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let { status, message } = await API.setWorkflowComments(workflowHistoryData?.['formId'], hisId, latestComment, workflowHistoryData?.['currentStepInfo']['id'], workflowHistoryData?.['currentStepInfo']['stepName'], 'form')
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        if (!status) {
            toast.error(`${message || 'Error Occured inserting new Comment'}`.replace(/\b\w/g, char => char.toUpperCase()))
        }
        // dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }


    const checkUserValidity = async (id, type) => {
        let formResponse = await API.formValidity(id, type)
        return formResponse['data']
    }

    const canShowSubmissionBtn = async (hisdata) => {
        var data = hisdata ? hisdata['fileData'] : null

        let { proceed, msg } = await checkUserValidity(data['_id'], data['type']);

        if (proceed == false) {
            // toast(`${msg}`, { icon: '⚠️' })
            return proceed
        }

        if (data['type'] == 'Single Submission') {
            return proceed
        }

        if (data['type'] == 'Multiple Submission') {
            return proceed
        }

        return false
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

    const statusChange = async (hisId, role, fileId, stat) => {
        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let statusRedposen = await API.changeStatus(hisId, role, fileId, stat, 'form')
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        let { status, message, isCurrStepCompleted, isLastStepCompleted } = statusRedposen

        if (!status) {
            return toast.error('Status Not Changed')
        }

        if (stat == 'Approved' || stat == 'Rejected') {
            navigate('/approvalHistory')
            if (isCurrStepCompleted && isLastStepCompleted) {
                toast.success(`Workflow completed and form published`)
            }
        }
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

    const formRender = async (item, op, link = '', detailsData = null) => {

        if (op == "ADD SUBMISSION") {
            //here item is DetailsData

            if (item['templateType'] == 'single') {
                navigate(`/viewForm/workflow/${hisId}/single/create/${item['_id']}/${item['name']}`, { state: { formData: item } })
            }
            else if (item['templateType'] == 'step') {
                navigate(`/viewForm/workflow/${hisId}/step/create/${item['_id']}/${item['name']}`, { state: { formData: item } })
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
                toast.success('Response deleted successfully');
                return
            }

            setFormData(item)
            if (data['templateType'] == 'single') {
                navigate(`/viewForm/workflow/${hisId}/single/${link}/${data['_id']}/${data['name']}`, { state: { formData: item } })

            }
            else if (data['templateType'] == 'step') {
                navigate(`/viewForm/workflow/${hisId}/step/${link}/${data['_id']}/${data['name']}`, { state: { formData: item } })
            }
            else {
                toast.error('Different Type of Form is Detected')
                return
            }
        }

    }


    const fetchSubmissionsData = async (search = "", activity = "", docId, detailsData = null, viewableLink = 'view') => {
        let formSubmissionResponse = await API.getSubmissionDatas(docId, search, 1, 10)

        if (!formSubmissionResponse['status'])
            return toast.error(`${formSubmissionResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

        if (formSubmissionResponse) {
            let { status, ...rem } = formSubmissionResponse
            if (status) {
                setSubmissionData({
                    submissionData: formSubmissionResponse['data'],
                    ...rem
                })

                if (viewableLink == 'edit' || viewableLink == 'view') {
                    await formRender(formSubmissionResponse?.['data']?.[0], "ACTIONS", viewableLink, detailsData)
                }
            }
        }

    }

    const handleEdit = async (e) => {
        e.preventDefault();
        fetchSubmissionsData('', '', hisdata['formId'], hisdata, 'edit') //redirect to edit link
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

        setTemplateSchemaData([])
        await formRender(data, 'ADD SUBMISSION')
    }



    const navigateBack = () => {
        if (rootPage == 'workflowDetail') {
            navigate(`/workflow/detail/Form/${workflowHistoryData['formId']}/${workflowHistoryData['_id']}?back=true`)
        }
        else {
            navigate(-1)
        }
    }

    return (
        <React.Fragment>
            <Head title={'View Form'} />
            <div className="form-viewer-wrap">
                <div className="form-viewer">

                    <CardHeader className="form-viewer-custom-card-header border-bottom">
                        <div className="d-flex align-items-center justify-content-between w-100 py-1">
                            {/* Left Section - Back Arrow and Form Name */}
                            <div className="d-flex align-items-center">
                                <Icon className="back-arrow-form" onClick={navigateBack} name="arrow-long-left" />
                                <div className="d-flex align-items-center ml-2 form-builder-custom-formname">
                                    <CardTitle tag="h5">{formData?.name}</CardTitle>
                                </div>
                            </div>

                            {/* Right Section - Actions */}
                            <div className="d-flex align-items-center" style={{ cursor: "pointer" }}>
                                {rootPage == 'workflowDetail' && op.toLowerCase() === "view" && (
                                    <>
                                        {hisdata?.['canShowBtn']?.['status'] && (
                                            <div className="d-flex align-items-center pointer">
                                                {/* Add Response Button */}
                                                {allowSubmission &&
                                                    <div id="Add New Response">
                                                        <Icon name="property-add" title="Add New Response" onClick={handleSubmission} />
                                                    </div>
                                                }

                                                {/* Edit Button */}
                                                <div id="Edit" className="mx-2">
                                                    <Icon name="edit" title="Edit" onClick={handleEdit} >
                                                        {/* <Tooltip
                                                            placement="bottom"
                                                            isOpen={tooltipOpen[`Edit`] || false}
                                                            target={`Edit`}
                                                            toggle={() => toolTipToggle(`Edit`)}
                                                        >
                                                            {'Edit'}
                                                        </Tooltip> */}
                                                    </Icon>
                                                </div>
                                            </div>
                                        )}

                                        {/* Approver Buttons  */}
                                        {hisdata?.['canShowBtn']?.['role']?.toLowerCase() === 'approver' && (
                                            <div className="d-flex align-items-center ml-auto">
                                                {hisdata['currentStepInfo']['triggers']['accept'] !== "" && (
                                                    <Button color="success" size="sm" className="mx-1" onClick={handleApprove}>
                                                        Approve
                                                    </Button>
                                                )}
                                                {hisdata['currentStepInfo']['triggers']['reject'] !== "" && (
                                                    <Button color="danger" size="sm" className="mx-1" onClick={handleRejected}>
                                                        Reject
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <Card className="card-bordered">
                        <div className="card-aside-wrap">
                            <div className="card-inner card-inner-lg">
                                <Block>
                                    <div className="nk-data data-list">
                                        {/* <h3>{formName}</h3> */}
                                        {stepsHeader && stepsHeader.length > 1 && <center
                                            // className={`${stepsHeader.length > 1 ? 'formbuilder test' : 'formbuilder formbuilder_single'}`}
                                            className="formbuilder"
                                        >
                                            <ol className="progtrckr">
                                                {stepsHeader && stepsHeader.length > 0 && stepsHeader.map((stepObj, index) => {
                                                    let className = "progtrckr-todo"

                                                    if (index < currentStep) {
                                                        className = "progtrckr-done"
                                                    } else if (index == currentStep) {
                                                        className = "progtrckr-doing"
                                                    }

                                                    return (
                                                        <li key={index} className={className} value={index}>
                                                            <em>{index + 1}</em><span>{stepObj.label}</span>
                                                        </li>
                                                    )
                                                })}
                                            </ol>
                                        </center>}

                                        <div className="formbuilder" key={currentStep}>
                                            {((op == 'create' || op == "edit") && templateSchemaData?.[currentStep]) &&
                                                <FormGenerator
                                                    op={op}
                                                    formId={formId}
                                                    schema={templateSchemaData[currentStep].schema}
                                                    answers={templateSchemaData[currentStep].response}
                                                    handleFormChange={handleFormChange}
                                                    handleFormSubmit={handleFormSubmit}
                                                    handlePrevious={handlePrevious}
                                                    handleNext={handleNext}
                                                    currentStep={currentStep}
                                                    stepsHeader={stepsHeader}
                                                    workflow={workflow}
                                                    workflowistParam={workflowHistoryData?.['formId']}
                                                    workflowindParam={workflowHistoryData?.['_id']}
                                                />
                                            }
                                        </div>

                                        {(op == 'view' && templateSchemaData?.[currentStep]) && (
                                            <>
                                                <div className="formbuilder" key={currentStep}>
                                                    <ReactFormGenerator
                                                        data={templateSchemaData[currentStep].schema}
                                                        answer_data={templateSchemaData[currentStep].response}
                                                        read_only={true}
                                                        hide_actions={true}
                                                    />
                                                </div>
                                                <div className="multi-step-buttons" style={{ display: "flex", justifyContent: "flex-end" }}>
                                                    {currentStep > 0 && (
                                                        <ul className="btn-toolbar g-4 align-center justify-end mx-3">
                                                            <li>
                                                                <Button type="button" color="primary" onClick={handleViewPrevious}>Previous</Button>
                                                            </li>
                                                        </ul>
                                                    )}

                                                    {currentStep < stepsHeader.length - 1 ? (
                                                        <ul className="btn-toolbar g-4 align-center justify-end">
                                                            <li>
                                                                <button className="btn btn-primary" onClick={handleViewNext}>Next</button>
                                                            </li>
                                                        </ul>
                                                    ) : (
                                                        <>
                                                            {!workflow &&
                                                                <ul className="btn-toolbar g-4 align-center justify-end">
                                                                    <li>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-secondary"
                                                                            onClick={(ev) => {
                                                                                ev.preventDefault();
                                                                                // navigate(`/workflow/detail/Form/${workflowHistoryData['formId']}/${workflowHistoryData['_id']}`)
                                                                                navigate(`/details/${formId}?isFormSubmitted=true`)
                                                                            }}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </li>
                                                                </ul>
                                                            }
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                    </div>
                                </Block>
                            </div>
                        </div>
                    </Card>

                    {workflow &&
                        <>
                            <div className="workflowFormComment" onClick={() => setCommentIcon(true)} >
                                <Icon name="comments" className="workflowFormCommentIcon" />
                            </div>


                            <Offcanvas show={commentIcon} onHide={() => setCommentIcon(false)} placement="end" style={{ width: '45%', maxWidth: 'none' }} >
                                <Offcanvas.Header closeButton className="border-bottom">
                                    <Offcanvas.Title>
                                        <h5 className="card-title fw-bolder text-dark">
                                            Comments &nbsp;
                                        </h5>
                                    </Offcanvas.Title>
                                </Offcanvas.Header>
                                <Offcanvas.Body>
                                    <div>
                                        <Comments
                                            currentUserId={localStorage.getItem('userId')}
                                            data={comments}
                                            fileId={workflowHistoryData?.['formId']}
                                            historyId={hisId}
                                            type={'form'}
                                            stepId={workflowHistoryData?.['currentStepInfo']?.['id']}
                                            setdata={async (data) => {
                                                await handleComments(data)
                                                setComments(data)
                                            }}
                                        />
                                    </div>
                                    {comments.length == 0 &&
                                        <div className="text-muted text-center" style={{ marginTop: '2rem' }}>
                                            No comments available
                                        </div>
                                    }
                                </Offcanvas.Body>
                            </Offcanvas>
                        </>
                    }
                </div>
            </div>
        </React.Fragment>
    )
}

export default StepViewForm
