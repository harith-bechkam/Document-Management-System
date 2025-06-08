import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../../../../components/Component'
import './ViewWorkflows.css';
import { Modal, Spinner, Tooltip } from 'reactstrap';
import * as API from '../../../../utils/API';
import ReactFlow, {
    addEdge,
    applyNodeChanges,
    Background,
    Controls,
    Handle,
    MarkerType,
    Position,
    ReactFlowProvider,
    reconnectEdge,
    useEdgesState,
    useNodesState
} from "reactflow"
import { useDispatch } from 'react-redux';
import { triggerInlineAddWorkflow, triggerInlineEditWorkflow, triggerInlinePrintWorkflow } from '../../../../redux/folderSlice';
import CloneWorkflow from './CloneWorkflow';
import Flow from '../../../admin/Workflow/Flow';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import JoyrideComp from './Joyride';


const custom_node = ({ data, isConnectable }) => {
    const truncate = (str, len) => {
        return str?.length > len ? `${str?.substring(0, len)}...` : str;
    };

    return (
        <>
            {/* {!data.accessKey ? (
                <div className="level "><Icon name="arrow-right-circle-fill" style={{ color: "black" }} /></div>
            ) : (
                ""
            )} */}
            <div
                className="text-updater-node main_node draw-border"
                style={{
                    borderRadius: "12px",
                }}
            >
                <Handle
                    type="target"
                    id="target-top"
                    position={Position.Top}
                    isConnectable={true}
                />
                <Handle
                    type="target"
                    id="target-bottom"
                    position={Position.Bottom}
                    isConnectable={true}
                />
                <Handle
                    type="target"
                    id="target-left"
                    position={Position.Left}
                    isConnectable={true}
                />
                <Handle
                    type="target"
                    id="target-right"
                    position={Position.Right}
                    isConnectable={true}
                />
                <div>
                    <center> <label htmlFor="text" title={data.label}>{truncate(data.label, 15)}</label> </center>
                </div>
                <Handle
                    type="source"
                    position={Position.Top}
                    id="source-top"
                    isConnectable={true}
                />
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="source-bottom"
                    isConnectable={true}
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    id="source-left"
                    isConnectable={true}
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    id="source-right"
                    isConnectable={true}
                />
            </div>
        </>
    );
};
const nodeTypes = {
    customNode: custom_node,
};

