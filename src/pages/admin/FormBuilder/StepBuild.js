import React, { useState, useEffect, forwardRef, useMemo, useRef } from "react"
import { useNavigate, useParams, useLocation } from "react-router"
import Content from "../../../layout/content/Content"
import Head from "../../../layout/head/Head"
import { BlockHead, BlockBetween, BlockHeadContent, BlockTitle, PreviewCard, BlockDes, Button, Icon, Block } from "../../../components/Component"
import * as API from "../../../utils/API"
import toast, { Toaster } from "react-hot-toast"
import FileManagerLayout from "../../app/file-manager/components/Layout"
import FilesBody from "../../app/file-manager/components/Body"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardBody, CardHeader, Modal, CardTitle, CardText } from "reactstrap";
import FormBuilder, { Registry, ReactFormGenerator } from './Lib/src/index';
import './Lib/scss/application.scss'
import './scss/bootstrap/bootstrap.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';

import StepTabs from "./StepTabs"
import { triggerInlineFormAdded, triggerInlineFormEdited, updateLoaderFlag } from "../../../redux/folderSlice"
import Swal from "sweetalert2"
import JoyrideComp from "../../app/file-manager/modals/Joyride"


const StepBuild = ({ toggle }) => {

    // const [name, setName] = useState('')
    const [name, setName] = useState("Untitled Form");
    const [editingName, setEditingName] = useState(false);
    const nameInputRef = useRef(null);
    const location = useLocation();

    const [error, setError] = useState(false)

    const [formsData, setFormsData] = useState({ 1: { step_name: '', task_data: [] } })

    const formBuilderRef = useRef({})

    const [tabs, setTabs] = useState([{ id: 1, title: 'Step 1' }])
    const [activeTab, setActiveTab] = useState(1)

    const [editingTabId, setEditingTabId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    const [preview, setPreview] = useState(false)
    const [previewData, setPreviewData] = useState([])
    const [currentStep, setCurrentStep] = useState(0)
    const [stepsHeader, setStepsHeader] = useState([])
    const [start, setStart] = useState(false)
    const inlineFormAccess = useSelector(state => state.folders.inlineFormModalOpened)
    const isNewTemplateClicked = useSelector(state => state.folders.inlineAddFormTemplateClicked);
    const inlineEditTemplateClicked = useSelector(state => state.folders.inlineEditFormTemplateClicked);
    const inlineEditTemplate = useSelector(state => state.folders.inlineEditFormTemplate);

    let { formBuilderId, formBuilderName } = useParams()

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [run, setRun] = useState(false);

    

    function startRide() {
        setRun(true);
        setTimeout(() => {
            const joyride_beacon = document.querySelector(`.react-joyride__beacon`);
            joyride_beacon.click();

        }, 1000);
    }

    useEffect(() => {
        document.title = 'DMS | Form Builder';
        resetParamsValue()
        setStart(true)
        alignFormBuilder()
        checkWindowType()
    }, [])

    function resetParamsValue() {
        if (inlineEditTemplate.status && inlineEditTemplateClicked) {
            formBuilderId = inlineEditTemplate.id;
            formBuilderName = inlineEditTemplate.name;
        }
    }

    const [tourSteps, setTourSteps] = useState([
        {
            target: ".form-builder-custom-formname",
            content: `${formBuilderId?'On Clicking here, you can update the template name':'Here you have to give a name for the form template, by default, it is Untitled Form'}`,
        },
        {
            target: ".form-builder-preview-button",
            content: "You can preview the created form here",
        },
        {
            target: ".form-builder-save-button",
            content: `${formBuilderId?'Update the form':'Save the created form'}`,
        },
        {
            target: ".delete-step",
            content: "Delete the step",
        },
        {
            target: ".edit-step",
            content: "Edit the step name",
        },
        {
            target: ".add-step",
            content: "Add a new step",
        },
        {
            target: ".react-form-builder-toolbar",
            content: "Select the form fields from this toolbar",
        },
    ])

    const handleEditTabTitle = (id, newTitle) => {
        setTabs(tabs.map(tab => tab.id === id ? { ...tab, title: newTitle } : tab));
        setEditingTabId(null);
    };

    const alignFormBuilder = () => {
        const builderDivs = document.querySelectorAll('.react-form-builder')
        if (builderDivs.length > 0) {
            builderDivs.forEach(builderDiv => {
                let siblingDiv = builderDiv.parentElement.querySelector('div:not(.react-form-builder)')

                if (siblingDiv && siblingDiv !== builderDiv) {
                    siblingDiv.classList.add('row')
                    siblingDiv.style.margin = '0.2rem'
                }
            })
        }
    }

    const countKeysAndUpdateTabs = async (arr) => {
        const updatedTabs = []
        // debugger
        arr.forEach((obj, index) => {
            Object.keys(obj).forEach((key, idx) => {
                // const stepId = parseInt(key, 10)
                // const title = `Step ${stepId}`
                // updatedTabs.push({ id: stepId, title: title })
                const stepId = parseInt(key, 10);
                const title = obj[key].step_name;
                updatedTabs.push({ id: stepId, title: title });
            })
        })
        setTabs(updatedTabs)
    }

    const checkWindowType = async () => {
        let id = formBuilderId
        if (id) {
            // debugger
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            var formResponse = await API.getFormBuilder(formBuilderId)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

            if (!formResponse['status'])
                return toast.error(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

            if (formResponse['data'].length != 0) {
                // debugger
                const updatedTabs = tabs.map((tab, index) => {
                    const stepKey = Object.keys(formResponse['data'][0])[index];
                    const stepName = formResponse['data'][0][stepKey]?.step_name;

                    return stepName ? { ...tab, title: stepName } : tab;
                });

                setTabs(updatedTabs);
                formBuilderRef.current = formResponse['data'][0]
                setFormsData(formResponse['data'][0])
                console.log(formsData)
                // debugger
                await countKeysAndUpdateTabs(formResponse['data'])
            }
            setName(formBuilderName)
        }
        setStart(false)
    }

    const handleSave = async (e) => {
        e.preventDefault();

        if (!name) {
            toast.error("Please Fill Name Field")
            setError(true)
            return
        }
        // debugger
        let createdForm = formsData;

        for (let key in createdForm) {
            createdForm[key]['step_name'] = tabs[Number(key) - 1].title;
        }

        if (isNewTemplateClicked) {
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            let formResponse = await API.saveFormBuilder(name, formsData, 'step')
            dispatch(updateLoaderFlag({ loader: false, text: '' }));
            dispatch(triggerInlineFormAdded({
                active: true,
                id: formResponse.data?.id,
                name: formResponse.data?.name
            }))
            dispatch(triggerInlineFormEdited({
                active: false,
                id: '',
                name: ''
            }))
            toggle()
        } else {
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            let formResponse = await API.saveFormBuilder(name, formsData, 'step')
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

            if (!formResponse['status'])
                return toast.error(`${formResponse['message']}`)

            navigate(`/formBuild`)
            toast.success(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
        }


    }

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!name) {
            toast.error("Please Fill Name Field")
            setError(true)
            return
        }

        if (!formBuilderId) {
            if (!inlineEditTemplateClicked) {
                toast.error('Id is Missing')
                return
            }
        }

        let createdForm = formsData;

        for (let key in createdForm) {
            createdForm[key]['step_name'] = tabs[Number(key) - 1].title;
        }
        let legacyCheck = false;
        if (inlineEditTemplateClicked) {
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            let outdateListResponse = await API.getListOfOutdatedForms(inlineEditTemplate.id)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            if (!outdateListResponse["status"]) {
                return toast.error(`Unable to get outdated forms list`);
            }
            if (outdateListResponse?.data?.length > 0) {
                legacyCheck = true;
            }
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            let formResponse = await API.updateFormBuilder(inlineEditTemplate.id, name, formsData)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            dispatch(triggerInlineFormAdded({
                active: false,
                id: '',
                name: '',
            }))
            dispatch(triggerInlineFormEdited({
                active: true,
                id: formResponse.data?.id,
                name: formResponse.data?.name
            }))
            if (legacyCheck) {
                Swal.fire({
                    title: "Form Template Updated!",
                    text: "This updated template will only apply to forms created in the future and mapped to this template.",
                    icon: "success"
                })
            } else {
                toast.success(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
            }
            toggle()
        } else {
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            let outdateListResponse = await API.getListOfOutdatedForms(formBuilderId)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            if (!outdateListResponse["status"]) {
                return toast.error(`Unable to get outdated forms list`);
            }
            if (outdateListResponse?.data?.length > 0) {
                legacyCheck = true;
            }
            dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
            let formResponse = await API.updateFormBuilder(formBuilderId, name, formsData)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))

            if (!formResponse['status'])
                return toast.error(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

            navigate(`/formBuild`)
            if (legacyCheck) {
                Swal.fire({
                    title: "Form Template Updated!",
                    text: "This updated template will only apply to forms created in the future and mapped to this template.",
                    icon: "success"
                })
            } else {
                toast.success(`${formResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
            }
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

    const handlePreview = async (e) => {
        e.preventDefault();
        setPreview(true)
        let convertedPreview = await convertPreviewData(formsData)
        if (convertedPreview.length != 0) {
            const headerData = [];
            for (let i = 0; i < convertedPreview.length; i++) {
                headerData.push({
                    step: i,
                    label: tabs[i].title
                })
            }

            setStepsHeader(headerData)
        }

        setPreviewData(convertedPreview)
    }

    const togglePreview = () => {
        setPreview(!preview)
    }

    let handlePrevious = () => {
        setCurrentStep((prevStep) => Math.max(prevStep - 1, 0))
    }

    let handleNext = () => {
        setCurrentStep((prevStep) => Math.min(prevStep + 1, stepsHeader.length - 1))
    }

    const handleNameClick = () => {
        setEditingName(true);
        setTimeout(() => {
            nameInputRef.current && nameInputRef.current.focus();
        }, 0);
    };

    return (
        <Card className="card-bordered">
            <CardHeader className="form-builder-custom-card-header border-bottom">
                <div className="d-flex align-items-center justify-content-between py-1">

                    <div className="d-flex align-items-center">
                        {!inlineFormAccess && <Icon style={{ fontWeight: 'bold', cursor: 'pointer', marginInline: '1rem' }} onClick={() => navigate(`/formBuild`)} name="arrow-long-left" />}
                        <div className="d-flex align-items-center ml-2 form-builder-custom-formname">
                            {editingName ? (
                                <input
                                    type="text"
                                    ref={nameInputRef}
                                    className={`form-control ${error ? "error" : ""}`}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (e.target.value.trim() === "") {
                                            setError(true);
                                        } else {
                                            setError(false);
                                        }
                                    }}
                                    onBlur={() => {
                                        if (name.trim() === "") {
                                            setError(true);
                                        } else {
                                            setEditingName(false);
                                        }
                                    }}
                                />
                            ) : (
                                <label className="form-label mb-0" onClick={handleNameClick} style={{ cursor: "pointer" }}>
                                    {name}
                                </label>
                            )}
                        </div>
                    </div>


                    <div className={`d-flex align-items-center ${inlineFormAccess ? 'form-builder-fullscreen-header-btns' : ''}`}>
                        {/* <button className="joyride-tour bg-transparent"  onClick={() => startRide()}><Icon id={`joyride-icon`} title='Start Tour' className={`text-info fs-3`} name={`help-fill`} /></button> */}
                        <Button className="btn btn-primary mx-3 form-builder-preview-button"
                            onClick={handlePreview}>
                            Preview
                        </Button>
                        <Button color="primary"
                            className={'form-builder-save-button'}
                            onClick={(formBuilderId || inlineEditTemplateClicked) ? handleUpdate : handleSave}>
                            {(formBuilderId || inlineEditTemplateClicked) ? 'Save' : 'Create'}
                        </Button>
                    </div>
                </div>

            </CardHeader>
            <CardBody className="form-builder-custom-card-body card-inner">
                {/* <Content> */}

                {location.pathname.includes('edit') ? (
                    formsData["1"].step_name !== '' && (
                        <StepTabs
                            formsData={formsData}
                            setFormsData={setFormsData}
                            tabs={tabs}
                            setTabs={setTabs}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            editingTabId={editingTabId}
                            setEditingTabId={setEditingTabId}
                            editingTitle={editingTitle}
                            setEditingTitle={setEditingTitle}
                            handleEditTabTitle={handleEditTabTitle}
                            setStart={setStart}
                        // isCreatePage={['/formBuild/step/add'].includes(location?.pathname)}
                        />
                    )
                ) : (
                    <StepTabs
                        formsData={formsData}
                        setFormsData={setFormsData}
                        tabs={tabs}
                        setTabs={setTabs}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        editingTabId={editingTabId}
                        setEditingTabId={setEditingTabId}
                        editingTitle={editingTitle}
                        setEditingTitle={setEditingTitle}
                        handleEditTabTitle={handleEditTabTitle}
                        setStart={setStart}
                    // isCreatePage={['/formBuild/step/add'].includes(location?.pathname)}
                    />
                )}

                <Modal isOpen={preview} size="xl">
                    <>
                        <a
                            href="#close"
                            onClick={(ev) => {
                                ev.preventDefault()
                                togglePreview()
                            }}
                            className="close"
                        >
                            <Icon name="cross-sm"></Icon>
                        </a>
                        <div className="modal-body modal-body-md">
                            <div className="nk-upload-form mb-0">
                                {stepsHeader && stepsHeader.length > 1 && <center className="formbuilder">
                                    <ol className="progtrckr">
                                        {stepsHeader && stepsHeader.length > 0 && stepsHeader.map((stepObj, index) => {
                                            let className = "progtrckr-todo"

                                            if (index < currentStep) {
                                                className = "progtrckr-done"
                                            } else if (index === currentStep) {
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

                                <div className="formbuilder">
                                    {previewData?.length != 0 && previewData[currentStep]?.length !== 0 && (
                                        <ReactFormGenerator
                                            data={previewData[currentStep]}
                                            read_only={false}
                                            hide_actions={true}
                                        />
                                    )}
                                </div>


                                <div className="multi-step-buttons" style={{ display: "flex", justifyContent: "flex-end" }}>
                                    {currentStep > 0 && (
                                        <ul className="btn-toolbar g-4 align-center justify-end mx-3">
                                            <li>
                                                <Button type="button" color="primary" onClick={handlePrevious}>Previous</Button>
                                            </li>
                                        </ul>
                                    )}

                                    {currentStep < stepsHeader.length - 1 ? (
                                        <ul className="btn-toolbar g-4 align-center justify-end">
                                            <li>
                                                <Button type="button" color="primary" onClick={handleNext}>Next</Button>
                                            </li>
                                        </ul>
                                    ) : (
                                        <ul className="btn-toolbar g-4 align-center justify-end">
                                            <li>
                                                <Button color="primary"
                                                    onClick={(ev) => {
                                                        ev.preventDefault()
                                                        togglePreview()
                                                        setPreview(false)
                                                    }}
                                                >Close</Button>
                                            </li>
                                        </ul>
                                    )}
                                </div>


                            </div>
                        </div>
                    </>
                </Modal>

                <JoyrideComp
                    steps={tourSteps}
                    run={run}
                    setRun={setRun}
                />

                {/* </Content> */}
            </CardBody>
        </Card>
    )
}

export default StepBuild
