import React, { useState, useRef, useEffect } from 'react'
import classNames from 'classnames';
import { useFileManager, useFileManagerUpdate } from "../components/Context";
import icons from './Icons';
import { Modal, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Card, Tooltip } from "reactstrap";
import { Icon, UserAvatar } from "../../../../components/Component";
import Swal from "sweetalert2";
import CreateFolder from "../modals/CreateFolder";
import Details from "../modals/Details";
import Share from "../modals/Share";
import Copy from "../modals/Copy";
import Move from "../modals/Move";
import { useLocation, useNavigate } from 'react-router';
// import multipleDocs from '../../../../assets/images/multiple_documents.png'
import multipleDocs from '../../../../assets/images/Move.svg'
import { Spinner } from "reactstrap"
import { useDispatch } from 'react-redux';
import {
    deleteSubFolder,
    folderMove,
    saveWorkflowCurrClickedItem,
    setFiles,
    setDocuments,
    toggleStarred,
    updateCurrentLocation,
    updateLoaderFlag,
    updateMoveFlag,
    saveCurrentSection
} from '../../../../redux/folderSlice';
import { useSelector } from 'react-redux';
import RenameFolder from '../modals/RenameFolder';
import { useDrag, useDrop, useDragDropManager, DragPreviewImage } from 'react-dnd';
import { formatFileSize } from '../../../../utils/fileDetails';
import * as API from '../../../../utils/API';
import './Toolbar.css';
import toast, { Toaster } from 'react-hot-toast';
import MultiShare from '../modals/Multishare';
import CopyForms from '../modals/CopyForms';
import { findLogoName, viewUserTimezoneInDiffFormat } from '../../../../utils/Utils';
import ShareForm from '../modals/ShareForms';
import Viewer from '../modals/Viewer';
import { getFileType } from '../../../../utils/helper';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Lightbox } from "react-modal-image";
import moment from 'moment';
// import DragLayerComponent from './Drag';
import { useTheme } from '../../../../layout/provider/Theme';

// import ContextMenu from './ContextMenu/contextMenu';
// import useCustomContextMenu from './ContextMenu/useCustomContextMenu';
import WorkflowVersion from '../views/WorkflowVersion';
import { setDownloadFileAction } from '../../../../redux/download/downloadAction';

// currentUrl = { currentUrl }
// formSelected = { formSelected }
// openCopyModal = {() => openCopyModal()}
// openMoveModal = {() => openMoveModal()}
// deleteDocuments = {() => deleteDocuments()}
// openMultiShareFormModal = {() => openMultiShareFormModal()}
// openMultiShareModal = {() => openMultiShareModal()}
// downloadDocuments = {() => downloadDocuments()}


