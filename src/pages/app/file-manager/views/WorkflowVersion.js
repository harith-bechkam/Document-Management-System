import React, { useRef, useState, useEffect } from "react";
import { Icon } from "../../../../components/Component";
import { Badge, Button } from "reactstrap";
import * as API from '../../../../utils/API';
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { updateLoaderFlag } from "../../../../redux/folderSlice";

const WorkflowVersion = ({ toggle, revisionInputDatas, fetchDetails, workflowEnableBtn, lastRevisionNo }) => {

    const [error, setError] = useState(false)
    const [versionNo, setVersionNo] = useState('')
    const store = useSelector(state => state.folders);
    const dispatch = useDispatch()
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current.focus();
    }, []);


    const startWorkflow = async () => {

        if (!versionNo) {
            setError(true)
            return
        }

        let parentData = revisionInputDatas.result['workflows'][revisionInputDatas.result['workflows'].length - 1]
        let togoName = revisionInputDatas.DetailsData['type']
        let togoId = revisionInputDatas.item['_id']


        parentData['workflow']['revisionNo'] = versionNo

        dispatch(updateLoaderFlag({ loader: true, text: "Starting Workflow" }))
        var workflowResponse = await API.updateWorkflowInFiles(parentData['workflow'], togoName, togoId, versionNo)
        dispatch(updateLoaderFlag({ loader: false, text: "" }))

        var { status, message } = workflowResponse

        if (status) {
            await fetchDetails(togoId)
            toggle();
            workflowEnableBtn(true)
            toast.success(`${message}`)
        }
        else toast.error(`${message}`.replace(/\b\w/g, char => char.toUpperCase()))
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

                <div className="form-group">
                    <h5> Workflow <Badge pill color="primary">Last Version : &nbsp;v{lastRevisionNo}</Badge></h5>

                    <div class='row mt-3'>
                        <label className="form-label">New version:[v_] <span style={{ color: 'red' }}> *</span> <small className="text-muted">(If applicable, specify where the user selects a version number)</small> </label>
                        <div class="col-md-6">
                            <input
                                type="text"
                                placeholder={"Enter your version No"}
                                className={`form-control ${error ? 'error' : ''}`}
                                value={versionNo}
                                onChange={(e) => {
                                    setError(false)
                                    setVersionNo(e.target.value)
                                }}
                                ref={inputRef}
                            />
                        </div>
                        {error && <label className="form-text" style={{ color: "red" }}>Enter Version No</label>}
                    </div>
                </div>

                <div className="nk-modal-action justify-end">
                    <ul className="btn-toolbar g-4 align-center">
                        <li>
                            <a
                                href="#toggle"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    toggle();
                                }}
                                className="link link-primary"
                            >
                                Cancel
                            </a>
                        </li>
                        <li>
                            <Button color="primary" onClick={startWorkflow}>
                                Start Workflow
                            </Button>
                        </li>
                    </ul>
                </div>
            </div>
        </React.Fragment>
    )
}

export default WorkflowVersion