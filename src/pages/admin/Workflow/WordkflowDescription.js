import React, { useState, useRef, useEffect } from "react";
import { Button } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Icon } from "../../../components/Component";


const AddDescription = ({ toggle, workflow, setWorkflow, setDescriptionEmptyError }) => {
  const store = useSelector(state => state.folders);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sectionName, setSectionName] = useState('');

  const [sectionError, setDescriptionError] = useState('')
  const [errorState, setErrorState] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const onSubmit = async () => {
    if (workflow?.workflowDescription?.trim() == '') {
      setDescriptionError('Please Enter a Proper Description!')
      setDescriptionEmptyError(true);
      setErrorState(true);
      return;
    }
    toggle();
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
          <h5 className="title mb-3">Description</h5>

          <div className="form-group">
            <textarea
              type="text"
              className={`form-control ${sectionError ? 'is-invalid' : ''}`}
              onChange={(e) => {
                setWorkflow({
                  ...workflow,
                  workflowDescription: e.target.value
                })
                setDescriptionEmptyError(false);
                setDescriptionError(false);
                setErrorState(false);
              }}
              value={workflow?.workflowDescription}
              ref={inputRef}
              onKeyDown={handlePress}
            />
            {errorState && <p style={{ color: 'red' }}>{sectionError}</p>}
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
                {location.pathname.includes('edit') ? 'Update' : 'Add'}
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AddDescription;
