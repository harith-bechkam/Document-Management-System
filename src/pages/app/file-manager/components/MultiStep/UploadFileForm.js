import React, { useState, useEffect } from "react";
import { bytesToMegaBytes } from "../../../../../utils/Utils";
import { iconsType } from '../../components/Icons';
import { addNewFile } from "../../../../../redux/folderSlice";
import toast from "react-hot-toast";
import { Icon } from "../../../../../components/Component";
import Dropzone from "react-dropzone";
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";


const UploadFileForm = ({ files, setFiles, handleNext }) => {


    const handleDropChange = (acceptedFiles) => {
        setFiles(acceptedFiles);
    }

    const removeFromList = (name) => {
        let defaultFiles = files;
        defaultFiles = defaultFiles.filter((item) => item.name !== name);
        setFiles([...defaultFiles]);
    }

    useEffect(() => {
        const handleEnterPress = (e) => {
            if (e.key === 'Enter') {
                handleNext();
            }
        };
        document.querySelector('.metadata_form')?.addEventListener('keydown', handleEnterPress);
        return () => {
            // console.log(document.querySelector('.metadata_form'),"metadata_form")
            // document.querySelector('.metadata_form').removeEventListener('keydown', handleEnterPress);
        };
    }, []);

    return (
        <>
            <div className="nk-upload-form">
                <Dropzone onDrop={(acceptedFiles) => handleDropChange(acceptedFiles)}>
                    {({ getRootProps, getInputProps }) => (
                        <section>
                            {/* <span className="required">*</span> */}
                            <div {...getRootProps()} className="dropzone upload-zone small bg-lighter my-2 dz-clickable">
                                <input {...getInputProps()} />
                                <div className="dz-message">
                                    <span className="dz-message-text">
                                        <span>Drag and drop</span> file here or <span>browse</span>
                                    </span>
                                </div>
                            </div>
                        </section>
                    )}
                </Dropzone>
            </div>

            {files.length > 0 && (
                <div className="nk-upload-list metadata_form">
                    <h6 className="title">
                        Uploaded Files <span className="required">*</span>
                    </h6>
                    {files.map((file, index) => (
                        <div className="nk-upload-item" key={index} style={{ marginBottom: '1rem' }}>
                            <div className="nk-upload-icon">
                                {iconsType[file.type] ? iconsType[file.type] : iconsType["others"]}
                            </div>
                            <div className="nk-upload-info">
                                <div className="nk-upload-title">
                                    <span className="title">{file.name}</span>
                                </div>
                                <div className="nk-upload-size">{bytesToMegaBytes(file?.size)} MB</div>
                            </div>
                            <div className="nk-upload-action">
                                <a
                                    href="#delete"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        removeFromList(file?.name);
                                    }}
                                    className="btn btn-icon btn-trigger"
                                >
                                    <Icon name="trash"></Icon>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* <div className="nk-modal-action justify-end">
                <ul className="btn-toolbar g-4 align-center">
                    <li>
                        <a
                            href="#toggle"
                            onClick={(ev) => {
                                ev.preventDefault();
                                toggle();
                            }}
                            className="link link-primary"
                        >
                            Cancel
                        </a>
                    </li>
                    <li>
                        <Button onClick={handleNext} color="primary">
                            Next
                        </Button>
                    </li>
                </ul>
            </div> */}
        </>
    )
}

export default UploadFileForm