import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { BlockHead, BlockBetween, BlockHeadContent, BlockTitle, BlockDes, Button, Icon, RegularTable, WorkflowFilter } from "../../../components/Component";
import * as API from "../../../utils/API";
import Swal from "sweetalert2";
import FileManagerLayout from "../../app/file-manager/components/Layout";
import FilesBody from "../../app/file-manager/components/Body";
import toast from "react-hot-toast";
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import moment from "moment";
import { Spinner } from "reactstrap";
import { useDispatch } from "react-redux";
import { updateLoaderFlag } from "../../../redux/folderSlice";

const List = () => {

    const dispatch = useDispatch()

    const [sm, setSm] = useState(false)
    const navigate = useNavigate()
    const [data, setData] = useState({})
    const [workflowData, setWorkflowData] = useState([])
    const [onSearchText, setOnSearchText] = useState("");
    const [loader, setLoader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);
    const [sortOrder, setsortOrder] = useState(null)
    const [columns, setColumns] = useState([
        {
            label: "Workflow Name",
            name: "workflowName",
            sort: true,
            sortOrder: 0,
            show: true,
        },
        // {
        //     label: "Display Name",
        //     name: "workflowDisplayName",
        //     sort: true,
        //     show: true,
        // }
        {
            label: "Status",
            name: "isActive",
            sort: true,
            sortOrder: 0,
            show: true,
        },
        {
            label: "Created",
            name: "created",
            sort: true,
            sortOrder: 0,
            show: true,
        },
        {
            label: "Modified",
            name: "updated",
            sort: true,
            sortOrder: 0,
            show: true,
        }
    ])

    const [extraColumns, setExtraColumns] = useState([
        // {
        //     label: "Status",
        //     name: "isActive",
        //     checked: false
        // }
    ])
    const [filter, setFilter] = useState({
        workflow: [],
        status: null
    })


    useEffect(() => {
        fetchWorkflowNames()
    }, [])


    useEffect(() => {
        fetchData()
    }, [currentPage, itemPerPage, onSearchText, sortOrder, filter])

    useEffect(() => {
        toast.remove();
        return () => {
            toast.remove();
        }
    }, [])

    const fetchData = async (
        // search = "",
        // status = "",
        // workflow = []
        exportData = false
    ) => {
        // setLoader(true)
        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Workflow' }))

        var { workflow, status } = filter
        const statusvalue = status?.['value'] ?? ""

        let workflowResponse = await API.getWorkflowList(currentPage, itemPerPage, onSearchText, statusvalue, workflow, sortOrder, exportData)
        if (!exportData) {
            let { ...rem } = workflowResponse
            if (workflowResponse['status']) {
                setData({
                    data: workflowResponse['data'],
                    // .map(({ roleDetails, ...rest }) => ({
                    //     // id: _id,
                    //     // status: isActive ? 'Active' : 'Inactive',
                    //     role: roleDetails['role'],
                    //     ...rest,
                    // })),
                    ...rem
                })
                // setLoader(false)
            }
        }
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

    }

    const fetchWorkflowNames = async () => {
        let workflowResponse = await API.getAllWorkflows()
        if (workflowResponse['status']) {
            const workflowOptions = workflowResponse['data'].map((w, index) => ({
                value: w?._id,
                label: w?.workflowName
            }))
            setWorkflowData(workflowOptions)
        }
    }

    const Privilege = JSON?.parse(localStorage.getItem('privileges'));



    const handlePagination = (pageNumber) => setCurrentPage(pageNumber)

    const suspendWorkflow = (id) => {
        Swal.fire({
            title: "Are you sure you want to delete this workflow?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                let workflowResponse = await API.deleteWorkflow(id);
                if (workflowResponse['status']) {
                    Swal.fire("Deleted!", "Workflow has been deleted", "success");
                    fetchData()
                }
                else {
                    Swal.fire("Error", "Unble to Delete Workflow", "error");
                }
            }

        });
    }


    const sortData = (keycolumnName, sort) => {

        //keycolumnName - dbcol
        const mappings = {
            workflowName: "workflowName",
            isActive: "isActive",
            created: "createdAt",
            updated: "updatedAt"
        }

        var dbcol = mappings[keycolumnName]

        // setColumns(prevColumns =>
        //     prevColumns.map(column =>
        //         column.name === keycolumnName
        //             ? { ...column, sortOrder: column.sortOrder === 1 ? -1 : 1 }
        //             : column
        //     )
        // );

        setColumns(prevColumns =>
            prevColumns.map(column =>
                column.name === keycolumnName
                    ? { ...column, sortOrder: column.sortOrder === 1 ? -1 : 1 }
                    : { ...column, sortOrder: 0 }
            )
        );

        setsortOrder({ [dbcol]: sort ? 1 : -1 })
        setCurrentPage(1)


        // let defaultData = data['data']
        // if (!sort) defaultData.sort((a, b) => a[`${columnName}`].toString().localeCompare(b[`${columnName}`].toString()))
        // else defaultData.sort((a, b) => b[`${columnName}`].toString().localeCompare(a[`${columnName}`].toString()))
    }

    const onSearch = (e) => {
        setOnSearchText(e.target.value)
        setCurrentPage(1)
    }

    async function exportWorkflows() {
        // const excelInput = data.data.map(item => ({
        //     workflow: item.workflowName,
        //     status: item.isActive ? 'Active' : 'Inactive',
        //     addedDate: moment(item.createdAt).format('ll'),
        //     stepsNo: item.workflowSteps.length,
        //     steps: item.workflowSteps.map((workflow) => workflow.stepName).join(", "),
        // }));
        // const workbook = new ExcelJS.Workbook();
        // const usersSheet = workbook.addWorksheet('Workflows');
        // usersSheet.columns = [
        //     { header: 'Workflow', key: 'workflow', width: 15 },
        //     { header: 'Status', key: 'status', width: 20 },
        //     { header: 'No. of Steps', key: `stepsNo`, width: 30, alignment: { horizontal: 'center' } },
        //     { header: 'Steps', key: `steps`, width: 35 },
        //     { header: 'Added Date', key: `addedDate`, width: 35 },
        // ];
        // usersSheet.getRow(1).font = { bold: true };
        // usersSheet.addRows(excelInput);
        // workbook.xlsx.writeBuffer().then((buffer) => {
        //     saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Workflows.xlsx');
        // });
        fetchData(true);
    }

    return (
        <FileManagerLayout>
            <FilesBody>

                <BlockHead size="sm">
                    <BlockBetween>
                        <BlockHeadContent>
                            <BlockTitle tag="h3" page>
                                Workflow Templates
                            </BlockTitle>
                            <BlockDes className="text-soft">
                                <p>You have total {data['totalCount']} Workflow Template{data['totalCount'] != 1 && 's'}</p>
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
                                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                                    <ul className="nk-block-tools g-3">
                                        <li>
                                            <Button color="light" outline className="btn-white" onClick={() => exportWorkflows()}>
                                                <Icon name="download-cloud"></Icon>
                                                <span>Export</span>
                                            </Button>
                                        </li>
                                        {Privilege['workflow']['addWorkflow'] &&
                                            <li className="nk-block-tools-opt">
                                                <Button color="primary" className="btn-icon px-2"
                                                    onClick={() =>
                                                        navigate('/workflow/add')
                                                    }>
                                                    <Icon name="plus"></Icon>
                                                    Create Workflow
                                                </Button>
                                            </li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </BlockHeadContent>
                    </BlockBetween>
                </BlockHead>

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
                        editAccess: Privilege['workflow']['updateWorkflow'],
                        deleteAccess: Privilege['workflow']['deleteWorkflow']
                    }}
                    onEditClick={(id) => navigate(`/workflow/edit/${id}`)}
                    suspendUser={suspendWorkflow}
                    sortData={sortData}
                    filterComp={
                        <WorkflowFilter
                            onSearchText={onSearchText}
                            setFilter={setFilter}
                            filter={filter}
                            workflowData={workflowData}
                            setCurrentPage={setCurrentPage}
                        />
                    }
                />

            </FilesBody>
        </FileManagerLayout>
    )
}

export default List;
