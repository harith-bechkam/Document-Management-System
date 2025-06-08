import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

// import { ReactFormGenerator } from 'react-form-builder2';
// import 'react-form-builder2/dist/app.css';
// import './scss/bootstrap/bootstrap.scss';
// import '@fortawesome/fontawesome-free/css/all.min.css';


import FormBuilder, { Registry, ReactFormGenerator } from './Lib/src/index';
import './Lib/scss/application.scss'
import './scss/bootstrap/bootstrap.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';


import { Button } from "reactstrap";


const FormGenerator = ({ op, formId, schema, answers, handleFormChange, handleFormSubmit, handlePrevious, currentStep, stepsHeader,
    workflow, workflowistParam, workflowindParam
}) => {
    const navigate = useNavigate();
    return (
        <>
            {answers?.length != 0 ? (
                <div key={currentStep}>
                    <ReactFormGenerator
                        data={schema}
                        answer_data={answers}
                        read_only={false}
                        hide_actions={false}
                        onChange={handleFormChange}
                        onSubmit={handleFormSubmit}
                        submitButton={
                            <div className="multi-step-buttons" style={{ display: "flex", justifyContent: "flex-end" }}>
                                {currentStep > 0 && (
                                    <ul className="btn-toolbar g-4 align-center justify-end mx-3">
                                        <li>
                                            <Button type="button" color="primary" onClick={handlePrevious}>Previous</Button>
                                        </li>
                                    </ul>
                                )}

                                {currentStep < stepsHeader.length - 1 ? (
                                    <ul className="btn-toolbar g-4 align-center justify-start">
                                        <li>
                                            <button className="btn btn-primary">Next</button>
                                        </li>
                                    </ul>
                                ) : (
                                    <ul className="btn-toolbar g-4 align-center justify-start">
                                        <li>
                                            {op == "create" && <button className="btn btn-primary">Submit</button>}
                                            {op == "edit" && <button className="btn btn-primary">Update</button>}
                                        </li>

                                        <li>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={(ev) => {
                                                    ev.preventDefault();

                                                    workflow ?
                                                        // navigate(`/workflow/detail/Form/${workflowistParam}/${workflowindParam}`)
                                                        navigate(-1)
                                                        : navigate(`/details/${formId}?isFormSubmitted=true`)
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        }
                    />
                </div>
            ) :
                <div key={currentStep}>
                    <ReactFormGenerator
                        data={schema}
                        answer_data={answers}
                        read_only={false}
                        hide_actions={false}
                        onChange={handleFormChange}
                        onSubmit={handleFormSubmit}
                        submitButton={
                            <div className="multi-step-buttons" style={{ display: "flex", justifyContent: "flex-end" }}>
                                {currentStep > 0 && (
                                    <ul className="btn-toolbar g-4 align-center justify-end mx-3">
                                        <li>
                                            <Button type="button" color="primary" onClick={handlePrevious}>Previous</Button>
                                        </li>
                                    </ul>
                                )}

                                {currentStep < stepsHeader.length - 1 ? (
                                    <ul className="btn-toolbar g-4 align-center justify-start">
                                        <li>
                                            <button className="btn btn-primary">Next</button>
                                        </li>
                                    </ul>
                                ) : (
                                    <ul className="btn-toolbar g-4 align-center justify-start">
                                        <li>
                                            <button className="btn btn-primary">Submit</button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    workflow ? 
                                                    // navigate(`/workflow/detail/Form/${workflowistParam}/${workflowindParam}`)
                                                    navigate(-1) 
                                                    : navigate(`/details/${formId}?isFormSubmitted=true`)
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        }
                    />
                </div>
            }

        </>
    );
};

export default FormGenerator;