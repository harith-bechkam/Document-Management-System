import React, { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router"
import Content from "../../../layout/content/Content"
import Head from "../../../layout/head/Head"
import * as API from "../../../utils/API"
import toast, { Toaster } from "react-hot-toast"
import { Link } from "react-router-dom";
import iDoks from "../../../images/iDoks.png";

// import { ReactFormGenerator } from 'react-form-builder2'
// import 'react-form-builder2/dist/app.css'
// import './scss/bootstrap/bootstrap.scss'
// import '@fortawesome/fontawesome-free/css/all.min.css'


import FormBuilder, { Registry, ReactFormGenerator } from './Lib/src/index';
import './Lib/scss/application.scss'
import './scss/bootstrap/bootstrap.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';

import {
    Block, Icon, BlockContent, BlockTitle, BlockDes,
    BlockHead,
} from "../../../components/Component"
import { Button, Card, CardHeader, CardTitle } from "reactstrap"
import FormGenerator from "./FormGenerator"
import { useDispatch } from "react-redux"
import { updateFormSubmit, updateLoaderFlag } from "../../../redux/folderSlice"
import { Offcanvas } from "react-bootstrap"

const FormViewer = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const params = useParams();
    const [currentStep, setCurrentStep] = useState(0)
    const [stepsHeader, setStepsHeader] = useState([])
    const [formName, setformName] = useState([])
    const [formData, setFormData] = useState(null)
    const [templateSchemaData, setTemplateSchemaData] = useState([])
    const [storeFullResponse, setStoreFullResponse] = useState(null)//->it will be needed only at the edit for sending _id in edit api call,no need in create mode
    const [op, setOp] = useState("create")
    const [stepSubmissions, setStepSubmissions] = useState([])
    const formId = params.id;
    const [externaluser, setExternaluser] = useState({});
    const [loading, setLoading] = useState(false);
    const [reSetForm, setResetForm] = useState(false);
    const [message, setMessage] = useState("");
    const [allowAnotherSubmission, setAllowAnotherSubmission] = useState(false)
    const convertPreviewData = async (data) => {
        let allTaskData = []

        Object.keys(data).forEach(key => {
            if (data[key].task_data && Array.isArray(data[key].task_data)) {
                allTaskData.push(data[key].task_data)
            }
        })
        return allTaskData
    }

    const fetchFormDetails = async () => {
        try {
            let workspace_id = (params.workspaceId != null) ? params.workspaceId : localStorage.getItem("workspace_id");
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            const externaluserinfo = await API.getexternaluserinfo(params.id, params.externalusertoken, workspace_id);
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

            if (externaluserinfo.status) {
                setExternaluser({ "email": externaluserinfo.filepermission.email, "userName": externaluserinfo.filepermission.email })
            } else {
                navigate('/noaccess')
                return;
            }
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            const formResponse = await API.getSubmission(formId)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

            if (!formResponse.status) {
                return toast.error(`${formResponse.message}`.replace(/\b\w/g, char => char.toUpperCase()))
            }

            let { formData, formResponseallData } = formResponse['data']
            setFormData(formData)//store formData
            setformName(formData.name)
            var submittedform = formResponseallData.filter(item => item.submittedByEmail == externaluserinfo.filepermission.email);
            setStoreFullResponse(submittedform);
            if (formData.type == "Single Submission" && submittedform.length > 0) {
                setResetForm(true);
                setMessage("You have already submitted the Form");
                return
            }

            let convertedPreview = await convertPreviewData(formData['templateSchema'] ? formData['templateSchema'][0] : null)

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
            }
        }
        return data


    }

    const handleFormSubmit = async (submittedValues) => {
        var existingdata = stepSubmissions;
        existingdata.push(submittedValues);
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
            for (let i = 0; i < stepSubmissions.length; i++) {
                for (let j = 0; j < stepSubmissions[i].length; j++) {
                    if (stepSubmissions[i][j].value instanceof File) {
                        formDataObj.append('document', stepSubmissions[i][j].value);
                        stepSubmissions[i][j]["filename"] = stepSubmissions[i][j].value.name;
                    }
                }
            }
            formDataObj.append('submittedValues', JSON.stringify(stepSubmissions));
            formDataObj.append('submittedbyemail', externaluser.email);
            if (op === "create") {
                formDataObj.append('formResponseId', "");
                dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
                formResponse = await API.saveFormResponse(formDataObj, params.workspaceId)
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
            }
            if (op === "edit") {
                formDataObj.append('formResponseId', storeFullResponse['_id']);
                dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
                formResponse = await API.saveFormResponse(formDataObj, params.workspaceId)
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
            }

            if (!formResponse['status'])
                return toast.error(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))


            dispatch(updateFormSubmit({}));
            let data = templateSchemaData;
            for (let d in data) {
                data[d]["response"] = [];
            }
            setTemplateSchemaData(data);
            setResetForm(true);
            if (formData.type != "Single Submission") {
                setAllowAnotherSubmission(true)
                setMessage("Your submission has been successfully saved!")
            } else {
                setAllowAnotherSubmission(false)
                setMessage("Your submission has been successfully saved!")
            }
            //op === "create" && toast.success(`Submitted Successfully`.replace(/\b\w/g, char => char.toUpperCase()))
            //op === "edit" && toast.success(`Updated successfully`.replace(/\b\w/g, char => char.toUpperCase()))


        } else {
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

    useEffect(() => {

        fetchFormDetails()

    }, [])


    return (<React.Fragment>
        <Head title={formName} />

        {reSetForm == false ?
            <div className="form-viewer-wrap">
                <div className="form-viewer">
                    <CardHeader className="form-viewer-custom-card-header border-bottom">
                        <div className="d-flex align-items-center justify-content-between py-1">

                            <div className="d-flex align-items-center">
                                <div className="d-flex align-items-center ml-2 form-builder-custom-formname">
                                    <CardTitle className="" tag="h5">{formData?.name}</CardTitle>
                                </div>
                            </div>

                        </div>

                    </CardHeader>
                    <Card className="card-bordered">
                        <div className="card-aside-wrap">
                            <div className="card-inner card-inner-lg">
                                <Block>
                                    <>
                                        <div className="nk-data data-list"></div>
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
                                                    workflow={false}
                                                    workflowistParam={null}
                                                    workflowindParam={null}
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
                                                        <ul className="btn-toolbar g-4 align-center justify-end">
                                                            <li>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary"

                                                                >
                                                                    Cancel
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </>
                                </Block>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
            : <>
                <div className="nk-content">
                    <Block className="nk-block-middle nk-auth-body  wide-xs">
                        <div className="brand-logo pb-4 text-center">
                            <Link to={`${process.env.PUBLIC_URL}/`} className="logo-link">
                                {/* <img className="logo-light logo-img logo-img-lg" src={Logo} alt="logo" />
                            <img className="logo-dark logo-img logo-img-lg" src={LogoDark} alt="logo-dark" /> */}
                                <img className="login-page-title" src={iDoks} alt="iDoks" style={{ width: "7rem" }} />
                            </Link>
                        </div>
                        <BlockContent>
                            <BlockDes className="text-success text-center">
                                <h6>{message} {allowAnotherSubmission == true ? <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setResetForm(false)}>Submit another response</span> : <></>}</h6>
                            </BlockDes>
                        </BlockContent>
                    </Block>
                </div>
            </>
        }
        <Toaster />
    </React.Fragment>
    )
}

export default FormViewer