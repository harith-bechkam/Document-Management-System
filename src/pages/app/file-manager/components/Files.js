import React, { useState, useRef, useEffect } from 'react'
import classNames from 'classnames';
import { useFileManager, useFileManagerUpdate } from "../components/Context";
import icons from './Icons';
import { Modal, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Tooltip } from "reactstrap";
import { Icon } from "../../../../components/Component";
import './Toolbar.css';
import CreateFolder from "../modals/CreateFolder";
import Details from "../modals/Details";
import Share from "../modals/Share";
import Copy from "../modals/Copy";
import Move from "../modals/Move";
import * as API from '../../../../utils/API';
import { createSection, updateAsideFlag, updateLoaderFlag, updateMoveFlag } from '../../../../redux/folderSlice';
import { useLocation, useNavigate } from 'react-router';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { formatFileSize } from '../../../../utils/fileDetails';
import { useTheme } from '../../../../layout/provider/Theme';
import moment from 'moment';
import useCustomContextMenu from './ContextMenu/useCustomContextMenu';
import ContextMenu from './ContextMenu/contextMenu';
import { extractFilesAndForms, showGenerateMetadata, showMetadataInfo } from '../../../../utils/metadatahelper';


const File = ({ item, fileView, page, selectedFiles, setSelectedFiles, viewMeta, generateMetadata, multiToggle }) => {
    const dispatch = useDispatch();
    const { fileManagerUpdate } = useFileManagerUpdate();
    const [detailModal, setDetailModal] = useState(false);
    const [shareModal, setShareModal] = useState(false);
    const [copyModal, setCopyModal] = useState(false);
    const [moveModal, setMoveModal] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const location = useLocation();
    const { isVisible, position, menuItem, showContextMenu, setIsVisible, menuRef, menuOp } = useCustomContextMenu()


    const navigate = useNavigate()
    const theme = useTheme()

    const toggleDetailModal = () => {
        setDetailModal(!detailModal);
    };
    const toggleShareModal = () => {
        setShareModal(!shareModal);
    };
    const toggleCopyModal = () => {
        setCopyModal(!copyModal);
    };
    const toggleMoveModal = () => {
        setMoveModal(!moveModal);
    };
    const toggleCreateModal = () => {
        setCreateModal(!createModal);
    };

    const deleteFile = async (item) => {
        let deletetext = '';
        let respoText = 'Deleted permenantly'
        if (item.type == 'folder') {
            deletetext = `Are you sure to delete the folder '${item.name}'?`;
            respoText = `'${item.name}' deleted permenantly`
        } else if (item.type == 'file') {
            deletetext = `Are you sure to delete the file '${item.name?.split('.')[0]}'?`;
            respoText = `'${item.name?.split('.')[0]}' deleted permenantly`
        } else if (item.type == 'form') {
            deletetext = `Are you sure to delete the form '${item.name}'?`;
            respoText = `'${item.name}' deleted permenantly`
        } else {
            deletetext = `Are you sure to delete the section '${item.sectionName}'?`;
            respoText = `'${item.sectionName}' deleted permenantly`
        }
        Swal.fire({
            title: deletetext,
            text: "This will be deleted permenantly, you won't be able to restore it",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        }).then(async respo => {
            if (respo.isConfirmed) {
                let deleteRespo;
                dispatch(updateLoaderFlag({ loader: true, text: 'Deleting' }))
                if (item.type == 'section') {
                    deleteRespo = await API.deletePermenantly([], [], [], [item._id]);
                }
                if (item.type == 'folder') {
                    deleteRespo = await API.deletePermenantly([], [item._id], [], []);
                }
                else if (item.type == 'form') {
                    deleteRespo = await API.deletePermenantly([], [], [item._id], []);
                }
                else if (item.type == 'file') {
                    deleteRespo = await API.deletePermenantly([item._id], [], [], []);
                }
                if (!deleteRespo.status) {
                    dispatch(updateLoaderFlag({ loader: false, text: '' }))
                    toast.error(`error in deleting documents`.replace(/\b\w/g, char => char.toUpperCase()));
                }
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
                toast.success(respoText);
                dispatch(updateMoveFlag({}))
            }
        })

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
        toast.success(restoreText);
        dispatch(updateMoveFlag({}))
        if (item.type == 'section') {
            dispatch(createSection({
                id: item._id,
                name: item.sectionName
            }))
        }
    }

    const downloadFile = (file) => {
        const downloadLink = document.createElement("a");
        downloadLink.href = "data:" + file.ext + ";charset=utf-8," + encodeURIComponent(file.name);
        downloadLink.download = file.name;
        downloadLink.click();
    };

    const selectFiles = async (e, item) => {
        if (e.ctrlKey) {

            if (selectedFiles?.some(selectedItem => selectedItem._id === item._id)) {
                var filteredFiles = selectedFiles.filter(selectedItem => selectedItem._id !== item._id)
                setSelectedFiles(filteredFiles);

            }
            else {
                // setCurrentUrl(location.pathname);
                setSelectedFiles(selectedFiles => [...selectedFiles, item]);
            }

        }
        else {
            // setCurrentUrl(location.pathname);
            // if (item.type == 'folder') {
            //     setFolderSelected(true);
            // }
            // if (item.type == 'form') {

            //     setFormSelected(true);
            // }
            setSelectedFiles([item])
        }
    };

    // const handleContextMenu = (event, menuId) => {
    //     event.preventDefault();
    //     event.stopPropagation()
    //     show({ id: menuId, event });
    // }


    const fileStyle = (item) => {
        let classNames = "nk-file-item nk-file main ";


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

    async function accessNested(item) {
        if (location.pathname.includes('recovery')) {
            if (item.type == 'folder') {
                Swal.fire({
                    title: `This folder is in your Trash!`,
                    text: `To view this folder you'll need to restore it from your trash`,
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, restore it!"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const documentResponse = await API.getRestoreDetails(item._id);
                        const deleteRespo = await API.restoreDocuments([], [item._id], []);
                        if (!deleteRespo.status) {
                            return toast.error(`Error In Restoring`)
                        }
                        navigate(`/folder/${item._id}`)
                    }
                });
            }
        }
    }



    return (
        <>
            <div
                className={fileStyle(item)}
                onClick={(e) => selectFiles(e, item)}
                onDoubleClick={() => accessNested(item)}
                onContextMenu={(event) => {
                    event.preventDefault()
                    event.stopPropagation()

                    if (selectedFiles.length <= 1) {
                        selectFiles(event, item);
                        showContextMenu(event, item, 'recoveryMenu')
                    }
                    else {
                        showContextMenu(event, selectedFiles, 'multiSelectRecoveryMenu')
                    }

                }}
            >
                <div className="nk-file-info">
                    <div className="nk-file-title">
                        <div className="nk-file-icon">
                            <span className="nk-file-icon-type">{icons[item.icon]}</span>
                        </div>
                        <div className="nk-file-name">
                            <div className="nk-file-name-text">
                                <span className="title">{item.name}</span>
                                {!location.pathname.includes('recovery') && <div className="asterisk">
                                    <a
                                        href="#folder"
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            fileManagerUpdate.toggleStarred(item.id);
                                        }}
                                        className={item.starred ? "active" : ""}
                                    >
                                        <Icon className="asterisk-off icon ni ni-star"></Icon>
                                        <Icon className="asterisk-on icon ni ni-star-fill"></Icon>
                                    </a>
                                </div>}
                            </div>
                        </div>
                    </div>
                    {(fileView === 'group' || fileView === 'grid') && <ul className="nk-file-desc">
                        <li className="date">{item.date}</li>
                        <li className="size">{item.type == 'file' ? formatFileSize(item.fileSize) : ''}</li>
                        {(item.access && fileView === 'group') && <li className="members">{item.access.length} Members</li>}
                    </ul>}
                </div>
                {fileView === 'list' && <>
                    {(page === undefined) && <div className="nk-file-meta">
                        <div className="tb-lead">{item.date}</div>
                    </div>}
                    {(page === 'recovery') && <div className="nk-file-date">
                        <div className="tb-lead">{moment.utc(item?.updatedAt).local().fromNow()}</div>
                    </div>}
                    {!location.pathname.includes('recovery') && <div className="nk-file-members">
                        <div className="tb-lead">{item.access && item.access.length} Members</div>
                    </div>}
                </>}
                <div className="nk-file-actions">
                    <UncontrolledDropdown>
                        <DropdownToggle tag="a" href="#folder" className="dropdown-toggle btn btn-sm btn-icon btn-trigger"
                            onClick={(ev) => ev.preventDefault()}>
                            <Icon name="more-h"></Icon>
                        </DropdownToggle>
                        <DropdownMenu end>
                            <ul className="link-list-opt no-bdr">
                                {!location.pathname.includes('recovery') && <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => { ev.preventDefault(); setDetailModal(true); }}>
                                        <Icon name="eye"></Icon>
                                        <span>Details</span>
                                    </DropdownItem>
                                </li>}
                                {!location.pathname.includes('recovery') && <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => { ev.preventDefault(); setShareModal(true); }}>
                                        <Icon name="share"></Icon>
                                        <span>Share</span>
                                    </DropdownItem>
                                </li>}
                                {!location.pathname.includes('recovery') && <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => { ev.preventDefault(); setCopyModal(true) }}>
                                        <Icon name="copy"></Icon>
                                        <span>Copy</span>
                                    </DropdownItem>
                                </li>}
                                {!location.pathname.includes('recovery') && <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => { ev.preventDefault(); setMoveModal(true) }}>
                                        <Icon name="forward-arrow"></Icon>
                                        <span>Move</span>
                                    </DropdownItem>
                                </li>}
                                {!location.pathname.includes('recovery') && <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => { ev.preventDefault(); downloadFile(item) }}>
                                        <Icon name="download"></Icon>
                                        <span>Download</span>
                                    </DropdownItem>
                                </li>}
                                {location.pathname.includes('recovery') && <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => { ev.preventDefault(); deleteFile(item) }}>
                                        <Icon name="trash"></Icon>
                                        <span>Delete</span>
                                    </DropdownItem>
                                </li>}
                                {location.pathname.includes('recovery') && <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => { ev.preventDefault(); restore(item) }}>
                                        <Icon name="undo"></Icon>
                                        <span>Restore</span>
                                    </DropdownItem>
                                </li>}
                                {!location.pathname.includes('recovery') &&
                                    <li>
                                        <DropdownItem tag="a" href="#item" onClick={(ev) => {
                                            ev.preventDefault();
                                            generateMetadata(item);
                                        }}>
                                            <Icon name="pie-2"></Icon>
                                            <span>Generate Metadata</span>
                                        </DropdownItem>
                                    </li>
                                }
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

                <Modal isOpen={copyModal} size="md" toggle={toggleCopyModal}>
                    <Copy file={item} toggle={toggleCopyModal} toggleCreate={toggleCreateModal} />
                </Modal>

                <Modal isOpen={moveModal} size="md" toggle={toggleMoveModal}>
                    <Move file={item} toggle={toggleMoveModal} toggleCreate={toggleCreateModal} />
                </Modal>

                <Modal isOpen={createModal} size="md" toggle={toggleCreateModal}>
                    <CreateFolder toggle={toggleCreateModal} />
                </Modal>
            </div>

            {isVisible ? (
                <ContextMenu
                    isVisible={isVisible}
                    setIsVisible={setIsVisible}
                    position={position}
                    menuItem={menuItem}
                    menuRef={menuRef}
                    menuOp={menuOp}
                    viewMeta={viewMeta}


                    setDetailModal={setDetailModal}
                    setShareModal={setShareModal}
                    setCopyModal={setCopyModal}
                    setMoveModal={setMoveModal}
                    downloadFile={downloadFile}
                    deleteFile={deleteFile}
                    restore={restore}
                    generateMetadata={(data) => generateMetadata(data)}


                    multiToggle={(data) => multiToggle(data)}
                />
            ) : <></>}

        </>
    )
}


