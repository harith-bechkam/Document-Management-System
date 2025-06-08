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
import { Button, Card } from "reactstrap"
import { useDispatch } from "react-redux"
import { updateFormSubmit, updateLoaderFlag } from "../../../redux/folderSlice"
import { Offcanvas } from "react-bootstrap"
import Comments from "../Workflow/Support/comments/Comments"

const ViewForm = () => {

    const location = useLocation()
    const navigate = useNavigate()
    let { prefix, hisId, op, formId, formName } = useParams()
    const dispatch = useDispatch();
    const [formData, setFormData] = useState(location.state?.formData || null)
    const [filledValues, setFilledValues] = useState([])
    const [formSchemaData, setformSchemaData] = useState(null)

    const [workflow, setWorkflow] = useState(false)
    const [commentIcon, setCommentIcon] = useState(false)
    const [comments, setComments] = useState([])
    const [workflowHistoryData, setWorkflowHistoryData] = useState(null)

    useEffect(() => {

        // op - create
        // schema - formData.templateSchema
        // response - no need

        // op - view
        // schema - formSchemaData
        // response - formData.response

        const fetchData = async () => {

            let workflowDetect = prefix ? (prefix?.toLowerCase() == 'workflow') : false
            setWorkflow(workflowDetect)
            workflowDetect && await fetchComments(hisId)

            if (op == 'create') {
                if (!formData) {
                    fetchFormDetails()
                }
            }

            if (op == 'view' || op == 'edit') {
                if (!formData) {
                    // get schema and it's response
                    fetchFormResponseDetails()
                }
                else {
                    // to get schema alone
                    dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
                    const formResponse = await API.getForm(formId)
                    dispatch(updateLoaderFlag({ loader: false, text: '' }))

                    if (!formResponse.status) {
                        return toast.error(`${formResponse.message}`.replace(/\b\w/g, char => char.toUpperCase()))
                    }
                    setformSchemaData(formResponse.data)
                }
            }
        }

        fetchData()

    }, [formData])

    const fetchComments = async (hisId) => {

        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Comments' }))
        let commentsResponse = await API.getWorkflowComments('form', hisId, true, 'fromformworkflow')
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        var { status, message, data } = commentsResponse

        if (!status) {
            toast.error(message.replace(/\b\w/g, char => char.toUpperCase()))
            return
        }

        setComments(data?.comments || [])
        setWorkflowHistoryData(data?.historyData || null)

    }


    const fetchFormDetails = async () => {
        try {
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            const formResponse = await API.getForm(formId)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            if (!formResponse.status) {
                return toast.error(`${formResponse.message}`.replace(/\b\w/g, char => char.toUpperCase()))
            }
            setFormData(formResponse.data)
        } catch (error) {
            toast.error("Failed to Load Form")
        }
    }

    const fetchFormResponseDetails = async () => {
        try {
            // debugger
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            const formResponse = await API.getSubmission(formId)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

            if (!formResponse.status) {
                return toast.error(`${formResponse.message}`.replace(/\b\w/g, char => char.toUpperCase()))
            }

            setformSchemaData(formResponse?.data?.formData)
            setFormData(formResponse?.data?.formResponseData)

        } catch (error) {
            toast.error("Failed to Load Form Details")
        }
    }

    const validateForm = (values) => {
        let isValid = true
        values.forEach(field => {
            if (field.required && !field.value) {
                isValid = false
            }
        })
        return isValid
    }

    const handleFormChange = (updatedValues) => {
        setFilledValues(updatedValues)
    }


    const handleFormSubmit = async (submittedValues) => {
        window.scrollTo(0, 0);


        const isValid = validateForm(submittedValues)
        if (!isValid) {
            toast.error("Please Fill in all Required Fields")
            return
        }

        let formResponse = null;

        const formDataObj = new FormData();
        // formId, submittedValues, op, formResponseId
        formDataObj.append('formId', formId);

        formDataObj.append('op', op);

        for (let i = 0; i < submittedValues.length; i++) {
            if (submittedValues[i].value instanceof File) {
                debugger
                formDataObj.append('document', submittedValues[i].value);
                submittedValues[i]["filename"] = submittedValues[i].value.name;
            }
            // if(!submittedValues[i].value){

            // }
        }

        formDataObj.append('submittedValues', JSON.stringify(submittedValues));


        if (op == "create") {
            formDataObj.append('formResponseId', "");
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            formResponse = await API.saveFormResponse(formDataObj)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

        }
        if (op == "edit") {
            //In Here formData['_id'] -> is formResponse id

            formDataObj.append('formResponseId', formData['_id']);
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            formResponse = await API.saveFormResponse(formDataObj)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

        }

        if (!formResponse['status'])
            return toast.error(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

        if (/form/i.test(formName)) {
            formName = formName.replace(/form/i, '').trim()
        }

        dispatch(updateFormSubmit({}))

        workflow ? navigate(`/workflow/detail/Form/${workflowHistoryData['formId']}/${workflowHistoryData['_id']}`) : navigate(`/details/${formId}`)

        op == "create" && toast.success(`${formName} submitted successfully`)
        op == "edit" && toast.success(`${formName} updated successfully`)
    }

    const handleComments = async (newComment) => {
        let latestComment = newComment

        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let { status, message } = await API.setWorkflowComments(workflowHistoryData?.['formId'], prefix, latestComment, workflowHistoryData?.['currentStepInfo']['id'], workflowHistoryData?.['currentStepInfo']['stepName'], 'form')
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        if (!status) {
            toast.error(`${message || 'Error Occured inserting new Comment'}`.replace(/\b\w/g, char => char.toUpperCase()))
        }
    }
    return (
        <React.Fragment>
            <Head title={'View Form'} />
            <FileManagerLayout>
                <FilesBody>
                    <Content>

                        <Card className="card-bordered">
                            <div className="card-aside-wrap">
                                <div className="card-inner card-inner-lg">
                                    <Block>
                                        <div className="nk-data data-list">
                                            {/* <h3>{formName}</h3> */}

                                            {(op == 'create' && formData) && (
                                                <div className="formbuilder">
                                                    <ReactFormGenerator
                                                        data={formData.templateSchema}
                                                        read_only={false}
                                                        hide_actions={false}
                                                        onChange={handleFormChange}
                                                        onSubmit={handleFormSubmit}
                                                        submitButton={
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary"
                                                                    onClick={(ev) => {
                                                                        ev.preventDefault()
                                                                        workflow ? navigate(`/workflow/detail/Form/${workflowHistoryData['formId']}/${workflowHistoryData['_id']}`) : navigate(`/details/${formId}`)
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </button>

                                                                <button className="btn btn-primary">Submit</button>
                                                            </>
                                                        }
                                                    />
                                                </div>
                                            )}

                                            {(op == 'view' && formData && formSchemaData) && (
                                                <div className="formbuilder">
                                                    <ReactFormGenerator
                                                        data={formSchemaData.templateSchema}
                                                        answer_data={formData.response}
                                                        read_only={true}
                                                        hide_actions={true}
                                                    />
                                                </div>
                                            )}

                                            {(op == 'edit' && formData && formSchemaData) && (
                                                <div className="formbuilder">
                                                    <ReactFormGenerator
                                                        data={formSchemaData.templateSchema}
                                                        answer_data={formData.response}
                                                        read_only={false}
                                                        hide_actions={false}
                                                        onChange={handleFormChange}
                                                        onSubmit={handleFormSubmit}
                                                        submitButton={
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary"
                                                                    onClick={(ev) => {
                                                                        ev.preventDefault()
                                                                        workflow ? navigate(`/workflow/detail/Form/${workflowHistoryData['formId']}/${workflowHistoryData['_id']}`) : navigate(`/details/${formId}`)
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </button>

                                                                <button className="btn btn-primary">Update</button>
                                                            </>
                                                        }

                                                    />
                                                </div>
                                            )}

                                        </div>
                                    </Block>
                                </div>
                            </div>
                        </Card>
                        {workflow &&
                            <>
                                {/* <div className="workflowFormComment" onClick={() => setCommentIcon(true)} >
                                    <Icon name="comments" className="workflowFormCommentIcon" />
                                </div> */}


                                <Offcanvas show={commentIcon} onHide={() => setCommentIcon(false)} placement="end" style={{ width: '45%', maxWidth: 'none' }} >
                                    <Offcanvas.Header closeButton className="border-bottom">
                                        <Offcanvas.Title>
                                            <h5 className="card-title fw-bolder text-dark">
                                                Comments &nbsp;
                                            </h5>
                                        </Offcanvas.Title>
                                    </Offcanvas.Header>
                                    <Offcanvas.Body>
                                        {comments.length != 0 ? <div>
                                            <Comments
                                                currentUserId={localStorage.getItem('userId')}
                                                data={comments}
                                                fileId={workflowHistoryData?.['formId']}
                                                historyId={prefix}
                                                type={'form'}
                                                stepId={workflowHistoryData?.['currentStepInfo']['id']}
                                                setdata={async (data) => {
                                                    await handleComments(data)
                                                    setComments(data)
                                                }}
                                            />
                                        </div>
                                            :
                                            <div className="text-muted text-center" style={{ marginTop: '2rem' }}>
                                                No comments available
                                            </div>
                                        }
                                    </Offcanvas.Body>
                                </Offcanvas>
                            </>
                        }
                    </Content>
                </FilesBody>
            </FileManagerLayout>
        </React.Fragment>
    )
}

export default ViewForm