function ViewWorkflows({
    setClickedAddNewWorkflow,
    setClickedEditWorkflow,
    setClickedViewWorkflows,
    setResetClicked,
    setInlineWorkflowModal,
    fetchAllWorkflows,
    toggleInline,
    setEditFromViewPage
}) {
    const dispatch = useDispatch();
    const [workflowOptions, setWorkflowOptions] = useState([]);
    const [workflowOptionsBackup, setWorkflowOptionsBackup] = useState([]);
    const [allWorkflows, setAllWorkflows] = useState([]);
    const [workflow, setWorkflow] = useState({});
    const [selectedWF, setSelectedWF] = useState({})
    const [cloneWorkflowModal, setCloneWorkflowModal] = useState(false);
    const [refreshFlag, setRefreshFlag] = useState(false);

    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [loader, setLoader] = useState(false);
    const singleViewWorkflow = useSelector(state => state.folders.viewSingleWorkflow)

    const [tooltipOpen, setTooltipOpen] = useState({});
    const toolTipToggle = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const toggleCloneWFModal = () => {
        setCloneWorkflowModal(!cloneWorkflowModal);
    }

    useEffect(() => {
        getAllWorkflowsList()
    }, [refreshFlag])

    const [activeWorkflow, setActiveWorkflow] = useState('')

    useEffect(() => {
        if (reactFlowInstance && nodes.length > 0) {
            reactFlowInstance.fitView({ padding: 0.1 });
        }
    }, [reactFlowInstance, nodes, edges]);

    const buildFlow = async (data) => {
        setLoader(true);
        setNodes(data['stepsInfo']['nodes'])
        setEdges(data['stepsInfo']['edges'])
        var updatedFlow = {
            _id: data['_id'],
            workflowName: data['workflowName'],
            stepsInfo: {
                nodes: data['stepsInfo']['nodes'],
                edges: data['stepsInfo']['edges']
            },
            workflowSteps: data['workflowSteps']
        }
        setWorkflow(updatedFlow)
        setLoader(false);
    }

    async function getAllWorkflowsList() {
        setLoader(true);
        let workflowResponse = await API.getAllWorkflows()
        if (workflowResponse['status']) {

            setAllWorkflows(workflowResponse['data']);
            // allWorkflowDataArr = workflowResponse['data']
            const workflowOptions = workflowResponse['data'].map((w, index) => ({
                value: w?._id,
                label: w?.workflowName,
                description: w?.workflowDescription || ''
            }))
            setWorkflowOptions(workflowOptions);
            setWorkflowOptionsBackup(workflowOptions);
            if (singleViewWorkflow.status) {
                const _currentWorkflow = workflowResponse['data'].find(elem => elem._id == singleViewWorkflow.id);
                if (_currentWorkflow) {
                    setActiveWorkflow(_currentWorkflow._id);
                    let obj = {
                        _id: _currentWorkflow['_id'],
                        workflowName: _currentWorkflow['workflowName'],
                        stepsInfo: {
                            nodes: _currentWorkflow['stepsInfo']['nodes'],
                            edges: _currentWorkflow['stepsInfo']['edges']
                        },
                        workflowSteps: _currentWorkflow['workflowSteps']
                    }
                    buildFlow(obj);
                }
            } else {
                setActiveWorkflow(workflowOptions[0]?.value);
                let obj = {
                    _id: workflowResponse['data'][0]['_id'],
                    workflowName: workflowResponse['data'][0]['workflowName'],
                    stepsInfo: {
                        nodes: workflowResponse['data'][0]['stepsInfo']['nodes'],
                        edges: workflowResponse['data'][0]['stepsInfo']['edges']
                    },
                    workflowSteps: workflowResponse['data'][0]['workflowSteps']
                }
                buildFlow(obj);
            }
        }
        setLoader(false);
    }

    const onNodeClick = async (event, node) => {
        if (node) {
            setIsNodeClicked(node)
            await prefillUsersList(node)
        }
    }

    const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
        setEdges((els) => reconnectEdge(oldEdge, newConnection, els))
    }, [])


    const onEdgeClick = (event, edge) => {
        const new_edge = { ...edge, style: { stroke: "red" } };
    }


    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);


    const onNodesChange = useCallback((changes) => {
        // const moveNode = changes.find((change) => change.type === 'position');
        setNodes((nds) => applyNodeChanges(changes, nds));
        // storeWorkflow(nodes, edges)
    }, [nodes])

    const onConnect = useCallback((params) => {
        const newEdge = {
            ...params,
            type: 'smoothstep',
            animated: true,
            markerEnd: {
                type: MarkerType.ArrowClosed,
            },
        };

        var nodesjson = workflow.stepsInfo['nodes']
        var edgesjson = workflow.stepsInfo['edges']

        edgesjson.push(newEdge)
        setWorkflow({
            ...workflow,
            stepsInfo: {
                nodes: nodesjson,
                edges: edgesjson
            },
            workflowSteps: []
        })

        setEdges((eds) => addEdge(newEdge, eds))
    }, [setEdges]);

    async function generateFlow(workflowId) {
        setActiveWorkflow(workflowId);
        const selectedWorkflow = allWorkflows.find(elem => elem._id == workflowId);
        let obj = {
            _id: selectedWorkflow['_id'],
            workflowName: selectedWorkflow['workflowName'],
            stepsInfo: {
                nodes: selectedWorkflow['stepsInfo']['nodes'],
                edges: selectedWorkflow['stepsInfo']['edges']
            },
            workflowSteps: selectedWorkflow['workflowSteps']
        }

        await buildFlow(obj)
    }

    function onSearch(str) {
        const arr = JSON.parse(JSON.stringify(workflowOptionsBackup));
        if (str.trim() == '') {
            setWorkflowOptions(arr);
        } else {
            const regex = new RegExp(str, 'i');
            const filteredArr = arr.filter(item => regex.test(item.label));
            setWorkflowOptions(filteredArr);
        }
    }

    const [run, setRun] = useState(false);

    const [tourSteps, setTourSteps] = useState([
        {
            target: ".workflow-sidebar",
            content: "Here, you can see the list of available templates",
        },
        {
            target: ".react-flow__pane",
            content: "The template preview can be seen here",
        },
        {
            target: ".search-box",
            content: "Search option to filter the templates",
        },
        {
            target: ".choose-btn",
            content: "Choose this template for your document",
        },
        {
            target: ".add-workflow-icon-fullscreen",
            content: "Add new template",
        },
        {
            target: ".clone-workflow-icon",
            content: "Clone template",
        },
        {
            target: ".edit-workflow-icon",
            content: "Edit template",
        },
        {
            target: ".delete-workflow-icon",
            content: "Delete template",
        },
    ])


    function startRide() {
        setRun(true);
        setTimeout(() => {
            const joyride_beacon = window.document.querySelector(`.react-joyride__beacon`);
            joyride_beacon.click();

        }, 1000);
    }

    return (
        <div className="container-fluid vh-100 p-5">
            <div className="row h-100">
                <div className="col-4 bg-light p-3">
                    <h5>
                        Workflows
                        <span>
                            <Icon onClick={() => {
                                dispatch(triggerInlineAddWorkflow({ active: true }))
                            }} id="add-workflow" className="add-workflow-icon-fullscreen" name="property-add" />
                            <Tooltip
                                placement="top"
                                isOpen={tooltipOpen["add-workflow"] || false}
                                target="add-workflow"
                                toggle={() => toolTipToggle("add-workflow")}
                            >
                                Add Workflow
                            </Tooltip>
                        </span>
                    </h5>
                    <div className='mr-4 mb-2 search-box'>
                        <input className='workflow-search p-2' type='text' placeholder='Search' onChange={(e) => onSearch(e.target.value)} />
                        <Icon className="search-icon" name={`search`} />
                    </div>
                    <ul className='workflow-sidebar'>
                        {workflowOptions.map((elem) => (
                            <li className={`workflow-option`} onClick={() => generateFlow(elem.value)} key={elem.value}>
                                <span className={`mb-2 mr-2 card card-bordered workflow-options-card text-soft ${activeWorkflow == elem.value ? 'active' : ''}`}>
                                    <div className={`card-inner`}>
                                        <div className="align-center justify-between">
                                            <div className="g">
                                                <h6 className={`title ${activeWorkflow == elem.value ? 'workflow-selected' : ''}`}>{elem.label}<span>
                                                    <Icon onClick={() => {
                                                        setSelectedWF({
                                                            workflowName: elem.label,
                                                            workflowId: elem.value
                                                        });
                                                        setCloneWorkflowModal(true)
                                                    }
                                                    } className="clone-workflow-icon" id="clone-workflow" name="copy" />
                                                    <Tooltip
                                                        placement="top"
                                                        isOpen={tooltipOpen["clone-workflow"] || false}
                                                        target="clone-workflow"
                                                        toggle={() => toolTipToggle("clone-workflow")}
                                                    >
                                                        Clone Workflow
                                                    </Tooltip>
                                                    <Icon onClick={() => {
                                                        setSelectedWF({
                                                            workflowName: elem.label,
                                                            workflowId: elem.value
                                                        });
                                                        dispatch(triggerInlineEditWorkflow({
                                                            id: elem.value,
                                                            name: elem.label,
                                                            active: true
                                                        }))
                                                        setEditFromViewPage(true);
                                                        // setCloneWorkflowModal(true)
                                                    }
                                                    } className="clone-workflow-icon edit-workflow-icon" id="edit-workflow" name="edit" />
                                                    <Tooltip
                                                        placement="top"
                                                        isOpen={tooltipOpen["edit-workflow"] || false}
                                                        target="edit-workflow"
                                                        toggle={() => toolTipToggle("edit-workflow")}
                                                    >
                                                        Edit Workflow
                                                    </Tooltip>
                                                    <Icon onClick={() => {
                                                        // setSelectedWF({
                                                        //     workflowName: elem.label,
                                                        //     workflowId: elem.value
                                                        // });
                                                        Swal.fire({
                                                            icon: 'warning',
                                                            title: `Are you sure?`,
                                                            text: `You are about to delete the workflow '${elem.label}'!`,
                                                            showCancelButton: true,
                                                            confirmButtonText: `Yes, delete it`
                                                        }).then(async res => {
                                                            if (res.isConfirmed) {
                                                                setLoader(true);
                                                                const deleteRespo = await API.deleteWorkflow(elem.value);
                                                                if (!deleteRespo.status) {
                                                                    setLoader(false);
                                                                    return toast.error(`Unable to delete workflow`);
                                                                }
                                                                setLoader(false);
                                                                setRefreshFlag(prev => !prev);
                                                            }
                                                        })
                                                    }
                                                    } className="clone-workflow-icon delete-workflow-icon text-danger" id="delete-workflow" name="trash" />
                                                    <Tooltip
                                                        placement="top"
                                                        isOpen={tooltipOpen["delete-workflow"] || false}
                                                        target="delete-workflow"
                                                        toggle={() => toolTipToggle("delete-workflow")}
                                                    >
                                                        Delete Workflow
                                                    </Tooltip>
                                                </span></h6>
                                                <p>{elem.description.length > 100 ? `${elem.description.slice(0, 70)}...` : elem.description}</p>
                                            </div>
                                            <div className="g">
                                                <span onClick={() => generateFlow(elem.value)} className="btn btn-icon btn-trigger me-n1">
                                                    <Icon name="chevron-right"></Icon>
                                                </span>
                                            </div>
                                        </div>
                                    </div>{" "}
                                </span>
                            </li>
                        ))}
                        {workflowOptions.length == 0 && <p className='no-workflows-message'>No Workflows to Display!</p>}
                    </ul>
                </div>

                <div className="col-8 bg-white pb-4">
                    {loader ? <div className='loader-spinner-parent'>
                        <Spinner className='custom-spinner' />
                    </div> :
                        <>
                            <div className='d-flex justify-between'>
                                <h5>{workflow ? workflow.workflowName : ''}</h5>
                                <div className='option-buttons'>
                                    {/* <button className="joyride-tour bg-transparent" onClick={() => startRide()}><Icon id={`joyride-icon`} className={`text-info fs-3`} name={`help-fill`} /></button> */}
                                    {/* <Tooltip
                                        placement="top"
                                        isOpen={tooltipOpen["joyride-icon"] || false}
                                        target="joyride-icon"
                                        toggle={() => toolTipToggle("joyride-icon")}
                                    >
                                        Start Tour
                                    </Tooltip> */}
                                    <button className='btn btn-primary choose-btn' onClick={() => {
                                        dispatch(triggerInlinePrintWorkflow({
                                            active: 'true',
                                            id: workflow._id,
                                            name: workflow.workflowName
                                        }))
                                        toggleInline()
                                    }}>Choose</button>
                                </div>
                            </div>
                            {workflow && <ReactFlowProvider>
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodeClick={onNodeClick}
                                    onEdgeClick={onEdgeClick}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onEdgeUpdate={onEdgeUpdate}
                                    onConnect={onConnect}
                                    onDragOver={onDragOver}
                                    onDrag={onDragOver}
                                    onInit={setReactFlowInstance}
                                    fitView={true}
                                    nodeTypes={nodeTypes}
                                    style={{ width: "50%", height: "60vh" }}
                                    panOnDrag={false}
                                    nodesDraggable={false}
                                    nodesConnectable={false}

                                >
                                    <Controls />
                                    <Background variant={"cross"} />
                                </ReactFlow>
                            </ReactFlowProvider>}
                        </>}
                </div>
            </div>
            <Modal isOpen={cloneWorkflowModal} toggle={toggleCloneWFModal}>
                <CloneWorkflow
                    selectedWF={selectedWF}
                    toggle={toggleCloneWFModal}
                    setClickedAddNewWorkflow={setClickedAddNewWorkflow}
                    setClickedEditWorkflow={setClickedEditWorkflow}
                    setClickedViewWorkflows={setClickedViewWorkflows}
                    setResetClicked={setResetClicked}
                    setInlineWorkflowModal={setInlineWorkflowModal}
                    fetchAllWorkflows={fetchAllWorkflows}
                />
            </Modal>
            <JoyrideComp
                steps={tourSteps}
                run={run}
                setRun={setRun}
            />
        </div>

    )
}

export default ViewWorkflows