const Files = ({ files, fixedView, page }) => {
    const dispatch = useDispatch();
    const { fileManager } = useFileManager();
    const location = useLocation()
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileView = fixedView ? fixedView : fileManager.filesView;
    const [currentUrl, setCurrentUrl] = useState('')
    const fileRef = useRef(null);
    const toolbarRef = useRef(null);
    const theme = useTheme()
    const [viewMeta, setViewMeta] = useState(true)

    const [fileTypes, setFileTypes] = useState({
        sections: 0,
        folders: 0,
        files: 0,
        forms: 0
    })
    const mainClass = classNames({
        "nk-files": true,
        [`nk-files-view-${fileView}`]: fileView
    });

    const filesList = files;

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
                if (elem.type == 'section') {
                    setFileTypes({
                        ...fileTypes,
                        sections: ++fileTypes.sections
                    })
                }
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

                // if (document.querySelector('.restore-recovery')) {
                //     return;
                // }

                setSelectedFiles([])
            }
        }

        function handleKeyPress(event) {
            if (event.ctrlKey && event.key === 'a') {
                event.preventDefault();
                const searchModalActive = document.querySelector('.searchModalGlobal');
                if (searchModalActive) {
                    // console.log("searchModalActive", searchModalActive);
                    const inputElement = document.querySelector(".searchModalGlobal input.form-control");
                    if (inputElement) {
                        inputElement.select();
                    }
                    return
                }
                const tempSelection = [];
                setCurrentUrl(location.pathname);

                setSelectedFiles(filesList);
            }
            if (event.key === 'Delete') {
                if (selectedFiles.length > 0) {
                    multiToggle(true)
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


    async function multiToggle(deleteAll = false) {
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

        if (deleteAll) {
            let deleteText = "Are you sure you want to delete these documents?";
            let responseText = "Documents deleted permanently";
            if (Object.values(selectedDocs)?.flat(1)?.length == 1) {
                let selectedDocument = files.find(val => val._id == Object.values(selectedDocs)?.flat(1)[0])
                if (selectedDocument?.type == 'file') {
                    responseText = `'${selectedDocument.name.split('.')[0]}' Deleted permanently`;
                    deleteText = `Are you sure you want to permanently delete '${selectedDocument.name.split('.')[0]}'? This action cannot be undone`
                } else if (selectedDocument?.type == 'folder') {
                    responseText = `'${selectedDocument.name}' deleted permanently`;
                    deleteText = `Are you sure you want to permanently delete '${selectedDocument.name}'? This action cannot be undone`
                } else if (selectedDocument?.type == 'form') {
                    responseText = `'${selectedDocument.name}' deleted permanently`;
                    deleteText = `Are you sure you want to permanently delete '${selectedDocument.name}'? This action cannot be undone`
                } else if (selectedDocument?.type == 'section') {
                    responseText = `'${selectedDocument.sectionName}' deleted permanently`;
                    deleteText = `Are you sure you want to permanently delete '${selectedDocument.sectionName}'? This action cannot be undone`
                }
            }
            Swal.fire({
                title: 'Confirm Delete!',
                text: deleteText,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
            }).then(async respo => {
                if (respo.isConfirmed) {
                    dispatch(updateLoaderFlag({ loader: true, text: 'Deleting' }))
                    const deleteRespo = await API.deletePermenantly(selectedDocs.files, selectedDocs.folders, selectedDocs.forms, selectedDocs.sections);
                    if (!deleteRespo.status) {
                        dispatch(updateLoaderFlag({ loader: false, text: '' }))
                        toast.error(`Error in Deleting Documents`);
                    }
                    dispatch(updateLoaderFlag({ loader: false, text: '' }))
                    toast.success(responseText);
                    setSelectedFiles([])
                    dispatch(updateMoveFlag({}))
                }
            })

        } else {
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
            dispatch(updateLoaderFlag({ loader: true, text: 'Restoring' }))
            const deleteRespo = await API.restoreDocuments(selectedDocs.files, selectedDocs.folders, selectedDocs.forms, selectedDocs.sections);
            if (!deleteRespo.status) {
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
                toast.error(`Error in deleting documents`.replace(/\b\w/g, char => char.toUpperCase()));
            }
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            toast.success(responseText);
            setSelectedFiles([])
            dispatch(updateMoveFlag({}))
            if (selectedDocs.sections.length > 0) {
                const selectedSections = files.filter(file => selectedDocs.sections.includes(file._id));
                for (let sect of selectedSections) {
                    dispatch(createSection({
                        id: sect._id,
                        name: sect.sectionName
                    }))
                }
            }
        }
    }

    return (
        <>
            {selectedFiles?.length != 0 && <div className="toolbar" ref={toolbarRef} style={{ backgroundColor: theme?.skin == 'light' && '#fff' }}>
                <div className="spacer"></div>
                <p className='toolbar-selection'>{selectedFiles?.length} selected</p>
                {!location.pathname.includes('recovery') && <div className="toolbar-icon" title='copy' ><Icon name="copy"></Icon></div>}
                {!location.pathname.includes('recovery') && <div className="toolbar-icon" title='move' ><Icon name="inbox-out"></Icon></div>}
                {!location.pathname.includes('recovery') && <div className="toolbar-icon" title='download'><Icon name="download"></Icon></div>}
                {!location.pathname.includes('recovery') && <div className="toolbar-icon" title='share'><Icon name="share-fill"></Icon></div>}
                {location.pathname.includes('recovery') && <div className="toolbar-icon " id='Restore' onClick={() => multiToggle()}><Icon name="undo"></Icon>
                    <Tooltip
                        placement="bottom"
                        isOpen={tooltipOpen[`Restore`] || false}
                        target={`Restore`}
                        toggle={() => toolTipToggle(`Restore`)}
                    >
                        {'Restore'}
                    </Tooltip>
                </div>}
                {(!location.pathname.includes('recovery') && viewMeta) && <div className="toolbar-icon" title='Generate Metadata' onClick={() => generateMetadata(selectedFiles)}><Icon name="pie-2"></Icon></div>}

                <div className="toolbar-icon trash" id='Delete' onClick={() => multiToggle(true)}><Icon name="trash"></Icon>
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
            </div>}
            <div className={mainClass}>
                {filesList.length > 0 && <div className="nk-files-head">
                    <div className="nk-file-item" >
                        {fileView === 'list' && <>
                            <div className="nk-file-info">
                                <div className="tb-head fw-bold fs-6">Name</div>
                                <div className="tb-head"></div>
                            </div>
                            {(page === undefined) && <div className="nk-file-meta">
                                <div className="tb-head">Last Opened</div>
                            </div>}
                            {(page === 'recovery') && <div className="nk-file-date fw-bold fs-6">
                                <div className="tb-head">Deleted At</div>
                            </div>}
                            {!location.pathname.includes('recovery') && <div className="nk-file-members">
                                <div className="tb-head">Members</div>
                            </div>}
                            <div className="nk-file-actions">
                            </div>
                        </>}
                    </div>
                </div>}
                {(fileView === 'list' || fileView === 'grid') &&
                    <div className="nk-files-list" ref={fileRef}>
                        {filesList.map((item) => (
                            <File
                                fileView={fileView}
                                item={item}
                                key={item.id}
                                page={page}
                                selectedFiles={selectedFiles}
                                setSelectedFiles={setSelectedFiles}
                                viewMeta={viewMeta}

                                multiToggle={(data) => multiToggle(data)}
                                generateMetadata={(data) => generateMetadata(data)}
                            />
                        ))}
                    </div>
                }
                {fileView === 'group' && <div ref={fileRef}>
                    {fileTypes.folders != 0 && <div className="nk-files-group">
                        <h6 className="title border-top-0">Folders</h6>
                        <div className="nk-files-list">
                            {filesList.filter(item => item.type === 'folder').map((item) => (
                                <File
                                    fileView={fileView}
                                    item={item}
                                    key={item.id}
                                    page={page}
                                    selectedFiles={selectedFiles}
                                    setSelectedFiles={setSelectedFiles}
                                    viewMeta={viewMeta}

                                    multiToggle={(data) => multiToggle(data)}
                                    generateMetadata={(data) => generateMetadata(data)}
                                />
                            ))}
                        </div>
                    </div>}
                    {fileTypes.files != 0 && <div className="nk-files-group">
                        <h6 className="title">Files</h6>
                        <div className="nk-files-list">
                            {filesList.filter(item => item.type === 'file').map((item) => (
                                <File
                                    fileView={fileView}
                                    item={item}
                                    key={item.id}
                                    page={page}
                                    selectedFiles={selectedFiles}
                                    setSelectedFiles={setSelectedFiles}
                                    viewMeta={viewMeta}

                                    multiToggle={(data) => multiToggle(data)}
                                    generateMetadata={(data) => generateMetadata(data)}
                                />
                            ))}
                        </div>
                    </div>}
                    {fileTypes.forms != 0 && <div className="nk-files-group">
                        <h6 className="title">Files</h6>
                        <div className="nk-files-list">
                            {filesList.filter(item => item.type === 'form').map((item) => (
                                <File
                                    fileView={fileView}
                                    item={item}
                                    key={item.id}
                                    page={page}
                                    selectedFiles={selectedFiles}
                                    setSelectedFiles={setSelectedFiles}
                                    viewMeta={viewMeta}

                                    multiToggle={(data) => multiToggle(data)}
                                    generateMetadata={(data) => generateMetadata(data)}
                                />
                            ))}
                        </div>
                    </div>}
                </div>}
                {filesList.length === 0 && <>
                    <div className="p-4 text-center d-flex justify-content-center ">
                        <h6>No Documents Found</h6>
                    </div>
                </>}
                <Toaster />
            </div>
        </>
    )
}

export default Files