import React, { useState, useEffect, useRef } from "react";
import { Icon, BlockTitle } from "../../../components/Component";
import { Breadcrumb, BreadcrumbItem, Button, Card, Modal, Spinner } from 'reactstrap';
// import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Tooltip, UncontrolledDropdown } from 'reactstrap';
import Head from "../../../layout/head/Head";
import FileManagerLayout from "./components/Layout";
import * as API from '../../../utils/API';
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { Tree, SelectPicker, VStack, IconButton, Dropdown } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import FolderFillIcon from '@rsuite/icons/FolderFill';
import PageIcon from '@rsuite/icons/Page';
import { documentIcons } from "../../../utils/Utils";
import DeptDocs from "./components/DeptDocs";
import UserOwnedDocuments from "./components/UserOwnedDocumentViewer";
import MoreIcon from "@rsuite/icons/More";
import UpdateOwner from "./modals/UpdateOwnership";
import { updateLoaderFlag } from "../../../redux/folderSlice";
import { setDownloadFileAction } from "../../../redux/download/downloadAction";

const MyFolderTree = () => {
    const dispatch = useDispatch();
    // const [val, setVal] = useState(`${localStorage.getItem('userId')}_recovery`)
    // const [val, setVal] = useState(`${localStorage.getItem('userId')}_recovery`)

    // const [folderStructure, setFolderStructure] = useState([]);
    const [folderStructure, setFolderStructure] = useState([]);

    const [userList, setUserList] = useState([]);
    const [loader, setLoader] = useState(false)
    const [selectedUser, setSelectedUser] = useState(localStorage.getItem('userId'));
    const [documents, setDocuments] = useState([])
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState(null);
    const [updateOwnerModal, setUpdateOwnerModal] = useState(false);
    const [selectionType, setSelectionType] = useState('section');
    const [selectionName, setSelectionName] = useState('');
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [fileListLoader, setFileListLoader] = useState(false);
    const menuRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => { setIsOpen(!isOpen) }
    useEffect(() => {
        toast.remove();
        fetchData();
        getUsersList()
    }, [selectedUser, refreshFlag]);

    useEffect(() => {

    }, [folderStructure, selectedUser])
    const fetchData = async () => {
        await getFolderStructure();
    };

    const toggleUpdateOwnerModal = () => {
        setUpdateOwnerModal(!updateOwnerModal);
    }

    const handleRightClick = (event, nodeData) => {
        // debugger
        if (nodeData.label.split('_').includes('section')) {
            setSelectionType('section')
        } else if (nodeData.label.split('_').includes('folder')) {
            setSelectionType('folder')
        }
        console.log(selectionType)
        debugger
        event.preventDefault();
        setMenuVisible(true);
        setIsOpen(true);

        setMenuPosition({ x: event.clientX + 20, y: event.clientY - 55 });
        setSelectedNode(nodeData);
    };

    async function downloadDocuments() {
        const selectedDocs = {
            folders: [selectedNode.value],
            files: []
        };

        // dispatch(updateLoaderFlag({ loader: true, text: 'downloading' }))
        dispatch(setDownloadFileAction([{ file: selectedDocs.files, folder: selectedDocs.folders, fileName: "Zipping", extension: "", APIType: 'fileDownloadAPI', type: "bulk" }]))
        // const downloadRespo = await API.bulkDocsDownload(selectedDocs.files, selectedDocs.folders);
        // dispatch(updateLoaderFlag({ loader: false, text: '' }))
    }

    const handleMenuSelect = (eventKey) => {
        setMenuVisible(false);
        const lastUnderscoreIndex = selectedNode?.label?.lastIndexOf("_");
        const result = selectedNode?.label?.substring(0, lastUnderscoreIndex);
        const labelKey = selectedNode.label.split('_');
        setSelectionName(result);
        if (labelKey.includes('section')) {
            setSelectionType('section');
            toggleUpdateOwnerModal();
        } else if (labelKey.includes('folder')) {
            setSelectionType('folder');
            toggleUpdateOwnerModal();
        }
    };

    function setPageHeight() {
        console.log('test height');
        var heightsetterht = document.querySelector('.heightsetter').clientHeight;
        var titleheight = document.querySelector('#breadcrumb-arrow').clientHeight;
        var foldertreeheight = heightsetterht - titleheight - 40;
        document.querySelector('.folder-structure-tree').setAttribute("style", "height:" + foldertreeheight + "px");
    }

    useEffect(() => {
        setPageHeight();
        getDefaultPage();
    }, [])

    const getFolderStructure = async () => {
        setFileListLoader(true);
        let folderStructureResponse = await API.getMyFolderStructure(selectedUser);
        if (!folderStructureResponse.status) {
            setFileListLoader(false);
            return toast.error('Could Not Form Document Hierarchy');
        }
        setFolderStructure(folderStructureResponse.data)
        setFileListLoader(false);
    };

    function generateAvatarBase64(char, backgroundColor) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 24;
        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = backgroundColor;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, size / 2, size / 2);

        return canvas.toDataURL();
    }

    async function getUsersList() {
        const usersList = await API.getAllUsers();
        if (!usersList.status) {
            return toast.error('users fetch error'.replace(/\b\w/g, char => char.toUpperCase()));
        }
        const arr = [];
        for (let i = 0; i < usersList.data.length; i++) {

            arr.push({
                label: usersList.data[i].userName,
                value: usersList.data[i]._id,
                imgUrl: usersList.data[i].imgUrl ? usersList.data[i].imgUrl : generateAvatarBase64(
                    usersList.data[i].userName[0].toUpperCase(),
                    '#ccc'
                )
            })
        }
        setUserList(arr);
    }

    function returnTypeAndIcon(file) {
        if (file["name"]?.includes('.')) {
            file['type'] = 'file'
        }

        else if (file?.['type'] == 'Single Submission' || file?.['type'] == 'Multiple Submission') {

            file['responseType'] = file?.['type']
            file['type'] = 'form'
        }
        else if (file.hasOwnProperty('sectionName')) {
            file['type'] = 'section';
        }
        else if (file['type'] == 'form') {
            file['type'] = 'form';
        }
        else {
            file['type'] = 'folder'
        }

        if (file['type'] == 'folder') {
            file['icon'] = 'folder'
        }
        else if (file['type'] == 'section') {
            file['icon'] = 'folder'
        }

        else if (file['type'] == 'form') {
            file['icon'] = 'googleFORM'
        }
        else {
            let iconIdx = documentIcons.findIndex(item => item.ext == file.fileType)
            file['icon'] = iconIdx != -1 ? documentIcons[iconIdx]['icon'] : "fileDoc"
        }
    }

    async function getDefaultPage() {
        setFileListLoader(true)
        API.getAllFilesAndFoldersListByFolderId(null, 3, 'createdAt', 'desc', selectedUser).then(docResponse => {
            if (!docResponse.status) {
                setFileListLoader(false)
                return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))
            }
            for (let file of docResponse['data']) {
                returnTypeAndIcon(file)
            }
            setDocuments(docResponse['data'])
            setFileListLoader(false)
        })
    }

    async function getDocumentContents(id, type) {
        if (localStorage.getItem('role') != 'Super Admin') {
            return
        }

        if (type == 'folder') {
            setFileListLoader(true);
            API.getAllFilesAndFoldersListByFolderId(id, '', 'createdAt', 'desc', selectedUser).then(docResponse => {
                if (!docResponse.status) {                    // setLoader(false);
                    setFileListLoader(false);
                    return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))
                }
                for (let file of docResponse['data']) {
                    returnTypeAndIcon(file)
                }
                setDocuments(docResponse['data'])
                setFileListLoader(false);
            })
        } else if (type == 'recovery') {
            setFileListLoader(true);
            API.getAllFilesAndFoldersListByFolderId(null, 3, 'createdAt', 'desc', selectedUser).then(docResponse => {

                if (!docResponse.status) {
                    setFileListLoader(false);
                    return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))
                }
                for (let file of docResponse['data']) {
                    returnTypeAndIcon(file)
                }
                setDocuments(docResponse['data'])
                setFileListLoader(false);
            })
        } else if (type == 'section') {
            setFileListLoader(true);
            API.getAllFilesAndFoldersListBySectionId(id, 'createdAt', 'desc', selectedUser).then(docResponse => {
                if (!docResponse.status) {
                    setFileListLoader(false);
                    return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))
                }
                for (let file of docResponse['data']) {
                    returnTypeAndIcon(file)
                }
                setDocuments(docResponse['data'])
                setFileListLoader(false);
            })
        }

    }

    return (
        <FileManagerLayout>
            <Head title={'Folder Tree'} />
            <div style={{ padding: '1rem' }} onClick={() => setMenuVisible(false)}>
                <BlockTitle page>
                    <Breadcrumb className="breadcrumb-arrow" id={'breadcrumb-arrow'}>
                        <BreadcrumbItem>
                            <div>
                                <span className="breadcrumbforward">Folder Tree {localStorage.getItem('role') == 'Super Admin' ? 'of' : ''}</span>
                                {localStorage.getItem('role') == 'Super Admin' && <SelectPicker
                                    data={userList}
                                    style={{ width: 350, textTransform: 'none', marginLeft: '1rem' }}
                                    renderMenuItem={(label, item) => (
                                        <div>
                                            <img
                                                src={item.imgUrl}
                                                alt={label}
                                                style={{ width: 24, height: 24, marginRight: 10, borderRadius: '50%' }}
                                            />
                                            {label}
                                        </div>
                                    )}
                                    value={selectedUser}
                                    cleanable={false}
                                    onChange={(e) => { setDocuments([]); setSelectedUser(e) }}
                                    placeholder="Toggle User"
                                />}
                            </div>

                        </BreadcrumbItem>
                    </Breadcrumb>
                </BlockTitle>

                {loader ? <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Spinner size="sm" />
                </div> : <div style={{ display: 'flex', height: '67vh' }}>

                    <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}>
                        <Tree
                            className="folder-structure-tree"
                            data={folderStructure}
                            showIndentLine
                            defaultValue={`file_recovery`}
                            // defaultExpandAll={true}
                            defaultExpandItemValues={`${selectedUser}_user`}
                            renderTreeNode={node => {
                                const lastUnderscoreIndex = node?.label?.lastIndexOf("_");
                                const result = node?.label?.substring(0, lastUnderscoreIndex);
                                const labelType = node.label.split('_').pop();

                                return (
                                    <>
                                        <div onClick={() => { setSelectionName(result); getDocumentContents(node?.value, labelType) }} onContextMenu={(event) => handleRightClick(event, node)}>
                                            <span style={{ cursor: 'pointer', marginRight: '0.5rem' }} >
                                                {labelType === 'user' && <Icon name="user-alt-fill" />}
                                                {labelType === 'section' && <Icon name="folders-fill" />}
                                                {labelType == 'folder' && <Icon name="folder-fill" />}
                                                {labelType == 'recovery' && <Icon name="trash" />}
                                            </span>
                                            {result}
                                        </div>
                                    </>
                                );
                            }}

                        />
                    </div>

                    <div style={{ flex: 1, height: '100%', overflowY: 'auto' }}>
                        {localStorage.getItem('role') == 'Super Admin' &&
                            <UserOwnedDocuments
                                fileListLoader={fileListLoader}
                                files={documents}
                                fixedView={'list'}
                                selectionName={selectionName}
                            />}
                    </div>
                </div>}


                {menuVisible && (localStorage.getItem('role') == 'Super Admin') && (
                    <>
                        <div style={{
                            position: "absolute",
                            top: menuPosition.y,
                            left: menuPosition.x,
                            width: '140px',
                            zIndex: 1000,
                        }}>
                            <Button
                                title="Change Owner"
                                className="btn btn-primary"
                                activeKey=""
                                style={{
                                    width: '140px',
                                }}
                                // onSelect={handleMenuSelect}
                                onClick={handleMenuSelect}
                            >
                                Change Owner
                            </Button>
                            {selectionType != 'section' && <Button
                                title="Download"
                                className="btn btn-primary"
                                activeKey=""
                                style={{
                                    width: '140px',
                                }}
                                // onSelect={handleMenuSelect}
                                onClick={downloadDocuments}
                            >
                                Download
                            </Button>}
                        </div>
                        {/* <Dropdown
                            title="Menu"
                            activeKey=""
                            style={{
                                position: "absolute",
                                top: menuPosition.y,
                                left: menuPosition.x,
                                zIndex: 1000,
                            }}
                            onSelect={handleMenuSelect}
                        >
                            <Dropdown.Item eventKey="rename">Rename</Dropdown.Item>
                            <Dropdown.Item eventKey="delete">Delete</Dropdown.Item>
                        </Dropdown> */}

                    </>
                )}

            </div>
            <Modal isOpen={updateOwnerModal} backdrop={true} size={selectionType == 'section' ? "sm" : "md"} toggle={toggleUpdateOwnerModal}>
                <UpdateOwner
                    selectedNode={selectedNode}
                    userList={userList}
                    selectionType={selectionType}
                    selectionName={selectionName}
                    toggle={toggleUpdateOwnerModal}
                    setRefreshFlag={setRefreshFlag}
                />
            </Modal>
        </FileManagerLayout>
    );
};

export default MyFolderTree;
