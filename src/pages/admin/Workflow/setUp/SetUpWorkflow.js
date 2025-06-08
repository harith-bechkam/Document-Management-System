import { Button, Card, Col, Modal, Row, Tooltip } from "reactstrap"
import Head from "../../../../layout/head/Head"
import FilesBody from "../../../app/file-manager/components/Body"
import FileManagerLayout from "../../../app/file-manager/components/Layout"
import { useNavigate, useParams } from "react-router"
import ReactFlow, { addEdge, applyNodeChanges, Background, Controls, Handle, MarkerType, Panel, Position, ReactFlowProvider, reconnectEdge, useEdgesState, useNodesState } from "reactflow"
import { useCallback, useEffect, useRef, useState } from "react"
import Content from "../../../../layout/content/Content"
import Select from "react-select";
import * as API from '../../../../utils/API';
import { Icon, UserAvatar } from "../../../../components/Component"
import { CheckPicker, DatePicker, Input, InputGroup, SelectPicker, Stack, Table } from 'rsuite';
import toast from "react-hot-toast"
import { findLogoName } from "../../../../utils/Utils"
import { useDispatch, useSelector } from "react-redux"
import Swal from "sweetalert2";
import { differenceInCalendarDays, format } from "date-fns"
import FullScreenModal from "../../../app/file-manager/modals/FullScreenModal"
import { triggerCurrentDirectorySave, triggerInlineAddWorkflow, triggerInlineEditWorkflow, triggerInlinePrintWorkflow, triggerSingleWorkflowView, triggerWorkflowCloned } from "../../../../redux/folderSlice"
import { omit } from "lodash"
import JoyrideComp from "../../../app/file-manager/modals/Joyride"


