import React, { useState, useRef, useEffect } from "react";
import { Icon, RSelect } from "../../../../components/Component";
import { Button } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { createSection, updateLoaderFlag } from "../../../../redux/folderSlice";
import * as API from '../../../../utils/API';
import { useNavigate } from "react-router";
import toast from "react-hot-toast";


const CreateFolder = ({ toggle }) => {
  const store = useSelector(state => state.folders);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sectionName, setSectionName] = useState('');

  const [sectionError, setSectionError] = useState('')
  const [errorState, setErrorState] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const onSubmit = async () => {

    if (sectionName == '') {
      setSectionError('Enter Section Name!')
      setErrorState(true);
      return;
    }

    dispatch(updateLoaderFlag({ loader: true, text: 'creating section' }));

    const sectionResponse = await API.createSection(sectionName);
    const { status, message } = sectionResponse;

    if (status) {
      dispatch(createSection({ name: sectionName, id: sectionResponse['data']['_id'] }));
      dispatch(updateLoaderFlag({ loader: false, text: '' }));
      setErrorState(false);
      toast.success(`Section created successfully`)
      toggle();
      navigate(`/section/${sectionResponse['data']['_id']}`);

    } else {
      dispatch(updateLoaderFlag({ loader: false, text: '' }));
      setSectionError(sectionResponse['message'])
      setErrorState(true);
      return;
    }
    // setErrorState(false);
    // dispatch(updateLoaderFlag({ loader: false, text: '' }));
    // toggle();
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
      <div className={`modal-body modal-body-md ${store?.loader && 'loading'}`}>
        <div className="nk-upload-form mb-0 create_section">
          <h5 className="title mb-3">Create Section</h5>

          <div className="form-group">
            <label className="form-label">Section Name</label>
            <input
              type="text"
              className={`form-control ${sectionError ? 'is-invalid' : ''}`}
              onChange={(e) => {
                setSectionName(e.target.value);
                setSectionError('')
                setErrorState(false);
              }}
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
                Create
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CreateFolder;
