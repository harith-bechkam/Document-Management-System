import React, { useState, useRef, useEffect } from "react";
import { Button } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Icon } from "../../../../components/Component";
import * as API from '../../../../utils/API';
import { triggerInlineEditWorkflow, triggerInlineModalNavigate, triggerWorkflowCloned } from "../../../../redux/folderSlice";



const CloneWorkflow = ({ toggle, selectedWF,  setClickedAddNewWorkflow,
    setClickedEditWorkflow,
    setClickedViewWorkflows,
    setResetClicked,
    setInlineWorkflowModal,
    fetchAllWorkflows
 }) => {
    const store = useSelector(state => state.folders);
    const location = useLocation();
    const dispatch = useDispatch();
    const parentDirectory = useSelector(state=>state.folders.inheritSaveCurrentDirectory)
    const navigate = useNavigate();
    const [cloneName, setCloneName] = useState('');

    const [cloneWFError, setCloneWFError] = useState('')
    const [errorState, setErrorState] = useState(false);

    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    const onSubmit = async () => {
        if (cloneName.trim() == '') {
            setCloneWFError('Please Enter a Proper Workflow Name!')
            setErrorState(true);
            return;
        }
        const cloneResponse = await API.cloneWorkflow(cloneName,selectedWF.workflowId);
        if(!cloneResponse.status){
            return toast.error(cloneResponse?.message);
        }
        dispatch(triggerWorkflowCloned({
            action:true,
            id: cloneResponse.data._id,
            name: cloneName,
        }))
        dispatch(triggerInlineModalNavigate({link:`/setUpWorkflow/folder/${parentDirectory}/edit`}))
        toggle();
        dispatch(triggerInlineEditWorkflow({
            id: cloneResponse.data._id,
            name: cloneName,
            active: true
        }))
        fetchAllWorkflows()
        setClickedAddNewWorkflow(false);
        setClickedEditWorkflow(true);
        setClickedViewWorkflows(false);
        setResetClicked(false);
        setInlineWorkflowModal(true)
    };

    const handlePress = (e) => {
        if (e.key == 'Enter') {
            onSubmit();
        }
    }


    return (
        <React.Fragment>
            <a
                href="#close"
                onClick={(ev) => {
                    ev.preventDefault();
                    toggle();
                }}
                className="close"
            >
                <Icon name="cross-sm"></Icon>
            </a>
            <div className={`modal-body modal-body-md`}>
                <div className="nk-upload-form mb-0 create_section">
                    <h5 className="title mb-3">Clone {selectedWF?.workflowName}</h5>

                    <div className="form-group">
                        <label className="form-label">Workflow Name</label>
                        <input
                            type="text"
                            className={`form-control ${cloneWFError ? 'is-invalid' : ''}`}
                            onChange={(e) => {
                                setCloneName(e.target.value);
                                setCloneWFError(false);
                                setErrorState(false);
                            }}
                            value={cloneName}
                            ref={inputRef}
                            onKeyDown={handlePress}
                        />
                        {errorState && <p style={{ color: 'red' }}>{cloneWFError}</p>}
                    </div>
                    <ul className="btn-toolbar g-4 align-center justify-end">
                        <li>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // reset();
                                    toggle();
                                }}
                                className="link link-primary"
                            >
                                Cancel
                            </a>
                        </li>
                        <li>
                            <Button color="primary"
                                onClick={() => onSubmit()}
                            >
                                Clone
                            </Button>
                        </li>
                    </ul>
                </div>
            </div>
        </React.Fragment>
    );
};

export default CloneWorkflow;