const custom_node = ({ data, isConnectable }) => {
    const truncate = (str, len) => {
        return str?.length > len ? `${str?.substring(0, len)}...` : str;
    };
    return (
        <>
            {!data.accessKey ? (
                data.label !== 'Publish' && (
                    <div className="level">
                        <Icon name="arrow-right-circle-fill" style={{ color: "black" }} />
                    </div>
                )
            ) : ''}
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

let id = 0;
let pos = {};
let edg = 0;

const getEdge = () => `dndedge_${edg++}`;


const SetUpWorkflow = () => {
    let { togoName, togoId, op, WorkflowId } = useParams()

    const reactFlowWrapper = useRef(null);
    const navigate = useNavigate();
    const store = useSelector(state => state.folders);
    const dispatch = useDispatch();
    const [selectedUsers, setselectedUsers] = useState([]);
    const [selectedGroups, setselectedGroups] = useState([]);
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [p_id, setP_id] = useState(0)
    const cardRef = useRef(null);

    const [allWorkflowDatas, setAllWorkflowDatas] = useState([])
    let allWorkflowDataArr = []
    const [workflow, setWorkflow] = useState(null)

    const [selectedWorkflow, setSelectedWorkflow] = useState(null)
    const [workflowOptions, setWorkflowOptions] = useState([])

    const [isNodeClicked, setIsNodeClicked] = useState(null)

    const [usersList, setUsersList] = useState([])
    const [usersGroupList, setUsersGroupList] = useState([])
    const [combineBothList, setCombineBothList] = useState([])

    const [editorsList, setEditorsList] = useState([])
    const [reviewersList, setReviewersList] = useState([])
    const [approversList, setApproversList] = useState([])
    const [endDate, setEndDate] = useState('');
    const [selectedApprovalType, setSelectedApprovalType] = useState(null)


    const [publisherList, setPublisherList] = useState([])
    const [usersAccess, setUsersAccess] = useState('view');

    const [sharedWithUsers, setSharedWithUsers] = useState([]);
    const [sharedWithGroups, setSharedWithGroups] = useState([]);
    const [isPrefilled, setIsPrefilled] = useState(false)

    const [editMatchedWorkflow, setEditMatchedWorkflow] = useState(null)

    const currentDate = new Date()
    const { Column, HeaderCell, Cell } = Table;

    const [tooltipOpen, setOpen] = useState(false);
    const [refreshFlad, setRefreshFlag] = useState(false);

    const [document, setDocument] = useState({});
    const [resetClicked, setResetClicked] = useState(false);
    const resetClick = useRef(false);
    const [inlineWorkflowModal, setInlineWorkflowModal] = useState(false);
    const [clickedAddNewWorkflow, setClickedAddNewWorkflow] = useState(true);
    const [clickedEditWorkflow, setClickedEditWorkflow] = useState(false);
    const [clickedViewWorkflows, setClickedViewWorkflows] = useState(false);
    const selectedEditWorkflow = useSelector(state => state.folders.inlineEditWorkflow);
    const inlineWorkflowCreated = useSelector(state => state.folders.inlineWorkflowCreated);
    const [outdatedAlert, setOutdatedAlert] = useState('');
    const [editOptionClicked, setEditOptionClicked] = useState(false);
    const workflowClonedUpdate = useSelector(state => state.folders.workflowCloned);

    const Privilege = JSON?.parse(localStorage.getItem('privileges'));
    const privileges = {
        addWorkflow: Privilege?.workflow?.addWorkflow,
        updateWorkflow: Privilege?.workflow?.updateWorkflow,
        deleteWorkflow: Privilege?.workflow?.deleteWorkflow
    }

    const toggleInlineWorkflowModal = () => {
        setInlineWorkflowModal(!inlineWorkflowModal);
        if (!inlineWorkflowModal) {
            dispatch(triggerInlineAddWorkflow({ active: false }))
        }
    }

    useEffect(() => {
        if (op == 'create') fetchAllWorkflows()
        fetchUsers()

        if (op == 'edit') getMatchedWorkflow()
    }, [inlineWorkflowCreated, refreshFlad])


    useEffect(() => {
        if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 2.0, minZoom: 1.1 })
            reactFlowInstance.setViewport({ x: -280, y: 0 })
        }
    }, [reactFlowInstance])

    function checkWorkflowTemplateUpdatationStatus(initialWorkflow, currentWorkflow) {
        let updated = false;
        if (initialWorkflow.length != currentWorkflow.length) {
            updated = true;
            return true;
        }
        for (let i = 0; i < initialWorkflow.length; i++) {
            if (initialWorkflow[i].id != currentWorkflow[i].id) {
                updated = true;
            }
            if (initialWorkflow[i].stepName != currentWorkflow[i].stepName) {
                updated = true;
            }
            if (initialWorkflow[i].triggers?.accept != currentWorkflow[i].triggers?.accept) {
                updated = true;
            }
            if (initialWorkflow[i].triggers?.reject != currentWorkflow[i].triggers?.reject) {
                updated = true;
            }
        }
        return updated;
    }


    async function fetchAllWorkflows() {
        let workflowResponse = await API.getAllWorkflows()
        if (workflowResponse['status']) {

            setAllWorkflowDatas(workflowResponse['data'])
            allWorkflowDataArr = workflowResponse['data']
            const workflowOptions = workflowResponse['data'].map((w, index) => ({
                value: w?._id,
                label: w?.workflowName
            }))
            setWorkflowOptions(workflowOptions)
        }

        if (inlineWorkflowCreated.status) {
            handleWorkflowChange({
                label: inlineWorkflowCreated.name,
                value: inlineWorkflowCreated.id
            })
            dispatch(triggerInlinePrintWorkflow({
                id: '',
                name: '',
                active: false,
            }))
            dispatch(triggerInlineAddWorkflow({
                active: false
            }))
        }
        if (workflowClonedUpdate.status) {
            handleWorkflowChange({
                label: workflowClonedUpdate.name,
                value: inlineWorkflowCreated.id
            })
            dispatch(triggerInlinePrintWorkflow({
                id: '',
                name: '',
                active: false,
            }))
            dispatch(triggerInlineAddWorkflow({
                active: false
            }))
        }

    }


    function userAvatar(status, img) {
        if (status) {
            return <span><img src={img} style={{ width: 24, height: 24, marginRight: 10, borderRadius: '50%' }} /></span>
        } else {
            return <span><UserAvatar text={findLogoName(img)} className="sm" /> </span>
        }
    }

    const fetchUsers = async () => {
        const usersList = await API.getAllUsers()
        const userGroupList = await API.getAllUserGroups()

        if (!usersList.status) return toast.error('Users Fetch Error')
        if (!userGroupList.status) return toast.error('User Groups Fetch Error')

        let tempUsers = []
        let tempUserGroups = []
        for (let i = 0; i < usersList.data.length; i++) {
            tempUsers.push({
                label: usersList.data[i].userName,
                value: usersList.data[i]._id,
                imgUrl: usersList.data[i].imgUrl
                    ? { imgPresent: true, img: usersList.data[i].imgUrl }
                    : { imgPresent: false, img: usersList.data[i].userName },
                category: 'Specific Users',
                combinedValue: `users-${usersList.data[i]._id}`,
                publisherValue: `users-${usersList.data[i].userName}-${usersList.data[i]._id}`,
            })
        }
        setUsersList(tempUsers)

        for (let i = 0; i < userGroupList.data.length; i++) {
            tempUserGroups.push({
                label: userGroupList.data[i].groupName,
                value: userGroupList.data[i]._id,
                imgUrl: { imgPresent: false, img: userGroupList.data[i].groupName.charAt(0).toUpperCase() },
                // <div className="user-avatar-group">
                //     {userGroupList.data[i].members.length <= 4
                //         ? userGroupList.data[i].members.slice(0, 4).map((member, index) =>
                //             <div key={index} className="user-avatar xs members_avatar">
                //                 {member.profileImg
                //                     ? { imgPresent: true, img: member.profileImg } //<img src={member.profileImg} alt="" />
                //                     : { imgPresent: false, img: member.username.charAt(0).toUpperCase() } //<span>{member.username.charAt(0).toUpperCase()}</span>
                //                 }
                //             </div>
                //         )
                //         : userGroupList.data[i].members.slice(0, 3).map((member, index) =>
                //             <div key={index} className="user-avatar xs members_avatar">
                //                 {member.profileImg
                //                     ? { imgPresent: true, img: member.profileImg }
                //                     : { imgPresent: false, img: member.username.charAt(0).toUpperCase() }}
                //             </div>
                //         )}
                //     {userGroupList.data[i].members.length > 4 && (
                //         <div className="user-avatar xs members_avatar">
                //             <span>{userGroupList.data[i].members.length - 3}+</span>
                //         </div>
                //     )}
                // </div>,
                category: 'User Groups',
                combinedValue: `userGroup-${userGroupList.data[i]._id}`,
                publisherValue: `userGroup-${userGroupList.data[i].groupName}-${userGroupList.data[i]._id}`,
            });
        }
        console.log(userGroupList, tempUserGroups, "tempUserGroups")
        setUsersGroupList(tempUserGroups)


        var tempDocumentCreator = [{
            category: "Document Creator",
            combinedValue: "docCreator-docCreator",
            imgUrl: { imgPresent: false, img: `D` },
            label: "Document Creator",
            publisherValue: "docCreator-docCreator-docCreator",
            value: "66c5e5982145836d7acd1ffa"
        }]

        const combinedList = [...tempDocumentCreator, ...tempUsers, ...tempUserGroups]
        setCombineBothList(combinedList)
    }


    const getMatchedWorkflow = async () => {

        // let workflowDetails = JSON.parse(JSON.stringify(store.currClickedItem))
        dispatch(triggerCurrentDirectorySave({ location: togoId }))
        var particularWorkflowResponse = null;
        if (inlineWorkflowCreated.status) {
            setOutdatedAlert('');
            debugger
            particularWorkflowResponse = await API.getWorkflowById(inlineWorkflowCreated.id)

            debugger
            await fillEmptyValues(particularWorkflowResponse?.data[0])
            let obj = {
                _id: particularWorkflowResponse?.data[0]['_id'],
                workflowName: particularWorkflowResponse?.data[0]['workflowName'],
                stepsInfo: {
                    nodes: particularWorkflowResponse?.data[0]['stepsInfo']['nodes'],
                    edges: particularWorkflowResponse?.data[0]['stepsInfo']['edges']
                },
                workflowSteps: particularWorkflowResponse?.data[0]['workflowSteps']
            }

            await prefillPreviousUsersList(obj, document.workflow)
            // await buildFlow(obj)
            setNodes(obj['stepsInfo']['nodes'])
            setEdges(obj['stepsInfo']['edges'])
            var updatedFlow = {
                _id: obj['_id'],
                workflowName: obj['workflowName'],
                stepsInfo: {
                    nodes: obj['stepsInfo']['nodes'],
                    edges: obj['stepsInfo']['edges']
                },
                workflowSteps: obj['workflowSteps']
            }
            debugger
            setWorkflow(updatedFlow)
            return
        }
        else {
            debugger

            particularWorkflowResponse = await API.getParticularWorkflowDetailsWhichNotPresentinWorkflowCollection(togoId)
            var { status, message } = particularWorkflowResponse

            let workflowDetails = null

            if (status) {
                workflowDetails = particularWorkflowResponse['data']
            }
            else toast.error(`${message}`)


            if (workflowDetails && workflowDetails['workflow']) {
                setDocument(workflowDetails);
                workflowDetails['_id'] = workflowDetails['workflow']['workflowId']
                if (workflowDetails?.workflow?.originalWorkflowId) {
                    setSelectedWorkflow({
                        label: workflowDetails?.workflow?.originalWorkflowName,
                        value: workflowDetails?.workflow?.originalWorkflowId
                    })

                }
                delete workflowDetails['workflow']['workflowId']
            }

            setEditMatchedWorkflow(workflowDetails)

            let workflowResponse = await API.getAllWorkflows()
            if (workflowResponse['status']) {

                setAllWorkflowDatas(workflowResponse['data'])

                const initialWorkflow = workflowResponse['data'].find(elem => elem._id.toString() == workflowDetails?.workflow?.originalWorkflowId);
                if (initialWorkflow) {
                    const outdatedResponse = checkWorkflowTemplateUpdatationStatus(initialWorkflow.workflowSteps, workflowDetails?.workflow?.workflowSteps);
                    if (outdatedResponse) {
                        setOutdatedAlert(`The Current Worklow Template is outdated. Do you want to reset?`)
                    }
                }

                const workflowOptions = workflowResponse['data'].map((w, index) => ({
                    value: w?._id,
                    label: w?.workflowName
                }))
                setWorkflowOptions(workflowOptions)

                let selectedWorkflow = workflowDetails?.['workflow']

                if (workflowDetails?.['workflow']) {
                    // debugger
                    await fillEmptyValues(selectedWorkflow)

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
                else {
                    // debugger
                    setNodes([])
                    setEdges([])
                    setWorkflow(null)

                    setIsNodeClicked(null)
                    setEditorsList([])
                    setReviewersList([])
                    setApproversList([])
                    setEndDate('')
                    setSelectedApprovalType('')

                }
            }


        }

    }

    function resetUpdatedTemplate(originalId) {
        setResetClicked(true);
        resetClick.current = true
        // console.log(originalId);
        // console.log(allWorkflowDatas)`
        const newWorkflow = allWorkflowDatas.find(elem => elem._id.toString() == originalId.toString());
        handleWorkflowChange({
            label: newWorkflow.workflowName,
            value: newWorkflow._id
        })
    }


    const handleWorkflowChange = async (selectedOption) => {
        let selectedWorkflow = []
        if (allWorkflowDataArr.length == 0) {
            allWorkflowDataArr = allWorkflowDatas
        }
        if (op == "create" && selectedOption) {
            selectedWorkflow = allWorkflowDataArr.find(item => item['_id'] == selectedOption['value'])
            setSelectedWorkflow(selectedOption)
        }
        if (op == "create" && !selectedOption) {
            setSelectedWorkflow(null)
            setWorkflow(null)
        }

        if (op == "edit" && selectedOption) {
            selectedWorkflow = allWorkflowDataArr.find(item => item['_id'] == selectedOption['value'])
            setSelectedWorkflow(selectedOption)
        }
        if (op == "edit" && !selectedOption) {
            selectedWorkflow = editMatchedWorkflow['workflow']//load db filled workflow
            setSelectedWorkflow(null)
        }


        if ((op == "create" && selectedOption) || op == "edit") {

            if (selectedWorkflow) {

                await fillEmptyValues(selectedWorkflow)
                let obj = {
                    _id: selectedWorkflow['_id'],
                    workflowName: selectedWorkflow['workflowName'],
                    stepsInfo: {
                        nodes: selectedWorkflow['stepsInfo']['nodes'],
                        edges: selectedWorkflow['stepsInfo']['edges']
                    },
                    workflowSteps: selectedWorkflow['workflowSteps']
                }

                if (resetClick.current) {
                    await prefillPreviousUsersList(obj, document.workflow)
                }
                await buildFlow(obj)

            }
            else {

                setNodes([])
                setEdges([])
                setWorkflow(null)

                setIsNodeClicked(null)
                setEditorsList([])
                setReviewersList([])
                setApproversList([])
                setEndDate('')
                setSelectedApprovalType('')
            }


        }


    }


    const convertUTCToIST = (utcDate, tz) => {
        return new Date(utcDate.toLocaleString('en-US', { timeZone: tz || 'Asia/Kolkata' }));
    }

    const prefillUsersList = async (clickedNode) => {

        const convertBack = (data) => {
            return Object.entries(data).flatMap(([key, values]) =>
                values.map(value => `${key}-${value}`)
            )
        }

        setEditorsList(convertBack(clickedNode['data']['access']['editor'] && clickedNode['data']['access']['editor'] || []))
        setReviewersList(convertBack(clickedNode['data']['access']['reviewer'] && clickedNode['data']['access']['reviewer'] || []))
        setApproversList(convertBack(clickedNode['data']['access']['approver'] && clickedNode['data']['access']['approver'] || []))
        setEndDate(clickedNode['data']['endDate'] || '')//&& convertUTCToIST(clickedNode['data']['endDate'], (localStorage.getItem('timeZone') || 'Asia/Kolkata')) || null

        let apType = clickedNode['data']['approvalType'] && clickedNode['data']['approvalType'] || ''

        if (apType == '') {
            setSelectedApprovalType('Multiple')
        }
        else {
            setSelectedApprovalType(apType)
        }
    }

    const prefillPublisherList = async (publishStep) => {

        if (!publishStep['publisherList']) {
            publishStep['publisherList'] = {
                users: [],
                userGroup: []
            }
        }

        setSharedWithUsers(publishStep['publisherList']['users'])
        setSharedWithGroups(publishStep['publisherList']['userGroup'])

        if (publishStep['publisherList']['users'].length != 0 || publishStep['publisherList']['userGroup'].length != 0) {
            setIsPrefilled(true)

            const userList = publishStep['publisherList']['users'].map(user => `users-${user.userName}-${user.id}`);
            const groupList = publishStep['publisherList']['userGroup'].map(group => `userGroup-${group.groupName}-${group.id}`);

            setPublisherList([...userList, ...groupList])

        }
        else {
            setIsPrefilled(false)
        }
    }

    const fillEmptyValues = async (selectedWorkflow) => {

        selectedWorkflow['stepsInfo']['nodes'].forEach(node => {
            if (!node.data.hasOwnProperty('access')) {
                node.data.access = { editor: {}, reviewer: {}, approver: {} }
            }

            if (!node.data.access.hasOwnProperty('editor')) {
                node.data.access.editor = {}
            }

            if (!node.data.access.hasOwnProperty('reviewer')) {
                node.data.access.reviewer = {}
            }

            if (!node.data.access.hasOwnProperty('approver')) {
                node.data.access.approver = {}
            }

            if (!node.data.hasOwnProperty('endDate')) {
                node.data.endDate = ''
            }

            if (!node.data.hasOwnProperty('approvalType')) {
                node.data.approvalType = ''
            }
        })

        selectedWorkflow['workflowSteps'].forEach(node => {
            if (!node.hasOwnProperty('access')) {
                node.access = { editor: {}, reviewer: {}, approver: {} }
            }

            if (!node.access.hasOwnProperty('editor')) {
                node.access.editor = {}
            }

            if (!node.access.hasOwnProperty('reviewer')) {
                node.access.reviewer = {}
            }

            if (!node.access.hasOwnProperty('approver')) {
                node.access.approver = {}
            }

            if (!node.hasOwnProperty('endDate')) {
                node.endDate = ''
            }
            if (!node.hasOwnProperty('approvalType')) {
                node.approvalType = ''
            }
        })
    }

    async function prefillPreviousUsersList(newWorkflow, previousWorkflow) {
        console.log(newWorkflow, previousWorkflow);
        // debugger
        for (let step of newWorkflow.workflowSteps) {
            const stepExist = previousWorkflow.workflowSteps.find(stage => stage.id == step.id);
            if (stepExist) {
                step["access"] = stepExist["access"];
                step["publisherList"] = stepExist["publisherList"];
                step["isLastStep"] = stepExist["isLastStep"];
                step["stepName"] = stepExist["stepName"];
                step["approvalType"] = stepExist["approvalType"];
            }
        }
        for (let node of newWorkflow.stepsInfo?.nodes) {
            const nodeExist = previousWorkflow.stepsInfo?.nodes.find(stage => stage.id == node.id);
            if (nodeExist) {
                node["data"] = nodeExist["data"];
            }
        }
        const stepInfo = {}
        setWorkflow(newWorkflow)
    }

    {/* React flow Functions */ }
    const buildFlow = async (data) => {

        // let node = await centerFlowchart(data['stepsInfo']['nodes'])
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


        setIsNodeClicked(data['stepsInfo']['nodes'][0])
        await prefillUsersList(data['stepsInfo']['nodes'][0])
        await prefillPublisherList(data['workflowSteps'].find(item => item['stepName'].toLowerCase() == 'publish'))


        id = takeLastId(data['stepsInfo']['nodes']) + 2
        edg = takeLastId(data['stepsInfo']['edges']) + 2

        dispatch(triggerWorkflowCloned({
            name: '',
            id: '',
            action: false
        }))

    }

    const takeLastId = (allNodes) => {
        var lastId = allNodes[allNodes.length - 1]?.['id']

        const lastid = parseInt(lastId.split('_')[1], 10)
        return lastid
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
    {/* ------------------------------------------------------------------- */ }


    const handleApprovalCheckboxChange = (type) => {
        setSelectedApprovalType(type == selectedApprovalType ? null : type)
    }


    const handleClickedStepValue = async (editorsList, reviewersList, approversList, selectedApprovalType, edDate) => {
        const tempWorkflow = { ...workflow }

        const updateNodeAccess = (node, editors, reviewers, approvers) => {

            node['data']['access']['editor'] = editors.reduce((acc, curr) => {
                const parts = curr.split('-');
                if (parts.length == 2) {
                    const [key, value] = parts;
                    (acc[key] = acc[key] || []).push(value)
                }
                return acc;
            }, {})

            node['data']['access']['reviewer'] = reviewers.reduce((acc, curr) => {
                const parts = curr.split('-');
                if (parts.length == 2) {
                    const [key, value] = parts;
                    (acc[key] = acc[key] || []).push(value)
                }
                return acc;
            }, {})

            node['data']['access']['approver'] = approvers.reduce((acc, curr) => {
                const parts = curr.split('-');
                if (parts.length == 2) {
                    const [key, value] = parts;
                    (acc[key] = acc[key] || []).push(value)
                }
                return acc
            }, {})

            node['data']['approvalType'] = selectedApprovalType ? selectedApprovalType : ''
            node['data']['endDate'] = edDate
            node['data']['accessKey'] = approvers.length !== 0 && selectedApprovalType != ""
        }

        const updateStepAccess = (node, editors, reviewers, approvers) => {

            node['access']['editor'] = editors.reduce((acc, curr) => {
                const parts = curr.split('-');
                if (parts.length == 2) {
                    const [key, value] = parts;
                    (acc[key] = acc[key] || []).push(value)
                }
                return acc;
            }, {})

            node['access']['reviewer'] = reviewers.reduce((acc, curr) => {
                const parts = curr.split('-');
                if (parts.length == 2) {
                    const [key, value] = parts;
                    (acc[key] = acc[key] || []).push(value)
                }
                return acc;
            }, {})

            node['access']['approver'] = approvers.reduce((acc, curr) => {
                const parts = curr.split('-');
                if (parts.length == 2) {
                    const [key, value] = parts;
                    (acc[key] = acc[key] || []).push(value)
                }
                return acc
            }, {})

            node['approvalType'] = selectedApprovalType ? selectedApprovalType : ''
            node['endDate'] = edDate
            node['accessKey'] = approvers.length !== 0 && selectedApprovalType != ""
        }

        let currNode = tempWorkflow['stepsInfo']['nodes'].find(item => item['id'] == isNodeClicked['id'])
        updateNodeAccess(currNode, editorsList, reviewersList, approversList)

        let currNodeStep = tempWorkflow['workflowSteps'].find(item => item['id'] == isNodeClicked['id'])
        updateStepAccess(currNodeStep, editorsList, reviewersList, approversList)

        setWorkflow(tempWorkflow)


        let tempAllWorkflow = [...allWorkflowDatas]

        tempAllWorkflow = tempAllWorkflow.map(workflow =>

            workflow._id == tempWorkflow._id ?
                {
                    ...tempWorkflow,
                    // , isActive: workflow.isActive, createdBy: workflow.createdBy
                }
                : workflow
        )
        setAllWorkflowDatas(tempAllWorkflow)
    }

    const delWorkflow = async (e) => {
        e.preventDefault()


        Swal.fire({
            title: "Are you sure you want to delete this workflow?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {

                var workflowResponse = await API.deleteWorkflowInFiles(togoName, togoId)
                var { status, message } = workflowResponse

                if (status) {
                    Swal.fire("Deleted!", "Workflow has been deleted", "success");
                    setNodes([])
                    setEdges([])
                    setWorkflow(null)

                    setIsNodeClicked(null)
                    setEditorsList([])
                    setReviewersList([])
                    setApproversList([])
                    setEndDate('')
                    setSelectedApprovalType('')

                }
                else {
                    Swal.fire("Error", "Unable to Delete Workflow", "error");
                }
            }

        });
    }

    const validateSteps = (steps) => {
        for (let step of steps) {

            let approverExists = false, approversExist = false

            if (step['access']['approver'].hasOwnProperty('docCreator')) {
                approverExists = approversExist = true
            }
            else {
                approverExists = step.access.approver && Object.keys(step.access.approver).length > 0
                approversExist = approverExists && (
                    (step.access.approver.users && step.access.approver.users.length > 0) ||
                    (step.access.approver.userGroup && step.access.approver.userGroup.length > 0)
                )
            }

            const approvalTypeExists = step.approvalType && step.approvalType.trim() != ''

            if (!approversExist || !approvalTypeExists) {
                return false
            }
        }
        return true
    }



    const submit = async (e) => {
        e.preventDefault();
        // debugger
        const isValid = validateSteps(workflow['workflowSteps'].filter(item => item['stepName'].toLowerCase() != "publish"))
        if (!isValid) {
            toast.error('Please fill all mandatory fields')
            return
        }

        let publishStepId = ""
        workflow['workflowSteps'] = workflow['workflowSteps'].map((item, index, array) => {
            if (item['stepName'].toLowerCase() == 'publish') {

                publishStepId = item['id']

                item.publisherList = {
                    users: sharedWithUsers, userGroup: sharedWithGroups
                }
                item.isEndStep = true
            }
            else {
                item.isLastStep = false
            }
            return item
        })


        workflow['workflowSteps']?.map(item => {

            if (item?.triggers && (item?.triggers.accept == publishStepId || item?.triggers.reject == publishStepId)) {
                item.isLastStep = true
            }

            if (item?.isLastStep) {
                item.publisherList = {
                    users: sharedWithUsers, userGroup: sharedWithGroups
                }
            }
        })


        let revisionNumber = 0;
        if ((workflow?.revisionNo == NaN) || (workflow?.revisionNo == null) || !workflow?.revisionNo) {
            revisionNumber = 0;
        } else {
            revisionNumber = workflow?.revisionNo
        }
        debugger
        var workflowResponse = await API.updateWorkflowInFiles(workflow, togoName, togoId, revisionNumber)
        var { status, message } = workflowResponse

        if (status) {
            toast.success(`${message}`, { duration: 120000 })
            if (togoName.toLowerCase() == 'file' || togoName.toLowerCase() == 'form') {
                navigate(`/details/${togoId}`)
            }
            // else {
            //     navigate(`/${togoName}/${togoId}`)
            // }
        }
        else toast.error(`${message}`.replace(/\b\w/g, char => char.toUpperCase()))

    }

    const convertToUTC = (date) => {
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        return utcDate
    }

    const handleUserAccess = event => {
        if (event == 'View') {
            setUsersAccess('view')
        }
        else if (event == 'Edit') {
            setUsersAccess('edit')
        }
        else {
            setUsersAccess('view')
        }
    }

    const handlePublisherlist = async (data) => {

        const formattedList = data.length == 0 ? [] : data.map(item => {
            if (typeof item == 'string') {
                const [category, name, id] = item.split('-')

                if (category == "users") {
                    return { category, userName: name, id, access: usersAccess }
                }
                if (category == "userGroup") {
                    return { category, groupName: name, id, access: usersAccess }
                }

            } else {
                return item
            }
        })

        const users = formattedList.filter(item => item.category == 'users')
        const userGroups = formattedList.filter(item => item.category == 'userGroup')
        // setselectedUsers([selectedUsers, ...users])
        // setselectedGroups([selectedGroups, ...userGroups])
        setselectedUsers(users)
        setselectedGroups(userGroups)
        setPublisherList(data)
    }

    const updatesharelist = async () => {
        let updatedusers = sharedWithUsers;
        for (let newuser of selectedUsers) {
            if (sharedWithUsers.filter(user => (user.id == newuser.id)).length == 0) {
                updatedusers.push(newuser)
            }
        }
        setSharedWithUsers(updatedusers);

        let updatedgroups = sharedWithGroups;
        for (let newgroup of selectedGroups) {
            if (sharedWithGroups.filter(group => (group.id == newgroup.id)).length == 0) {
                updatedgroups.push(newgroup)
            }
        }
        setSharedWithGroups(updatedgroups);
        setselectedUsers([])
        setselectedGroups([])
        setPublisherList([])
    }

    const updateSharedWithUsers = async (access, row) => {
        setSharedWithUsers(prevUsers =>
            prevUsers.map(user =>
                user.id == row.id ? { ...user, access } : user
            )
        )
    }

    const updateSharedWithUserGroup = async (access, row) => {
        setSharedWithGroups(prevUsers =>
            prevUsers.map(group =>
                group.id == row.id ? { ...group, access } : group
            )
        )
    }

    const deleteSharedWithUsers = async (e, row) => {
        e.preventDefault()
        setSharedWithUsers(prevUsers => prevUsers.filter(user => user.id !== row.id))
    }

    const deleteSharedWithUserGroup = async (e, row) => {
        e.preventDefault()
        setSharedWithGroups(prevUsers => prevUsers.filter(user => user.id !== row.id))
    }

    const toggle = () => { setOpen(!tooltipOpen) };

    const CustomOption = (props) => {
        const { data, innerRef, innerProps } = props;
        return (
            <div ref={innerRef} {...innerProps} className="workflow-options-select"
            >
                <span>{data.label}</span>
                <div className="workflow-select-actions">
                    <Icon
                        title='View'
                        className={`workflow-view `}
                        name={`info-i`}
                        onClick={(e) => {
                            e.stopPropagation()
                            dispatch(triggerSingleWorkflowView({
                                active: true,
                                id: data.value,
                                name: data.label
                            }))
                            setClickedViewWorkflows(true);
                            setClickedAddNewWorkflow(false);
                            setResetClicked(false);
                            resetClick.current = false
                            setClickedEditWorkflow(false);
                            setInlineWorkflowModal(true)
                        }}
                    />
                    {privileges.updateWorkflow && <Icon
                        className={`workflow-edit`}
                        name="edit"
                        title='Edit'
                        onClick={(e) => {
                            e.stopPropagation()
                            setEditOptionClicked(true)
                            dispatch(triggerInlineEditWorkflow({
                                id: data.value,
                                name: data.label,
                                active: true
                            }))
                            setClickedAddNewWorkflow(false);
                            setResetClicked(false);
                            resetClick.current = false
                            setClickedEditWorkflow(true);
                            setInlineWorkflowModal(true)
                        }}
                    />}
                    {privileges.deleteWorkflow && <Icon
                        className={`workflow-delete text-danger`}
                        name="trash"
                        title='Delete'
                        onClick={(e) => {
                            e.stopPropagation()
                            Swal.fire({
                                icon: 'warning',
                                title: `Are you sure?`,
                                text: `You are about to delete the workflow '${data.label}'!`,
                                showCancelButton: true,
                                confirmButtonText: `Yes, delete it`
                            }).then(async res => {
                                if (res.isConfirmed) {
                                    // setLoader(true);
                                    const deleteRespo = await API.deleteWorkflow(data.value);
                                    if (!deleteRespo.status) {
                                        // setLoader(false);
                                        return toast.error(`Unable to delete workflow`);
                                    }
                                    // setLoader(false);
                                    setRefreshFlag(prev => !prev);
                                }
                            })
                        }}
                    />}
                </div>
            </div>
        );
    };

    const [run, setRun] = useState(false);

    const [tourSteps, setTourSteps] = useState([
        {
            target: ".inline-add-template",
            content: "Create a workflow template",
        },
        {
            target: ".inline-view-template",
            content: "View available templates",
        },
        {
            target: ".setupworkflow",
            content: "Selected workflow is visible here",
        },
        {
            target: ".usersPlace",
            content: "Specify approvers for each step",
        },
    ])


    function startRide() {
        setRun(true);
        setTimeout(() => {
            const joyride_beacon = window.document.querySelector(`.react-joyride__beacon`);
            joyride_beacon.click();

        }, 1000);
    }

    const [_tooltipOpen, setTooltipOpen] = useState({});
    const toolTipToggle = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const customFilter = (option, inputValue) => {
        const label = option.label.toLowerCase();
        const searchValue = inputValue.toLowerCase();

        return label.includes(searchValue);
    };

    useEffect(() => {
        if (reactFlowInstance && nodes.length > 0) {
            reactFlowInstance.fitView({ padding: 0.1 });
        }
    }, [reactFlowInstance, nodes, edges]);

    return (
        <FileManagerLayout>
            <Head title="setUpWorkflow"></Head>
            <FilesBody>
                <Content>
                    <Row>
                        <Col lg="11">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div className="choose-label-box">
                                    <label className="form-label"> Choose Workflow <span style={{ color: 'red' }}> *</span></label>
                                    {/* <button className="joyride-tour bg-transparent" onClick={() => startRide()}><Icon id={`joyride-icon`} className={`text-info fs-3`} name={`help-fill`} /></button> */}
                                    {/* <Tooltip
                                        placement="top"
                                        isOpen={_tooltipOpen["joyride-icon"] || false}
                                        target="joyride-icon"
                                        toggle={() => toolTipToggle("joyride-icon")}
                                    >
                                        Start Tour
                                    </Tooltip> */}
                                </div>
                                <div>
                                    {outdatedAlert.length > 0 && <>
                                        <span style={{ color: 'red', paddingInline: '0.4rem' }}>{outdatedAlert}</span>
                                        <button className="mb-2 btn btn-warning" onClick={() => {
                                            resetUpdatedTemplate(document.workflow?.originalWorkflowId)
                                            setOutdatedAlert('');
                                        }}>Reset</button>
                                    </>}
                                </div>
                            </div>
                            <Select
                                id="Success Route"
                                isClearable
                                options={workflowOptions}
                                value={selectedWorkflow}
                                placeholder='Select Workflow'
                                onChange={handleWorkflowChange}
                                components={{ Option: CustomOption }}
                                filterOption={customFilter}
                            />

                        </Col>
                        <Col lg="1" className="d-flex justify-content-center align-items-end">
                            <Button
                                color="primary"
                                style={{ height: "2.7rem" }}
                                className="rounded"
                                disabled={nodes?.length > 1 ? false : true}
                                onClick={submit}
                            >
                                Save
                            </Button>

                            <span
                                id="delWorkflow"
                                className="d-flex align-items-center ml-2"
                                style={{ height: "2.7rem", color: 'red', cursor: 'pointer' }}
                                onClick={delWorkflow}
                            >
                                <Icon name={'trash'} />
                            </span>


                            <Tooltip placement="top" isOpen={tooltipOpen} target="delWorkflow" toggle={toggle}>
                                Delete Workflow
                            </Tooltip>

                        </Col>
                    </Row>
                    <div style={{ display: 'flex' }}>
                        {privileges.addWorkflow && <>
                            <span className="Inline-Workflow-Tab inline-add-template" style={{ paddingTop: '0.5rem', paddingInline: '0.5rem' }}
                                onClick={() => {
                                    dispatch(triggerInlineAddWorkflow({ active: true }))
                                    setClickedEditWorkflow(false);
                                    setResetClicked(false);
                                    setClickedViewWorkflows(false);
                                    resetClick.current = false
                                    setClickedAddNewWorkflow(true);
                                    setInlineWorkflowModal(true)
                                    dispatch(triggerInlinePrintWorkflow({
                                        name: '',
                                        id: '',
                                        action: false
                                    }))
                                }}
                            >New Template</span>
                            <span style={{ paddingTop: '0.5rem', paddingInline: '0.5rem' }}>|</span>
                        </>}
                        {privileges?.updateWorkflow && workflow && <>
                            <span className="Inline-Workflow-Tab inline-edit-template" style={{ paddingTop: '0.5rem', paddingInline: '0.5rem' }}
                                onClick={() => {
                                    // dispatch(triggerInlineAddWorkflow({ active: true }))
                                    if (selectedWorkflow?.value) {
                                        if ((approversList?.length > 0 || reviewersList?.length > 0 || editorsList?.length > 0) && editOptionClicked) {
                                            Swal.fire({
                                                title: "Are you sure?",
                                                text: `You have unsaved changes in your Workflow '${workflow.workflowName}' configuration. If you leave this page, your changes will be lost. Do you still want to proceed?`,
                                                icon: "warning",
                                                showCancelButton: true,
                                                confirmButtonColor: "#3085d6",
                                                cancelButtonColor: "#d33",
                                                confirmButtonText: "Yes, Update Workflow"
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    dispatch(triggerInlineEditWorkflow({
                                                        id: selectedWorkflow.value,
                                                        name: selectedWorkflow.label,
                                                        active: true
                                                    }))
                                                    setClickedAddNewWorkflow(false);
                                                    setClickedEditWorkflow(true);
                                                    setClickedViewWorkflows(false);
                                                    setResetClicked(false);
                                                    resetClick.current = false
                                                    setInlineWorkflowModal(true)
                                                    dispatch(triggerInlinePrintWorkflow({
                                                        name: '',
                                                        id: '',
                                                        action: false
                                                    }))
                                                }
                                            });
                                        } else {
                                            dispatch(triggerInlineEditWorkflow({
                                                id: selectedWorkflow.value,
                                                name: selectedWorkflow.label,
                                                active: true
                                            }))
                                            setClickedAddNewWorkflow(false);
                                            setClickedEditWorkflow(true);
                                            setClickedViewWorkflows(false);
                                            setResetClicked(false);
                                            resetClick.current = false
                                            setInlineWorkflowModal(true)
                                            dispatch(triggerInlinePrintWorkflow({
                                                name: '',
                                                id: '',
                                                action: false
                                            }))
                                        }
                                    }

                                }}
                            >Edit Template</span>
                            <span style={{ paddingTop: '0.5rem', paddingInline: '0.5rem' }}>|</span>
                        </>}

                        <span className="Inline-Workflow-Tab inline-view-template" style={{ paddingTop: '0.5rem', paddingInline: '0.2rem' }}
                            onClick={() => {
                                setClickedAddNewWorkflow(false);
                                setClickedEditWorkflow(false);
                                setClickedViewWorkflows(true);
                                setResetClicked(false);
                                resetClick.current = false
                                setInlineWorkflowModal(true)
                                dispatch(triggerInlinePrintWorkflow({
                                    name: '',
                                    id: '',
                                    action: false
                                }))
                            }}
                        >View Templates</span>
                    </div>
                    <Row>
                        <Col lg="12" className="mt-2">
                            {!workflow ?
                                <Card className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                                    <center><b>Choose any Workflow !</b></center>
                                </Card>
                                :
                                <div ref={cardRef} className="d-flex flex-row">

                                    <Card className="mt-0" style={{ width: "50%", height: '60vh' }}  >


                                        {/* Workflow Diagram */}
                                        {/* isNodeClicked ? "50%" : "100%"  */}
                                        {/* style={{ height: "100vh", width: "100%" }} */}
                                        <div className="dndflow setupworkflow" style={{ height: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            {workflow &&
                                                <ReactFlowProvider>
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
                                                    >
                                                        <Controls />
                                                        <Background variant={"cross"} />
                                                        {/* <Panel>

                                                            <ul style={{ listStyleType: "none" }}>
                                                                <li className="d-flex">
                                                                    <i
                                                                        class="bi bi-circle-fill"
                                                                        style={{ color: "#0DCAF0" }}
                                                                    >
                                                                        {""}
                                                                    </i>
                                                                    <h4 className="mx-4 fs-6 fw-bold">Step</h4>
                                                                </li>

                                                                <li className="d-flex">
                                                                    <i
                                                                        class="bi bi-dash-lg fw-bold fs-3"
                                                                        style={{ color: "green" }}
                                                                    ></i>
                                                                    <h4 className="mx-3 fs-6 fw-bold ">Accept</h4>
                                                                </li>

                                                                <li className="d-flex">
                                                                    <i
                                                                        class="bi bi-dash-lg fw-bold fs-3"
                                                                        style={{ color: "red" }}
                                                                    ></i>
                                                                    <h4 className="mx-3 fs-6 fw-bold  ">Reject</h4>
                                                                </li>
                                                            </ul>

                                                        </Panel> */}
                                                    </ReactFlow>
                                                </ReactFlowProvider>
                                            }

                                        </div>

                                    </Card>

                                    <Card className="mt-0" style={{ width: "50%", height: '60vh' }}>
                                        {/* Users Lists */}
                                        {isNodeClicked && (
                                            <div className="usersPlace">
                                                <h6 className="mt-4">{(isNodeClicked['data']['label'] == "Publish") ? "While " + isNodeClicked['data']['label'] : "Specify Access - " + isNodeClicked['data']['label']}</h6>

                                                {isNodeClicked['data']['label'].toLowerCase() != 'publish' &&
                                                    <>
                                                        {/* <div className="row mt-4 align-items-center">
                                                            <label className="form-label col-sm-3"> Editor </label>
                                                            <CheckPicker
                                                                className="col-sm-9"
                                                                // data={combineBothList.filter(item => !reviewersList.includes(item.combinedValue) && !approversList.includes(item.combinedValue))}
                                                                data={combineBothList}
                                                                groupBy="category"
                                                                labelKey="label"
                                                                valueKey="combinedValue"
                                                                placeholder='Select Editors'
                                                                multiple
                                                                renderMenuItem={(label, item) => (
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "2%" }}>
                                                                        {userAvatar(item.imgUrl.imgPresent, item.imgUrl.img)}
                                                                        {label}
                                                                    </div>
                                                                )}
                                                                style={{ width: 350 }}
                                                                value={editorsList}
                                                                onChange={async (e) => {

                                                                    // const formattedValues = newValues.map(val => {
                                                                    //     const [category, value] = val.split('-')
                                                                    //     return { category, value }
                                                                    // })

                                                                    setEditorsList(e)
                                                                    await handleClickedStepValue(e, reviewersList, approversList, selectedApprovalType, endDate)
                                                                }}
                                                            />
                                                        </div> */}


                                                        {/* <div className="row mt-4 align-items-center">
                                                            <label className="form-label col-sm-3"> Reviewer </label>
                                                            <CheckPicker
                                                                className="col-sm-9"
                                                                // data={combineBothList.filter(item => !editorsList.includes(item.combinedValue) && !approversList.includes(item.combinedValue))}
                                                                data={combineBothList}
                                                                groupBy="category"
                                                                labelKey="label"
                                                                valueKey="combinedValue"
                                                                placeholder='Select Reviewers'
                                                                multiple
                                                                renderMenuItem={(label, item) => (
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "2%" }}>
                                                                        {userAvatar(item.imgUrl.imgPresent, item.imgUrl.img)}
                                                                        {label}
                                                                    </div>
                                                                )}
                                                                style={{ width: 350 }}
                                                                value={reviewersList}
                                                                onChange={async (e) => {
                                                                    setReviewersList(e)
                                                                    await handleClickedStepValue(editorsList, e, approversList, selectedApprovalType, endDate)
                                                                }}

                                                            />
                                                        </div> */}

                                                        <div className="row mt-4 align-items-center">
                                                            <label className="form-label col-sm-3"> Collaborators <span className="required">*</span></label>
                                                            <CheckPicker
                                                                className="col-sm-9"
                                                                // data={combineBothList.filter(item => !editorsList.includes(item.combinedValue) && !reviewersList.includes(item.combinedValue))}
                                                                data={combineBothList}
                                                                groupBy="category"
                                                                labelKey="label"
                                                                valueKey="combinedValue"
                                                                placeholder='Select Approvers'
                                                                multiple
                                                                renderMenuItem={(label, item) => (
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "2%" }}>
                                                                        {userAvatar(item.imgUrl.imgPresent, item.imgUrl.img)}
                                                                        {label}
                                                                    </div>
                                                                )}
                                                                style={{ width: 350 }}
                                                                value={approversList}
                                                                onChange={async (e) => {
                                                                    setApproversList(e)
                                                                    await handleClickedStepValue(editorsList, reviewersList, e, selectedApprovalType, endDate)
                                                                }}

                                                            />
                                                        </div>

                                                        <div className="row mt-4 align-items-center">
                                                            <label className="form-label col-sm-3"> TAT </label>
                                                            {/* <DatePicker
                                                className="col-sm-10"
                                                value={endDate}
                                                style={{ width: 350 }}
                                                placeholder="Select End Date"
                                                onChange={async (e) => {
                                                    const utcDate = convertToUTC(e)
                                                    setEndDate(utcDate)
                                                    await handleClickedStepValue(editorsList, reviewersList, approversList, selectedApprovalType, utcDate)
                                                }}
                                                renderValue={(value) => {
                                                    if (!value) return '';
                                                    const daysDifference = differenceInCalendarDays(value, currentDate)
                                                    return `${format(value, 'EEE, d MMM')} (${daysDifference} days)`
                                                }}
                                            /> */}

                                                            <InputGroup className="col-sm-9" style={{ width: 323, marginBottom: 10, paddingRight: 0, paddingLeft: 0, marginLeft: "15px" }}>
                                                                <Input
                                                                    value={endDate}
                                                                    placeholder={`TAT`}
                                                                    // placeholder={`Select End ${endDate == '1' ? 'Day' : 'Days'}`}
                                                                    onChange={async (e) => {
                                                                        setEndDate(e)
                                                                        await handleClickedStepValue(editorsList, reviewersList, approversList, selectedApprovalType, e)
                                                                    }}
                                                                />
                                                                <InputGroup.Addon>{endDate == '1' ? 'day' : 'Days'}</InputGroup.Addon>
                                                            </InputGroup>

                                                        </div>

                                                        {(approversList.some(item => item.startsWith("userGroup")) || approversList?.length >= 2) &&
                                                            <div className="row mt-4 align-items-center">
                                                                <label className="form-label col-sm-4">
                                                                    <span className="labelwrapper">
                                                                        Does Everybody Need To Approve
                                                                    </span>
                                                                </label>

                                                                <span className="col-sm-8">
                                                                    <ul className="custom-control-group d-flex">
                                                                        <li>
                                                                            <div className="custom-control custom-control-sm custom-checkbox custom-control-pro checked">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="custom-control-input"
                                                                                    name="btnCheckControl"
                                                                                    id="btnCheckControl1"
                                                                                    checked={selectedApprovalType == "single"}
                                                                                    onChange={async () => {
                                                                                        if (selectedApprovalType == "single") {
                                                                                            handleApprovalCheckboxChange("")
                                                                                            await handleClickedStepValue(editorsList, reviewersList, approversList, '')
                                                                                        }
                                                                                        else {
                                                                                            handleApprovalCheckboxChange("single")
                                                                                            await handleClickedStepValue(editorsList, reviewersList, approversList, 'single')
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <label className="custom-control-label" htmlFor="btnCheckControl1">
                                                                                    Yes
                                                                                </label>
                                                                            </div>
                                                                        </li>
                                                                        <li>
                                                                            <div className="custom-control custom-control-sm custom-checkbox custom-control-pro checked">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="custom-control-input"
                                                                                    name="btnCheckControl"
                                                                                    id="btnCheckControl2"
                                                                                    checked={selectedApprovalType == "Multiple"}
                                                                                    onChange={async () => {
                                                                                        if (selectedApprovalType == "Multiple") {
                                                                                            handleApprovalCheckboxChange("")
                                                                                            await handleClickedStepValue(editorsList, reviewersList, approversList, '')
                                                                                        }
                                                                                        else {
                                                                                            handleApprovalCheckboxChange("Multiple")
                                                                                            await handleClickedStepValue(editorsList, reviewersList, approversList, 'Multiple')
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <label className="custom-control-label" htmlFor="btnCheckControl2">
                                                                                    No
                                                                                </label>
                                                                            </div>
                                                                        </li>
                                                                    </ul>
                                                                </span>
                                                            </div>
                                                        }
                                                    </>
                                                }



                                                {isNodeClicked['data']['label'].toLowerCase() == 'publish' &&
                                                    <>
                                                        <div className="row mt-4 align-items-center">
                                                            <label className="form-label col-sm-2"> Share File to </label>
                                                            <>
                                                                <CheckPicker
                                                                    className="col-sm-10"
                                                                    data={combineBothList.filter(item => item['category'] != 'Document Creator').filter(item => (sharedWithGroups.filter(group => (item.value == group.id)).length == 0 && sharedWithUsers.filter(user => (item.value == user.id)).length == 0))}
                                                                    groupBy="category"
                                                                    labelKey="label"
                                                                    valueKey="publisherValue"
                                                                    placeholder=''
                                                                    multiple
                                                                    renderMenuItem={(label, item) => (
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "2%" }}>
                                                                            {userAvatar(item.imgUrl.imgPresent, item.imgUrl.img)}
                                                                            {label}
                                                                        </div>
                                                                    )}
                                                                    style={{ width: 200 }}
                                                                    value={publisherList}
                                                                    onChange={async (e) => {
                                                                        await handlePublisherlist(e)
                                                                    }}
                                                                />
                                                                <SelectPicker
                                                                    data={['Edit', 'View'].map(
                                                                        item => ({ label: item, value: item })
                                                                    )}
                                                                    defaultValue="View"
                                                                    searchable={false}
                                                                    onChange={handleUserAccess}
                                                                    style={{ width: 150 }}
                                                                    placeholder="Access"
                                                                />

                                                            </>
                                                        </div>
                                                        <>
                                                            <Button
                                                                type="button"
                                                                color="primary"
                                                                className="btn btn-primary"
                                                                onClick={async (e) => {
                                                                    await updatesharelist()
                                                                }}
                                                            >
                                                                Update
                                                            </Button>
                                                        </>
                                                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '20px' }}>

                                                            {sharedWithUsers.length > 0 ?
                                                                <>
                                                                    <label className="form-label">Users</label>
                                                                    <Table data={sharedWithUsers}>
                                                                        <Column width={200} align="left" fixed>
                                                                            <HeaderCell>Name</HeaderCell>
                                                                            <Cell dataKey="userName" />
                                                                        </Column>

                                                                        <Column width={200} align="center">
                                                                            <HeaderCell>Access</HeaderCell>
                                                                            <Cell className="sharedWith_select" style={{ padding: '5px' }}>
                                                                                {rowData => (
                                                                                    <SelectPicker
                                                                                        searchable={false}
                                                                                        data={[
                                                                                            { label: 'View', value: 'view' },
                                                                                            { label: 'Edit', value: 'edit' }
                                                                                        ]}
                                                                                        value={rowData.access}
                                                                                        defaultValue="view"
                                                                                        onChange={async (e) => await updateSharedWithUsers(e, rowData)}
                                                                                        cleanable={false}
                                                                                        style={{ width: 150 }}
                                                                                    />
                                                                                )}
                                                                            </Cell>
                                                                        </Column>

                                                                        <Column width={100} align="center">
                                                                            <HeaderCell>Action</HeaderCell>
                                                                            <Cell>
                                                                                {rowData => (
                                                                                    <span style={{ color: 'red', cursor: 'pointer' }}
                                                                                        onClick={async (e) => await deleteSharedWithUsers(e, rowData)}
                                                                                    >
                                                                                        <Icon name={'trash'} />
                                                                                    </span>
                                                                                )}
                                                                            </Cell>
                                                                        </Column>
                                                                    </Table>
                                                                </> :
                                                                // <div className="text-center">Not Shared With Any Users</div>
                                                                <></>
                                                            }


                                                            {sharedWithGroups.length > 0 ?
                                                                <>
                                                                    <label className="form-label mt-2">User Groups</label>
                                                                    <Table data={sharedWithGroups}>
                                                                        <Column width={200} align="left" fixed>
                                                                            <HeaderCell>Name</HeaderCell>
                                                                            <Cell dataKey="groupName" />
                                                                        </Column>

                                                                        <Column width={200} align="center">
                                                                            <HeaderCell>Access</HeaderCell>
                                                                            <Cell className="sharedWith_select" style={{ padding: '5px' }}>
                                                                                {rowData => (
                                                                                    <SelectPicker
                                                                                        searchable={false}
                                                                                        data={[
                                                                                            { label: 'View', value: 'view' },
                                                                                            { label: 'Edit', value: 'edit' }
                                                                                        ]}
                                                                                        value={rowData.access}
                                                                                        defaultValue="view"
                                                                                        onChange={async (e) => await updateSharedWithUserGroup(e, rowData)}
                                                                                        cleanable={false}
                                                                                        style={{ width: 150 }}
                                                                                    />
                                                                                )}
                                                                            </Cell>
                                                                        </Column>

                                                                        <Column width={100} align="center">
                                                                            <HeaderCell>Action</HeaderCell>
                                                                            <Cell>
                                                                                {rowData => (
                                                                                    <span style={{ color: 'red', cursor: 'pointer' }}
                                                                                        onClick={async (e) => await deleteSharedWithUserGroup(e, rowData)}
                                                                                    >
                                                                                        <Icon name={'trash'} />
                                                                                    </span>
                                                                                )}
                                                                            </Cell>
                                                                        </Column>
                                                                    </Table></> :
                                                                // <div className="text-center">Not Shared With Any Group</div>
                                                                <></>
                                                            }
                                                        </div>
                                                    </>
                                                }





                                                {/* <div className="usersBtn mt-4">
                                            <ul className="btn-toolbar g-4 align-center">
                                                <li>
                                                    <Button
                                                        type="button"
                                                        color="danger"
                                                        // onClick={() => setIsNodeClicked(null)}
                                                        onClick={delWorkflow}
                                                    >
                                                        Delete Workflow
                                                    </Button>
                                                </li>
                                                <li>
                                                    <Button
                                                        type="button"
                                                        color="primary"
                                                        onClick={handleClickedStepValue}
                                                    >
                                                        Update
                                                    </Button>
                                                </li>
                                            </ul>
                                        </div> */}

                                            </div>
                                        )}
                                    </Card>
                                </div>
                            }
                        </Col>
                    </Row>

                </Content>

                <Modal isOpen={inlineWorkflowModal} toggle={toggleInlineWorkflowModal} fullscreen>
                    <FullScreenModal
                        addNewWorflow={clickedAddNewWorkflow}
                        editWorkflow={clickedEditWorkflow}
                        viewWorkflows={clickedViewWorkflows}
                        toggle={toggleInlineWorkflowModal}
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
            </FilesBody>
        </FileManagerLayout>
    )
}

export default SetUpWorkflow