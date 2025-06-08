import React, { useState, useEffect, useRef } from "react";
import { Icon } from "../../../../components/Component";
import { Button } from "reactstrap";
import { useDispatch } from "react-redux";
import { renameFolder, updateMoveFlag } from "../../../../redux/folderSlice";
import toast, { Toaster } from "react-hot-toast";
import * as API from '../../../../utils/API';

const RenameFolder = ({ toggle, folderId, folderName, type, shortcut, document }) => {
    const dispatch = useDispatch();

    const [rename, setRename] = useState("");
    const [extension, setExtension] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (type == 'file') {
            const dotIndex = folderName.lastIndexOf(".");
            if (dotIndex > -1 && dotIndex !== 0) {
                setRename(folderName.slice(0, dotIndex));
                setExtension(folderName.slice(dotIndex));
            }
        } else {
            setRename(folderName);
        }
        // const dotIndex = folderName.lastIndexOf(".");
        // if (dotIndex > -1 && dotIndex !== 0) {
        //     setRename(folderName.slice(0, dotIndex));
        //     setExtension(folderName.slice(dotIndex));
        // } else {
        //     setRename(folderName);
        // }
    }, [folderName]);

    useEffect(() => {
        inputRef.current.focus();
    }, [])

    const handleCancel = (e) => {
        e.preventDefault();
        toggle();
    };

    const renameFolder = async (check = false) => {
        const newName = rename + extension;
        let moveRespo;
        if (check) {
            if (shortcut) {
                const shortcutId = document.shortcutId
                if (type == 'file') {
                    moveRespo = await API.renameShortcut(shortcutId, newName);
                } else {
                    if (type == 'form') {
                        moveRespo = await API.renameShortcut(shortcutId, newName);
                    } else {
                        moveRespo = await API.renameShortcut(shortcutId, newName);
                    }
                }
            } else {
                if (type == 'file') {
                    moveRespo = await API.rename(folderId, newName, true);
                } else {
                    if (type == 'form') {
                        moveRespo = await API.renameForm(folderId, newName);
                    } else {
                        moveRespo = await API.rename(folderId, newName, false);
                    }
                }
            }

            if (!moveRespo) return toast.error('error occured during renaming'.replace(/\b\w/g, char => char.toUpperCase()))
            dispatch(updateMoveFlag({}))
            toast.success(`${type.replace(/\b\w/g, char => char.toUpperCase())} renamed successfully`)
            // toast.success(`${folderName} renamed successfully to ${newName}!`.replace(/\b\w/g, char => char.toUpperCase()));
        }
        toggle();
    };

    return (
        <React.Fragment>
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
            <div className="renamedocument modal-body modal-body-md">
                <div className="nk-upload-form mb-0">
                    <h5 className="title mb-3">Rename {folderName.split('.')[0]}</h5>
                    <form>
                        <div className="form-group">
                            <label className="form-label">New Name</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={rename}
                                    onChange={(e) => setRename(e.target.value)}
                                    ref={inputRef}
                                />
                                {extension && (
                                    <div className="input-group-append">
                                        <span className="input-group-text">{extension}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <ul className="btn-toolbar g-4 align-center justify-end">
                            <li>
                                <a
                                    href="#"
                                    onClick={handleCancel}
                                    className="link link-primary"
                                >
                                    Cancel
                                </a>
                            </li>
                            <li>
                                <Button color="primary" type="submit" onClick={(ev) => {
                                    ev.preventDefault();
                                    renameFolder(true);
                                }}>
                                    Submit
                                </Button>
                            </li>
                        </ul>
                    </form>
                </div>
            </div>
            <Toaster />
        </React.Fragment>
    );
};

export default RenameFolder;
