import React, { useEffect, useState, useCallback, useRef } from "react"
import Body from "./components/Body"
import { BlockHeadSub, BlockTitle, Icon } from "../../../components/Component"
import Layout from "./components/Layout"
import { useSelector, useDispatch } from 'react-redux'
import { Badge, Button, Card, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Modal, Spinner, TabContent, TabPane } from "reactstrap"
import * as API from '../../../utils/API'
import toast from "react-hot-toast"
import { SearchTable } from "./components/Search/SearchTable"
import { disableSearchModal, saveSearch, saveSearchPagination } from "../../../redux/folderSlice"
import { defaultMetaData, getFileType } from "../../../utils/helper"
import SearchFilters from "./components/Search/SearchFilters"
import SearchTabs from "./components/Search/SearchTabs"
import { useLocation, useNavigate } from "react-router"
import axios from 'axios';
import NoSearch from '../../../assets/images/search/nosearch.svg'
import Nodata from '../../../assets/images/search/nodata.svg'
import moment from "moment"
import { DebounceInput } from 'react-debounce-input';
import Swal from "sweetalert2"

let cancelTokenSource;
let aicancelTokenSource;

const FileManagerSearch = () => {

    const dispatch = useDispatch();

    const store = useSelector(state => state.folders)
    const uploadStore = useSelector(state => state.upload)
    const hasMounted = useRef(false)
    const location = useLocation()
    const navigate = useNavigate()
    const historyPickerRef = useRef(null)

    const [toastId, setToastId] = useState(null)

    //tabs
    const [activeTab, setActivetab] = useState("All")

    //pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemPerPage, setItemPerPage] = useState(10);
    const [totalCount, settotalCount] = useState(0)
    const [perPage, setperPage] = useState(0)


    //enter key - history
    const [showHistory, setShowHistory] = useState(false)
    const [searchHistory, setSearchHistory] = useState([])


    //results 
    const [searchloader, setSearchLoader] = useState(false)
    const [searchResult, setSearchResult] = useState(null)
    const [aiLoader, setAILoader] = useState(false)
    const [aiResult, setAIResult] = useState(null)
    // const [isAIRevealed, setisAIRevealed] = useState(false)


    var canshowsummary = JSON.parse(localStorage.getItem('appFeatures'))?.aisummary
    //searchFilters - to send to api
    const [searchFilters, setSearchFilters] = useState({
        searchTerm: '',
        searchIn: [],

        fullpath: [],
        directory: [],
        // sharedIds: [],

        meta: {
            defaultMetaDataValues: null,
            customMetaDataValues: null
        },
        createdTime: [],
        updatedTime: []
    })


    useEffect(() => {

        const fetchData = async () => {
            if (hasMounted.current) {
            } else {
                hasMounted.current = true
            }

            // const searchModal = document.querySelector('#search-modal')
            // searchModal && (dispatch(disableSearchModal()))
            // debugger
            // dispatch(disableSearchModal())

            //Folder Detecting - we will store in state as well in redux state
            // var fullDir = JSON.parse(localStorage.getItem('currentBreadCrumb')) || []
            // var tempDir = fullDir.filter(item => item['type'] != 'file' && item['type'] != 'form').slice(-1) || []


            // if (location.pathname == '/starred') {
            //     setCurrentDirectory([])
            //     return
            // }

            // if (location.pathname == '/shared') {
            //     setCurrentDirectory(tempDir)
            //     return
            // }

            // setCurrentDirectory(tempDir)

            // await searchapicall()

            // const savedSearchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []
            // savedSearchHistory.length > 0 && (setSearchHistory(savedSearchHistory))

        }

        // fetchData()

        // document.addEventListener("mousedown", handleClickOutside)
        // return () => {
        //     document.removeEventListener("mousedown", handleClickOutside)
        // }
    }, [])//currentPage, itemPerPage


    // const handleClickOutside = (event) => {
    //     if (historyPickerRef.current && !historyPickerRef.current.contains(event.target)) {
    //         setShowHistory(false)
    //     }
    // }


    // history - enter key calls
    // const storeSearchHistory = async (searchTerm) => {

    //     const newSearchTerm = searchTerm.trim()

    //     if (!newSearchTerm) return

    //     let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []

    //     searchHistory = searchHistory.filter((term) => term != newSearchTerm)

    //     searchHistory.unshift(newSearchTerm)

    //     if (searchHistory.length > 10) {
    //         searchHistory = searchHistory.slice(0, 10)
    //     }

    //     localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
    //     setSearchHistory(searchHistory)
    // }

    // const handleSearchKey = async (e) => {
    //     if (e.key == 'Enter') {
    //         e.preventDefault()

    //         dispatch(saveSearch(e.target.value))
    //         setShowHistory(false)

    //         if (e.target.value != '') {
    //             await setUpPayload()
    //             await handleMainSearchPage()
    //         }
    //     }
    // }

    // const handleHistory = async (e, item) => {
    //     e.preventDefault()
    //     e.stopPropagation();

    //     dispatch(saveSearch(item))
    //     await setUpPayload()
    //     // handleMainSearchPage()
    //     setShowHistory(false)
    // }


    //API calls - necessay functions
    // const setUpPayload = async () => {
    //     try {
    //         const searchTerm = store.search
    //         await storeSearchHistory(searchTerm)

    //         searchFilters['searchTerm'] = searchTerm

    //         //directory & fullpath setting in payload
    //         var fullDir = JSON.parse(localStorage.getItem('currentBreadCrumb')) || []
    //         const hasShared = fullDir.length == 1 && fullDir.some(item => item.name == "Shared")
    //         if (hasShared) {
    //             searchFilters['directory'] = ['shared']
    //             searchFilters['fullpath'] = fullDir.shift()
    //         }
    //         else {
    //             searchFilters['directory'] = searchFilters['directory']
    //             searchFilters['fullpath'] = fullDir
    //         }

    //         if (searchFilters['directory']?.length == 0) {
    //             searchFilters['fullpath'] = []
    //         }

    //         if (currentDirectory?.length == 0) {
    //             searchFilters['directory'] = []
    //             searchFilters['fullpath'] = []
    //         }


    //         // if (searchFilters['directory']) {

    //         //     if () {

    //         //         // searchFilters['sharedIds'] = []
    //         //     }
    //         //     else {

    //         //         //TO GET THE CHILD LEVELS USE BELOW CODE
    //         //         let childlevels = []

    //         //         var sharedLevels = []
    //         //         store?.['myHierarchy'].map(item => {
    //         //             if (item['value'] == 'shared') {
    //         //                 sharedLevels.push(item)
    //         //             }
    //         //         })

    //         //         const sharedIds = await findSharedIds(sharedLevels, searchFilters['directory'])
    //         //         searchFilters['sharedIds'] = sharedIds


    //         //         for (var selectedValues of searchFilters['directory']) {
    //         //             let a = []
    //         //             const parentNode = await findNode(store?.['myHierarchy'], selectedValues)
    //         //             const hasChildren = parentNode?.['children']?.length != 0
    //         //             a = hasChildren ? await getChildValues(parentNode) : selectedValues

    //         //             if (hasChildren) {
    //         //                 a.unshift(parentNode['value'])
    //         //                 childlevels.push(...a)
    //         //             }
    //         //             else {
    //         //                 childlevels.push(a)
    //         //             }

    //         //         }

    //         //         searchFilters['directory'] = childlevels
    //         //     }

    //         // }

    //         if (searchFilters['createdTime']) {
    //             searchFilters['createdTime'] = await toUTC(searchFilters['createdTime'])
    //         }

    //         if (searchFilters['endTime']) {
    //             searchFilters['endTime'] = await toUTC(searchFilters['endTime'])
    //         }
    //     }
    //     catch (err) {
    //         showToast('While SetUpPayload some Error Occured', 'error')
    //     }
    // }

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

    // const checkForStandards = async (path) => {

    //     let a = false, b = false
    //     path.forEach(item => {
    //         if (item.name.toLowerCase() == 'shared') {
    //             a = true
    //         }
    //         if (item.name.toLowerCase() == 'starred') {
    //             b = true
    //         }
    //     })
    //     return { a, b }
    // }


    const fetchOpenAI = (search_summary, searchterm) => {

        let searchTerm = searchterm

        if (aicancelTokenSource) {
            aicancelTokenSource.cancel("Previous Request Cancelled")
        }

        aicancelTokenSource = axios.CancelToken.source()

        // { cancelToken: cancelTokenSource.token }

        try {
            setAILoader(true)
            // const AIResponse = await API.getAIResult(searchTerm, search_summary)

            axios
                .post(`${process.env.REACT_APP_BE_URL}/AIsearch`, {
                    searchTerm, search_summary,

                }, { cancelToken: aicancelTokenSource.token })
                .then(res => {
                    const { status, data } = res.data
                    if (status) {

                        setAIResult(data)
                        setAILoader(false)
                    }
                })
                .catch((err) => {

                    setAILoader(false)
                    setAIResult(null)
                    let msg = err?.response?.data?.message || "Some Error occurred in AI Search ! Refresh and Try Again"

                    if (msg?.includes("Request too large") || msg.includes('maximum context')) {
                        return;
                        // msg = "Request Size is Too large. Please Reduce the Input or Output Tokens and Try Again"
                    }
                    // showToast(`${msg}`.replace(/\b\w/g, char => char.toUpperCase()), "error")
                    return
                })


            // if (!AIResponse?.status) {
            //     setAILoader(false)
            //     setAIResult(null)
            //     let msg = AIResponse['message'] || "Some Error occurred in AI Search ! Refresh and Try Again"

            //     if (msg?.includes("Request too large") || msg.includes('maximum context')) {
            //         return;
            //         // msg = "Request Size is Too large. Please Reduce the Input or Output Tokens and Try Again"
            //     }
            //     // showToast(`${msg}`.replace(/\b\w/g, char => char.toUpperCase()), "error")
            //     return
            // }

            // if (AIResponse?.status) {
            //     setAIResult(AIResponse.data)
            //     setAILoader(false)
            // }

        } catch (error) {
            // showToast("Failed to Fetch AI Summary!", "error")
            setAILoader(false)
            setAIResult(null)
        }

    }

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

    // async function findSharedIds(hierarchy, selectedValues) {
    //     const sharedNode = hierarchy.find(node => node.value == "shared")
    //     if (!sharedNode) return []

    //     const result = []

    //     async function traverse(nodes) {
    //         for (const node of nodes) {
    //             if (selectedValues.includes(node.value)) {
    //                 result.push(node.value)
    //             }
    //             if (node.children.length > 0) {
    //                 await traverse(node.children)
    //             }
    //         }
    //     }

    //     await traverse(sharedNode.children)
    //     return result
    // }

    // async function getChildValues(node) {
    //     if (!node?.children) return [];

    //     let acc = [];

    //     for (const child of node.children) {
    //         let a = await getChildValues(child);
    //         acc.push(child.value, ...a);
    //     }

    //     return acc;
    // }

    // async function findNode(data, target) {

    //     for (const node of data) {
    //         if (node.value == target) return node
    //         const found = await findNode(node.children || [], target)
    //         if (found) return found
    //     }

    //     return null
    // }


    const handleMainSearchPage = (payload) => {
        if (!payload) return
        if (payload['searchTerm'].trim() === "") return

        if (cancelTokenSource) {
            cancelTokenSource.cancel("Previous Request Cancelled")
        }

        cancelTokenSource = axios.CancelToken.source()

        setShowHistory(false)
        setSearchLoader(true)

        //SYNCHRONOUS CALL
        try {
            setAIResult(null)
            axios.post(
                // `${process.env.REACT_APP_BE_URL}/search`,
                // payload,
                // currentPage,
                // itemPerPage,
                // cancelTokenSource.token

                `${process.env.REACT_APP_BE_URL}/search`,
                { payload, page: payload?.['page'] || currentPage, pageSize: itemPerPage },
                { cancelToken: cancelTokenSource.token }

            )
                .then(async (searchResponse) => {

                    const { status, message, data, totalCount } = searchResponse['data']


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
                        // dispatch(
                        //     saveSearchPagination({
                        //         currentPage: 1,
                        //         perPage: 10,
                        //         totalCount: totalCount || 0,
                        //     })
                        // )

                        // setCurrentPage(1)
                        setperPage(10)
                        settotalCount(totalCount || 0)
                    }


                    if (currentPage == 1) {
                        if (canshowsummary) {
                            doAIThings(data, payload['searchTerm'])
                        }
                    }

                }).catch((err) => {
                    if (axios.isCancel(err)) {

                    }
                    else {
                        console.log(err, "err")
                        // showToast(`${err.response?.data?.message || 'An Error Occurred'}`.replace(/\b\w/g, (char) => char.toUpperCase()), 'error')
                        return
                    }
                })
        }
        catch (error) {
            if (axios.isCancel(error)) {
            }
            else {
                // setSearchLoader(false)
                // setSearchResult(null)
                // showToast(`${error?.message || "An Unexpected Error Occurred"}`.replace(/\b\w/g, (char) => char.toUpperCase()), 'error')
                showToast("Error During Search" || err, "error")
                return
            }
        }
    }

    const doAIThings = (data, searchterm) => {
        if (!data) return;
        let pick = 3
        const formattedResults = data
            ?.filter(item => item?.type != "folder" && item?.type != "form")
            .filter(item => item?._source?.content != '')
            .slice(0, pick)
            .map(item => {
                if (item.type == 'file') {
                    debugger;
                    var inner_hit_content = [];
                    const title = item?._source?.name || "Untitled"
                    const docType = getFileType(item?._source?.fileType);
                    if (docType != "excel" && typeof item.inner_hits !== "undefined" && typeof item.inner_hits.chunk_data !== "undefined") {
                        if (typeof item.inner_hits.chunk_data.hits !== "undefined" && item.inner_hits.chunk_data.hits.hits.length > 0) {
                            for (let info of item.inner_hits.chunk_data.hits.hits) {
                                inner_hit_content.push(info._source.content)
                            }
                            inner_hit_content = inner_hit_content.join("\n")
                            return `Title: ${title}\nContent: ${inner_hit_content}\n`
                        }
                    }
                    const content = item?._source?.content || "No content available"
                    return `Title: ${title}\nContent: ${content}\n`
                }
            }).join('\n')


        if (formattedResults != '') {
            fetchOpenAI(formattedResults, searchterm)
        }
        else {
            setAILoader(false)
            setAIResult(null)
        }

    }


    const handlePagination = (pageNumber) => setCurrentPage(pageNumber)


    // const removeCurrentDirectory = async (e, id) => {
    //     e.stopPropagation()
    //     e.preventDefault()

    //     localStorage.removeItem('currentBreadCrumb');
    //     let newCurrentDirectory = currentDirectory.filter(item => item['_id'] != id)
    //     setCurrentDirectory(newCurrentDirectory)
    // }



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
        setCurrentPage(payload['page'] || 1)
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

        handleMainSearchPage(payload)
    }

    const showSubscriptionAlert = () => {
        const workspace = store?.myworkspace?.find(work => work?._id == localStorage.getItem("workspace_id"))
        const planDetails = workspace?.planDetails


        const text = planDetails?.isActivePlan == false
            ? 'Your Subscription has Expired. Please select a subscription plan to continue'
            : 'Your current plan does not allow this action. Please Upgrade to continue'

        const isUpgradeAllowed = store?.myworkspace?.some(work => localStorage.getItem("workspace_id") == work._id.toString() && work.owner == work.userinfo.userId && work.owner == localStorage.getItem('userId'))


        Swal.fire({
            title: 'Subscription Required',
            text: text,
            icon: 'warning',
            showCancelButton: isUpgradeAllowed,
            confirmButtonText: isUpgradeAllowed ? 'Upgrade Now' : 'OK',
            cancelButtonText: isUpgradeAllowed ? 'Maybe Later' : '',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        }).then((result) => {
            if (isUpgradeAllowed && result.isConfirmed) {
                window.location.href = `/#/${localStorage.getItem('workspace_id')}/workspace-subscription`
            }
        })
    }

    return (
        <Layout>
            <div className="nk-fmg-body-content">
                {/* <Body viewFilter={false}> */}
                {/* <div className="nk-fmg-body-head d-lg-flex draw-searchborder"> */}

                {/* <div className="nk-fmg-search">
                        <Icon name="search"></Icon>

                        {currentDirectory && currentDirectory?.map((item) => (
                            <div id="searchInBadgeId" key={item._id} style={{ display: "inline-block", margin: "5px" }}>
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
                            inputRef={historyPickerRef}
                            type="text"
                            className="form-control border-transparent form-focus-none"
                            placeholder="Search"
                            value={store.search}
                            style={true ? { fontSize: "1.5rem" } : { width: '90%', fontSize: "15px" }}
                            onClick={() => {
                                setShowHistory(store.search == '')
                            }}
                            onChange={async (e) => {
                                e.preventDefault();
                                dispatch(saveSearch(e.target.value))
                                setShowHistory(false)
                            }}
                            onKeyDown={handleSearchKey}
                        />


                        NORMAL INPUT
                        <input
                            ref={historyPickerRef}
                            type="text"
                            className="form-control border-transparent form-focus-none"
                            placeholder="Search"
                            value={store.search}
                            style={true ? { fontSize: "1.5rem" } : { width: '90%', fontSize: "15px" }}
                            onClick={() => {
                                setShowHistory(store.search == '')
                            }}
                            onChange={async (e) => {
                                e.preventDefault();
                                dispatch(saveSearch(e.target.value))
                                setShowHistory(false)
                            }}
                            onKeyDown={handleSearchKey}
                        />

                        <span class="custom-notification"
                            onClick={async (e) => {
                                e.stopPropagation();
                                e.preventDefault();

                                dispatch(saveSearch(''))
                                setShowHistory(false)
                            }}>
                            <Icon name="cross-circle-fill" style={{ fontSize: "1.5rem" }} />
                        </span>
                    </div> */}

                {/* </div> */}
                {/* {showHistory &&
                    <Card className='searchPageSearchHistory'>
                        {searchHistory.length > 0 ? (
                            <div className=" mb-2 ">
                                {searchHistory.map((item, index) => (
                                    <span key={index} className="px-2 py-1 d-flex align-items-center searchHistory"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => handleHistory(e, item)}><Icon name="history" /> &ensp;{item}</span>
                                ))}
                            </div>
                        ) : (
                            <div className="m-5" style={{ textAlign: "center" }}>
                                <img src={NoSearch} alt="NoSearch" width={250} height={250} />
                                <p>No Items Searched!</p>
                            </div>
                        )}
                    </Card>
                } */}

                {/* <SearchTabs activeTab={activeTab} setActivetab={setActivetab} /> */}
                <div className="my-2">

                    <SearchFilters
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemPerPage={itemPerPage}
                        // setItemPerPage={setItemPerPage}

                        showHistory={showHistory}
                        setShowHistory={setShowHistory}
                        searchHistory={searchHistory}
                        setSearchHistory={setSearchHistory}
                        searchapicall={searchapicall}
                        toggle={() => null}
                        searchResult={searchResult}
                    // setSearchFilters={setSearchFilters} 
                    // currentDirectory={currentDirectory} setCurrentDirectory={setCurrentDirectory} 
                    />
                </div>

                {/* <div className="m-2">
                    <TabContent activeTab={activeTab}>
                        <TabPane tabId="All">
                            
                        </TabPane>
                        <TabPane tabId="Images">
                            <p> Some text for Images </p>
                        </TabPane>
                        <TabPane tabId="Videos">
                            <p> Some text for Videos </p>
                        </TabPane>
                        <TabPane tabId="DOC">
                            <p> Some text for Doc </p>
                        </TabPane>

                        <TabPane tabId="PDF">
                            <p> Some text for PDF </p>
                        </TabPane>

                        <TabPane tabId="PPT">
                            <p> Some text for PPT </p>
                        </TabPane>
                    </TabContent>

                </div> */}

                <>
                    {aiLoader ? (
                        <div className="mt-3 mb-5">
                            <Card className="card-bordered card-preview">
                                <div className="m-2">
                                    <h4>AI Summary</h4>
                                    <BlockHeadSub>powered by <strong>iDoks</strong></BlockHeadSub>
                                    <div className="m-2 placeholder-text">
                                        <div className="placeholder-row-full-width"></div>
                                        <div className="placeholder-row-full-width"></div>
                                        <div className="placeholder-row-half-width"></div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ) :
                        canshowsummary == false ? (
                            <div className="d-flex justify-content-end mb-2">
                                <Button color="light" onClick={showSubscriptionAlert}>
                                    <Icon name="graphql" title="AI Summary"></Icon>
                                    <span>Ask AI</span>
                                </Button>
                            </div>
                        ) :
                            aiResult?.summary ? (
                                <div className="mt-3 mb-5">
                                    <Card className="card-bordered card-preview">
                                        <div className="m-2">
                                            <h4>AI Summary</h4>
                                            <BlockHeadSub>powered by <strong>iDoks</strong></BlockHeadSub>
                                            <div className="m-2">
                                                <p style={{ fontSize: "15px" }} dangerouslySetInnerHTML={{ __html: aiResult.summary.replace(/\n/g, '<br />') }} />
                                                {/* <TypewriterText text={AIResults.summary} speed={10} /> */}
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ) : null}



                    {searchloader ? (
                        <div className="noResults" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Spinner size="sm" />
                        </div>
                    ) : searchResult && searchResult?.length != 0 ? (
                        <Card className="card-bordered card-preview">
                            <SearchTable
                                action={true}
                                data={searchResult}
                                perPage={perPage}
                                totalCount={totalCount}
                                handlePagination={handlePagination}
                                currentPage={currentPage}
                            />
                        </Card>
                    ) : (
                        <div className="noResults">
                            <img src={Nodata} alt="NoData" width={200} height={200} />
                            <p>No Results Matched</p>
                        </div>
                    )}
                </>


                {/* </Body> */}
            </div>


        </Layout >
    )
}

export default FileManagerSearch