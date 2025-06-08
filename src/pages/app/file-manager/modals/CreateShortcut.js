import React, { useEffect, useState } from "react";
import { Icon } from "../../../../components/Component";
import { useFileManager, useFileManagerUpdate } from "../components/Context";
import icons from "../components/Icons"
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import moment from 'moment/moment';
import { folderCopy, updateLoaderFlag, updateMoveFlag } from "../../../../redux/folderSlice";
import toast, { Toaster } from "react-hot-toast";
import * as API from '../../../../utils/API';
import Swal from "sweetalert2";

const Shortcut = ({ toggle, toggleCreate, copySelected }) => {
    const location = useLocation();
    const navigationBar = useSelector(state => state.folders.navigation);
    const currentPath = useSelector(state => state.folders.currentDirectory);
    const currentSection = useSelector(state => state.folders.currentSection);
    const dispatch = useDispatch();
    const [checked, setChecked] = useState(null);
    const [tempArr, setTempArr] = useState([]);
    const [directoryPath, setDirectoryPath] = useState([]);
    const loaderFlag = useSelector(state => state.folders.loader);

    async function getFirstLevel() {
        setDirectoryPath([])
        const folderRespo = await API.getNextFolderListMove('0', '', currentSection);
        if (!folderRespo) return toast.error('directory api error'.replace(/\b\w/g, char => char.toUpperCase()))
        setTempArr(folderRespo.data)
    }

    useEffect(() => {
        getFirstLevel();
    }, [])

    const [selected, setSelected] = useState("");

    async function findChildren(item) {
        let folderRespo;
        if (item.type == 'folder') {
            folderRespo = await API.getNextFolderListMove(`1`, item._id, null);
            setDirectoryPath(directoryPath => {
                const index = directoryPath.findIndex(val => val._id === item._id);
                if (index === -1) {
                    return [...directoryPath, item];
                } else {
                    return directoryPath.slice(0, index + 1);
                }
            });
        } else {
            setDirectoryPath(directoryPath => {
                const index = directoryPath.findIndex(val => val._id === item._id);
                if (index === -1) {
                    return [...directoryPath, item];
                } else {
                    return directoryPath.slice(0, index + 1);
                }
            });
            folderRespo = await API.getNextFolderListMove(`1`, item._id, item._id);
        }
        if (!folderRespo) return toast.error('directory api error'.replace(/\b\w/g, char => char.toUpperCase()))
        setTempArr(folderRespo.data)
    }


    async function createShortcut(bool = false) {
        if (!bool) return;

        dispatch(updateLoaderFlag({ loader: true, text: "Creating Shortcut" }));
        let shortcutRespo;
        if (copySelected.type == 'folder') {
            shortcutRespo = await API.createShortcut([], [copySelected._id], [], checked)
        } else if (copySelected.type == 'form') {
            shortcutRespo = await API.createShortcut([], [], [copySelected._id], checked)
        } else {
            shortcutRespo = await API.createShortcut([copySelected._id], [], [], checked);
        }
        if (!shortcutRespo) {
            dispatch(updateLoaderFlag({ loader: false, text: "" }));
            return toast.error('Error Occured During Creating Shortcut')
        }
        dispatch(updateLoaderFlag({ loader: false, text: "" }));
        dispatch(updateMoveFlag({}))
        toast.success(`Shortcut created for ${copySelected.name} successfully`);
        // toggle();
    }



    return (
        <React.Fragment>
            <div className={loaderFlag ? "modal-header align-center modalheader border-bottom-0 loading" : "modal-header align-center modalheader border-bottom-0"}>
                <h5 className="modal-title">Create Shortcut to...</h5>
                <a
                    href="#close"
                    onClick={(ev) => {
                        ev.preventDefault();
                        toggle();
                    }}
                    className="close"
                >
                    <Icon name="cross-sm"></Icon>
                </a>
            </div>
            <div className="modal-body pt-0 mt-n2">
                <ul className="breadcrumb breadcrumb-alt breadcrumb-xs breadcrumb-arrow mb-1 members_avatar">
                    <li className="" style={{ paddingRight: '0.25rem' }} onClick={() => getFirstLevel()}><Icon name="chevrons-left"></Icon></li>
                    {directoryPath.map((item, index) =>
                        <li key={item._id} onClick={() => findChildren(item)} className="breadcrumb-item">{item.name}</li>
                    )}
                </ul>
                <div className="nk-fmg-listing is-scrollable">
                    <div className="nk-files nk-files-view-list is-compact">
                        <div className="nk-files-list">
                            {tempArr
                                .map((item, index) => {
                                    return (
                                        <div
                                            className={`nk-file-item nk-file ${item._id === selected ? "selected" : ""}`}
                                            key={item._id}
                                            onClick={() => { setSelected(item._id) }}
                                            onDoubleClick={() => {
                                                setChecked(null);
                                                findChildren(item)
                                            }}
                                        >
                                            <div className="nk-file-info">
                                                <a className="nk-file-link" onClick={() => setChecked(item._id)}>
                                                    <div className="nk-file-title">
                                                        <div className="nk-file-icon"><div className="nk-file-icon-type">{icons[item.icon]}</div></div>
                                                        <div className="nk-file-name">
                                                            <div className="nk-file-name-text">
                                                                <span className="title destinationFinder">{item.name.split('.')[0]}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                            <div className="nk-file-actions">
                                                <a
                                                    onClick={() => {
                                                        setChecked(null);
                                                        findChildren(item)
                                                    }}
                                                    className="btn btn-sm btn-icon btn-trigger"
                                                >
                                                    <Icon name="chevron-right"></Icon>
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-footer bg-light">
                <div className="modal-footer-between">
                    <div className="g">
                        <a
                            href="link"
                            onClick={(ev) => {
                                ev.preventDefault();
                                toggle();
                                toggleCreate();
                            }}
                            className="link link-primary"
                        >
                            {/* Create New Folder */}
                        </a>
                    </div>
                    <div className="g">
                        <ul className="btn-toolbar g-3">
                            <li>
                                <a
                                    href="#file-share"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        toggle();
                                    }}
                                    className="btn btn-outline-light btn-white"
                                >
                                    Cancel
                                </a>
                            </li>
                            <li>
                                <button
                                    onClick={() => createShortcut(true)}
                                    disabled={!checked}
                                    className="btn btn-primary file-dl-toast"
                                >
                                    Create
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <Toaster />
            </div>
        </React.Fragment>
    );
};

export default Shortcut;
