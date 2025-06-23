import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Panel,
  Background,
  reconnectEdge,
  Handle,
  Position,
  MarkerType,
  applyNodeChanges,
} from "reactflow";
import FileManagerLayout from '../../app/file-manager/components/Layout';
import { useLocation, useNavigate, useParams } from 'react-router';
import 'reactflow/dist/style.css';
import { Button, Card, CardHeader, Col, Collapse, Modal, Row, Tooltip } from 'reactstrap';
import FilesBody from "../../app/file-manager/components/Body";
import Sidebar from "./Sidebar";
import { Icon } from "../../../components/Component";
import 'bootstrap-icons/font/bootstrap-icons.css';
import CreateNodes from "./Modals/CreateNodes";
import * as API from '../../../utils/API';
import toast from "react-hot-toast";
import Content from "../../../layout/content/Content";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { triggerInlinePrintWorkflow } from "../../../redux/folderSlice";
import AddDescription from "./WordkflowDescription";
import Swal from "sweetalert2";
import JoyrideComp from "../../app/file-manager/modals/Joyride";
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data, isConnectable }) => {
  const truncate = (str, len) => (str?.length > len ? `${str.substring(0, len)}...` : str);

  const handlePositions = ['Top', 'Bottom', 'Left', 'Right'];

  return (
    <div
      className="text-updater-node main_node draw-border"
      style={{ borderRadius: '12px' }}
    >
      {/* Optional display of level */}
      {data.level !== undefined && (
        <div className="level">{data.level}</div>
      )}

      {/* Target Handles */}
      {handlePositions.map((pos) => (
        <Handle
          key={`target-${pos.toLowerCase()}`}
          type="target"
          id={`target-${pos.toLowerCase()}`}
          position={Position[pos]}
          isConnectable={isConnectable}
        />
      ))}

      <div>
        <center>
          <label htmlFor="text" title={data.label}>
            {truncate(data.label, 15)}
          </label>
        </center>
      </div>

      {/* Source Handles */}
      {handlePositions.map((pos) => (
        <Handle
          key={`source-${pos.toLowerCase()}`}
          type="source"
          id={`source-${pos.toLowerCase()}`}
          position={Position[pos]}
          isConnectable={isConnectable}
        />
      ))}
    </div>
  );
};

const nodeTypes = {
  customNode: custom_node,
};

let id = 0;
let pos = {};
let edg = 0;

const getEdge = () => `dndedge_${edg++}`;

