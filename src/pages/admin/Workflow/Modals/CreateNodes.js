import React, { useEffect, useState, useRef } from "react";
import { Button } from "reactstrap";
import Select from "react-select";
import toast from "react-hot-toast";
import { useLocation } from "react-router";

const CreateNodes = ({ allSteps, data, close, handleCreateNodes, handleDelete, workflow }) => {
    const [formData, setFormData] = useState({
        id: '',
        stepName: '',
        success: null,
        error: null,
        // route: ''
    })
    const [successRouteOptions, setSuccessRouteOptions] = useState([])
    const [errorRouteOptions, setErrorRouteOptions] = useState([])

    const [fullsteps, setFullSteps] = useState([])
    const [finalStep, setFinalStep] = useState(false)

    const [stepNameError, setStepNameError] = useState('');
    const [stepNameErr, setStepNameErr] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current.focus();
    }, []);


    useEffect(() => {

        var steps = allSteps
            .map(val => ({ label: val['stepName'], value: val['_id'] }))

        let counter = steps.length
        var successNode = null, errorNode = null

        var srcNode = workflow['nodes'].find(item => item['data']['label'] == data['stepName'])
        var edges = workflow['edges'].filter(item => item['source'] == srcNode['id'])

        for (var val of edges) {

            if (val.style.stroke == 'green') {
                successNode = findNode(val.target).map(item => ({ label: item.data.label, value: item.data.id }))

                if (successNode) {
                    !steps.some(step => step.label == successNode[0]['label']) && steps.push({ label: successNode[0]['label'], value: `custom_${++counter}` })
                }
            }

            if (val.style.stroke == 'red') {
                errorNode = findNode(val.target).map(item => ({ label: item.data.label, value: item.data.id }))

                if (errorNode) {
                    !steps.some(step => step.label == errorNode[0]['label']) && steps.push({ label: errorNode[0]['label'], value: `custom_${++counter}` })
                }
            }

        }

        setFullSteps(steps)


        // var succesSteps = allSteps
        //     .filter(item => (item['_id'] != data['_id'] && !item['isErrorStep'] && item['isLastStep']) || (item['_id'] != data['_id'] && !item['isErrorStep'] && !item['isLastStep']))
        //     .map(val => ({ label: val['stepName'], value: val['_id'] }))

        // var errorSteps = allSteps
        //     .filter(item => item['isErrorStep'] && !item['isLastStep'])
        //     .map(val => ({ label: val['stepName'], value: val['_id'] }))


        setUpNodes(steps)

    }, [])

    const findNode = (id) => {
        return workflow['nodes'].filter(item => item['id'] == id)
    }

    const setUpNodes = async (allstep) => {
        var srcNode = workflow['nodes'].find(item => item['data']['label'] == data['stepName'])
        var edges = workflow['edges'].filter(item => item['source'] == srcNode['id'])

        var successNode = null, errorNode = null, routeNode = []


        if (srcNode) {
            if (srcNode.data.label == "Publish") {
                setFinalStep(true)
            }
            else {
                setFinalStep(false)
            }
        }

        if (edges.length == 0) {
            //for selected currnode there is no success,error
            setSuccessRouteOptions(allstep.filter(item => item.label != srcNode.data.label))
            setErrorRouteOptions(allstep.filter(item => item.label != srcNode.data.label))
        }


        var successOptionsFound = false, errorOptionsFound = false

        for (var val of edges) {

            if (val.style.stroke == 'green') {
                successNode = findNode(val.target).map(item => ({ label: item.data.label, value: item.data.id }))

                if (successNode) {
                    errorOptionsFound = true
                    setErrorRouteOptions(allstep.filter(item => item.label != successNode[0]['label'] && item.label != srcNode.data.label))
                }

            }

            if (val.style.stroke == 'red') {
                errorNode = findNode(val.target).map(item => ({ label: item.data.label, value: item.data.id }))

                if (errorNode) {
                    successOptionsFound = true
                    setSuccessRouteOptions(allstep.filter(item => item.label != errorNode[0]['label'] && item.label != srcNode.data.label))
                }

            }

        }


        if (successOptionsFound == false) {
            setSuccessRouteOptions(allstep.filter(item => item.label != srcNode.data.label))
        }

        if (errorOptionsFound == false) {
            setErrorRouteOptions(allstep.filter(item => item.label != srcNode.data.label))
        }



        setFormData({
            id: data['_id'],
            stepName: data['stepName'],
            success: successNode ? allstep.find(item => item['label'] == successNode[0]['label']) : null,
            error: errorNode ? allstep.find(item => item['label'] == errorNode[0]['label']) : null
        })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value
        })
        setStepNameError('')
        setStepNameErr(false);
    }

    const handleSuceessRouteChange = async (selectedOption) => {
        setFormData({
            ...formData,
            success: selectedOption
        })

        var remStepOptions = fullsteps.filter(item => item.value != selectedOption.value && item.label != data['stepName'])
        setErrorRouteOptions(remStepOptions)
    }


    const handleErrorRouteChange = async (selectedOption) => {
        setFormData({
            ...formData,
            error: selectedOption
        })

        var remStepOptions = fullsteps.filter(item => item.value != selectedOption.value && item.label != data['stepName'])
        setSuccessRouteOptions(remStepOptions)
    }

    // const handleRoutesChange = async (selectedOption) => {
    //     setFormData({
    //         ...formData,
    //         route: selectedOption
    //     })
    // }

    const onSubmit = async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        var { stepName } = formData;

        if (!stepName) {
            // return toast.error('Please fill required fields');
            setStepNameError('Enter Step Name!')
            setStepNameErr(true);
            return
        }

        handleCreateNodes(formData)
        close()
    }

    return (
        <React.Fragment>
            <div className="modal-body modal-body-md">
                <div className="nk-upload-form mb-0">
                    <h5 className="title mb-3">Step Setup</h5>
                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label className="form-label">Step Name<span style={{ color: 'red' }}> *</span></label>
                            <input
                                type="text"
                                className="form-control"
                                name="stepName"
                                disabled={formData['stepName'] == "Publish" ? true : false}
                                value={formData['stepName']}
                                onChange={handleChange}
                                ref={inputRef}
                            />
                            {stepNameErr && <p style={{ color: 'red' }}>{stepNameError}</p>}
                        </div>

                        {!finalStep &&
                            <>
                                {!data['isLastStep'] && (<>
                                    <div className="form-group">
                                        <label className="form-label Success Route">Accept Route</label>
                                        <Select
                                            id="Success Route"
                                            options={successRouteOptions}
                                            value={formData.success}
                                            placeholder='Select Accept Step'
                                            onChange={handleSuceessRouteChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label Success Route">Reject Route</label>
                                        <Select
                                            id="Error Route"
                                            options={errorRouteOptions}
                                            value={formData.error}
                                            placeholder='Select Reject Step'
                                            onChange={handleErrorRouteChange}
                                        />
                                    </div>
                                </>
                                )}
                            </>
                        }


                        {/* <div className="form-group">
                            <label className="form-label Success Route">Routes</label>
                            <Select
                                id="Routes"
                                options={successRouteOptions}
                                isMulti
                                value={formData?.['route']}
                                placeholder='Select Steps..'
                                onChange={handleRoutesChange}
                            />

                        </div> */}


                        <ul className="btn-toolbar g-4 align-center justify-end">
                            <li>
                                <button
                                    type="button"
                                    className="link link-primary"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        close();
                                    }}
                                >
                                    Cancel
                                </button>
                            </li>


                            <li>
                                <Button color="danger" onClick={() => {
                                    handleDelete(formData)
                                    close()
                                }}>
                                    Delete
                                </Button>
                            </li>

                            {!data['isLastStep'] && (
                                <li>
                                    <Button color="primary" type="submit">
                                        Update
                                    </Button>
                                </li>
                            )}

                        </ul>

                    </form>
                </div>
            </div>
        </React.Fragment>
    );
};

export default CreateNodes;
