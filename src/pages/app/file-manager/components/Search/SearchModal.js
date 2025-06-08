import { useSelector } from "react-redux"
import { BlockHeadSub, BlockTitle, Icon } from "../../../../../components/Component"
import { useTheme } from "../../../../../layout/provider/Theme"
import { Badge, Breadcrumb, BreadcrumbItem, Button, Card, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, Nav, NavItem, NavLink, Spinner, TabContent, TabPane, UncontrolledDropdown } from "reactstrap"
import { useState, useEffect, useRef } from "react"
import * as API from "../../../../../utils/API"
import { useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux"
import { saveAISearchLoader, saveAISearchResults, saveSearch, saveSearchDirectory, saveSearchPagination, updateCurrentLocation, updateLoaderFlag } from "../../../../../redux/folderSlice"
import { getFileType } from "../../../../../utils/helper"
import toast from "react-hot-toast"
import Viewer from "../../modals/Viewer"
import { Lightbox } from "react-modal-image"
import SearchFilters from "./SearchFilters"
import SearchTabs from "./SearchTabs"
import axios from "axios"
import NoSearch from '../../../../../assets/images/search/nosearch.svg'
import Nodata from '../../../../../assets/images/search/nodata.svg'
import moment from "moment"
import { DebounceInput } from 'react-debounce-input';
import _, { template } from 'lodash';
import { setDownloadFileAction } from "../../../../../redux/download/downloadAction"

let cancelTokenSource;

const SearchModal = ({ isOpen, toggle }) => {

    const theme = useTheme()
    const store = useSelector((state) => state.folders)
    const [currentDirectory, setCurrentDirectory] = useState([])
    const [toastId, setToastId] = useState(null)



    const [activeTab, setActivetab] = useState("All")

    const searchModalRef = useRef(null);

    const location = useLocation()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [viewDoc, setViewDoc] = useState({})
    const [videoDuration, setVideoDuration] = useState(0)
    const [viewerModal, setViewerModal] = useState(false);

    const [imageFlag, setImageFlag] = useState(false);
    const [imageFile, setImageFile] = useState({})




    const [codeContent, setCodeContent] = useState('')
    const excludedDivRef = useRef(null)

    const [showHistory, setShowHistory] = useState(false)
    const [searchHistory, setSearchHistory] = useState([])

    //necessary state
    const [searchloader, setSearchLoader] = useState(false)
    const [searchResult, setSearchResult] = useState(null)

    const [aiclickedfilename, setaiClickedFileName] = useState('')
    const [aiModal, setaiModal] = useState(false)
    const [aiLoader, setAILoader] = useState(false)
    const [aiResult, setAIResult] = useState(null)

    const convertToSeconds = (duration) => {
        if(duration==0)
            return 0

        const [minutes, seconds] = duration.toString().split(".").map(Number);
        return minutes ;
      };
    const canshowsummary=()=>{
        let aienabled= true
        if(aienabled==true){
            return true
        }else{
            return aienabled
        }
    }

    //searchFilters - to send to api
    const [searchFilters, setSearchFilters] = useState({
        searchTerm: '',
        searchIn: [],

        directory: [],
        fullpath: [],

        // sharedIds: [],
        meta: {
            defaultMetaDataValues: null,
            customMetaDataValues: null
        },
        createdTime: '',
        updatedTime: ''
    })


    let isEnterKeyPressed = useRef(false)
    let inputRef = useRef(null)

    //breadcrumb
    const [isOpenbread, setIsOpenBread] = useState(false);
    const togglebread = () => { setIsOpenBread(!isOpenbread) }

    useEffect(() => {

        async function setUpFoldersAndSearchHistory() {

            if (inputRef.current) {
                inputRef.current.focus()
            }

            setShowHistory(true)
            const savedSearchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []
            if (savedSearchHistory.length > 0) {
                setSearchHistory(savedSearchHistory)
            }

            //Folder Detecting - we will store in state as well in redux state
            // var tempDir = _.cloneDeep(store?.searchCurrentDirectory)
            // localStorage.setItem('currentBreadCrumb', JSON.stringify(store?.searchCurrentDirectory))

            // if (location.pathname == '/starred') {
            //     setCurrentDirectory([])
            //     return
            // }


            // if (location.pathname == '/shared') {
            //     setCurrentDirectory(tempDir)
            //     return
            // }


            // if (tempDir.length != 1) {

            //     var arr = []
            //     arr.push(tempDir[0])
            //     arr.push(tempDir[tempDir.length - 1])

            //     setCurrentDirectory(arr)
            // }
            // else {
            //     setCurrentDirectory(tempDir)
            // }







            //calling directorypath api here itself
            // var paramData = location.pathname.split("/")
            // if (paramData?.length == 3) {
            //     const lastPart = paramData.pop()
            //     let parentData = await getPath(lastPart)
            //     setCurrentDirectory(parentData?.filter(item => item['type'] != 'file' && item['type'] != 'form').slice(-1) || [])
            // }

        }
        setUpFoldersAndSearchHistory()

    }, [])

    const getPath = async (pathId) => {
        let pathRespo = await API.getDirectoryPath(pathId);
        if (!pathRespo.status) return toast.error(`Folder Path Cannot be Found`);

        const data = [...pathRespo.data]
        return data
    }


    const removeCurrentDirectory = async (e, id) => {
        e.stopPropagation()
        e.preventDefault()
        localStorage.removeItem('currentBreadCrumb')
        let newCurrentDirectory = currentDirectory.filter(item => item['_id'] != id)
        setCurrentDirectory(newCurrentDirectory)
    }


    const setUpPayload = async () => {
        try {


            //directory & fullpath setting in payload
            var fullDir = _.cloneDeep(store?.searchCurrentDirectory) || []
            const hasShared = fullDir.length == 1 && fullDir.some(item => item.name == "Shared")
            if (hasShared) {
                searchFilters['directory'] = ['shared']
                searchFilters['fullpath'] = fullDir.shift()
            }
            else {
                searchFilters['directory'] = searchFilters['directory']
                searchFilters['fullpath'] = fullDir
            }

            if (searchFilters['directory']?.length == 0) {
                searchFilters['fullpath'] = []
            }

            if (currentDirectory?.length == 0) {
                searchFilters['directory'] = []
                searchFilters['fullpath'] = []
            }

            // if (searchFilters['directory']) {


            //     if (searchFilters['directory'].includes('1')) {
            //         searchFilters['directory'] = ['shared']
            //         // searchFilters['sharedIds'] = []
            //     }
            //     else {

            //         //TO GET THE CHILD LEVELS USE BELOW CODE
            //         // let childlevels = []

            //         // var sharedLevels = []
            //         // store?.['myHierarchy'].map(item => {
            //         //     if (item['value'] == 'shared') {
            //         //         sharedLevels.push(item)
            //         //     }
            //         // })

            //         // const sharedIds = await findSharedIds(sharedLevels, searchFilters['directory'])
            //         // searchFilters['sharedIds'] = sharedIds

            //         // for (var selectedValues of searchFilters['directory']) {
            //         //     let a = []

            //         //     const parentNode = await findNode(store?.['myHierarchy'], selectedValues)
            //         //     const hasChildren = parentNode?.['children']?.length != 0
            //         //     a = hasChildren ? await getChildValues(parentNode) : selectedValues

            //         //     if (hasChildren) {
            //         //         a.unshift(parentNode['value'])
            //         //         childlevels.push(...a)
            //         //     }
            //         //     else {
            //         //         childlevels.push(a)
            //         //     }

            //         // }

            //         // searchFilters['directory'] = childlevels

            //         // store?.searchCurrentDirectory.filter(item => item['type'] != 'file' && item['type'] != 'form').slice(-1) || []
            //         searchFilters['directory'] = currentDirectory?.map(a => a?._id)
            //     }
            // }





            if (searchFilters['createdTime']) {
                searchFilters['createdTime'] = await toUTC(searchFilters['createdTime'])
            }

            if (searchFilters['endTime']) {
                searchFilters['endTime'] = await toUTC(searchFilters['endTime'])
            }
        }
        catch (err) {
            showToast('While SetUpPayload some Error Occured', 'error')
        }
    }

    const handleSearchModal = async (e) => {
        e.preventDefault();
        e.stopPropagation()

        const newSearchTerm = e.target.value
        dispatch(saveSearch(newSearchTerm))
        await setUpPayload()
        handleSearchAPI(newSearchTerm)
        if (newSearchTerm == '') {
            setShowHistory(true)
        }
        else {
            setShowHistory(false)
        }
    }


    // history - enter key calls
    const handleHistory = async (e, item) => {
        e.preventDefault()


        setShowHistory(false)
    }

    const handleKeyPress = async (e) => {
        if (e.key == "Enter") {
            isEnterKeyPressed.current = true

            const newSearchTerm = store?.['search']?.trim()

            if (!newSearchTerm) return


            let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []

            searchHistory = searchHistory.filter((term) => term != newSearchTerm)

            searchHistory.unshift(newSearchTerm)

            if (searchHistory.length > 10) {
                searchHistory = searchHistory.slice(0, 10)
            }

            localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
            setSearchHistory(searchHistory)

            dispatch(saveSearch(newSearchTerm))

            navigate('/search')
            toggle()
        } else {
            isEnterKeyPressed.current = false
        }
    }



    //API calls - necessay functions
    const showToast = (message, type = 'success') => {
        if (toastId) {
            toast.remove(toastId)
            toast.remove()
        }

        let id;
        if (type == 'success') {
            id = toast.success(message, {
                duration: 4000,
                position: 'top-center',
            })
        } else if (type == 'error') {
            id = toast.error(message, {
                duration: 4000,
                position: 'top-center',

            })
        }
        setToastId(id)
    }

    const toUTC = async (data) => {

        if (data) {
            const updatedData = data?.map(item => ({
                startDate: moment.utc(item.startDate).add(1, 'days').startOf('day').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
                endDate: moment.utc(item.endDate).add(1, 'days').startOf('day').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
                key: item.key
            }))
            return updatedData
        }

    }

    const checkForStandards = async (path) => {

        let a = false, b = false
        path.forEach(item => {
            if (item.name.toLowerCase() == 'shared') {
                a = true
            }
            if (item.name.toLowerCase() == 'starred') {
                b = true
            }
        })
        return { a, b }
    }

    // async function getChildValues(node) {

    //     return node?.children?.reduce((acc, child) => {
    //         let a = getChildValues(child)
    //         acc.push(child.value, ...a)
    //         return acc
    //     }, [])
    // }

    async function getChildValues(node) {
        if (!node?.children) return [];

        let acc = [];

        for (const child of node.children) {
            let a = await getChildValues(child);
            acc.push(child.value, ...a);
        }

        return acc;
    }


    async function findNode(data, target) {

        for (const node of data) {
            if (node.value == target) return node
            const found = await findNode(node.children || [], target)
            if (found) return found
        }

        return null
    }

    async function findSharedIds(hierarchy, selectedValues) {
        const sharedNode = hierarchy.find(node => node.value == "shared")
        if (!sharedNode) return []

        const result = []

        async function traverse(nodes) {
            for (const node of nodes) {
                if (selectedValues.includes(node.value)) {
                    result.push(node.value)
                }
                if (node.children.length > 0) {
                    await traverse(node.children)
                }
            }
        }

        await traverse(sharedNode.children)
        return result
    }


    const countFilledValuesNormal = async (metaDataValues) => {

        return Object.values(metaDataValues).filter((metaData) => {
            if (["is", "is not"].includes(metaData.filter)) {
                return !!metaData.value
            }
            else if (["includes", "excludes"].includes(metaData.filter)) {
                return Array.isArray(metaData.value) && metaData.value.length > 0
            }
            return false
        }).length

    }


    const searchapicall = async (payload) => {
        // console.log(payload,"payload")
        if (!payload) return

        payload["currentDirectory"] = payload["currentDirectory"]?.map(item => item?._id == "null" ? "shared" : item?._id).slice(-1)

        let metaCount = await countFilledValuesNormal(payload['defaultMetaDataValues'])
        if (metaCount == 0) {
            payload['defaultMetaDataValues'] = []
        }
        let custmetaCount = await countFilledValuesNormal(payload['customMetaDataValues'])
        if (custmetaCount == 0) {
            payload['customMetaDataValues'] = []
        }

        payload['selectedCreatedTime'] = await toUTC(payload['selectedCreatedTime'])
        payload['selectedLastUpdateTime'] = await toUTC(payload['selectedLastUpdateTime'])

        handleSearchAPI(payload)
    }

    const handleSearchAPI = (payload) => {
        if (payload.searchTerm.trim() === "") return

        if (cancelTokenSource) {
            cancelTokenSource.cancel("Previous Request Cancelled")
        }

        cancelTokenSource = axios.CancelToken.source();


        //SYNCHRONOUS CALL
        try {
            setShowHistory(false)
            setSearchLoader(true)

            try {
                axios.post(
                    `${process.env.REACT_APP_BE_URL}/search`,
                    { payload, page: 1, pageSize: 10 },
                    { cancelToken: cancelTokenSource.token }
                )
                    .then(async (res) => {

                        const { status, data, currentPage, perPage, totalCount, message } = res.data

                        // setSearchLoader(false)


                        if (!status) {
                            if (message == "Previous Request Cancelled") {
                                setSearchLoader(true)
                                return
                            }
                            else {
                                showToast(`${message}`.replace(/\b\w/g, (char) => char.toUpperCase()), 'error')
                                return
                            }
                        }

                        setSearchLoader(false)


                        if (data) {
                            setSearchResult(data)
                            dispatch(
                                saveSearchPagination({
                                    currentPage: 1,
                                    perPage: 10,
                                    totalCount: totalCount || 0,
                                })
                            )
                        }

                    }).catch((err) => {
                        if (axios.isCancel(err)) {

                        }
                        else {
                            showToast(`${err.response?.data?.message || 'An Error Occurred'}`.replace(/\b\w/g, (char) => char.toUpperCase()), 'error')
                            return
                        }
                    })


            }
            catch (err) {
                if (axios.isCancel(err)) {

                }
                else {
                    showToast(`${err.response.data.message || 'An Error Occurred - While Calling Search API'}`.replace(/\b\w/g, (char) => char.toUpperCase()), 'error')
                    return
                }
            }
        }
        catch (err) {
            if (axios.isCancel(err)) {
                //do nothing
            }
            else {
                showToast("Error During Search" || err, "error")
                return
            }
        }
    }



    // sub - function calls
    async function openFile(e, type, item) {
        let currentSelection=item?.['_source']
        
        e.preventDefault();
        e.stopPropagation();
        let duration=0;
        if(typeof item.inner_hits!=="undefined" && typeof item.inner_hits.chunk_data!=="undefined"){
            if(typeof item.inner_hits.chunk_data.hits!=="undefined"){
                for(let info of item.inner_hits.chunk_data.hits.hits){
                    if(typeof info._source.duration_start!=="undefined"){
                        duration=info._source.duration_start;
                        setVideoDuration(convertToSeconds(duration));
                        break;
                    }
                    
                }
            }
        }

        if (type == 'form') {
            navigate(`/details/${currentSelection.id}`)
            toggle()
            return;
        }

        if (type == 'folder') {
            dispatch(updateCurrentLocation({
                drive: currentSelection
            }))
            toggle()
            navigate(`/folder/${currentSelection.id}`)
        } else {
            if (type != 'form') {
                const docType = getFileType(currentSelection.fileType);
                if (docType == 'unknown') return showToast('Unsupported File Type', 'error');
                if ((docType == 'word') || (docType == 'excel') || (docType == 'ppt') || (docType == 'pdf')) {
                    localStorage.setItem('currentLocation', JSON.stringify(location.pathname));
                    let destination=0;
                    if(typeof item.inner_hits!=="undefined" && typeof item.inner_hits.chunk_data!=="undefined"){
                        if(typeof item.inner_hits.chunk_data.hits!=="undefined"){
                            for(let info of item.inner_hits.chunk_data.hits.hits){
                                if(typeof info._source.page_number!=="undefined"){
                                    destination=info._source.page_number;
                                    break;
                                }else if(typeof info._source.slide_number!=="undefined"){
                                    destination=info._source.slide_number;
                                    break;
                                }else if(typeof info._source.sheet_name!=="undefined"){
                                    destination=info._source.sheet_name;
                                    break;
                                }else{
                                    destination=info._source.content;
                                    break;
                                }
                                
                            }
                        }
                    }
                    window.open(`${window.location.origin}/#/${localStorage.getItem("workspace_id")}/file/view/${currentSelection.id}?destination=${encodeURIComponent(destination)}`, '_blank', 'noopener,noreferrer');
                    // navigate(`/file/view/${currentSelection.id}`)
                    toggle()
                } else {
                    if (docType == 'image') {
                        setImageFile(currentSelection);
                        setImageFlag(true);
                        // toggle()
                        return
                    }
                    else if (docType == 'code') {
                        const fileResponse = await API.readFile(currentSelection.id);
                        if (!fileResponse.status) return showToast('Error Reading File', 'error');
                        setCodeContent(fileResponse.content);
                        setViewDoc(currentSelection);
                        toggleViewerModal();
                        // toggle()
                        return
                    }
                    else {
                        setViewDoc(currentSelection);
                        toggleViewerModal();
                        // toggle()
                        return
                    }
                }
                toggle()
            }
        }
    }

    const toggleViewerModal = () => {
        setViewerModal(!viewerModal)
    }

    const downloadDoc = async (e, item) => {
        e.stopPropagation();
        e.preventDefault();
        if (item.type == 'folder') {
            // dispatch(updateLoaderFlag({ loader: true, text: 'Downloading...' }))
            dispatch(setDownloadFileAction([{ file: [], folder: [item._source["id"]], fileName: "Zipping", extension: "", APIType: 'fileDownloadAPI', type: "bulk" }]))
            // await API.bulkDocsDownload([], [item._source["id"]]);
            // dispatch(updateLoaderFlag({ loader: false, text: '' }))
        }
        else if (item.type == 'file') {
            // dispatch(updateLoaderFlag({ loader: true, text: 'Downloading...' }))
            dispatch(setDownloadFileAction([{ file: item._source["id"], folder: [], fileName: item._source["name"].split('.')[0], extension: item._source.fileType, APIType: 'fileDownloadAPI', type: "single" }]))
            // await API.downloadedFile(item._source["id"], item._source["name"].split('.')[0], '', item._source.fileType)
            // dispatch(updateLoaderFlag({ loader: false, text: '' }))
        }
        toggle()
    }

    const onClickSearchRecords = (e, item) => {
        e.stopPropagation();
        e.preventDefault();
        navigate(`/details/${item._source.id}`)
        toggle()
    }


    function printBreadCrumbs(directoryPath) {
        var showarr = directoryPath.slice(-2)
        var droparr = directoryPath.slice(0, -2)

        return (
            <Breadcrumb className="breadcrumb-arrow">
                {droparr.length > 0 && (
                    <BreadcrumbItem>
                        <Dropdown isOpen={isOpenbread} toggle={togglebread} direction={"right"}>
                            <UncontrolledDropdown>
                                <DropdownToggle
                                    tag="a"
                                    className="dropdown-toggle btn btn-icon"
                                    style={{ width: "30px", height: "30px", padding: 0 }}
                                >
                                    <span className='d-flex justify-content-center align-item-center'>
                                        <Icon name={'more-h'} />
                                    </span>
                                </DropdownToggle>
                                <DropdownMenu>
                                    <ul className="link-check" style={{ textTransform: "none" }}>
                                        {droparr.map((element, idx) => (
                                            <li key={element.link}>
                                                <DropdownItem
                                                    tag="a"
                                                    className="breadcrumb_dropdown"
                                                    href="#dropdownitem"
                                                    onClick={(ev) => {
                                                        ev.preventDefault();
                                                        navigate(element.link);
                                                    }}
                                                >
                                                    {element.name}
                                                </DropdownItem>
                                            </li>
                                        ))}
                                    </ul>
                                </DropdownMenu>
                            </UncontrolledDropdown>
                        </Dropdown>
                    </BreadcrumbItem>
                )}

                {showarr.map((item, index) => (
                    <BreadcrumbItem
                        key={item.id}
                        active={index == showarr.length - 1}
                        onClick={() => navigate(item.link)}
                    >
                        {item.name}
                    </BreadcrumbItem>
                ))}
            </Breadcrumb>
        );
    }




    const onClickAISUmmary = async (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        if (canshowsummary()) {
            setaiClickedFileName(item?._source?.name)
            await doAIThings([item])
        }

    }

    const doAIThings = async (data) => {
        if (!data) return
        let pick = Number(process.env.REACT_APP_PICK_TOP) || 1
        const formattedResults = data
            .filter(item => item?.type != "folder" && item?.type != "form")
            .filter(item => item?._source?.content != '')
            .slice(0, pick)
            .map(item => {
                if (item.type == 'file') {
                    debugger;
                    var inner_hit_content=[];
                    const title = item?._source?.name || "Untitled"
                    const docType = getFileType(item?._source?.fileType);
                    if(docType!="excel" && typeof item.inner_hits!=="undefined" && typeof item.inner_hits.chunk_data!=="undefined"){
                        if(typeof item.inner_hits.chunk_data.hits!=="undefined"  && item.inner_hits.chunk_data.hits.hits.length>0){
                            for(let info of item.inner_hits.chunk_data.hits.hits){
                                inner_hit_content.push(info._source.content)
                            }
                            inner_hit_content=inner_hit_content.join("\n")
                            return `Title: ${title}\nContent: ${inner_hit_content}\n`
                        }
                    }
                    const content = item?._source?.content || "No content available"
                    return `Title: ${title}\nContent: ${content}\n`
                }
            }).join('\n')

        if (formattedResults != '') {
            await fetchOpenAI(formattedResults)
        }
        else {
            setAILoader(false)
            setAIResult(null)
        }

    }


    const fetchOpenAI = async (search_summary) => {
        var searchdata = ''
        const params = new URLSearchParams(location.search)
        const decodedSearch = params.get("searchTerm")

        if (decodedSearch) {
            searchdata = JSON.parse(decodeURIComponent(decodedSearch))
        }

        let searchTerm = searchdata

        try {
            setaiModal(true)
            setAILoader(true)
            const AIResponse = await API.getAIResult(searchTerm, search_summary)

            if (!AIResponse?.status) {
                setAILoader(false)
                setAIResult(null)
                let msg = AIResponse['message'] || "Some Error occurred in AI Search ! Refresh and Try Again"

                if (msg?.includes("Request too large") || msg.includes('maximum context')) {
                    setAIResult("Request Size is Too large. Please Reduce the Input or Output Tokens and Try Again")
                    return;
                    // msg = "Request Size is Too large. Please Reduce the Input or Output Tokens and Try Again"
                }
                // showToast(`${msg}`.replace(/\b\w/g, char => char.toUpperCase()), "error")
                setaiModal(false)
                setAILoader(false)
                return
            }

            if (AIResponse?.status) {
                setAIResult(AIResponse.data)
                setAILoader(false)
            }

        } catch (error) {
            // showToast("Failed to Fetch AI Summary!", "error")
            setAILoader(false)
            setAIResult(null)
        }

    }

    return (
        <div className={showHistory ? 'searchModalGlobalHistory' : 'searchModalGlobal'} ref={searchModalRef}>
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-primary border border-light rounded-circle modalcloseicon" onClick={(e) => toggle()}>
                <Icon name="cross-sm" className="position-absolute top-50 start-50 translate-middle"></Icon>
            </span>
            {/* <div className={theme.skin == "dark" ? "nk-fmg-search headersearch_dark" : "nk-fmg-search headersearch"}  >
                <Icon name="search" />
                {currentDirectory.map((item) => (
                    <div id="searchInBadgeId" ref={excludedDivRef} key={item._id} style={{ display: "inline-block", margin: "5px" }}>
                        <Badge pill color="primary" className="searchBadge">
                            {item?.name}
                            <span
                                className="searchCloseIcon"
                                onClick={(e) => removeCurrentDirectory(e, item["_id"])}
                            >
                                <Icon name="cross-sm" />
                            </span>
                        </Badge>
                    </div>
                ))}

                <DebounceInput
                    debounceTimeout={300}
                    inputRef={inputRef}
                    type="text"
                    className="form-control border-transparent form-focus-none searchmodalInput"
                    placeholder="Search"
                    value={store?.search}
                    onChange={handleSearchModal}
                    onKeyDown={handleKeyPress}
                />

                NORMAL INPUT
                <input
                    ref={inputRef}
                    type="text"
                    className="form-control border-transparent form-focus-none searchmodalInput"
                    placeholder="Search"
                    value={store?.search}
                    onChange={handleSearchModal}
                    onKeyDown={handleKeyPress}
                /> 


               <div class="ai-search-button">
                    <Button>
                        <Icon name="graphql" />
                        AI
                    </Button>
                </div>
            </div> */}



            <SearchFilters
                // currentPage={currentPage}
                // setCurrentPage={setCurrentPage}
                // itemPerPage={itemPerPage}
                // setItemPerPage={setItemPerPage}

                setSearchFilters={setSearchFilters}
                toggle={toggle} searchapicall={searchapicall} currentDirectory={currentDirectory} setCurrentDirectory={setCurrentDirectory}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                searchHistory={searchHistory}
                setSearchHistory={setSearchHistory}
                searchResult={searchResult}
            />




            <TabContent activeTab={activeTab}>
                <TabPane tabId="All">
                </TabPane>

                <TabPane tabId="Word">
                </TabPane>

                <TabPane tabId="PDF">
                </TabPane>

                <TabPane tabId="Excel">
                </TabPane>

                <TabPane tabId="PPT">
                </TabPane>

                <TabPane tabId="Images">
                </TabPane>

                <TabPane tabId="Videos">
                </TabPane>

                <TabPane tabId="Others">
                </TabPane>

            </TabContent>


            {!showHistory &&
                // <div>
                //     {searchHistory.length > 0 ? (
                //         <div className=" mb-2 ">
                //             {searchHistory.map((item, index) => (
                //                 <span key={index} className="px-2 py-1 d-flex align-items-center searchHistory" onClick={(e) => handleHistory(e, item)}><Icon name="history" /> &ensp;{item}</span>
                //             ))}
                //         </div>
                //     ) : (
                //         <div className="m-5" style={{ textAlign: "center" }}>
                //             <img src={NoSearch} alt="NoSearch" width={250} height={250} />
                //             <p>No Items Searched!</p>
                //         </div>
                //     )}
                // </div>
                <>
                    {/* <SearchTabs activeTab={activeTab} setActivetab={setActivetab} searchResult={searchResult} searchapicall={searchapicall}/> */}
                    <div className={`showresultModal mt-2 ${searchloader ? 'showresultModalwhenloader' : 'showresultModalwhennotloader'}`}>

                        {/* {(store?.aisearchloader || store?.searchaiResults) && searchResult && (
                                        <div className="mt-3">
                                            <Card className="card card-preview">
                                                <div className="m-2">
                                                    <h4>AI Summary</h4>
                                                    <BlockHeadSub>powered by <strong>iDoks</strong></BlockHeadSub>
                                                    <div className="m-2">
                                                        {store?.aisearchloader ? (
                                                            <div className="placeholder-text">
                                                                <div className="placeholder-row-full-width"></div>
                                                                <div className="placeholder-row-full-width"></div>
                                                                <div className="placeholder-row-half-width"></div>
                                                            </div>
                                                        ) : (
                                                            store?.searchaiResults && (
                                                                <p style={{ fontSize: "15px" }} dangerouslySetInnerHTML={{ __html: store?.searchaiResults?.summary?.replace(/\n/g, '<br />') }} />
                                                                // <TypewriterText text={AIResults.summary} speed={10} />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    )} */}


                        {searchloader ? (
                            <div className="noResultsModal" style={{ display: 'flex', justifyContent: 'center' }}>
                                <Spinner size="sm" />
                            </div>
                        ) : searchResult && searchResult?.length != 0 ? (
                            <>
                                {searchResult.map((item, index) => (
                                    <div className="eachResult px-2" key={item._id || index} style={{ borderBottom: "1px solid #f0f0f0" }}>


                                        <Breadcrumb className="breadcrumb-arrow">
                                            {item._source.hierarchy.length > 3 ? printBreadCrumbs(item._source.hierarchy) : item._source.hierarchy.map((bitem, idx) => (

                                                <BreadcrumbItem
                                                    key={bitem._id}
                                                    active={idx == item._source.hierarchy.length - 1}>
                                                    {idx == item._source.hierarchy.length - 1 ?
                                                        (
                                                            bitem['name']
                                                        ) :
                                                        (
                                                            <a href={`#${bitem['link']}`}>{bitem['name']}</a>
                                                        )}
                                                </BreadcrumbItem>
                                            ))}
                                        </Breadcrumb>

                                        <span className="title insideEachResult py-1">

                                            <span onClick={(e) => openFile(e, item?.['type'], item)}>
                                                {item.type == 'file' && <Icon name="file-docs" />}
                                                {item.type == 'form' && <Icon name="files-fill" />}
                                                {item.type == 'folder' && <Icon name="folder-list" />}
                                                &nbsp;{item._source.name}
                                            </span>

                                            <span className="tb-tnx-action">
                                                {item.type == 'file' && canshowsummary() && template.content!="" && <Icon name="graphql" title="AI Summary" style={{ marginRight: "1rem", cursor: 'pointer' }} onClick={(e) => onClickAISUmmary(e, item)}></Icon>}
                                                <Icon name="setting-alt mr-2" onClick={(e) => onClickSearchRecords(e, item)} />
                                                {item.type != 'form' && (<Icon name="download" onClick={(e) => downloadDoc(e, item)} />)}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="noResultsModal">
                                <img src={Nodata} alt="NoData" width={200} height={200} />
                                <p>No Results Matched</p>
                            </div>
                        )}

                    </div>
                </>
            }


            <Modal isOpen={viewerModal} size="lg" toggle={toggleViewerModal}>
                <Viewer toggle={toggleViewerModal} file={viewDoc} codeContent={codeContent} videoDuration={videoDuration} />
            </Modal>

            {imageFlag && <Lightbox
                medium={`${process.env.REACT_APP_BE_URL}/file/documents/${imageFile.id}/${localStorage.getItem("workspace_id")}`}
                large={`${process.env.REACT_APP_BE_URL}/file/documents/${imageFile.id}/${localStorage.getItem("workspace_id")}`}
                alt={imageFile.name}
                hideZoom={true}
                hideDownload={false}
                onClose={() => setImageFlag(false)}
            />}

            <Modal
                id="search-modal"
                isOpen={aiModal}
                size="xl"
                toggle={() => setaiModal(!aiModal)}
            >
                <div>
                    {aiLoader ? (
                        <div className="mt-3 mb-5">
                            <div className="m-2">
                                <h4>AI Summary</h4>
                                <BlockHeadSub>powered by <strong>iDoks</strong></BlockHeadSub>
                                <h6 className="fw-light">{aiclickedfilename}</h6>
                                <div className="m-2 placeholder-text">
                                    <div className="placeholder-row-full-width"></div>
                                    <div className="placeholder-row-full-width"></div>
                                    <div className="placeholder-row-half-width"></div>
                                </div>
                            </div>
                        </div>
                    ) : aiResult?.summary ? (
                        <div className="mt-3 mb-5">
                            <div className="m-2">
                                <h4>AI Summary</h4>
                                <BlockHeadSub>powered by <strong>iDoks</strong></BlockHeadSub>
                                <h6 className="fw-light">{aiclickedfilename}</h6>
                                <div className="m-2">
                                    <p style={{ fontSize: "15px" }} dangerouslySetInnerHTML={{ __html: aiResult.summary.replace(/\n/g, '<br />') }} />
                                    {/* <TypewriterText text={AIResults.summary} speed={10} /> */}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </Modal>

        </div>
    )
}

export default SearchModal