function Flow({ toggleInline }) {

  const params = useParams();
  const location = useLocation()
  const dispatch = useDispatch();

  const reactFlowWrapper = useRef(null);
  const [fitviewPage, setUpFitView] = useState(true);
  const [fullSteps, setFullSteps] = useState([])
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [p_id, setP_id] = useState(0)
  const inlineAddWorkflow = useSelector(state => state.folders.inlineAddWorkflow);
  const [defaultWorkflow, setDefaultWorkflow] = useState({})
  const [workflow_validation, setWorkflow_validation] = useState(false)
  const [isStepCreatedOrUpdated, setIsStepCreatedOrUpdated] = useState(false);
  const selectedEditWorkflow = useSelector(state => state.folders.inlineEditWorkflow)
  const [editingName, setEditingName] = useState(false);
  const [error, setError] = useState(false)
  const nameInputRef = useRef(null);
  const [descriptionEmptyError, setDescriptionEmptyError] = useState(false);
  const [descriptionModal, setDescriptionModal] = useState(false);
  const parentDirectoryNavigate = useSelector(state => state.folders.inheritWorflowNavigate)

  function toggleDescriptionModal() {
    setDescriptionModal(!descriptionModal);
  }

  const handleNameClick = () => {
    setEditingName(true);
    setTimeout(() => {
      nameInputRef.current && nameInputRef.current.focus();
    }, 0);
  };

  const [tooltipOpen, setTooltipOpen] = useState({});
  const toolTipToggle = (id) => {
    setTooltipOpen((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const [nodemodalshow, setnodemodalshow] = useState({
    toggle: false,
    data: {}
  });

  const [workflow, setWorkflow] = useState({
    workflowName: "Untitled",
    workflowDescription: '',
    workflowJson: {
      nodes: [],
      edges: []
    },
    workflowSteps: []
  })
  const [toggle, setToggle] = useState(false)
  // const  {workflowId}  = params
  let workflowId = '';

  if (inlineAddWorkflow) {
    workflowId = params.workflowId
  } else if (selectedEditWorkflow.status) {
    workflowId = selectedEditWorkflow.id
  } else {
    workflowId = params.workflowId
  }

  const navigate = useNavigate()


  useEffect(() => {
    fetchAPIs()
    if (location.pathname.includes('workflow') && (location.pathname.includes('add'))) {
      changeNodeFitView()
    }
  }, [])

  async function changeNodeFitView() {
    setUpFitView(false)
  }

  async function fetchAPIs() {
    await fetchAllSteps()
    if (workflowId) fetchWorkflowById()
  }

  async function fetchWorkflowById() {
    let workflowResponse = await API.getWorkflowById(workflowId)
    if (workflowResponse['status']) {

      workflowResponse['data'].length > 0 &&
        await buildFlow(workflowResponse['data'][0])

    }

  }

  useEffect(() => {

    async function fetchStepsCheck() {

      if (isStepCreatedOrUpdated) {
        await fetchAllSteps()
        setIsStepCreatedOrUpdated(false)
      }

    }

    fetchStepsCheck()
  }, [isStepCreatedOrUpdated])





  async function fetchAllSteps() {
    let stepsResponse = await API.getAllSteps()
    var { status } = stepsResponse
    if (status) {
      setFullSteps(stepsResponse['data'])
      return stepsResponse['data']
    }
  }


  const buildFlow = async (data) => {
    setNodes(data['stepsInfo']['nodes'])
    setEdges(data['stepsInfo']['edges'])

    setWorkflow({
      workflowName: data['workflowName'],
      workflowDescription: data['workflowDescription'] || '',
      workflowJson: {
        nodes: data['stepsInfo']['nodes'],
        edges: data['stepsInfo']['edges']
      },
      workflowSteps: data['workflowSteps']
    })

    // setFullSteps(data['workflowSteps'].map(item => ({ id: item['id'], stepName: item['stepName'] })))

    id = takeLastId(data['stepsInfo']['nodes']) + 2
    edg = takeLastId(data['stepsInfo']['edges']) + 2
  }

  const takeLastId = (allNodes) => {
    var lastId = allNodes[allNodes.length - 1]?.['id']

    const lastid = parseInt(lastId.split('_')[1], 10)
    return lastid
  }

  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
    };

    var nodesjson = workflow.workflowJson['nodes']
    var edgesjson = workflow.workflowJson['edges']

    edgesjson.push(newEdge)
    setWorkflow({
      ...workflow,
      workflowJson: {
        nodes: nodesjson,
        edges: edgesjson
      },
      workflowSteps: []
    })

    setEdges((eds) => addEdge(newEdge, eds))
  }, [setEdges]);



  const getId = () => {
    setP_id(id);
    if (!nodes.length) {
      id = 0;
    }
    return `dndnode_${id++}`;
  };

  const settingNodes = (event, nodedata, nodeType, nodeid, currPageAllSteps) => {

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

    if (!currPageAllSteps || currPageAllSteps?.length == 0) return toast.error('Refresh the page and Try again')

    var step = currPageAllSteps?.find(item => item['_id'] == nodeid)
    if (step['stepName'] == "Publish") return;

    const x = 600
    pos = reactFlowInstance.project({
      x: (event.clientX - reactFlowBounds.left) + x,
      y: event.clientY - reactFlowBounds.top
    })

    const newNode = {
      id: getId(),
      position: pos,
      data: {
        label: `${nodeType}`, id: nodeid, nodedata,
        accessKey: false,
        access: {
          editor: {},
          reviewer: {},
          approver: {}
        },
        approvalType: ''
      },
      style: { background: "cyan", borderRadius: "12px" },
      type: 'customNode',
    }
    setNodes((nds) => nds.concat(newNode));

    var nodesjson = workflow.workflowJson['nodes']
    var edgesjson = workflow.workflowJson['edges']

    nodesjson.push(newNode)
    setWorkflow({
      ...workflow,
      workflowJson: {
        nodes: nodesjson,
        edges: edgesjson
      },
      workflowSteps: []
    })
  }

  const onNodeClick = (event, node) => {
    if (node) {
      setnodemodalshow({
        toggle: true,
        data: node['data']['nodedata']
      })
    }
  }

  const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els))
  }, [])


  const onEdgeClick = (event, edge) => {
    const new_edge = { ...edge, style: { stroke: "red" } };
  }


  const addNode = (routeAccess, fullNodes, srcNode, data, newNode) => {
    var nodeData

    if (routeAccess == 'success') nodeData = fullSteps.find(item => item['_id'] == data?.['success']?.['value'])
    if (routeAccess == 'error') nodeData = fullSteps.find(item => item['_id'] == data?.['error']?.['value'])
    if (routeAccess == 'route') nodeData = fullSteps.find(item => item['_id'] == data?.['id'])

    newNode = {
      id: getId(),
      position:
        routeAccess == 'success' ? { x: srcNode['position']['x'], y: srcNode['position']['y'] + 100 } :
          routeAccess == 'error' ? { x: srcNode['position']['x'] + 200, y: srcNode['position']['y'] } :
            routeAccess == 'route' ? { x: srcNode['position']['x'] - 200, y: srcNode['position']['y'] } : '',

      style: {
        background: routeAccess == 'success' ? "cyan" :
          routeAccess == 'error' ? "cyan" :
            routeAccess == 'route' ? "blue" : '',
        borderRadius: "12px"
      },

      data: routeAccess == 'success' ? {
        label: `${data['success']['label']}`, id: data['success']['value'], nodedata: nodeData,
        accessKey: false,
        access: {
          editor: {},
          reviewer: {},
          approver: {}
        },
        approvalType: ''
      } :
        routeAccess == 'error' ? {
          label: `${data['error']['label']}`, id: data['error']['value'], nodedata: nodeData,
          accessKey: false,
          access: {
            editor: {},
            reviewer: {},
            approver: {}
          },
          approvalType: ''
        } :
          routeAccess == 'route' ? {
            label: `${data['label']}`, id: data['value'], nodedata: nodeData,
            accessKey: false,
            access: {
              editor: {},
              reviewer: {},
              approver: {}
            },
            approvalType: ''
          } : '',

      type: 'customNode'

    }

    fullNodes.push(newNode)

    const latestNodes = fullNodes.reduce((acc, node) => {
      acc[node.id] = node
      return acc
    }, {})

    const uniqueNodes = Object.values(latestNodes)

    setNodes(uniqueNodes)
    // setNodes((nds) => nds.concat(newNode))
  }

  const addOrUpdateEdge = (data, fullNodes, routeAccess, newEdge, fullEdges, deletingNodeId) => {

    var srcNode = fullNodes.find(val => val['data']['id'] == data['id'])

    var successNode, errorNode, routeNode

    if (routeAccess == 'success') successNode = fullNodes.find(val => val['data']['id'] == data?.['success']?.['value'])
    if (routeAccess == 'error') errorNode = fullNodes.find(val => val['data']['id'] == data?.['error']?.['value'])
    if (routeAccess == 'route') routeNode = fullNodes.find(val => val['data']['id'] == data?.['id'])


    let srcNodeForPrevEdge = false
    srcNodeForPrevEdge = fullEdges.find(edge => {

      const strokeColor = routeAccess == 'success' ? 'green' : 'red'

      if (edge.source == srcNode['id'] && edge.style.stroke == strokeColor) {
        deletingNodeId.id = edge.target
        edge.target = strokeColor == 'green' ? successNode?.id : errorNode?.id
        return true
      }

      return false
    })


    if (srcNodeForPrevEdge) {
      //Updatindg Edges

      const latestEdges = fullEdges.reduce((acc, edge) => {
        acc[edge.id] = edge
        return acc
      }, {})

      const uniqueEdges = Object.values(latestEdges)

      setEdges(uniqueEdges)

    }

    if (!srcNodeForPrevEdge) {
      //Creating Edges

      newEdge = {
        id: getEdge(),
        source: srcNode?.id,
        sourceHandle:
          routeAccess == 'success' ? "source-bottom" :
            routeAccess == 'error' ? "source-right" :
              routeAccess == 'route' ? "source-left" : '',
        type: "smoothstep",
        animated: "true",
        target: successNode?.id != undefined ? successNode?.id :
          errorNode?.id != undefined ? errorNode?.id :
            routeNode?.id != undefined ? routeNode?.id : '',
        targetHandle:
          routeAccess == 'success' ? "target-top" :
            routeAccess == 'error' ? "target-left" :
              routeAccess == 'route' ? "target-top" : '',
        style: {
          stroke:
            routeAccess == 'success' ? "green" :
              routeAccess == 'error' ? "red" :
                routeAccess == 'route' ? "blue" : ''
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color:
            routeAccess == 'success' ? "green" :
              routeAccess == 'error' ? "red" :
                routeAccess == 'route' ? "blue" : '',
        },
      }

      var dupNewEdgeCreated = fullEdges.some(item => item['source'] == newEdge['source'] && item['target'] == newEdge['target'] && item['style']['stroke'] == newEdge['style']['stroke'])

      if (!dupNewEdgeCreated) {
        fullEdges.push(newEdge)

        const latestEdges = fullEdges.reduce((acc, edge) => {
          acc[edge.id] = edge
          return acc
        }, {})

        const uniqueEdges = Object.values(latestEdges)

        setEdges(uniqueEdges)
        // setEdges((eds) => eds.concat(newEdge));
      }
    }

  }


  const setupDelete = (data) => {
    var fullNodes = workflow['workflowJson']['nodes'], fullEdges = workflow['workflowJson']['edges']


    var newNodes = fullNodes.filter(item => item['data']['label'] != data['stepName'])
    setNodes(newNodes)

    var particularNode = fullNodes.find(item => item['data']['label'] == data['stepName'])

    const filteredEdges = fullEdges.filter(edge => {
      return !(edge.source == particularNode['id'] || edge.target == particularNode['id'])
    })

    setEdges(filteredEdges)

    storeWorkflow(newNodes, filteredEdges)
  }



  const setupFlow = async (data) => {

    var newNode, newEdge, deletingNodeId = { id: '' }
    let fullNodes = workflow['workflowJson']['nodes'], fullEdges = workflow['workflowJson']['edges']
    var srcNode = fullNodes.find(val => val['data']['id'] == data['id'])

    var successRoute = data?.['success']?.['label'] != undefined
    var errorRoute = data?.['error']?.['label'] != undefined
    // var routeRoue = !data?.['route'] == ''



    //update stepName
    fullNodes.find(item => {
      if (item['data']['id'] == data['id']) {

        item['data']['label'] = data['stepName']
        item['data']['nodedata']['stepName'] = data['stepName']
      }
    })


    if (successRoute) {

      var checkUpSuccessNode = fullNodes.some(val => val['data']['id'] == data['success']['value'])

      if (!checkUpSuccessNode) {
        addNode('success', fullNodes, srcNode, data, newNode)
        addOrUpdateEdge(data, fullNodes, 'success', newEdge, fullEdges, deletingNodeId)
      }
      else addOrUpdateEdge(data, fullNodes, 'success', newEdge, fullEdges, deletingNodeId)

    }

    if (errorRoute) {

      var checkUpErrorNode = fullNodes.some(val => val['data']['id'] == data['error']['value'])
      if (!checkUpErrorNode) {
        addNode('error', fullNodes, srcNode, data, newNode)
        addOrUpdateEdge(data, fullNodes, 'error', newEdge, fullEdges, deletingNodeId)
      }
      else addOrUpdateEdge(data, fullNodes, 'error', newEdge, fullEdges, deletingNodeId)
    }


    if (deletingNodeId['id'] != '') {

      var makeSureBeforeDeleting = false
      makeSureBeforeDeleting = fullEdges.some(item => item.source == deletingNodeId['id'] || item.target == deletingNodeId['id'])

      if (makeSureBeforeDeleting == false) {
        //no link is present for that node   

        let filteredNodes = null
        filteredNodes = fullNodes.filter(item => item['id'] != deletingNodeId['id'])
        setNodes(filteredNodes)
        deletingNodeId['id'] = ''

        if (filteredNodes == null) {
          filteredNodes = fullNodes
          setNodes(filteredNodes)
        }

      }

    }


    // if (routeRoue) {


    //   for (var item of data?.['route']) {

    //     item['stepName'] = data['stepName']

    //     var checkUpRouteNode = fullNodes.some(val => val['data']['label'] == item?.['label'])

    //     if (!checkUpRouteNode) {
    //       addNode('route', fullNodes, srcNode, item, newNode)
    //       addEdge(item, fullNodes, 'route', newEdge, fullEdges)
    //     }
    //     else {
    //       addEdge(item, fullNodes, 'route', newEdge, fullEdges)
    //     }
    //   }

    // }

    storeWorkflow(fullNodes, fullEdges)
  }


  const storeWorkflow = (fullNodes, fullEdges) => {
    var nodesjson = workflow.workflowJson['nodes']
    var edgesjson = workflow.workflowJson['edges']

    // var nodesjson, edgesjson

    nodesjson = fullNodes
    edgesjson = fullEdges

    let workflowSteps = []


    const getNodeById = (id) => {
      let result = null

      nodesjson.map((item) => {
        if (item.id == id) {
          result = {
            id: item['id'],
            stepName: item['data']['label'],
            accessKey: item['data']['accessKey'],
            access: item['data']['access'],
            approvalType: item['data']['approvalType']
          }
        }
      })

      return result
    }

    for (var node of nodesjson) {
      workflowSteps.push(
        {
          ...getNodeById(node.id), triggers: {
            accept: "",
            reject: "",
          }
        }
      )
    }


    for (var edge of edgesjson) {
      if (edge['style']['stroke'] == 'green') {
        var itemedNode = workflowSteps.find(item => item.id == edge['source'])
        itemedNode['triggers']['accept'] = edge['target']
      }
      if (edge['style']['stroke'] == 'red') {
        var itemedNode = workflowSteps.find(item => item.id == edge['source'])
        itemedNode['triggers']['reject'] = edge['target']
      }
    }

    setWorkflow({
      ...workflow,
      workflowJson: {
        nodes: nodesjson,
        edges: edgesjson
      },
      workflowSteps
    })
  }

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);


  const onNodesChange = useCallback((changes) => {
    // const moveNode = changes.find((change) => change.type === 'position');
    setNodes((nds) => applyNodeChanges(changes, nds));
    storeWorkflow(nodes, edges)
  }, [nodes])

  const submit = async () => {

    if (!workflow['workflowName'] || descriptionEmptyError || workflow.workflowDescription == '') {
      setDescriptionEmptyError(true);
      setWorkflow_validation(true)
      return
    }
    if (!workflowId) {
      //add
      let validWorkflow = workflow['workflowSteps'].some(item => item.stepName == "Publish")

      if (!validWorkflow) {
        toast.error('Please Insert Publish Step in Your Workflow')
        return
      }

      // dispatch(updateLoaderFlag({ loader: true, text: "Creating Workflow" }))
      var workflowResponse = await API.createWorkflow(workflow['workflowName'], workflow['workflowJson'], workflow['workflowSteps'], workflow['workflowDescription'])
      // dispatch(updateLoaderFlag({ loader: false, text: "" }))

      var { status } = workflowResponse
      if (status) {
        if (inlineAddWorkflow) {
          dispatch(triggerInlinePrintWorkflow({
            id: workflowResponse['data']._id,
            name: workflowResponse['data']['workflowName'],
            active: true
          }))
          toast.success(`${workflowResponse['data']['workflowName']} created successfully`)
          toggleInline()
        } else {
          toast.success(`${workflowResponse['data']['workflowName']} created successfully`)
          navigate('/workflow')
        }
      }
      else toast.error(`${workflowResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

    }
    else {
      //update
      var workflowResponse = await API.updateWorkflow(workflowId, workflow['workflowName'], workflow['workflowJson'], workflow['workflowSteps'], workflow['workflowDescription'])

      let legacyCheck = false;
      const outdatedResponse = await API.getOutdatedDocuments(workflowId);
      if (!outdatedResponse["status"]) {
        return toast.error(`Unable to retrieve outdated documents`);
      }
      if (outdatedResponse?.data?.length > 0) {
        legacyCheck = true;
      }
      var { status } = workflowResponse
      if (status) {
        if (selectedEditWorkflow.status) {
          dispatch(triggerInlinePrintWorkflow({
            id: workflowResponse['data']._id,
            name: workflowResponse['data']['workflowName'],
            active: true
          }))
          if (legacyCheck) {
            Swal.fire({
              title: "Workflow Updated!",
              text: "This updated Workflow will only apply to documents created in the future and mapped to this Workflow",
              icon: "success"
            })
          } else {
            toast.success(`${workflowResponse['data']['workflowName']} updated successfully`)
          }
          toggleInline()
        } else {
          // toast.success(`${workflowResponse['data']['workflowName']} updated successfully`)
          if (legacyCheck) {
            Swal.fire({
              title: "Workflow Updated!",
              text: "This updated Workflow will only apply to documents created in the future and mapped to this Workflow",
              icon: "success"
            })
          } else {
            toast.success(`${workflowResponse['data']['workflowName']} updated successfully`)
          }
          navigate('/workflow')
        }
      }
      else toast.error(`${workflowResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
    }
  }

  const [run, setRun] = useState(false);

  const [tourSteps, setTourSteps] = useState([
    {
      target: ".form-builder-custom-formname",
      content: "Give a name for the workflow template. By default the name is set to Untitled",
    },
    {
      target: ".workflow-description-icon",
      content: "Give a description of the workflow, on what it is about",
    },
    {
      target: ".workflow-steps",
      content: "Available workflow Steps",
    },
    {
      target: ".workflow-step-search",
      content: "Search workflow steps",
    },
    {
      target: ".add-workflow-step",
      content: "Add a workflow step",
    },
    {
      target: ".reactflow-wrapper",
      content: "Workflow will be displayed here",
    },
    {
      target: ".form-builder-save-button",
      content: "Save the workflow",
    },
    {
      target: ".stepEditIcon",
      content: "You can edit the steps by clicking here",
    },
    {
      target: ".stepDeleteIcon",
      content: "You can delete the steps by clicking here",
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
    (inlineAddWorkflow || selectedEditWorkflow.status) ?
      <div >
        <Card className="card-bordered">
          <CardHeader className="form-builder-custom-card-header border-bottom">
            <div className="d-flex align-items-center justify-content-between py-1">

              <div className="d-flex align-items-center">
                {/* <Icon className={`back-arrow-workflow`} onClick={() => {
                  navigate(-1)
                }} name="arrow-long-left" /> */}
                &nbsp;&nbsp;&nbsp;
                <div className="d-flex align-items-center ml-2 form-builder-custom-formname">
                  {editingName ? (
                    <input
                      type="text"
                      ref={nameInputRef}
                      className={`form-control ${error ? "error" : ""}`}
                      value={workflow?.workflowName}
                      onChange={(e) => {
                        setWorkflow({ ...workflow, workflowName: e.target.value })
                        setWorkflow_validation(false)
                        if (e.target.value.trim() === "") {
                          setError(true);
                        } else {
                          setError(false);
                        }
                      }}
                      onBlur={() => {
                        if (workflow?.workflowName.trim() === "") {
                          setError(true);
                        } else {
                          setEditingName(false);
                        }
                      }}
                    />
                  ) : (
                    <>

                      <label className="form-label mb-0 workflow-name-clickable" onClick={handleNameClick}>
                        {workflow?.workflowName}
                      </label>
                      <Icon onClick={() => setDescriptionModal(true)} id={`add-description`} className={`workflow-description-icon ${descriptionEmptyError ? 'workflow-description-error' : ""}`} name="info"></Icon>
                      {descriptionEmptyError && <p className="workflow-description-error desc-error-message">Please Enter Workflow Description</p>}
                      <Tooltip
                        placement="right"
                        isOpen={tooltipOpen["add-description"] || false}
                        target="add-description"
                        toggle={() => toolTipToggle("add-description")}
                      >
                        Add Description for Workflow
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>

              <div className="d-flex align-items-center">
                {/* <button className="joyride-tour bg-transparent" onClick={() => startRide()}><Icon id={`joyride-icon`} className={`text-info fs-3`} name={`help-fill`} /></button> */}
                {/* <Tooltip
                  placement="top"
                  isOpen={tooltipOpen["joyride-icon"] || false}
                  target="joyride-icon"
                  toggle={() => toolTipToggle("joyride-icon")}
                >
                  Start Tour
                </Tooltip> */}

                <Button color="primary" className={'fullscreen-modal-save-btn form-builder-save-button'} disabled={(nodes?.length > 1) || (error) ? false : true} onClick={submit}>
                  {workflowId ? "Update" : "Create"}
                </Button>
              </div>
            </div>

          </CardHeader>
        </Card>
        <div className="workflow-add-react-flow">
          <FilesBody>
            <Content>
              <>
                {/* <Row>
                <Col lg="11">

                  <label className="form-label"> Workflow Name <span style={{ color: 'red' }}> *</span></label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${(workflow_validation && workflow.workflowName === "") ? 'error' : ''}`}
                    placeholder="Workflow Name"
                    value={workflow['workflowName']}
                    onChange={(e) => {
                      setWorkflow({ ...workflow, workflowName: e.target.value })
                      setWorkflow_validation(false)
                    }}
                  />

                  <label className="col-form-label text-danger fw-small">
                    {workflow_validation && workflow.workflowName === ""
                      ? "Workflow name is required"
                      : ""}
                  </label>
                </Col>

                <Col lg="1" className="d-flex justify-content-center align-items-center">
                  <Button
                    color="primary"
                    style={{ height: "2.7rem" }}
                    className="rounded"
                    disabled={nodes?.length > 1 ? false : true}
                    onClick={submit}
                  >
                    {workflowId ? "Update" : "Create"}
                  </Button>
                </Col>


              </Row> */}

                <Card>


                  {/* Workflow Diagram */}
                  <div className="dndflow">
                    <ReactFlowProvider>
                      <Sidebar
                        nodes={nodes}
                        settingNodes={async (event, nodedata, nodeType, nodeid, currPageAllSteps) => {
                          // var fullStepTempdata = await fetchAllSteps();
                          settingNodes(event, nodedata, nodeType, nodeid, currPageAllSteps);
                        }}
                        toggle={toggle}
                        setIsStepCreatedOrUpdated={setIsStepCreatedOrUpdated}
                      />
                      <div className="reactflow-wrapper addnewflow" ref={reactFlowWrapper}>
                        <div
                          // style={{ zIndex: 2 }}
                          className="badge badge-secondary p-2 align-item-start position-relative mt-1 translate-middle "
                          onClick={() => setToggle(!toggle)}
                        >
                          <span>
                            <Icon name="chevron-right-fill-c" className="wrkflowBadge"></Icon>
                          </span>
                        </div>
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
                          fitView={inlineAddWorkflow ? false : fitviewPage}
                          nodeTypes={nodeTypes}
                        >
                          <Controls />
                          <Background variant={"cross"} />
                        </ReactFlow>
                      </div>
                    </ReactFlowProvider>
                  </div>

                </Card>


                {/* clicking in workflow nodes modal - step setup */}
                <Modal isOpen={nodemodalshow['toggle']} size="md" toggle={() => setnodemodalshow({ ...nodemodalshow, toggle: false })}>
                  <CreateNodes
                    allSteps={fullSteps}
                    reactFlowInstance={reactFlowInstance}
                    data={nodemodalshow['data']}
                    close={() => setnodemodalshow({ ...nodemodalshow, toggle: false })}
                    handleCreateNodes={setupFlow}
                    handleDelete={setupDelete}
                    workflow={workflow['workflowJson']}
                  />
                </Modal>

                <Modal isOpen={descriptionModal} toggle={toggleDescriptionModal}>
                  <AddDescription
                    toggle={toggleDescriptionModal}
                    workflow={workflow}
                    setWorkflow={setWorkflow}
                    setDescriptionEmptyError={setDescriptionEmptyError}
                  />
                </Modal>

                <JoyrideComp
                  steps={tourSteps}
                  run={run}
                  setRun={setRun}
                />

              </>

            </Content>
          </FilesBody>
        </div>
      </div> :
      <>
        <Card className="card-bordered">
          <CardHeader className="form-builder-custom-card-header border-bottom">
            <div className="d-flex align-items-center justify-content-between py-1">

              <div className="d-flex align-items-center">
                <Icon className={`back-arrow-workflow`} onClick={() => navigate(-1)} name="arrow-long-left" />
                <div className="d-flex align-items-center ml-2 form-builder-custom-formname">
                  {editingName ? (
                    <input
                      type="text"
                      ref={nameInputRef}
                      className={`form-control ${error ? "error" : ""}`}
                      value={workflow?.workflowName}
                      onChange={(e) => {
                        setWorkflow({ ...workflow, workflowName: e.target.value })
                        setWorkflow_validation(false)
                        if (e.target.value.trim() === "") {
                          setError(true);
                        } else {
                          setError(false);
                        }
                      }}
                      onBlur={() => {
                        if (workflow?.workflowName.trim() === "") {
                          setError(true);
                        } else {
                          setEditingName(false);
                        }
                      }}
                    />
                  ) : (
                    <>

                      <label className="form-label mb-0 workflow-name-clickable" onClick={handleNameClick}>
                        {workflow?.workflowName}
                      </label>
                      <Icon onClick={() => setDescriptionModal(true)} id={`add-description`} className={`workflow-description-icon ${descriptionEmptyError ? 'workflow-description-error' : ""}`} name="info"></Icon>
                      {descriptionEmptyError && <p className="workflow-description-error desc-error-message">Please Enter Workflow Description</p>}
                      <Tooltip
                        placement="right"
                        isOpen={tooltipOpen["add-description"] || false}
                        target="add-description"
                        toggle={() => toolTipToggle("add-description")}
                      >
                        Add Description for Workflow
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>

              <div className="d-flex align-items-center">
              {/* <button className="joyride-tour bg-transparent" onClick={() => startRide()}><Icon id={`joyride-icon`} className={`text-info fs-3`} name={`help-fill`} /></button> */}
                {/* <Tooltip
                  placement="top"
                  isOpen={tooltipOpen["joyride-icon"] || false}
                  target="joyride-icon"
                  toggle={() => toolTipToggle("joyride-icon")}
                >
                  Start Tour
                </Tooltip> */}
                <Button color="primary" className={'form-builder-save-button'} disabled={(nodes?.length > 1) || (error) ? false : true} onClick={submit}>
                  {workflowId ? "Update" : "Create"}
                </Button>
              </div>
            </div>

          </CardHeader>
        </Card>
        <div className="workflow-add-react-flow">
          <FilesBody>
            <Content>
              <>
                {/* <Row>
                <Col lg="11">

                  <label className="form-label"> Workflow Name <span style={{ color: 'red' }}> *</span></label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${(workflow_validation && workflow.workflowName === "") ? 'error' : ''}`}
                    placeholder="Workflow Name"
                    value={workflow['workflowName']}
                    onChange={(e) => {
                      setWorkflow({ ...workflow, workflowName: e.target.value })
                      setWorkflow_validation(false)
                    }}
                  />

                  <label className="col-form-label text-danger fw-small">
                    {workflow_validation && workflow.workflowName === ""
                      ? "Workflow name is required"
                      : ""}
                  </label>
                </Col>

                <Col lg="1" className="d-flex justify-content-center align-items-center">
                  <Button
                    color="primary"
                    style={{ height: "2.7rem" }}
                    className="rounded"
                    disabled={nodes?.length > 1 ? false : true}
                    onClick={submit}
                  >
                    {workflowId ? "Update" : "Create"}
                  </Button>
                </Col>


              </Row> */}

                <Card>


                  {/* Workflow Diagram */}
                  <div className="dndflow">
                    <ReactFlowProvider>
                      <Sidebar
                        nodes={nodes}
                        settingNodes={async (event, nodedata, nodeType, nodeid, currPageAllSteps) => {
                          // var fullStepTempdata = await fetchAllSteps();
                          settingNodes(event, nodedata, nodeType, nodeid, currPageAllSteps);
                        }}
                        toggle={toggle}
                        setIsStepCreatedOrUpdated={setIsStepCreatedOrUpdated}
                      />
                      <div className="reactflow-wrapper addnewflow" ref={reactFlowWrapper}>
                        <div
                          // style={{ zIndex: 2 }}
                          className="badge badge-secondary p-2 align-item-start position-relative mt-1 translate-middle "
                          onClick={() => setToggle(!toggle)}
                        >
                          <span>
                            <Icon name="chevron-right-fill-c" className="wrkflowBadge"></Icon>
                          </span>
                        </div>
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
                          fitView={inlineAddWorkflow ? false : fitviewPage}
                          nodeTypes={nodeTypes}
                        >
                          <Controls />
                          <Background variant={"cross"} />
                        </ReactFlow>
                      </div>
                    </ReactFlowProvider>
                  </div>

                </Card>


                {/* clicking in workflow nodes modal - step setup */}
                <Modal isOpen={nodemodalshow['toggle']} size="md" toggle={() => setnodemodalshow({ ...nodemodalshow, toggle: false })}>
                  <CreateNodes
                    allSteps={fullSteps}
                    reactFlowInstance={reactFlowInstance}
                    data={nodemodalshow['data']}
                    close={() => setnodemodalshow({ ...nodemodalshow, toggle: false })}
                    handleCreateNodes={setupFlow}
                    handleDelete={setupDelete}
                    workflow={workflow['workflowJson']}
                  />
                </Modal>

                <Modal isOpen={descriptionModal} toggle={toggleDescriptionModal}>
                  <AddDescription
                    toggle={toggleDescriptionModal}
                    workflow={workflow}
                    setWorkflow={setWorkflow}
                    setDescriptionEmptyError={setDescriptionEmptyError}
                  />
                </Modal>
                <JoyrideComp
                  steps={tourSteps}
                  run={run}
                  setRun={setRun}
                />

              </>

            </Content>
          </FilesBody>
        </div>
      </>
  );
}

export default Flow;
