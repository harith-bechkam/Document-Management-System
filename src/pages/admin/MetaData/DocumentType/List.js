import React, { useState, useEffect } from "react";
import Head from "../../../../layout/head/Head";
import FileManagerLayout from "../../../app/file-manager/components/Layout";
import FilesBody from "../../../app/file-manager/components/Body";
import { Button, Icon, BlockHead, BlockBetween, BlockHeadContent, BlockTitle, BlockDes, RegularTable } from "../../../../components/Component";
import { Modal, Spinner, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import * as API from '../../../../utils/API';
import Swal from "sweetalert2";
import DocumentType from "../Modals/DocumentType";
import toast from "react-hot-toast";
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import moment from "moment";
import { useDispatch } from "react-redux";
import { updateLoaderFlag } from "../../../../redux/folderSlice";
import classnames from 'classnames';

const List = () => {
    const dispatch = useDispatch()

    const [sm, setSm] = useState(false)

    const [primarydata, setprimaryData] = useState({})
    const [secondarydata, setsecondaryData] = useState({})
    const [DocTypeModal, setDocTypeModal] = useState(false)
    const [secondaryDocTypeModal, setsecondaryDocTypeModal] = useState(false)

    const [currentPage, setCurrentPage] = useState(1);
    const [secondarycurrentPage, setsecondaryCurrentPage] = useState(1);

    const [itemPerPage, setItemPerPage] = useState(10);
    const [secondaryitemPerPage, setsecondaryItemPerPage] = useState(10);

    const [onSearchText, setOnSearchText] = useState("");
    const [secondaryonSearchText, setsecondaryOnSearchText] = useState("");

    const [sortOrder, setsortOrder] = useState(null)
    const [secondarysortOrder, setsecondarysortOrder] = useState(null)

    const [updateDocTypeData, setUpdateDocTypeData] = useState(null)
    const [updatesecondaryDocTypeData, setUpdatesecondaryDocTypeData] = useState(null)

    const [loader, setLoader] = useState(false);

    const [columns, setColumns] = useState([
        {
            label: "Name",
            name: "name",
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

    const [secondarycolumns, setsecondaryColumns] = useState([
        {
            label: "Name",
            name: "name",
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

    const [extraColumns, setExtraColumns] = useState([])
    const [secondaryextraColumns, setsecondaryExtraColumns] = useState([])


    useEffect(() => {
        fetchprimaryDocTypeData()
    }, [currentPage, itemPerPage, onSearchText, sortOrder])

    useEffect(() => {
        fetchsecondaryDocTypeData()
    }, [secondarycurrentPage, secondaryitemPerPage, secondaryonSearchText, secondarysortOrder])

    useEffect(() => {
        toast.remove();
        return () => {
            toast.remove();
        }
    }, [])


    const fetchprimaryDocTypeData = async (
        // search = ""
        exportData = false
    ) => {
        // setLoader(true)
        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching MetaData' }))

        let customMetaResponse = await API.getDocumentTypeList('primary', currentPage, itemPerPage, onSearchText, sortOrder, exportData)
        if (!exportData) {
            let { status, ...rem } = customMetaResponse
            if (status) {
                setprimaryData({ primarydata: customMetaResponse['data'], ...rem })
            }
        }
        // setLoader(false)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }

    const fetchsecondaryDocTypeData = async (
            // search = ""
        exportData = false
    ) => {
        // setLoader(true)
        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching MetaData' }))

        let customMetaResponse = await API.getDocumentTypeList('secondary', secondarycurrentPage, secondaryitemPerPage, secondaryonSearchText, secondarysortOrder, exportData)
        if (!exportData) {
            let { status, ...rem } = customMetaResponse
            if (status) {
                setsecondaryData({ secondarydata: customMetaResponse['data'], ...rem })
            }
        }
        // setLoader(false)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }


    const Privilege = JSON?.parse(localStorage.getItem('privileges'));

    const onSearch = (e) => {
        setOnSearchText(e.target.value)
        setCurrentPage(1)
    }

    const secondaryonSearch = (e) => {
        setsecondaryOnSearchText(e.target.value)
        setsecondaryCurrentPage(1)
    }

    const handlePagination = (pageNumber) => setCurrentPage(pageNumber)
    const handlesecondaryPagination = (pageNumber) => setsecondaryCurrentPage(pageNumber)

    const sortData = (keycolumnName, sort) => {

        //keycolumnName - dbcol
        const mappings = {
            name: "name",
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

    const secondarysortData = (keycolumnName, sort) => {

        //keycolumnName - dbcol
        const mappings = {
            name: "name",
            isActive: "isActive",
            created: "createdAt",
            updated: "updatedAt"
        }

        var dbcol = mappings[keycolumnName]

        setsecondarysortOrder({ [dbcol]: sort ? 1 : -1 })
        setsecondaryCurrentPage(1)

        // setColumns(prevColumns =>
        //     prevColumns.map(column =>
        //         column.name === keycolumnName
        //             ? { ...column, sortOrder: column.sortOrder === 1 ? -1 : 1 }
        //             : column
        //     )
        // );

        setsecondaryColumns(prevColumns =>
            prevColumns.map(secondarycolumns =>
                secondarycolumns.name === keycolumnName
                    ? { ...secondarycolumns, secondarysortOrder: secondarycolumns.secondarysortOrder === 1 ? -1 : 1 }
                    : { ...secondarycolumns, secondarysortOrder: 0 }
            )
        );


        // let defaultData = data['data']
        // if (!sort) defaultData.sort((a, b) => a[`${columnName}`].toString().localeCompare(b[`${columnName}`].toString()))
        // else defaultData.sort((a, b) => b[`${columnName}`].toString().localeCompare(a[`${columnName}`].toString()))
    }

    const toggleDocTypeModal = () => {
        setDocTypeModal(!DocTypeModal)
    }

    const secondarytoggleDocTypeModal = () => {
        setsecondaryDocTypeModal(!secondaryDocTypeModal)
    }

    const getSelectedDocType = (id) => {
        debugger;
        if (primarydata['data'].length != 0) {
            let filteredData = primarydata['data'].find(item => item['_id'] == id)

            setUpdateDocTypeData({
                id: filteredData['_id'],
                name: filteredData['name']
            })
        }
        else {
            setUpdateDocTypeData({
                id: '',
                name: ''
            })
        }

        toggleDocTypeModal()
    }

    const getsecondarySelectedDocType = (id) => {
        debugger;
        if (secondarydata['data'].length != 0) {
            let filteredData = secondarydata['data'].find(item => item['_id'] == id)

            setUpdatesecondaryDocTypeData({
                id: filteredData['_id'],
                name: filteredData['name']
            })
        }
        else {
            setUpdatesecondaryDocTypeData({
                id: '',
                name: ''
            })
        }

        secondarytoggleDocTypeModal()
    }

    const suspendDocType = async (id) => {

        let referenceResponse = await API.getReferencesOnDocumentType('primary', id);

        let { status, primarydata } = referenceResponse
        if (status) {
            // setReference(data)
        }

        const fileText = primarydata && primarydata.fileCount == 1 ? 'file' : 'files';
        const folderText = primarydata && primarydata.folderCount == 1 ? 'folder' : 'folders';

        let footerContent = primarydata && `References: ${primarydata.fileCount !== 0 ? `${primarydata.fileCount} ${fileText}` : ''} ${primarydata.folderCount !== 0 ? `${primarydata.folderCount} ${folderText}` : ''}`.trim();

        if (footerContent == "References:") {
            footerContent = null
        }
        else {
            footerContent = `<center>${footerContent} <br/> If deleted, the Primary Document Type will also be deleted from all files and folders </center>`;
        }

        Swal.fire({
            title: "Are you sure you want to delete?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            footer: footerContent
        }).then(async (result) => {
            if (result.isConfirmed) {

                let referenceFlag = false
                if (footerContent) referenceFlag = true

                let docTypeDeleteResponse = await API.deleteDocumentType('primary', id, referenceFlag);
                if (docTypeDeleteResponse['status']) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Primary Document Type has been Deleted",
                        icon: "success"
                    }).then(() => { fetchprimaryDocTypeData() })
                }
                else {
                    Swal.fire("Error", "Unable to delete Primary Document Type", "error");
                }
            }

        });

    }

    const secondarysuspendDocType = async (id) => {
    
        let referenceResponse = await API.getReferencesOnDocumentType('secondary', id);

        let { status, secondarydata } = referenceResponse
        if (status) {
            // setReference(data)
        }

        const fileText = secondarydata && secondarydata.fileCount == 1 ? 'file' : 'files';
        const folderText = secondarydata && secondarydata.folderCount == 1 ? 'folder' : 'folders';

        let footerContent = secondarydata && `References: ${secondarydata.fileCount !== 0 ? `${secondarydata.fileCount} ${fileText}` : ''} ${secondarydata.folderCount !== 0 ? `${secondarydata.folderCount} ${folderText}` : ''}`.trim();

        if (footerContent == "References:") {
            footerContent = null
        }
        else {
            footerContent = `<center>${footerContent} <br/> If deleted, the Secondary Document Type will also be deleted from all files and folders </center>`;
        }

        Swal.fire({
            title: "Are you sure you want to delete?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            footer: footerContent
        }).then(async (result) => {
            if (result.isConfirmed) {

                let referenceFlag = false
                if (footerContent) referenceFlag = true

                let docTypeDeleteResponse = await API.deleteDocumentType('secondary', id, referenceFlag);
                if (docTypeDeleteResponse['status']) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Secondary Document Type has been Deleted",
                        icon: "success"
                    }).then(() => { fetchsecondaryDocTypeData() })
                }
                else {
                    Swal.fire("Error", "Unable to delete Secondary Document Type", "error");
                }
            }

        });

    }

    async function exportDocType() {
        // const excelInput = data.data.map(item => ({
        //     docName: item.name,
        //     status: item.isActive ? 'Active' : 'Inactive',
        //     addedDate: moment(item.createdAt).format('ll')
        // }));
        // const workbook = new ExcelJS.Workbook();
        // const usersSheet = workbook.addWorksheet('Document-Types');
        // usersSheet.columns = [
        //     { header: 'Type Name', key: 'docName', width: 15 },
        //     { header: 'Status', key: 'status', width: 20 },
        //     { header: 'Added Date', key: `addedDate`, width: 35 },
        // ];
        // usersSheet.getRow(1).font = { bold: true };
        // usersSheet.addRows(excelInput);
        // workbook.xlsx.writeBuffer().then((buffer) => {
        //     saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'document-types.xlsx');
        // });
        fetchprimaryDocTypeData(true);
    }

    async function secondaryexportDocType() {
        // const excelInput = data.data.map(item => ({
        //     docName: item.name,
        //     status: item.isActive ? 'Active' : 'Inactive',
        //     addedDate: moment(item.createdAt).format('ll')
        // }));
        // const workbook = new ExcelJS.Workbook();
        // const usersSheet = workbook.addWorksheet('Document-Types');
        // usersSheet.columns = [
        //     { header: 'Type Name', key: 'docName', width: 15 },
        //     { header: 'Status', key: 'status', width: 20 },
        //     { header: 'Added Date', key: `addedDate`, width: 35 },
        // ];
        // usersSheet.getRow(1).font = { bold: true };
        // usersSheet.addRows(excelInput);
        // workbook.xlsx.writeBuffer().then((buffer) => {
        //     saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'document-types.xlsx');
        // });
        fetchsecondaryDocTypeData(true);
    }

    const addnewdefaultmetadata = async () => {
        setCurrentPage(1)
        setsortOrder({ createdAt: -1 })
    }

    const addnewsecondarydefaultmetadata = async () => {
        setsecondaryCurrentPage(1)
        setsecondarysortOrder({ createdAt: -1 })
    }
    const [activeTab, setActiveTab] = useState("1");
    
    const toggle = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    return (
        <FileManagerLayout>
            <FilesBody  >
                <Head title={'DocumentType'} />

                <Nav tabs>
                    <NavItem>
                        <NavLink
                            tag="a"
                            href="#tab"
                            className={classnames({ active: activeTab === "1" })}
                            onClick={(ev) => {
                            ev.preventDefault();
                                toggle("1");
                            }}
                        >
                            Primary Document Type
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            tag="a"
                            href="#tab"
                            className={classnames({ active: activeTab === "2" })}
                            onClick={(ev) => {
                            ev.preventDefault();
                            toggle("2");
                            }}
                        >
                            Secondary Document Type
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                        <BlockHead size="sm">
                            <BlockBetween>
                                <BlockHeadContent>
                                    {/* <BlockTitle tag="h3" page>
                                        Primary Document Type
                                    </BlockTitle> */}
                                    <BlockDes className="text-soft">
                                        <p>You have total {primarydata['totalCount']} primary document types</p>
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
                                                <Button color="light" outline className="mr-2 btn-white"
                                                    onClick={() => exportDocType()}
                                                >
                                                    <Icon name="download-cloud"></Icon>
                                                    <span>Export</span>
                                                </Button>
                                                {Privilege["metaData"]["addMetaData"] && <Button size="md" color="primary" onClick={() => {
                                                    setUpdateDocTypeData(null)
                                                    toggleDocTypeModal()
                                                }}>
                                                    <Icon name="plus" />
                                                    <span>Create Primary Document Type</span>
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
                            data={primarydata}
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
                            onEditClick={(id) => { getSelectedDocType(id) }}
                            suspendUser={suspendDocType}
                            sortData={sortData}
                            filterComp={<></>}
                        />
                        <Modal isOpen={DocTypeModal} size="md" toggle={toggleDocTypeModal}>
                            <DocumentType op="primary" toggle={toggleDocTypeModal} addnewdefaultmetadata={addnewdefaultmetadata} updateDocTypeData={updateDocTypeData} />
                        </Modal>
                    </TabPane>
                    <TabPane tabId="2">
                        <BlockHead size="sm">
                            <BlockBetween>
                                <BlockHeadContent>
                                    {/* <BlockTitle tag="h3" page>
                                        Secondary Document Type
                                    </BlockTitle> */}
                                    <BlockDes className="text-soft">
                                        <p>You have total {secondarydata['totalCount']} secondary document types</p>
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
                                                <Button color="light" outline className="mr-2 btn-white"
                                                    onClick={() => secondaryexportDocType()}
                                                >
                                                    <Icon name="download-cloud"></Icon>
                                                    <span>Export</span>
                                                </Button>
                                                {Privilege["metaData"]["addMetaData"] && <Button size="md" color="primary" onClick={() => {
                                                    setUpdatesecondaryDocTypeData(null)
                                                    secondarytoggleDocTypeModal()
                                                }}>
                                                    <Icon name="plus" />
                                                    <span>Create Secondary Document Type</span>
                                                </Button>}
                                            </div>
                                        </div>
                                    </div>

                                </BlockHeadContent>
                            </BlockBetween>
                        </BlockHead>
                        <RegularTable
                            columns={secondarycolumns}
                            extraColumns={secondaryextraColumns}
                            setColumns={setsecondaryColumns}
                            setExtraColumns={setsecondaryExtraColumns}
                            data={secondarydata}
                            itemPerPage={secondaryitemPerPage}
                            setItemPerPage={setsecondaryItemPerPage}
                            setCurrentPage={setsecondaryCurrentPage}
                            handlePagination={handlesecondaryPagination}
                            onSearchText={secondaryonSearchText}
                            onSearchChange={secondaryonSearch}
                            privilege={{
                                editAccess: true,
                                deleteAccess: true
                            }}
                            onEditClick={(id) => { getsecondarySelectedDocType(id) }}
                            suspendUser={secondarysuspendDocType}
                            sortData={secondarysortData}
                            filterComp={<></>}
                        />


                        <Modal isOpen={secondaryDocTypeModal} size="md" toggle={secondarytoggleDocTypeModal}>
                            <DocumentType op="secondary" toggle={secondarytoggleDocTypeModal} addnewdefaultmetadata={addnewsecondarydefaultmetadata} updateDocTypeData={updatesecondaryDocTypeData} />
                        </Modal>
                    </TabPane>
                </TabContent>              

            </FilesBody>
        </FileManagerLayout>

    )
}

export default List;