const File = ({
    item,
    fileView,
    page,
    selectedFiles,
    setSelectedFiles,
    setCurrentUrl,
    setFolderSelected,
    setFormSelected,
    setFormAloneSelected,
    fileListLoader,

    currentUrl,
    formSelected,
    openCopyModal,
    openMoveModal,
    deleteDocuments,
    openMultiShareFormModal,
    openMultiShareModal,
    downloadDocuments

}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const store = useSelector(state => state.folders);
    const theme = useTheme()

    const listFolders = useSelector(state => state.folders.folders);
    const savedFiles = useSelector(state => state.folders.fileRepo)

    const { fileManagerUpdate } = useFileManagerUpdate();
    const [detailModal, setDetailModal] = useState(false);
    const [shareModal, setShareModal] = useState(false);
    const [shareFormModal, setShareFormModal] = useState(false);
    const [copyModal, setCopyModal] = useState(false);
    const [moveModal, setMoveModal] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [renameModal, setRenameModal] = useState(false);
    const [folderId, setFolderId] = useState('')
    const [folderName, setFolderName] = useState('');
    const [copySelected, setCopySelected] = useState({});
    const [copyFormModal, setCopyFormModal] = useState(false);
    const [viewDoc, setViewDoc] = useState({})
    const [viewerModal, setViewerModal] = useState(false);
    const [docType, setDocType] = useState('');

    const [imageFlag, setImageFlag] = useState(false);
    const [imageFile, setImageFile] = useState({})

    const [revisionModal, setRevisionModal] = useState(false);
    const [revisionInputDatas, setRevisionInputDatas] = useState(null)
    const [lastRevisionNo, setLastRevisionNo] = useState('-')
    const [workflowEnableBtn, setWorkflowEnableBtn] = useState(false)


    // const { isVisible, position, menuItem, showContextMenu, setIsVisible, menuRef, menuOp } = useCustomContextMenu()


    const [codeContent, setCodeContent] = useState('')

    const [tooltipOpen, setTooltipOpen] = useState({});
    const toolTipToggle = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const toggleDetailModal = () => {
        setDetailModal(!detailModal);
    };
    const toggleShareModal = () => {
        setShareModal(!shareModal);
    };
    const toggleShareFormModal = () => {
        setShareFormModal(!shareFormModal);
    };
    const toggleViewerModal = () => {
        setViewerModal(!viewerModal);
    };
    const toggleCopyModal = () => {
        setCopyModal(!copyModal);
    };
    const toggleCopyFormModal = () => {
        setCopyFormModal(!copyFormModal);
    };
    const toggleMoveModal = () => {
        setMoveModal(!moveModal);
    };
    const toggleCreateModal = () => {
        setCreateModal(!createModal);
    };
    const toggleRenameModal = () => {
        setRenameModal(!renameModal);
    };
    const toggleRevisionModal = async () => {
        setRevisionModal(!revisionModal);
    };

    const downloadFile = async (file) => {
        // dispatch(updateLoaderFlag({ loader: true, text: 'Downloading' }))
        if (file.type == 'folder') {
            dispatch(setDownloadFileAction([{ file: [], folder: [file._id], fileName: "Zipping", extension: "", APIType: 'fileDownloadAPI', type: "bulk" }]))
            // await API.bulkDocsDownload([], [file._id]);
        } else {
            dispatch(setDownloadFileAction([{ file: file._id, folder: [], fileName: file.name.split('.')[0], extension: file.fileType, APIType: 'fileDownloadAPI', type: "single" }]))
            // await API.downloadedFile(file._id, file.name.split('.')[0], file.storageInfo["contentType"], file.fileType)
        }
        // dispatch(updateLoaderFlag({ loader: false, text: '' }))
    };


    async function goToNested(e, currentSelection) {
        if (document.querySelectorAll(".modal.fade.show").length > 0) {
            return;
        }
        if (currentSelection.type == 'folder') {
            dispatch(updateCurrentLocation({
                drive: currentSelection
            }))
            navigate(`/folder/${currentSelection._id}`)
        } else {
            if (currentSelection.type != 'form') {
                const docType = getFileType(currentSelection.fileType);
                if (docType == 'unknown') return toast.error('Unsupported File Type');
                if ((docType == 'word') || (docType == 'excel') || (docType == 'ppt') || (docType == 'pdf')) {
                    localStorage.setItem('currentLocation', JSON.stringify(location.pathname));
                    window.open(`${window.location.origin}/#/${localStorage.getItem("workspace_id")}/file/view/${currentSelection._id}`, '_blank', 'noopener,noreferrer');
                    // navigate(`/file/view/${currentSelection._id}`)
                } else {

                    if (docType == 'image') {
                        setImageFile(currentSelection);
                        setImageFlag(true);
                    } else if (docType == 'code') {
                        const fileResponse = await API.readFile(currentSelection._id);
                        if (!fileResponse.status) return toast.error('error reading file'.replace(/\b\w/g, char => char.toUpperCase()));
                        setCodeContent(fileResponse.content);
                        setViewDoc(currentSelection);
                        toggleViewerModal();
                    } else {
                        setViewDoc(currentSelection);
                        toggleViewerModal();
                    }
                }
            } else if (currentSelection.type == 'form') {
                navigate(`/details/${currentSelection._id}`)
            }
        }
    }

    const getFileNameWithoutExtension = async (fileName) => {
        const parts = fileName.split('.')
        return parts.length > 1 ? parts.slice(0, -1).join('.') : fileName
    }

    const deleteFile = async (item) => {
        let deleteRespo;
        let deletetext = '';
        if (item.type == 'folder') {
            deletetext = `Are you sure you want to delete folder '${item.name}'?`
        } else if (item.type == 'file') {
            deletetext = `Are you sure you want to delete file '${await getFileNameWithoutExtension(item.name)}'?`
        } else {
            deletetext = `Are you sure you want to delete form '${item.name}'?`
        }
        Swal.fire({
            title: deletetext,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async respo => {
            if (respo.isConfirmed) {
                dispatch(updateLoaderFlag({ loader: true, text: 'Deleting...' }))
                if (item.type == 'folder') {
                    deleteRespo = await API.multiDeleteDocument([], [item._id], []);
                }
                else if (item.type == 'form') {
                    deleteRespo = await API.multiDeleteDocument([], [], [item._id]);
                }
                else {
                    deleteRespo = await API.multiDeleteDocument([item._id], [], []);
                }
                if (!deleteRespo.status) {
                    dispatch(updateLoaderFlag({ loader: false, text: '' }))
                    return toast.error(`error in deleting documents`.replace(/\b\w/g, char => char.toUpperCase()));
                }
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
                toast.success(`${item.name.includes('.') ? item.name.substring(0, item.name.lastIndexOf('.')) : item.name} deleted successfully`);
                dispatch(updateMoveFlag({}))
            }
        })

    }

    function copy(item) {
        setCopySelected(item)
        if (item.type == 'form') {
            setCopyFormModal(true);
        } else {
            setCopyModal(true)
        }
    }

    function move(item) {
        setCopySelected(item)
        setMoveModal(true)
    }

    const setUpWorkflow = async (item) => {

        //before his parent & ancestor parent check himself
        if (item['workflow'] != null) {
            // navigate(`/workflow/setUpWorkflow/${item['type']}/${item['_id']}/edit/${item['workflow']?.['workflowId']}`)
            navigate(`/workflow/setUpWorkflow/${item['type']}/${item['_id']}/edit`)

            return
        }

        navigate(`/workflow/setUpWorkflow/${item['type']}/${item['_id']}/create`)
    }

    const startWorkflow = async (item) => {

        //before his parent & ancestor parent check himself
        let detailsValue = await fetchDetails(item['_id'])
        let { status, message, lastRevisionNo } = await checkBeforeEnableThisBtn(detailsValue['data']['_id'], detailsValue['type'])

        if (message == "File is in under Workflow!") {
            toast("This file is already in a workflow" || message, { icon: '⚠️' });
            setRevisionModal(false)
            return
        }

        //check his parent & ancestor parent worklow is present or not,if present update it in current item
        let pathRespo = await API.getDirectoryPath(item['_id']);
        if (!pathRespo.status) return toast.error(`Some Error Occured While fetching ${item['name']} Parent! Refresh and try again`);

        const result = pathRespo.data.reduce((acc, path) => {
            if (path._id != item._id && path.workflow !== null) {
                acc.hasWorkflow = true;
                acc.workflows.push(path);
            }
            return acc
        }, { hasWorkflow: false, workflows: [] })

        setLastRevisionNo(lastRevisionNo)
        setRevisionInputDatas({ result, DetailsData: detailsValue, item })

        if (result['hasWorkflow']) {
            await toggleRevisionModal(true)
        }
        else {
            // if not setUp the workflow
            // toast(`Please SetUp the Workflow!`, { icon: '⚠️' })
            navigate(`/workflow/setUpWorkflow/${item['type']}/${item['_id']}/create`)
        }

    }

    const fetchDetails = async (id) => {
        let detailsResponse = await API.getDetails(id)

        if (!detailsResponse['data']) {
            toast.error(`Unable to fetch Details from Details API`.replace(/\b\w/g, char => char.toUpperCase()))
            return
        }

        let { status } = detailsResponse
        if (!status) {
            toast.error(`${detailsResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
            return
        }

        return detailsResponse.data
    }

    const checkBeforeEnableThisBtn = async (detailsId, detailsType) => {
        let workflowDetailResponse = await API.checkFileInWorkflow(detailsId, detailsType)
        let { status, message, lastRevisionNo } = workflowDetailResponse
        return { status, message, lastRevisionNo }
    }


    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: 'file',
        item: {
            files: selectedFiles,
            file: { id: item._id, type: item.type, name: item.name }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [selectedFiles, item]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'file',
        drop: (draggedItem) => dragHandler(draggedItem, item),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    const dragHandler = (source, dest) => {
        if (source.files?.length == 0) {
            handleDrop(source.file?.id, dest._id, source.file?.type, dest.type, dest.name, source.file?.name)
        } else {
            dispatch(updateLoaderFlag({ loader: true, text: 'Moving Files' }))
            if (dest.type == 'folder') {
                handleMultidrop(source.files, dest._id, dest.name)
            } else {
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
            }
        }
    }

    const handleDrop = async (draggedId, targetId, draggedType, targetType, targetName, draggedName) => {
        if (draggedId != targetId && targetType == 'folder') {
            dispatch(updateLoaderFlag({ loader: true, text: 'Moving Files' }))
            let moveRespo;
            if (draggedType == 'folder') {
                moveRespo = await API.docsMove([], [draggedId], [], targetId)
            } else if (draggedType == 'form') {
                moveRespo = await API.docsMove([], [], [draggedId], targetId)
            } else {
                moveRespo = await API.docsMove([draggedId], [], [], targetId)
            }
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            if (!moveRespo.status) {
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
                return toast.error(`error occured during moving ${draggedName}`.replace(/\b\w/g, char => char.toUpperCase()));
            }
            dispatch(updateMoveFlag({}))
            toast.success(`${draggedName} moved to ${targetName}`);
        }
    };

    const handleMultidrop = async (selectedFiles, targetId, targetName) => {
        const draggedItems = {
            folders: [],
            files: [],
            forms: []
        }
        selectedFiles.forEach(elem => {
            if (elem.type == 'folder') {
                draggedItems.folders.push(elem._id)
            }
            else if (elem.type == 'form') {
                draggedItems.forms.push(elem._id)
            }
            else {
                draggedItems.files.push(elem._id)
            }
        })
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        let moveRespo = await API.docsMove(draggedItems.files, draggedItems.folders, draggedItems.forms, targetId);
        if (!moveRespo.status) {
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            return toast.error(`error occured during moving items to  ${targetName}`.replace(/\b\w/g, char => char.toUpperCase()));
        }
        dispatch(updateMoveFlag({}))
        toast.success(`Items moved to ${targetName}`)
    }


    const handleStarred = async (e, id, type, item) => {
        e.preventDefault();

        let starredResponse;
        let documents = store.starredRepo

        let index = documents.findIndex((item) => item._id.toString() == id);
        let userisPresent = false;
        if (index != -1) {
            userisPresent = documents[index]['starredWith']['users'].some(item => item == localStorage.getItem('userId'));
        }

        if (userisPresent == false) {
            starredResponse = await API.updateStarred(id, type, 'on')
            dispatch(toggleStarred({ index, userisPresent, file: item }))
            fetchList()
        }
        else {
            starredResponse = await API.updateStarred(id, type, 'off')
            dispatch(toggleStarred({ index, userisPresent, file: item }))
            fetchList()
        }
    }

    const fetchList = () => {
        if (!location) return;

        const path = location.pathname
        const starredRegex = /^\/starred\b/;

        const starredMatched = path.match(starredRegex)

        if (starredMatched) {
            fetchStarredList()
        }
    }


    const fetchStarredList = async () => {
        let sharedListResponse = await API.getStarredList()
        let { status } = sharedListResponse
        if (!status) return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))

        dispatch(setDocuments({
            files: sharedListResponse['data'],
            location: 'starred'
        }))
    }

    const selectFiles = async (e, item) => {
        if (e.ctrlKey) {

            let flag = false;

            if (selectedFiles?.some(selectedItem => selectedItem._id === item._id)) {

                var filteredFiles = selectedFiles.filter(selectedItem => selectedItem._id !== item._id)
                setSelectedFiles(filteredFiles);

                let hasFolder = filteredFiles?.some(selectedItem => selectedItem.type == 'folder')
                let hasForm = filteredFiles?.some(selectedItem => selectedItem.type == 'form')

                if (!hasForm) {
                    setFormSelected(false);
                }

                if (!hasFolder) {
                    setFolderSelected(false);
                }


            }
            else {
                setCurrentUrl(location.pathname);
                if (item.type == 'folder') {
                    setFolderSelected(true);
                }
                if (item.type == 'form') {

                    setFormSelected(true);
                }
                setSelectedFiles(selectedFiles => [...selectedFiles, item]);
            }
        } else {
            setCurrentUrl(location.pathname);
            if (item.type == 'folder') {
                setFolderSelected(true);
            }
            if (item.type == 'form') {

                setFormSelected(true);
            }
            setSelectedFiles([item])
        }
        // if(selectedFiles.every(val=>val.type!='form')){
        //     setFormSelected(false);
        // }
        // if(selectedFiles.every(val=>val.type!='folder')){
        //     setFolderSelected(false);
        // }
    };

    const fileStyle = (item) => {
        let classNames = "nk-file-item nk-file main ";

        if (isOver) {
            classNames += 'highlight'
        }

        if (theme.skin == 'light') {
            classNames += "light "
            if (selectedFiles?.some(selectedItem => selectedItem._id === item._id)) {
                classNames += 'backgroundBlueColor'
            }
            else {
                classNames += 'backgroundWhiteColor'
            }
        }

        if (theme.skin == 'dark') {
            classNames += "dark "
            if (selectedFiles?.some(selectedItem => selectedItem._id === item._id)) {
                classNames += 'backgroundSilverColor'
            }
            else {
                classNames += 'backgroundNoColor'
            }
        }

        return classNames
    }

    function openSharedWithView() {
        let sharedMembers = [];
        if (Array.isArray(item.sharedWithGroupMembers) && Array.isArray(item.sharedWithIndividualUsers)) {
            sharedMembers = [...item.sharedWithGroupMembers, ...item.sharedWithIndividualUsers]
        }
        if (item.createdBy == localStorage.getItem('userId') && sharedMembers.length > 0) {
            if (item.type == 'form') {
                setShareFormModal(true);
            } else {
                setShareModal(true);
            }
        }
    }

    function addShortcutIcon() {
        // if(item.type=='file'){
        //     return 'file-plus-fill'
        // }else if(item.type=='form'){
        //     return 'file-plus'
        // }else if(item.type=='folder'){
        //     return 'folder-plus'
        // }  
        return 'file-plus-fill'
    }

    const restore = async (item) => {
        let deleteRespo;
        let restoreText = 'document restored';
        dispatch(updateLoaderFlag({ loader: true, text: 'Restoring...' }))
        if (item.type == 'section') {
            restoreText = `${item.sectionName} restored successfully`
            deleteRespo = await API.restoreDocuments([], [], [], [item._id]);
        }
        if (item.type == 'folder') {
            restoreText = `${item.name} restored successfully`
            deleteRespo = await API.restoreDocuments([], [item._id], [], []);
        }
        else if (item.type == 'form') {
            restoreText = `${item.name} restored successfully`
            deleteRespo = await API.restoreDocuments([], [], [item._id], []);
        }
        else if (item.type == 'file') {
            restoreText = `${item.name.split('.')[0]} restored successfully`
            deleteRespo = await API.restoreDocuments([item._id], [], [], []);
        }
        if (!deleteRespo.status) {
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            return toast.error(`error in restoring documents`.replace(/\b\w/g, char => char.toUpperCase()));
        }
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        toast.success(restoreText)
        dispatch(updateMoveFlag({}))
        // if (item.type == 'section') {
        //     dispatch(createSection({
        //         id: item._id,
        //         name: item.sectionName
        //     }))
        // }
    }

    async function createDuplicate() {
        const path = location.pathname;
        const parentId = path.split('/').pop();
        if (path.includes('home')) {
            copy(item)
        } else {
            if (item.type == 'file') {
                dispatch(updateLoaderFlag({ loader: true, text: 'Making A Copy' }))
                const makeacopyRespo = await API.filesCopy([item._id], parentId, true);
                if (!makeacopyRespo.status) {
                    dispatch(updateLoaderFlag({ loader: false, text: '' }))
                    return toast.error(`Error in Duplicating ${item.name}`);
                }
                dispatch(updateMoveFlag({}))
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
            } else if (item.type == 'form') {
                dispatch(updateLoaderFlag({ loader: true, text: 'Making A Copy' }))
                const makeacopyRespo = await API.formsCopy([item._id], parentId, true);
                if (!makeacopyRespo.status) {
                    dispatch(updateLoaderFlag({ loader: false, text: '' }))
                    return toast.error(`Error in Duplicating ${item.name}`);
                }
                dispatch(updateMoveFlag({}))
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
            }
        }
    }

    return (
        <>
            {selectedFiles.length > 1 && <DragPreviewImage connect={preview} src={multipleDocs} />}

            <div
                className={fileStyle(item)}
                onClick={(e) => selectFiles(e, item)}
            // onDoubleClick={(e) => { goToNested(e, item) }}
            // onContextMenu={async (event) => {
            //     event.preventDefault()
            //     event.stopPropagation()
            //     if (selectedFiles.length <= 1) {
            //         await selectFiles(event, item);
            //         showContextMenu(event, item, 'documents')
            //     }
            //     else {
            //         showContextMenu(event, { selectedFiles, formSelected }, 'multiselectdocuments')
            //     }
            // }}
            >
                <div className="nk-file-info" style={{ opacity: isDragging ? 0.5 : 1 }}>
                    <div className="nk-file-title">
                        <div className="nk-file-icon">
                            <span className="nk-file-icon-type folderChildCount">{icons[item?.icon]}{item.type == 'folder' && fileView === 'grid' && <span className="childCount">{item.totalChildCount ? item.totalChildCount : 0}</span>}</span>
                        </div>
                        <div className="nk-file-name">
                            <div className="nk-file-name-text">
                                <span className="title">{item?.name} {item.type == 'folder' && fileView == 'group' ? (item.totalChildCount ? `(${item.totalChildCount})` : '(0)') : ''}</span>

                            </div>
                        </div>
                    </div>
                    {
                        (fileView === 'group' || fileView === 'grid') && (
                            <ul className="nk-file-desc">
                                <li className="date">  {item?.createdAt ? viewUserTimezoneInDiffFormat(item.createdAt) : 'Unknown Date'} </li>
                                <li className="size"> {item?.type === 'file' ? (formatFileSize(item?.fileSize) || 'Size not available') : ''}</li>
                            </ul>
                        )
                    }
                </div>

                {/* {fileView === 'list' && <>
                    {(page === undefined) && <div className="nk-file-meta">
                        <div className="tb-lead">{item.type == 'folder' ? (item.totalChildCount ? `${item.totalChildCount} ${item.totalChildCount == 1 ? 'item' : 'items'}` : '0 items') : (item?.fileSize ? formatFileSize(item?.fileSize) : '')}</div>
                    </div>}
                    {(page === undefined) && <div className="nk-file-meta">
                        <div className="tb-lead">{moment.utc(item?.createdAt).local().fromNow()}</div>
                    </div>}
                    {(page === undefined) && <div className="nk-file-meta">
                        <div className="tb-lead">{moment.utc(item?.activity?.updatedAt).local().fromNow()}</div>
                    </div>}
                    {(page === 'recovery') && <div className="nk-file-date">
                        <div className="tb-lead">{item?.deleted}</div>
                    </div>}
                    <div className="nk-file-members">
                        <div className="tb-lead" style={{ display: "flex", alignItems: "center" }}>
                            <UserAvatar image={item.createdUserObj?.imgUrl ? item.createdUserObj?.imgUrl : null} text={item.createdUserObj?.userName ? findLogoName(item.createdUserObj?.userName) : findLogoName(localStorage.getItem('userName'))} />
                            <p style={{ margin: 0, paddingLeft: "8px" }}>{item.createdUserObj?.userName ? item.createdUserObj?.userName : localStorage.getItem('userName')}</p>
                        </div>
                    </div>
                    <div className="nk-file-members">
                        <div className="tb-lead" onClick={() => openSharedWithView()}>{(item?.sharedWith["users"]?.length != 0) || (item?.sharedWith["userGroups"]?.length != 0) ? renderSharedWithAvatars(item) : '-'}</div>
                    </div>
                </>} */}

                <div className="nk-file-actions">
                    <UncontrolledDropdown>
                        <DropdownToggle tag="a" href="#folder" className="dropdown-toggle btn btn-sm btn-icon btn-trigger"
                            style={{ textDecoration: 'none' }}
                            onClick={(ev) => ev.preventDefault()}
                        >
                            <Icon name="more-h"></Icon>
                        </DropdownToggle>
                        <DropdownMenu end>
                            <ul className="link-list-opt no-bdr">
                                <li>
                                    {item.type != 'form' &&
                                        <DropdownItem tag="a" href="#item" onClick={(ev) => { ev.preventDefault(); downloadFile(item) }}>
                                            <Icon name="download"></Icon>
                                            <span>Download</span>
                                        </DropdownItem>
                                    }
                                </li>
                                <li>
                                    {!item.isActive &&
                                        <DropdownItem tag="a" href="#item" onClick={(ev) => { ev.preventDefault(); restore(item) }}>
                                            <Icon name="undo"></Icon>
                                            <span>Restore</span>
                                        </DropdownItem>
                                    }
                                </li>
                            </ul>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>



                <Modal isOpen={detailModal} size="md" toggle={toggleDetailModal}>
                    <Details file={item} toggle={toggleDetailModal} toggleShare={toggleShareModal} triggerDownload={downloadFile} />
                </Modal>

                <Modal isOpen={shareModal} size="md" toggle={toggleShareModal}>
                    <Share file={item} toggle={toggleShareModal} />
                </Modal>

                <Modal isOpen={shareFormModal} size="md" toggle={toggleShareFormModal}>
                    <ShareForm file={item} toggle={toggleShareFormModal} />
                </Modal>

                <Modal isOpen={copyModal} size="md" toggle={toggleCopyModal}>
                    <Copy file={item} toggle={toggleCopyModal} toggleCreate={toggleCreateModal} copySelected={copySelected} />
                </Modal>

                <Modal isOpen={copyFormModal} size="md" toggle={toggleCopyFormModal}>
                    <CopyForms file={item} toggle={toggleCopyFormModal} toggleCreate={toggleCreateModal} copySelected={copySelected} />
                </Modal>

                <Modal isOpen={moveModal} size="md" toggle={toggleMoveModal}>
                    <Move file={item} toggle={toggleMoveModal} toggleCreate={toggleCreateModal} copySelected={copySelected} />
                </Modal>

                <Modal isOpen={createModal} size="md" toggle={toggleCreateModal}>
                    <CreateFolder toggle={toggleCreateModal} />
                </Modal>

                <Modal isOpen={renameModal} backdrop={true} size="md" toggle={toggleRenameModal}>
                    <RenameFolder toggle={toggleRenameModal} folderId={folderId} folderName={folderName} type={docType} />
                </Modal>
                <Modal isOpen={viewerModal} size="lg" toggle={toggleViewerModal}>
                    <Viewer toggle={toggleViewerModal} file={viewDoc} codeContent={codeContent} />
                </Modal>

                <Modal isOpen={revisionModal} size="md" toggle={toggleRevisionModal}>
                    <WorkflowVersion toggle={toggleRevisionModal} revisionInputDatas={revisionInputDatas} fetchDetails={(togoId) => fetchDetails(togoId)} workflowEnableBtn={(data) => setWorkflowEnableBtn(data)} lastRevisionNo={lastRevisionNo} />
                </Modal>
            </div>

            {imageFlag && <Lightbox
                medium={`${process.env.REACT_APP_BE_URL}/file/documents/${imageFile._id}/${localStorage.getItem("workspace_id")}`}
                large={`${process.env.REACT_APP_BE_URL}/file/documents/${imageFile._id}/${localStorage.getItem("workspace_id")}`}
                alt={imageFile.name}
                hideZoom={true}
                hideDownload={false}
                onClose={() => setImageFlag(false)}
            />}
            {/* 
            {isVisible ? (
                <ContextMenu
                    isVisible={isVisible}
                    setIsVisible={setIsVisible}
                    position={position}
                    menuItem={menuItem}
                    menuRef={menuRef}
                    menuOp={menuOp}

                    setFolderId={setFolderId}
                    setFolderName={setFolderName}
                    setDocType={setDocType}

                    downloadFile={(data) => downloadFile(data)}


                    //for multiselect menuItems
                    currentUrl={currentUrl}
                    downloadDocuments={() => downloadDocuments()}

                />
            ) : <></>} */}
        </>
    )
}


const UserOwnedDocuments = ({ files, fixedView, page, fileListLoader, selectionName }) => {

    const { fileManager } = useFileManager();
    const location = useLocation()
    const fileView = fixedView ? fixedView : fileManager.filesView;
    // const fileView = localStorage.getItem('fileView') ? localStorage.getItem('fileView') : fileManager.filesView;

    const [fileTypes, setFileTypes] = useState({
        folders: 0,
        files: 0,
        forms: 0
    })
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [copySelectedFiles, setCopySelectedFiles] = useState([]);
    const [currentUrl, setCurrentUrl] = useState('')
    const [moveFiles, setMoveFiles] = useState({
        folders: [],
        files: [],
        forms: [],
        newParentId: ''
    })
    const [moveModal, setMoveModal] = useState(false);
    const dispatch = useDispatch();
    const mainClass = classNames({
        "nk-files": true,
        [`nk-files-view-${fileView}`]: fileView
    });

    const theme = useTheme()

    const filesList = files;
    const [folderSelected, setFolderSelected] = useState(false)
    const [formSelected, setFormSelected] = useState(false)
    const [formAloneSelected, setFormAloneSelected] = useState(false)
    const [copiedDocs, setCopiedDocs] = useState({});
    const [createModal, setCreateModal] = useState(false);
    const [multiShareModal, setMultiShareModal] = useState(false);
    const [copyModal, setCopyModal] = useState(false);
    const [sharedDocumentList, setSharedDocumentList] = useState([]);
    const [multiShareForms, setMultiShareForms] = useState([]);
    const [multiSelectedFormIds, setMultiSelectedFormIds] = useState([]);
    const [formShareModal, setFormShareModal] = useState(false);

    const [shareModal, setShareModal] = useState(false);
    const [shareFormModal, setShareFormModal] = useState(false);

    const [item, setItem] = useState({})

    const fileRef = useRef(null);
    const toolbarRef = useRef(null);

    const toggleShareModal = () => {
        setShareModal(!shareModal);
    };
    const toggleShareFormModal = () => {
        setShareFormModal(!shareFormModal);
    };

    const [checkStatus, setCheckStatus] = useState('asc');
    const [sortStatus, setSortStatus] = useState('asc');

    const [tooltipOpen, setTooltipOpen] = useState({});
    const toolTipToggle = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    useEffect(() => {
        function setDocTypes() {
            files.forEach(elem => {
                if (elem.type == 'folder') {
                    setFileTypes({
                        ...fileTypes,
                        folders: ++fileTypes.folders
                    })
                } else if (elem.type == 'file') {
                    setFileTypes({
                        ...fileTypes,
                        files: ++fileTypes.files
                    })
                } else if (elem.type == 'form') {
                    setFileTypes({
                        ...fileTypes,
                        forms: ++fileTypes.forms
                    })
                }
            })
        }
        setDocTypes()
    }, [])

    useEffect(() => {
        function handleClickOutside(event) {

            if (
                fileRef.current && !fileRef.current.contains(event.target) &&
                toolbarRef.current && !toolbarRef.current.contains(event.target)
            ) {

                if (document.querySelectorAll(".modal.fade.show").length > 0) {
                    return;
                }
                // debugger
                if (event?.target?.parentElement?.parentElement?.classList[0] == 'view-toggle') {
                    return
                }
                setSelectedFiles([])
            }
        }

        function handleKeyPress(event) {
            if (event.ctrlKey && event.key === 'a') {
                event.preventDefault();
                const searchModalActive = document.querySelector('.searchModalGlobal');
                if (searchModalActive) {
                    const inputElement = document.querySelector(".searchModalGlobal input.form-control");
                    if (inputElement) {
                        inputElement.select();
                    }
                    return
                }
                if (document.querySelectorAll(".modal.fade.show").length > 0) {
                    const renameModalActive = document.querySelector('.renamedocument');
                    if (renameModalActive) {
                        const inputElement = document.querySelector(".renamedocument input.form-control");
                        if (inputElement) {
                            inputElement.select();
                        }
                        return
                    }
                    return;
                }
                const tempSelection = [];
                setCurrentUrl(location.pathname);
                filesList.forEach(elem => {
                    if (elem.type == 'folder') {
                        setFolderSelected(true)
                    }
                    if (elem.type == 'form') {
                        setFormSelected(true)
                    }
                    tempSelection.push(elem);
                })
                if (tempSelection.every(val => val.type == 'form')) {
                    setFormAloneSelected(true);
                }
                setSelectedFiles(tempSelection);
            }
            if (event.key === 'Delete') {
                if (document.querySelectorAll(".modal.fade.show").length > 0) {
                    return;
                }
                if (selectedFiles.length > 0) {
                    deleteDocuments()
                }
            }
        }


        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyPress);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [fileRef, selectedFiles]);

    const toggleCreateModal = () => {
        setCreateModal(!createModal);
    };

    async function restoreToggle() {
        const selectedDocs = {
            folders: [],
            files: [],
            forms: [],
            sections: [],
        };
        selectedFiles.forEach(elem => {
            if (elem.type == 'section') {
                selectedDocs.sections.push(elem._id);
            }
            if (elem.type === 'folder') {
                selectedDocs.folders.push(elem._id);
            } else if (elem.type === 'form') {
                selectedDocs.forms.push(elem._id);
            } else if (elem.type == 'file') {
                selectedDocs.files.push(elem._id);
            }
        });

        let responseText = "Documents restored successfully";
        if (Object.values(selectedDocs)?.flat(1)?.length == 1) {
            let selectedDocument = files.find(val => val._id == Object.values(selectedDocs)?.flat(1)[0])
            if (selectedDocument?.type == 'file') {
                responseText = `'${selectedDocument.name.split('.')[0]}' restored successfully`;
            } else if (selectedDocument?.type == 'folder') {
                responseText = `'${selectedDocument.name}' restored successfully`;
            } else if (selectedDocument?.type == 'form') {
                responseText = `'${selectedDocument.name}' restored successfully`;
            } else if (selectedDocument?.type == 'section') {
                responseText = `'${selectedDocument.sectionName}' restored successfully`;
            }
        }
        dispatch(updateLoaderFlag({ loader: true, text: 'Restoring...' }))
        const deleteRespo = await API.restoreDocuments(selectedDocs.files, selectedDocs.folders, selectedDocs.forms, selectedDocs.sections);
        if (!deleteRespo.status) {
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            toast.error(`Error in deleting documents`.replace(/\b\w/g, char => char.toUpperCase()));
        }
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        toast.success(responseText.replace(/\b\w/g, char => char.toUpperCase()))
        setSelectedFiles([])
        // dispatch(updateMoveFlag({}))
        // if (selectedDocs.sections.length > 0) {
        //     const selectedSections = files.filter(file => selectedDocs.sections.includes(file._id));
        //     for (let sect of selectedSections) {
        //         dispatch(createSection({
        //             id: sect._id,
        //             name: sect.sectionName
        //         }))
        //     }
        // }
    }

    const toggleCopyModal = () => {
        setSelectedFiles([])
        setCopyModal(!copyModal);
    };

    const toggleMultiShareModal = () => {
        // setSelectedFiles([])
        setMultiShareModal(!multiShareModal);
    };

    function openCopyModal() {
        const files = [];
        const forms = [];
        selectedFiles.forEach(elem => {
            if (elem.type != 'folder') {
                if (elem.type == 'form') {
                    forms.push(elem._id);
                } else {
                    files.push(elem._id);
                }
            }
        })
        setCopiedDocs({
            files,
            forms
        })
        setCopyModal(true)
    }
    const toggleMoveModal = () => {
        setSelectedFiles([])
        setMoveModal(!moveModal);
    };

    function openMultiShareModal() {
        const sharedFiles = [];
        const sharedFolders = [];
        const sharedForms = [];
        selectedFiles.forEach(elem => {
            if (elem.type == 'folder') {
                sharedFolders.push(elem);
                setMoveFiles(prev => ({
                    ...prev,
                    folders: [...prev.folders, elem._id]
                }));
            }
            else if (elem.type == 'form') {
                sharedForms.push(elem);
                setMoveFiles(prev => ({
                    ...prev,
                    forms: [...prev.files, elem._id]
                }));
            }
            else {
                sharedFiles.push(elem);
                setMoveFiles(prev => ({
                    ...prev,
                    files: [...prev.files, elem._id]
                }));
            }
        })
        setSharedDocumentList([...sharedFiles, ...sharedFolders, ...sharedForms]);
        if (sharedFiles.length == 1 && sharedFolders.length == 0 && sharedForms.length == 0) {
            const _item = files.filter(val => val._id == sharedFiles[0]._id);
            debugger
            setItem(_item[0]);
            setShareModal(true);
        } else if (sharedFiles.length == 0 && sharedFolders.length == 1 && sharedForms.length == 0) {
            const _item = files.filter(val => val._id == sharedFiles[0]._id);
            debugger
            setItem(_item[0]);
            setShareModal(true);
        } else if (sharedFiles.length == 0 && sharedFolders.length == 0 && sharedForms.length == 1) {
            const _item = files.filter(val => val._id == sharedFiles[0]._id);
            debugger
            setItem(_item[0]);
            setShareFormModal(true);
        } else {
            setMultiShareModal(true);
        }
    }

    function openMoveModal() {
        selectedFiles.forEach(elem => {
            if (elem.type == 'folder') {
                setMoveFiles(prev => ({
                    ...prev,
                    folders: [...prev.folders, elem._id]
                }));
            }
            else if (elem.type == 'form') {
                setMoveFiles(prev => ({
                    ...prev,
                    forms: [...prev.files, elem._id]
                }));
            }
            else {
                setMoveFiles(prev => ({
                    ...prev,
                    files: [...prev.files, elem._id]
                }));
            }
        })
        setMoveModal(true)
    }

    function openMultiShareFormModal() {
        const sharedForms = [];
        selectedFiles.forEach(elem => {
            sharedForms.push(elem);
            setMultiSelectedFormIds(prev => ({
                ...prev,
                ...elem._id
            }));
        })
        debugger
        setMultiShareForms(sharedForms);
        setFormShareModal(true);
    }

    const toggleFormShareModal = () => {
        // setSelectedFiles([])
        setFormShareModal(!formShareModal);
    };

    async function deleteDocuments() {
        const selectedDocs = {
            folders: [],
            files: [],
            forms: []
        };

        selectedFiles.forEach(elem => {
            if (elem.type === 'folder') {
                selectedDocs.folders.push(elem._id);
            }
            else if (elem.type === 'form') {
                selectedDocs.forms.push(elem._id);
            }
            else {
                selectedDocs.files.push(elem._id);
            }
        });
        let deleteText = "Are you sure you want to delete these documents?";
        let responseText = "Documents deleted successfully";
        if (Object.values(selectedDocs)?.flat(1)?.length == 1) {
            let selectedDocument = files.find(val => val._id == Object.values(selectedDocs)?.flat(1)[0])
            if (selectedDocument?.type == 'file') {
                responseText = `${selectedDocument.name.split('.')[0]} deleted successfully`;
                deleteText = `Are you sure you want to delete file '${selectedDocument.name.split('.')[0]}'?`
            } else if (selectedDocument?.type == 'folder') {
                responseText = `${selectedDocument.name} deleted successfully`;
                deleteText = `Are you sure you want to delete folder '${selectedDocument.name}'?`
            } else if (selectedDocument?.type == 'form') {
                responseText = `${selectedDocument.name} deleted successfully`;
                deleteText = `Are you sure you want to delete form '${selectedDocument.name}'?`
            }
        }
        Swal.fire({
            title: deleteText,
            text: '',
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async respo => {
            if (respo.isConfirmed) {
                dispatch(updateLoaderFlag({ loader: true, text: 'Deleting' }))
                const deleteRespo = await API.multiDeleteDocument(selectedDocs.files, selectedDocs.folders, selectedDocs.forms);
                if (!deleteRespo.status) {
                    dispatch(updateLoaderFlag({ loader: false, text: '' }))
                    return toast.error(`error in deleting documents`.replace(/\b\w/g, char => char.toUpperCase()));
                }
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
                toast.success(responseText)
                setSelectedFiles([])
                dispatch(updateMoveFlag({}))
            }
        })
    }

    async function downloadDocuments() {
        const selectedDocs = {
            folders: [],
            files: []
        };

        selectedFiles.forEach(elem => {
            if (elem.type === 'folder') {
                selectedDocs.folders.push(elem._id);
            } else {
                selectedDocs.files.push(elem._id);
            }
        });
        // dispatch(updateLoaderFlag({ loader: true, text: 'downloading' }))
        if (selectedDocs.files.length == 1 && selectedDocs.folders.length == 0) {
            const documentArr = files.filter(val => val._id == selectedDocs.files[0]);

            dispatch(setDownloadFileAction([{ file: documentArr[0]._id, folder: [], fileName: documentArr[0].name.split('.')[0], extension: documentArr[0].fileType, APIType: 'fileDownloadAPI', type: "single" }]))
            // const downloadRespo = await API.downloadedFile(documentArr[0]._id, documentArr[0].name.split('.')[0], documentArr[0].storageInfo["contentType"], documentArr[0].fileType)
            // dispatch(updateLoaderFlag({ loader: false, text: '' }))

        } else {

            dispatch(setDownloadFileAction([{ file: selectedDocs.files, folder: selectedDocs.folders, fileName: "Zipping", extension: "", APIType: 'fileDownloadAPI', type: "bulk" }]))
            // const downloadRespo = await API.bulkDocsDownload(selectedDocs.files, selectedDocs.folders);
            // dispatch(updateLoaderFlag({ loader: false, text: '' }))
        }
        setSelectedFiles([])
    }

    const [loader, setLoader] = useState(false);

    function runLoader() {
        const timeout = setTimeout(() => {
            setLoader(false)
        }, 1000)
        setLoader(true);
        return () => clearTimeout(timeout);
    }

    // useEffect(()=>{
    //     runLoader()
    // },[files])

    const fetchSectionList = async (sectionId, order, by) => {
        setLoader(true);
        let listResponse = await API.getAllFilesAndFoldersListBySectionId(sectionId, order, by)
        let { status } = listResponse
        if (!status) {
            setLoader(false);
            return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))
        }


        dispatch(setDocuments({
            files: listResponse['data'],
            location: ''
        }))
        setLoader(false);
    }

    const fetchFolderList = async (folderId, order, by) => {
        setLoader(true);
        let listResponse = await API.getAllFilesAndFoldersListByFolderId(folderId, '', order, by)
        let { status } = listResponse
        if (!status) {
            setLoader(false);
            return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))
        }
        dispatch(setDocuments({
            files: listResponse['data'],
            location: ''
        }))
        dispatch(saveCurrentSection(listResponse['sectionId']))
        setLoader(false);
    }

    function getLocation() {
        let result = {
            path: '',
            isSection: false
        }
        const pathname = location.pathname
        const sectionRegex = /^\/section\/([a-fA-F0-9]{24})$/;
        const folderRegex = /^\/folder\/([a-fA-F0-9]{24})$/;

        const sectionMatched = sectionRegex.exec(pathname)
        const folderMatched = folderRegex.exec(pathname);
        if (sectionMatched) {
            result.path = sectionMatched[1];
            result.isSection = true
        } else {
            result.path = folderMatched[1];
        }
        return result;
    }

    const toggleCheckStatus = () => {
        const currentLocation = getLocation();
        let stat = 'asc';
        if (checkStatus == 'asc') {
            stat = 'desc'
        }
        if (currentLocation.isSection) {
            fetchSectionList(currentLocation.path, 'createdAt', stat);
        } else {
            fetchFolderList(currentLocation.path, 'createdAt', stat);
        }
        setCheckStatus(stat);
    };

    const toggleSortStatus = () => {
        const currentLocation = getLocation();
        let stat = 'asc';
        if (sortStatus == 'asc') {
            stat = 'desc'
        }
        if (currentLocation.isSection) {
            fetchSectionList(currentLocation.path, 'name', stat);
        } else {
            fetchFolderList(currentLocation.path, 'name', stat);
        }
        setSortStatus(stat);
    };




    return fileListLoader ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Spinner size="sm" />
        </div>
    ) : (
        <>
            {(selectedFiles?.length != 0) && (location.pathname == currentUrl) &&
                <div className={location.pathname == '/home' ? 'toolbar' : "toolbar main"} ref={toolbarRef} style={{ backgroundColor: theme?.skin == 'light' && '#fff' }}>

                    <div className="spacer"></div>
                    <p className='toolbar-selection'>{selectedFiles?.length} selected</p>


                    {!formSelected && <div className="toolbar-icon" id='Download' onClick={() => downloadDocuments()}><Icon name="download"></Icon>
                        <Tooltip
                            placement="bottom"
                            isOpen={tooltipOpen[`Download`] || false}
                            target={`Download`}
                            toggle={() => toolTipToggle(`Download`)}
                        >
                            {'Download'}
                        </Tooltip>
                    </div>}

                    {selectionName == 'Recovery' && <div className="toolbar-icon " id='Restore'
                        onClick={() => restoreToggle()}
                    ><Icon name="undo"></Icon>
                        <Tooltip
                            placement="bottom"
                            isOpen={tooltipOpen[`Restore`] || false}
                            target={`Restore`}
                            toggle={() => toolTipToggle(`Restore`)}
                        >
                            {'Restore'}
                        </Tooltip>
                    </div>}

                    <div className="spacer"></div>

                </div>
            }
            <div className={mainClass}>

                {filesList.length > 0 && <div className="nk-files-head">
                    <div className="nk-file-item">
                        {fileView === 'list' && <>
                            <div className="nk-file-info">
                                <div
                                    className="tb-head list_name_heading fw-bold fs-6 arrow-icon">{selectionName}
                                </div>
                            </div>
                            {/* {(page === undefined) && <div className="nk-file-meta fw-bold fs-6">
                                <div className="tb-head ">Size/Items</div>
                            </div>}
                            {(page === undefined) && <div className="nk-file-meta fw-bold fs-6 arrow-icon">
                                <div
                                    onClick={() => {
                                        if (!location.pathname.includes('home')) {
                                            toggleCheckStatus()
                                        }
                                    }}
                                    className="tb-head">Created At
                                    {checkStatus == 'asc' && !location.pathname.includes('home') && <Icon name="arrow-up"></Icon>}
                                    {checkStatus == 'desc' && !location.pathname.includes('home') && <Icon name="arrow-down"></Icon>}
                                </div>
                            </div>}
                            {(location.pathname.includes('home')) && <div className="nk-file-date fw-bold fs-6">
                                <div className="tb-head">Modified At</div>
                            </div>}
                            {(page === 'recovery') && <div className="nk-file-date">
                                <div className="tb-head">Deleted All</div>
                            </div>}
                            <div className="nk-file-members fw-bold fs-6">
                                <div className="tb-head">Owner</div>
                            </div>
                            <div className="nk-file-members fw-bold fs-6">
                                <div className="tb-head">Shared With</div>
                            </div>
                            <div className="nk-file-actions list_name_heading fw-bold fs-6">
                                <div className="tb-head ">Actions</div>
                            </div> */}
                        </>}
                    </div>
                </div>}
                {(fileView === 'list' || fileView === 'grid') &&
                    <>
                        {filesList?.length ? (
                            <div className="nk-files-list" ref={fileRef}>
                                {filesList.map((item) => (
                                    <File
                                        fileView={fileView}
                                        item={item}
                                        key={item._id}
                                        page={page}
                                        selectedFiles={selectedFiles}
                                        setSelectedFiles={setSelectedFiles}
                                        setCurrentUrl={setCurrentUrl}
                                        setFolderSelected={setFolderSelected}
                                        setFormSelected={setFormSelected}
                                        setFormAloneSelected={setFormAloneSelected}
                                        fileListLoader={fileListLoader}

                                        //for multiselect right click need these parameters
                                        currentUrl={currentUrl}
                                        formSelected={formSelected}
                                        openCopyModal={() => openCopyModal()}
                                        openMoveModal={() => openMoveModal()}
                                        deleteDocuments={() => deleteDocuments()}
                                        openMultiShareFormModal={() => openMultiShareFormModal()}
                                        openMultiShareModal={() => openMultiShareModal()}
                                        downloadDocuments={() => downloadDocuments()}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center d-flex justify-content-center ">
                                <h6>No Data Found</h6>
                            </div>
                        )}
                    </>
                }
                {fileView === 'group' && <div ref={fileRef}>
                    {/* {!location.pathname.includes('home')&& */}
                    {fileTypes.folders != 0 && <div className="nk-files-group" >
                        <h6 className="title border-top-0">Folders</h6>
                        <div className="nk-files-list">
                            {filesList.filter(item => item.type === 'folder').map((item) => (
                                <File
                                    fileView={fileView}
                                    item={item}
                                    key={item._id}
                                    page={page}
                                    selectedFiles={selectedFiles}
                                    setSelectedFiles={setSelectedFiles}
                                    setCurrentUrl={setCurrentUrl}
                                    setFolderSelected={setFolderSelected}
                                    setFormSelected={setFormSelected}
                                    setFormAloneSelected={setFormAloneSelected}
                                    fileListLoader={fileListLoader}

                                    //for multiselect right click need these parameters
                                    currentUrl={currentUrl}
                                    formSelected={formSelected}
                                    openCopyModal={() => openCopyModal()}
                                    openMoveModal={() => openMoveModal()}
                                    deleteDocuments={() => deleteDocuments()}
                                    openMultiShareFormModal={() => openMultiShareFormModal()}
                                    openMultiShareModal={() => openMultiShareModal()}
                                    downloadDocuments={() => downloadDocuments()}
                                />
                            ))}
                        </div>
                    </div>}
                    {/* } */}
                    {fileTypes.files != 0 && <div className="nk-files-group" >
                        <h6 className="title">Files</h6>
                        <div className="nk-files-list">
                            {filesList.filter(item => item.type === 'file').map((item) => (
                                <File
                                    fileView={fileView}
                                    item={item}
                                    key={item._id}
                                    page={page}
                                    selectedFiles={selectedFiles}
                                    setSelectedFiles={setSelectedFiles}
                                    setCurrentUrl={setCurrentUrl}
                                    setFolderSelected={setFolderSelected}
                                    setFormSelected={setFormSelected}
                                    setFormAloneSelected={setFormAloneSelected}
                                    fileListLoader={fileListLoader}

                                    //for multiselect right click need these parameters
                                    currentUrl={currentUrl}
                                    formSelected={formSelected}
                                    openCopyModal={() => openCopyModal()}
                                    openMoveModal={() => openMoveModal()}
                                    deleteDocuments={() => deleteDocuments()}
                                    openMultiShareFormModal={() => openMultiShareFormModal()}
                                    openMultiShareModal={() => openMultiShareModal()}
                                    downloadDocuments={() => downloadDocuments()}
                                />
                            ))}
                        </div>
                    </div>}
                    {fileTypes.forms != 0 && <div className="nk-files-group" >
                        <h6 className="title">Forms</h6>
                        <div className="nk-files-list">
                            {filesList.filter(item => item.type === 'form').map((item) => (
                                <File
                                    fileView={fileView}
                                    item={item}
                                    key={item._id}
                                    page={page}
                                    selectedFiles={selectedFiles}
                                    setSelectedFiles={setSelectedFiles}
                                    setCurrentUrl={setCurrentUrl}
                                    setFolderSelected={setFolderSelected}
                                    setFormSelected={setFormSelected}
                                    setFormAloneSelected={setFormAloneSelected}

                                    //for multiselect right click need these parameters
                                    currentUrl={currentUrl}
                                    formSelected={formSelected}
                                    openCopyModal={() => openCopyModal()}
                                    openMoveModal={() => openMoveModal()}
                                    deleteDocuments={() => deleteDocuments()}
                                    openMultiShareFormModal={() => openMultiShareFormModal()}
                                    openMultiShareModal={() => openMultiShareModal()}
                                    downloadDocuments={() => downloadDocuments()}
                                />
                            ))}
                        </div>
                    </div>}
                </div>}
                {filesList.length === 0 && <>
                    {fileView === 'group' && <div className="p-4 text-center d-flex justify-content-center ">
                        <h6>No Data Found</h6>
                    </div>}
                    <center>No folders or files are available</center>
                </>
                }
            </div>
            <Modal isOpen={copyModal} size="md" toggle={toggleCopyModal}>
                <Copy toggle={toggleCopyModal} toggleCreate={toggleCreateModal}
                    // multiselected={copySelectedFiles} 
                    multiselected={copiedDocs}
                    setSelectedFiles={setSelectedFiles}
                />
            </Modal>
            <Modal isOpen={moveModal} size="md" toggle={toggleMoveModal}>
                <Move toggle={toggleMoveModal} toggleCreate={toggleCreateModal} multiselected={moveFiles} setSelectedFiles={setSelectedFiles} />
            </Modal>
            <Modal isOpen={multiShareModal} size="md" toggle={toggleMultiShareModal}>
                <MultiShare toggle={toggleMultiShareModal} multiselected={moveFiles} sharedDocumentList={sharedDocumentList} setSelectedFiles={setSelectedFiles} />
            </Modal>
            <Modal isOpen={formShareModal} size="md" toggle={toggleFormShareModal}>
                <ShareForm toggle={toggleFormShareModal} multishared={multiSelectedFormIds} multisharedForms={multiShareForms} setSelectedFiles={setSelectedFiles} />
            </Modal>

            <Modal isOpen={shareModal} size="md" toggle={toggleShareModal}>
                <Share file={item} toggle={toggleShareModal} />
            </Modal>

            <Modal isOpen={shareFormModal} size="md" toggle={toggleShareFormModal}>
                <ShareForm file={item} toggle={toggleShareFormModal} />
            </Modal>
            <Toaster />
        </>
    )
}

export default UserOwnedDocuments