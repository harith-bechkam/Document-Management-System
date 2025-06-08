import React, { useEffect } from "react"
import { DropdownItem } from "reactstrap";
import { Icon } from "../../../../../components/Component";
import { useLocation, useNavigate } from "react-router";
import { useTheme } from "../../../../../layout/provider/Theme";
import { useSelector } from "react-redux";


const ContextMenu = ({ isVisible, setIsVisible, position, menuItem, menuRef, menuOp, viewMeta, setActiveMenu,

    //documents & starredMenu
    setShareFormModal,
    setShareModal,
    setFolderId,
    setFolderName,
    setDocType,



    copy,
    move,
    createDuplicate,
    setUpWorkflow,
    startWorkflow,
    downloadFile,
    toggleRenameModal,
    deleteFile,
    generateMetadata,


    //globalMenu
    toggleCreateFolderInShareModal,
    toggleCreateModal,
    toggleCreateFormModal,
    toggleUploadModal,
    toggleFolderUploadModal,

    //sharedMenu
    groupShared,
    shareAccess,

    //recoveryMenu
    setDetailModal,
    setCopyModal,
    setMoveModal,
    restore,
    setShortcutModal,
    setCopySelected,

    //sectionMenu
    setRenameSelectedSection,
    toggleRenameSection,

    deleteSection,
    setDeleteLoader,

    //multiselectdocuments
    currentUrl,
    openCopyModal,
    openMoveModal,
    deleteDocuments,
    openMultiShareFormModal,
    openMultiShareModal,
    downloadDocuments,

    //multiselectrecovery
    multiToggle

}) => {

    const theme = useTheme()
    const navigate = useNavigate()
    const location = useLocation()
    const currentSection = useSelector(state => state.folders.currentSection)


    const closeMenu = () => {
        setIsVisible(false)
    }

    const renderDocMenuItems = () => {
        return (
            <ul className="link-list-opt no-bdr">
                <li onClick={(ev) => {
                    ev.preventDefault();
                    navigate(`/details/${menuItem._id}`)
                    closeMenu()
                }}>
                    <Icon name="eye"></Icon>&emsp;
                    <span>Details</span>
                </li>

                <li onClick={(ev) => {
                    ev.preventDefault();
                    if (menuItem.type == "form") {
                        setShareFormModal(true);
                    } else {
                        setShareModal(true);
                    }
                    closeMenu()
                }}>
                    <Icon name="share" />&emsp;
                    <span>Share</span>
                </li>

                {menuItem.type !== "folder" &&
                    menuItem.createdBy == localStorage.getItem("userId") && (
                        <li onClick={() => { copy(menuItem); closeMenu() }}>
                            <Icon name="copy" />&emsp;
                            <span>Copy To</span>
                        </li>
                    )}

                {menuItem.createdBy == localStorage.getItem("userId") && (
                    <li onClick={() => { move(menuItem); closeMenu(); }}>
                        <Icon name="forward-arrow" />&emsp;
                        <span>Move To</span>
                    </li>
                )}

                {((menuItem.type == 'file') || (menuItem.type == 'form')) && <li
                    onClick={() => {
                        createDuplicate(); closeMenu();
                    }}>
                    <Icon name={'file-plus-fill'}></Icon>&emsp;
                    <span>Make a Copy</span>
                </li>}

                <li
                    onClick={() => {
                        setCopySelected(menuItem), setShortcutModal(true);
                    }}>
                    <Icon name={'forward'}></Icon>&emsp;
                    <span>Create Shortcut</span>
                </li>

                {menuItem.type == "folder" &&
                    (localStorage.getItem("userId") == menuItem.createdBy ||
                        localStorage.getItem("role") == "Super Admin") && (
                        <li onClick={() => { setUpWorkflow(menuItem); closeMenu(); }}>
                            <Icon name="git" />&emsp;
                            <span>Inherit Workflow</span>
                        </li>
                    )}

                {(menuItem['type'] == 'file' || menuItem['type'] == 'form') &&
                    <li onClick={() => { startWorkflow(menuItem); closeMenu(); }}>
                        <Icon name="git" />&emsp;
                        <span>Inherit Workflow</span>
                    </li>
                }


                {menuItem.type !== "form" && (
                    <li onClick={(ev) => {
                        ev.preventDefault()
                        downloadFile(menuItem)
                        closeMenu()
                    }}>
                        <Icon name="download" />&emsp;
                        <span>Download</span>
                    </li>
                )}

                <li onClick={(ev) => {
                    ev.preventDefault();
                    setFolderId(menuItem._id);
                    setFolderName(menuItem.name);
                    setDocType(menuItem.type);
                    toggleRenameModal();
                    closeMenu()
                }}>
                    <Icon name="edit" />&emsp;
                    <span>Rename</span>
                </li>

                <li onClick={(ev) => {
                    ev.preventDefault();
                    deleteFile(menuItem);
                    closeMenu()
                }}
                >
                    <Icon name="trash" />&emsp;
                    <span>Delete</span>
                </li>

                <li onClick={(ev) => {
                    ev.preventDefault();
                    generateMetadata(menuItem);
                    closeMenu()
                }}
                >
                    <Icon name="pie-2" />&emsp;
                    <span>Generate Metadata</span>
                </li>

            </ul>
        )
    }

    const renderGlobalMenuItems = () => {
        return (
            <ul className="link-list-opt no-bdr">
                <li onClick={() => {
                    if (location.pathname.includes('share')) {
                        toggleCreateFolderInShareModal();
                    } else {
                        toggleCreateModal();
                    }
                    closeMenu()
                }}>
                    <Icon name="folder-plus"></Icon>&emsp;
                    <span>Create Folder</span>
                </li>

                <li onClick={() => {
                    toggleCreateFormModal();
                    closeMenu()
                }}>
                    <Icon name="file-plus"></Icon>&emsp;
                    <span>Create Form</span>
                </li>

                <li onClick={() => {
                    toggleUploadModal();
                    closeMenu()
                }}>
                    <Icon name="upload-cloud"></Icon>&emsp;
                    <span>Upload File</span>
                </li>

                <li onClick={() => {
                    toggleFolderUploadModal();
                    closeMenu()
                }}
                >
                    <Icon name="folders-fill"></Icon>&emsp;
                    <span>Upload Folder</span>
                </li>
            </ul>
        )
    }

    const renderStarredMenuItems = () => {
        return (
            <ul className="link-list-opt no-bdr">
                <li onClick={(ev) => {
                    ev.preventDefault();
                    navigate(`/details/${menuItem._id}`)
                    closeMenu()
                }}>
                    <Icon name="eye"></Icon>&emsp;
                    <span>Details</span>
                </li>

                <li onClick={(ev) => {
                    ev.preventDefault();
                    if (menuItem.type == 'form') {
                        setShareFormModal(true);
                    } else {
                        setShareModal(true);
                    }
                    closeMenu()
                }}>
                    <Icon name="share"></Icon>&emsp;
                    <span>Share</span>
                </li>


                {menuItem.type !== "folder" &&
                    <li onClick={() => { copy(menuItem); closeMenu() }}>
                        <Icon name="copy"></Icon>&emsp;
                        <span>Copy</span>
                    </li>
                }


                <li onClick={() => { move(menuItem); closeMenu() }}>
                    <Icon name="forward-arrow"></Icon>&emsp;
                    <span>Move</span>
                </li>

                <li onClick={(ev) => { ev.preventDefault(); downloadFile(menuItem); closeMenu() }}>
                    <Icon name="download"></Icon>&emsp;
                    <span>Download</span>
                </li>

                <li onClick={(ev) => { ev.preventDefault(); setFolderId(menuItem._id); setFolderName(menuItem.name); setDocType(menuItem.type); toggleRenameModal(); closeMenu() }}>
                    <Icon name="edit"></Icon>&emsp;
                    <span>Rename</span>
                </li>

                <li onClick={(ev) => {
                    ev.preventDefault();
                    deleteFile(menuItem);
                    closeMenu()
                }}>
                    <Icon name="trash"></Icon>&emsp;
                    <span>Delete</span>
                </li>
                <li onClick={(ev) => {
                    ev.preventDefault();
                    generateMetadata(menuItem);
                    closeMenu()
                }}
                >
                    <Icon name="pie-2" />&emsp;
                    <span>Generate Metadata</span>
                </li>
            </ul>
        )
    }

    const renderSharedMenuItems = () => {
        return (
            <ul className="link-list-opt no-bdr">
                <li onClick={(ev) => {
                    ev.preventDefault();
                    navigate(`/details/${menuItem._id}`)
                    closeMenu()
                }}>
                    <Icon name="eye"></Icon>&emsp;
                    <span>Details</span>
                </li>

                <li onClick={(ev) => {
                    ev.preventDefault();
                    if (menuItem.type == 'form') {
                        setShareFormModal(true);
                    } else {
                        setShareModal(true);
                    }
                    closeMenu()
                }}>
                    <Icon name="share"></Icon>&emsp;
                    <span>Share</span>
                </li>
                {((menuItem.type == 'file') || (menuItem.type == 'form')) && <li
                    onClick={() => {
                        createDuplicate(); closeMenu();
                    }}>
                    <Icon name={'file-plus-fill'}></Icon>&emsp;
                    <span>Make a Copy</span>
                </li>}

                <li
                    onClick={() => {
                        setCopySelected(menuItem);
                        setShortcutModal(true);
                    }}>
                    <Icon name={'forward'}></Icon>&emsp;
                    <span>Create Shortcut</span>
                </li>

                {menuItem.type != 'form' &&
                    <li onClick={(ev) => { ev.preventDefault(); downloadFile(menuItem); closeMenu() }}>
                        <Icon name="download"></Icon>&emsp;
                        <span>Download</span>
                    </li>
                }



                {(menuItem.sharedWith.users.some(
                    (elem) => elem.user === localStorage.getItem('userId') && elem.access === 'edit'
                ) || (groupShared && shareAccess)) && (

                        <li onClick={(ev) => { ev.preventDefault(); setFolderId(menuItem._id); setFolderName(menuItem.name); setDocType(menuItem.type); toggleRenameModal(); closeMenu() }}>
                            <Icon name="edit"></Icon>&emsp;
                            <span>Rename</span>
                        </li>
                    )}
                {(((menuItem.sharedWith.users.some(
                    (elem) => elem.user === localStorage.getItem('userId') && elem.access === 'edit'
                ) || (groupShared && shareAccess)) && menuItem['type'] == "folder")) && (
                        <li onClick={(ev) => { ev.preventDefault(); setUpWorkflow(menuItem) }}>
                            <Icon name="git"></Icon>&emsp;
                            <span>Inherit Workflow</span>
                        </li>
                    )}

                {(((menuItem.sharedWith.users.some(
                    (elem) => elem.user === localStorage.getItem('userId') && elem.access === 'edit'
                ) || (groupShared && shareAccess)) && (menuItem['type'] == "file" || menuItem['type'] == "form"))) && (
                        <li onClick={(ev) => { ev.preventDefault(); startWorkflow(menuItem); closeMenu() }}>
                            <Icon name="git"></Icon>&emsp;
                            <span>Inherit Workflow</span>
                        </li>
                    )}


                {!groupShared &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        deleteFile(menuItem);
                        closeMenu()
                    }}>
                        <Icon name="trash"></Icon>&emsp;
                        <span>Delete</span>
                    </li>
                }

                {/* {(((menuItem.sharedWith.users.some(
                    (elem) => elem.user === localStorage.getItem('userId') && elem.access === 'edit'
                ) || (groupShared && shareAccess)))) && (
                        <li onClick={(ev) => { ev.preventDefault(); generateMetadata(menuItem); closeMenu() }}>
                            <Icon name="pie-2" />&emsp;
                            <span>Generate Metadata</span>
                        </li>
                    )} */}
                <li onClick={(ev) => { ev.preventDefault(); generateMetadata(menuItem); closeMenu() }}>
                    <Icon name="pie-2" />&emsp;
                    <span>Generate Metadata</span>
                </li>

            </ul>
        )
    }

    const renderRecoveryMenuItems = () => {
        return (
            <ul className="link-list-opt no-bdr">
                {!location.pathname.includes('recovery') &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        setDetailModal(true);
                        closeMenu()
                    }}>
                        <Icon name="eye"></Icon>&emsp;
                        <span>Details</span>
                    </li>
                }

                {!location.pathname.includes('recovery') &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        setShareModal(true);
                        closeMenu()
                    }}>
                        <Icon name="share"></Icon>&emsp;
                        <span>Share</span>
                    </li>
                }

                {!location.pathname.includes('recovery') &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        setCopyModal(true)
                        closeMenu()
                    }}>
                        <Icon name="copy"></Icon>&emsp;
                        <span>Copy</span>
                    </li>
                }

                {!location.pathname.includes('recovery') &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        setMoveModal(true)
                        closeMenu()
                    }}>
                        <Icon name="forward-arrow"></Icon>&emsp;
                        <span>Move</span>
                    </li>
                }

                {!location.pathname.includes('recovery') &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        downloadFile(menuItem)
                        closeMenu()
                    }}>
                        <Icon name="download"></Icon>&emsp;
                        <span>Download</span>
                    </li>
                }

                {location.pathname.includes('recovery') &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        deleteFile(menuItem)
                        closeMenu()
                    }}>
                        <Icon name="trash"></Icon>&emsp;
                        <span>Delete</span>
                    </li>
                }

                {location.pathname.includes('recovery') &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        restore(menuItem)
                        closeMenu()
                    }}>
                        <Icon name="undo"></Icon>&emsp;
                        <span>Restore</span>
                    </li>
                }

            </ul>
        )
    }

    const renderSectionMenuItems = () => {
        return (
            <ul className="link-list-opt no-bdr">
                {/* <li onClick={(ev) => {
                    ev.preventDefault();
                    setUpWorkflow()
                    closeMenu()
                }}>
                    <Icon name="git" />&emsp;
                    <span>Inherit Workflow</span>
                </li> */}

                <li onClick={(ev) => {
                    ev.preventDefault();
                    setRenameSelectedSection(currentSection)
                    toggleRenameSection()
                    closeMenu()
                }}>
                    <Icon name="pen"></Icon>&emsp;
                    <span>Rename</span>
                </li>

                <li onClick={(ev) => {
                    ev.preventDefault();
                    deleteSection(currentSection);
                    setDeleteLoader(x => !x)
                    closeMenu()
                }}>
                    <Icon name="trash"></Icon>&emsp;
                    <span>Delete</span>
                </li>
            </ul>
        )
    }

    const renderMultiSelectDocMenuItems = () => {
        return (
            <ul className="link-list-opt no-bdr">

                {menuItem?.selectedFiles.every(v => v.type != "folder") &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        openCopyModal()
                        closeMenu()
                    }}>
                        <Icon name="copy"></Icon>&emsp;
                        <span>Copy</span>
                    </li>
                }

                <li onClick={(ev) => {
                    ev.preventDefault();
                    openMoveModal()
                    closeMenu()
                }}>
                    <Icon name="inbox-out"></Icon>&emsp;
                    <span>Move</span>
                </li>

                {!menuItem?.formSelected &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        downloadDocuments()
                        closeMenu()
                    }}>
                        <Icon name="download"></Icon>&emsp;
                        <span>Download</span>
                    </li>
                }

                {!menuItem?.formSelected &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        openMultiShareModal()
                        closeMenu()
                    }}>
                        <Icon name="share-fill"></Icon>&emsp;
                        <span>Share</span>
                    </li>
                }

                {menuItem?.selectedFiles.every(v => v.type == "form") &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        openMultiShareFormModal()
                        closeMenu()
                    }}>
                        <Icon name="share"></Icon>&emsp;
                        <span>Share</span>
                    </li>
                }

                <li onClick={(ev) => {
                    ev.preventDefault();
                    deleteDocuments()
                    closeMenu()
                }}>
                    <Icon name="trash"></Icon>&emsp;
                    <span>Delete</span>
                </li>
                <li onClick={(ev) => {
                    ev.preventDefault();
                    generateMetadata(menuItem?.selectedFiles);
                    closeMenu()
                }}
                >
                    <Icon name="pie-2" />&emsp;
                    <span>Generate Metadata</span>
                </li>
            </ul>
        )
    }

    const renderMultiSelectSharedMenuItems = () => {
        return (
            <ul className="link-list-opt no-bdr">

                {!menuItem?.formSelected &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        downloadDocuments()
                        closeMenu()
                    }}>
                        <Icon name="download"></Icon>&emsp;
                        <span>Download</span>
                    </li>
                }

                {!menuItem?.formSelected &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        openMultiShareModal()
                        closeMenu()
                    }}>
                        <Icon name="share-fill"></Icon>&emsp;
                        <span>Share</span>
                    </li>
                }


                {menuItem?.selectedFiles.every(v => v.type == "form") &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        openMultiShareFormModal()
                        closeMenu()
                    }}>
                        <Icon name="share"></Icon>&emsp;
                        <span>Share Form</span>
                    </li>
                }

                {/* {
                    menuItem?.selectedFiles?.some((file) =>
                        file?.sharedWith?.users?.some(
                            (user) =>
                                user?.user === localStorage?.getItem("userId") &&
                                user?.access === "edit"
                        )
                    ) &&
                    // groupShared &&
                    // shareAccess &&
                    (
                        <li onClick={(ev) => { ev.preventDefault(); generateMetadata(menuItem?.selectedFiles); closeMenu(); }}>
                            <Icon name="pie-2" />&emsp;
                            <span>Generate Metadata</span>
                        </li>
                    )
                } */}

                <li onClick={(ev) => { ev.preventDefault(); generateMetadata(menuItem?.selectedFiles); closeMenu(); }}>
                    <Icon name="pie-2" />&emsp;
                    <span>Generate Metadata</span>
                </li>

                <li onClick={(ev) => {
                    ev.preventDefault();
                    deleteDocuments()
                    closeMenu()
                }}>
                    <Icon name="trash"></Icon>&emsp;
                    <span>Delete</span>
                </li>

            </ul>
        )
    }

    const renderMultiSelectStarredMenuItems = () => {
        return (
            <ul className="link-list-opt no-bdr">

                {menuItem?.selectedFiles.every(v => v.type != "folder") &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        openCopyModal()
                        closeMenu()
                    }}>
                        <Icon name="copy"></Icon>&emsp;
                        <span>Copy</span>
                    </li>
                }

                <li onClick={(ev) => {
                    ev.preventDefault();
                    openMoveModal()
                    closeMenu()
                }}>
                    <Icon name="inbox-out"></Icon>&emsp;
                    <span>Move</span>
                </li>

                {!menuItem?.formSelected &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        downloadDocuments()
                        closeMenu()
                    }}>
                        <Icon name="download"></Icon>&emsp;
                        <span>Download</span>
                    </li>
                }

                {!menuItem?.formSelected &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        openMultiShareModal()
                        closeMenu()
                    }}>
                        <Icon name="share-fill"></Icon>&emsp;
                        <span>Share</span>
                    </li>
                }

                <li onClick={(ev) => {
                    ev.preventDefault();
                    deleteDocuments()
                    closeMenu()
                }}>
                    <Icon name="trash"></Icon>&emsp;
                    <span>Delete</span>
                </li>
                <li onClick={(ev) => {
                    ev.preventDefault();
                    generateMetadata(menuItem?.selectedFiles);
                    closeMenu()
                }}
                >
                    <Icon name="pie-2" />&emsp;
                    <span>Generate Metadata</span>
                </li>
            </ul>
        )
    }

    const renderMultiSelectRecoveryMenuItems = () => {
        return (
            <ul className="link-list-opt no-bdr">

                {location.pathname.includes('recovery') &&
                    <li onClick={(ev) => {
                        ev.preventDefault();
                        multiToggle(false)
                        closeMenu()
                    }}>
                        <Icon name="undo"></Icon>&emsp;
                        <span>Restore</span>
                    </li>
                }
                <li onClick={(ev) => {
                    ev.preventDefault();
                    multiToggle(true)
                    closeMenu()
                }}>
                    <Icon name="trash"></Icon>&emsp;
                    <span>Delete</span>
                </li>
            </ul>
        )
    }

    return (
        <>
            {
                isVisible ?
                    <ul
                        className={`context-menu-${theme?.skin == "light" ? 'light' : 'dark'}`}
                        id={`${menuOp}`}
                        ref={menuRef}
                        style={{
                            top: position.y - 70,
                            left: position.x,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {menuOp == "documents" && renderDocMenuItems()}
                        {menuOp == "multiselectdocuments" && renderMultiSelectDocMenuItems()}

                        {menuOp == "globalMenu" && renderGlobalMenuItems()}

                        {menuOp == "starredMenu" && renderStarredMenuItems()}
                        {menuOp == "multiSelectStarredMenu" && renderMultiSelectStarredMenuItems()}


                        {menuOp == "sharedMenu" && renderSharedMenuItems()}
                        {menuOp == "multiSelectSharedMenu" && renderMultiSelectSharedMenuItems()}

                        {menuOp == "recoveryMenu" && renderRecoveryMenuItems()}
                        {menuOp == "multiSelectRecoveryMenu" && renderMultiSelectRecoveryMenuItems()}


                        {menuOp == "sectionMenu" && renderSectionMenuItems()}

                    </ul>
                    : <></>
            }
        </>
    )
}

export default ContextMenu
