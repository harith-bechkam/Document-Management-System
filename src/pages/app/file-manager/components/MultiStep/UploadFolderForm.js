import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import * as API from '../../../../../utils/API';
import { useDispatch, useSelector } from "react-redux";
import { saveCurrentSection, setFiles, uploadFolder } from "../../../../../redux/folderSlice";
import { Button } from "../../../../../components/Component";
import toast from "react-hot-toast";

// let fileNames = []

const UploadFolderForm = ({ next, prev, toggle, folder, setFolder, setIsFolderUploaded }) => {

    const [fileNames, setFileNames] = useState([])
    const currentSection = useSelector(state => state.folders.currentSection);


    async function browseFolder(e) {
        e.preventDefault();
        let directoryElem = e.target.files;


        if (directoryElem.length > 0) {
            const fileArray = Array.from(directoryElem);
            const names = fileArray.map(file => file.name);
            // fileNames = names
            setFileNames(names)
            setIsFolderUploaded(names.length != 0)

            setFolder({
                data: directoryElem,
                sectionId: currentSection
            });
        }
        else {
            setFileNames([])
            setIsFolderUploaded(false)
            setFolder({
                data: [],
                sectionId: ''
            });
        }
    }




    return (
        <>
            <form>

                <div className="nk-upload-form">
                    <div className="form-group">

                        <input
                            type="file"
                            className="form-control"
                            webkitdirectory="true"
                            directory="true"
                            placeholder="Choose Folder"
                            multiple
                            onChange={browseFolder}
                        />
                    </div>
                </div>

                {fileNames.length > 0 && (
                    <div className="nk-upload-list">
                        <h6 className="title">Uploaded Items <span className="required">*</span> </h6>
                        <div className="d-flex justify-center">
                            <span>{fileNames.length} items Added </span>
                        </div>
                    </div>
                )}



                {/* <ul className="btn-toolbar g-4 align-center justify-end">
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
                            handleNext()
                        }}>
                            Create
                        </Button>
                    </li>
                </ul> */}
            </form>
        </>
    )
}

export default UploadFolderForm