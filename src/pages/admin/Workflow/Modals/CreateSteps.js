import React, { useEffect, useState, useRef } from "react";
import { Button } from "reactstrap";
import Select from "react-select";
import toast from "react-hot-toast";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import * as API from '../../../../utils/API';

const CreateSteps = ({ op, editData = null, close, handleCreateSteps }) => {
  const [formData, setFormData] = useState({
    process_name: '',
    // type: {},
    // url: '',

    // isLastStep: false,
    // isErrorStep: false
  })

  // const [processTypeOptions, setProcessTypeOptions] = useState([])

  const store = useSelector(state => state.folders);
  const inputRef = useRef(null);


  const [stepNameError, setStepNameError] = useState('');
  const [stepNameErr, setStepNameErr] = useState(false);
  const [matchedSteps, setMatchedSteps] = useState([]);

  useEffect(() => {
    inputRef.current.focus();
  }, []);


  useEffect(() => {

    if (op == 'Create') {
      setFormData({
        process_name: ''
      })
    }

    if (op == "Edit") {
      setFormData({
        process_name: editData['stepName']
      })
    }

  }, [])

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;


    if (type === 'radio') {
      if (name === 'isLastStep') {
        // setFormData({
        //   ...formData,
        //   isLastStep: checked,
        //   isErrorStep: !checked
        // });
      } else if (name === 'isErrorStep') {
        // setFormData({
        //   ...formData,
        //   isErrorStep: checked,
        //   isLastStep: !checked
        // });
      }
    } else {
      if (formData["process_name"]?.length > 1) {
        let stepsResponse = await API.getStepsList(
          { stepName: formData["process_name"] }, 1
        )
        var { status } = stepsResponse
        if (status) {
          var { data } = stepsResponse
          debugger
          setMatchedSteps(data)
        }
      }
      setFormData({
        ...formData,
        [name]: value
      });
      setStepNameError('')
      setStepNameErr(false);
    }
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    let { process_name } = formData;

    if (!process_name) {
      // return toast.error('Please fill required fields');
      setStepNameError('Enter Step Name!')
      setStepNameErr(true);
      return
    }

    handleCreateSteps(formData);
    close()
  }

  return (

    <div className={`modal-body modal-body-md ${store?.loader && 'loading'}`}>
      <div className="nk-upload-form mb-0">
        <h5 className="title mb-3">{op == "Edit" ? 'Update ' : 'Add '}Step  </h5>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="process_name">Step Name<span style={{ color: 'red' }}> *</span></label>
            <input
              type="text"
              id="process_name"
              className="form-control"
              name="process_name"
              value={formData.process_name}
              onChange={handleChange}
              autoComplete="off"
              ref={inputRef}
            />
            {stepNameErr && <p style={{ color: 'red' }}>{stepNameError}</p>}
          </div>
          <div className="availableSteps">
          {(matchedSteps.length > 0) && (formData["process_name"]?.length > 1) &&
            <>
              <span><strong>Availabe Steps-</strong></span>
              <ul className="g-4 available-steps">
                {matchedSteps.map((elem, idx) => {
                  return <li key={elem._id}>
                    <p>{elem.stepName}</p>
                  </li>
                })}
              </ul>
            </>}
            </div>
          <ul className="btn-toolbar g-4 align-center justify-end">
            <li>
              {/* <a
                href="#"
                className="link link-primary"
                onClick={close}
              >
                Cancel
              </a> */}
              <Button
                color="link"
                className="link link-primary"
                onClick={close}
              >
                Cancel
              </Button>
            </li>
            <li>
              <Button color="primary" type="submit">
                {op == "Edit" ? 'Update' : 'Create'}
              </Button>
            </li>
          </ul>
         

        </form>
      </div>
    </div >

  );
};

CreateSteps.propTypes = {
  close: PropTypes.func.isRequired,
  handleCreateSteps: PropTypes.func.isRequired
};

export default CreateSteps;
