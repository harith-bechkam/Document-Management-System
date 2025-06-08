import { DebounceInput } from "react-debounce-input";
import { Badge, Button, Modal } from "reactstrap";
import { useNavigate } from 'react-router-dom';
import CreateSteps from "./Modals/CreateSteps";
import { useEffect, useRef, useState } from "react";
import * as API from '../../../utils/API';
import toast from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";
import { updateLoaderFlag } from "../../../redux/folderSlice";
import { useDispatch } from "react-redux";
import { Icon } from "../../../components/Component";
import Swal from "sweetalert2";

const Sidebar = ({ toggle, nodes, settingNodes, setIsStepCreatedOrUpdated }) => {

    const [search, setSearch] = useState("");
    const [stepmodalshow, setstepmodalshow] = useState(false);
    // const navigate = useNavigate()
    // const dispatch = useDispatch();

    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [allsteps, setallsteps] = useState([]);
    const [editData, setEditData] = useState(null)
    const [updateFlag, setUpdateFlag] = useState(false);

    let op = useRef('Create')

    useEffect(() => {
        fetchSteps()
    }, [updateFlag])

    const fetchSteps = async (stepName = '') => {
        let stepsResponse = await API.getStepsList(
            { stepName }, page
        )
        var { status } = stepsResponse
        if (status) {
            var { data } = stepsResponse
            setallsteps(data)
        }
    }

    const saveSteps = async (data) => {
        let { process_name } = data
        let stepResponse

        if (op.current == 'Create') {
            stepResponse = await API.createStep(process_name)
        }

        if (op.current == "Edit") {
            stepResponse = await API.updateStep(editData['_id'], process_name)
        }

        var { status } = stepResponse
        if (status) {
            setPage(1);
            toast.success(`${stepResponse['data']['stepName']} ${op.current == 'Create' ? 'created' : 'updated'} successfully`)
            setIsStepCreatedOrUpdated(true)
            let stepsResponse = await API.getStepsList(
                { stepName: "" }, 1
            )
            var { status } = stepsResponse
            if (status) {
                var { data } = stepsResponse
                setallsteps(data)
            }
        }
        else toast.error(`${stepResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
    }


    const stepShow = () => {
        op.current = "Create"
        setstepmodalshow(true)
        setEditData(null)
    }


    const fetchMoreData = async () => {
        const nextPage = page + 1
        setPage(nextPage)

        let stepsResponse = await API.getStepsList({ stepName: "" }, nextPage)
        const { status, data, totalCount } = stepsResponse

        if (status) {
            if (data.length !== 0) {
                setallsteps([...allsteps, ...data])
            }

            const totalFetched = nextPage * 10
            if (totalFetched >= totalCount) {
                setHasMore(false)
            }
        }
    }

    const onDragStart = (event, nodedata, nodeType, nodeid) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
        settingNodes(event, nodedata, nodeType, nodeid, allsteps)
    };


    const stepEditClick = (e, data) => {
        e.preventDefault();
        setEditData(data)
        op.current = "Edit"
        setstepmodalshow(true)

    }

    async function deleteStep(e,data){
        Swal.fire({
            title: `Are you sure you want to delete the step ${data.stepName}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
          }).then(async (result) => {
            if (result.isConfirmed) {
              const deleteRespo = await API.deleteStep(data._id)
              if(!deleteRespo.status){                
                return toast.error(`Could not delete ${data.stepName}`);
              }
              toast.success(`Step ${data.stepName} deleted`)
              setUpdateFlag(prev=>!prev)
            }
          });
    }

    return (
        <>
            {!toggle ? (
                <aside
                    className="position-relative border-none workflow-steps"
                    style={{ width: 500, height: "100%" }}
                >
                    <form className="position-relative">
                        <span className="svg-icon svg-icon-2 svg-icon-lg-1 svg-icon-gray-500 position-absolute top-50 p-3 translate-middle-y">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="mh-50px"
                            >
                                <rect
                                    opacity="0.5"
                                    x="17.0365"
                                    y="15.1223"
                                    width="8.15546"
                                    height="2"
                                    rx="1"
                                    transform="rotate(45 17.0365 15.1223)"
                                    fill="currentColor"
                                ></rect>
                                <path
                                    d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z"
                                    fill="currentColor"
                                ></path>
                            </svg>
                        </span>
                        <DebounceInput
                            className="form-control-search py-2 px-5 my-4 form-search-layout workflow-step-search"
                            placeholder="Search"
                            minLength={2}
                            onChange={(e) => {
                                setSearch(e?.target?.value);
                                allsteps.splice(0, allsteps.length);
                                setPage(1);
                                fetchSteps(e?.target?.value)
                            }}
                        />
                    </form>

                    {allsteps?.length ? (
                        <InfiniteScroll
                            className="border rounded workflowInfiniteScrollBar"
                            dataLength={allsteps?.length}
                            hasMore={hasMore}
                            next={fetchMoreData}
                            height={'60vh'}
                            endMessage={
                                <center>
                                    <b>Yay! You have seen all Steps</b>
                                </center>
                            }
                        >
                            {allsteps?.length ? (
                                <div className="p-4 d-flex justify-content-between row ">
                                    {allsteps
                                        ?.filter((item) => {
                                            return item !== undefined && item !== null && item !== "";
                                        })
                                        .map((m, index) => (
                                            <div
                                                className="dndnode text-black rounded d-flex justify-content-center align-items-center text-center mt-2 pt-4 pb-4 pl-2 pr-3"
                                                id={m?._id}
                                                key={m?._id}
                                                onDragStart={(event) =>
                                                    onDragStart(
                                                        event,
                                                        m,
                                                        m.stepName,
                                                        m._id,
                                                        // m.isError,
                                                        // m.isLastProcess
                                                    )
                                                }
                                                draggable={nodes.length < 1}
                                            >
                                                <h6 className="mt-1 w-100 text-center" style={{ fontSize: "medium" }}>
                                                    {m.stepName}
                                                </h6>

                                                {/* {m.isErrorStep && (
                                                    <Badge pill color={"danger"} style={{ transform: "translate(-50%,-80%)" }}>E</Badge>
                                                )} */}
                                                {m.stepName == 'Publish' ? (
                                                    <Badge pill color="warning" style={{ transform: "translate(-50%,-80%)" }}>L</Badge>
                                                )
                                                    : (
                                                        <>
                                                            <Icon name="edit" className="stepEditIcon" onClick={(e) => stepEditClick(e, m)}></Icon>
                                                            <Icon name="trash" className="stepDeleteIcon" onClick={(e) => deleteStep(e, m)}></Icon>
                                                        </>
                                                    )}
                                            </div>

                                        ))}
                                </div>
                            ) : (
                                <div className="p-4 d-flex justify-content-between row card border">
                                    <h6>No Steps Found</h6>
                                </div>
                            )}
                        </InfiniteScroll>
                    ) : (
                        <div className="p-4 text-center d-flex justify-content-center ">
                            <h6>No Steps Found</h6>
                        </div>
                    )}

                    <div className="text-center">
                        <div className="text-center add-workflow-step">
                            <Button
                                color="primary"
                                className="mt-3 rounded"
                                onClick={stepShow}
                            >
                                Add Step
                            </Button>
                        </div>
                    </div>

                </aside>
            ) : (<></>)}

            <Modal isOpen={stepmodalshow} size="md" toggle={() => setstepmodalshow(false)}>
                <CreateSteps
                    op={op.current}
                    editData={editData}
                    close={() => setstepmodalshow(false)}
                    handleCreateSteps={saveSteps}
                />
            </Modal>
        </>
    )
}

export default Sidebar;