import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, Card, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink, UncontrolledDropdown } from "reactstrap";
import { Icon } from "../../../../../components/Component";
import { useLocation, useNavigate } from "react-router";
import * as API from '../../../../../utils/API'
import { defaultMetaData } from "../../../../../utils/helper"
import DatePicker from "react-datepicker";
import makeAnimated from 'react-select/animated';
import Select from "react-select";
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useTheme } from "../../../../../layout/provider/Theme";
import { useSelector } from "react-redux";
import { CheckTree } from "rsuite";
import { disableSearchModal, saveMyHierarchy, saveMyHierarchyIDS, saveSearch, setUpfilterEnabledInSearchModal } from "../../../../../redux/folderSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import _, { update } from 'lodash';
import { DebounceInput } from "react-debounce-input";
import NoSearch from '../../../../../assets/images/search/nosearch.svg'
import classnames from "classnames";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const SearchFilters = ({ toggle,
    searchapicall,
    // setSearchFilters, 
    // currentDirectory, setCurrentDirectory
    showHistory, setShowHistory,
    searchHistory, setSearchHistory,
    currentPage, setCurrentPage,
    itemPerPage, setItemPerPage,
    searchResult
}) => {


    // const [activetab, setActivetab] = useState("All")

    const location = useLocation()
    const animatedComponents = makeAnimated()
    const theme = useTheme()
    const navigate = useNavigate();
    const hasCustomMetaAPICalled = useRef(false)
    const dispatch = useDispatch()
    let inputRef = useRef(null)


    const [searchTerm, setSearchTerm] = useState('')
    const [currentDirectory, setCurrentDirectory] = useState([])


    //type
    const [istypeFilterClicked, setIstypeFilterClicked] = useState(false)
    const [typeOptions, settypeOptions] = useState([])//typeOptions
    const [selectedtype, setSelectedtype] = useState("All")//store type result 
    const typeDropdownref = useRef(null)
    const typeBadgeRef = useRef(null)
    const [typeDropdownStyle, setypeDropdownStyle] = useState({})



    //SearchIn
    const [isSearchInFilterClicked, setIsSearchInFilterClicked] = useState(false)
    const [searchInOptions, setSearchInOptions] = useState([])//searchInOptions
    const [selectedSearchIn, setSelectedSearchIn] = useState([])//store searchIn result 
    const searchInDropdownref = useRef(null)
    const searchInBadgeRef = useRef(null)
    const [searchInDropdownStyle, setsearchInDropdownStyle] = useState({})


    //Folders
    const [isFoldersFilterClicked, setIsFoldersFilterClicked] = useState(false);
    const [folderLevels, setFolderLevels] = useState([])//folder all levels storing
    const foldersDropdownRef = useRef(null);
    const foldersBadgeRef = useRef(null)
    const [folderDropdownStyle, setFolderDropdownStyle] = useState({})
    const [folderOptions, setFolderOptions] = useState([])

    const sortOrder = localStorage.getItem('sortOrder') || 'desc'
    const sortBy = localStorage.getItem('sortBy') || 'createdAt'
    const [loader, setLoader] = useState(false)
    const store = useSelector(state => state.folders)
    const currentSection = useSelector(state => state.folders.currentSection);



    //metaData
    const [ismetaDataFilterClicked, setIsMetaDataFilterClicked] = useState(false);
    const [selectedMetaData, setSelectedMetaData] = useState(0)//store metaData result 
    const metaDataDropdownRef = useRef(null);
    const metaDataBadgeRef = useRef(null)
    const [metaDataDropdownStyle, setMetaDataDropdownStyle] = useState({})

    const [docTypeOptionsData, setDocTypeOptionsData] = useState([])
    const [keywordOptionsData, setKeywordOptionsData] = useState([])

    const [secdocTypeOptionsData, setsecDocTypeOptionsData] = useState([])

    const [defaultMetaDataList, setDefaultMetaDataList] = useState([])
    const [selectedDefaultMetaDataList, setSelectedDefaultMetaDataList] = useState([])
    const [defaultMetaDataValues, setDefaultMetaDataValues] = useState({})//store defaultmeta values


    const [customMetaDataList, setCustomMetaDataList] = useState([])
    const [selectedCustomMetaDataList, setSelectedCustomMetaDataList] = useState([])
    const [customMetaDataValues, setCustomMetaDataValues] = useState({})//store custommeta values
    const [dropdownOpen, setDropdownOpen] = useState(false)


    //CreatedTime
    const [isCreatedTimeClicked, setIsCreatedTimeClicked] = useState(false);
    const [selectedCreatedTime, setSelectedCreatedTime] = useState([])//store time value
    const createdTimeDropdownRef = useRef(null);
    const createdTimeBadgeRef = useRef(null)
    const [createdTimeDropdownStyle, setcreatedTimeDropdownStyle] = useState({})


    //LastUpdateTime
    const [isLastUpdateTimeClicked, setIsLastUpdateTimeClicked] = useState(false);
    const [selectedLastUpdateTime, setSelectedLastUpdateTime] = useState([])//store lastUpdateTime result
    const LastUpdateTimeDropdownRef = useRef(null);
    const LastUpdateTimeBadgeRef = useRef(null)
    const [LastUpdateTimeDropdownStyle, setLastUpdateTimeDropdownStyle] = useState({})


    //enter key - history

    const hasMounted = useRef(false)


    const reactSelectCustomStyles = {
        control: (base) => ({
            ...base,
            border: "1px solid #ced4da",
            borderRadius: "4px",
            minHeight: "38px",
            boxShadow: "none",
            width: "278px",
            "&:hover": {
                border: "1px solid #86b7fe",
            },
        }),
        valueContainer: (base) => ({
            ...base,
            padding: "0 8px",
        }),
        input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
        }),
        dropdownIndicator: (base) => ({
            ...base,
            padding: "4px",
        }),
        clearIndicator: (base) => ({
            ...base,
            padding: "4px",
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#e9ecef" : "#fff",
            color: "#495057",
            "&:active": {
                backgroundColor: "#e9ecef",
            },
        }),
        menu: (base) => ({
            ...base,
            zIndex: 100000000000,
            position: "absolute",
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "8rem",
            display: "block"
        }),
        container: (base) => ({
            ...base,
            width: '100%'
        }),
    };


    useEffect(() => {

        const searchModal = document.querySelector('#search-modal')
        searchModal && (dispatch(disableSearchModal()))

        setSearchInOptions([
            {
                id: 1, name: "Name",
            },
            {
                id: 2, name: "MetaData",
            },
            {
                id: 3, name: "Contents"
            }
        ])

        settypeOptions([
            {
                id: 'PDF', name: "PDF Document",
            },
            {
                id: 'WORD', name: "Word Document",
            },
            {
                id: 'EXCEL', name: "Excel Document"
            }
        ])

        if (inputRef.current) {
            inputRef.current.focus();
        }




        // console.log(currentDirectory, "currentDirectory")

        const fetchFoldersAndMeta = async () => {
            // await getMyFolders()

            // let a = JSON.parse(JSON.stringify(store?.myHierarchy))
            // a.visible = true;
            // setFolderOptions(a)

            // let clonedata = _.cloneDeep(store?.myHierarchy)
            // setFolderOptions(clonedata)

            await intialStartDefaultMetaData()
            await fetchMetaListAPIs()
        }
        fetchFoldersAndMeta()

        const savedSearchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []
        savedSearchHistory.length > 0 && (setSearchHistory(savedSearchHistory))


        //Folder Detecting - we will store in state as well in redux state
        if (location.pathname != '/search') {

            var tempDir = _.cloneDeep(store?.searchCurrentDirectory)
            tempDir = tempDir.filter(item => (item.type !== 'file' && item.type !== 'form') || item._id == "null") || []
            // console.log(tempDir, "tempDir")

            if (tempDir.length != 1) {
                var arr = []
                arr.push(tempDir[0])
                arr.push(tempDir[tempDir.length - 1])

                setCurrentDirectory(arr)
            }
            else {
                setCurrentDirectory(tempDir)
            }


            if (location.pathname == '/starred') {
                setCurrentDirectory([])
                // return
            }

            if (location.pathname == '/shared') {
                setCurrentDirectory(tempDir)
                // return
            }

            if (tempDir.length == 0) {
                setCurrentDirectory([])
            }

        }


        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            dispatch(setUpfilterEnabledInSearchModal({ filter: '' }))
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])



    //folderLevels
    // useEffect(() => {
    //     const fetchData = async () => {
    //         var selectedValues = currentDirectory?.map(a => a?._id)
    //         var val = []
    //         if (selectedValues) {
    //             val = selectedValues
    //         }

    //         setFolderLevels(val)
    //         // setSearchFilters(prev => ({ ...prev, directory: val }))

    //     }

    //     fetchData()
    // }, [currentDirectory])



    //to show count in meta badge 
    useEffect(() => {
        const countMeta = () => {
            let metaCount = 0

            if (defaultMetaDataValues) {
                metaCount += countFilledValuesNormal(defaultMetaDataValues)
            }

            if (customMetaDataValues) {
                metaCount += countFilledValuesNormal(customMetaDataValues)
            }
            setSelectedMetaData(metaCount)
        }

        countMeta()
    }, [defaultMetaDataValues, customMetaDataValues])


    const encode = async (obj) => {
        return new Promise((resolve) => {
            const queryParams = Object.keys(obj).map(key => {

                const filter = obj[key].filter
                let value = obj[key].value

                if (filter == "is" || filter == "is not") {
                    value = encodeURIComponent(value)
                }
                else {
                    value = value.map(v => encodeURIComponent(v)).join(",")
                }

                return `${encodeURIComponent(key)}[filter]=${encodeURIComponent(filter)}&${encodeURIComponent(key)}[value]=${value}`
            }).join("&")

            resolve(queryParams)
        })
    }

    const decode = async (queryString) => {
        return new Promise((resolve) => {
            const params = new URLSearchParams(queryString)
            const result = {}

            params.forEach((value, key) => {
                const [field, subfield] = key.split('[').map(k => k.replace(']', ''))

                if (!result[field]) {
                    result[field] = {}
                }

                if (subfield == 'filter') {
                    result[field].filter = decodeURIComponent(value)
                }
                else if (subfield == 'value') {
                    if (result[field].filter == 'is' || result[field].filter == 'is not') {
                        result[field].value = decodeURIComponent(value)
                    }
                    else {
                        const decodedValues = value.split(',').map(v => decodeURIComponent(v))
                        result[field].value = decodedValues.length == 1 && decodedValues[0] == '' ? [] : decodedValues
                    }
                }
            })

            resolve(result)
        })
    }

    const removeCurrentDirectory = async (e, id) => {
        e.stopPropagation()
        e.preventDefault()

        let newCurrentDirectory = currentDirectory.filter(item => item['_id'] != id)
        setCurrentDirectory(newCurrentDirectory)
        updateQueryParam({
            searchTerm,
            selectedtype,
            selectedSearchIn,
            defaultMetaDataValues,
            customMetaDataValues,
            selectedCreatedTime,
            selectedLastUpdateTime,
            currentDirectory: newCurrentDirectory
        })
    }

    // useEffect(() => {

    //     const setUpPramasData = async () => {

    //         if (location.pathname == "/search") {

    //             //if filter is present in store take it else take from params -> for mounting time only
    //             if (store['filterEnabledInSearchModal'] != '') {
    //                 navigate(`/search?${store['filterEnabledInSearchModal']}`, { replace: true })
    //                 return
    //             }

    //             var newUrl = await setUpURL()
    //             // newUrl = `/search?${newUrl}`
    //             // navigate(newUrl, { replace: true })
    //         }
    //         else {
    //             var newUrl = await setUpURL()
    //             dispatch(setUpfilterEnabledInSearchModal({ filter: newUrl }))
    //         }
    //     }
    //     setUpPramasData()
    // }, [
    //     store['search'],
    //     selectedSearchIn,
    //     folderLevels,
    //     defaultMetaDataValues,
    //     customMetaDataValues,
    //     selectedCreatedTime,
    //     selectedLastUpdateTime,
    //     location.pathname,
    //     navigate
    // ])

    const fetchDataFromParams = async (pagenumber) => {
        if (location.pathname == "/search") {

            let payloaddata = {
                searchTerm: "",
                selectedtype: [],
                selectedSearchIn: [],
                defaultMetaDataValues: {},
                customMetaDataValues: {},
                selectedCreatedTime: [],
                selectedLastUpdateTime: [],
                currentDirectory: []
            }

            const params = new URLSearchParams(location.search)
            const decodedSearch = params.get("searchTerm")
            const decodedSearchIn = params.get("selectedSearchIn")
            const decodedtype = params.get("selectedtype")
            const currentDirectoryVal = params.get("currentDirectory")

            // const decodedFolderLevels = params.get("folderLevels")
            const decodedDefaultMetaDataValues = params.get("defaultMetaDataValues")
            const decodedCustomMetaDataValues = params.get("customMetaDataValues")
            const decodedselectCreatedTime = params.get("selectedCreatedTime")
            const decodedlastUpdtTimeValue = params.get("selectedLastUpdateTime")


            if (decodedSearch) {
                var searchdata = JSON.parse(decodeURIComponent(decodedSearch))
                setSearchTerm(searchdata)
                payloaddata['searchTerm'] = searchdata
                // setFormData({ ...formData, searchTerm: searchdata });
                //     setSearchFilters(prev => ({ ...prev, searchTerm: searchdata }))
            }

            if (decodedtype) {
                var typedata = JSON.parse(decodeURIComponent(decodedtype))
                setSelectedtype(typedata)
                payloaddata['selectedtype'] = typedata
                // setFormData({ ...formData, searchIn: searchIndata });
                //     setSearchFilters(prev => ({ ...prev, searchIn: searchIndata }))
            }
            if (decodedSearchIn) {
                var searchIndata = JSON.parse(decodeURIComponent(decodedSearchIn))
                setSelectedSearchIn(searchIndata)
                payloaddata['selectedSearchIn'] = searchIndata
                // setFormData({ ...formData, searchIn: searchIndata });
                //     setSearchFilters(prev => ({ ...prev, searchIn: searchIndata }))
            }
            if (currentDirectoryVal) {
                var currentDirectoryData = JSON.parse(decodeURIComponent(currentDirectoryVal))
                setCurrentDirectory(currentDirectoryData)
                payloaddata['currentDirectory'] = currentDirectoryData

                // setFormData({ ...formData, searchIn: searchIndata });
                //     setSearchFilters(prev => ({ ...prev, searchIn: searchIndata }))
            }
            // if (decodedFolderLevels) {
            //     var directoryData = JSON.parse(decodeURIComponent(decodedFolderLevels))
            //     setFolderLevels(directoryData)
            //     setSearchFilters(prev => ({ ...prev, directory: directoryData }))
            // }


            if (decodedDefaultMetaDataValues) {
                var defaultmetadata = await decode(decodedDefaultMetaDataValues)
                setDefaultMetaDataValues(defaultmetadata)
                payloaddata['defaultMetaDataValues'] = defaultmetadata

                // setSearchFilters(prev => ({ ...prev, meta: { ...prev.meta, defaultMetaDataValues: defaultmetadata } }))
            }
            if (decodedCustomMetaDataValues) {
                var data = await decode(decodedCustomMetaDataValues)
                setCustomMetaDataValues(data)
                payloaddata['customMetaDataValues'] = data


                // opened field
                var tempCustomMetaDataList = []
                if (customMetaDataList.length == 0) {
                    hasCustomMetaAPICalled.current = true
                    let customMetaDataFieldReponse = await API.getAllCustomMetaDataList()
                    if (customMetaDataFieldReponse['status'] && customMetaDataList.length == 0) {
                        tempCustomMetaDataList = customMetaDataFieldReponse['data']
                        setCustomMetaDataList(tempCustomMetaDataList)
                    }

                }
                else {
                    tempCustomMetaDataList = customMetaDataList
                }
                let customList = await findCustomList(tempCustomMetaDataList, data)
                setSelectedCustomMetaDataList(prevData => {
                    const filteredList = customList.filter(item =>
                        !prevData.some(existingItem => existingItem._id == item._id)
                    )
                    return [...prevData, ...filteredList]
                })


                tempCustomMetaDataList = customMetaDataList.filter(metaData => !customList.some(customItem => customItem._id == metaData._id))
                setCustomMetaDataList(tempCustomMetaDataList)
                // setSearchFilters(prev => ({ ...prev, meta: { ...prev.meta, customMetaDataValues: tempCustomMetaDataList } }))
            }
            if (decodedselectCreatedTime) {
                var cdaa = JSON.parse(decodeURIComponent(decodedselectCreatedTime)) || []
                if (cdaa.length) {
                    cdaa = [
                        {
                            startDate: new Date(cdaa?.[0]?.startDate),
                            endDate: new Date(cdaa?.[0]?.endDate),
                            key: "selection"
                        }
                    ]
                }
                setSelectedCreatedTime(cdaa)
                payloaddata['selectedCreatedTime'] = cdaa
                // setSearchFilters(prev => ({ ...prev, createdTime: cdaa }))
            }
            if (decodedlastUpdtTimeValue) {
                var udaa = JSON.parse(decodeURIComponent(decodedlastUpdtTimeValue)) || []
                if (udaa.length) {
                    udaa = [
                        {
                            startDate: new Date(udaa?.[0]?.startDate),
                            endDate: new Date(udaa?.[0]?.endDate),
                            key: "selection"
                        }
                    ]
                }
                setSelectedLastUpdateTime(udaa)
                payloaddata['selectedLastUpdateTime'] = cdaa
                // setSearchFilters(prev => ({ ...prev, updatedTime: udaa }))
            }

            if (location.pathname == '/search') {
                payloaddata["page"] = pagenumber;
                searchapicall(payloaddata)
            }
        }

    }

    useEffect(() => {

        fetchDataFromParams(1)

    }, [location.search, location.pathname, itemPerPage])

    useEffect(() => {

        fetchDataFromParams(currentPage)

    }, [currentPage])

    const handleClickOutside = (event) => {

        if (location.pathname == '/search') {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setShowHistory(false)
            }
        }



        // type
        // const isClickInsidetypeOptions = typeDropdownref.current && typeDropdownref.current.contains(event.target)
        // const isClickOntypeBadge = event.target.closest(".typeBadge")
        // const isClickOntypeCloseIcon = event.target.closest(".typeBadge .close-icon")

        // if (!isClickInsidetypeOptions && !isClickOntypeBadge && !isClickOntypeCloseIcon) {
        //     setIstypeFilterClicked(false)
        // }
        // else if (isClickOntypeBadge && !isClickOntypeCloseIcon) {

        //     setIstypeFilterClicked((prev) => {
        //         const nextState = !prev

        //         if (nextState && typeBadgeRef.current) {
        //             const badgeRect = typeBadgeRef.current.getBoundingClientRect()
        //             let modalRect = location.pathname.includes('search') ? typeBadgeRef.current.closest('.nk-fmg').getBoundingClientRect() : typeBadgeRef.current.closest("#search-modal").getBoundingClientRect()

        //             const leftOffset = badgeRect.left - modalRect.left
        //             let topOffset = location.pathname.includes('search') ? 0 : 20;

        //             let styleObj = {
        //                 position: "absolute",
        //                 left: `${leftOffset}px`,
        //             }

        //             if (topOffset != 0) {
        //                 styleObj.top = `${topOffset}%`;
        //             }

        //             setypeDropdownStyle(styleObj)


        //         }
        //         return nextState
        //     })

        // }



        // SearchIn
        const isClickInsideSearchInOptions = searchInDropdownref.current && searchInDropdownref.current.contains(event.target)
        const isClickOnSearchInBadge = event.target.closest(".searchInBadge")
        const isClickOnSearchInCloseIcon = event.target.closest(".searchInBadge .close-icon")

        if (!isClickInsideSearchInOptions && !isClickOnSearchInBadge && !isClickOnSearchInCloseIcon) {
            setIsSearchInFilterClicked(false)
        }
        else if (isClickOnSearchInBadge && !isClickOnSearchInCloseIcon) {

            setIsSearchInFilterClicked((prev) => {
                const nextState = !prev

                if (nextState && searchInBadgeRef.current) {
                    const badgeRect = searchInBadgeRef.current.getBoundingClientRect()
                    let modalRect = location.pathname.includes('search') ? searchInBadgeRef.current.closest('.nk-fmg').getBoundingClientRect() : searchInBadgeRef.current.closest("#search-modal").getBoundingClientRect()

                    const leftOffset = badgeRect.left - modalRect.left

                    let topOffset = location.pathname.includes('search') ? 16 : 20;

                    let styleObj = {
                        position: "absolute",
                        left: `${leftOffset}px`,
                    }

                    if (topOffset != 0) {
                        styleObj.top = `${topOffset}%`;
                    }

                    // setsearchInDropdownStyle(styleObj)

                    // setsearchInDropdownStyle({
                    //     position: "absolute",
                    //     left: `${leftOffset}px`,
                    // })
                }
                return nextState
            })

        }



        // Folders
        // const isClickInsideFoldersOptions = foldersDropdownRef.current && foldersDropdownRef.current.contains(event.target)
        // const isClickOnFoldersBadge = event.target.closest(".foldersBadge")
        // const isClickOnFoldersCloseIcon = event.target.closest(".foldersBadge .close-icon")

        // if (!isClickInsideFoldersOptions && !isClickOnFoldersBadge && !isClickOnFoldersCloseIcon) {
        //     setIsFoldersFilterClicked(false)
        // }
        // else if (isClickOnFoldersBadge && !isClickOnFoldersCloseIcon) {
        //     setIsFoldersFilterClicked((prev) => {
        //         const nextState = !prev

        //         if (nextState && foldersBadgeRef.current) {

        //             const badgeRect = foldersBadgeRef.current.getBoundingClientRect()
        //             let modalRect = location.pathname.includes('search') ? foldersBadgeRef.current.closest('.nk-fmg').getBoundingClientRect() : foldersBadgeRef.current.closest("#search-modal").getBoundingClientRect()

        //             const leftOffset = badgeRect.left - modalRect.left
        //             let calculatedWidth = location.pathname.includes('search') ? '25%' : '50%'


        //             setFolderDropdownStyle({
        //                 position: "absolute",
        //                 left: `${leftOffset}px`,
        //                 width: calculatedWidth
        //             })
        //         }
        //         return nextState
        //     })
        // }

        //metaData
        const isClickInsidemetaDataOptions = metaDataDropdownRef.current && metaDataDropdownRef.current.contains(event.target)
        const isClickOnmetaDataBadge = event.target.closest(".metaDataBadge")
        const isClickOnmetaDataCloseIcon = event.target.closest(".metaDataBadge .close-icon")

        if (!isClickInsidemetaDataOptions && !isClickOnmetaDataBadge && !isClickOnmetaDataCloseIcon) {
            setIsMetaDataFilterClicked(false)
        }
        else if (isClickOnmetaDataBadge && !isClickOnmetaDataCloseIcon) {

            setIsMetaDataFilterClicked((prev) => {
                const nextState = !prev

                if (nextState && metaDataBadgeRef.current) {
                    const badgeRect = metaDataBadgeRef.current.getBoundingClientRect()
                    let modalRect = location.pathname.includes('search') ? metaDataBadgeRef.current.closest('.nk-fmg').getBoundingClientRect() : metaDataBadgeRef.current.closest("#search-modal").getBoundingClientRect()

                    const leftOffset = badgeRect.left - modalRect.left
                    let calculatedWidth = location.pathname.includes('search') ? '50%' : '75%'


                    let topOffset = location.pathname.includes('search') ? 16 : 20;

                    let styleObj = {
                        position: "absolute",
                        left: `${leftOffset}px`,
                        width: calculatedWidth
                    }

                    if (topOffset != 0) {
                        styleObj.top = `${topOffset}%`;
                    }

                    // setMetaDataDropdownStyle(styleObj)
                }
                return nextState
            })
        }

        //createdTime
        const isClickInsidecreatedtimeOptions = createdTimeDropdownRef.current && createdTimeDropdownRef.current.contains(event.target)
        const isClickOnCreatedTimeBadge = event.target.closest(".createdTimeBadge")
        const isClickOnCreatedTimeCloseIcon = event.target.closest(".createdTimeBadge .close-icon")

        if (!isClickInsidecreatedtimeOptions && !isClickOnCreatedTimeBadge && !isClickOnCreatedTimeCloseIcon) {
            setIsCreatedTimeClicked(false)
        }
        else if (isClickOnCreatedTimeBadge && !isClickOnCreatedTimeCloseIcon) {
            setIsCreatedTimeClicked((prev) => {
                const nextState = !prev

                if (nextState && createdTimeBadgeRef.current) {

                    const badgeRect = createdTimeBadgeRef.current.getBoundingClientRect()
                    let modalRect = location.pathname.includes('search') ? createdTimeBadgeRef.current.closest('.nk-fmg').getBoundingClientRect() : createdTimeBadgeRef.current.closest("#search-modal").getBoundingClientRect()

                    const leftOffset = badgeRect.left - modalRect.left
                    let calculatedWidth = location.pathname.includes('search') ? '50%' : '93%'


                    let topOffset = location.pathname.includes('search') ? 16 : 20;

                    let styleObj = {
                        position: "absolute",
                        left: `${leftOffset}px`,
                        width: calculatedWidth
                    }

                    if (topOffset != 0) {
                        styleObj.top = `${topOffset}%`;
                    }

                    // setcreatedTimeDropdownStyle(styleObj)
                }
                return nextState
            })
        }

        //lastUpdatedTime
        const isClickInsidelastUpdatedtimeOptions = LastUpdateTimeDropdownRef.current && LastUpdateTimeDropdownRef.current.contains(event.target)
        const isClickOnlastUpdatedBadge = event.target.closest(".lastUpdatedTimeBadge")
        const isClickOnlastUpdatedTimeCloseIcon = event.target.closest(".lastUpdatedTimeBadge .close-icon")

        if (!isClickInsidelastUpdatedtimeOptions && !isClickOnlastUpdatedBadge && !isClickOnlastUpdatedTimeCloseIcon) {
            setIsLastUpdateTimeClicked(false)
        }
        else if (isClickOnlastUpdatedBadge && !isClickOnlastUpdatedTimeCloseIcon) {
            setIsLastUpdateTimeClicked((prev) => {
                const nextState = !prev

                if (nextState && LastUpdateTimeBadgeRef.current) {

                    const badgeRect = LastUpdateTimeBadgeRef.current.getBoundingClientRect()
                    let modalRect = location.pathname.includes('search') ? LastUpdateTimeBadgeRef.current.closest('.nk-fmg').getBoundingClientRect() : LastUpdateTimeBadgeRef.current.closest("#search-modal").getBoundingClientRect()

                    const leftOffset = badgeRect.left - modalRect.left
                    let calculatedWidth = location.pathname.includes('search') ? '50%' : '93%'

                    let topOffset = location.pathname.includes('search') ? 16 : 20;

                    let styleObj = {
                        position: "absolute",
                        left: `${leftOffset}px`,
                        width: calculatedWidth
                    }

                    if (topOffset != 0) {
                        styleObj.top = `${topOffset}%`;
                    }

                    // setLastUpdateTimeDropdownStyle(styleObj)

                    // const commonFilterBadge = document.querySelector('.commonFilterBadge');
                    // if (commonFilterBadge) {
                    //     const filterBadgeRect = commonFilterBadge.getBoundingClientRect();
                    //     topOffset = filterBadgeRect.top + filterBadgeRect.height - modalRect.top; // Adjusting relative to modal
                    // }


                }
                return nextState
            })
        }

    }

    //Badges function call
    const toggleSearchInSelection = async (item) => {

        setSelectedSearchIn((prev) => {
            let updatedSelectedSearchIn

            if (prev.includes(item.id)) {
                updatedSelectedSearchIn = prev.filter((id) => id != item.id)
            }
            else {
                updatedSelectedSearchIn = [...prev, item.id]
            }

            updateQueryParam({
                searchTerm,
                selectedtype,
                selectedSearchIn: updatedSelectedSearchIn,
                defaultMetaDataValues,
                customMetaDataValues,
                selectedCreatedTime,
                selectedLastUpdateTime,
                currentDirectory
            })

            return updatedSelectedSearchIn
        })

        // setFormData({ ...formData, searchIn: updatedSelectedSearchIn1 });


        // console.log("form data",formData)
        // console.log("updatedSelectedSearchIn1", updatedSelectedSearchIn1)




    }

    // const toggletypeSelection = async (item) => {

    //     setSelectedtype((prev) => {
    //         let updatedSelectedtype

    //         if (prev.includes(item.id)) {
    //             updatedSelectedtype = prev.filter((id) => id != item.id)
    //         }
    //         else {
    //             updatedSelectedtype = [...prev, item.id]

    //         }

    //         updateQueryParam({
    //             searchTerm,
    //             selectedtype: updatedSelectedtype,
    //             selectedSearchIn,
    //             defaultMetaDataValues,
    //             customMetaDataValues,
    //             selectedCreatedTime,
    //             selectedLastUpdateTime,
    //             currentDirectory
    //         })

    //         return updatedSelectedtype
    //     })

    //     // setFormData({ ...formData, searchIn: updatedSelectedtype1 });


    //     // console.log("form data",formData)
    //     // console.log("updatedSelectedtype1", updatedSelectedtype1)

    //     // await updateQueryParam({
    //     //     searchTerm,
    //     //     selectedtype: updatedSelectedtype1,
    //     //     selectedSearchIn,
    //     //     defaultMetaDataValues,
    //     //     customMetaDataValues,
    //     //     selectedCreatedTime,
    //     //     selectedLastUpdateTime,
    //     //     currentDirectory
    //     // })



    // }


    //Folders function calls
    // async function getMyFolders() {

    //     const folderRespo = await API.getMyHierarchy()
    //     if (!folderRespo.status) {
    //         return toast.error('Could Not Form Hierarchy for Folder Filter')
    //     }

    //     if (folderRespo['data']?.length != 0) {
    //         setFolderOptions(folderRespo['data'])

    //         let clonedata = _.cloneDeep(folderRespo['data']) //folderRespo['data']?.map(item => ({ ...item }));
    //         dispatch(saveMyHierarchy(clonedata))
    //         dispatch(saveMyHierarchyIDS(folderRespo['allIDs']))
    //     }
    // }



    // const checkIfNeedToAddChildrenPropORNot = async (data) => {
    //     if (Object.keys(data)?.length != 0) {
    //         return data['childFolders'] && data['childFolders'] > 0 || data['totalChildCount'] > 0
    //     }
    //     else {
    //         return false
    //     }
    // }

    // const fetchChildListMove = async (parentValue, item) => {


    //     const setUPFlowData = async (folderRespo, parentValue) => {

    //         if (folderRespo['data']?.length != 0) {
    //             var da = await Promise.all([...folderRespo.data].map(async (item) => ({ label: item['name'], value: `folder_${item['_id']}`, fullData: item, ...(await checkIfNeedToAddChildrenPropORNot(item) ? { children: [] } : {}) })));
    //          folderOptions   setFolderOptions((prevData) => updateNode(prevData, parentValue, da))
    //         }

    //     }

    //     if (item.type == 'folder') {
    //         var folderRespo = await API.getNextFolderListMove(`1`, item._id, null)
    //         await setUPFlowData(folderRespo, parentValue)
    //     }
    //     else {
    //         var folderRespo = await API.getNextFolderListMove(`1`, item._id, item._id)
    //         await setUPFlowData(folderRespo, parentValue)
    //     }
    // }

    // async function getSharedWithMe_ie_1stlevel() {
    //     setLoader(true);
    //     const sharedRespo = await API.getSharedDocuments();

    //     let { status } = sharedRespo;
    //     if (!status) {
    //         setLoader(false);
    //         toast.error(`${sharedRespo['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
    //         return
    //     }
    //     else {

    //         if (sharedRespo.data?.length != 0) {
    //             setLoader(false);
    //             return await Promise.all(sharedRespo.data?.filter(item => item.type == "folder")?.map(async item => ({ label: item['name'], value: item['_id'], fullData: item, ...(await checkIfNeedToAddChildrenPropORNot(item) ? { children: [] } : {}) })));
    //         }

    //     }
    // }

    // const fetchStarredList_ie_1stlevel = async () => {
    //     let sharedListResponse = await API.getStarredList()
    //     let { status } = sharedListResponse
    //     if (!status) return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))

    //     if (sharedListResponse['data']?.length != 0) {
    //         return sharedListResponse['data']?.filter(item => item.type == "folder")?.map(item => ({ label: item['name'], value: item['_id'], fullData: item, children: [] }))
    //     }
    // }

    // const fetchFolderList = async (folderId, op) => {

    //     setLoader(true);
    //     let listResponse = await API.getAllFilesAndFoldersListByFolderId(folderId, op, sortBy, sortOrder)
    //     let { status } = listResponse
    //     if (!status) { setLoader(false); return toast.error(`Could not get Documents! Refresh and Try Again`) }


    //     if (listResponse['data']?.length != 0) {
    //         setLoader(false);
    //         return await Promise.all(listResponse['data']?.filter(item => item.type == "folder")?.map(async item => ({ label: item['name'], value: item['_id'], fullData: item, ...(await checkIfNeedToAddChildrenPropORNot(item) ? { children: [] } : {}) })));
    //     }

    // }

    // const fetchData = async (parentData) => {

    //     if (parentData['value'] == 'shared') {
    //         let sharedData = await getSharedWithMe_ie_1stlevel()
    //         return sharedData
    //     }
    //     else if (parentData['value'] == 'starred') {
    //         let starredData = await fetchStarredList_ie_1stlevel()
    //         return starredData
    //     }
    //     else {
    //         var id = parentData['value']
    //         var op = 'dummy'
    //         if (parentData['fullData']['createdBy'] == localStorage.getItem('userId')) {
    //             op = "folder"
    //         }
    //         else {
    //             op = "shared"
    //         }

    //         let data = await fetchFolderList(id, op)
    //         return data
    //     }
    // }

    // const handleExpand = async (activeNode, isExpand) => {

    //     if (isExpand && activeNode.children.length == 0) {

    //         if (activeNode['value']?.includes('section') || activeNode['value']?.includes('folder')) {
    //             await fetchChildListMove(activeNode['value'], activeNode['fullData'])
    //         }
    //         else {
    //             const children = await fetchData(activeNode)
    //          folderOptions   setFolderOptions((prevData) => updateNode(prevData, activeNode.value, children));
    //         }
    //     }
    // }

    // const updateNode = (data, activeNodeValue, newChildren) => {
    //     return data.map((node) => {
    //         if (node.value == activeNodeValue) {
    //             return { ...node, children: newChildren }
    //         }
    //         if (node.children) {
    //             return { ...node, children: updateNode(node.children, activeNodeValue, newChildren) }
    //         }
    //         return node
    //     })
    // }



    // const settFolderLevelValue = async (selectedValues) => {



    //     const parentNode = await findNode(data, selectedValues[0])
    //     const hasChildren = parentNode?.['children']?.length != 0
    //     const childlevels = hasChildren ? await getChildValues(parentNode) : selectedValues

    //     if (hasChildren) {
    //         childlevels?.unshift(parentNode?.['value'])
    //     }

    //     setFolderLevels(childlevels)
    // }

    const handleChange = (selectedValues) => {
        setFolderLevels(selectedValues)
    }


    //metaData Calls
    const intialStartDefaultMetaData = async () => {

        if (defaultMetaDataList?.length == 0) {
            setDefaultMetaDataList(defaultMetaData)
            for (var item of defaultMetaData) {
                await handleDefaultMetaData(item)
            }
        }

    }

    const fetchMetaListAPIs = async () => {

        let customMetaDataFieldReponse = null
        if (customMetaDataList?.length == 0) {
            hasCustomMetaAPICalled.current = true
            customMetaDataFieldReponse = await API.getAllCustomMetaDataList()
        }
        let docTypeResponse = await API.getAllDocumentType()
        let keywordsResponse = await API.getAllKeywords()

        if (customMetaDataFieldReponse?.['status'] && customMetaDataList.length == 0) {
            var fulldata = customMetaDataFieldReponse?.['data']
            setCustomMetaDataList(fulldata)
        }
        // docTypeResponse['status'] && setDocTypeOptionsData(docTypeResponse['data'])
        if (docTypeResponse?.['status']) {
            setDocTypeOptionsData(docTypeResponse['data']['documentTypeData'])
            setsecDocTypeOptionsData(docTypeResponse['data']['secDocumentTypeData'])
        }
        keywordsResponse['status'] && setKeywordOptionsData(keywordsResponse['data'])
    }


    const countFilledValues = async (metaDataValues) => {

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

    const countFilledValuesNormal = (metaDataValues) => {

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


    const findCustomList = async (mainList, necessaryObjs) => {
        const result = []

        for (const key of Object.keys(necessaryObjs)) {
            const matchingItem = mainList?.find(item => item.name == key)

            if (matchingItem) {
                result.push(matchingItem)
            }
        }

        return result
    }



    const CustomDropdownItem = ({ label, isHeader }) => {
        return (
            <DropdownItem
                style={{
                    cursor: isHeader ? 'default' : 'pointer',
                    backgroundColor: isHeader ? '#f8f9fa' : 'inherit',
                    color: isHeader ? '#6c757d' : 'inherit',
                    fontWeight: isHeader ? 'bold' : 'normal',
                    pointerEvents: isHeader ? 'none' : 'auto'
                }}
                onClick={isHeader ? (e) => e.preventDefault() : undefined}
            >
                {label}
            </DropdownItem>
        )
    }

    const handleDefaultMetaData = async (item) => {
        setSelectedDefaultMetaDataList(prev => [...prev, item])

        let filteredDefaultMetaDataList = defaultMetaDataList.filter(val => val['id'] != item['id'])
        setDefaultMetaDataList(filteredDefaultMetaDataList)


        //store starting value
        if (item.type == 'text' || item.type == "textarea") {
            setDefaultMetaDataValues(prevMetaData => {
                const updatedMetaData = {
                    ...prevMetaData,
                    [item.id]: { filter: 'is', value: '' }
                };



                return updatedMetaData;
            });

        }
        else if (item.type == 'tag') {
            setDefaultMetaDataValues(prevMetaData => {
                const updatedMetaData = {
                    ...prevMetaData,
                    [item.id]: { filter: 'includes', value: [] }
                };



                return updatedMetaData;
            });
        }

    }

    const handleCustomMetaData = (item) => {
        setSelectedCustomMetaDataList(prev => [...prev, item])

        let filteredCustomMetaDataList = customMetaDataList.filter(val => val['_id'] != item['_id'])
        setCustomMetaDataList(filteredCustomMetaDataList)

        //store starting value
        if (item.type == 'list') {
            setCustomMetaDataValues(prevMetaData => {
                const cust = {
                    ...prevMetaData,
                    [item.name]: { filter: 'includes', value: [] }
                }
                updateQueryParam({
                    searchTerm,
                    selectedtype,
                    selectedSearchIn,
                    defaultMetaDataValues,
                    customMetaDataValues: cust,
                    selectedCreatedTime,
                    selectedLastUpdateTime,
                    currentDirectory
                })
            })
            return cust
        }
        else {
            setCustomMetaDataValues(prevMetaData => {
                const cust = {
                    ...prevMetaData,
                    [item.name]: { filter: 'is', value: '' }
                }
                updateQueryParam({
                    searchTerm,
                    selectedtype,
                    selectedSearchIn,
                    defaultMetaDataValues,
                    customMetaDataValues: cust,
                    selectedCreatedTime,
                    selectedLastUpdateTime,
                    currentDirectory
                })
                return cust
            })
        }
    }


    const handleDefaultMetaDataDelete = (e, item) => {
        e.preventDefault();

        let filteredSelectedDefaultMetaDataList = selectedDefaultMetaDataList.filter(val => val['id'] != item['id'])
        setSelectedDefaultMetaDataList(filteredSelectedDefaultMetaDataList)

        setDefaultMetaDataList(prev => [...prev, item])

        setDefaultMetaDataValues((prevMetaData) => {
            const { [item.id]: _, ...rest } = prevMetaData
            return rest
        })
    }

    const handleCustomMetaDataDelete = (e, item) => {
        e.preventDefault();

        let filteredSelectedCustomMetaDataList = selectedCustomMetaDataList.filter(val => val['_id'] != item['_id'])
        setSelectedCustomMetaDataList(filteredSelectedCustomMetaDataList)

        setCustomMetaDataList(prev => [...prev, item])

        setCustomMetaDataValues((prevMetaData) => {
            const { [item.name]: _, ...rest } = prevMetaData;

            updateQueryParam({
                searchTerm,
                selectedtype,
                selectedSearchIn,
                defaultMetaDataValues,
                customMetaDataValues: rest,
                selectedCreatedTime,
                selectedLastUpdateTime,
                currentDirectory
            })

            return rest
        })

    }

    const storeDefaultMetaDataFilter = (e, item) => {
        const newValue = e.target.value;

        setDefaultMetaDataValues((prevMetaData) => {
            const updatedMetaData = {
                ...prevMetaData,
                [item.id]: prevMetaData[item.id]
                    ? { ...prevMetaData[item.id], filter: newValue }
                    : {}
            };

            updateQueryParam({
                searchTerm,
                selectedtype,
                selectedSearchIn,
                defaultMetaDataValues: updatedMetaData,
                customMetaDataValues,
                selectedCreatedTime,
                selectedLastUpdateTime,
                currentDirectory
            });

            return updatedMetaData;
        });

    }


    const storeDefaultMetaDataValue = (e, item) => {

        const newValue = e.target.value;


        setDefaultMetaDataValues((prevMetaData) => {
            const up = {
                ...prevMetaData,
                [item.id]: prevMetaData[item.id]
                    ? { ...prevMetaData[item.id], value: newValue }
                    : { value: newValue } // Ensure a valid default structure
            };

            updateQueryParam({
                searchTerm,
                selectedtype,
                selectedSearchIn,
                defaultMetaDataValues: up, // Updated state
                customMetaDataValues,
                selectedCreatedTime,
                selectedLastUpdateTime,
                currentDirectory
            });

            return up; // Ensure the new state is returned
        });


    }

    const storeCustomMetaDataFilter = (e, item) => {
        const newValue = e.target.value;

        // setCustomMetaDataValues((prevMetaData) => ({
        //     ...prevMetaData,
        //     [item.name]: prevMetaData[item.name]
        //         ? { ...prevMetaData[item.name], filter: newValue }
        //         : {}
        // }))

        setCustomMetaDataValues((prevMetaData = {}) => {
            const up = {
                ...prevMetaData,
                [item.name]: prevMetaData[item.name]
                    ? { ...prevMetaData[item.name], filter: newValue }
                    : { filter: newValue }
            }

            updateQueryParam({
                searchTerm,
                selectedtype,
                selectedSearchIn,
                defaultMetaDataValues,
                customMetaDataValues: up,
                selectedCreatedTime,
                selectedLastUpdateTime,
                currentDirectory
            })

            return up
        })


    }

    const storeCustomMetaDataValue = (e, item) => {
        const newValue = e.target.value;
        setCustomMetaDataValues((prevMetaData = {}) => {
            const up = {
                ...prevMetaData,
                [item.name]: prevMetaData[item.name]
                    ? { ...prevMetaData[item.name], value: newValue }
                    : { value: newValue }
            }

            updateQueryParam({
                searchTerm,
                selectedtype,
                selectedSearchIn,
                defaultMetaDataValues,
                customMetaDataValues: up,
                selectedCreatedTime,
                selectedLastUpdateTime,
                currentDirectory
            });

            return up;

        });
    }


    const clearMetaDataValues = (metaDataValues) => {
        return Object.entries(metaDataValues).reduce((acc, [key, metaData]) => {
            if (['is', 'is not'].includes(metaData.filter)) {
                acc[key] = { ...metaData, value: '' }
            } else if (['includes', 'excludes'].includes(metaData.filter)) {
                acc[key] = { ...metaData, value: [] }
            } else {
                acc[key] = metaData
            }
            return acc
        }, {})
    }

    //time calls
    const toUTC = async (date) => {
        const utcDate = new Date(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            0, 0, 0, 0
        ))
        return utcDate
    }

    const handleSelect = (ranges) => {
        const data = {
            startDate: new Date(ranges.selection.startDate),
            endDate: new Date(ranges.selection.endDate),
            key: 'selection'
        }
        setSelectedCreatedTime([data])
        updateQueryParam({
            searchTerm,
            selectedtype,
            selectedSearchIn,
            defaultMetaDataValues,
            customMetaDataValues,
            selectedCreatedTime: [data],
            selectedLastUpdateTime,
            currentDirectory
        })
    }

    const handleLastUpdatedSelect = (ranges) => {
        const data = {
            startDate: new Date(ranges.selection.startDate),
            endDate: new Date(ranges.selection.endDate),
            key: 'selection'
        }
        setSelectedLastUpdateTime([data])
        updateQueryParam({
            searchTerm,
            selectedtype,
            selectedSearchIn,
            defaultMetaDataValues,
            customMetaDataValues,
            selectedCreatedTime,
            selectedLastUpdateTime: [data],
            currentDirectory
        })
    }


    const upperCase = (item) => {
        return item?.replace(/\b\w/g, char => char.toUpperCase())
    }


    const handleSearchModal = async (value) => {

        const newSearchTerm = value
        // dispatch(saveSearch(newSearchTerm))
        setSearchTerm(newSearchTerm)

        if (location.pathname != '/search') {

            await updateQueryParam({
                searchTerm: newSearchTerm,
                selectedtype,
                selectedSearchIn,
                defaultMetaDataValues,
                customMetaDataValues,
                selectedCreatedTime,
                selectedLastUpdateTime,
                currentDirectory
            })

            // setFormData({ ...formData, searchTerm: newSearchTerm });
            // updateQueryParam()
            if (newSearchTerm != '') {
                setShowHistory(false)
            }
            // searchapicall()

        }
        else {
            //main page

        }
    }


    // const [formData, setFormData] = useState({
    //     searchTerm: "",
    //     selectedSearchIn: "",
    //     defaultMetaDataValues: {},
    //     customMetaDataValues: {},
    //     selectedCreatedTime: [],
    //     selectedLastUpdateTime: [],
    //     currentDirectory: []
    // });


    // useEffect(() => {

    // if (!inputRef.current) {
    //     return
    // }

    // const ele = inputRef.current

    // ele.addEventListener('focus', () => {
    //     if (searchTerm == '') {
    //         setShowHistory(true)
    //     }
    //     else {
    //         setShowHistory(false)
    //     }
    // })

    // if (location.pathname == '/search') {
    //     debugger;
    //     dispatch(disableSearchModal())
    // }
    //     if (location.pathname == '/search' && currentPage && itemPerPage) {
    //         searchapicall({
    //             searchTerm,
    //             selectedSearchIn,
    //             defaultMetaDataValues,
    //             customMetaDataValues,
    //             selectedCreatedTime,
    //             selectedLastUpdateTime,
    //             currentDirectory
    //         })
    //     }

    // }, [currentPage, itemPerPage])





    async function updateQueryParam({
        searchTerm,
        selectedtype,
        selectedSearchIn,
        defaultMetaDataValues,
        customMetaDataValues,
        selectedCreatedTime,
        selectedLastUpdateTime,
        currentDirectory
    }) {


        let payloaddata = {
            searchTerm,
            selectedtype,
            selectedSearchIn,
            defaultMetaDataValues,
            customMetaDataValues,
            selectedCreatedTime,
            selectedLastUpdateTime,
            currentDirectory
        }

        if (searchTerm == '') {
            setShowHistory(true)
        }
        else {
            setShowHistory(false)
        }

        if (location.pathname == '/search') {
            // for (let item in formData) {
            //     payloaddata[item] = encodeURIComponent(JSON.stringify(payloaddata[item]));
            // }

            // if (searchInValue != null) {
            //     payloaddata['searchIn'] = encodeURIComponent(JSON.stringify(searchInValue));
            // }

            // let queryParams = await setUpURL()
            const queryParams = new URLSearchParams()

            if (searchTerm) {
                queryParams.set("searchTerm", encodeURIComponent(JSON.stringify(searchTerm)))
            }
            if (selectedtype?.length > 0) {
                queryParams.set("selectedtype", encodeURIComponent(JSON.stringify(selectedtype)))
            }
            if (selectedSearchIn?.length > 0) {
                queryParams.set("selectedSearchIn", encodeURIComponent(JSON.stringify(selectedSearchIn)))
            }
            let defaultMetaCnt = await countFilledValues(defaultMetaDataValues)
            if (defaultMetaCnt) {
                var data = await encode(defaultMetaDataValues)
                queryParams.set("defaultMetaDataValues", data)
            }
            let customMetaCnt = await countFilledValues(customMetaDataValues)
            if (customMetaCnt) {
                var data = await encode(customMetaDataValues)
                queryParams.set("customMetaDataValues", data)
            }
            if (selectedCreatedTime?.length) {
                queryParams.set("selectedCreatedTime", encodeURIComponent(JSON.stringify(selectedCreatedTime)))
            }
            if (selectedLastUpdateTime?.length) {
                queryParams.set("selectedLastUpdateTime", encodeURIComponent(JSON.stringify(selectedLastUpdateTime)))
            }
            if (currentDirectory?.length) {
                queryParams.set("currentDirectory", encodeURIComponent(JSON.stringify(currentDirectory)))
            }


            const url = `/search?${queryParams.toString()}`;
            navigate(url, { replace: true })
        }
        else {
            //modal

            // for (let item in formData) {
            //     payloaddata[item] = formData[item];
            // }
            // if (searchInValue != null) {
            //     payloaddata['searchIn'] = searchInValue;
            // }
            searchapicall(payloaddata)
        }



        // if (location.pathname == '/search') {
        //     let payloaddata = {};
        //     for (let item in formData) {
        //         payloaddata[item] = encodeURIComponent(JSON.stringify(formData[item]));
        //     }

        //     if (searchInValue != null) {
        //         payloaddata['searchIn'] = encodeURIComponent(JSON.stringify(searchInValue));
        //     }

        //     const queryParams = new URLSearchParams(payloaddata).toString();
        //     const url = `/search?${queryParams}`;
        //     navigate(url, { replace: true })

        // } else {
        //     //modal
        //     let payloaddata = {};
        //     for (let item in formData) {
        //         payloaddata[item] = formData[item];
        //     }
        //     if (searchInValue != null) {
        //         payloaddata['searchIn'] = searchInValue;
        //     }

        //     console.log(payloaddata, "payloaddata")
        //     searchapicall(payloaddata)
        // }



    }
    // useEffect(, [formData])
    // const handleChange1 = (e) => {
    //     setFormData({ ...formData, [e.target.name]: e.target.value });
    // };

    const setUpURL = async (query="") => {

        const queryParams = new URLSearchParams()
        if(query!=""){
            queryParams.set("searchTerm", encodeURIComponent(JSON.stringify(query)))
        }else if (searchTerm) {
            queryParams.set("searchTerm", encodeURIComponent(JSON.stringify(searchTerm)))
        }
        if (selectedtype?.length > 0) {
            queryParams.set("selectedtype", encodeURIComponent(JSON.stringify(selectedtype)))
        }
        if (selectedSearchIn?.length > 0) {
            queryParams.set("selectedSearchIn", encodeURIComponent(JSON.stringify(selectedSearchIn)))
        }
        let defaultMetaCnt = await countFilledValues(defaultMetaDataValues)
        if (defaultMetaCnt) {
            var data = await encode(defaultMetaDataValues)
            queryParams.set("defaultMetaDataValues", data)
        }
        let customMetaCnt = await countFilledValues(customMetaDataValues)
        if (customMetaCnt) {
            var data = await encode(customMetaDataValues)
            queryParams.set("customMetaDataValues", data)
        }
        if (selectedCreatedTime?.length) {
            queryParams.set("selectedCreatedTime", encodeURIComponent(JSON.stringify(selectedCreatedTime)))
        }
        if (selectedLastUpdateTime?.length) {
            queryParams.set("selectedLastUpdateTime", encodeURIComponent(JSON.stringify(selectedLastUpdateTime)))
        }
        if (currentDirectory?.length) {
            queryParams.set("currentDirectory", encodeURIComponent(JSON.stringify(currentDirectory)))
        }

        return queryParams.toString()
    }


    const handleSubmit1 = async (term="") => {

        // // Get all form values dynamically
        // const formElements = new FormData(e.target);
        // const data = Object.fromEntries(formElements.entries()); // Convert to an object
        
        const newSearchTerm = (term!="")?term.trim():searchTerm?.trim()
        if (!newSearchTerm) return

        let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || []

        searchHistory = searchHistory.filter((term) => term != newSearchTerm)

        searchHistory.unshift(newSearchTerm)

        if (searchHistory.length > 10) {
            searchHistory = searchHistory.slice(0, 10)
        }

        localStorage.setItem("searchHistory", JSON.stringify(searchHistory))
        setSearchHistory(searchHistory)


        // // Convert data to a query string
        toggle()

        // let payloaddata = {}

        // for (let item in formData) {
        //     payloaddata[item] = encodeURIComponent(JSON.stringify(formData[item]));
        // }

        let queryParams = await setUpURL(newSearchTerm)

        const url = `/search?${queryParams.toString()}`;
        navigate(url, { replace: true })


        let payloaddata = {
            page: 1,
            newSearchTerm,
            selectedtype,
            selectedSearchIn,
            defaultMetaDataValues,
            customMetaDataValues,
            selectedCreatedTime,
            selectedLastUpdateTime,
            currentDirectory
        }

        if (location.pathname == '/search') {
            searchapicall(payloaddata)
        }

    }

    const navtoggle = (item) => {
        // setActivetab(item)
        setSelectedtype(item)
        // currentPage=1
        // setCurrentPage(1)
        updateQueryParam({
            searchTerm,
            selectedtype: item,
            selectedSearchIn,
            defaultMetaDataValues,
            customMetaDataValues,
            selectedCreatedTime,
            selectedLastUpdateTime,
            currentDirectory
        })
        // searchapicall({
        //     searchTerm,
        //     selectedtype,
        //     selectedSearchIn,
        //     defaultMetaDataValues,
        //     customMetaDataValues,
        //     selectedCreatedTime,
        //     selectedLastUpdateTime,
        //     currentDirectory
        // })
        // console.log(store?.searchfilters,"searchfilters")

        // if (item == "All") {
        //     setshowdata(searchResult)
        // }
        // else if (alltypes[item]) {
        //     setshowdata(searchResult.filter(file => alltypes[item].includes(file._source?.fileType)))
        // }
        // else if (item == "Others") {
        //     setshowdata(searchResult.filter(file => !knowntype.has(file._source?.fileType)))
        // }
        // else {
        //     setshowdata(searchResult)
        // }
    }
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    useEffect(() => {
        if (transcript != "") {
            setSearchTerm(transcript);
            if (location.pathname == '/search') {
                handleSubmit1()
            } else {
                handleSearchModal(transcript)
            }
        }
    }, [transcript])
    return (

        <>

            <div className={theme.skin == "dark" ? "nk-fmg-search headersearch_dark" : "nk-fmg-search headersearch"}  >
                <Icon name="search" />
                {currentDirectory.map((item) => (
                    <div id="searchInBadgeId"
                        //  ref={excludedDivRef}
                        key={item?._id} style={{ display: "inline-block", margin: "5px" }}>
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


                <form
                    onSubmit={(e) => {
                        e.preventDefault(); // Prevent default form submission
                        e.stopPropagation()
                        handleSubmit1()
                    }
                    }
                    className="w-100"
                // action="/search" method="GET"
                >




                    <DebounceInput
                        // debounceTimeout={300}
                        inputRef={inputRef}
                        type="text"
                        className="form-control border-transparent form-focus-none searchmodalInput"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => {
                            e.preventDefault(); // Prevent default form submission
                            e.stopPropagation()
                            handleSearchModal(e.target.value)
                        }}
                        name="searchTerm"
                        id="searchTerm"
                        autoComplete={"off"}
                        onClick={(e) => {
                            if (e.target.value == '') {
                                setShowHistory(true)
                            }
                            else {
                                setShowHistory(false)
                            }
                        }}
                        onKeyDown={async (e) => {
                            if (e.key == 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                await handleSearchModal(e.target.value)
                                await handleSubmit1()
                            }
                        }}
                    // onKeyDown={handleKeyPress}
                    />

                    <div className="voicetotext">
                        {listening}
                        {listening == 'off' || listening == '' ? <button type="button" onClick={SpeechRecognition.startListening}><Icon name="mic"></Icon></button> : <button type="button" onClick={SpeechRecognition.stopListening}><Icon name="stop-circle-fill"></Icon></button>}
                    </div>

                    {/* <input type="hidden" name="searchIn" id="searchIn" value={selectedSearchIn}  /> */}
                    {/* <input type="hidden" name="folderLevels" id="folderLevels" value={JSON.stringify(currentDirectory)} />
                    <input type="hidden" name="defaultMetaDataValues" id="defaultmeta" value={JSON.stringify(defaultMetaDataValues)} />
                    <input type="hidden" name="customMetaDataValues" id="custommeta" value={JSON.stringify(customMetaDataValues)} />
                    <input type="hidden" name="createdtime" id="selectedCreatedTime" value={JSON.stringify(selectedCreatedTime)} />
                    <input type="hidden" name="updatedtime" id="selectedLastUpdateTime" value={JSON.stringify(selectedLastUpdateTime)} /> */}
                </form>
                {/* NORMAL INPUT */}
                {/* <input
                            ref={inputRef}
                            type="text"
                            className="form-control border-transparent form-focus-none searchmodalInput"
                            placeholder="Search"
                            value={store?.search}
                            onChange={handleSearchModal}
                            onKeyDown={handleKeyPress}
                        /> */}


                {/* <div class="ai-search-button">
                            <Button>
                                <Icon name="graphql" />
                                AI
                            </Button>
                        </div> */}

                {location.pathname == '/search' &&
                    <>
                        {showHistory &&
                            <Card className='searchPageSearchHistory'>
                                {searchHistory.length > 0 ? (
                                    <div className=" mb-2 ">
                                        {searchHistory.map((item, index) => (
                                            <span key={index} className="px-2 py-1 d-flex align-items-center searchHistory"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setSearchTerm(item)
                                                    setShowHistory(false)
                                                    searchapicall({
                                                        page: 1,
                                                        searchTerm: item,
                                                        selectedtype,
                                                        selectedSearchIn,
                                                        defaultMetaDataValues,
                                                        customMetaDataValues,
                                                        selectedCreatedTime,
                                                        selectedLastUpdateTime,
                                                        currentDirectory
                                                    })
                                                }}
                                            ><Icon name="history" /> &ensp;{item}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="m-5" style={{ textAlign: "center" }}>
                                        <img src={NoSearch} alt="NoSearch" width={250} height={250} />
                                        <p>No Items Searched!</p>
                                    </div>
                                )}
                            </Card>
                        }
                    </>
                }
            </div>



            {/* Badges */}
            <div className="commonFilterBadge">
                <div className="searchbadge" ref={searchInBadgeRef}>
                    <Badge
                        // style={{ background: "#4B6382", color: "#fff", fontSize: ".9rem" }}
                        pill
                        color={selectedSearchIn?.length ? "outline-warning" : "outline-light"}
                        className={`searchInBadge ${location.pathname.includes('search') ? 'mainPage-searchIn-width-badge' : 'searchIn-width-badge'}`}
                    >
                        {selectedSearchIn?.length ? (
                            <>
                                Search In &nbsp;
                                <span className="badge-text">
                                    ({selectedSearchIn?.length})
                                </span>
                                <span className="close-icon" onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSearchIn([])
                                    updateQueryParam({
                                        searchTerm,
                                        selectedtype,
                                        selectedSearchIn: [],
                                        defaultMetaDataValues,
                                        customMetaDataValues,
                                        selectedCreatedTime,
                                        selectedLastUpdateTime,
                                        currentDirectory
                                    })
                                    // setFormData({ ...formData, searchIn: [] });
                                    // updateQueryParam()
                                }}>
                                    <Icon name="cross" />
                                </span>
                            </>
                        ) : (
                            <>Search In<Icon name="chevron-down" /></>
                        )}
                    </Badge>

                    {isSearchInFilterClicked && (
                        <div ref={searchInDropdownref} className="selectPickerSearchIn" style={searchInDropdownStyle}>
                            <div className="dropdown-preview">
                                <div className="dropdown-menu">
                                    <ul className="link-list-plain no-bdr sm">
                                        {searchInOptions.map((item) => (
                                            <li key={item.id} onClick={() => toggleSearchInSelection(item)}>
                                                <a href="#links" onClick={(ev) => ev.preventDefault()}>
                                                    &nbsp; &nbsp;{item.name}
                                                    {selectedSearchIn.includes(item.id) && (<span className="tickMark"> &nbsp; ✔</span>)}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                <div className="searchbadge" ref={metaDataBadgeRef}>
                    <Badge
                        pill
                        color={selectedMetaData != 0 ? "outline-warning" : "outline-light"}
                        className={`metaDataBadge ${location.pathname.includes('search') ? 'mainPage-metaData-width-badge' : 'metaData-width-badge'}`}
                    >
                        {selectedMetaData != 0 ? (
                            <>
                                Metadata &nbsp;
                                <span className="badge-text">
                                    ({selectedMetaData})
                                </span>
                                <span className="close-icon" onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMetaData(0)
                                    setDefaultMetaDataValues(clearMetaDataValues(defaultMetaDataValues))
                                    setCustomMetaDataValues(clearMetaDataValues(customMetaDataValues))

                                    updateQueryParam({
                                        searchTerm,
                                        selectedtype,
                                        selectedSearchIn,
                                        defaultMetaDataValues: clearMetaDataValues(defaultMetaDataValues),
                                        customMetaDataValues: clearMetaDataValues(customMetaDataValues),
                                        selectedCreatedTime,
                                        selectedLastUpdateTime,
                                        currentDirectory
                                    })
                                }}>
                                    <Icon name="cross" />
                                </span>
                            </>
                        ) : (
                            <>Metadata<Icon name="chevron-down" /></>
                        )}
                    </Badge>
                    {ismetaDataFilterClicked && (
                        <div ref={metaDataDropdownRef} className="selectPickermetaData" style={metaDataDropdownStyle} id="metDrpdoenId">

                            <div className="dropdown-preview">
                                <div className="dropdown-menu">
                                    <ul className="link-list-plain no-bdr sm mx-3">

                                        {/* defaultMetaData */}
                                        <li>
                                            {selectedDefaultMetaDataList?.length != 0 && <h6 className="modal-title mb-4">Default Metadata</h6>}
                                            {selectedDefaultMetaDataList &&
                                                selectedDefaultMetaDataList?.map((item, idx) => (
                                                    <div className="d-flex align-items-center row mb-2" key={`${item.id}_${idx}`}>
                                                        <div className="col-3">
                                                            <span className="text-soft fw-medium">{item?.fieldName}</span>
                                                        </div>

                                                        {(item.type == "text" || item.type == "textarea") && (
                                                            <>
                                                                <div className="col-3">
                                                                    <select
                                                                        className="form-select"
                                                                        value={
                                                                            defaultMetaDataValues && defaultMetaDataValues?.[item.id] != undefined
                                                                                ? defaultMetaDataValues[item.id]["filter"]
                                                                                : ""
                                                                        }
                                                                        onChange={(e) => storeDefaultMetaDataFilter(e, item)}
                                                                    >
                                                                        <option value="is">is</option>
                                                                        <option value="is not">is not</option>
                                                                    </select>
                                                                </div>

                                                                <div className="col-6 d-flex align-items-center">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control metadatafilternotesandno-inputbox"
                                                                        value={
                                                                            defaultMetaDataValues && defaultMetaDataValues?.[item.id] != undefined
                                                                                ? defaultMetaDataValues[item.id]["value"]
                                                                                : "none"
                                                                        }
                                                                        onChange={(e) => storeDefaultMetaDataValue(e, item)}
                                                                    />

                                                                </div>
                                                            </>
                                                        )}

                                                        {item.type == "tag" && (
                                                            <>
                                                                <div className="col-3">
                                                                    <select
                                                                        className="form-select"
                                                                        value={
                                                                            defaultMetaDataValues && defaultMetaDataValues?.[item.id] != undefined
                                                                                ? defaultMetaDataValues[item.id]["filter"]
                                                                                : ""
                                                                        }
                                                                        onChange={(e) => storeDefaultMetaDataFilter(e, item)}
                                                                    >
                                                                        <option value="includes">includes</option>
                                                                        <option value="excludes">excludes</option>
                                                                    </select>
                                                                </div>

                                                                <div className={`col-6 d-flex align-items-center ${theme?.skin == 'light' ? 'light-theme' : 'dark-theme'}`} onClick={(e) => e.stopPropagation()} id="searchMetadata">
                                                                    {(item.id == "primarydoctype" || item.id == "secondarydoctype") && (

                                                                        //react select - with multiple select
                                                                        <Select
                                                                            classNamePrefix="react-select"
                                                                            isSearchable={true}
                                                                            menuShouldScrollIntoView={true}
                                                                            isMulti
                                                                            isClearable={false}
                                                                            closeMenuOnSelect={false}
                                                                            placeholder={item?.placeholder}
                                                                            styles={reactSelectCustomStyles}
                                                                            components={{ animatedComponents }}
                                                                            // menuPortalTarget={document.getElementById('metDrpdoenId')}
                                                                            options={
                                                                                (item?.placeholder.includes('Primary') ? docTypeOptionsData : secdocTypeOptionsData)?.map(value => ({
                                                                                    value: value.name,
                                                                                    label: value.name
                                                                                }))
                                                                            }

                                                                            value={
                                                                                defaultMetaDataValues && defaultMetaDataValues?.[item.id] !== undefined
                                                                                    ? defaultMetaDataValues?.[item.id]?.["value"]?.map((val) => ({
                                                                                        value: val,
                                                                                        label: val,
                                                                                    }))
                                                                                    : []
                                                                            }
                                                                            onChange={(selectedOptions) => {

                                                                                const selectedValues = selectedOptions ? selectedOptions?.map((option) => option?.value) : []
                                                                                storeDefaultMetaDataValue({ target: { value: selectedValues } }, item)

                                                                            }}
                                                                        />

                                                                        // normal select tag - with single select
                                                                        // <select
                                                                        //     className="form-select"
                                                                        //     value={
                                                                        //         defaultMetaDataValues && defaultMetaDataValues?.[item.id] != undefined
                                                                        //             ? defaultMetaDataValues[item.id]["value"]
                                                                        //             : ""
                                                                        //     }
                                                                        //     onChange={(e) => storeDefaultMetaDataValue(e, item)}
                                                                        // >
                                                                        //     <option value="" disabled hidden>
                                                                        //         Select an option
                                                                        //     </option>
                                                                        //     {docTypeOptionsData &&
                                                                        //         docTypeOptionsData.map((value) => (
                                                                        //             <option key={value.name} value={value.name}>
                                                                        //                 {value.name}
                                                                        //             </option>
                                                                        //         ))}
                                                                        // </select>

                                                                    )}

                                                                    {item.id == "keywords" && (

                                                                        //react select - with multiple select
                                                                        <Select
                                                                            classNamePrefix="react-select"
                                                                            isSearchable={true}
                                                                            menuShouldScrollIntoView={true}
                                                                            isMulti
                                                                            isClearable={false}
                                                                            closeMenuOnSelect={false}
                                                                            placeholder="Select Keywords"
                                                                            styles={reactSelectCustomStyles}
                                                                            components={{ animatedComponents }}
                                                                            // menuPortalTarget={document.getElementById('metDrpdoenId')}
                                                                            options={
                                                                                keywordOptionsData &&
                                                                                keywordOptionsData?.map((value) => ({
                                                                                    value: value.name,
                                                                                    label: value.name
                                                                                }))
                                                                            }
                                                                            value={
                                                                                defaultMetaDataValues && defaultMetaDataValues?.[item.id] !== undefined
                                                                                    ? defaultMetaDataValues?.[item.id]?.["value"]?.map((val) => ({
                                                                                        value: val,
                                                                                        label: val,
                                                                                    }))
                                                                                    : []
                                                                            }
                                                                            onChange={(selectedOptions) => {

                                                                                const selectedValues = selectedOptions ? selectedOptions?.map((option) => option?.value) : []
                                                                                storeDefaultMetaDataValue({ target: { value: selectedValues } }, item)

                                                                            }}
                                                                        />

                                                                        // normal select tag - with single select
                                                                        // <select
                                                                        //     className="form-select"
                                                                        //     value={
                                                                        //         defaultMetaDataValues && defaultMetaDataValues?.[item.id] != undefined
                                                                        //             ? defaultMetaDataValues[item.id]["value"]
                                                                        //             : ""
                                                                        //     }
                                                                        //     onChange={(e) => storeDefaultMetaDataValue(e, item)}
                                                                        // >
                                                                        //     <option value="" disabled hidden>
                                                                        //         Select an option
                                                                        //     </option>
                                                                        //     {keywordOptionsData &&
                                                                        //         keywordOptionsData.map((value) => (
                                                                        //             <option key={value.name} value={value.name}>
                                                                        //                 {value.name}
                                                                        //             </option>
                                                                        //         ))}
                                                                        // </select>
                                                                    )}

                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                        </li>

                                        {/* customMetaData */}
                                        <li>
                                            {selectedCustomMetaDataList?.length != 0 && <h5>Custom Metadata</h5>}
                                            {selectedCustomMetaDataList && selectedCustomMetaDataList?.map((item, idx) => (
                                                <div class="d-flex align-items-center row mb-2" key={`${item.name}_${idx}`}>

                                                    <div class="col-3">
                                                        <span className="text-soft fw-medium">{upperCase(item?.name)}</span>
                                                    </div>

                                                    {item?.type == 'string' &&
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="is">is</option>
                                                                    <option value="is not">is not</option>
                                                                </select>
                                                            </div>

                                                            <div class="col-6">
                                                                <input type="text" class="form-control" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['value'] : ''} onChange={(e) => storeCustomMetaDataValue(e, item)} />
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    }

                                                    {item?.type == 'text' &&
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="is">is</option>
                                                                    <option value="is not">is not</option>
                                                                </select>
                                                            </div>

                                                            <div class="col-6">
                                                                <textarea
                                                                    id={item?.id}
                                                                    placeholder={'Enter your text here'}
                                                                    className="form-control"
                                                                    value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['value'] : ''}
                                                                    onChange={(e) => storeCustomMetaDataValue(e, item)}
                                                                />
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    }

                                                    {item?.type == 'textarea' &&
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="is">is</option>
                                                                    <option value="is not">is not</option>
                                                                </select>
                                                            </div>

                                                            <div class="col-6">
                                                                <textarea
                                                                    id={item?.id}
                                                                    placeholder={'Enter your text here'}
                                                                    className="form-control"
                                                                    value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['value'] : ''}
                                                                    onChange={(e) => storeCustomMetaDataValue(e, item)}
                                                                />
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    }

                                                    {item?.type == 'datetime' &&
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="is">is</option>
                                                                    <option value="is not">is not</option>
                                                                </select>
                                                            </div>

                                                            <div class="col-6">
                                                                <input type="datetime" class="form-control" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['value'] : ''} onChange={(e) => storeCustomMetaDataValue(e, item)} />
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    }

                                                    {item?.type == 'date' &&
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="is">is</option>
                                                                    <option value="is not">is not</option>
                                                                </select>
                                                            </div>

                                                            <div class="col-6">
                                                                <input type="date" class="form-control" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['value'] : ''} onChange={(e) => storeCustomMetaDataValue(e, item)} />
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    }

                                                    {item?.type == 'url' &&
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="is">is</option>
                                                                    <option value="is not">is not</option>
                                                                </select>
                                                            </div>

                                                            <div class="col-6">
                                                                <input type="url" placeholder="Enter a URL" class="form-control" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['value'] : ''} onChange={(e) => storeCustomMetaDataValue(e, item)} />
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    }

                                                    {item?.type == 'decimal' &&
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="is">is</option>
                                                                    <option value="is not">is not</option>
                                                                </select>
                                                            </div>

                                                            <div class="col-6">
                                                                <input type="number" placeholder="Enter a Decimal number" class="form-control" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['value'] : ''} onChange={(e) => storeCustomMetaDataValue(e, item)} />
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    }

                                                    {item?.type == 'email' &&
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="is">is</option>
                                                                    <option value="is not">is not</option>
                                                                </select>
                                                            </div>

                                                            <div class="col-6">
                                                                <input type="email" placeholder="Enter a email" class="form-control" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['value'] : ''} onChange={(e) => storeCustomMetaDataValue(e, item)} />
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    }

                                                    {item?.type == 'integer' &&
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="is">is</option>
                                                                    <option value="is not">is not</option>
                                                                </select>
                                                            </div>

                                                            <div class="col-6">
                                                                <input type="number" placeholder="Enter a number" class="form-control" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['value'] : ''} onChange={(e) => storeCustomMetaDataValue(e, item)} />
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    }

                                                    {item?.type == 'time' &&
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="is">is</option>
                                                                    <option value="is not">is not</option>
                                                                </select>
                                                            </div>

                                                            <div class="col-6">
                                                                <input type="time" class="form-control" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['value'] : ''} onChange={(e) => storeCustomMetaDataValue(e, item)} />
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    }

                                                    {item?.type == 'list' &&
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="includes">includes</option>
                                                                    <option value="excludes">excludes</option>
                                                                </select>
                                                            </div>

                                                            <div className={`col-6 ${theme?.skin == 'light' ? 'light-theme' : 'dark-theme'}`}>
                                                                {/* react select with multiple select */}
                                                                <Select
                                                                    classNamePrefix="react-select"
                                                                    isSearchable={true}
                                                                    menuShouldScrollIntoView={true}
                                                                    isMulti={true}
                                                                    isClearable={false}
                                                                    closeMenuOnSelect={false}
                                                                    placeholder="Select an option"
                                                                    styles={reactSelectCustomStyles}
                                                                    components={{ animatedComponents }}
                                                                    options={item?.options &&
                                                                        item.options?.map((value) => ({
                                                                            value: value,
                                                                            label: value
                                                                        }))
                                                                    }
                                                                    value={
                                                                        item.name == "list field" &&
                                                                            customMetaDataValues &&
                                                                            customMetaDataValues[item.name] != undefined &&
                                                                            Array.isArray(customMetaDataValues?.[item.name]?.["value"])
                                                                            ? customMetaDataValues?.[item.name]?.["value"]?.map((val) => ({
                                                                                value: val,
                                                                                label: val,
                                                                            }))
                                                                            : []
                                                                    }

                                                                    onChange={(selectedOptions) => {
                                                                        const selectedValues = selectedOptions ? selectedOptions?.map((option) => option?.value) : []
                                                                        storeCustomMetaDataValue({ target: { value: selectedValues } }, item)
                                                                    }}
                                                                />

                                                                {/* normal select with single select */}
                                                                {/* <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['value'] : ''} onChange={(e) => storeCustomMetaDataValue(e, item)}>
                                                            {item.options && item.options.map((opt, index) => (
                                                                <>
                                                                    <option value="" disabled hidden>Select an option</option>
                                                                    <option key={index} value={`${opt}`}>{opt}</option>
                                                                </>
                                                            ))}
                                                        </select> */}
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    }


                                                    {item?.type === 'boolean' && (
                                                        <>
                                                            <div class="col-3">
                                                                <select class="form-select" value={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) ? customMetaDataValues[item.name]['filter'] : ''} onChange={(e) => storeCustomMetaDataFilter(e, item)}>
                                                                    <option value="is">is</option>
                                                                    <option value="is not">is not</option>
                                                                </select>
                                                            </div>

                                                            <div class="col-6">
                                                                <div className="form-check form-check-inline">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name={`radio_${item._id}`}
                                                                        id={`radio_yes_${item._id}`}
                                                                        value="yes"
                                                                        checked={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) && customMetaDataValues[item.name]['value'] == 'yes'}
                                                                        onChange={(e) => storeCustomMetaDataValue(e, item)}
                                                                    />
                                                                    <label
                                                                        className="form-check-label"
                                                                        htmlFor={`radio_yes_${item._id}`}
                                                                    >
                                                                        Yes
                                                                    </label>
                                                                </div>

                                                                <div className="form-check form-check-inline">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name={`radio_${item._id}`}
                                                                        id={`radio_no_${item._id}`}
                                                                        value="no"
                                                                        checked={(customMetaDataValues && customMetaDataValues?.[item.name] != undefined) && customMetaDataValues[item.name]['value'] == 'no'}
                                                                        onChange={(e) => storeCustomMetaDataValue(e, item)}
                                                                    />
                                                                    <label
                                                                        className="form-check-label"
                                                                        htmlFor={`radio_no_${item._id}`}
                                                                    >
                                                                        No
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div class="col-1 d-flex align-items-center justify-content-center">
                                                                <Icon name="trash-empty" className='deleteclass' onClick={(e) => handleCustomMetaDataDelete(e, item)} />
                                                            </div>
                                                        </>
                                                    )}

                                                </div>
                                            ))}
                                        </li>

                                        {/* plus btn & options */}
                                        <li>
                                            <Icon name="plus" onClick={() => setDropdownOpen(prev => !prev)} style={{ cursor: 'pointer' }} />
                                            {dropdownOpen &&
                                                <div className="dropdown-preview">
                                                    <div className="dropdown-menu custommetadropdownlist">
                                                        {customMetaDataList?.length != 0 &&
                                                            <>
                                                                <CustomDropdownItem label="Custom Metadata" isHeader />
                                                                {customMetaDataList && customMetaDataList?.map((item, idx) => (
                                                                    <li key={`${item.name}_${idx}`} onClick={() => handleCustomMetaData(item)}>
                                                                        <a href="#links" onClick={(ev) => ev.preventDefault()}> {item.name}</a>
                                                                    </li>
                                                                ))}
                                                            </>
                                                        }
                                                    </div>
                                                </div>
                                            }

                                        </li>

                                    </ul>
                                </div>
                            </div>

                        </div >
                    )}
                </div>

                <div className="searchbadge" ref={createdTimeBadgeRef}>
                    <Badge
                        pill
                        color={selectedCreatedTime?.length ? "outline-warning" : "outline-light"}
                        className={`createdTimeBadge ${location.pathname.includes('search') ? 'mainPage-createdTime-width-badge' : 'createdTime-width-badge'}`}
                    >
                        {selectedCreatedTime?.length ? (
                            <>
                                Created Time &nbsp;
                                <span className="badge-text">
                                    ({selectedCreatedTime?.length})
                                </span>
                                <span className="close-icon" onClick={(e) => {
                                    e.stopPropagation();
                                    // setSearchFilters(prev => ({ ...prev, createdTime: [] }))
                                    setSelectedCreatedTime([])
                                    updateQueryParam({
                                        searchTerm,
                                        selectedtype,
                                        selectedSearchIn,
                                        defaultMetaDataValues,
                                        customMetaDataValues,
                                        selectedCreatedTime: [],
                                        selectedLastUpdateTime,
                                        currentDirectory
                                    })
                                }}>
                                    <Icon name="cross" />
                                </span>
                            </>
                        ) : (
                            <>Created Time<Icon name="chevron-down" /></>
                        )}
                    </Badge>
                    {isCreatedTimeClicked && (
                        <div ref={createdTimeDropdownRef} className={`selectPickercreatedTime ${theme?.skin == 'light' ? 'light-theme' : 'dark-theme'}`} style={createdTimeDropdownStyle} >
                            <div className="dropdown-preview">
                                <div className="dropdown-menu">
                                    <ul className="link-list-plain no-bdr sm">
                                        <DateRangePicker
                                            onChange={handleSelect}
                                            showSelectionPreview={true}
                                            moveRangeOnFirstSelection={false}
                                            months={2}
                                            ranges={selectedCreatedTime.length == 0 ? [
                                                {
                                                    startDate: new Date(),
                                                    endDate: addDays(new Date(), 0),
                                                    key: 'selection',
                                                }
                                            ] : selectedCreatedTime}
                                            direction="horizontal"
                                        />
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="searchbadge" ref={LastUpdateTimeBadgeRef}>
                    <Badge
                        pill
                        color={selectedLastUpdateTime?.length ? "outline-warning" : "outline-light"}
                        className={`lastUpdatedTimeBadge ${location.pathname.includes('search') ? 'mainPage-lastUpdatedTime-width-badge' : 'lastUpdatedTime-width-badge'}`}
                    >
                        {selectedLastUpdateTime?.length ? (
                            <>
                                Last Updated &nbsp;
                                <span className="badge-text">
                                    ({selectedLastUpdateTime?.length})
                                </span>
                                <span className="close-icon" onClick={(e) => {
                                    e.stopPropagation();
                                    // setSearchFilters(prev => ({ ...prev, updatedTime: [] }))
                                    setSelectedLastUpdateTime([])
                                    updateQueryParam({
                                        searchTerm,
                                        selectedtype,
                                        selectedSearchIn,
                                        defaultMetaDataValues,
                                        customMetaDataValues,
                                        selectedCreatedTime,
                                        selectedLastUpdateTime: [],
                                        currentDirectory
                                    })
                                }}>
                                    <Icon name="cross" />
                                </span>
                            </>
                        ) : (
                            <>Last Updated<Icon name="chevron-down" /></>
                        )}
                    </Badge>

                    {isLastUpdateTimeClicked && (
                        <div ref={LastUpdateTimeDropdownRef} className={`selectPickerLastUpdatedTime ${theme?.skin == 'light' ? 'light-theme' : 'dark-theme'}`} style={LastUpdateTimeDropdownStyle}>
                            <div className="dropdown-preview">
                                <div className="dropdown-menu">
                                    <ul className="link-list-plain no-bdr sm">
                                        <DateRangePicker
                                            onChange={handleLastUpdatedSelect}
                                            showSelectionPreview={true}
                                            moveRangeOnFirstSelection={false}
                                            months={2}
                                            ranges={selectedLastUpdateTime.length == 0 ? [
                                                {
                                                    startDate: new Date(),
                                                    endDate: addDays(new Date(), 0),
                                                    key: 'selection',
                                                }
                                            ] : selectedLastUpdateTime}
                                            direction="horizontal"
                                        />
                                    </ul>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

            </div>

            {((location.pathname != '/search' && searchResult && !showHistory) || (location.pathname == '/search' && searchResult)) &&
                <>
                    <Nav tabs>
                        <NavItem className="px-2">
                            <NavLink
                                tag="a"
                                href="#tab"
                                className={classnames({ active: selectedtype == "All" })}
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    navtoggle("All");
                                }}
                            >
                                All
                            </NavLink>
                        </NavItem>
                        <NavItem className="px-2">
                            <NavLink
                                tag="a"
                                href="#tab"
                                className={classnames({ active: selectedtype == "Word" })}
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    navtoggle("Word");
                                }}
                            >
                                Word
                            </NavLink>
                        </NavItem>

                        <NavItem className="px-2">
                            <NavLink
                                tag="a"
                                href="#tab"
                                className={classnames({ active: selectedtype == "PDF" })}
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    navtoggle("PDF");
                                }}
                            >
                                PDF
                            </NavLink>
                        </NavItem>
                        <NavItem className="px-2">
                            <NavLink
                                tag="a"
                                href="#tab"
                                className={classnames({ active: selectedtype == "Excel" })}
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    navtoggle("Excel");
                                }}
                            >
                                Excel
                            </NavLink>
                        </NavItem>
                        <NavItem className="px-2">
                            <NavLink
                                tag="a"
                                href="#tab"
                                className={classnames({ active: selectedtype == "PPT" })}
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    navtoggle("PPT");
                                }}
                            >
                                PPT
                            </NavLink>
                        </NavItem>

                        <NavItem className="px-2">
                            <NavLink
                                tag="a"
                                href="#tab"
                                className={classnames({ active: selectedtype == "Images" })}
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    navtoggle("Images");
                                }}
                            >
                                Images
                            </NavLink>
                        </NavItem>
                        <NavItem className="px-2">
                            <NavLink
                                tag="a"
                                href="#tab"
                                className={classnames({ active: selectedtype == "Videos" })}
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    navtoggle("Videos");
                                }}
                            >
                                Videos
                            </NavLink>
                        </NavItem>
                        <NavItem className="px-2">
                            <NavLink
                                tag="a"
                                href="#tab"
                                className={classnames({ active: selectedtype == "Folders" })}
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    navtoggle("Folders");
                                }}
                            >
                                Folders
                            </NavLink>
                        </NavItem>
                        <NavItem className="px-2">
                            <NavLink
                                tag="a"
                                href="#tab"
                                className={classnames({ active: selectedtype == "Forms" })}
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    navtoggle("Forms");
                                }}
                            >
                                Forms
                            </NavLink>
                        </NavItem>
                        <NavItem className="px-2">
                            <NavLink
                                tag="a"
                                href="#tab"
                                className={classnames({ active: selectedtype == "Others" })}
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    navtoggle("Others");
                                }}
                            >
                                Others
                            </NavLink>
                        </NavItem>


                    </Nav>

                </>
            }

            {(location.pathname != '/search' && showHistory) &&
                <>
                    {searchHistory.length > 0 ? (
                        <div className=" mb-2 ">
                            {searchHistory.map((item, index) => (
                                <span key={index} className="px-2 py-1 d-flex align-items-center searchHistory"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setSearchTerm(item);
                                        handleSubmit1(item);
                                        //handleSearchModal(item)
                                        /*searchapicall({
                                            page: 1,
                                            searchTerm: item,
                                            selectedtype,
                                            selectedSearchIn,
                                            defaultMetaDataValues,
                                            customMetaDataValues,
                                            selectedCreatedTime,
                                            selectedLastUpdateTime,
                                            currentDirectory
                                        })*/
                                    }}
                                ><Icon name="history" /> &ensp;{item}</span>
                            ))}
                        </div>
                    ) : (
                        <div className="m-5" style={{ textAlign: "center" }}>
                            <img src={NoSearch} alt="NoSearch" width={250} height={250} />
                            <p>No Items Searched!</p>
                        </div>
                    )}
                </>
            }



            {/* div opening */}
            {/* {istypeFilterClicked && (
                <div ref={typeDropdownref} className="selectPickertype" style={typeDropdownStyle}>
                    <div className="dropdown-preview">
                        <div className="dropdown-menu">
                            <ul className="link-list-plain no-bdr sm">
                                {typeOptions.map((item) => (
                                    <li key={item.id} onClick={() => toggletypeSelection(item)}>
                                        <a href="#links" onClick={(ev) => ev.preventDefault()}>
                                            &nbsp; &nbsp;{item.name}
                                            {selectedtype.includes(item.id) && (<span className="tickMark"> &nbsp; ✔</span>)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            )} */}


            {/* {isFoldersFilterClicked && (
                <div ref={foldersDropdownRef} className="selectPickerFolders" style={folderDropdownStyle}>
                    <div className="dropdown-preview">
                        <DropdownMenu>
                            <h6 className="modal-title m-2">Choose Folder</h6>
                            {folderOptions?.length == 0 ? <center className="m-5">No Folders!</center> :
                                <CheckTree
                                    height={"18rem"}
                                    searchable={false}
                                    data={folderOptions}
                                    value={folderLevels}
                                    onChange={(value) => handleChange(value)}
                                // onExpand={(expandedNodes, activeNode, isExpand) => {
                                //     handleExpand(activeNode, isExpand)
                                // }}
                                />
                            }
                        </DropdownMenu>
                    </div>
                </div>
            )} */}








        </>
    )
}

export default SearchFilters;