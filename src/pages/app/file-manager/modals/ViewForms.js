import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Icon } from '../../../../components/Component'
import './ViewWorkflows.css';
import { Modal, Spinner, Tooltip } from 'reactstrap';
import * as API from '../../../../utils/API';
import { useDispatch, useSelector } from 'react-redux';
import { ReactFormGenerator } from '../../../admin/FormBuilder/Lib/src';
import Swal from 'sweetalert2';
import {
    storeInlineEditFormTemplate,
    triggerInlineAddFormTemplateClick,
    triggerInlineEditFormTemplateClick,
    triggerInlineFormChosen
} from '../../../../redux/folderSlice';
import CloneForm from './CloneForm';
import JoyrideComp from './Joyride';



function ViewForms({
    toggle
}) {
    const dispatch = useDispatch();
    const inlineSingleView = useSelector(state => state.folders.inlineSingleFormView)
    const [formOptions, setFormOptions] = useState([]);
    const [_selectedForm, setSelectedForm] = useState({})
    const [forms, setForms] = useState([]);
    const allForms = useRef([]);
    const tabsRef = useRef([]);
    const [formsBackup, setFormsBackup] = useState([]);
    const [loader, setLoader] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState({});
    const toolTipToggle = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const Privilege = JSON?.parse(localStorage.getItem('privileges'));
    const privileges = {
        addWorkflow: Privilege?.workflow?.addWorkflow,
        updateWorkflow: Privilege?.workflow?.updateWorkflow,
        deleteWorkflow: Privilege?.workflow?.deleteWorkflow
    }

    const [tabs, setTabs] = useState([{ id: 1, title: 'Step 1' }])
    const [previewData, setPreviewData] = useState([])
    const [currentStep, setCurrentStep] = useState(0)
    const [stepsHeader, setStepsHeader] = useState([]);
    const [cloneModal, setCloneModal] = useState(false);
    const [clonnableForm, setClonnableForm] = useState({})

    const toggleCloneModal = () => {
        setCloneModal(!cloneModal);
    }

    useEffect(() => {
        getAllForms();
    }, [refreshFlag])

    const [activeForm, setActiveForm] = useState('')

    async function getAllForms() {
        setLoader(true);
        const formBuilderResponse = await API.getAllFormBuilder();
        if (formBuilderResponse["status"]) {
            if (inlineSingleView.status) {
                setForms(formBuilderResponse['data']);
                allForms.current = formBuilderResponse['data'];
                const formsTemp = formBuilderResponse['data'].map(item => ({
                    label: item['name'],
                    value: item['_id']
                }))
                setActiveForm(inlineSingleView.id)
                setSelectedForm({
                    label: inlineSingleView.name,
                    value: inlineSingleView.id
                })
                setFormsBackup(formsTemp);
                setFormOptions(formsTemp);
                handlePreview(inlineSingleView.id)

                setTimeout(() => {
                    const element = document.getElementById(inlineSingleView.id);
                    if (element) {
                        element.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest",
                        });
                    }
                }, 100);
            } else {
                setForms(formBuilderResponse['data']);
                allForms.current = formBuilderResponse['data'];
                const formsTemp = formBuilderResponse['data'].map(item => ({
                    label: item['name'],
                    value: item['_id']
                }))
                setActiveForm(formsTemp[0].value)
                setSelectedForm(formsTemp[0])
                setFormsBackup(formsTemp);
                setFormOptions(formsTemp);
                handlePreview(formsTemp[0].value)
            }
        }
    }

    const convertPreviewData = async (data) => {
        let allTaskData = []

        Object.keys(data)?.forEach(key => {
            if (data[key].task_data && Array.isArray(data[key].task_data)) {
                allTaskData.push(data[key].task_data)
            }
        })
        return allTaskData
    }

    const handlePreview = async (key) => {
        setLoader(true);
        let selectedForm = {}
        if (forms.length == 0) {
            selectedForm = allForms.current.find(val => val._id == key);
        } else {
            selectedForm = forms.find(val => val._id == key);
        }
        const formsData = selectedForm?.data[0];
        const updatedTabs = []
        selectedForm.data?.forEach((obj, index) => {
            Object.keys(obj)?.forEach((key, idx) => {
                debugger
                const stepId = parseInt(key, 10);
                const title = obj[key].step_name;
                updatedTabs.push({ id: stepId, title: title });
            })
        })
        setTabs(updatedTabs);
        tabsRef.current = updatedTabs;
        let convertedPreview = await convertPreviewData(formsData)
        if (convertedPreview.length != 0) {
            const headerData = [];
            for (let i = 0; i < convertedPreview.length; i++) {
                debugger
                headerData.push({
                    step: i,
                    label: tabsRef.current[`${i}`]?.title
                })
            }

            setStepsHeader(headerData)
        }

        setPreviewData(convertedPreview)
        setActiveForm(key);
        setSelectedForm({
            label: selectedForm.name,
            value: key
        })
        setLoader(false);
    }


    let handlePrevious = () => {
        setCurrentStep((prevStep) => Math.max(prevStep - 1, 0))
    }

    let handleNext = () => {
        setCurrentStep((prevStep) => Math.min(prevStep + 1, stepsHeader.length - 1))
    }

    function onSearch(str) {
        const arr = JSON.parse(JSON.stringify(formsBackup));
        if (str.trim() == '') {
            setFormOptions(arr);
        } else {
            const regex = new RegExp(str, 'i');
            const filteredArr = arr.filter(item => regex.test(item.label));
            setFormOptions(filteredArr);
        }
    }

    const [run, setRun] = useState(false);

    const [tourSteps, setTourSteps] = useState([
        {
            target: ".workflow-sidebar",
            content: "Here, you can see the list of available templates",
        },
        {
            target: ".form-viewer-box",
            content: "The template preview can be seen here",
        },
        {
            target: ".search-box",
            content: "Search option to filter the templates",
        },
        {
            target: ".choose-btn",
            content: "Choose this template for your form",
        },
        {
            target: ".add-workflow-icon-fullscreen",
            content: "Add new template",
        },
        {
            target: ".clone-workflow-icon",
            content: "Clone template",
        },
        {
            target: ".edit-workflow-icon",
            content: "Edit template",
        },
        {
            target: ".delete-workflow-icon",
            content: "Delete template",
        },
    ])

    function startRide() {
        setRun(true);
        setTimeout(() => {
            const joyride_beacon = document.querySelector(`.react-joyride__beacon`);
            joyride_beacon.click();

        }, 1000);
    }

    return (
        <div className="container-fluid vh-100 p-5">
            <div className="row h-100">
                <div className="col-4 bg-light p-3">
                    <h5>
                        Forms
                        <span>
                            <Icon onClick={() => {
                                dispatch(triggerInlineAddFormTemplateClick({
                                    action: true
                                }))
                                dispatch(triggerInlineEditFormTemplateClick({
                                    active: false
                                }))
                            }} id="add-form" className="add-workflow-icon-fullscreen" name="property-add" />
                            <Tooltip
                                placement="top"
                                isOpen={tooltipOpen["add-form"] || false}
                                target="add-form"
                                toggle={() => toolTipToggle("add-form")}
                            >
                                Add Form Template
                            </Tooltip>
                        </span>
                    </h5>
                    <div className='mr-4 mb-2 search-box'>
                        <input className='workflow-search p-2' type='text' placeholder='Search' onChange={(e) => onSearch(e.target.value)} />
                        <Icon className="search-icon" name={`search`} />
                    </div>
                    <ul className='workflow-sidebar'>
                        {formOptions.map((elem) => (
                            <li className={`workflow-option`} id={elem.value} onClick={() => handlePreview(elem.value)} key={elem.value}>
                                <span className={`mb-2 mr-2 card card-bordered workflow-options-card text-soft ${activeForm == elem.value ? 'active' : ''}`}>
                                    <div className={`card-inner`}>
                                        <div className="align-center justify-between">
                                            <div className="g">
                                                <h6 className={`title ${activeForm == elem.value ? 'workflow-selected' : ''}`}>{elem.label}<span>
                                                    {privileges.addWorkflow && <>
                                                        <Icon onClick={() => {
                                                            setClonnableForm(elem);
                                                            setCloneModal(true)
                                                        }} className="clone-workflow-icon" id="_clone_form" name="copy" />
                                                        <Tooltip
                                                            placement="top"
                                                            isOpen={tooltipOpen["_clone_form"] || false}
                                                            target="_clone_form"
                                                            toggle={() => toolTipToggle("_clone_form")}
                                                        >
                                                            Clone Form
                                                        </Tooltip>
                                                    </>}
                                                    {privileges.updateWorkflow && <>
                                                        <Icon onClick={() => {
                                                            dispatch(storeInlineEditFormTemplate({
                                                                active: true,
                                                                id: elem.value,
                                                                name: elem.label
                                                            }))
                                                            dispatch(triggerInlineAddFormTemplateClick({
                                                                action: false
                                                            }))
                                                            dispatch(triggerInlineEditFormTemplateClick({
                                                                active: true
                                                            }))
                                                        }
                                                        } className="clone-workflow-icon edit-workflow-icon" id="_edit_form" name="edit" />
                                                        <Tooltip
                                                            placement="top"
                                                            isOpen={tooltipOpen["_edit_form"] || false}
                                                            target="_edit_form"
                                                            toggle={() => toolTipToggle("_edit_form")}
                                                        >
                                                            Edit Form
                                                        </Tooltip>
                                                    </>}
                                                    {privileges.deleteWorkflow && <>
                                                        <Icon onClick={(e) => {
                                                            e.stopPropagation();
                                                            Swal.fire({
                                                                icon: 'warning',
                                                                title: `Are you sure?`,
                                                                text: `You are about to delete the form '${elem.label}'!`,
                                                                showCancelButton: true,
                                                                confirmButtonText: `Yes, delete it`
                                                            }).then(async res => {
                                                                if (res.isConfirmed) {
                                                                    setLoader(true);
                                                                    const deleteRespo = await API.deleteFormBuilder(elem.value);
                                                                    if (!deleteRespo.status) {
                                                                        setLoader(false);
                                                                        return toast.error(`Unable to delete form`);
                                                                    }
                                                                    setLoader(false);
                                                                    setRefreshFlag(prev => !prev);
                                                                }
                                                            })
                                                        }
                                                        } className="clone-workflow-icon delete-workflow-icon text-danger" id="_delete_form" name="trash" />
                                                        <Tooltip
                                                            placement="top"
                                                            isOpen={tooltipOpen["_delete_form"] || false}
                                                            target="_delete_form"
                                                            toggle={() => toolTipToggle("_delete_form")}
                                                        >
                                                            Delete Form
                                                        </Tooltip>
                                                    </>}
                                                </span></h6>
                                            </div>
                                            <div className="g">
                                                <span className="btn btn-icon btn-trigger me-n1">
                                                    <Icon name="chevron-right"></Icon>
                                                </span>
                                            </div>
                                        </div>
                                    </div>{" "}
                                </span>
                            </li>
                        ))}
                        {formOptions.length == 0 && <p className='no-workflows-message'>No Form Templates to Display!</p>}
                    </ul>
                </div>

                <div className="col-8 bg-white pb-4 form-display">
                    {loader ? <div className='loader-spinner-parent'>
                        <Spinner className='custom-spinner' />
                    </div> :
                        <>
                            <div className='d-flex justify-between sticky-top bg-white p-2 border-bottom'>
                                <h5>{_selectedForm ? _selectedForm.label : ''}</h5>
                                <div className='options-buttons'>
                                    {/* <button className="joyride-tour bg-transparent" onClick={() => startRide()}><Icon id={`joyride-icon`} className={`text-info fs-3`} name={`help-fill`} /></button> */}
                                    {/* <Tooltip
                                        placement="top"
                                        isOpen={tooltipOpen["joyride-icon"] || false}
                                        target="joyride-icon"
                                        toggle={() => toolTipToggle("joyride-icon")}
                                    >
                                        Start Tour
                                    </Tooltip> */}
                                    <button className='btn btn-primary choose-btn' onClick={() => {
                                        dispatch(triggerInlineFormChosen({
                                            active: true,
                                            id: _selectedForm.value,
                                            name: _selectedForm.label
                                        }))
                                        toggle()
                                    }}>Choose</button>
                                </div>
                            </div>
                            <div className="form-viewer-box nk-upload-form px-3">
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

                                            </li>
                                        </ul>
                                    )}
                                </div>


                            </div>
                        </>}
                </div>
            </div>

            <JoyrideComp
                steps={tourSteps}
                run={run}
                setRun={setRun}
            />

            <Modal toggle={toggleCloneModal} isOpen={cloneModal}>
                <CloneForm toggle={toggleCloneModal} toggleInline={toggle} selectedForm={clonnableForm} />
            </Modal>

        </div>

    )
}

export default ViewForms