import React, { useState } from "react";
import Dropzone from "react-dropzone";
import { Button } from "reactstrap";
import { Icon } from "../../../../components/Component";
import { bytesToMegaBytes } from "../../../../utils/Utils";
import * as API from '../../../../utils/API';
import { iconsType } from '../components/Icons';
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { updateLoaderFlag, updateMoveFlag } from "../../../../redux/folderSlice";

const UploadVersion = ({ toggle, fileId }) => {

  const [files, setFiles] = useState([]);
  const dispatch = useDispatch();
  const [buttonTriggered, setButtonTriggered] = useState(false);
  const handleDropChange = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const removeFromList = (name) => {
    let defaultFiles = files;
    defaultFiles = defaultFiles.filter((item) => item.name !== name);
    setFiles([...defaultFiles]);
  };

  async function versionUpload(check = false) {
    if (check && files.length > 0) {
      setButtonTriggered(true);
      const formdata = new FormData();
      formdata.append('file', files[0]);
      formdata.append('fileId', fileId)
      dispatch(updateLoaderFlag({ loader: true, text: 'Updating Version' }))
      const versionResponse = await API.changeVersion(formdata);
      if (!versionResponse.status){
        dispatch(updateLoaderFlag({ loader: false, text: '' }))
        setButtonTriggered(false);
        return toast.error(`File Revision Error - ${versionResponse?.['message']}`.replace(/\b\w/g, char => char.toUpperCase()));
      } 
      dispatch(updateLoaderFlag({ loader: false, text: '' }))
      toast.success('File revised successfully');
      setButtonTriggered(false);
      toggle();
      dispatch(updateMoveFlag({}))
    }
  }

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
      <div className="modal-body modal-body-md">
        <div className="nk-upload-form">
          <h5 className="title mb-3">Upload New Version</h5>
          <Dropzone onDrop={(acceptedFiles) => handleDropChange(acceptedFiles)} multiple={false}>
            {({ getRootProps, getInputProps }) => (
              <section>
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
        <div className="nk-upload-list">
          <h6 className="title">Uploaded File</h6>
          {files.length > 0 ? (
            files.map((file, index) => (
              <div className="nk-upload-item" key={index}>
                <div className="nk-upload-icon">
                  {iconsType[file.type] ? iconsType[file.type] : iconsType["others"]}
                </div>
                <div className="nk-upload-info">
                  <div className="nk-upload-title">
                    <span className="title">{file.name}</span>
                  </div>
                  <div className="nk-upload-size">{bytesToMegaBytes(file.size)} MB</div>
                </div>
                <div className="nk-upload-action">
                  <a
                    href="#delete"
                    onClick={(ev) => {
                      ev.preventDefault();
                      removeFromList(file.name);
                    }}
                    className="btn btn-icon btn-trigger"
                  >
                    <Icon name="trash"></Icon>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="d-flex justify-center">
              <span>No files added yet !</span>
            </div>
          )}
        </div>
        <div className="nk-modal-action justify-end">
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
              <Button disabled={buttonTriggered} color="primary" onClick={() => versionUpload(true)}>
                Update
              </Button>
            </li>
          </ul>
        </div>
      </div>
      <Toaster />
    </React.Fragment>
  );
};

export default UploadVersion;
