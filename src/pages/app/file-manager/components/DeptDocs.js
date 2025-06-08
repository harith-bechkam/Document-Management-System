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
    saveCurrentSection,
    updateDownloadLoaderFlag,
    removeDownloadController,
    addDownloadController
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
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Lightbox } from "react-modal-image";
import moment from 'moment';
// import DragLayerComponent from './Drag';
import { useTheme } from '../../../../layout/provider/Theme';

import ContextMenu from './ContextMenu/contextMenu';
import useCustomContextMenu from './ContextMenu/useCustomContextMenu';
import WorkflowVersion from '../views/WorkflowVersion';
import Shortcut from '../modals/CreateShortcut';
import axios from 'axios';
import { setDownloadFileAction } from '../../../../redux/download/downloadAction';
import { getFileType } from '../../../../utils/helper';
import { extractFilesAndForms, showGenerateMetadata, showMetadataInfo } from '../../../../utils/metadatahelper';



const File = ({
    totalfiles,
    item,
    fileView,
    page,
    selectedFiles,
    setSelectedFiles,
    setCurrentUrl,
    setFolderSelected,
    setFormSelected,
    setFormAloneSelected,
    viewMeta,
    generateMetadata,

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

    const [shortcutModal, setShortcutModal] = useState(false);

    const { isVisible, position, menuItem, showContextMenu, setIsVisible, menuRef, menuOp } = useCustomContextMenu()


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
    const toggleShortcutModal = () => {
        setShortcutModal(!shortcutModal);
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

        // dispatch(updateDownloadLoaderFlag({ loader: true, text: 'Downloading' }))
        if (file.type == 'folder') {
            dispatch(setDownloadFileAction([{ file: [], folder: [file._id], fileName: "Zipping", extension: "", APIType: 'fileDownloadAPI', type: "bulk" }]))
            // await API.bulkDocsDownload([], [file._id])
        }
        else {
            dispatch(setDownloadFileAction([{ file: file._id, folder: [], fileName: file.name.split('.')[0], extension: file.fileType, APIType: 'fileDownloadAPI', type: "single" }]))
            // await API.downloadedFile(file._id, file.name.split('.')[0], file.storageInfo["contentType"], file.fileType)
        }
        // dispatch(updateDownloadLoaderFlag({ loader: false, text: '' }))


    };


    async function goToNested(e, currentSelection) {
        if (document.querySelectorAll(".modal.fade.show").length > 0) {
            return;
        }
        if (currentSelection.type == 'folder') {
            dispatch(updateCurrentLocation({
                drive: currentSelection
            }))
            if (currentSelection?.createdBy == localStorage.getItem('userId')) {
                navigate(`/folder/${currentSelection._id}`)
            }
            else {
                navigate(`/share/${currentSelection._id}`)
            }
        } else {
            if (currentSelection.type != 'form') {
                const docType = getFileType(currentSelection.fileType);

                if (docType == 'unknown') {
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
                if (item.isShortcut) {
                    deleteRespo = await API.deleteShortcut(item.shortcutId);
                } else {
                    if (item.type == 'folder') {
                        if (item.isShortcut) {
                            deleteRespo = await API.multiDeleteDocument([], [], [], [item.shortcutId]);
                        } else {
                            deleteRespo = await API.multiDeleteDocument([], [item._id], [], []);
                        }
                    }
                    else if (item.type == 'form') {
                        if (item.isShortcut) {
                            deleteRespo = await API.multiDeleteDocument([], [], [], [item.shortcutId]);
                        } else {
                            deleteRespo = await API.multiDeleteDocument([], [], [item._id], []);
                        }
                    }
                    else if (item.type == 'file') {
                        if (item.isShortcut) {
                            deleteRespo = await API.multiDeleteDocument([], [], [], [item.shortcutId]);
                        } else {
                            deleteRespo = await API.multiDeleteDocument([item._id], [], [], []);
                        }
                    }
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

    //WORKFLOW METHODS
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



    async function moveSelectedFile(param) {
        // if (!bool) return;

        //if folder is selected
        //all files inside folders is starting workflow by calling updateWorklfowInFilesAPI
        //leave that folder alone
        //remaining multi select folder move - using continueMultomoveprocesss
        //remaining single select folder move - using continueprocesss

        if (param['op'] == "multiselect") {

            // handleMultidrop(source.files, dest._id, dest.name)

            let showfiles = ``
            var fullScenario = [...totalfiles]
            let idsToFind = new Set()
            var hasFolder = false
            var fulldata = null
            var { op, source, checkedData } = param

            let multiselected = {
                folders: [],
                files: [],
                forms: [],
                shortcutFiles: [],
                shortcutFolders: [],
                shortcutForms: []

            }

            source.forEach(elem => {
                if (elem.type == 'folder') {
                    if (elem.isShortcut) {
                        multiselected.shortcutFolders.push(elem.shortcutId)
                    } else {
                        multiselected.folders.push(elem._id)
                    }
                }
                else if (elem.type == 'form') {
                    if (elem.isShortcut) {
                        multiselected.shortcutForms.push(elem.shortcutId)
                    } else {
                        multiselected.forms.push(elem._id)
                    }
                }
                else if (elem.type == 'file') {
                    if (elem.isShortcut) {
                        multiselected.shortcutFiles.push(elem.shortcutId)
                    } else {
                        multiselected.files.push(elem._id)
                    }
                }
            })
            if (multiselected.folders?.length != 0) {
                hasFolder = true
                fullScenario = fullScenario.filter(it => it['type'] != 'folder')

                try {
                    var childResponse = await API.getChildLevelsForFolders(multiselected.folders)
                    var { status, data } = childResponse

                    if (status) {
                        fulldata = await extractFilesAndForms(data)

                        if (fulldata['files'].length != 0) {
                            showfiles = fulldata['files'].map((da) => `${da.name}`).join("<br>");
                            fullScenario.push(...fulldata['files'])
                        }

                        if (fulldata['forms'].length != 0) {
                            showfiles = fulldata['forms'].map((da) => `${da.name}`).join("<br>");
                            fullScenario.push(...fulldata['forms'])
                        }

                    }
                }
                catch (err) {
                    toast.error(`An Error Occurred While getting Child Level Folders - ${err}`)
                    console.error('An Error Occurred While getting Child Level Folders -', err)
                }
            }

            if (hasFolder) {
                var a = fulldata['forms'].map(it => it['_id'])
                var b = fulldata['files'].map(it => it['_id'])

                if (a.length == 0 && b.length == 0) {
                    await acceptPermissions()
                    return
                }

                idsToFind = new Set([...multiselected.files, ...a, ...b, ...multiselected.forms])
            }
            else {
                idsToFind = new Set([...multiselected.files, ...multiselected.folders, ...multiselected.forms])
            }

            // console.log(idsToFind, "idsToFind")
            // console.log(fullScenario, "fullScenario")
            const matchedItems = fullScenario?.filter(item => idsToFind.has(item._id))?.map(item => ({ ...item, ishavingworkflow: item.WorkflowHistoryId != null && item.WorkflowHistoryId != "" }))
            // console.log(matchedItems, "matchedItems")

            if (checkedData['workflow']) {

                var noneworkflow = matchedItems.every(item => item.ishavingworkflow == false)
                var allHaveWorkflow = matchedItems.every(item => item.ishavingworkflow == true)

                if (noneworkflow) {
                    showfiles = ''
                    showfiles += matchedItems.map((da) => `${da.name}`).join("<br>");

                    let showText = `
                        <p style="margin-bottom: 10px;">Destination <b>${checkedData['type']}</b> has a workflow.</p>
                        <p>Do you want to inherit the parent workflow for your moving items?</p>
                        <hr>
                        <h5>Selected Items:</h5>
                        <p>     ${showfiles.split("<br>")
                            .map((file) => `<span data-toggle="tooltip" title="${file}">${file}</span>`)
                            .join("<br>")
                        }</p>
                      `;

                    Swal.fire({
                        title: "Workflow Permission",
                        html: showText,
                        icon: "question",
                        showDenyButton: true,
                        confirmButtonText: "Inherit Workflow",
                        denyButtonText: "Skip",
                        showCloseButton: true,
                        allowOutsideClick: true,
                        allowEscapeKey: true,
                        width: "450px",
                        customClass: {
                            popup: "swal-custom-popup",
                            title: "swal-custom-title",
                            confirmButton: "swal-custom-button",
                            denyButton: "swal-custom-deny-button",
                        }
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            for await (let item of matchedItems) {
                                await checkAndStartWorkflow(item, checkedData)
                            }
                            // await continueMultiMoveProcess()
                            //multidrop call 1
                            // await handleMultidrop(multiselected, checkedData._id, checkedData.name)
                            await acceptPermissionsMulti(multiselected, checkedData._id, checkedData.name)

                        }
                        else if (result.isDenied) {
                            // await continueMultiMoveProcess()
                        }
                    })
                }
                else if (allHaveWorkflow) {
                    var showText = ``
                    showfiles = ''
                    matchedItems.map((da, idx) => {
                        showfiles += `<li>${idx + 1}. ${da['name']}</li><br>`
                    })

                    showText = `
              <p style="font-size: 14px; color: #555;">The following items already have an active workflow:</p>
              <ul style="text-align: left; padding-left: 20px; font-size: 14px; color: #333;">
                     ${showfiles
                            .split("<br>")
                            .map((file) => `<span data-toggle="tooltip" title="${file}">${file}</span>`)
                            .join("<br>")
                        }
              </ul>
            `;

                    Swal.fire({
                        title: "Workflow Notification",
                        html: showText,
                        icon: "info",
                        confirmButtonText: "OK",
                        allowOutsideClick: true,
                        allowEscapeKey: true,
                        width: "400px",
                        customClass: {
                            popup: "swal-custom-popup",
                            title: "swal-custom-title",
                            confirmButton: "swal-custom-button"
                        }
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            // await continueMultiMoveProcess()
                            //multidrop call 2
                            // await handleMultidrop(multiselected, checkedData._id, checkedData.name)
                            await acceptPermissionsMulti(multiselected, checkedData._id, checkedData.name)

                        }
                    })
                }
                else {
                    //  mixed 
                    let havingFiles = matchedItems
                        .filter((da) => da?.ishavingworkflow)
                        .map((da) => `${da.name}`)
                        .join("\n<br>");

                    let notHavingFiles = matchedItems
                        .filter((da) => !da?.ishavingworkflow)
                        .map((da) => `${da.name}`)
                        .join("\n<br>");


                    let havingFilesArray = havingFiles.split("<br>");
                    let notHavingFilesArray = notHavingFiles.split("<br>");

                    let limitedHavingFiles = havingFilesArray.slice(0, 3).join("<br>");
                    let remainingHavingFiles = havingFilesArray.slice(3).join("\n");

                    let limitedNotHavingFiles = notHavingFilesArray.slice(0, 3).join("<br>");
                    let remainingNotHavingFiles = notHavingFilesArray.slice(3).join("\n");

                    let showText = `
                    <p style="margin-bottom: 10px;">Destination <b>${checkedData['type']}</b> has a workflow.</p>
                    <p>Do you want to inherit the parent workflow for your moving items?</p>
                    <hr>
                    ${notHavingFiles.length > 0
                            ? `<h5>Items Without Workflow (Will Inherit Workflow)</h5>
                          <p>
                            ${limitedNotHavingFiles}
                            ${remainingNotHavingFiles ? `<span class="text-muted" data-toggle="tooltip" title="${remainingNotHavingFiles}"> + ${notHavingFilesArray.length - 3} more</span>` : ""}
                          </p><hr>`
                            : ""}
                    
                    ${havingFiles.length > 0
                            ? `<h5>Items Already Having a Workflow</h5>
                          <p>
                            ${limitedHavingFiles}
                            ${remainingHavingFiles ? `<span class="text-muted" data-toggle="tooltip" title="${remainingHavingFiles}"> + ${havingFilesArray.length - 3} more</span>` : ""}
                          </p>`
                            : ""}
                  `;


                    Swal.fire({
                        title: "Workflow Permission",
                        html: showText,
                        icon: "question",
                        showDenyButton: true,
                        confirmButtonText: "Inherit Workflow",
                        denyButtonText: "Skip",
                        showCloseButton: true,

                        allowOutsideClick: true,
                        allowEscapeKey: true,
                        width: "450px",
                        customClass: {
                            popup: "swal-custom-popup",
                            title: "swal-custom-title",
                            confirmButton: "swal-custom-button",
                            denyButton: "swal-custom-deny-button"
                        },

                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            for await (let item of matchedItems) {
                                if (!item?.ishavingworkflow) {
                                    await checkAndStartWorkflow(item, checkedData)
                                }
                            }
                            // await continueMultiMoveProcess()
                            //multidrop call 3
                            // await handleMultidrop(multiselected, checkedData._id, checkedData.name)
                            await acceptPermissionsMulti(multiselected, checkedData._id, checkedData.name)

                        }
                        else if (result.isDenied) {
                            // await continueMultiMoveProcess()
                        }
                    })
                }

            }
            else {
                // destination folder not having workflow || folder is selected || someother tye is selected
                // await continueMultiMoveProcess()
                //multidrop call 4
                // await handleMultidrop(multiselected, checkedData._id, checkedData.name)
                await acceptPermissionsMulti(multiselected, checkedData._id, checkedData.name)

            }




        }
        //single move
        else {
            param['copySelected'] = totalfiles.find(it => it?._id == param['copySelected'].id)
            let { op, copySelected, checkedData } = param

            if (checkedData['workflow']) {//(copySelected.type == 'file' || copySelected.type == 'form') && 
                //destination folder having workflow
                var showText = ''
                var showFiles = ''
                var hasFolder = false
                if (copySelected['type'] == 'folder') {
                    try {
                        var childResponse = await API.getChildLevelsForFolders([copySelected?._id])
                        var { status, data } = childResponse
                        hasFolder = true

                        if (status) {
                            fulldata = await extractFilesAndForms(data)

                            if (fulldata['files'].length != 0) {
                                showFiles = fulldata['files'].map((da) => `${da.name}`).join("<br>");
                            }

                            if (fulldata['forms'].length != 0) {
                                showFiles = fulldata['forms'].map((da) => `${da.name}`).join("<br>");
                            }
                        }

                    }
                    catch (err) {
                        toast.error(`An Error Occurred While getting Child Level Folders - ${err}`)
                        console.error('An Error Occurred While getting Child Level Folders -', err)
                    }

                }
                else {
                    showFiles = copySelected['name']
                }

                if (hasFolder) {
                    let havingFiles = fulldata['files']
                        .filter((da) => da?.WorkflowHistoryId != null && da?.WorkflowHistoryId != "")
                        .map((da) => `${da.name}`)
                        .join("<br>");

                    havingFiles += fulldata['forms']
                        .filter((da) => da?.WorkflowHistoryId != null && da?.WorkflowHistoryId != "")
                        .map((da) => `${da.name}`)
                        .join("<br>");

                    let notHavingFiles = fulldata['files']
                        .filter((da) => da?.WorkflowHistoryId === null || da?.WorkflowHistoryId === "")
                        .map((da) => `${da.name}`)
                        .join("<br>");

                    notHavingFiles += fulldata['forms']
                        .filter((da) => da?.WorkflowHistoryId === null || da?.WorkflowHistoryId === "")
                        .map((da) => `${da.name}`)
                        .join("<br>");

                    if (havingFiles.length == 0 && notHavingFiles.length == 0) {
                        await acceptPermissions();
                        return;
                    }

                    let havingFilesArray = havingFiles.split("<br>");
                    let notHavingFilesArray = notHavingFiles.split("<br>");

                    let limitedHavingFiles = havingFilesArray.slice(0, 3).join("<br>");
                    let remainingHavingFiles = havingFilesArray.slice(3).join("\n");

                    let limitedNotHavingFiles = notHavingFilesArray.slice(0, 3).join("<br>");
                    let remainingNotHavingFiles = notHavingFilesArray.slice(3).join("\n");

                    let showText = `
                <p style="margin-bottom: 10px;">Destination <b>${checkedData['type']}</b> has a workflow.</p>
                <p>Do you want to inherit the parent workflow for your moving items?</p>
                <hr>
                ${notHavingFiles.length > 0
                            ? `<h5>Items Without Workflow (Will Inherit Workflow)</h5>
                        <p>
                          ${limitedNotHavingFiles}
                          ${remainingNotHavingFiles ? `<span class="text-muted" style="cursor: pointer;" data-toggle="tooltip" title="${remainingNotHavingFiles}"> + ${notHavingFilesArray.length - 3} more</span>` : ""}
                        </p><hr>`
                            : ""}
                  
                ${havingFiles.length > 0
                            ? `<h5>Items Already Having a Workflow</h5>
                        <p>
                          ${limitedHavingFiles}
                          ${remainingHavingFiles ? `<span class="text-muted" style="cursor: pointer;" data-toggle="tooltip" title="${remainingHavingFiles}"> + ${havingFilesArray.length - 3} more</span>` : ""}
                        </p>`
                            : ""}
              `;

                    Swal.fire({
                        title: "Workflow Permission",
                        html: showText,
                        icon: "question",
                        showDenyButton: true,
                        confirmButtonText: "Inherit Workflow",
                        denyButtonText: "Skip",
                        showCloseButton: true,
                        allowOutsideClick: true,
                        allowEscapeKey: true,
                        width: "450px",
                        customClass: {
                            popup: "swal-custom-popup",
                            title: "swal-custom-title",
                            confirmButton: "swal-custom-button",
                            denyButton: "swal-custom-deny-button"
                        },
                        // didOpen: () => {
                        //   // Trigger tooltips after the Swal is opened
                        //   $(function () {
                        //     $('[data-toggle="tooltip"]').tooltip();
                        //   });
                        // }
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            await checkAndStartWorkflow(copySelected, checkedData);
                            //handledrop call 1
                            // await handleDrop(copySelected?._id, checkedData?._id, copySelected?.type, checkedData?.type, checkedData?.name, copySelected?.name, copySelected?.isShortcut,copySelected?.shortcutId )
                            await acceptPermissions(copySelected?._id, checkedData?._id, copySelected?.type, checkedData?.type, checkedData?.name, copySelected?.name, copySelected?.isShortcut, copySelected?.shortcutId)
                        }
                        else if (result.isDenied) {
                            // await continueMultiMoveProcess()
                        }
                    });
                }
                else {
                    if (copySelected['WorkflowHistoryId'] == null || copySelected['WorkflowHistoryId'] == "") {
                        // Current file doesn't have workflow
                        let showText = `
                <p style="margin-bottom: 10px;">Destination <b>${checkedData['type']}</b> has a workflow.</p>
                <p>Do you want to inherit the parent workflow for your moving Items?</p>
                <hr>
                <h5>Selected Item:</h5>
                <p>${showFiles.split("<br>")
                                .map((file) => `<span data-toggle="tooltip" title="${file}">${file}</span>`)
                                .join("<br>")
                            }</p>
              `;

                        const result = await Swal.fire({
                            title: "Workflow Permission",
                            html: showText,
                            icon: "warning",
                            showDenyButton: true,
                            showCancelButton: false,
                            confirmButtonText: "Inherit Workflow",
                            denyButtonText: "Skip",
                            showCloseButton: true,
                            width: "400px",
                            customClass: {
                                popup: "swal-custom-popup",
                                title: "swal-custom-title",
                                confirmButton: "swal-custom-button",
                                denyButton: "swal-custom-deny",
                                cancelButton: "swal-custom-cancel-button"
                            }
                        })

                        if (result.isConfirmed) {
                            await checkAndStartWorkflow(copySelected, checkedData)
                            // await continueProcess()
                            //handledrop call 3
                            // await handleDrop(copySelected?._id, checkedData?._id, copySelected?.type, checkedData?.type, checkedData?.name, copySelected?.name, copySelected?.isShortcut, copySelected?.shortcutId)
                            await acceptPermissions(copySelected?._id, checkedData?._id, copySelected?.type, checkedData?.type, checkedData?.name, copySelected?.name, copySelected?.isShortcut, copySelected?.shortcutId)
                        }
                        else if (result.isDenied) {
                            // await continueProcess()
                        }

                    }
                    else {
                        // Assuming `showFiles` is a list of file names or an array of objects containing file names
                        let showText = `
                  <p>The selected items already have an active workflow</p>
                  <hr>
                  <h5>Item Name:</h5>
                  <p>
                    ${showFiles
                                .split("<br>")
                                .map((file) => `<span data-toggle="tooltip" title="${file}">${file}</span>`)
                                .join("<br>")
                            }
                  </p>
                `;

                        await Swal.fire({
                            title: "Workflow Notification",
                            html: showText,
                            icon: "info",
                            confirmButtonText: "OK",
                            allowOutsideClick: true,
                            allowEscapeKey: true,
                            width: "400px",
                            customClass: {
                                popup: "swal-custom-popup",
                                title: "swal-custom-title",
                                confirmButton: "swal-custom-button"
                            },
                            // didOpen: () => {
                            //   // Initialize tooltips for all items
                            //   $(function () {
                            //     $('[data-toggle="tooltip"]').tooltip();
                            //   });
                            // }
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                // await continueProcess();
                                //handledrop call 2
                                // await handleDrop(copySelected?._id, checkedData?._id, copySelected?.type, checkedData?.type, checkedData?.name, copySelected?.name, copySelected?.isShortcut, copySelected?.shortcutId)
                                await acceptPermissions(copySelected?._id, checkedData?._id, copySelected?.type, checkedData?.type, checkedData?.name, copySelected?.name, copySelected?.isShortcut, copySelected?.shortcutId)
                            }
                        });
                    }
                }
            }
            else {
                // destination folder not having workflow || folder is selected || someother tye is selected
                // await continueProcess()
                // console.log("coems", copySelected, checkedData)
                //handledrop call 4
                // await handleDrop(copySelected?._id, checkedData?._id, copySelected?.type, checkedData?.type, checkedData?.name, copySelected?.name, copySelected?.isShortcut, copySelected?.shortcutId)
                await acceptPermissions(copySelected?._id, checkedData?._id, copySelected?.type, checkedData?.type, checkedData?.name, copySelected?.name, copySelected?.isShortcut, copySelected?.shortcutId)
            }


        }
        // toggle()
    }

    async function acceptPermissions(copySelectedId, checkedDataId, copySelectedType, checkedDataType, checkedDataName, copySelectedName, copySelectedIsShortcut, copySelectedShortcutId) {
        let selectedPermission = "combine";

        let htmlText = `<div class="container mt-4">
          <div class="card p-3">
              <h5 class="mb-3">Select Permission Type for Selected Document</h5>
              <div class="form-check">
                  <input class="form-check-input" type="radio" name="permissionOptions" id="combinePermissions" value="combine" checked>
                  <label class="form-check-label" for="combinePermissions">
                      Combine Permissions
                  </label>
              </div>
              <div class="form-check">
                  <input class="form-check-input" type="radio" name="permissionOptions" id="resetPermissions" value="reset">
                  <label class="form-check-label" for="resetPermissions">
                      Reset to Destination Permissions
                  </label>
              </div>
              <div class="form-check">
                  <input class="form-check-input" type="radio" name="permissionOptions" id="retainPermissions" value="retain">
                  <label class="form-check-label" for="retainPermissions">
                      Retain Source Permissions
                  </label>
              </div>
          </div>
        </div>`;

        Swal.fire({
            html: htmlText,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Next",
            cancelButtonText: "Cancel",
            allowOutsideClick: false,
            allowEscapeKey: false,
            width: "450px",
            didOpen: () => {
                document.querySelectorAll('input[name="permissionOptions"]').forEach((radio) => {
                    radio.addEventListener("change", (event) => {
                        selectedPermission = event.target.value;
                    });
                });
            },
            preConfirm: () => {
                debugger
                return selectedPermission;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                await handleDrop(copySelectedId, checkedDataId, copySelectedType, checkedDataType, checkedDataName, copySelectedName, copySelectedIsShortcut, copySelectedShortcutId, result.value)

            }
        });
    }

    async function acceptPermissionsMulti(multiselected, checkedDataId, checkedDataName) {
        let selectedPermission = "combine";

        let htmlText = `<div class="container mt-4">
          <div class="card p-3">
              <h5 class="mb-3">Select Permission Type for Selected Document</h5>
              <div class="form-check">
                  <input class="form-check-input" type="radio" name="permissionOptions" id="combinePermissions" value="combine" checked>
                  <label class="form-check-label" for="combinePermissions">
                      Combine Permissions
                  </label>
              </div>
              <div class="form-check">
                  <input class="form-check-input" type="radio" name="permissionOptions" id="resetPermissions" value="reset">
                  <label class="form-check-label" for="resetPermissions">
                      Reset to Destination Permissions
                  </label>
              </div>
              <div class="form-check">
                  <input class="form-check-input" type="radio" name="permissionOptions" id="retainPermissions" value="retain">
                  <label class="form-check-label" for="retainPermissions">
                      Retain Source Permissions
                  </label>
              </div>
          </div>
        </div>`;

        Swal.fire({
            html: htmlText,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Next",
            cancelButtonText: "Cancel",
            allowOutsideClick: false,
            allowEscapeKey: false,
            width: "450px",
            didOpen: () => {
                document.querySelectorAll('input[name="permissionOptions"]').forEach((radio) => {
                    radio.addEventListener("change", (event) => {
                        selectedPermission = event.target.value;
                    });
                });
            },
            preConfirm: () => {
                debugger
                return selectedPermission;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                await handleMultidrop(multiselected, checkedDataId, checkedDataName, result.value)
            }
        });
    }

    const checkAndStartWorkflow = async (item, parentData) => {
        dispatch(updateLoaderFlag({ loader: true, text: "Moving" }));

        if (item['type'] == 'folder') {

            try {
                await API.updateWorkflowInFoldersRecursively(item, parentData)
            }
            catch (err) {
                toast.error(`An Error Occurred While Starting Workflow - ${err}`)
                console.error('An Error Occurred While Starting Workflow -', err)
            }
        }
        else {
            //check himself
            let { status, message, lastRevisionNo } = await checkBeforeEnableThisBtn(item['_id'], item['type'])
            if (lastRevisionNo == '' || !lastRevisionNo || lastRevisionNo == undefined || lastRevisionNo == '-') {
                lastRevisionNo = 0
            }

            if (message == "File is in under Workflow!") {
                toast("This file is already in a workflow" || message, { icon: '⚠️' });
                return
            }


            let togoName = item['type']
            let togoId = item['_id']
            let lastRevisionNo1 = lastRevisionNo = '-' ? 0 : Number(lastRevisionNo)
            parentData = {
                ...parentData,
                workflow: { ...(parentData.workflow || {}), revisionNo: (lastRevisionNo1 + 1) || 1 }
            }


            try {
                await API.updateWorkflowInFiles(parentData['workflow'], togoName, togoId, lastRevisionNo1 + 1 || 1)
            }
            catch (err) {
                dispatch(updateLoaderFlag({ loader: false, text: "" }))
                toast.error(`An Error Occurred While Starting Workflow - ${err}`)
                console.error('An Error Occurred While Starting Workflow -', err)
            }
        }
        dispatch(updateLoaderFlag({ loader: false, text: "" }))

    }
    //--------------------_

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


    const dragHandler = async (source, dest) => {
        if (source.files?.length == 0) {
            var param = {
                op: "single",
                copySelected: source.file,
                checkedData: dest
            }
            await moveSelectedFile(param)
            //  handleDrop(source.file?.id, dest._id, source.file?.type, dest.type, dest.name, source.file?.name)
        }
        else {
            // dispatch(updateLoaderFlag({ loader: true, text: 'Moving Files' }))
            if (dest.type == 'folder') {
                var param = {
                    op: "multiselect",
                    source: source.files,
                    checkedData: dest
                }
                await moveSelectedFile(param)
                // handleMultidrop(source.files, dest._id, dest.name)
            } else {
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
            }
        }
    }

    const handleDrop = async (draggedId, targetId, draggedType, targetType, targetName, draggedName, isShortcut, shortcutId, permission) => {

        // console.log(draggedId, targetId, "targetId")
        if (draggedId != targetId && targetType == 'folder') {
            dispatch(updateLoaderFlag({ loader: true, text: 'Moving Files' }))
            let moveRespo;
            if (draggedType == 'folder') {
                if (isShortcut) {
                    moveRespo = await API.docsMove([], [], [], [], [shortcutId], [], targetId, permission)
                } else {
                    moveRespo = await API.docsMove([], [draggedId], [], [], [], [], targetId, permission)
                }
            } else if (draggedType == 'form') {
                if (isShortcut) {
                    moveRespo = await API.docsMove([], [], [], [], [], [shortcutId], targetId, permission)
                } else {
                    moveRespo = await API.docsMove([], [], [draggedId], [], [], [], targetId, permission)
                }
            } else if (draggedType == 'file') {
                if (isShortcut) {
                    moveRespo = await API.docsMove([], [], [], [shortcutId], [], [], targetId, permission)
                } else {
                    moveRespo = await API.docsMove([draggedId], [], [], [], [], [], targetId, permission)
                }
            }

            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            if (!moveRespo.status) {
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
                return toast.error(`error occured during moving ${draggedName}`.replace(/\b\w/g, char => char.toUpperCase()));
            }
            dispatch(updateMoveFlag({}))
            toast.success(`${draggedName} moved to ${targetName}!`.replace(/\b\w/g, char => char.toUpperCase()));
        }
    };

    const handleMultidrop = async (draggedItems, targetId, targetName, permission) => {
        // const draggedItems = {
        //     folders: [],
        //     files: [],
        //     forms: []
        // }
        // selectedFiles.forEach(elem => {
        //     if (elem.type == 'folder') {
        //         draggedItems.folders.push(elem._id)
        //     }
        //     else if (elem.type == 'form') {
        //         draggedItems.forms.push(elem._id)
        //     }
        //     else {
        //         draggedItems.files.push(elem._id)
        //     }
        // })
        dispatch(updateLoaderFlag({ loader: true, text: 'Moving Documents' }))
        let moveRespo = await API.docsMove(draggedItems.files, draggedItems.folders, draggedItems.forms, draggedItems.shortcutFiles, draggedItems.shortcutFolders, draggedItems.shortcutForms, targetId, permission);
        if (!moveRespo.status) {
            dispatch(updateLoaderFlag({ loader: false, text: '' }))
            return toast.error(`error occured during moving items to  ${targetName}`.replace(/\b\w/g, char => char.toUpperCase()));
        }
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        dispatch(updateMoveFlag({}))
        toast.success(`items moved to ${targetName}!`.replace(/\b\w/g, char => char.toUpperCase()));
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

            if (selectedFiles?.some(selectedItem => selectedItem.uniqueId === item.uniqueId)) {

                var filteredFiles = selectedFiles.filter(selectedItem => selectedItem.uniqueId !== item.uniqueId)
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
                            <div>
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
                            <div>
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
            if (selectedFiles?.some(selectedItem => selectedItem.uniqueId === item.uniqueId)) {
                classNames += 'backgroundBlueColor'
            }
            else {
                classNames += 'backgroundWhiteColor'
            }
        }

        if (theme.skin == 'dark') {
            classNames += "dark "
            if (selectedFiles?.some(selectedItem => selectedItem.uniqueId === item.uniqueId)) {
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
        if (Array.isArray(item.sharedWith.users) && Array.isArray(item.sharedWith.userGroups)) {
            sharedMembers = [...item.sharedWith.users, ...item.sharedWith.userGroups]
        }
        if (Array.isArray(item.sharedWith.externalUsers)) {
            sharedMembers = [...sharedMembers, ...item.sharedWith.externalUsers]
        }
        if (sharedMembers.length > 0) {
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

    async function createDuplicate() {
        const path = location.pathname;
        const parentId = path.split('/').pop();
        if (path.includes('home')) {
            copy(item)
        } else {
            if (item.type == 'file') {
                if (item.isShortcut) {
                    dispatch(updateLoaderFlag({ loader: true, text: 'Making A Copy' }))
                    const makeacopyRespo = await API.filesCopy([], parentId, [item.shortcutId], true);
                    if (!makeacopyRespo.status) {
                        dispatch(updateLoaderFlag({ loader: false, text: '' }))
                        return toast.error(`Error in Duplicating ${item.name}`);
                    }
                    dispatch(updateMoveFlag({}))
                    dispatch(updateLoaderFlag({ loader: false, text: '' }))
                } else {
                    dispatch(updateLoaderFlag({ loader: true, text: 'Making A Copy' }))
                    const makeacopyRespo = await API.filesCopy([item._id], parentId, [], true);
                    if (!makeacopyRespo.status) {
                        dispatch(updateLoaderFlag({ loader: false, text: '' }))
                        return toast.error(`Error in Duplicating ${item.name}`);
                    }
                    dispatch(updateMoveFlag({}))
                    dispatch(updateLoaderFlag({ loader: false, text: '' }))
                }

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

    function renderFilename() {
        if (item?.name?.length > 30) {
            const uniqueId = `string_${item._id}`
            return <div className="nk-file-name-text">
                <span id={uniqueId.replace(/\W/g, "")} className="title" >{item?.name?.length > 30 ? `${item?.name?.slice(0, 30)}...` : item?.name} {item.type == 'folder' && fileView == 'group' ? (item.totalChildCount ? `(${item.totalChildCount})` : '(0)') : ''}</span>
                <Tooltip
                    placement="top"
                    isOpen={tooltipOpen[uniqueId.replace(/\W/g, "")] || false}
                    target={uniqueId.replace(/\W/g, "")}
                    toggle={() => toolTipToggle(uniqueId.replace(/\W/g, ""))}
                >
                    {item?.name}
                </Tooltip>
                <div className='asterisk'>
                    <a href='' className={item?.starredDisplay ? "active" : ""} id="anchor-id" onClick={(e) => handleStarred(e, item._id, item.type, item)}>
                        <Icon className="asterisk-off icon ni ni-star"></Icon>
                        <Icon className="asterisk-on icon ni ni-star-fill" ></Icon>
                    </a>
                </div>
            </div>
        } else {
            return <div className="nk-file-name-text">
                <span className="title" >{item?.name} {item.type == 'folder' && fileView == 'group' ? (item.totalChildCount ? `(${item.totalChildCount})` : '(0)') : ''}</span>
                <div className='asterisk'>
                    <a href='' className={item?.starredDisplay ? "active" : ""} id="anchor-id" onClick={(e) => handleStarred(e, item._id, item.type, item)}>
                        <Icon className="asterisk-off icon ni ni-star"></Icon>
                        <Icon className="asterisk-on icon ni ni-star-fill" ></Icon>
                    </a>
                </div>
            </div>
        }

    }

    function renderIcon(item, icons) {
        if (item.isShortcut) {
            return icons["Shortcut"]
        } else {
            return ""
        }
    }





    return (
        <>
            {selectedFiles.length > 1 && <DragPreviewImage connect={preview} src={multipleDocs} />}

            <div
                ref={drop}
                className={fileStyle(item)}
                onClick={(e) => selectFiles(e, item)}
                onDoubleClick={(e) => { goToNested(e, item) }}
                onContextMenu={async (event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    if (selectedFiles.length <= 1) {
                        await selectFiles(event, item);
                        showContextMenu(event, item, 'documents')
                    }
                    else {
                        showContextMenu(event, { selectedFiles, formSelected }, 'multiselectdocuments')
                    }
                }}
            >
                <div ref={drag} className="nk-file-info" style={{ opacity: isDragging ? 0.5 : 1 }}>
                    <div className="nk-file-title">
                        <div className="nk-file-icon">
                            <span className="nk-file-icon-type folderChildCount"><span className="iconwrapper"> <span className="iconmain">{icons[item.icon]}</span><span className="iconshortcut">{renderIcon(item, icons)}</span></span>{item.type == 'folder' && fileView === 'grid' && <span className="childCount">{item.totalChildCount ? item.totalChildCount : 0}</span>}</span>
                        </div>
                        <div className="nk-file-name">
                            {renderFilename()}
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

                {fileView === 'list' && <>
                    {(page === undefined) && <div className="nk-file-meta">
                        <div className="tb-lead">{item.type == 'folder' ? (item.totalChildCount ? `${item.totalChildCount} ${item.totalChildCount == 1 ? 'item' : 'items'}` : '0 items') : (item?.fileSize ? formatFileSize(item?.fileSize) : '')}</div>
                    </div>}
                    {(page === undefined) && <div className="nk-file-meta">
                        <div className="tb-lead">{moment.utc(item?.createdAt).local().fromNow()}</div>
                    </div>}
                    {(location.pathname.includes('home')) && <div className="nk-file-meta">
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
                        {/* <div className="tb-lead">{item?.sharedWith["users"].length != 0 ? `${item?.sharedWith["users"].length} Members` : '-'}</div> */}
                        <div className="tb-lead" onClick={() => openSharedWithView()}>{(item?.sharedWith?.users?.length != 0) || (item?.sharedWith?.userGroups?.length != 0) || (item?.sharedWith?.externalUsers?.length != 0) ? renderSharedWithAvatars(item) : '-'}</div>
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
                                {item.type != 'folder' && item.createdBy == localStorage.getItem('userId') && <li>
                                    <DropdownItem tag="a" href="javascript:void(0)" onClick={() => copy(item)}>
                                        <Icon name="copy"></Icon>
                                        <span>Copy to</span>
                                    </DropdownItem>
                                </li>}
                                {item.createdBy == localStorage.getItem('userId') && <li>
                                    <DropdownItem tag="a" href="javascript:void(0)" onClick={() => move(item)}>
                                        <Icon name="forward-arrow"></Icon>
                                        <span>Move to</span>
                                    </DropdownItem>
                                </li>}
                                <li>
                                    <DropdownItem tag="a" href="javascript:void(0)" onClick={() => { setCopySelected(item); setShortcutModal(true) }}>
                                        <Icon name="forward"></Icon>
                                        <span>Create Shortcut</span>
                                    </DropdownItem>
                                </li>
                                {((item.type == 'file') || (item.type == 'form')) && <li>
                                    <DropdownItem tag="a" href="#item" onClick={(ev) => {
                                        ev.preventDefault();
                                        createDuplicate()
                                    }}>
                                        <Icon name={addShortcutIcon()}></Icon>
                                        <span>Make a Copy</span>
                                    </DropdownItem>
                                </li>}
                                {(item['type'] == "folder" && (localStorage.getItem('userId') == item['createdBy'] || localStorage.getItem('role') == "Super Admin")) &&
                                    <li>
                                        <DropdownItem tag="a" href="javascript:void(0)" onClick={() => setUpWorkflow(item)}>
                                            <Icon name="git" />
                                            <span>Inherit Workflow</span>
                                        </DropdownItem>
                                    </li>
                                }
                                {(item['type'] == "file" || item['type'] == "form") &&
                                    <li>
                                        <DropdownItem tag="a" href="javascript:void(0)" onClick={() => startWorkflow(item)} >
                                            <Icon name="git" />
                                            <span>Inherit Workflow</span>
                                        </DropdownItem>
                                    </li>
                                }
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

                <Modal isOpen={shareModal} size="lg" toggle={toggleShareModal}>
                    <Share file={item} toggle={toggleShareModal} />
                </Modal>

                <Modal isOpen={shareFormModal} size="lg" toggle={toggleShareFormModal}>
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

                <Modal isOpen={shortcutModal} size="md" toggle={toggleShortcutModal}>
                    <Shortcut file={item} toggle={toggleShortcutModal} copySelected={copySelected} />
                </Modal>

                <Modal isOpen={createModal} size="md" toggle={toggleCreateModal}>
                    <CreateFolder toggle={toggleCreateModal} />
                </Modal>

                <Modal isOpen={renameModal} backdrop={true} size="md" toggle={toggleRenameModal}>
                    <RenameFolder toggle={toggleRenameModal} folderId={folderId} folderName={folderName} type={docType} shortcut={item.isShortcut} document={item} />
                </Modal>
                <Modal isOpen={viewerModal} size="md" toggle={toggleViewerModal}>
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
                    setCopySelected={setCopySelected}
                    setShareModal={setShareModal}
                    setFolderId={setFolderId}
                    setFolderName={setFolderName}
                    setDocType={setDocType}
                    setShortcutModal={setShortcutModal}

                    copy={(data) => copy(data)}
                    move={(data) => move(data)}
                    createDuplicate={() => createDuplicate()}
                    setUpWorkflow={(data) => setUpWorkflow(data)}
                    startWorkflow={(data) => startWorkflow(data)}
                    downloadFile={(data) => downloadFile(data)}
                    toggleRenameModal={() => toggleRenameModal()}
                    deleteFile={(data) => deleteFile(data)}
                    generateMetadata={(data) => generateMetadata(data)}


                    //for multiselect menuItems
                    currentUrl={currentUrl}
                    openCopyModal={() => openCopyModal()}
                    openMoveModal={() => openMoveModal()}
                    deleteDocuments={() => deleteDocuments()}
                    openMultiShareFormModal={() => openMultiShareFormModal()}
                    openMultiShareModal={() => openMultiShareModal()}
                    downloadDocuments={() => downloadDocuments()}

                />
            ) : <></>}
        </>
    )
}


const DeptDocs = ({ files, fixedView, page }) => {

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
        newParentId: '',
        shortcutFiles: [],
        shortcutFolders: [],
        shortcutForms: []
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
    const [singleFormShareModal, setSingleFormShareModal] = useState(false);

    const [item, setItem] = useState({})
    const [viewMeta, setViewMeta] = useState(true)

    const fileRef = useRef(null);
    const toolbarRef = useRef(null);

    const toggleShareModal = () => {
        setShareModal(!shareModal);
    };
    const toggleShareFormModal = () => {
        setShareFormModal(!shareFormModal);
    };

    const toggleSingleShareFormModal = () => {
        setSingleFormShareModal(!singleFormShareModal);
    };

    const [checkStatus, setCheckStatus] = useState(null);
    const [sortStatus, setSortStatus] = useState(null);

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
                if (document.querySelector('.heightsetter').offsetWidth <= event.clientX) {
                    return
                }
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
        // setSelectedFiles([])
        setMultiShareModal(!multiShareModal);
    };



    function openCopyModal() {
        const files = [];
        const forms = [];
        const shortcutFiles = [];
        const shortcutForms = [];
        selectedFiles.forEach(elem => {
            if (elem.type != 'folder') {
                if (elem.type == 'form') {
                    if (elem.isShortcut) {
                        shortcutForms.push(elem.shortcutId);
                    } else {
                        forms.push(elem._id);
                    }
                } else if (elem.type == 'file') {
                    if (elem.isShortcut) {
                        shortcutFiles.push(elem.shortcutId);
                    } else {
                        files.push(elem._id);
                    }
                }
            }
        })
        // debugger
        setCopiedDocs({
            files,
            forms,
            shortcutFiles,
            shortcutForms
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
        debugger
        if (sharedFiles.length == 1 && sharedFolders.length == 0 && sharedForms.length == 0) {
            const _item = files.filter(val => val._id == sharedFiles[0]._id);
            // debugger
            setItem(_item[0]);
            setShareModal(true);
        } else if (sharedFiles.length == 0 && sharedFolders.length == 1 && sharedForms.length == 0) {
            const _item = files.filter(val => val._id == sharedFolders[0]._id);
            // debugger
            setItem(_item[0]);
            setShareModal(true);
        } else if (sharedFiles.length == 0 && sharedFolders.length == 0 && sharedForms.length == 1) {
            const _item = files.filter(val => val._id == sharedForms[0]._id);
            // debugger
            setItem(_item[0]);
            setShareFormModal(true);
        } else {
            setMultiShareModal(true);
        }
    }

    function openMoveModal() {
        console.log(moveFiles);
        // debugger
        selectedFiles.forEach(elem => {
            if (elem.type == 'folder') {
                if (elem.isShortcut) {
                    setMoveFiles(prev => ({
                        ...prev,
                        shortcutFolders: [...prev.shortcutFolders, elem.shortcutId]
                    }));
                } else {
                    setMoveFiles(prev => ({
                        ...prev,
                        folders: [...prev.folders, elem._id]
                    }));
                }
            }
            else if (elem.type == 'form') {
                if (elem.isShortcut) {
                    setMoveFiles(prev => ({
                        ...prev,
                        shortcutForms: [...prev.shortcutForms, elem.shortcutId]
                    }));
                } else {
                    setMoveFiles(prev => ({
                        ...prev,
                        forms: [...prev.forms, elem._id]
                    }));
                }
            }
            else {
                if (elem.isShortcut) {
                    setMoveFiles(prev => ({
                        ...prev,
                        shortcutFiles: [...prev.shortcutFiles, elem.shortcutId]
                    }));
                } else {
                    setMoveFiles(prev => ({
                        ...prev,
                        files: [...prev.files, elem._id]
                    }));
                }

            }
        })
        // debugger
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
        if (sharedForms.length == 1) {
            setItem(sharedForms[0]);
            setSingleFormShareModal(true);
        } else {
            setMultiShareForms(sharedForms);
            setFormShareModal(true);
        }
    }

    const toggleFormShareModal = () => {
        // setSelectedFiles([])
        setFormShareModal(!formShareModal);
    };

    async function deleteDocuments() {
        const selectedDocs = {
            folders: [],
            files: [],
            forms: [],
            shortcuts: []
        };

        selectedFiles.forEach(elem => {
            if (elem.type === 'folder') {
                if (elem.isShortcut) {
                    selectedDocs.shortcuts.push(elem.shortcutId);
                } else {
                    selectedDocs.folders.push(elem._id);
                }
            }
            else if (elem.type === 'form') {
                if (elem.isShortcut) {
                    selectedDocs.shortcuts.push(elem.shortcutId);
                } else {
                    selectedDocs.forms.push(elem._id);
                }
            }
            else if (elem.type === 'file') {
                if (elem.isShortcut) {
                    selectedDocs.shortcuts.push(elem.shortcutId);
                } else {
                    selectedDocs.files.push(elem._id);
                }
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
                const deleteRespo = await API.multiDeleteDocument(selectedDocs.files, selectedDocs.folders, selectedDocs.forms, selectedDocs.shortcuts);
                if (!deleteRespo.status) {
                    dispatch(updateLoaderFlag({ loader: false, text: '' }))
                    return toast.error(`error in deleting documents`.replace(/\b\w/g, char => char.toUpperCase()));
                }
                dispatch(updateLoaderFlag({ loader: false, text: '' }))
                toast.success(responseText.replace(/\b\w/g, char => char.toUpperCase()));
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
        setSortStatus(null)
        if (checkStatus == 'asc') {
            stat = 'desc'
        }
        if (currentLocation.isSection) {
            fetchSectionList(currentLocation.path, 'createdAt', stat);
        } else {
            fetchFolderList(currentLocation.path, 'createdAt', stat);
        }
        setCheckStatus(stat);
        localStorage.setItem('sortOrder', stat)
        localStorage.setItem('sortBy', 'createdAt');
    };

    const toggleSortStatus = () => {
        const currentLocation = getLocation();
        let stat = 'asc';
        setCheckStatus(null)
        if (sortStatus == 'asc') {
            stat = 'desc'
        }
        if (currentLocation.isSection) {
            fetchSectionList(currentLocation.path, 'name', stat);
        } else {
            fetchFolderList(currentLocation.path, 'name', stat);
        }
        setSortStatus(stat);
        localStorage.setItem('sortOrder', stat)
        localStorage.setItem('sortBy', 'name');
    };

    function sortIconFormatter() {
        if (localStorage.getItem('sortBy')) {
            return <Icon name="arrow-down"></Icon>
        } else {
            if (!location.pathname.includes('home')) {
                if (checkStatus == 'asc') {
                    return <Icon name="arrow-up"></Icon>
                } else if (checkStatus == 'desc') {
                    return <Icon name="arrow-down"></Icon>
                }
            }
        }
    }




    return loader ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Spinner size="sm" />
        </div>
    ) : (
        <>
            {(selectedFiles?.length != 0) && (location.pathname == currentUrl) &&
                <div className={location.pathname == '/home' ? 'toolbar' : "toolbar main"} ref={toolbarRef} style={{ backgroundColor: theme?.skin == 'light' && '#fff' }}>

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
                        </Tooltip></div>

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
                    {selectedFiles.every(v => v.type == "form") && <div className="toolbar-icon" id='Share_Form' onClick={() => openMultiShareFormModal()}><Icon name="share"></Icon>
                        <Tooltip
                            placement="bottom"
                            isOpen={tooltipOpen[`Share_Form`] || false}
                            target={`Share_Form`}
                            toggle={() => toolTipToggle(`Share_Form`)}
                        >
                            {'Share'}
                        </Tooltip>
                    </div>}

                    {viewMeta && <div className="toolbar-icon" id='generatemetadata' onClick={() => generateMetadata(selectedFiles)}><Icon name="pie-2"></Icon>
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
                                        if (!location.pathname.includes('home')) {
                                            toggleSortStatus()
                                        }
                                    }}
                                    className="tb-head list_name_heading fw-bold fs-6 arrow-icon">Name
                                    {!sortStatus && !location.pathname.includes('home') && <Icon name="swap-v"></Icon>}
                                    {sortStatus == 'asc' && !location.pathname.includes('home') && <Icon name="arrow-up"></Icon>}
                                    {sortStatus == 'desc' && !location.pathname.includes('home') && <Icon name="arrow-down"></Icon>}
                                </div>
                            </div>
                            {(page === undefined) && <div className="nk-file-meta fw-bold fs-6">
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
                                    {!checkStatus && !location.pathname.includes('home') && (!localStorage.getItem('sortBy') ? <Icon name="arrow-down"></Icon> : <Icon name="swap-v"></Icon>)}
                                    {checkStatus == 'asc' && !location.pathname.includes('home') && <Icon name="arrow-up"></Icon>}
                                    {checkStatus == 'desc' && !location.pathname.includes('home') && <Icon name="arrow-down"></Icon>}
                                    {/* {sortIconFormatter()} */}
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
                            </div>
                        </>}
                    </div>
                </div>}
                {(fileView === 'list' || fileView === 'grid') &&
                    <>
                        {filesList?.length ? (
                            <div className="nk-files-list" ref={fileRef}>
                                {filesList.map((item) => (
                                    <File
                                        totalfiles={files}
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
                                        viewMeta={viewMeta}
                                        generateMetadata={generateMetadata}

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
                                    totalfiles={files}
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
                                    viewMeta={viewMeta}
                                    generateMetadata={generateMetadata}



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
                                    totalfiles={files}
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
                                    viewMeta={viewMeta}
                                    generateMetadata={generateMetadata}


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
                                    totalfiles={files}
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
                                    viewMeta={viewMeta}
                                    generateMetadata={generateMetadata}


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
                <Move totalfiles={files} toggle={toggleMoveModal} toggleCreate={toggleCreateModal} multiselected={moveFiles} setSelectedFiles={setSelectedFiles} />
            </Modal>
            <Modal isOpen={multiShareModal} size="md" toggle={toggleMultiShareModal}>
                <MultiShare toggle={toggleMultiShareModal} multiselected={moveFiles} sharedDocumentList={sharedDocumentList} setSelectedFiles={setSelectedFiles} />
            </Modal>
            <Modal isOpen={formShareModal} size="lg" toggle={toggleFormShareModal}>
                <ShareForm toggle={toggleFormShareModal} multishared={multiSelectedFormIds} multisharedForms={multiShareForms} setSelectedFiles={setSelectedFiles} />
            </Modal>

            <Modal isOpen={shareModal} size="lg" toggle={toggleShareModal}>
                <Share file={item} toggle={toggleShareModal} />
            </Modal>

            <Modal isOpen={singleFormShareModal} size="lg" toggle={toggleSingleShareFormModal}>
                <ShareForm file={item} toggle={toggleSingleShareFormModal} />
            </Modal>
            <Toaster />
        </>
    )
}

export default DeptDocs