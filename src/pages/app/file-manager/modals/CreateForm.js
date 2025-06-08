import React, { useState, useEffect } from "react";
import { Badge, Button, Label, Modal, ModalBody, ModalFooter, ModalHeader, Tooltip } from "reactstrap";
import './MultiStepLoader.css'
import MetaDataForm from "../components/MultiStep/MetaDataForm";
import { Icon } from "../../../../components/Component";
import CreateMultiForm from "../components/MultiStep/CreateForm";
import * as API from '../../../../utils/API';
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import CustomMetaData from "../../../admin/MetaData/Modals/CustomMetaData";
import { useLocation, useParams } from "react-router";
import { addNewFile, showjoyride, storeInlineEditFormTemplate, triggerInlineAddFormTemplateClick, triggerInlineEditFormTemplateClick, triggerInlineFormAdded, triggerInlineFormClick, triggerInlineFormEdited, triggerInlineSingleFormView, updateLoaderFlag } from "../../../../redux/folderSlice";
import FullScreenFormModal from "./FullScreenFormModal";
import JoyrideComp from "./Joyride";

const CreateForm = ({ toggle }) => {


    // const [stage, setStage] = useState([{
    //     target: '.fullscreen',
    //     content: 'This is my awesome feature!',
    // },
    // {
    //     target: '.progtrckr',
    //     content: 'This another awesome feature!',
    // }])
    // const [run, setRun] = useState(false);
    const params = useParams();
    const [formName, setFormName] = useState('');

    const [formType, setFormType] = useState('');
    const [typeOptions, setTypeOptions] = useState([
        { value: 'Single Submission', label: 'Polls/Voting' },
        { value: 'Multiple Submission', label: 'Survey Form' }
    ])

    const [formTemplate, setFormTemplate] = useState('');
    const [templatelist, setTemplateList] = useState([])
    const [templateOptions, setTemplateOptions] = useState([])
    const [isEditResponseAllowed, setIsEditResponseAllowed] = useState(false)

    const [metadataMode, setMetadataMode] = useState("skip")

    //DefaultMetaFields
    const [docNum, setDocNum] = useState('')
    const [notes, setNotes] = useState('')
    const [docTypeData, setDocTypeData] = useState([])
    const [keywordsData, setKeywordsData] = useState([])
    const [docTypeOptionsData, setDocTypeOptionsData] = useState([])
    const [keywordOptionsData, setKeywordOptionsData] = useState([])
    const [secdocTypeData, setSecDocTypeData] = useState([])
    const [secdocTypeOptionsData, setsecDocTypeOptionsData] = useState([])


    const [newformTemplate, setNewFormTemplate] = useState(false)
    const [viewformTemplate, setViewFormTemplate] = useState(false)
    const [editformTemplate, setEditFormTemplate] = useState(false)
    const [inlineFormModal, setInlineFormModal] = useState(false)
    //customMetaFields
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [customMetaDataOptions, setCustomMetaDataOptions] = useState([])
    const [selectedMetaDataOptions, setSelectedMetaDataOptions] = useState([])
    const [customMetaData, setCustomMetaData] = useState({})

    const [customMetaModal, setCustomMetaModal] = useState(false)
    const dispatch = useDispatch();
    const currentSection = useSelector(state => state.folders.currentSection);
    const store = useSelector(state => state.folders);
    const [refreshFlag, setRefreshFlag] = useState(false);

    const [run, setRun] = useState(false);

    const [tourSteps, setTourSteps] = useState([
        {
            target: ".tour-step-one",
            content: "Here you have to give a name for the form",
        },
        {
            target: ".tour-step-two",
            content: "Select the type of the form",
        },
        {
            target: ".tour-step-three",
            content: "Select the form template from the template options",
        },
        {
            target: ".tour-step-four",
            content: "Add a new form template",
        },
        {
            target: ".tour-step-five",
            content: "View existing form templates",
        },
        {
            target: ".skipmetadata-btn",
            content: "Skip the metadata tab and create form",
        },
        {
            target: ".addmetadata-btn",
            content: "Move to the metadata section",
        },
    ])

    function startRide() {
        setRun(true);
        setTimeout(() => {
            const joyride_beacon = document.querySelector(`.react-joyride__beacon`);
            joyride_beacon.click();

        }, 1000);
    }

    const [formError, setFormError] = useState({
        formName: '',
        formType: '',
        formTemplate: ''
    })

    const [formErr, setFormErr] = useState({
        formName: false,
        formType: false,
        formTemplate: false
    })

    const location = useLocation()
    const newInlineTemplateCreated = useSelector(state => state.folders.inlineFormCreated)

    useEffect(() => {
        fetchData()
    }, [newInlineTemplateCreated, refreshFlag])

    const Privilege = JSON?.parse(localStorage.getItem('privileges'));
    const privileges = {
        addWorkflow: Privilege?.workflow?.addWorkflow,
        updateWorkflow: Privilege?.workflow?.updateWorkflow,
    }

    const fetchData = async () => {
        debugger
        let customMetaDataFieldReponse = await API.getAllCustomMetaDataList()
        let docTypeResponse = await API.getAllDocumentType()
        let keywordsResponse = await API.getAllKeywords()
        let formBuilderResponse = await API.getAllFormBuilder()

        customMetaDataFieldReponse['status'] && setCustomMetaDataOptions(customMetaDataFieldReponse['data'])
        if (docTypeResponse?.['status']) {
            setDocTypeOptionsData(docTypeResponse['data']['documentTypeData']?.map(item => ({ label: item['name'], value: item['name'] })))
            setsecDocTypeOptionsData(docTypeResponse['data']['secDocumentTypeData']?.map(item => ({ label: item['name'], value: item['name'] })))
        }
        keywordsResponse['status'] && setKeywordOptionsData(keywordsResponse['data'].map(item => ({ label: item['name'], value: item['name'] })))

        formBuilderResponse['status'] && setTemplateOptions(
            formBuilderResponse['data'].map(item => ({
                label: item['name'],
                value: item['_id']
            }))
        )

        formBuilderResponse['status'] && setTemplateList(
            formBuilderResponse['data'].map(item => ({
                label: (
                    <div>
                        {item['name']}
                    </div>
                ),
                value: item['_id']
            }))
        )

    }

    const toggleInlineFormModal = () => {

        // dispatch(showjoyride({
        //     run: "SHOW",
        //     stages: [
        //         {
        //             target: '.fullscreen',
        //             content: 'This is my awesome feature!',
        //         },
        //         {
        //             target: '.p-class',
        //             content: 'This another p awesome feature!',
        //         }
        //     ]
        // }))
        // setFormTemplateModal(!formTemplateModal);
        setInlineFormModal(!inlineFormModal);

    }


    const toggleCustomMetaModal = () => {
        setCustomMetaModal(!customMetaModal)
    }

    function handleNext() {

        // if (formName == "" || formType == "" || formTemplate == "") {
        //     toast('Please fill required Field!', { icon: '⚠️' })
        //     return
        // }
        if (formName == "" || formType == "" || formTemplate == "") {
            setFormError({
                formName: 'Enter Form Name!',
                formType: 'Select Form Type!',
                formTemplate: 'Select Form Template'
            })
            setFormErr({
                formName: true,
                formType: true,
                formTemplate: true
            })
            return
        }
        if (formName == "") {
            setFormError({
                ...formError,
                formName: 'Enter Form Name!'
            })
            setFormErr({
                ...formErr,
                formName: true
            })
            return
        }
        if (formType == "") {
            setFormError({
                ...formError,
                formType: 'Select Form Type!'
            })
            setFormErr({
                ...formErr,
                formType: true
            })
            return
        }
        if (formTemplate == "") {
            setFormError({
                ...formError,
                formTemplate: 'Select Form Template'
            })
            setFormErr({
                ...formErr,
                formTemplate: true
            })
            return
        }


        if (docTypeData.length == 0) {
            toast('Please fill required field!', { icon: '⚠️' })
            return
        }
        handleSubmit()

    };




    async function handleSubmit() {

        // if (docTypeData.length == 0) {
        //   toast('Please fill required Field!', { icon: '⚠️' })
        //   return
        // }

        if (formName == "" && formType == "" && formTemplate == "") {
            setFormError({
                formName: 'Enter Form Name!',
                formType: 'Select Form Type!',
                formTemplate: 'Select Form Template'
            })
            setFormErr({
                formName: true,
                formType: true,
                formTemplate: true
            })
            return
        }
        if (formName == "") {
            setFormError({
                ...formError,
                formName: 'Enter Form Name!'
            })
            setFormErr({
                ...formErr,
                formName: true
            })

            return
        }
        if (formType == "") {
            setFormError({
                ...formError,
                formType: 'Select Form Type!'
            })
            setFormErr({
                ...formErr,
                formType: true
            })

            return
        }
        if (formTemplate == "") {
            setFormError({
                ...formError,
                formTemplate: 'Select Form Template'
            })
            setFormErr({
                ...formErr,
                formTemplate: true
            })
            return
        }

        if (!location) return;



        dispatch(updateLoaderFlag({ loader: true, text: 'Creating Form' }))
        const pathname = location.pathname
        const sectionRegex = /^\/section\/([a-fA-F0-9]{24})$/;
        const folderRegex = /^\/folder\/([a-fA-F0-9]{24})$/;

        const sectionMatched = sectionRegex.exec(pathname)
        const folderMatched = folderRegex.exec(pathname)


        let docTypeDataValue = docTypeData?.map(item => item.value);
        let keywordsDataValue = keywordsData?.map(item => item.value);

        let defaultMetaData = (!docNum && !notes && docTypeDataValue.length == 0 && keywordsDataValue.length == 0) ? null : { docNum, notes, docTypeDataValue, keywordsDataValue }
        let custmetafield = Object.keys(customMetaData)?.length == 0 ? null : customMetaData

        let sectionId = sectionMatched ? sectionMatched[1] : currentSection
        let folderId = folderMatched ? folderMatched[1] : null


        if (!sectionMatched || !folderMatched) {
            if (location.pathname.includes('share')) {
                folderId = params.id;
                const _detailsRespo = await API.getDetails(folderId);
                if (_detailsRespo.status) {
                    sectionId = _detailsRespo.data?.data?.sectionId
                }
            }
        }

        let formResponse;

        dispatch(updateLoaderFlag({ loader: true, text: 'Creating Form' }))
        // formResponse = await API.createForm(formName, formType, formTemplate, isEditResponseAllowed, sectionId, folderId, defaultMetaData, custmetafield)
        formResponse = await API.createForm(formName, formType, formTemplate, true, sectionId, folderId, defaultMetaData, custmetafield, metadataMode)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        let { status } = formResponse
        toast.success(`${formResponse?.message}`)

        if (!status) {
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            return toast.error(`${formResponse?.['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
        }

        let { data } = formResponse

        //if need we activate the workflow
        // data?.['sectionId'] != 'workflowupload' && (await checkAndStartWorkflow(data))

        dispatch(addNewFile(data))
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        dispatch(triggerInlineFormClick({
            action: false
        }))
        dispatch(triggerInlineAddFormTemplateClick({
            action: false
        }))
        dispatch(triggerInlineEditFormTemplateClick({
            active: false
        }))
        dispatch(triggerInlineFormAdded({
            active: false,
            id: '',
            name: ''
        }))
        dispatch(triggerInlineFormEdited({
            active: false,
            id: '',
            name: ''
        }))
        dispatch(storeInlineEditFormTemplate({
            active: false,
            id: '',
            name: ''
        }))
        dispatch(triggerInlineSingleFormView({
            active: false,
            id: '',
            name: ''
        }))
        toggle()

    };


    const checkAndStartWorkflow = async (item) => {

        //before his parent & ancestor parent check himself
        let { status, message, lastRevisionNo } = await checkBeforeEnableThisBtn(item['_id'], 'form')
        if (lastRevisionNo == '' || !lastRevisionNo || lastRevisionNo == undefined || lastRevisionNo == '-') {
            lastRevisionNo = 0
        }

        if (message == "Form is in under Workflow!") {
            toast(`${message}`, { icon: '⚠️' })
            return
        }

        //check his parent & ancestor parent worklow is present or not,if present update it in current item
        let pathRespo = await API.getDirectoryPath(item['_id']);
        if (!pathRespo.status) return toast.error(`Some Error Occured While fetching ${item['name']} Parent! Refresh and try again`);

        const result = pathRespo.data.reduce((acc, path) => {
            if (path._id != item._id && path.workflow !== null) {
                acc.hasWorkflow = true;
                acc.workflows.push(path);
            }
            return acc
        }, { hasWorkflow: false, workflows: [] })



        if (result['hasWorkflow']) {
            let parentData = result['workflows'][result['workflows'].length - 1]
            let togoName = 'form'
            let togoId = item['_id']
            parentData['workflow']['revisionNo'] = lastRevisionNo + 1 || 1

            try {
                await API.updateWorkflowInFiles(parentData['workflow'], togoName, togoId, lastRevisionNo + 1 || 1)
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


    const handleSelectedValue = (event) => {
        setMetadataMode(event.target.value)
    }


    return (
        <React.Fragment>

            <ModalHeader className="border-bottom-0 position-relative">
                <h5 className="title m-0">Create Form</h5>

                <a
                    href="#close"
                    onClick={(ev) => {
                        ev.preventDefault();
                        toggle();
                    }}
                    className="close position-absolute end-0 top-0 mt-2 me-2"
                >
                    <Icon name="cross-sm" />
                </a>
            </ModalHeader>

            <div className={`modal-body modal-body-md ${store?.loader && 'loading'}`} style={{ paddingBottom: "3em" }}>
                <div className="nk-upload-form mb-0">
                  

                    {/* <center>

                        <ol className="progtrckr">
                            {stepsHeader.map((stepObj, index) => {
                                let className = "progtrckr-todo";

                                if (index < currentStep) {
                                    className = "progtrckr-done";
                                }
                                else if (index == currentStep) {
                                    className = "progtrckr-doing";
                                }

                                return (
                                    <li key={index} className={className} value={index}>
                                        <em>{index + 1}</em><span>{stepObj.label}</span>
                                    </li>
                                );
                            })}
                        </ol>
                    </center> */}

                    {/* <div>{steps[currentStep].component}</div> */}
                    <div className="nk-upload-form mb-0">

                        <CreateMultiForm
                            formName={formName}
                            setFormName={setFormName}
                            typeOptions={typeOptions}
                            setTypeOptions={setTypeOptions}
                            formType={formType}
                            setFormType={setFormType}
                            formTemplate={formTemplate}
                            setFormTemplate={setFormTemplate}
                            templateOptions={templateOptions}
                            setTemplateOptions={setTemplateOptions}
                            templatelist={templatelist}
                            isEditResponseAllowed={isEditResponseAllowed}
                            setIsEditResponseAllowed={setIsEditResponseAllowed}
                            formError={formError}
                            setFormError={setFormError}
                            formErr={formErr}
                            setFormErr={setFormErr}
                            handleNext={handleNext}
                            setEditFormTemplate={setEditFormTemplate}
                            setNewFormTemplate={setNewFormTemplate}
                            setViewFormTemplate={setViewFormTemplate}
                            setInlineFormModal={setInlineFormModal}
                            setRefreshFlag={setRefreshFlag}
                        />
                        {(formName && formType && formTemplate) &&
                            <>
                                <div className="form-group fs-6 pb-4 mt-4">
                                    <Label className="form-label" htmlFor="Metadata">
                                        Metadata <span className="required">*</span>
                                    </Label>

                                    <div className="form-control-wrap">
                                        <div>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="metadataOptions"
                                                    id="inlineRadio2"
                                                    value="manual"
                                                    checked={metadataMode === "manual"}
                                                    onChange={handleSelectedValue}
                                                />
                                                <label className="form-check-label" htmlFor="inlineRadio2">
                                                    Manual
                                                </label>
                                            </div>

                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="metadataOptions"
                                                    id="inlineRadio3"
                                                    value="skip"
                                                    checked={metadataMode === "skip"}
                                                    onChange={handleSelectedValue}
                                                />
                                                <label className="form-check-label" htmlFor="inlineRadio3">
                                                    Skip
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        }

                        {metadataMode == "manual" &&
                            <MetaDataForm
                                defaultMetaData={[
                                    {
                                        fieldName: 'Form Number',
                                        type: 'text',
                                        id: "docNum",
                                        placeholder: "Enter Form Number",
                                        required: false
                                    },
                                    {
                                        fieldName: 'Primary Form Type',
                                        type: 'tag',
                                        id: "doctype",
                                        placeholder: "Enter Primary Form Type",
                                        required: true,
                                    },
                                    {
                                        fieldName: 'Secondary Form Type',
                                        type: 'tag',
                                        id: "doctype",
                                        placeholder: "Enter Secondary Form Type",
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
                                docTypeData={docTypeData} setDocTypeData={setDocTypeData}
                                keywordsData={keywordsData} setKeywordsData={setKeywordsData}
                                docTypeOptionsData={docTypeOptionsData} setDocTypeOptionsData={setDocTypeOptionsData}
                                keywordOptionsData={keywordOptionsData} setKeywordOptionsData={setKeywordOptionsData}
                                handleSubmit={handleSubmit}
                                toggleCustomMetaModal={toggleCustomMetaModal}
                                secdocTypeOptionsData={secdocTypeOptionsData} setsecDocTypeOptionsData={setsecDocTypeOptionsData}
                                secdocTypeData={secdocTypeData} setSecDocTypeData={setSecDocTypeData}
                            />
                        }
                    </div>

                    <JoyrideComp
                        steps={tourSteps}
                        run={run}
                        setRun={setRun}
                    />

                    <div className="multi-step-buttons form-create-buttons">
                        <div>
                            {privileges.addWorkflow && <>
                                <span className="Inline-Form-Tab tour-step-four"
                                    onClick={() => {
                                        dispatch(triggerInlineFormClick({
                                            action: true
                                        }))
                                        dispatch(triggerInlineAddFormTemplateClick({
                                            action: true
                                        }))
                                        setNewFormTemplate(true);
                                        setEditFormTemplate(false);
                                        setViewFormTemplate(false);
                                        setInlineFormModal(true);
                                    }}

                                >New Template</span>
                                <span className="form-inline-pipe">|</span>
                            </>}
                            <span className="Inline-Form-Tab tour-step-five"
                                onClick={() => {
                                    dispatch(triggerInlineFormClick({
                                        action: true
                                    }))
                                    dispatch(triggerInlineAddFormTemplateClick({
                                        action: false
                                    }))
                                    setNewFormTemplate(false);
                                    setViewFormTemplate(true);
                                    setEditFormTemplate(false);
                                    setInlineFormModal(true);
                                }}
                            >View Templates</span>

                        </div>
                        <div>
                            <ul className="btn-toolbar g-4 align-center justify-end">
                                <li>
                                    <a
                                        href="#"
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            toggle();
                                        }}
                                    >
                                        Cancel
                                    </a>
                                </li>
                                <li>
                                    <Button
                                        type="button"
                                        color="primary"
                                        onClick={handleSubmit}
                                        disabled={formName == "" && formType == "" && formTemplate == ""}
                                    >
                                        Create
                                    </Button>

                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
                <Modal isOpen={customMetaModal} size="md" toggle={toggleCustomMetaModal}>
                    <CustomMetaData toggle={toggleCustomMetaModal} op={"Normal Modal"} setCustomMetaDataOptions={setCustomMetaDataOptions} />
                </Modal>

                <Modal isOpen={inlineFormModal} toggle={toggleInlineFormModal} fullscreen>
                    <FullScreenFormModal
                        toggle={toggleInlineFormModal}
                        newformTemplate={newformTemplate}
                        viewformTemplate={viewformTemplate}
                        editformTemplate={editformTemplate}
                    />
                </Modal>

            </div>


        </React.Fragment>
    )
}

export default CreateForm;