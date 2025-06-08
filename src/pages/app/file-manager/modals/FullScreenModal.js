import React, { useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Icon } from '../../../../components/Component';
import Flow from '../../../admin/Workflow/Flow';
import { useDispatch, useSelector } from 'react-redux';
import { triggerInlineAddWorkflow, triggerInlineEditWorkflow, triggerInlinePrintWorkflow, triggerSingleWorkflowView } from '../../../../redux/folderSlice';
import ViewWorkflows from './ViewWorkflows';


function FullScreenModal({
    toggle,
    addNewWorflow,
    editWorkflow,
    viewWorkflows,
    setClickedAddNewWorkflow,
    setClickedEditWorkflow,
    setClickedViewWorkflows,
    setResetClicked,
    setInlineWorkflowModal,
    fetchAllWorkflows
}) {
    const dispatch = useDispatch();
    const addWorkflowState = useSelector(state => state.folders.inlineAddWorkflow);
    const [editFromViewPage, setEditFromViewPage] = useState(false);
    function renderScreen() {
        if (addNewWorflow || addWorkflowState) {
            return <Flow toggleInline={toggle} />
        } else if (editWorkflow || editFromViewPage) {
            return <Flow toggleInline={toggle} />
        } else if (viewWorkflows) {
            return <ViewWorkflows
                toggleInline={toggle}
                setClickedAddNewWorkflow={setClickedAddNewWorkflow}
                setClickedEditWorkflow={setClickedEditWorkflow}
                setClickedViewWorkflows={setClickedViewWorkflows}
                setResetClicked={setResetClicked}
                setInlineWorkflowModal={setInlineWorkflowModal}
                fetchAllWorkflows={fetchAllWorkflows}
                setEditFromViewPage={setEditFromViewPage}
            />
        }
    }
    return (
        <React.Fragment>
            <a
                href="#close"
                onClick={(ev) => {
                    ev.preventDefault();
                    dispatch(triggerInlineAddWorkflow({ active: false }))
                    dispatch(triggerInlinePrintWorkflow({
                        id: '',
                        name: '',
                        active: false
                    }))
                    dispatch(triggerInlineEditWorkflow({
                        id: '',
                        name: '',
                        active: false
                    }))
                    dispatch(triggerSingleWorkflowView({
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
                {/* {addNewWorflow ? <Flow toggleInline={toggle}/> : <></>} */}
                {renderScreen()}

            </div>
        </React.Fragment>
    )
}

export default FullScreenModal