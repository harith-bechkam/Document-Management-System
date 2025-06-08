import React, { useEffect, useRef } from "react";
import Select from "react-select";
import { Icon } from "../../../../../components/Component";
import { useDispatch, useSelector } from "react-redux";
import { storeInlineEditFormTemplate, triggerInlineAddFormTemplateClick, triggerInlineEditFormTemplateClick, triggerInlineFormAdded, triggerInlineFormClick, triggerInlineFormEdited, triggerInlineSingleFormView, updateLoaderFlag } from "../../../../../redux/folderSlice";
import Swal from "sweetalert2";
import * as API from '../../../../../utils/API';

const CreateForm = ({ formName,
    setFormName,
    typeOptions,
    setTypeOptions,
    formType,
    setFormType,
    formTemplate,
    setFormTemplate,
    templateOptions,
    setTemplateOptions,
    templatelist,
    isEditResponseAllowed,
    setIsEditResponseAllowed,
    formError,
    setFormError,
    formErr,
    setFormErr,
    handleNext,
    setEditFormTemplate,
    setNewFormTemplate,
    setViewFormTemplate,
    setInlineFormModal,
    setRefreshFlag
}) => {

    const Privilege = JSON?.parse(localStorage.getItem('privileges'));
    const privileges = {
        addWorkflow: Privilege?.workflow?.addWorkflow,
        updateWorkflow: Privilege?.workflow?.updateWorkflow,
        deleteWorkflow: Privilege?.workflow?.deleteWorkflow
    }
    const dispatch = useDispatch();
    const newInlineTemplateCreated = useSelector(state => state.folders.inlineFormCreated)
    const inlineTemplateEdited = useSelector(state => state.folders.inlineFormEdited);
    const inlineFormChosen = useSelector(state => state.folders.inlineFormChosen);

    const inputRef = useRef(null);
    const handleTypeChange = async (selectedOption) => {
        setFormType(selectedOption)
        setFormError({
            ...formError,
            formType: ''
        })
        setFormErr({
            ...formErr,
            formType: false
        })

    }

    const handleTemplateChange = async (selectedOption) => {
        if (!selectedOption) {
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
        }
        setFormTemplate(selectedOption)
        setFormError({
            ...formError,
            formTemplate: ''
        })
        setFormErr({
            ...formErr,
            formTemplate: false
        })

    }

    useEffect(() => {
        inputRef.current.focus();
        checkInlineStatus()
    }, [newInlineTemplateCreated, inlineTemplateEdited, inlineFormChosen]);

    async function checkInlineStatus() {
        if (newInlineTemplateCreated.status) {

            setFormTemplate({
                label: newInlineTemplateCreated.name,
                value: newInlineTemplateCreated.id
            })
            setFormError({
                ...formError,
                formTemplate: ''
            })
            setFormErr({
                ...formErr,
                formTemplate: false
            })
        }
        if (inlineTemplateEdited.status) {

            setFormTemplate({
                label: inlineTemplateEdited.name,
                value: inlineTemplateEdited.id
            })
            setFormError({
                ...formError,
                formTemplate: ''
            })
            setFormErr({
                ...formErr,
                formTemplate: false
            })
            dispatch(triggerInlineEditFormTemplateClick({
                active: false
            }))
            dispatch(triggerInlineFormEdited({
                active: false,
                id: '',
                name: ''
            }))
        }
        if (inlineFormChosen.status) {

            setFormTemplate({
                label: inlineFormChosen.name,
                value: inlineFormChosen.id
            })
            setFormError({
                ...formError,
                formTemplate: ''
            })
            setFormErr({
                ...formErr,
                formTemplate: false
            })
        }
        //clear these states in the submit function
    }

    const handleCheckboxChange = (e) => {
        setIsEditResponseAllowed(e.target.checked)
    }

    const handlePress = (e) => {
        if (e.key == 'Enter') {
            handleNext();
        }
    }

    const CustomOption = (props) => {
        const { data, innerRef, innerProps } = props;
        return (
            <div ref={innerRef} {...innerProps} className="workflow-options-select"
            >
                <span>{data.label}</span>
                <div className="form-select-actions">
                    <Icon
                        title='View'
                        className={`form-template-view `}
                        name={`info-i`}
                        onClick={(e) => {
                            e.stopPropagation()
                            dispatch(triggerInlineSingleFormView({
                                active: true,
                                id: data.value,
                                name: data.label
                            }))

                            setViewFormTemplate(true);
                            setEditFormTemplate(false);
                            setNewFormTemplate(false);
                            setInlineFormModal(true)
                        }}
                    />
                    {privileges.updateWorkflow && <Icon
                        className={`form-template-edit`}
                        name="edit"
                        onClick={(e) => {
                            e.stopPropagation()
                            dispatch(triggerInlineFormClick({
                                action: true
                            }))
                            dispatch(triggerInlineEditFormTemplateClick({
                                active: true
                            }))
                            dispatch(storeInlineEditFormTemplate({
                                active: true,
                                id: data.value,
                                name: data.label
                            }))
                            dispatch(triggerInlineAddFormTemplateClick({
                                action: false
                            }))
                            setEditFormTemplate(true);
                            setNewFormTemplate(false);
                            setViewFormTemplate(false);
                            setInlineFormModal(true);
                        }}
                    />}
                    {privileges.deleteWorkflow && <Icon
                        className={`form-template-delete text-danger`}
                        name="trash"
                        title='Delete'
                        onClick={(e) => {
                            e.stopPropagation()
                            Swal.fire({
                                icon: 'warning',
                                title: `Are you sure?`,
                                text: `You are about to delete the workflow '${data.label}'!`,
                                showCancelButton: true,
                                confirmButtonText: `Yes, delete it`
                            }).then(async res => {
                                if (res.isConfirmed) {
                                    dispatch(updateLoaderFlag({ loader: true, text: 'Creating Form...' }))
                                    const deleteRespo = await API.deleteFormBuilder(data.value);
                                    if (!deleteRespo.status) {
                                        dispatch(updateLoaderFlag({ loader: false, text: '' }))
                                        return toast.error(`Unable to delete form`);
                                    }
                                    setRefreshFlag(prev => !prev);
                                    dispatch(updateLoaderFlag({ loader: false, text: '' }))
                                }
                            })
                        }}
                    />}
                </div>
            </div>
        );
    };

    const customFilter = (option, inputValue) => {
        const label = option.label.toLowerCase();
        const searchValue = inputValue.toLowerCase();

        return label.includes(searchValue);
    };


    return (
        <>
            <div className="form-group mb-3">
                <div className="tour-step-one">
                    <label className="form-label">Form Name <span className="required">*</span> </label>
                    <input

                        type="text"
                        id="formName"
                        name='formName'
                        className="form-control"
                        value={formName}
                        onChange={(e) => {
                            setFormName(e.target.value)
                            setFormError({
                                ...formError,
                                formName: ''
                            })
                            setFormErr({
                                ...formErr,
                                formName: false
                            })
                        }}
                        ref={inputRef}
                        onKeyDown={handlePress}
                    // autoFocus
                    />
                </div>
                {formErr.formName && <p style={{ color: 'red' }}>{formError.formName}</p>}
                <div className="tour-step-two form-group mt-3">
                    <label className="form-label" htmlFor="type">Type<span style={{ color: 'red' }}> *</span></label>
                    <Select
                        id="type"
                        options={typeOptions}
                        value={formType}
                        placeholder='Select Type..'
                        onChange={handleTypeChange}
                        onKeyDown={handlePress}
                    />
                </div>


                {formErr.formType && <p style={{ color: 'red' }}>{formError.formType}</p>}
                <div className="tour-step-three form-group mt-3">
                    <label className="form-label" htmlFor="template">Template<span style={{ color: 'red' }}> *</span></label>
                    <Select
                        id="template"
                        options={templateOptions}
                        value={formTemplate}
                        isClearable={true}
                        placeholder='Select Template..'
                        onChange={handleTemplateChange}
                        onKeyDown={handlePress}
                        components={{ Option: CustomOption }}
                        filterOption={customFilter}
                    />
                </div>
                {formErr.formTemplate && <p style={{ color: 'red' }}>{formError.formTemplate}</p>}



            </div>


        </>
    )
}

export default CreateForm;