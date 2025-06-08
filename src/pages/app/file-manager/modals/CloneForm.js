import React, { useState, useRef, useEffect } from "react";
import { Button } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Icon } from "../../../../components/Component";
import * as API from '../../../../utils/API';
import { triggerInlineFormAdded, triggerInlineFormEdited } from "../../../../redux/folderSlice";

const CloneForm = ({
    toggle,
    selectedForm,
    toggleInline
}) => {
    const store = useSelector(state => state.folders);
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [cloneName, setCloneName] = useState('');

    const [cloneFormError, setCloneFormError] = useState('')
    const [errorState, setErrorState] = useState(false);

    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    const onSubmit = async () => {
        if (cloneName.trim() == '') {
            setCloneFormError('Please Enter a Form Name!')
            setErrorState(true);
            return;
        }
        
        let formResponse = await API.cloneFormBuilder(selectedForm.value,cloneName);
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
        toggleInline()

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
                    <h5 className="title mb-3">Clone {selectedForm?.label}</h5>

                    <div className="form-group">
                        <label className="form-label">Form Name</label>
                        <input
                            type="text"
                            className={`form-control ${cloneFormError ? 'is-invalid' : ''}`}
                            onChange={(e) => {
                                setCloneName(e.target.value);
                                setCloneFormError(false);
                                setErrorState(false);
                            }}
                            value={cloneName}
                            ref={inputRef}
                            onKeyDown={handlePress}
                        />
                        {errorState && <p style={{ color: 'red' }}>{cloneFormError}</p>}
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

export default CloneForm;
