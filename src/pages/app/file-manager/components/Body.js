import React, { useState, useLayoutEffect, useCallback, useEffect, useRef } from 'react'

import ViewFilter, { options as viewOptions } from './ViewFilter';
import Files from './Files';
import { useNavigate, useParams } from "react-router";

import UploadFile from "../modals/UploadFile";
import CreateFolder from "../modals/CreateFolder";
import CreateForm from "../modals/CreateForm";

import PropTypes from 'prop-types';

import { useFileManager, useFileManagerUpdate } from "./Context";

import { BlockTitle, BlockBetween, BlockHead, BlockHeadContent, Icon } from "../../../../components/Component";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, Modal, Card, Dropdown, Button, Spinner } from "reactstrap";
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router';
import { pullSection, updateAsideFlag, updateLoaderFlag, updateMoveFlag } from '../../../../redux/folderSlice';
import toast from "react-hot-toast";
import UploadFolder from '../modals/UploadFolder';
import * as API from '../../../../utils/API';
import { defaultMetaData } from '../../../../utils/helper'
import RenameSection from '../modals/RenameSection';

import Swal from "sweetalert2";
import axios from 'axios';
import UploadItem from '../modals/UploadItem';
import { setUploadFile } from '../../../../redux/upload/uploadSlice';
import UploadProgress from '../modals/UploadProgress';

import { setUploadFileAction } from '../../../../redux/upload/uploadAction';
import CreateFolderInShared from '../modals/CreateFolderInShared';
import { useTheme } from '../../../../layout/provider/Theme';

import ContextMenu from './ContextMenu/contextMenu';
import useCustomContextMenu from './ContextMenu/useCustomContextMenu';
import RenameFolder from '../modals/RenameFolder';
import WorkspaceFill from '../modals/WorkspaceFill';
import JoyrideComp from '../modals/Joyride';

