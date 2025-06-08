import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { BlockHead, BlockBetween, BlockHeadContent, BlockTitle, BlockDes, Button, Icon, RegularTable, WorkflowFilter } from "../../../components/Component";
import * as API from "../../../utils/API";
import Swal from "sweetalert2";
import FileManagerLayout from "../../app/file-manager/components/Layout";
import FilesBody from "../../app/file-manager/components/Body";
import { Modal, Spinner } from "reactstrap";
import toast from "react-hot-toast";
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import moment from "moment";
import { useDispatch } from "react-redux";
import { updateLoaderFlag } from "../../../redux/folderSlice";


const List = () => {


    const [sm, setSm] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [data, setData] = useState({})
    const [loader, setLoader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);
    const [onSearchText, setOnSearchText] = useState("");
    const [sortOrder, setsortOrder] = useState(null)

    const [columns, setColumns] = useState([
        {
            label: "Name",
            name: "name",
            sort: true,
            sortOrder:0,
            show: true,
        },
        {
            label: "Type",
            name: "type",
            sort: true,
            sortOrder:0,
            show: true,
        },
        {
            label: "Status",
            name: "isActive",
            sort: true,
            sortOrder:0,
            show: true,
        },
        {
            label: "Created",
            name: "created",
            sort: true,
            sortOrder:0,
            show: true,
        },
        {
            label: "Modified",
            name: "updated",
            sort: true,
            sortOrder:0,
            show: true,
        }
    ])
    const [extraColumns, setExtraColumns] = useState([])


    const Privilege = JSON?.parse(localStorage.getItem('privileges'));

    const [askModal, setAskModal] = useState(false)
    // const [selectedFormType, setSelectedFormType] = useState(null)
    const [selectedFormType, setSelectedFormType] = useState('step')

    useEffect(() => {
        fetchFormBuilders()
    }, [currentPage, itemPerPage, onSearchText, sortOrder])


    const fetchFormBuilders = async (
        // search = ""
        exportData = false
    ) => {
        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Form Template' }))
        let formBuilderResponse = await API.getFormBuilderList(currentPage, itemPerPage, onSearchText, sortOrder, exportData)
        if(!exportData){
            let { status, ...rem } = formBuilderResponse
            if (status) {
                setData({ data: formBuilderResponse['data'], ...rem })
            }
        }
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }

    const onSearch = (e) => {
        setOnSearchText(e.target.value)
        setCurrentPage(1)
    }

    const handlePagination = (pageNumber) => setCurrentPage(pageNumber)

    const sortData = (keycolumnName, sort) => {


        //keycolumnName - dbcol
        const mappings = {
            name: "name",
            type: "type",
            isActive: "isActive",
            created: "createdAt",
            updated: "updatedAt"
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


        // let defaultData = data['data']
        // if (!sort) defaultData.sort((a, b) => a[`${columnName}`].toString().localeCompare(b[`${columnName}`].toString()))
        // else defaultData.sort((a, b) => b[`${columnName}`].toString().localeCompare(a[`${columnName}`].toString()))
    }


    const suspendFormBuilder = async (id) => {

        Swal.fire({
            title: "Do you want to delete this Form Template?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
                let userResponse = await API.deleteFormBuilder(id);
                dispatch(updateLoaderFlag({ loader: false, text: '' }))

                if (userResponse['status']) {
                    Swal.fire("Deleted!", "Form Builder has been Deleted", "success");
                    fetchFormBuilders()
                }
                else {
                    Swal.fire("Error", "Unable to Delete Form Builder", "error");
                }
            }

        });

    }

    const toggleAskModal = () => {
        setAskModal(!askModal)
    }

    const handleCheckboxChange = (type) => {
        setSelectedFormType(type == selectedFormType ? null : type)
    }


    const handleAskModalSubmit = (e) => {
        e.preventDefault()
        if (!selectedFormType) {
            toast.error('Choose Form Type')
            return
        }
        selectedFormType == 'single' ?
            navigate('/formBuild/add')
            :
            navigate('/formBuild/step/add')
    }

    async function exportForms() {
        // const excelInput = data.data.map(item => ({
        //     formName: item.name,
        //     status: item.isActive ? 'Active' : 'Inactive',
        //     addedDate: moment(item.createdAt).format('ll'),
        //     type: item.type == 'step' ? 'Step Form' : 'Single Step Form',
        //     stepNo: item.type == 'step' ? Object.keys(item.data[0]).length : 1
        // }));
        // const workbook = new ExcelJS.Workbook();
        // const usersSheet = workbook.addWorksheet('Forms');
        // usersSheet.columns = [
        //     { header: 'Form', key: 'formName', width: 15 },
        //     { header: 'Form Tpe', key: 'type', width: 20 },
        //     { header: 'Step Count', key: `stepNo`, width: 20, alignment: { horizontal: 'center' } },
        //     { header: 'Status', key: 'status', width: 20 },
        //     { header: 'Added Date', key: `addedDate`, width: 35 },
        // ];
        // usersSheet.getRow(1).font = { bold: true };
        // usersSheet.addRows(excelInput);
        // workbook.xlsx.writeBuffer().then((buffer) => {
        //     saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Forms.xlsx');
        // });
        fetchFormBuilders(true);
    }

    return (
        <FileManagerLayout>
            <FilesBody>

                <BlockHead size="sm">
                    <BlockBetween>
                        <BlockHeadContent>
                            <BlockTitle tag="h3" page>
                                Form Template{data['totalCount'] != 1 && 's'}
                            </BlockTitle>
                            <BlockDes className="text-soft">
                                <p>You have total {data['totalCount']} template{data['totalCount'] != 1 && 's'}</p>
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
                                            <Button color="light" outline className="btn-white" onClick={() => exportForms()}>
                                                <Icon name="download-cloud"></Icon>
                                                <span>Export</span>
                                            </Button>
                                        </li>
                                        {Privilege["workflow"]["addWorkflow"] &&
                                            <li className="nk-block-tools-opt">
                                                <Button color="primary"
                                                    onClick={() =>
                                                        // setAskModal(true)
                                                        navigate('/formBuild/step/add')
                                                    }>
                                                    <Icon name="plus"></Icon>
                                                    <span>Create Form Template</span>
                                                </Button>
                                            </li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </BlockHeadContent>
                    </BlockBetween>
                </BlockHead>

                {loader ? <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Spinner size="sm" />
                </div> : <RegularTable
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
                    onEditClick={(id, item) => {
                        item['type'] == 'single' ? navigate(`/formBuild/edit/${id}/${item['name']}`) :
                            navigate(`/formBuild/step/edit/${id}/${item['name']}`)
                    }}
                    suspendUser={suspendFormBuilder}
                    sortData={sortData}
                    filterComp={<></>}
                />}

            </FilesBody>
            {/* <Modal isOpen={askModal} size="md" toggle={toggleAskModal}>
                <>
                    <a
                        href="#close"
                        onClick={(ev) => {
                            ev.preventDefault();
                            toggleAskModal();
                        }}
                        className="close"
                    >
                        <Icon name="cross-sm"></Icon>
                    </a>
                    <div className="modal-body modal-body-md">
                        <div className="nk-upload-form mb-0">
                            <h5 className="title mb-3">Choose Form Type</h5>

                            <ul className="custom-control-group d-flex justify-content-center">
                                <li>
                                    <div className="custom-control custom-control-sm custom-checkbox custom-control-pro checked">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            name="btnCheckControl"
                                            id="btnCheckControl1"
                                            checked={selectedFormType === "single"}
                                            onChange={() => handleCheckboxChange("single")}
                                        />
                                        <label className="custom-control-label" htmlFor="btnCheckControl1">
                                            Single Form
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
                                            checked={selectedFormType === "step"}
                                            onChange={() => handleCheckboxChange("step")}
                                        />
                                        <label className="custom-control-label" htmlFor="btnCheckControl2">
                                            Step Form
                                        </label>
                                    </div>
                                </li>
                            </ul>

                            <ul className="btn-toolbar g-4 align-center justify-end">
                                <li>
                                    <button
                                        type="button"
                                        className="link link-primary"
                                        onClick={(ev) => {
                                            ev.preventDefault()
                                            toggleAskModal()
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </li>
                                <li>
                                    <Button color="primary" type="submit" onClick={handleAskModalSubmit}
                                    >
                                        Start
                                    </Button>
                                </li>
                            </ul>


                        </div>
                    </div>
                </>
            </Modal> */}
        </FileManagerLayout>
    )
}

export default List;