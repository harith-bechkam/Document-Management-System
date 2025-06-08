import React, { useState, useEffect } from "react";
import Head from "../../../layout/head/Head";
import FileManagerLayout from "../../app/file-manager/components/Layout";
import FilesBody from "../../app/file-manager/components/Body";
import { Button, Icon, BlockHead, BlockBetween, BlockHeadContent, BlockTitle, BlockDes, RegularTable, Filter1 } from "../../../components/Component";
import { Modal, Spinner } from "reactstrap";
import CustomMetaData from "./Modals/CustomMetaData";
import * as API from '../../../utils/API';
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import moment from "moment";
import { updateLoaderFlag } from "../../../redux/folderSlice";
import { useDispatch } from "react-redux";
import MetadataFilter from "../../../components/Filter/metadataFilter";

const List = () => {
    const dispatch = useDispatch()

    const [sm, setSm] = useState(false)

    const [customMetaModal, setCustomMetaModal] = useState(false)

    const [data, setData] = useState({})
    const [onSearchText, setOnSearchText] = useState("");
    const [loader, setLoader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);
    const [updateCustomMetaData, setUpdateCustomMetaData] = useState(null)
    // const [reference, setReference] = useState(null)
    const [sortOrder, setsortOrder] = useState(null)
    const [columns, setColumns] = useState([
        {
            label: "Name",
            name: "name",
            sort: true,
            sortOrder: 0,
            show: true,
        },
        {
            label: "Desc",
            name: "desc",
            sort: true,
            sortOrder: 0,
            show: true,
        },
        {
            label: "Type",
            name: "type",
            sort: true,
            sortOrder: 0,
            show: true,
        },
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
        {
            label: "Options",
            name: "options",
            checked: false
        }
    ])

    const [filter, setFilter] = useState({
        type: [],
    })

    useEffect(() => {
        fetchCustomMetaData()
    }, [currentPage, itemPerPage, onSearchText, sortOrder, filter])

    useEffect(() => {
        toast.remove();
        return () => {
            toast.remove();
        }
    }, [])

    const fetchCustomMetaData = async (
        // search = ""
        exportData = false
    ) => {
        // setLoader(true)
        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching MetaData' }))
        let customMetaResponse = await API.getCustomMetaDataList(currentPage, itemPerPage, onSearchText, sortOrder, filter.type, exportData)
        if (!exportData) {
            let { status, ...rem } = customMetaResponse
            if (status) {
                setData({ data: customMetaResponse['data'], ...rem })
            }
            else {
                toast.error(`Unable to create MetaData`)
            }
        }
        // setLoader(false)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }




    const Privilege = JSON?.parse(localStorage.getItem('privileges'));



    const toggleCustomMetaModal = () => {
        setCustomMetaModal(!customMetaModal)
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
            desc: "desc",
            type: "type",
            isActive: "isActive",
            created: "createdAt",
            updated: "updatedAt"
        }

        var dbcol = mappings[keycolumnName]

        setsortOrder({ [dbcol]: sort ? 1 : -1 })
        setCurrentPage(1)

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


        // let defaultData = data['data']
        // if (!sort) defaultData.sort((a, b) => a[`${columnName}`].toString().localeCompare(b[`${columnName}`].toString()))
        // else defaultData.sort((a, b) => b[`${columnName}`].toString().localeCompare(a[`${columnName}`].toString()))
    }

    const suspendCusomMetaData = async (id) => {
        let referenceResponse = await API.getReferencesOnCustomMetaData(id);

        let { status, data } = referenceResponse
        if (status) {
            // setReference(data)
        }

        const fileText = data && data.fileCount == 1 ? 'file' : 'files';
        const folderText = data && data.folderCount == 1 ? 'folder' : 'folders';

        let footerContent = data && `References: ${data.fileCount !== 0 ? `${data.fileCount} ${fileText}` : ''} ${data.folderCount !== 0 ? `${data.folderCount} ${folderText}` : ''}`.trim();

        if (footerContent == "References:") {
            footerContent = null
        }
        else {
            footerContent = `<center>${footerContent} <br/> If deleted, the meta will also be deleted from all files and folders </center>`;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "Confirm Delete Metadata!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            footer: footerContent
        }).then(async (result) => {
            if (result.isConfirmed) {

                let referenceFlag = false
                if (footerContent) referenceFlag = true

                let customMetaResponse = await API.deleteCustomMetaData(id, referenceFlag);
                if (customMetaResponse['status']) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Custom Metadata has been Deleted",
                        icon: "success"
                    }).then(() => { fetchCustomMetaData() })
                }
                else {
                    Swal.fire("Error", "Unable to Delete Custom Metadata", "error");
                }
            }

        });
    }

    const getSelectedCustomMetaData = (id) => {

        if (data['data'].length != 0) {
            let filteredData = data['data'].find(item => item['_id'] == id)

            setUpdateCustomMetaData({
                id: filteredData['_id'],
                name: filteredData['name'],
                desc: filteredData['desc'],
                type: filteredData['type'],
                options: filteredData['type'] == 'list' ? filteredData['options'] : []
            })
        }
        else {
            setUpdateCustomMetaData({
                id: '',
                name: '',
                desc: '',
                type: '',
                options: []
            })
        }
        toggleCustomMetaModal()
    }

    async function exportMetadata() {
        // const excelInput = data.data.map(item => ({
        //     metadataName: item.name,
        //     status: item.isActive ? 'Active' : 'Inactive',
        //     addedDate: moment(item.createdAt).format('ll'),
        //     type: item.type,
        //     desc: item.desc
        // }));
        // const workbook = new ExcelJS.Workbook();
        // const usersSheet = workbook.addWorksheet('Incoming Trends');
        // usersSheet.columns = [
        //     { header: 'Metadata', key: 'metadataName', width: 15 },
        //     { header: 'Status', key: 'status', width: 20 },
        //     { header: 'Type', key: 'type', width: 20 },
        //     { header: 'Added Date', key: `addedDate`, width: 35 },
        //     { header: 'Description', key: 'desc', width: 20 },
        // ];
        // usersSheet.getRow(1).font = { bold: true };
        // usersSheet.addRows(excelInput);
        // workbook.xlsx.writeBuffer().then((buffer) => {
        //     saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'metadata.xlsx');
        // });
        fetchCustomMetaData(true);
    }

    const addnewcustommetadata = async () => {
        setCurrentPage(1)
        setsortOrder({ createdAt: -1 })
    }


    return (

        <FileManagerLayout>
            <FilesBody  >
                <Head title={'Metadata'} />

                <BlockHead size="sm">
                    <BlockBetween>
                        <BlockHeadContent>
                            <BlockTitle tag="h3" page>
                                Custom Metadata
                            </BlockTitle>
                            <BlockDes className="text-soft">
                                <p>You have total {data['totalCount']} Custom Metadatas</p>
                            </BlockDes>
                        </BlockHeadContent>

                        <BlockHeadContent>

                            <div className={`toggle-wrap nk-block-tools-toggle ${sm === false ? 'apply-width' : ''}`}>
                                <Button
                                    className={`btn-icon btn-trigger toggle-expand me-n1 ${sm ? "active" : ""}`}
                                    onClick={() => setSm(!sm)}
                                >
                                    <Icon name="menu-alt-r"></Icon>
                                </Button>
                                <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
                                    <div style={{ display: "flex" }}>
                                        {/* <div style={{ width: '40vh', marginRight: '2rem' }}>
                                            <RSelect
                                                options={metaOptions}
                                                value={selectedMetaOption}
                                                onChange={handleMetaChange}
                                            />
                                        </div> */}
                                        <Button color="light" outline className="mr-2 btn-white"
                                            onClick={() => exportMetadata()}
                                        >
                                            <Icon name="download-cloud"></Icon>
                                            <span>Export</span>
                                        </Button>
                                        {Privilege['metaData']['addMetaData'] && <Button size="md" color="primary" onClick={() => {
                                            setUpdateCustomMetaData(null)
                                            toggleCustomMetaModal()
                                        }}>
                                            <Icon name="plus" />
                                            <span>Create Custom Metadata</span>
                                        </Button>}
                                    </div>
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
                        editAccess: Privilege['metaData']['updateMetaData'],
                        deleteAccess: Privilege['metaData']['deleteMetaData']
                    }}
                    onEditClick={(id) => { getSelectedCustomMetaData(id) }}
                    suspendUser={suspendCusomMetaData}
                    sortData={sortData}
                    filterComp={
                        <MetadataFilter
                            onSearchText={onSearchText}
                            setFilter={setFilter}
                            filter={filter}
                            setCurrentPage={setCurrentPage}

                        />
                    }
                />


                <Modal isOpen={customMetaModal} size="md" toggle={toggleCustomMetaModal}>
                    <CustomMetaData toggle={toggleCustomMetaModal} addnewcustommetadata={addnewcustommetadata} updateCustomMetaData={updateCustomMetaData} />
                </Modal>

            </FilesBody>
        </FileManagerLayout>
    )
}

export default List