const FilesBody = ({ searchBar, searchBarActions = true, title, viewFilter, recoveryFilter, infiniteScroll = false, ...props }) => {

    const { fileManager } = useFileManager();
    const { fileManagerUpdate } = useFileManagerUpdate();

    const dispatch = useDispatch();
    const location = useLocation();
    const params = useParams();
    const theme = useTheme()
    const store = useSelector(state => state.folders)

    const [createModal, setCreateModal] = useState(false);
    const [createFolderInSharedModal, setCreateFolderInSharedModal] = useState(false);
    const [createFormModal, setCreateFormModal] = useState(false);

    const [uploadModal, setUploadModal] = useState(false);
    const [folderUploadModal, setFolderUploadModal] = useState(false);

    const [renameSectionModal, setRenameSectionModal] = useState(false);
    const [renameSelectedSection, setRenameSelectedSection] = useState('');
    const [deleteLoader, setDeleteLoader] = useState(false);
    const [ownerView, setOwnerView] = useState(false);
    const [editAccess, setEditAccess] = useState(false);

    const [search, setSearch] = useState(false);


    const currentSection = useSelector(state => state.folders.currentSection);
    const accessedDrive = useSelector(state => state.folders.accessedDrive);


    const [currentSectionDetails, setCurrentSectionDetails] = useState([]);

    //uploadFileState
    const [files, setFiles] = useState([])
    const [metadataMode, setMetadataMode] = useState("skip")

    //DefaultMetaFields
    const [docNum, setDocNum] = useState('')
    const [notes, setNotes] = useState('')
    const [docTypeData, setDocTypeData] = useState([])
    const [keywordsData, setKeywordsData] = useState([])
    const [docTypeOptionsData, setDocTypeOptionsData] = useState([])
    const [keywordOptionsData, setKeywordOptionsData] = useState([])
    const [secdocTypeData, setSecDocTypeData] = useState([])
    const [secdocTypeOptionsData, setsecDocTypeOptionsData] = useState([])


    //customMetaFields
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [customMetaDataOptions, setCustomMetaDataOptions] = useState([])
    const [selectedMetaDataOptions, setSelectedMetaDataOptions] = useState([])
    const [customMetaData, setCustomMetaData] = useState({})

    const [customMetaModal, setCustomMetaModal] = useState(false)

    //workspacefill
    const [workspaceFillModal, setWorkspaceFillModal] = useState(false);

    const navigate = useNavigate()
    const { isVisible, position, menuItem, showContextMenu, setIsVisible, menuRef, menuOp } = useCustomContextMenu()



    const toggleRenameSection = () => {
        setRenameSectionModal(!renameSectionModal);
    }

    const toggleSearch = () => {
        setSearch(!search)
    }


    const toggleCreateModal = async () => {
        setCreateModal(!createModal)
    }

    const toggleCreateFolderInShareModal = async () => {
        setCreateFolderInSharedModal(!createFolderInSharedModal)
    }

    const toggleCreateFormModal = async () => {
        setCreateFormModal(!createFormModal)
    }

    const toggleUploadModal = () => {
        setUploadModal(!uploadModal)
    }
    const toggleFolderUploadModal = () => {
        setFolderUploadModal(!folderUploadModal)
    }

    const toggleWorkspaceFillModal = async () => {
        setWorkspaceFillModal(!workspaceFillModal)
    }

    useLayoutEffect(() => {
        fileManagerUpdate.search('')

    }, [])

    useEffect(() => {
        sectionData();

    }, [])


    useEffect(() => {
        checkDocCreateAccess()
        isWorkspaceReady();

        const handleStorageChange = () => {
            isWorkspaceReady();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };

    }, [location.pathname])

    async function checkDocCreateAccess() {
        setEditAccess(false);
        if (location.pathname.includes('share') ||
            location.pathname.includes('folder') ||
            location.pathname.includes('section')) {
            //sectionId
            let folderResponse;
            if (location.pathname.includes('section')) {
                if (typeof params.sectionId != "undefined") {
                    folderResponse = await API.getDetails(params.sectionId);
                    setEditAccess(true);
                    setOwnerView(true);
                }
            } else if (location.pathname.includes('folder')) {
                folderResponse = await API.getDetails(params.id);
                setEditAccess(true);
                setOwnerView(true);
            } else if (location.pathname.includes('share')) {
                // console.log(editAccess)
                // debugger
                if (params.id) {
                    folderResponse = await API.getDetails(params.id);
                    const directory = folderResponse?.data?.data
                    const userId = localStorage.getItem('userId');
                    const memberTeamsResponse = await API.getAllGroupsContainingUser();
                    const memberTeams = memberTeamsResponse.data;

                    let editDirectoryAccess = false;
                    let viewAccess = false;
                    if (directory?.sharedWith?.users.some(val => val.user == userId)) {
                        const shareStatus = directory?.sharedWith.users.find(val => val.user == userId);
                        if (shareStatus.access == 'edit') {
                            editDirectoryAccess = true;
                        } else if (shareStatus.access == 'view') {
                            viewAccess = true;
                        }
                    } else {
                        const userGroups = memberTeams;
                        const sharedUserGroups = directory?.sharedWith?.userGroups || [];
                        const isGroupShared = sharedUserGroups.some(group =>
                            userGroups.some(userGroup =>
                                userGroup._id?.toString() == group.group?.toString()
                            )
                        );
                        if (isGroupShared) {
                            const groupAccess = sharedUserGroups.find(group =>
                                userGroups.some(userGroup =>
                                    userGroup._id?.toString() == group?.group?.toString()
                                )
                            )?.access;
                            if (groupAccess === 'edit') {
                                editDirectoryAccess = true;
                            } else if (groupAccess === 'view') {
                                viewAccess = true;
                            }
                        }
                    }
                    if (editDirectoryAccess) {
                        // debugger
                        setEditAccess(true)
                    }
                }
            }
        }
        if (location.pathname.includes('setUpWorkflow')) {
            setEditAccess(false);
        }
    }

    const [renameFolderModal, setRenameFolderModal] = useState(false);
    const [folderId, setFolderId] = useState('');
    const [folderName, setFolderName] = useState('');

    const toggleRenameModal = () => {
        setRenameFolderModal(!renameFolderModal);
    };



    const isWorkspaceReady = async () => {
        try {

            let appFeatures = localStorage.getItem("appFeatures") ? JSON.parse(localStorage.getItem("appFeatures")) : {}

            if (appFeatures.hasOwnProperty('ismarketDetailsCompleted')) {
                setWorkspaceFillModal(appFeatures?.ismarketDetailsCompleted == false ? true : false)
            }
            else {
                setWorkspaceFillModal(false)
            }

        }
        catch (err) {
            console.error(err, "Workspace Filling Error")
            toast.error('Error in Workspace Marketing Detail')
        }
    }

    async function sectionData() {
        if (location.pathname.includes('section')) {

            if (typeof params.sectionId != 'undefined') {
                let sectionResponse = await API.getSection(params.sectionId)
                let { status } = sectionResponse
                if (!status) return toast.error(`${sectionResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
                setCurrentSectionDetails(sectionResponse.data)
            }

        }
    }

    // const searchResult = [...store?.fileRepo?.filter(item => item?.name?.toLowerCase().includes(fileManager?.search?.toLowerCase()))]


    async function deleteSection(sectionId) {
        dispatch(updateLoaderFlag({ loader: true, text: "Deleting Section" }));
        const checkRespo = await API.checkSectionChildren(sectionId);
        // debugger
        dispatch(updateLoaderFlag({ loader: false, text: "" }));
        // if (!checkRespo.status) return toast.error('error in getting data');
        // if (checkRespo.data.length > 0){ 
        //     return toast(`This section contains documents, delete them to continue`, { icon: '⚠️' })
        // }
        if (!checkRespo.status) return toast.error('Error in Getting Data');
        // if (checkRespo.data.length > 0) return toast(`This section contains documents, delete them to continue`, { icon: '⚠️' })

        if (location.pathname.includes('section')) {
            Swal.fire({
                title: "Are you sure you want to delete this section?",
                text: "This action cannot be undone",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Delete Section!",
            }).then(async respo => {
                if (respo.isConfirmed) {
                    dispatch(updateLoaderFlag({ loader: true, text: "Deleting Section" }));
                    const deleteRespo = await API.sectionDelete(sectionId);
                    if (!deleteRespo.status) toast.error(`Error in Deleting Section`);
                    dispatch(updateLoaderFlag({ loader: false, text: "" }));
                    dispatch(updateAsideFlag({}));
                    dispatch(pullSection({ id: sectionId }));
                    navigate('/recovery')
                    toast.success(`${deleteRespo['message']}`)
                }
            })
        } else {
            Swal.fire({
                title: `Are you sure you want to delete this folder?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
            }).then(async respo => {
                if (respo.isConfirmed) {
                    const path = location.pathname;
                    const folderId = path.split('/').pop();
                    dispatch(updateLoaderFlag({ loader: true, text: 'Deleting' }))
                    let deleteRespo = await API.multiDeleteDocument([], [folderId], []);
                    if (!deleteRespo.status) {
                        dispatch(updateLoaderFlag({ loader: false, text: '' }))
                        return toast.error(`Error Occured While Deleting Folder`);
                    }
                    dispatch(updateLoaderFlag({ loader: false, text: '' }))
                    toast.success(`Deleted successfully`);
                    navigate('/recovery')
                }
            })
        }
    }




    /*--------------------UploadFiles--------------------------- */
    const handleSelectedValue = (event) => {
        setMetadataMode(event.target.value)
    }

    const askUploadReviewOption = async () => {
        const result = await Swal.fire({
            title: 'Upload Document',
            text: 'Do you want to upload the document with review enabled?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'With Review',
            cancelButtonText: 'Without Review',
            reverseButtons: true,
            allowOutsideClick: true,
        })

        if (result?.isConfirmed) {
            return true
        }
        else if (result.dismiss == Swal.DismissReason.cancel) {
            return false
        }
        else {
            return null
        }
    }

    let handleSubmit = async () => {

        if (!location) return;

        const pathname = location.pathname
        const sectionRegex = /^\/section\/([a-fA-F0-9]{24})$/;
        const folderRegex = /^\/folder\/([a-fA-F0-9]{24})$/;

        const sectionMatched = sectionRegex.exec(pathname)
        const folderMatched = folderRegex.exec(pathname)

        let docTypeDataValue = docTypeData?.map(item => item?.value);
        let secondaryDocTypeDataValue = secdocTypeData?.map(item => item?.value);
        let keywordsDataValue = keywordsData?.map(item => item?.value);


        let sectionId = sectionMatched ? sectionMatched[1] : currentSection
        let folderId = folderMatched ? folderMatched[1] : null

        let defaultMetaData = (!docNum && !notes && docTypeDataValue.length == 0 && secondaryDocTypeDataValue.length == 0 && keywordsDataValue.length == 0) ? null : { docNum, notes, docTypeDataValue, secondaryDocTypeDataValue, keywordsDataValue }
        let custmetafield = Object.keys(customMetaData)?.length == 0 ? null : customMetaData

        if (location.pathname.includes('share')) {
            folderId = params.id;
            const folderDetails = await API.getDetails(folderId);
            sectionId = folderDetails.data?.data?.sectionId;
        }

        let fileData = []
        let metaOperation = false

        if (metadataMode == 'auto') {
            metaOperation = await askUploadReviewOption()

            if (metaOperation === null) {
                return;
            }
        }

        for (var val of files) {
            fileData.push({
                sectionId, folderId, defaultMetaData, custmetafield, metadataMode, metaOperation,
                file: val,
                APIType: 'fileUploadAPI'
            })
        }


        dispatch(setUploadFileAction(fileData))
        toggleUploadModal()
        setFiles([])

        if (location.pathname.includes('share')) {
            dispatch(updateMoveFlag({}));
        }
    }
    /*----------------------------------------------------------- */


    function createFolderAccess() {
        {
            const userId = localStorage.getItem('userId');
            const isCreator = accessedDrive.createdBy === userId;
            let createAccess = false;
            if (accessedDrive?.sharedWith?.users) {
                const loggedInUserObj = accessedDrive.sharedWith.users.find(val => val.user == userId);
                // console.log('test', loggedInUserObj);
                if (loggedInUserObj && loggedInUserObj.access == 'edit') {
                    createAccess = true
                }
            }

            if (isCreator) {
                return (
                    <DropdownToggle
                        tag="a"

                        href="#toggle"
                        onClick={(ev) => {
                            ev.preventDefault()
                        }}
                        className="btn btn-light"
                        style={{ textDecoration: 'none' }}
                    >
                        <Icon name="plus"></Icon> <span>Create</span>
                    </DropdownToggle>
                );
            }
            else if (createAccess) {
                return (
                    <DropdownToggle
                        tag="a"

                        href="#toggle"
                        onClick={(ev) => {
                            ev.preventDefault()
                        }}
                        className="btn btn-light"
                        style={{ textDecoration: 'none' }}
                    >
                        <Icon name="plus"></Icon> <span>Create</span>
                    </DropdownToggle>
                );
            }
            else {
                return (
                    <DropdownToggle
                        onClick={(ev) => {
                            ev.preventDefault()
                        }}
                        className="btn btn-primary"
                        disabled={true}
                        style={{ textDecoration: 'none', backgroundColor: 'white', borderColor: 'white' }}
                    >
                    </DropdownToggle>
                );
            }
        }
    }

    function uploadDocumentAccess() {
        const userId = localStorage.getItem('userId');
        const isCreator = accessedDrive.createdBy === userId;
        let createAccess = false;
        if (accessedDrive?.sharedWith?.users) {
            const loggedInUserObj = accessedDrive.sharedWith.users.find(val => val.user == userId);
            // console.log('test', loggedInUserObj);
            if (loggedInUserObj && loggedInUserObj.access == 'edit') {
                createAccess = true
            }
        }

        if (isCreator) {
            return (
                <DropdownToggle
                    tag="a"

                    href="#toggle"
                    onClick={(ev) => {
                        ev.preventDefault()
                    }}
                    className="btn btn-primary"
                    style={{ textDecoration: 'none' }}
                >
                    <Icon name="upload-cloud"></Icon> <span>Upload</span>
                </DropdownToggle>
            );
        }
        else if (createAccess) {
            return (
                <DropdownToggle
                    tag="a"

                    href="#toggle"
                    onClick={(ev) => {
                        ev.preventDefault()
                    }}
                    className="btn btn-primary"
                    style={{ textDecoration: 'none' }}
                >
                    <Icon name="upload-cloud"></Icon> <span>Upload</span>
                </DropdownToggle>
            );
        } else {
            return (
                <DropdownToggle
                    onClick={(ev) => {
                        ev.preventDefault()
                    }}
                    className="btn btn-primary"
                    disabled={true}
                    style={{ textDecoration: 'none', backgroundColor: 'white', borderColor: 'white' }}
                >
                </DropdownToggle>
            );
        }
    }

    const setUpWorkflow = async () => {
        if (typeof currentSection == 'undefined') return;

        //check if this section has worklow or not
        let isWorkflowPresent = false

        let sectionResponse = await API.getSection(currentSection)
        let { status } = sectionResponse
        if (!status) return toast.error(`${sectionResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

        let sectionData = sectionResponse['data']
        // dispatch(saveWorkflowCurrClickedItem(sectionData))

        sectionData['workflow'] ? isWorkflowPresent = true : isWorkflowPresent = false

        if (!isWorkflowPresent) {
            navigate(`/workflow/setUpWorkflow/section/${sectionData['_id']}/create`)
        }
        else {
            // navigate(`/workflow/setUpWorkflow/section/${sectionData['_id']}/edit/${sectionData['workflow']?.['workflowId']}`)
            navigate(`/workflow/setUpWorkflow/section/${sectionData['_id']}/edit`)

        }
    }

    async function renameBlock() {
        if (location.pathname.includes('section')) {
            setRenameSelectedSection(currentSection)
            toggleRenameSection();
        } else {
            const path = location.pathname;
            const folderId = path.split('/').pop();
            setFolderId(folderId);
            const folderRespo = await API.getDetails(folderId);
            // if(!folderRespo.status){

            // }
            setFolderName(folderRespo.data?.data?.name);
            toggleRenameModal()
        }
    }

    const setUpFolderWorkflow = async (item) => {

        //before his parent & ancestor parent check himself
        if (item['workflow'] != null) {
            // navigate(`/workflow/setUpWorkflow/${item['type']}/${item['_id']}/edit/${item['workflow']?.['workflowId']}`)
            navigate(`/workflow/setUpWorkflow/${item['type']}/${item['_id']}/edit`)
            return
        }

        navigate(`/workflow/setUpWorkflow/${item['type']}/${item['_id']}/create`)
    }

    async function inheritWorkflow() {
        if (location.pathname.includes('section')) {
            setUpWorkflow()
        } else {
            const path = location.pathname;
            const folderId = path.split('/').pop();
            setFolderId(folderId);
            const folderRespo = await API.getDetails(folderId);
            if (folderRespo?.data?.data) {
                let folder = folderRespo?.data?.data;
                folder['type'] = 'folder'
                setUpFolderWorkflow(folder)
            }
        }
    }

    return (
        <>

            {editAccess && <div className='nk-fmg-body-head d-none d-lg-flex justify-content-end draw-searchborder'>
                <div className="nk-fmg-actions">
                    <ul className="nk-block-tools g-3">

                        {/* + New */}
                        <li>
                            <UncontrolledDropdown>
                                <DropdownToggle
                                    tag="a"

                                    href="#toggle"
                                    onClick={(ev) => {
                                        ev.preventDefault()
                                    }}
                                    className="btn btn-light"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <Icon name="plus"></Icon> <span>New</span>
                                </DropdownToggle>
                                <DropdownMenu end>
                                    <ul className="link-list-opt no-bdr">
                                        <li>
                                            <DropdownItem
                                                tag="a"
                                                href="#upload"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    if (location.pathname.includes('share')) {
                                                        toggleCreateFolderInShareModal();
                                                    } else {
                                                        toggleCreateModal();
                                                    }
                                                }}
                                            >
                                                <Icon name="folder-plus"></Icon>
                                                <span>Create Folder</span>
                                            </DropdownItem>
                                        </li>
                                        <li>
                                            <DropdownItem
                                                tag="a"
                                                href="#upload"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    toggleCreateFormModal();
                                                }}
                                            >
                                                <Icon name="file-plus"></Icon>
                                                <span>Create Form</span>
                                            </DropdownItem>
                                        </li>

                                        <li className="divider"></li>

                                        <li>
                                            <DropdownItem
                                                tag="a"
                                                href="#upload"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    toggleUploadModal();
                                                }}
                                            >
                                                <Icon name="upload-cloud"></Icon>
                                                <span>Upload File</span>
                                            </DropdownItem>
                                        </li>
                                        <li>
                                            <DropdownItem
                                                tag="a"
                                                href="#upload"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    toggleFolderUploadModal();
                                                }}
                                            >
                                                <Icon name="folders-fill"></Icon>
                                                <span>Upload Folder</span>
                                            </DropdownItem>
                                        </li>

                                    </ul>
                                </DropdownMenu>

                            </UncontrolledDropdown>
                        </li>


                        {/* Thrre Dots */}
                        {ownerView && <li>
                            <UncontrolledDropdown>
                                <DropdownToggle
                                    tag="em"

                                    href="#toggle"
                                    onClick={(ev) => {
                                        ev.preventDefault()
                                    }}
                                    className="btn btn-light moreicon"
                                    style={{ textDecoration: 'none', "paddingLeft": '0px', "paddingRight": '0px' }}
                                >
                                    <Icon name="more-v"></Icon> <span></span>
                                </DropdownToggle>
                                <DropdownMenu end>
                                    <ul className="link-list-opt no-bdr">

                                        {localStorage.getItem('role') == "Super Admin" &&
                                            <li>
                                                <DropdownItem
                                                    tag="a"
                                                    href="#workflow"
                                                    onClick={(ev) => {
                                                        ev.preventDefault();
                                                        // setUpWorkflow()
                                                        inheritWorkflow()
                                                    }}
                                                >
                                                    <Icon name="git" />
                                                    <span>Inherit Workflow</span>
                                                </DropdownItem>
                                            </li>
                                        }
                                        <li>
                                            <DropdownItem
                                                tag="a"
                                                href="#upload"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    renameBlock()
                                                }}
                                            >
                                                <Icon name="pen"></Icon>
                                                <span>Rename</span>
                                            </DropdownItem>
                                        </li>
                                        <li>
                                            <DropdownItem
                                                tag="a"
                                                href="#upload"
                                                onClick={(ev) => {
                                                    ev.preventDefault();
                                                    deleteSection(currentSection);
                                                    setDeleteLoader(x => !x);
                                                }}
                                            >
                                                <Icon name="trash"></Icon>
                                                <span>Delete</span>
                                            </DropdownItem>
                                        </li>

                                    </ul>
                                </DropdownMenu>

                            </UncontrolledDropdown>
                        </li>}

                    </ul>
                </div>
            </div>}

            {/* CONTENTS */}
            {!location.pathname.includes('search') ?
                <div className="nk-fmg-body-content"
                    onContextMenu={(event) => {
                        if (location.pathname.includes('folder') || location.pathname.includes('section') || editAccess) {
                            event.stopPropagation()
                            event.preventDefault()
                            showContextMenu(event, null, 'globalMenu')
                        }
                    }}
                >
                    <BlockHead size="sm">
                        <BlockBetween className="position-relative" isDetailsPage={location.pathname.includes('details') ? true : false} >

                            <BlockHeadContent> {(title) && title}  </BlockHeadContent>
                            <BlockHeadContent>
                                <ul className="nk-block-tools g-1">

                                    {/* mobile View - search Icon */}
                                    {/* <li className="d-lg-none">
                                        <a
                                            href="#folder"
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                                toggleSearch();
                                            }}
                                            className="btn btn-trigger btn-icon search-toggle toggle-search"
                                        >
                                            <Icon name="search"></Icon>
                                        </a>
                                    </li> */}

                                    {/* mobile View - Filter Icon */}
                                    {(viewFilter) && <li className="d-lg-none">
                                        <UncontrolledDropdown>
                                            <DropdownToggle
                                                tag="a"
                                                href="#toggle"
                                                onClick={(ev) => ev.preventDefault()}
                                                className="btn btn-trigger btn-icon"
                                            >
                                                <Icon name={viewOptions.filter((item) => item.value === fileManager.filesView)[0].icon}></Icon>
                                            </DropdownToggle>
                                            <DropdownMenu end>
                                                <ViewFilter listOpt />
                                            </DropdownMenu>
                                        </UncontrolledDropdown>
                                    </li>}

                                    {/* {recoveryFilter && <li className="d-lg-none">
                                        <a
                                            href="#folder"
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                                fileManagerUpdate.recoveryFilter();
                                            }}
                                            className="btn btn-trigger btn-icon toggle-expand"
                                        >
                                            <Icon name="opt"></Icon>
                                        </a>
                                    </li>} */}


                                    {!location.pathname.includes('home') && !location.pathname.includes('starred') && !location.pathname.includes('shared') &&

                                        // plus
                                        <li className="d-lg-none">
                                            <UncontrolledDropdown>
                                                <DropdownToggle
                                                    tag="a"
                                                    href="#toggle"
                                                    onClick={(ev) => ev.preventDefault()}
                                                    className="btn btn-trigger btn-icon"
                                                >
                                                    <Icon name="plus"></Icon>
                                                </DropdownToggle>
                                                <DropdownMenu end>
                                                    <ul className="link-list-opt no-bdr">
                                                        <li>
                                                            <DropdownItem
                                                                tag="a"
                                                                href="#upload"
                                                                onClick={(ev) => {
                                                                    ev.preventDefault();
                                                                    toggleUploadModal();
                                                                }}
                                                            >
                                                                <Icon name="upload-cloud"></Icon>
                                                                <span>Upload File</span>
                                                            </DropdownItem>
                                                        </li>
                                                        <li>
                                                            <DropdownItem
                                                                tag="a"
                                                                href="#upload"
                                                                onClick={(ev) => {
                                                                    ev.preventDefault();
                                                                    if (location.pathname.includes('share')) {
                                                                        toggleCreateFolderInShareModal()
                                                                    } else {
                                                                        toggleCreateModal();
                                                                    }
                                                                }}
                                                            >
                                                                <Icon name="folder-plus"></Icon>
                                                                <span>Create Folder</span>
                                                            </DropdownItem>
                                                        </li>
                                                        <li>
                                                            <DropdownItem
                                                                tag="a"
                                                                href="#upload"
                                                                onClick={(ev) => {
                                                                    ev.preventDefault();
                                                                    toggleCreateFormModal();
                                                                }}
                                                            >
                                                                <Icon name="file-plus"></Icon>
                                                                <span>Create Form</span>
                                                            </DropdownItem>
                                                        </li>
                                                        <li>
                                                            <DropdownItem
                                                                tag="a"
                                                                href="#upload"
                                                                onClick={(ev) => {
                                                                    ev.preventDefault();
                                                                    toggleFolderUploadModal();
                                                                }}
                                                            >
                                                                <Icon name="folders-fill"></Icon>
                                                                <span>Upload Folder</span>
                                                            </DropdownItem>
                                                        </li>
                                                    </ul>
                                                </DropdownMenu>
                                            </UncontrolledDropdown>
                                        </li>}

                                    {/* mobile sidebar icon*/}
                                    <li className="d-lg-none me-n1">
                                        <a
                                            href="#folder"
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                                fileManagerUpdate.asideVisibility();
                                            }}
                                            className="btn btn-trigger btn-icon toggle"
                                        >
                                            <Icon name="menu-alt-r"></Icon>
                                        </a>
                                    </li>
                                </ul>
                            </BlockHeadContent>

                            {(viewFilter) && <BlockHeadContent className="d-none d-lg-block"><ViewFilter /></BlockHeadContent>}
                            {recoveryFilter && <BlockHeadContent className="d-none d-lg-flex d-xl-none">
                                <a
                                    href="#folder"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        fileManagerUpdate.recoveryFilter();
                                    }}
                                    className="btn btn-trigger btn-icon toggle-expand"
                                >
                                    <Icon name="opt"></Icon>
                                </a>
                            </BlockHeadContent>}
                        </BlockBetween>
                    </BlockHead>
                    {props.children}
                    <UploadProgress />
                    <JoyrideComp />
                    {/* <DownloadProgress /> */}
                </div>
                :
                // don't know where it coming so commented
                <>
                    {/* <BlockHead size="sm">
                        <BlockBetween className="position-relative" isDetailsPage={location.pathname.includes('details') ? true : false}>

                            <BlockHeadContent> {(title) && title}  </BlockHeadContent>
                            <BlockHeadContent>
                                <ul className="nk-block-tools g-1">
                                    <li className="d-lg-none">
                                        <a
                                            href="#folder"
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                                toggleSearch();
                                            }}
                                            className="btn btn-trigger btn-icon search-toggle toggle-search"
                                        >
                                          <Icon name="search"></Icon> 
                                        </a>
                                    </li>

                                    {(viewFilter) && <li className="d-lg-none"> 
                                        <UncontrolledDropdown>
                                            <DropdownToggle
                                                tag="a"
                                                href="#toggle"
                                                onClick={(ev) => ev.preventDefault()}
                                                className="btn btn-trigger btn-icon"
                                            >
                                                <Icon name={viewOptions.filter((item) => item.value === fileManager.filesView)[0].icon}></Icon>
                                            </DropdownToggle>
                                            <DropdownMenu end>
                                                <ViewFilter listOpt />
                                            </DropdownMenu>
                                        </UncontrolledDropdown>
                                    </li>}

                                    {recoveryFilter && <li className="d-lg-none">
                                        <a
                                            href="#folder"
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                                fileManagerUpdate.recoveryFilter();
                                            }}
                                            className="btn btn-trigger btn-icon toggle-expand"
                                        >
                                            <Icon name="opt"></Icon>
                                        </a>
                                    </li>}

                                    {!location.pathname.includes('home') && !location.pathname.includes('starred') && !location.pathname.includes('shared') &&
                                        <li className="d-lg-none">
                                            <UncontrolledDropdown>
                                                <DropdownToggle
                                                    tag="a"
                                                    href="#toggle"
                                                    onClick={(ev) => ev.preventDefault()}
                                                    className="btn btn-trigger btn-icon"
                                                >
                                                    <Icon name="plus"></Icon>
                                                </DropdownToggle>
                                                <DropdownMenu end>
                                                    <ul className="link-list-opt no-bdr">
                                                        <li>
                                                            <DropdownItem
                                                                tag="a"
                                                                href="#upload"
                                                                onClick={(ev) => {
                                                                    ev.preventDefault();
                                                                    toggleUploadModal();
                                                                }}
                                                            >
                                                                <Icon name="upload-cloud"></Icon>
                                                                <span>Upload File</span>
                                                            </DropdownItem>
                                                        </li>
                                                        <li>
                                                            <DropdownItem
                                                                tag="a"
                                                                href="#upload"
                                                                onClick={(ev) => {
                                                                    ev.preventDefault();
                                                                    if (location.pathname.includes('share')) {
                                                                        toggleCreateFolderInShareModal()
                                                                    } else {
                                                                        toggleCreateModal();
                                                                    }
                                                                }}
                                                            >
                                                                <Icon name="folder-plus"></Icon>
                                                                <span>Create Folder</span>
                                                            </DropdownItem>
                                                        </li>
                                                        <li>
                                                            <DropdownItem
                                                                tag="a"
                                                                href="#upload"
                                                                onClick={(ev) => {
                                                                    ev.preventDefault();
                                                                    toggleCreateFormModal();
                                                                }}
                                                            >
                                                                <Icon name="file-plus"></Icon>
                                                                <span>Create Form</span>
                                                            </DropdownItem>
                                                        </li>
                                                        <li>
                                                            <DropdownItem
                                                                tag="a"
                                                                href="#upload"
                                                                onClick={(ev) => {
                                                                    ev.preventDefault();
                                                                    toggleFolderUploadModal();
                                                                }}
                                                            >
                                                                <Icon name="folders-fill"></Icon>
                                                                <span>Upload Folder</span>
                                                            </DropdownItem>
                                                        </li>
                                                    </ul>
                                                </DropdownMenu>
                                            </UncontrolledDropdown>
                                        </li>}

                                    <li className="d-lg-none me-n1">
                                        <a
                                            href="#folder"
                                            onClick={(ev) => {
                                                ev.preventDefault();
                                                fileManagerUpdate.asideVisibility();
                                            }}
                                            className="btn btn-trigger btn-icon toggle"
                                        >
                                            <Icon name="menu-alt-r"></Icon>
                                        </a>
                                    </li>
                                </ul>
                            </BlockHeadContent>

                            {(viewFilter) && <BlockHeadContent className="d-none d-lg-block"><ViewFilter /></BlockHeadContent>} 
                            {recoveryFilter && <BlockHeadContent className="d-none d-lg-flex d-xl-none">
                                <a
                                    href="#folder"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        fileManagerUpdate.recoveryFilter();
                                    }}
                                    className="btn btn-trigger btn-icon toggle-expand"
                                >
                                    <Icon name="opt"></Icon>
                                </a>
                            </BlockHeadContent>}
                        </BlockBetween>
                    </BlockHead>
                    {props.children}
                    <UploadProgress /> */}
                </>
            }

            <Modal isOpen={workspaceFillModal} size="lg" toggle={toggleWorkspaceFillModal}>
                <WorkspaceFill toggle={toggleWorkspaceFillModal} />
            </Modal>


            {/* createFolderModal */}
            <Modal isOpen={createModal} size="lg" toggle={toggleCreateModal} className="upload">
                <CreateFolder toggle={toggleCreateModal} />
            </Modal>

            <Modal isOpen={createFolderInSharedModal} size="lg" toggle={toggleCreateFolderInShareModal} className="upload">
                <CreateFolderInShared toggle={toggleCreateFolderInShareModal} metadataMode={metadataMode} setMetadataMode={setMetadataMode} handleSelectedValue={handleSelectedValue} />
            </Modal>

            {/* createFormModal */}
            <Modal isOpen={createFormModal} size="lg" toggle={toggleCreateFormModal} className="upload">
                <CreateForm toggle={toggleCreateFormModal} />
            </Modal>

            {/* uploadFileModal */}
            <Modal isOpen={uploadModal} size="lg" toggle={toggleUploadModal} className="upload">
                <UploadFile setCustomMetaModal={setCustomMetaModal} customMetaModal={customMetaModal} setCustomMetaData={setCustomMetaData} customMetaData={customMetaData} setSelectedMetaDataOptions={setSelectedMetaDataOptions} selectedMetaDataOptions={selectedMetaDataOptions} setCustomMetaDataOptions={setCustomMetaDataOptions} customMetaDataOptions={customMetaDataOptions} setDropdownOpen={setDropdownOpen} dropdownOpen={dropdownOpen} setKeywordOptionsData={setKeywordOptionsData} keywordOptionsData={keywordOptionsData} setDocTypeOptionsData={setDocTypeOptionsData} docTypeOptionsData={docTypeOptionsData} setKeywordsData={setKeywordsData} keywordsData={keywordsData} setDocTypeData={setDocTypeData} docTypeData={docTypeData} secdocTypeOptionsData={secdocTypeOptionsData} setsecDocTypeOptionsData={setsecDocTypeOptionsData} secdocTypeData={secdocTypeData} setSecDocTypeData={setSecDocTypeData} setNotes={setNotes} notes={notes} docNum={docNum} setDocNum={setDocNum} toggle={toggleUploadModal} files={files} setFiles={setFiles} handleSubmit={handleSubmit} metadataMode={metadataMode} setMetadataMode={setMetadataMode} handleSelectedValue={handleSelectedValue} />
            </Modal>

            {/* uploadFolderModal */}
            <Modal isOpen={folderUploadModal} size="lg" toggle={toggleFolderUploadModal} className="upload">
                <UploadFolder toggle={toggleFolderUploadModal} />
            </Modal>



            {/* rename modal */}
            <Modal isOpen={renameSectionModal} size="md" toggle={toggleRenameSection}>
                <RenameSection toggle={toggleRenameSection} section={renameSelectedSection} />
            </Modal>

            <Modal isOpen={renameFolderModal} backdrop={true} size="md" toggle={toggleRenameModal}>
                <RenameFolder toggle={toggleRenameModal} folderId={folderId} folderName={folderName} type={'folder'} />
            </Modal>


            {isVisible ? (
                <ContextMenu
                    isVisible={isVisible}
                    setIsVisible={setIsVisible}
                    position={position}
                    menuItem={menuItem}
                    menuRef={menuRef}
                    menuOp={menuOp}


                    toggleCreateFolderInShareModal={() => toggleCreateFolderInShareModal()}
                    toggleCreateModal={() => toggleCreateModal()}
                    toggleFolderUploadModal={() => toggleFolderUploadModal()}
                    toggleUploadModal={() => toggleUploadModal()}
                    toggleCreateFormModal={() => toggleCreateFormModal()}

                />
            ) : <></>}

            {store.downloadLoader && <div>Downloading...</div>}
        </>
    )
}

FilesBody.propTypes = {
    searchBar: PropTypes.bool,
    title: PropTypes.string,
    viewFilter: PropTypes.bool,
    recoveryFilter: PropTypes.bool,
    infiniteScroll: PropTypes.bool,
    children: PropTypes.node
};

export default FilesBody