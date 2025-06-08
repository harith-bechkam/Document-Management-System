import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { BlockHead, BlockBetween, BlockHeadContent, BlockTitle, BlockDes, Button, Icon, RegularTable, WorkflowFilter } from "../../../../components/Component";
import * as API from "../../../../utils/API";
import Swal from "sweetalert2";
import FileManagerLayout from "../../../app/file-manager/components/Layout";
import FilesBody from "../../../app/file-manager/components/Body";
import toast from "react-hot-toast";
import { updateLoaderFlag } from "../../../../redux/folderSlice";
import { useDispatch } from "react-redux";
import { Badge, Container, Spinner, Tooltip } from "reactstrap";
import Comments from "../Support/comments/Comments";
import { Offcanvas } from "react-bootstrap"
import moment from "moment";
import { setDownloadFileAction } from "../../../../redux/download/downloadAction";

const OwnerHistory = () => {

    const [sm, setSm] = useState(false)
    const navigate = useNavigate()
    const [data, setData] = useState({})
    const [onSearchText, setOnSearchText] = useState("");
    const dispatch = useDispatch()

    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);
    const [backUptooltipOpen, setBackUptooltipOpen] = useState({})
    let isformpresent = useRef(false)
    const [sortOrder, setsortOrder] = useState(null)


    useEffect(() => {
        fetchData()
    }, [currentPage, itemPerPage, onSearchText, sortOrder])

    useEffect(() => {
        toast.remove();
        return () => {
            toast.remove();
        }
    }, [])

    const fetchData = async (
        // search = "",
        // status = "",
    ) => {

        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let workflowResponse = await API.OwnerHistory(currentPage, itemPerPage, onSearchText, sortOrder)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        let { ...rem } = workflowResponse
        if (workflowResponse['status']) {
            setData({ data: workflowResponse['data'], ...rem })
        }

    }

    const Privilege = JSON?.parse(localStorage.getItem('privileges'));


    const [columns, setColumns] = useState([
        {
            label: "Document", //Document name \n type \n 
            name: "workflow_myownstep_document",
            sort: true,
            show: true,
            sortOrder: 0,
            clickable:true
        },
        // {
        //     label: "Owner",//owner
        //     name: "workflow_myownstep_owner",
        //     sort: false,
        //     show: false,
        //     sortOrder: 0
        // },
        {
            label: "Requested",//workflow_start_time
            name: "workflow_myownstep_workflow_start_time",
            sort: true,
            show: true,
            sortOrder: 0
        },

        {
            label: "Current Step",// step name, step status
            name: "workflow_myownstep_current_step_name",
            sort: true,
            show: true,
            sortOrder: 0
        },
        {
            label: "Due Date", // step start data, step end date
            name: "workflow_myownstep_due_date",
            sort: false,
            show: true,
            sortOrder: 0
        },
        {
            label: "Last Updated", // updated at, updated by
            name: "workflow_myownstep_updatedAt",
            sort: true,
            show: true,
            sortOrder: 0
        },
        // {
        //     label: "Last Action By",
        //     name: "workflow_myownstep_latest_approver",
        //     sort: false,
        //     show: true,
        //     sortOrder: 0
        // },
        {
            label: "Final Status",
            name: "workflow_myownstep_isWorkflowCompletedStatus",
            sort: true,
            show: true,
            sortOrder: 0
        },
        {
            label: "Approval Progress",
            name: "workflow_myownstep_progress",
            sort: false,
            show: true,
            sortOrder: 0
        },
        // {
        //     label: "Comments",
        //     name: "workflow_myownstep_comments",
        //     sort: false,
        //     show: true,
        //     sortOrder: 0
        // },
        {
            label: "Actions",
            name: "workflow_myownstep_actions",
            sort: false,
            show: true,
            sortOrder: 0
        },


    ])
    const [loader, setLoader] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalData, setModalData] = useState({
        history: null,
        comments: null,
        backup: null,
    })
    const [comments, setComments] = useState([]);
    const [activeTab, setActiveTab] = useState('Steps');

    const [fileid, setfileid] = useState('')
    const [workflowHistoryId, setworkflowHistoryId] = useState('')
    const [type, settype] = useState('')


    const toggleModal = () => setModalOpen(!modalOpen)
    const handleTabClick = (tab) => {
        setActiveTab(tab)
    }

    const [extraColumns, setExtraColumns] = useState([
        // {
        //     label: "Status",
        //     name: "isActive",
        //     checked: false
        // }
    ])

    const [filter, setFilter] = useState({
        // workflow: null,
        // status: null
    })

    const toggleTooltip = (id) => {
        setBackUptooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const handlePagination = (pageNumber) => setCurrentPage(pageNumber)

    const onSearch = (e) => {
        setOnSearchText(e.target.value)
        setCurrentPage(1)
    }

    const sortData = (keycolumnName, sort) => {

        const mappings = {
            workflow_myownstep_document: 'docName',//1
            workflow_myownstep_workflow_start_time: 'workflow_start_time',//2
            workflow_myownstep_current_step_name: 'current_step.name',//3
            // workflow_myownstep_due_date: 'current_step.startDate',
            workflow_myownstep_updatedAt: 'updatedAt', //5
            workflow_myownstep_isWorkflowCompletedStatus: 'WorkflowEndTime'//6
        }

        var dbcol = mappings[keycolumnName]

        setColumns(prevColumns =>
            prevColumns.map(column =>
                column.name === keycolumnName
                    ? { ...column, sortOrder: column.sortOrder === 1 ? -1 : 1 }
                    : { ...column, sortOrder: 0 }
            )
        );
        setsortOrder({ [dbcol]: sort ? 1 : -1 })
        setCurrentPage(1)
    }





    const historyView = async (item) => {

        if (item.type == 'Form') {
            isformpresent.current = true
        }
        else {
            isformpresent.current = false
        }
        setModalOpen(true)

        setfileid(item['file_id'])
        setworkflowHistoryId(item['workflowHistoryId'])
        settype(item['type'])

        setLoader(true)
        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Activities' }))
        let activitityRedposen = await API.getWorkflowActivities(item['workflowHistoryId'], item['type'])
        let { status, message, data } = activitityRedposen
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        setLoader(false)

        if (!status)
            return toast.error(`Error While Fetching Activites - ${message}`.replace(/\b\w/g, char => char.toUpperCase()))

        setModalData({
            historyid: data['historyId'],
            docid: data['docId'],
            docname: data['docName'],
            type: data['type'],
            ext: data['ext'],

            history: data['stepInfoView'],
            comments: data['commentView'],
            backup: data['type'] == 'File' ? data['BackUps'] : []
        })

        await fetchComments(data['type'], data['historyId'])
    }

    const fetchComments = async (type, workflowHistoryId) => {

        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Comments' }))
        let commentsResponse = await API.getWorkflowComments(type, workflowHistoryId, false)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        var { status, message, data } = commentsResponse

        if (!status) {
            toast.error(message?.replace(/\b\w/g, char => char.toUpperCase()))
            return
        }
        setComments(data?.comments || [])
    }

    const downloadDoc = async (e, item) => {
        e.preventDefault();
        e.stopPropagation();


        dispatch(updateLoaderFlag({ loader: true, text: 'Downloading' }))

        var id = `workflowbackupdownload#${modalData['historyid']}#${modalData['docid']}#${item['currentRevisionNumber']}#${item['ext']}#${item['fileName']}`
        await API.readBackupFile(id);
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        // dispatch(setDownloadFileAction([{ file: modalData['docid'], folder: [], fileName: modalData['docname'], extension: modalData['ext'], APIType: 'fileDownloadAPI', type: "single" }]))
        // await API.downloadedFile(item._source["id"], item._source["name"].split('.')[0], '', item._source.fileType)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }


    return (
        <FileManagerLayout>
            <FilesBody>
                <BlockHead size="sm">
                    <BlockBetween>
                        <BlockHeadContent>
                            <BlockTitle tag="h3" page>
                                My Submitted Documents
                            </BlockTitle>
                            <BlockDes className="text-soft">
                                <p>You have total {data['totalCount']} Submitted Document{data['totalCount'] != 1 && 's'}</p>
                            </BlockDes>
                        </BlockHeadContent>
                        <BlockHeadContent>
                            <div className="toggle-wrap nk-block-tools-toggle">
                                <Button
                                    className={`btn-icon btn-trigger toggle-expand me-n1 ${sm ? "active" : ""}`}
                                    onClick={() => setSm(!sm)}
                                >
                                    <Icon name="menu-alt-r"></Icon>
                                </Button>
                                {/* <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                                    <ul className="nk-block-tools g-3">
                                        <li>
                                            <Button color="light" outline className="btn-white">
                                                <Icon name="download-cloud"></Icon>
                                                <span>Export</span>
                                            </Button>
                                        </li>
                                        {Privilege['workflow']['addWorkflow'] &&
                                            <li className="nk-block-tools-opt">
                                                <Button color="primary" className="btn-icon"
                                                    onClick={() =>
                                                        navigate('/workflow/add')
                                                    }>
                                                    <Icon name="plus"></Icon>
                                                </Button>
                                            </li>
                                        }
                                    </ul>
                                </div> */}
                            </div>
                        </BlockHeadContent>
                    </BlockBetween>
                </BlockHead>

                <RegularTable
                    columns={columns}
                    extraColumns={[]}
                    setColumns={setColumns}
                    setExtraColumns={[]}
                    data={data}
                    itemPerPage={itemPerPage}
                    setItemPerPage={setItemPerPage}
                    setCurrentPage={setCurrentPage}
                    handlePagination={handlePagination}
                    onSearchText={onSearchText}
                    onSearchChange={onSearch}
                    privilege={{}}
                    onEditClick={{}}
                    onEyeClick={(item) => historyView(item)}
                    // onRowClick={(fileType, fileId, role, hisId) => navigate(`/workflow/detail/${fileType}/${fileId}/${hisId}`)}
                    suspendUser={""}
                    sortData={sortData}
                    filterComp={<></>}
                    op={"workflowMyStepOnwardsHistory"}
                />



                <Offcanvas show={modalOpen} onHide={toggleModal} placement="end" style={{ width: '45%', maxWidth: 'none' }}>
                    <Offcanvas.Header closeButton className="border-bottom">
                        <Offcanvas.Title>
                            <h5 className="card-title fw-bolder text-dark">
                                History & Comments &nbsp;
                            </h5>
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>

                        <div className="select-history-view" style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                            <div className="form-check form-switch">
                                <Container style={{ display: 'flex' }}>
                                    <div className="mask-box">
                                        <div
                                            className="mask"
                                            style={{
                                                transform: `translateX(${activeTab == 'Steps' ? 0 : '150px'})`,
                                            }}
                                        />
                                        <Button
                                            variant="outline-primary"
                                            style={{
                                                color: activeTab == 'Steps' ? '#ffffff' : '#ffffff',
                                                background: activeTab == 'Steps' ? '#6576ff' : 'transparent',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                            }}
                                            onClick={() => handleTabClick('Steps')}
                                        >
                                            Steps Activites
                                        </Button>
                                        <Button
                                            variant="outline-primary"
                                            style={{
                                                color: activeTab == 'Comments' ? '#ffffff' : '#ffffff',
                                                background: activeTab == 'Comments' ? '#6576ff' : 'transparent',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                            }}
                                            onClick={() => handleTabClick('Comments')}
                                        >
                                            Comments
                                        </Button>
                                        {!isformpresent.current &&
                                            <Button
                                                variant="outline-primary"
                                                style={{
                                                    color: activeTab == 'BackUp' ? '#ffffff' : '#ffffff',
                                                    background: activeTab == 'BackUp' ? '#6576ff' : 'transparent',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                }}
                                                onClick={() => handleTabClick('BackUp')}
                                            >
                                                BackUp
                                            </Button>
                                        }
                                    </div>
                                </Container>
                            </div>
                        </div>


                        {loader ? (
                            <div className="text-center" style={{ marginTop: '2rem' }}>
                                <Spinner color="primary" />
                            </div>
                        ) : (
                            <>
                                {activeTab === 'Steps' ? (
                                    <>
                                        {modalData.history?.length > 0 ? (
                                            modalData.history.map((item, index) => (
                                                <div key={index} className="timeline d-flex" style={{ marginTop: '2rem' }}>
                                                    <div className="timeline-item"></div>
                                                    <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
                                                        <div className="symbol-label">
                                                            <i className="bi bi-chat-left-text"></i>
                                                        </div>
                                                    </div>
                                                    <div className="timeline-content mb-10 mt-n1">
                                                        <div className="d-flex align-items-center border border-dashed border-gray-300 rounded px-7 py-3">
                                                            <div className="symbol-group symbol-hover flex-nowrap flex-grow-1 min-w-100px pe-2 px-2">
                                                                <div className="symbol symbol-circle symbol-25px">
                                                                    <span className="historycontent historyhighlights">
                                                                        <Badge className="badge-dim" color="primary">{item.stepName}</Badge>
                                                                        {(() => {
                                                                            if (item.status == 'Cancelled') {
                                                                                return <>&nbsp;Cancelled at&nbsp;</>
                                                                            }
                                                                            if (item.status == 'YTS') {
                                                                                return <>&nbsp;Initiated at&nbsp;</>
                                                                            } if (item.endedAt) {
                                                                                return <>&nbsp;Concluded at&nbsp;</>
                                                                            } else {
                                                                                return <>&nbsp;Started at&nbsp;</>
                                                                            }
                                                                        })()}
                                                                        {item.endedAt ? '' : <>
                                                                            <Badge className="badge-dim" color="info">{item.startedAt}</Badge>
                                                                        </>}
                                                                        {item.endedAt ? <>
                                                                            <Badge className="badge-dim" color="info">{item.endedAt}</Badge>
                                                                        </> : ''}
                                                                        {item.status != 'Cancelled' &&
                                                                            <>
                                                                                {(() => {
                                                                                    if (item.status == 'Rejected') {
                                                                                        return <>&nbsp;as&nbsp;
                                                                                            <Badge className="badge-dim" color={"danger"}>
                                                                                                {item.status}
                                                                                            </Badge>
                                                                                        </>
                                                                                    } else if (item.endedAt) {
                                                                                        return <>&nbsp;as&nbsp;
                                                                                            <Badge className="badge-dim" color={"success"}>
                                                                                                {'Approved'}
                                                                                            </Badge>
                                                                                        </>
                                                                                    }
                                                                                })()}
                                                                            </>
                                                                        }
                                                                        &nbsp;By&nbsp;
                                                                        <Badge className="badge-dim" color="warning">{item.endedBy || item.startedBy}</Badge>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-muted text-center" style={{ marginTop: '2rem' }}>
                                                No Steps found
                                            </div>
                                        )}
                                    </>
                                ) :
                                    activeTab === 'BackUp' ? (
                                        <div className="" style={{ marginTop: '2rem' }}>
                                            {modalData.backup?.length > 0 ? (
                                                modalData.backup.map((backup, index) => (
                                                    <div key={index} className="mb-2">
                                                        <div className="d-flex mb-2">
                                                            <Badge className="badge-dim" color="primary">{backup.stepName}</Badge>
                                                        </div>
                                                        {backup['storageInfo']?.map((bs, idx) => {
                                                            const tooltipId = `backup_${bs['tooltipId'] || idx}`
                                                            return (
                                                                <>

                                                                    <div key={idx} className="timeline d-flex" style={{ marginTop: '2rem' }}>
                                                                        <div className="timeline-item"></div>
                                                                        <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
                                                                            <div className="symbol-label">
                                                                                <i className="bi bi-chat-left-text"></i>
                                                                            </div>
                                                                        </div>
                                                                        <div className="timeline-content mb-10 mt-n1">
                                                                            <div className="d-flex align-items-center border border-dashed border-gray-300 rounded px-7 py-3">
                                                                                <div className="symbol-group symbol-hover flex-nowrap flex-grow-1 min-w-100px pe-2 px-2">
                                                                                    <div className="symbol symbol-circle symbol-25px">
                                                                                        <span className="historycontent historyhighlights">
                                                                                            <Badge className="badge-dim" color="primary">{bs['fileName']}</Badge>
                                                                                            &nbsp;was created on&nbsp;
                                                                                            <Badge className="badge-dim" color="info">{moment(Date(bs.createdAt)).format('ll')}</Badge>
                                                                                            &nbsp;at&nbsp;
                                                                                            <Badge className="badge-dim" color="info">{bs.createdAt?.slice(10)}</Badge>
                                                                                            &nbsp;by&nbsp;
                                                                                            <Badge className="badge-dim" color="warning">{bs.createdBy}</Badge>
                                                                                            &nbsp;<span
                                                                                                id={tooltipId}
                                                                                                style={{ cursor: "pointer" }}
                                                                                                onClick={(e) => downloadDoc(e, bs)}
                                                                                            >
                                                                                                <Icon name="download" />
                                                                                            </span>
                                                                                            <Tooltip
                                                                                                placement="right"
                                                                                                isOpen={backUptooltipOpen[tooltipId] || false}
                                                                                                target={tooltipId}
                                                                                                toggle={() => toggleTooltip(tooltipId)}
                                                                                            >
                                                                                                {bs['fileName']}
                                                                                            </Tooltip>
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            );
                                                        })}
                                                    </div>
                                                ))
                                            ) : (
                                                <center><div className="text-muted">No Backup History is Available</div></center>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            {modalData.comments?.length > 0 ? (

                                                <Comments
                                                    currentUserId={localStorage.getItem('userId')}
                                                    data={comments}
                                                    fileId={fileid}
                                                    historyId={workflowHistoryId}
                                                    type={type}
                                                    stepId={''} // No use of it
                                                    setdata={async (data) => {
                                                        // await handleComments(data)
                                                        // setComments(data)
                                                    }}
                                                    op={"Viewer"}
                                                />

                                            ) : (
                                                <div className="text-muted text-center" style={{ marginTop: '2rem' }}>
                                                    No comments available
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </>
                        )}



                    </Offcanvas.Body>
                </Offcanvas>



            </FilesBody>
        </FileManagerLayout>

    )
}

export default OwnerHistory
