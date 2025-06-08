import { useState, useEffect, useRef } from "react"
import { CardHeader, Card, Container, CardBody, Col, Table, Row, Button, Badge, Input, Spinner } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { useNavigate } from "react-router";
import { doesMetaMultiSelectClicked, updateLoaderFlag } from "../../../../redux/folderSlice";
import { useDispatch } from "react-redux";
import Head from "../../../../layout/head/Head";
import toast from "react-hot-toast";
import * as API from '../../../../utils/API';
import MetadataApprovalTable from './Table'
import MetadataDocument from "./MetadataDocument";
import { useSelector } from "react-redux";
import FileManagerLayout from "../../../app/file-manager/components/Layout";
import Swal from "sweetalert2";
import Nodata from '../../../../assets/images/search/nodata.svg'
import UploadProgress from "../../../app/file-manager/modals/UploadProgress";


const MetadataApproval = () => {
    // const [selectedRecord, setSelectedRecord] = useState(dummyData[0]);
    // const [selectedRows, setSelectedRows] = useState(dummyData.map((d) => d.id));

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const store = useSelector((state) => state.folders)

    const [sm, setSm] = useState(false)

    const [customMetaModal, setCustomMetaModal] = useState(false)

    const [data, setData] = useState({})
    const [onSearchText, setOnSearchText] = useState("");
    const [loader, setLoader] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);
    const [updateCustomMetaData, setUpdateCustomMetaData] = useState(null)
    const [myPlanDetails, setMyPlanDetails] = useState(null)

    const [sortOrder, setsortOrder] = useState(null)
    const [selectedRows, setSelectedRows] = useState([]);
    const [notes, setNotes] = useState('')
    const [columns, setColumns] = useState([
        {
            label: "Name",
            name: "consent_metadata_name",
            sort: true,
            sortOrder: 0,
            show: true,
            clickable: true
        },
        {
            label: "Primary",
            name: "consent_primary_metadata_doc_type",
            sort: true,
            sortOrder: 0,
            show: true,
            clickable: true
        },
        {
            label: "Secondary",
            name: "consent_secondary_metadata_doc_type",
            sort: true,
            sortOrder: 0,
            show: true,
            clickable: true
        },
        {
            label: "Keywords",
            name: "consent_metadata_keywords",
            sort: true,
            sortOrder: 0,
            show: true,
            clickable: true
        },
        {
            label: "Notes",
            name: "consent_metadata_notes",
            sort: true,
            sortOrder: 0,
            show: true,
            clickable: true
        }
    ])

    const [extraColumns, setExtraColumns] = useState([
        // {
        //     label: "Options",
        //     name: "options",
        //     checked: false
        // }
    ])

    const [filter, setFilter] = useState({
        type: [],
    })
    const [docTypeOptionsData, setDocTypeOptionsData] = useState([])
    const [keywordOptionsData, setKeywordOptionsData] = useState([])
    const [secdocTypeOptionsData, setsecDocTypeOptionsData] = useState([])

    const [docTypeData, setDocTypeData] = useState([])
    const [secdocTypeData, setSecDocTypeData] = useState([])
    const [keywordsData, setKeywordsData] = useState([])
    const [queue, setQueue] = useState(0)
    const pageLoad = useRef(false);
    const [justRowCheckboxClicked, setJustRowCheckboxClicked] = useState(false)
    const [totalCnt, setTotalCnt] = useState(0)

    useEffect(() => {
        if (Privilege['metaData']['viewMetaData']) {
            fetchTemporaryMetaDataList()
            fetchMetaListAPIs()
            if (!pageLoad.current) {
                fetchQueue()
            }
            const intervalId = setInterval(fetchQueue, 3000)
            return () => {
                toast.remove()
                clearInterval(intervalId)
            }
        }
    }, [currentPage, itemPerPage, onSearchText, sortOrder, filter])

    // useEffect(() => {

    //     if (store['myworkspace']) {
    //         const workspace = store?.myworkspace?.find(work => work?._id == localStorage.getItem("workspace_id"))
    //         setMyPlanDetails(workspace?.planDetails)
    //     }

    //     toast.remove();
    //     return () => {
    //         toast.remove();
    //     }
    // }, [store['myworkspace']])



    const fetchTemporaryMetaDataList = async (
        exportData = false
    ) => {
        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Approval List' }))
        let metaResponse = await API.getApprovalMetaDataList(currentPage, itemPerPage, onSearchText, sortOrder, filter.type, exportData)
        if (!exportData) {
            let { status, message, ...rem } = metaResponse
            if (status) {
                setData({ data: metaResponse['data'], ...rem })
                var startingvalue = metaResponse?.['data']?.[0]

                setSelectedRows(startingvalue ? [startingvalue] : [])
                setDocTypeData(startingvalue?.defaultMetaData?.docTypeDataValue || [])
                setSecDocTypeData(startingvalue?.defaultMetaData?.secondaryDocTypeDataValue || [])
                setKeywordsData(startingvalue?.defaultMetaData?.keywordsDataValue || [])
                setNotes(startingvalue?.defaultMetaData?.notes || "")
                setTotalCnt(metaResponse?.['metaDataCount'] || 0)

                if (store?.metaApprovalmultiSelectClicked) {
                    setSelectedRows(metaResponse?.['data'])
                }

            }
            else {
                toast.error(metaResponse?.['message'] || `Approval Error`)
            }
        }
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }

    const fetchQueue = async () => {
        if (!pageLoad.current) {
            dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Approval Queue' }))
        }
        let QueueResponse = await API.getMetaApprovalQueueCnt()
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        pageLoad.current = true

        if (!QueueResponse?.status) {
            toast.error(QueueResponse?.message || `Queue Count Error`)
            return
        }

        if (QueueResponse?.['status']) {
            setQueue(QueueResponse?.['count'])
        }

    }

    const fetchMetaListAPIs = async () => {
        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching Document types' }))
        let docTypeResponse = await API.getAllDocumentType()

        dispatch(updateLoaderFlag({ loader: true, text: 'Fetching keywords metadata' }))
        let keywordsResponse = await API.getAllKeywords()

        if (docTypeResponse?.['status']) {
            setDocTypeOptionsData(docTypeResponse?.['data']?.['documentTypeData'])
            setsecDocTypeOptionsData(docTypeResponse?.['data']?.['secDocumentTypeData'])
        }

        keywordsResponse?.['status'] && setKeywordOptionsData(keywordsResponse?.['data'])

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
            consent_metadata_name: "resourceDetails.name",
            consent_primary_metadata_doc_type: "defaultMetaData.docTypeDataValue",
            consent_secondary_metadata_doc_type: "defaultMetaData.secondaryDocTypeDataValue",
            consent_metadata_keywords: "defaultMetaData.keywordsDataValue",
            consent_metadata_notes: "defaultMetaData.notes"
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
    const suspendCusomMetaData = async (id) => { }
    const getSelectedCustomMetaData = (id) => {
    }

    const isDifferenceFound = async (currentMeta) => {

        if (!currentMeta) return false

        return (
            JSON.stringify(currentMeta['docTypeDataValue'] ?? []) != JSON.stringify(docTypeData) ||
            JSON.stringify(currentMeta['secondaryDocTypeDataValue'] ?? []) != JSON.stringify(secdocTypeData) ||
            JSON.stringify(currentMeta['keywordsDataValue'] ?? []) != JSON.stringify(keywordsData) ||
            JSON.stringify(currentMeta['notes'] ?? '') != JSON.stringify(notes)
        )
    }


    //selection
    const toggleSelectAll = async () => {
        setJustRowCheckboxClicked(false)
        if (selectedRows.length === data.data?.length) {
            dispatch(doesMetaMultiSelectClicked(false))
            setSelectedRows([]); // Deselect all
        }
        else {
            dispatch(doesMetaMultiSelectClicked(true))
            setSelectedRows([...data.data]); // Select all
        }
    }

    const toggleRowCheckboxRowSelection = async (item) => {
        setJustRowCheckboxClicked(true)
        setSelectedRows((prevSelected) => {
            const exists = prevSelected?.some((row) => row?._id == item?._id)
            const newSelected = exists
                ? prevSelected.filter((row) => row?._id != item?._id)
                : [...prevSelected, item]
            return newSelected
        })
    }


    const toggleRowSelection = async (item) => {
        setJustRowCheckboxClicked(false)
        dispatch(doesMetaMultiSelectClicked(false))

        const isAlreadySelected = selectedRows.some((row) => row._id === item._id)

        if (selectedRows.length === 0) {
            setSelectedRows([item])
            return
        }

        if (isAlreadySelected) {
            return
        }

        const hasDifference = await isDifferenceFound(selectedRows[0]?.defaultMetaData || [])

        if (hasDifference) {
            const result = await Swal.fire({
                title: "Are you sure you want to go to next record?",
                text: "This action cannot be undone",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Go!",
            })

            if (result?.isConfirmed) {
                //go to next record
                setSelectedRows([item])
            }
        } else {
            //go to next record
            setSelectedRows([item])
        }
    }




    const deleteAndNavigateNext = async () => {
        if (selectedRows.length == 0) return

        const currentIndex = data?.['data'].findIndex(item => item?._id == selectedRows?.[0]?._id)
        if (currentIndex == -1) return

        const newData = [...data['data']]
        newData.splice(currentIndex, 1)
        setData(prev => ({ ...prev, data: newData }))

        if (newData.length == 0) {
            setSelectedRows([])
            return
        }

        const nextIndex = currentIndex >= newData.length ? newData.length - 1 : currentIndex // (currentIndex + 1) % newData.length
        const nextRow = newData[nextIndex]
        setSelectedRows([nextRow])
    }


    const approveCall = async (op) => {

        let response = null

        if (store?.metaApprovalmultiSelectClicked) {
            op = 'bulk'
        }

        if (op == 'single') {

            let defaultMetaData = {
                docTypeDataValue: docTypeData,
                secondaryDocTypeDataValue: secdocTypeData,
                keywordsDataValue: keywordsData,
                notes
            }

            let selectedRowsData = selectedRows?.map((item) => ({ metaId: item?._id, defaultMetaData }))

            dispatch(updateLoaderFlag({ loader: true, text: 'Processing Approval' }))
            response = await API.approveMetaData(selectedRowsData)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
        }


        if (op == 'bulk') {

            let selectedRowsData = []

            if (store?.metaApprovalmultiSelectClicked && justRowCheckboxClicked == false) {
                let metaApproverList = await API.getAllMetApproverList()
                if (metaApproverList?.['status']) {
                    selectedRowsData = metaApproverList?.['data']?.map((item) => ({ metaId: item?._id, defaultMetaData: item?.defaultMetaData }))
                }
            }
            else {
                selectedRowsData = selectedRows?.map((item) => ({ metaId: item?._id, defaultMetaData: item?.defaultMetaData }))
            }

            dispatch(updateLoaderFlag({ loader: true, text: 'Processing Bulk Approval' }))
            response = await API.approveMetaData(selectedRowsData)
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
        }

        if (response?.['status']) {
            toast.success("Metadata Approved Successfully")
            op == 'single' ? await deleteAndNavigateNext() : setFilter({ type: [] })
        }
        else {
            toast.error(response?.['message'] || "Metadata Approval Failed")
        }
    }

    const rejectCall = async () => {

        let selectedRowsData = []

        if (store?.metaApprovalmultiSelectClicked && justRowCheckboxClicked == false) {
            let metaApproverList = await API.getAllMetApproverList()
            if (metaApproverList?.['status']) {
                selectedRowsData = metaApproverList?.['data']?.map((item) => item?._id)
            }
        }
        else {
            selectedRowsData = selectedRows?.map((item) => item?._id)
        }

        dispatch(updateLoaderFlag({ loader: true, text: 'Processing Rejection' }))
        let response = await API.rejectMetaData(selectedRowsData)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        if (response['status']) {
            toast.success("Metadata Rejected Successfully")
            selectedRowsData?.length == 0 ? await deleteAndNavigateNext() : setFilter({ type: [] })
        }
        else {
            toast.error(response?.['message'] || "Metadata Rejection Failed")
        }
    }

    return (
        <Container fluid className="d-flex flex-column vh-100 p-0">
            <Head title={'Metadata Approval'} />
            <div className={`flex-grow-1 overflow-hidden ${store?.loader && 'loading'}`}>
                <Card className="card-bordered d-flex flex-column h-100">
                    <CardHeader className="border-bottom">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <Icon
                                    style={{ fontWeight: "bold", cursor: "pointer", marginInline: "1rem" }}
                                    onClick={() => navigate(-1)}
                                    name="arrow-long-left"
                                />
                                <div>
                                    <h6 className="mb-0">Metadata Approval</h6>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    {data?.['data']?.length === 0 && (
                        <div className="d-flex flex-column justify-content-center align-items-center text-muted flex-grow-1">
                            <img src={Nodata} alt="NoData" width={200} height={200} />
                            <p className="mt-2 fs-6">No data found</p>
                        </div>
                    )}

                    {data?.['data']?.length > 0 && (
                        <CardBody className="flex-grow-1 overflow-hidden">
                            <Row className="h-100">
                                {/* Left Column */}
                                <Col md={7} className="d-flex flex-column h-100">
                                    <div className={`d-flex align-items-center justify-content-${queue === 0 ? 'end' : 'between'} mb-2 flex-shrink-0`}>
                                        {queue !== 0 && <h6 className="pt-2">Queued Action: {queue}</h6>}
                                        <span>
                                            {Privilege['metaData']['updateMetaData'] && (
                                                <>
                                                    <Button
                                                        color="primary"
                                                        className="me-2"
                                                        disabled={(data?.['data']?.length > 1 && selectedRows.length <= 1) || data?.['data']?.length === 0}
                                                        onClick={() => approveCall('bulk')}
                                                    >
                                                        Approve All
                                                    </Button>
                                                    <Button
                                                        color="danger"
                                                        disabled={(data?.['data']?.length > 1 && selectedRows.length <= 1) || data?.['data']?.length === 0}
                                                        onClick={() => rejectCall('bulk')}
                                                    >
                                                        Cancel All
                                                    </Button>
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex-grow-1 overflow-auto custom-scrollbar metaapproval-table">
                                        <MetadataApprovalTable
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
                                                viewAccess: Privilege['metaData']['viewMetaData'],
                                                editAccess: Privilege['metaData']['updateMetaData'],
                                                deleteAccess: Privilege['metaData']['deleteMetaData']
                                            }}
                                            onEditClick={(id) => getSelectedCustomMetaData(id)}
                                            suspendUser={suspendCusomMetaData}
                                            sortData={sortData}
                                            selectedRows={selectedRows}
                                            setSelectedRows={setSelectedRows}
                                            toggleRowSelection={toggleRowSelection}
                                            toggleRowCheckboxRowSelection={toggleRowCheckboxRowSelection}
                                            toggleSelectAll={toggleSelectAll}
                                            filterComp={<></>}
                                        />
                                    </div>
                                </Col>

                                {/* Right Column */}
                                <Col md={5} className="d-flex flex-column h-100 mt-0">
                                    {/* <div className="flex-grow-1 overflow-auto custom-scrollbar"> */}
                                    <MetadataDocument
                                        selectedRows={selectedRows}
                                        setSelectedRows={setSelectedRows}
                                        docTypeOptionsData={docTypeOptionsData}
                                        setDocTypeOptionsData={setDocTypeOptionsData}
                                        secdocTypeOptionsData={secdocTypeOptionsData}
                                        setsecDocTypeOptionsData={setsecDocTypeOptionsData}
                                        keywordOptionsData={keywordOptionsData}
                                        setKeywordOptionsData={setKeywordOptionsData}
                                        docTypeData={docTypeData}
                                        setDocTypeData={setDocTypeData}
                                        secdocTypeData={secdocTypeData}
                                        setSecDocTypeData={setSecDocTypeData}
                                        keywordsData={keywordsData}
                                        setKeywordsData={setKeywordsData}
                                        notes={notes}
                                        setNotes={setNotes}
                                        totaldata={data?.['data'] || []}
                                        approveCall={approveCall}
                                        rejectCall={rejectCall}
                                        editAccess={Privilege?.['metaData']?.['updateMetaData']}
                                    />
                                    {/* </div> */}
                                </Col>
                            </Row>
                        </CardBody>
                    )}
                </Card>
            </div>

            {store?.loader && (
                <div className="loader">
                    <Spinner size="sm" />
                    <span className="loading-text">{store?.loaderText}...</span>
                </div>
            )}

            <UploadProgress />
        </Container>
    )
}

export default MetadataApproval
