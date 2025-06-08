import React, { useEffect, useState, useRef } from 'react'
import classNames from 'classnames';
import { useFileManager, useFileManagerUpdate } from "./Context";
import icons from './Icons';
import { Modal, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Tooltip } from "reactstrap";
import { Icon, UserAvatar } from "../../../../components/Component";
import Swal from "sweetalert2";
import CreateFolder from "../modals/CreateFolder";
import Details from "../modals/Details";
import Share from "../modals/Share";
import Copy from "../modals/Copy";
import Move from "../modals/Move";
import { useLocation, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { deleteSubFolder, folderMove, setFiles, toggleStarred, saveWorkflowCurrClickedItem, updateCurrentLocation, updateMoveFlag, setDocuments, updateLoaderFlag } from '../../../../redux/folderSlice';
import { useSelector } from 'react-redux';
import RenameFolder from '../modals/RenameFolder';
import { useDrag, useDrop } from 'react-dnd';
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
import { useTheme } from '../../../../layout/provider/Theme';
import useCustomContextMenu from './ContextMenu/useCustomContextMenu';
import ContextMenu from './ContextMenu/contextMenu';
import { setDownloadFileAction } from '../../../../redux/download/downloadAction';
import { extractFilesAndForms, showGenerateMetadata, showMetadataInfo } from '../../../../utils/metadatahelper';


const File = ({
    item, fileView, page, selectedFiles, viewMeta, setSelectedFiles, generateMetadata, setCurrentUrl, setFolderSelected, setFormSelected,

    //multiselect right click
    currentUrl,
    formSelected,
    openCopyModal,
    openMoveModal,
    downloadDocuments,
    openMultiShareModal,
    deleteDocuments

}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const store = useSelector(state => state.folders);
    const theme = useTheme()
    const { isVisible, position, menuItem, showContextMenu, setIsVisible, menuRef, menuOp } = useCustomContextMenu()



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

    const [codeFlag, setCodeFlag] = useState(false);
    const [codeFile, setCodeFile] = useState({})


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

    const downloadFile = async (file) => {
        dispatch(setDownloadFileAction([{ file: file._id, folder: [], fileName: file.name.split('.')[0], extension: file.fileType, APIType: 'fileDownloadAPI', type: "single" }]))
        // await API.downloadedFile(file._id, file.name.split('.')[0], file.storageInfo["contentType"], file.fileType)
    };


    async function goToNested(currentSelection) {
        if (currentSelection.type == 'folder') {
            if (currentSelection.createdBy == localStorage.getItem('userId')) {
                dispatch(updateCurrentLocation({
                    drive: currentSelection
                }))
                navigate(`/folder/${currentSelection._id}`)
            } else {
                dispatch(updateCurrentLocation({
                    drive: currentSelection
                }))
                navigate(`/share/${currentSelection._id}`)
            }

        } else {

            if (currentSelection.type != 'form') {
                // await API.downloadedFile(currentSelection._id, currentSelection.name.split('.')[0], currentSelection.storageInfo["contentType"], currentSelection.fileType)
                // navigate(`/view/${currentSelection._id}`,{state:currentSelection});
                const docType = getFileType(currentSelection.fileType);
                if (docType == 'unknown') {
                    // return toast.error('unsupported file type'.replace(/\b\w/g, char => char.toUpperCase()));
                    // return Swal.fire({
                    //     icon: "error",
                    //     text: "Unsupported Filetype!",
                    //     focusConfirm: false,
                    //     confirmButtonText: "📥 Download!",
                    // }).then((result) => {
                    //     if (result.isConfirmed) {
                    //         downloadFile(currentSelection)

                    //     }
                    // });
                    setViewDoc(currentSelection);
                    toggleViewerModal();
                    return

                }
                if ((docType == 'word') || (docType == 'excel') || (docType == 'ppt') || (docType == 'pdf')) {
                    localStorage.setItem('currentLocation', JSON.stringify(location.pathname));
                    window.open(`${window.location.origin}/#/${localStorage.getItem("workspace_id")}/file/view/${currentSelection._id}`, '_blank', 'noopener,noreferrer');
                    // navigate(`/file/view/${currentSelection._id}`)

                } else {
                    if (currentSelection.type != 'form') {
                        if (docType == 'image') {
                            setImageFile(currentSelection);
                            setImageFlag(true);
                        } else if (docType == 'code') {
                            setCodeFile(currentSelection);
                            setCodeFlag(true);
                        } else {
                            setViewDoc(currentSelection);
                            toggleViewerModal();
                        }
                        // setViewDoc(currentSelection);
                        // toggleViewerModal();
                    }
                }
            }
            else if (currentSelection.type == 'form') {
                navigate(`/details/${currentSelection._id}`)
            }


        }
    }

    const [tooltipOpen, setTooltipOpen] = useState({});
    const toolTipToggle = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const deleteFile = async (item) => {
        let deleteRespo;
        let deletetext = '';
        if (item.type == 'folder') {
            deletetext = `Are you sure you want to delete folder '${item.name}'?`
        } else if (item.type == 'file') {
            deletetext = `Are you sure you want to delete file '${item.name?.split('.')[0]}'?`
        } else {
            deletetext = `Are you sure you want to delete form '${item.name}'?`
        }
        Swal.fire({
            title: deletetext,
            text: "",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async respo => {
            if (respo.isConfirmed) {
                dispatch(updateLoaderFlag({ loader: true, text: 'Deleting' }))
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
                toast.success(`${item.name.split('.')[0]} deleted successfully`);
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

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'file',
        item: { id: item._id, type: item.type, name: item.name },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'file',
        drop: (draggedItem) => handleDrop(draggedItem.id, item._id, draggedItem.type, item.type, item.name, draggedItem.name),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    const handleDrop = async (draggedId, targetId, draggedType, targetType, targetName, draggedName) => {
        // console.log(`Dropped ${draggedType} ${draggedName} ${draggedId} on ${targetName} ${targetId}`);
        if (draggedId != targetId && targetType == 'folder') {
            let moveRespo;
            if (draggedType == 'folder') {
                moveRespo = await API.docsMove([], [draggedId], [], targetId)
            } else if (draggedType == 'form') {
                moveRespo = await API.docsMove([], [], [draggedId], targetId)
            } else {
                moveRespo = await API.docsMove([draggedId], [], [], targetId)
            }
            if (!moveRespo.status) return toast.error(`error occured during moving ${draggedName}`.replace(/\b\w/g, char => char.toUpperCase()))
            dispatch(updateMoveFlag({}))
            toast.success(`${draggedName} moved to ${targetName}`.replace(/\b\w/g, char => char.toUpperCase()));
        }
    };

    //starred
    const handleStarred = async (e, id, type, item) => {
        e.preventDefault();

        let starredResponse;
        // let documents = [];
        let documents = store.starredRepo
        let index = documents.findIndex((item) => item._id.toString() == id);
        let userisPresent = false;
        if (index != -1) {
            userisPresent = documents[index]['starredWith']['users'].some(item => item == localStorage.getItem('userId'));
        }

        if (userisPresent == false) {
            starredResponse = await API.updateStarred(id, type, 'on')
            debugger
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

        // dispatch(setFiles({
        //     files: sharedListResponse['data'],
        //     location: 'starred'
        // }))
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

                if (!hasFolder) {
                    setFolderSelected(false);
                }
                if (!hasForm) {
                    setFormSelected(false);
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
    };

    const setUpWorkflow = async (item) => {

        //store in redux which item is clicked
        // dispatch(saveWorkflowCurrClickedItem(item))

        //before his parent & ancestor parent check himself
        if (item['workflow'] != null) {
            // navigate(`/workflow/setUpWorkflow/${item['type']}/${item['_id']}/edit/${item['workflow']?.['workflowId']}`)
            navigate(`/workflow/setUpWorkflow/${item['type']}/${item['_id']}/edit`)

            return
        }

        //check his parent & ancestor parent worklow is present or not,if present update it in current item
        let pathRespo = await API.getDirectoryPath(item['_id']);
        if (!pathRespo.status) return toast.error(`Some Error Occured While fetching ${item['name']} Parent! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()));

        const result = pathRespo.data.reduce((acc, path) => {
            if (path._id != item._id && path.workflow !== null) {
                acc.hasWorkflow = true;
                acc.workflows.push(path);
            }
            return acc
        }, { hasWorkflow: false, workflows: [] })


        if (result['hasWorkflow']) {
            let parentData = result['workflows'][result['workflows'].length - 1]
            let togoName = item['type']
            let togoId = item['_id']

            // navigate(`/workflow/setUpWorkflow/${togoName}/${togoId}/edit/${parentData['workflow']?.['workflowId']}`)
            navigate(`/workflow/setUpWorkflow/${togoName}/${togoId}/edit`)


            // var workflowResponse = await API.updateWorkflowInFiles(parentData['workflow'], togoName, togoId)
            // var { status, message } = workflowResponse

            // if (status) {
            //     toast.success(`${message}`)
            // }
            // else toast.error(`${message}`)

        }
        else {
            // if not setUp the workflow
            navigate(`/workflow/setUpWorkflow/${item['type']}/${item['_id']}/create`)
        }

    }

    // const handleContextMenu = (event, menuId) => {
    //     event.preventDefault();
    //     event.stopPropagation()
    //     show({ id: menuId, event });
    // }

    function openSharedWithView() {
        let sharedMembers = [];
        if (Array.isArray(item.sharedWithGroupMembers) && Array.isArray(item.sharedWithIndividualUsers)) {
            sharedMembers = [...item.sharedWithGroupMembers, ...item.sharedWithIndividualUsers]
        }
        if (sharedMembers.length > 0) {
            // setSharedMembersModal(true)
            setShareModal(true)
        }
    }

    function renderSharedWithAvatars(item) {
        let sharedMembers = [];
        if (Array.isArray(item.sharedWithGroupMembers) && Array.isArray(item.sharedWithIndividualUsers)) {
            sharedMembers = [...item.sharedWithGroupMembers, ...item.sharedWithIndividualUsers]
        }
        if (Array.isArray(item.sharedWith.externalUsers)) {
            sharedMembers = [...sharedMembers, ...item.sharedWith.externalUsers]
        }
        return <div className="user-avatar-group">
            {sharedMembers?.length <= 4 ? sharedMembers?.slice(0, 4).map((member, index) => {
                if (typeof member.userName == "undefined") {
                    return <div className="user-avatar xs members_avatar">
                        <div>
                            <span>{findLogoName(member?.email)}</span>
                        </div>
                    </div>
                } else {
                    const id = `${member.userName}_${member._id?.toString()}_${item._id}`.replace(/[^a-zA-Z0-9-_]/g, '_');
                    return <div id={id} className="user-avatar xs members_avatar">
                        {member.imgUrl ?
                            <div >
                                <img src={member?.imgUrl} alt={member?.userName} />
                                <Tooltip
                                    placement="bottom"
                                    isOpen={tooltipOpen[id] || false}
                                    target={id}
                                    toggle={() => toolTipToggle(id)}
                                >
                                    {member?.userName}
                                </Tooltip>
                            </div>
                            :
                            <div>
                                <span>{findLogoName(member?.userName)}</span>
                                <Tooltip
                                    placement="bottom"
                                    isOpen={tooltipOpen[id] || false}
                                    target={id}
                                    toggle={() => toolTipToggle(id)}
                                >
                                    {member?.userName}
                                </Tooltip>

                            </div>
                        }
                    </div>
                }

            }) : sharedMembers.slice(0, 3).map((member, index) => {
                if (typeof member.userName == "undefined") {
                    return <div className="user-avatar xs members_avatar">
                        <div>
                            <span>{findLogoName(member?.email)}</span>
                        </div>
                    </div>
                } else {
                    const id = `${member.userName}_${member._id?.toString()}_${item._id}`.replace(/[^a-zA-Z0-9-_]/g, '_');
                    return <div id={id} className="user-avatar xs members_avatar">
                        {member.imgUrl ?
                            <div >
                                <img src={member?.imgUrl} alt={member?.userName} />
                                <Tooltip
                                    placement="bottom"
                                    isOpen={tooltipOpen[id] || false}
                                    target={id}
                                    toggle={() => toolTipToggle(id)}
                                >
                                    {member?.userName}
                                </Tooltip>
                            </div> :
                            <div >
                                <span>{findLogoName(member?.userName)}</span>
                                <Tooltip
                                    placement="bottom"
                                    isOpen={tooltipOpen[id] || false}
                                    target={id}
                                    toggle={() => toolTipToggle(id)}
                                >
                                    {member?.userName}
                                </Tooltip>

                            </div>
                        }
                    </div>
                }
            })}
            {sharedMembers?.length > 4 &&
                <div className="user-avatar xs members_avatar">
                    <span>{sharedMembers?.length - 3}+</span>
                </div>
            }
        </div>
    }

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


    return (
        <>
            <div
                ref={drop}
                className={fileStyle(item)}
                onClick={(e) => selectFiles(e, item)}
                onDoubleClick={() => { goToNested(item) }}
                onContextMenu={(event) => {
                    event.preventDefault()
                    event.stopPropagation()

                    if (selectedFiles.length <= 1) {
                        selectFiles(event, item);
                        showContextMenu(event, item, 'starredMenu')
                    }
                    else {
                        showContextMenu(event, { selectedFiles, formSelected }, 'multiSelectStarredMenu')
                    }

                }}
            >
                <div ref={drag} className="nk-file-info" style={{ opacity: isDragging ? 0.5 : 1 }}>
                    <div className="nk-file-title">
                        <div className="nk-file-icon">
                            <span className="nk-file-icon-type">{icons[item?.icon]}</span>
                        </div>
                        <div className="nk-file-name">
                            <div className="nk-file-name-text">
                                <span className="title">{item?.name}</span>
                                {/* <span className="title">{JSON.stringify(item?.storageInfo)}</span> */}
                                <div className='asterisk'>
                                    <a href='' className={"active"} id="anchor-id" onClick={(e) => handleStarred(e, item._id, item.type, item)}>
                                        {/* <Icon className="asterisk-off icon ni ni-star"></Icon> */}
                                        <Icon className="asterisk-on icon ni ni-star-fill" ></Icon>
                                    </a>
                                </div>

                            </div>
                        </div>
                    </div>

                    {
                        (fileView === 'group' || fileView === 'grid') && (
                            <ul className="nk-file-desc">
                                {/* .split("T")[0] */}
                                <li className="date">  {item?.createdAt ? viewUserTimezoneInDiffFormat(item.createdAt) : 'Unknown Date'} </li>
                                <li className="size"> {item?.type === 'file' ? (formatFileSize(item?.fileSize) || 'Size not available') : ''}</li>
                            </ul>
                        )
                    }
                </div>

                {fileView === 'list' && <>
                    {(page === undefined) && <div className="nk-file-meta">
                        <div className="tb-lead">{moment.utc(item?.createdAt).local().fromNow()}</div>
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
                        <div onClick={() => openSharedWithView()} className="tb-lead">{(item?.sharedWith["users"]?.length != 0) || (item?.sharedWith["userGroups"]?.length != 0) || (item?.sharedWith["externalUsers"]?.length != 0) ? renderSharedWithAvatars(item) : '-'}</div>
                    </div>
                </>}


                {/* TOOLS */}
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
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => {
                                        ev.preventDefault();
                                        // setDetailModal(true);
                                        navigate(`/details/${item._id}`)
                                    }}>
                                        <Icon name="eye"></Icon>
                                        <span>Details</span>
                                    </DropdownItem>
                                </li>
                                <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => {
                                        ev.preventDefault();
                                        if (item.type == 'form') {
                                            setShareFormModal(true);
                                        } else {
                                            setShareModal(true);
                                        }

                                    }}>
                                        <Icon name="share"></Icon>
                                        <span>Share</span>
                                    </DropdownItem>
                                </li>
                                {item.type != 'folder' && <li>
                                    <DropdownItem tag="a" href="javascript:void(0)" onClick={() => copy(item)}>
                                        <Icon name="copy"></Icon>
                                        <span>Copy</span>
                                    </DropdownItem>
                                </li>}
                                <li>
                                    <DropdownItem tag="a" href="javascript:void(0)" onClick={() => move(item)}>
                                        <Icon name="forward-arrow"></Icon>
                                        <span>Move</span>
                                    </DropdownItem>
                                </li>
                                {/* {(item['type'] == "folder" && (localStorage.getItem('userId') == item['createdBy'] || localStorage.getItem('role') == "Super Admin")) &&
                                    <li>
                                        <DropdownItem tag="a" href="javascript:void(0)" onClick={() => setUpWorkflow(item)}>
                                            <Icon name="git" />
                                            <span>Inherit Workflow</span>
                                        </DropdownItem>
                                    </li>
                                } */}
                                <li>
                                    {item.type != 'form' &&
                                        <DropdownItem tag="a" href="#item" onClick={(ev) => { ev.preventDefault(); downloadFile(item) }}>
                                            <Icon name="download"></Icon>
                                            <span>Download</span>
                                        </DropdownItem>
                                    }
                                </li>
                                <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => { ev.preventDefault(); setFolderId(item._id); setFolderName(item.name); setDocType(item.type); toggleRenameModal() }}>
                                        <Icon name="edit"></Icon>
                                        <span>Rename</span>
                                    </DropdownItem>

                                </li>
                                <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => {
                                        ev.preventDefault();
                                        deleteFile(item);
                                    }}>
                                        <Icon name="trash"></Icon>
                                        <span>Delete</span>
                                    </DropdownItem>
                                </li>

                                <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => {
                                        ev.preventDefault();
                                        generateMetadata(item);
                                    }}>
                                        <Icon name="pie-2"></Icon>
                                        <span>Generate Metadata</span>
                                    </DropdownItem>
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

                <Modal isOpen={renameModal} size="md" toggle={toggleRenameModal}>
                    <RenameFolder toggle={toggleRenameModal} folderId={folderId} folderName={folderName} type={docType} />
                </Modal>
                <Modal isOpen={viewerModal} size="lg" toggle={toggleViewerModal}>
                    <Viewer toggle={toggleViewerModal} file={viewDoc} />
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
            {/* {codeFlag&&<SyntaxHighlighter language={codeFile.fileType} style={oneDark}>
            {`${process.env.REACT_APP_BE_URL}/file/documents/${codeFile._id}`}
          </SyntaxHighlighter>} */}


            {isVisible ? (
                <ContextMenu
                    isVisible={isVisible}
                    setIsVisible={setIsVisible}
                    position={position}
                    menuItem={menuItem}
                    menuRef={menuRef}
                    menuOp={menuOp}
                    viewMeta={viewMeta}


                    setShareFormModal={setShareFormModal}
                    setShareModal={setShareModal}
                    setFolderId={setFolderId}
                    setFolderName={setFolderName}
                    setDocType={setDocType}

                    copy={(data) => copy(data)}
                    move={(data) => move(data)}
                    setUpWorkflow={(data) => setUpWorkflow(data)}
                    downloadFile={(data) => downloadFile(data)}
                    toggleRenameModal={() => toggleRenameModal()}
                    deleteFile={(data) => deleteFile(data)}
                    generateMetadata={(data) => generateMetadata(data)}

                    //multiselect right click
                    currentUrl={currentUrl}
                    formSelected={formSelected}
                    openCopyModal={() => openCopyModal()}
                    openMoveModal={() => openMoveModal()}
                    downloadDocuments={() => downloadDocuments()}
                    openMultiShareModal={() => openMultiShareModal()}
                    deleteDocuments={() => deleteDocuments()}
                />
            ) : <></>}
        </>
    )
}


const StarredDocs = ({ files, fixedView, page }) => {

    const { fileManager } = useFileManager();
    const location = useLocation()
    const fileView = fixedView ? fixedView : fileManager.filesView;
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
    const [copiedDocs, setCopiedDocs] = useState({});
    const [createModal, setCreateModal] = useState(false);
    const [multiShareModal, setMultiShareModal] = useState(false);
    const [copyModal, setCopyModal] = useState(false);
    const [sharedDocumentList, setSharedDocumentList] = useState([]);
    const [formAloneSelected, setFormAloneSelected] = useState(false)
    const [viewMeta, setViewMeta] = useState(true)

    const [checkStatus, setCheckStatus] = useState('asc');
    const [sortStatus, setSortStatus] = useState('asc');

    const [tooltipOpen, setTooltipOpen] = useState({});
    const toolTipToggle = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };

    const fileRef = useRef(null);
    const toolbarRef = useRef(null);

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
                // console.log('Ctrl + A was pressed');
                // debugger
                const tempSelection = [];
                setCurrentUrl(location.pathname);
                // if(selectedFiles.length==filesList.length){
                //     debugger
                //     setSelectedFiles([]);
                // }else{
                // debugger
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
                // }
            }
            if (event.key === 'Delete') {
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


    const generateMetadata = async (inputdata) => {
        if (!inputdata) return

        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        let { supported, nonsupported, notOwner } = await showGenerateMetadata(selectedFiles)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        const confirmed = await showMetadataInfo(supported, nonsupported, notOwner)

        if (!confirmed) return


        const inputItems = Array.isArray(supported) ? supported : [supported]

        if (supported.length == 0) return

        dispatch(updateLoaderFlag({ loader: true, text: 'Generating' }))
        var aimetaResponse = await API.getAIMetadata(inputItems)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        var { status, message } = aimetaResponse
        if (status) {
            toast.success(`${message}`)
        }
        else {
            toast.error(`${message}` || `Metadata extraction failed`)
        }
    }


    const toggleCreateModal = () => {
        setCreateModal(!createModal);
    };

    const toggleCopyModal = () => {
        setSelectedFiles([])
        setCopyModal(!copyModal);
    };

    const toggleMultiShareModal = () => {
        setSelectedFiles([])
        setMultiShareModal(!multiShareModal);
    };

    function openCopyModal() {
        // selectedFiles.forEach(elem => {
        //     if (elem.type != 'folder') {
        //         setCopySelectedFiles(copySelectedFiles => [...copySelectedFiles, elem._id])
        //     }
        // })
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
        setMultiShareModal(true);
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
            text: "",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async respo => {
            if (respo.isConfirmed) {
                const deleteRespo = await API.multiDeleteDocument(selectedDocs.files, selectedDocs.folders, selectedDocs.forms);
                if (!deleteRespo.status) toast.error(`error in deleting documents`.replace(/\b\w/g, char => char.toUpperCase()));
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


        dispatch(setDownloadFileAction([{ file: selectedDocs.files, folder: selectedDocs.folders, fileName: "Zipping", extension: "", APIType: 'fileDownloadAPI', type: "bulk" }]))
        // const downloadRespo = await API.bulkDocsDownload(selectedDocs.files, selectedDocs.folders);

        setSelectedFiles([])
    }

    const [loader, setLoader] = useState(false);

    const fetchStarredList = async (order, by) => {
        setLoader(true);
        let listResponse = await API.getStarredList(1, order, by)
        let { status } = listResponse
        if (!status) {
            setLoader(false);
            return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))
        }
        dispatch(setDocuments({
            files: listResponse['data'],
            location: 'starred'
        }))
        setLoader(false);
    }

    const toggleCheckStatus = () => {
        let stat = 'asc';
        if (checkStatus == 'asc') {
            stat = 'desc'
        }
        fetchStarredList('createdAt', stat);
        setCheckStatus(stat);
    };

    const toggleSortStatus = () => {
        let stat = 'asc';
        if (sortStatus == 'asc') {
            stat = 'desc'
        }
        fetchStarredList('name', stat);
        setSortStatus(stat);
    };


    return (
        <>
            {(selectedFiles?.length != 0) && (location.pathname == currentUrl) &&
                <div className="toolbar" ref={toolbarRef} style={{ backgroundColor: theme?.skin == 'light' && '#fff' }}>
                    <div className="spacer"></div>
                    <p className='toolbar-selection'>{selectedFiles?.length} selected</p>
                    {selectedFiles.every(v => v.type != "folder") && <div className="toolbar-icon" id='Copy' onClick={() => openCopyModal()}><Icon name="copy"></Icon>
                        <Tooltip
                            placement="bottom"
                            isOpen={tooltipOpen[`Copy`] || false}
                            target={`Copy`}
                            toggle={() => toolTipToggle(`Copy`)}
                        >
                            {'Copy'}
                        </Tooltip>
                    </div>}
                    <div className="toolbar-icon" id='Move' onClick={() => openMoveModal()}><Icon name="inbox-out"></Icon>
                        <Tooltip
                            placement="bottom"
                            isOpen={tooltipOpen[`Move`] || false}
                            target={`Move`}
                            toggle={() => toolTipToggle(`Move`)}
                        >
                            {'Move'}
                        </Tooltip>
                    </div>
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
                    {!formSelected && <div className="toolbar-icon" id='Share' onClick={() => openMultiShareModal()}><Icon name="share-fill"></Icon>
                        <Tooltip
                            placement="bottom"
                            isOpen={tooltipOpen[`Share`] || false}
                            target={`Share`}
                            toggle={() => toolTipToggle(`Share`)}
                        >
                            {'Share'}
                        </Tooltip>
                    </div>}
                    {!formSelected && <div className="toolbar-icon" id='generatemetadata' onClick={() => generateMetadata(selectedFiles)}><Icon name="pie-2"></Icon>
                        <Tooltip
                            placement="bottom"
                            isOpen={tooltipOpen[`generatemetadata`] || false}
                            target={`generatemetadata`}
                            toggle={() => toolTipToggle(`generatemetadata`)}
                        >
                            {'Generate Metadata'}
                        </Tooltip>
                    </div>}
                    <div className="toolbar-icon trash" id='Delete' onClick={() => deleteDocuments()}><Icon name="trash"></Icon>
                        <Tooltip
                            placement="bottom"
                            isOpen={tooltipOpen[`Delete`] || false}
                            target={`Delete`}
                            toggle={() => toolTipToggle(`Delete`)}
                        >
                            {'Delete'}
                        </Tooltip>
                    </div>
                    <div className="spacer"></div>
                </div>
            }
            <div className={mainClass}>

                {filesList.length > 0 && <div className="nk-files-head">
                    <div className="nk-file-item">
                        {fileView === 'list' && <>
                            <div className="nk-file-info">
                                <div
                                    onClick={() => {
                                        toggleSortStatus()
                                    }}
                                    className="tb-head list_name_heading fw-bold fs-6 arrow-icon">Name
                                    {sortStatus == 'asc' && <Icon name="arrow-up"></Icon>}
                                    {sortStatus == 'desc' && <Icon name="arrow-down"></Icon>}
                                </div>
                            </div>
                            <div className="nk-file-meta fw-bold fs-6 arrow-icon">
                                <div
                                    onClick={() => {
                                        toggleCheckStatus()
                                    }}
                                    className="tb-head">Created At
                                    {checkStatus == 'asc' && <Icon name="arrow-up"></Icon>}
                                    {checkStatus == 'desc' && <Icon name="arrow-down"></Icon>}
                                </div>
                            </div>
                            <div className="nk-file-members fw-bold fs-6">
                                <div className="tb-head">Owner</div>
                            </div>
                            <div className="nk-file-members fw-bold fs-6">
                                <div className="tb-head">Shared With</div>
                            </div>
                            <div className="nk-file-actions fw-bold fs-6">Actions
                            </div>
                        </>}
                    </div>
                </div>}
                {(fileView === 'list' || fileView === 'grid') &&
                    <>
                        {filesList?.length ? (
                            <div className="nk-files-list" ref={fileRef}>
                                {filesList.map((item) => (
                                    <File fileView={fileView} item={item} key={item._id} page={page} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} setCurrentUrl={setCurrentUrl} setFolderSelected={setFolderSelected} setFormSelected={setFormSelected}
                                        //multiselect right click
                                        currentUrl={currentUrl}
                                        formSelected={formSelected}
                                        openCopyModal={() => openCopyModal()}
                                        openMoveModal={() => openMoveModal()}
                                        downloadDocuments={() => downloadDocuments()}
                                        openMultiShareModal={() => openMultiShareModal()}
                                        deleteDocuments={() => deleteDocuments()}
                                        viewMeta={viewMeta}
                                        generateMetadata={generateMetadata}


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
                    {fileTypes.folders != 0 && <div className="nk-files-group">
                        <h6 className="title border-top-0">Folders</h6>
                        <div className="nk-files-list">
                            {filesList.filter(item => item.type === 'folder').map((item) => (
                                <File fileView={fileView} item={item} key={item._id} page={page} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} setCurrentUrl={setCurrentUrl} setFolderSelected={setFolderSelected} setFormSelected={setFormSelected}
                                    //multiselect right click
                                    currentUrl={currentUrl}
                                    formSelected={formSelected}
                                    openCopyModal={() => openCopyModal()}
                                    openMoveModal={() => openMoveModal()}
                                    downloadDocuments={() => downloadDocuments()}
                                    openMultiShareModal={() => openMultiShareModal()}
                                    deleteDocuments={() => deleteDocuments()}
                                    viewMeta={viewMeta}
                                    generateMetadata={generateMetadata}


                                />
                            ))}
                        </div>
                    </div>}
                    {fileTypes.files != 0 && <div className="nk-files-group">
                        <h6 className="title">Files</h6>
                        <div className="nk-files-list">
                            {filesList.filter(item => item.type === 'file').map((item) => (
                                <File fileView={fileView} item={item} key={item._id} page={page} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} setCurrentUrl={setCurrentUrl} setFolderSelected={setFolderSelected} setFormSelected={setFormSelected}
                                    //multiselect right click
                                    currentUrl={currentUrl}
                                    formSelected={formSelected}
                                    openCopyModal={() => openCopyModal()}
                                    openMoveModal={() => openMoveModal()}
                                    downloadDocuments={() => downloadDocuments()}
                                    openMultiShareModal={() => openMultiShareModal()}
                                    deleteDocuments={() => deleteDocuments()}
                                    viewMeta={viewMeta}
                                    generateMetadata={generateMetadata}


                                />
                            ))}
                        </div>
                    </div>}
                    {fileTypes.forms != 0 && <div className="nk-files-group">
                        <h6 className="title">Forms</h6>
                        <div className="nk-files-list">
                            {filesList.filter(item => item.type === 'form').map((item) => (
                                <File fileView={fileView} item={item} key={item._id} page={page} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} setCurrentUrl={setCurrentUrl} setFolderSelected={setFolderSelected} setFormSelected={setFormSelected}
                                    //multiselect right click
                                    currentUrl={currentUrl}
                                    formSelected={formSelected}
                                    openCopyModal={() => openCopyModal()}
                                    openMoveModal={() => openMoveModal()}
                                    downloadDocuments={() => downloadDocuments()}
                                    openMultiShareModal={() => openMultiShareModal()}
                                    deleteDocuments={() => deleteDocuments()}
                                    viewMeta={viewMeta}
                                    generateMetadata={generateMetadata}


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
                </>}
            </div>
            <Modal isOpen={copyModal} size="md" toggle={toggleCopyModal}>
                <Copy toggle={toggleCopyModal} toggleCreate={toggleCreateModal}
                    // multiselected={copySelectedFiles} 
                    multiselected={copiedDocs}
                />
            </Modal>
            <Modal isOpen={moveModal} size="md" toggle={toggleMoveModal}>
                <Move toggle={toggleMoveModal} toggleCreate={toggleCreateModal} multiselected={moveFiles} />
            </Modal>
            <Modal isOpen={multiShareModal} size="md" toggle={toggleMultiShareModal}>
                <MultiShare toggle={toggleMultiShareModal} multiselected={moveFiles} sharedDocumentList={sharedDocumentList} />
            </Modal>
            <Toaster />
        </>
    )
}

export default StarredDocs