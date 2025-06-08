import React, { useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Icon } from '../../../../components/Component';
import { useDispatch, useSelector } from 'react-redux';
import StepBuild from '../../../admin/FormBuilder/StepBuild';
import { storeInlineEditFormTemplate, triggerInlineAddFormTemplateClick, triggerInlineEditFormTemplateClick, triggerInlineFormAdded, triggerInlineFormClick, triggerInlineFormEdited, triggerInlineSingleFormView } from '../../../../redux/folderSlice';
import ViewForms from './ViewForms';


function FullScreenFormModal({
    toggle,
    newformTemplate,
    viewformTemplate,
    editformTemplate
}) {
    const dispatch = useDispatch();
    const isNewTemplateClicked = useSelector(state => state.folders.inlineAddFormTemplateClicked);
    const editTemplateClicked = useSelector(state => state.folders.inlineEditFormTemplateClicked);

    function renderScreen() {
        if(newformTemplate||isNewTemplateClicked){
            return <StepBuild toggle={toggle}/>
        }else if(editformTemplate||editTemplateClicked){
            return <StepBuild toggle={toggle}/>
        }else if(viewformTemplate){
            return <ViewForms toggle={toggle}/>
        }
    }
    return (
        <React.Fragment>
            <a
                href="#close"
                onClick={(ev) => {
                    ev.preventDefault();
                    dispatch(triggerInlineFormClick({
                        action:false
                    }))
                    dispatch(triggerInlineAddFormTemplateClick({
                        action:false
                    }))
                    dispatch(triggerInlineEditFormTemplateClick({
                        active:false
                    }))
                    dispatch(triggerInlineFormAdded({
                        active:false,
                        id:'',
                        name:''
                    }))
                    dispatch(triggerInlineFormEdited({
                        active:false,
                        id:'',
                        name:''
                    }))
                    dispatch(storeInlineEditFormTemplate({
                        active:false,
                        id:'',
                        name:''
                    }))
                    dispatch(triggerInlineSingleFormView({
                        active:false,
                        id:'',
                        name:''
                    }))
                    toggle();
                }}
                className="close"
            >
                <Icon name="cross-sm"></Icon>
            </a>
            <div className='fullscreen-modal-content'>
                {renderScreen()}

            </div>
        </React.Fragment>
    )
}

export default FullScreenFormModal