import React, { useState, useEffect } from "react";
import Icon from "../../../../../components/icon/Icon";
import Button from "../../../../../components/button/Button";
import { useSelector } from "react-redux"
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge, Pagination, PaginationItem, PaginationLink, Modal, Breadcrumb, BreadcrumbItem, Dropdown, Card } from "reactstrap";

import {
    Block,
    BlockHead,
    BlockHeadContent,
    BlockTitle,
    BlockDes,
    BackTo,
    PreviewCard,
    ReactDataTable,
    PaginationComponent,
    BlockHeadSub,
} from "../../../../../components/Component";
import { useLocation, useNavigate } from "react-router-dom";
import * as API from '../../../../../utils/API';
import { useDispatch } from "react-redux";
import { saveSearchPagination, updateCurrentLocation, updateLoaderFlag } from "../../../../../redux/folderSlice";
import { getFileType } from "../../../../../utils/helper";
import toast from "react-hot-toast";
import { Lightbox } from "react-modal-image";
import Viewer from "../../modals/Viewer";
import DynamicBreadcrumbs from "../../../../../components/MyTable/DynamicBreadcrumbs";
import { setDownloadFileAction } from "../../../../../redux/download/downloadAction";

export const SearchTable = ({ action, isCompact, data, perPage, totalCount, handlePagination, currentPage }) => {
    const [aiModal, setaiModal] = useState(false)

    const [viewDoc, setViewDoc] = useState({})
    const [videoDuration, setVideoDuration] = useState(0)
    const [viewerModal, setViewerModal] = useState(false);

    const [imageFlag, setImageFlag] = useState(false);
    const [imageFile, setImageFile] = useState({})

    const [codeContent, setCodeContent] = useState('')

    const [aiclickedfilename, setaiClickedFileName] = useState('')
    const [aiLoader, setAILoader] = useState(false)
    const [aiResult, setAIResult] = useState(null)


    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const store = useSelector(state => state.folders)

    const canshowsummary = () => {
        let aienabled= true
        if(aienabled==true){
            return true
        }else{
            return aienabled
        }
    }


     const convertToSeconds = (duration) => {
            if(duration==0)
                return 0
    
            const [minutes, seconds] = duration.toString().split(".").map(Number);
            return minutes ;
          };
        
    //breadcrumb
    const [isOpenbread, setIsOpenBread] = useState(false);
    const togglebread = () => { setIsOpenBread(!isOpenbread) }

    const onClickSearchRecords = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/details/${item._source.id}`)
    }

    const onClickAISUmmary = async (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        // console.log(item, "itemitem")
        if (canshowsummary()){
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


    const downloadDoc = async (e, item) => {
        e.preventDefault();
        e.stopPropagation();

        if (item.type == 'folder') {
            // dispatch(updateLoaderFlag({ loader: true, text: 'Downloading' }))
            dispatch(setDownloadFileAction([{ file: [], folder: [item._source["id"]], fileName: "Zipping", extension: "", APIType: 'fileDownloadAPI', type: "bulk" }]))
            // await API.bulkDocsDownload([], [item._source["id"]]);
            // dispatch(updateLoaderFlag({ loader: false, text: '' }))
        }
        else if (item.type == 'file') {
            // dispatch(updateLoaderFlag({ loader: true, text: 'Downloading' }))
            dispatch(setDownloadFileAction([{ file: item._source["id"], folder: [], fileName: item._source["name"], extension: item._source.fileType, APIType: 'fileDownloadAPI', type: "single" }]))
            // await API.downloadedFile(item._source["id"], item._source["name"].split('.')[0], '', item._source.fileType)
            // dispatch(updateLoaderFlag({ loader: false, text: '' }))
        }
    }


    async function openFile(e, type, item) {
        // e.preventDefault();
        // e.stopPropagation();
        let currentSelection=item?.['_source'];
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
            return;
        }

        if (type == 'folder') {
            dispatch(updateCurrentLocation({
                drive: currentSelection
            }))
            navigate(`/folder/${currentSelection.id}`)
        } else {
            if (type != 'form') {
                const docType = getFileType(currentSelection.fileType);
                if (docType == 'unknown') {
                    toast.remove()
                    return toast.error('Unsupported File Type');
                }
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
                } else {
                    if (docType == 'image') {
                        setImageFile(currentSelection);
                        setImageFlag(true);
                    }
                    else if (docType == 'code') {
                        const fileResponse = await API.readFile(currentSelection.id);
                        if (!fileResponse.status) {
                            toast.remove()
                            return toast.error('Error Reading File');
                        }
                        setCodeContent(fileResponse.content);
                        setViewDoc(currentSelection);
                        toggleViewerModal();
                    }
                    else {
                        setViewDoc(currentSelection);
                        toggleViewerModal();
                    }
                }
            }
        }
    }


    const toggleViewerModal = () => {
        setViewerModal(!viewerModal)
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
                                    className="dropdown-toggle btn btn-icon justify-content-center"
                                    style={{ width: "30px", height: "30px", padding: 0 }}
                                >
                                    <Icon name={'more-h'} />
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
                        active={index === showarr.length - 1}
                        onClick={() => navigate(item.link)}
                    >
                        {item.name}
                    </BreadcrumbItem>
                ))}
            </Breadcrumb>
        );
    }
    // console.log(aiResult, "aiResult")
    // console.log(currentPage, "currentPage")

    return (
        <>

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

            <table className={`table table-tranx ${isCompact ? "is-compact" : ""}`}>
                <thead>
                    <tr className="tb-tnx-head">
                        {/* <th className="tb-tnx-id">
                        <span className="">#</span>
                    </th> */}
                        <th className="tb-tnx-info">
                            <span className="tb-tnx-desc d-sm-inline-block">
                                <span>Name</span>
                            </span>
                            <span className="tb-tnx-date d-md-inline-block">
                                {/* <span className="d-md-none">Date</span> */}
                                <span className=" d-md-block">
                                    <span>Score</span>
                                </span>
                            </span>
                        </th>
                        {/* <th className="tb-tnx-amount is-alt">
                        <span className="tb-tnx-total">Total</span>
                        <span className="tb-tnx-status d-none d-md-inline-block">Status</span>
                    </th> */}
                        {action && (
                            <th className="tb-tnx-action">
                                <span>&nbsp;</span>
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data
                        && data?.map((item) => {
                            return (
                                <>
                                    <tr key={item._id} className="tb-tnx-item">
                                        <td className="tb-tnx-info">


                                            <Breadcrumb className="breadcrumb-arrow">
                                                {item._source.hierarchy?.length > 4 ? printBreadCrumbs(item._source.hierarchy) : item._source.hierarchy.map((bitem, idx) => (

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

                                            <div className="tb-tnx-desc">
                                                <span className="title" style={{ cursor: 'pointer' }} onClick={(e) => openFile(e, item?.['type'], item)}>
                                                    <span> {item.type == 'file' ? <Icon name="file-docs" /> : <Icon name="folder-list" />} </span>
                                                    {item._source.name}
                                                </span>
                                            </div>
                                            <div className="tb-tnx-date">
                                                <span className="date">{item._score}</span>
                                            </div>
                                        </td>


                                        <td className="tb-tnx-action">
                                            {item.type == 'file' && canshowsummary() && item.content!="" && <Icon name="graphql" title="AI Summary" style={{ marginRight: "1rem", cursor: 'pointer' }} onClick={(e) => onClickAISUmmary(e, item)}></Icon>}
                                            <Icon name="setting-alt" title="Details" style={{ marginRight: "1rem", cursor: 'pointer' }} onClick={(e) => onClickSearchRecords(e, item)} />
                                            {item.type != 'form' && (<Icon name="download" title="Download" style={{ cursor: 'pointer' }} onClick={(e) => downloadDoc(e, item)} />)}
                                        </td>

                                    </tr>
                                </>

                            )
                        })}
                </tbody>

            </table>

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


            <div className="d-flex justify-content-end m-2">
                <PaginationComponent
                    itemPerPage={perPage}
                    totalItems={totalCount}
                    paginate={handlePagination}
                    currentPage={currentPage}
                />
            </div>
        </>
    );
};

