import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { DataTable, DataTableBody, DataTableHead, DataTableItem, DataTableRow, Icon, PaginationComponent, RegularTable, RSelect, TooltipComponent } from "../../../../components/Component";
import { Badge, Button, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, Spinner, Tooltip, UncontrolledDropdown } from "reactstrap";
import { useForm } from "react-hook-form";
import FileManagerLayout from "../components/Layout";
import FilesBody from "../components/Body";
import Head from "../../../../layout/head/Head";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { OverlayTrigger } from "react-bootstrap";
import toast from "react-hot-toast";
import * as API from '../../../../utils/API'
import { useParams } from "react-router";
import { updateLoaderFlag } from "../../../../redux/folderSlice";
import Comments from "../../../admin/Workflow/Support/comments/Comments";

const WorkflowVersionsTable = () => {

    const [sm, setSm] = useState(false)

    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);
    const [onSearchText, setOnSearchText] = useState("");

    const [modalDetail, setModalDetail] = useState(false);
    const [data, setData] = useState({});
    const [sideBarData, setSideBarData] = useState({
        history: null,
        comments: null
    })
    const [loader, setLoader] = useState(false)
    const [userData, setUserData] = useState([])

    const [activeTab, setActiveTab] = useState('Steps');

    const [comments, setComments] = useState([]);

    const store = useSelector(state => state.folders);
    const dispatch = useDispatch()

    var { fileType, fileId } = useParams()

    useEffect(() => {
        fetchVersionsData()
    }, [currentPage, itemPerPage])

    useEffect(() => {
        toast.remove();
        return () => {
            toast.remove();
        }
    }, [])

    const fetchVersionsData = async (
        search = ""
    ) => {

        let documentResponse = await API.getWorkflowVersionsList(currentPage, itemPerPage, search, fileType, fileId, localStorage.getItem('timeZone'))

        let { status, ...rem } = documentResponse
        if (status) {
            setData({ data: documentResponse['data'], ...rem })
            let arr = [];
            for (let elem of documentResponse['data']) {
                for (let val of elem.data?.stepsInfoHistory) {
                    for (let key in val.access) {
                        console.log(key, val.access[key])
                        for (let element in val.access[key]) {
                            if (element == 'users') {
                                val.access[key][element].forEach(value => {
                                    arr.push(value.userId);
                                })
                            }
                        }
                    }
                }
            }
            arr = [...new Set(arr)]
            console.log(arr);
            const usersListResponse = await API.getUsersDataFromArray(arr);
            if (!usersListResponse.status) {
                return toast.error(`Unable to get Publishers`);
            }
            setUserData(usersListResponse.data)
        }

    }

    const [columns, setColumns] = useState([
        {
            label: "Versions",
            name: "version",
            sort: true,
            show: true,
        },
        {
            label: "Workflow",
            name: "workflowName",
            sort: true,
            show: true,
        },
        {
            label: "Current Status",
            name: "currentStepStatus",
            sort: true,
            show: true,
        },
        {
            label: "Started At",
            name: "stepVersionStartedAt",
            sort: true,
            show: true,
        },
        {
            label: "Started By",
            name: "stepVersionStartedBy",
            sort: true,
            show: true,
        },
        {
            label: "Ended At",
            name: "stepVersionEndedAt",
            sort: true,
            show: true,
        },
        {
            label: "Ended By",
            name: "stepVersionEndedBy",
            sort: true,
            show: true,
        },
        {
            label: "Status",
            name: "stepVersionStatus",
            sort: true,
            show: true,
        }
    ])

    const [extraColumns, setExtraColumns] = useState([])




    const onSearch = (e) => {
        setOnSearchText(e.target.value)
        fetchVersionsData(e.target.value)
    }

    const handlePagination = (pageNumber) => setCurrentPage(pageNumber)

    const sortData = (columnName, sort) => {

        let defaultData = data['data']
        if (!sort) defaultData.sort((a, b) => a[`${columnName}`].toString().localeCompare(b[`${columnName}`].toString()))
        else defaultData.sort((a, b) => b[`${columnName}`].toString().localeCompare(a[`${columnName}`].toString()))
    }


    const toggleModalDetail = () => setModalDetail(!modalDetail)


    const handleTabClick = (tab) => {
        setActiveTab(tab);
    }


    const historyView = async (item) => {
        setModalDetail(true)


        var type = "file"
        if (item?.data?.fileId != undefined) {
            type = "file"
        }
        else {
            type = "form"
        }

        setLoader(true)
        // dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Activities...' }))
        let activitityRedposen = await API.getWorkflowActivities(item['data']['_id'], type)
        let { status, message, data } = activitityRedposen
        // dispatch(updateLoaderFlag({ loader: false, text: '' }))
        setLoader(false)

        if (!status)
            return toast.error(`Error while fetching Activites - ${message}`.replace(/\b\w/g, char => char.toUpperCase()))

        setSideBarData({
            historyId: data['historyId'],
            history: data['stepInfoView'],
            comments: data['commentView']
        })
        setComments(data['commentView'])
    }

    return (
        <FileManagerLayout>
            <Head title="Workflow Versions"></Head>
            <FilesBody>
                <h4> Workflow Versions</h4>

                <RegularTable
                    columns={columns}
                    extraColumns={extraColumns}
                    setColumns={setColumns}
                    setExtraColumns={setExtraColumns}
                    data={data}
                    itemPerPage={itemPerPage}
                    setItemPerPage={setItemPerPage}
                    setCurrentPage={setCurrentPage}
                    handlePagination={handlePagination}
                    onSearchText={onSearchText}
                    onSearchChange={onSearch}
                    privilege={{
                        editAccess: true,
                        deleteAccess: true
                    }}
                    onEditClick={(id) => { }}
                    suspendUser={historyView}
                    sortData={sortData}
                    filterComp={<></>}
                    op={'WorkflowVersions'}
                />


                <Offcanvas show={modalDetail} onHide={toggleModalDetail} placement="end" style={{ width: '45%', maxWidth: 'none' }} >
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
                                    </div>
                                </Container>
                            </div>
                        </div>

                        {loader ?
                            <div className="text-center" style={{ marginTop: '2rem' }}>
                                <Spinner color="primary" />
                            </div>
                            :
                            <>
                                {activeTab == 'Steps' ? (
                                    <>
                                        {sideBarData.history?.length > 0 ? (
                                            sideBarData.history.map((item, index) => (
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
                                                                            {/* &nbsp;and Closed at&nbsp; */}
                                                                            <Badge className="badge-dim" color="info">
                                                                                {item.endedAt}
                                                                            </Badge>
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
                                                                        <Badge className="badge-dim" color="warning">
                                                                            {item.endedBy || item.startedBy}
                                                                        </Badge>
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

                                        {/* Once Published */}
                                        {typeof data.data !== "undefined" && data?.data.length > 0 && data?.data[0]?.data?.currentStepInfo?.stepName == 'Publish' && <div key={'publish'} className="timeline d-flex" style={{ marginTop: '2rem' }}>
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
                                                                {`Shared with ${userData.map(obj => obj.userName).join(", ")}`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>}
                                    </>
                                ) : (
                                    <div>
                                        <Comments
                                            currentUserId={localStorage.getItem('userId')}
                                            data={comments}
                                            fileId={fileId}
                                            historyId={sideBarData['historyId']}
                                            type={fileType}
                                            stepId={`1`}  // No use of it
                                            setdata={async (data) => {
                                                // await handleComments(data)
                                                // setComments(data)
                                            }}
                                            op={"Viewer"}
                                        />
                                        {sideBarData.comments?.length > 0 ? (

                                            <></>

                                            // sideBarData.comments.map((comment, index) => (
                                            //     <div key={index} className="timeline d-flex" style={{ marginTop: '2rem' }}>
                                            //         <div className="timeline-item"></div>
                                            //         <div className="timeline-icon symbol symbol-circle symbol-40px me-4">
                                            //             <div className="symbol-label">
                                            //                 <i className="bi bi-chat-left-text"></i>
                                            //             </div>
                                            //         </div>
                                            //         <div className="timeline-content mb-10 mt-n1">
                                            //             <div className="d-flex align-items-center border border-dashed border-gray-300 rounded px-7 py-3">
                                            //                 <div className="symbol-group symbol-hover flex-nowrap flex-grow-1 min-w-100px pe-2 px-2">
                                            //                     <div className="symbol symbol-circle symbol-25px">
                                            //                         <span className="historycontent historyhighlights">
                                            //                             <Badge className="badge-dim" color="primary">Step {comment.stepId}</Badge>
                                            //                             &nbsp;Commented:&nbsp;
                                            //                             <Badge className="badge-dim" color="info">{comment.bodyText}</Badge>

                                            //                             {comment.fileText.length > 0 && (
                                            //                                 <span>
                                            //                                     &nbsp;and Files:&nbsp;
                                            //                                     {comment.fileText.map((file, fileIndex) => (
                                            //                                         <span
                                            //                                             key={fileIndex}
                                            //                                             onClick={(e) => handleFileClick(e, file, comment.historyId, comment.fileId)}
                                            //                                             style={{ cursor: 'pointer' }}
                                            //                                         >
                                            //                                             <Badge className="badge-dim" color="secondary">
                                            //                                                 {file.fileName}
                                            //                                             </Badge>
                                            //                                         </span>
                                            //                                     ))}
                                            //                                 </span>
                                            //                             )}

                                            //                             &nbsp;by&nbsp;
                                            //                             <Badge className="badge-dim" color="warning">
                                            //                                 {comment.userName}
                                            //                             </Badge>
                                            //                             &nbsp;at&nbsp;
                                            //                             <Badge className="badge-dim" color="success">
                                            //                                 {comment.commentedDate}
                                            //                             </Badge>
                                            //                         </span>
                                            //                     </div>
                                            //                 </div>
                                            //             </div>
                                            //         </div>
                                            //     </div>
                                            // )
                                        ) : (
                                            <div className="text-muted text-center" style={{ marginTop: '2rem' }}>
                                                No comments available
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        }


                    </Offcanvas.Body>
                </Offcanvas>

            </FilesBody>
        </FileManagerLayout>
    )
}

export default WorkflowVersionsTable