import React from "react";
import { Icon } from "../../../../components/Component";
import icons from "../components/Icons";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

const Details = ({ file, toggle, toggleShare, triggerDownload }) => {
  const location = useLocation();
  const navigate = useNavigate()
  const navigationBar = useSelector(state => state.folders.navigation);
  const folders = useSelector(state => state.folders.folders)
  const currentLocation = location.pathname.split('/');

  let currentFolder = null;
  let currentFolderId1 = null;
  if (location.pathname.includes('Folder')) {
    const currentFolderId = location.pathname.split('/')[location.pathname.split('/').length - 1]
    const currentFolderobj = folders.find(elem => elem.id == currentFolderId);
    currentFolder = currentFolderobj?.name;
    currentFolderId1 = currentFolderobj?.id;
  } else {
    const currentFolderId = location.pathname.split('/')[location.pathname.split('/').length - 1]
    const currentFolderobj = navigationBar.find(elem => elem.text == currentFolderId);
    currentFolder = currentFolderobj?.text;
    currentFolderId1 = currentFolderobj?.id;
  }

  const route = [{ name: currentFolder?.split('.')[0], id: currentFolderId1 }];
  let currentFolderObj = folders.find(elem => elem.name.split('.')[0] == currentFolder?.split('.')[0]);
  while (currentFolderObj) {
    const parentName = currentFolderObj.parentName;
    if (parentName) {
      route.push({ name: parentName, id: currentFolderObj.parentId });
      currentFolderObj = folders.find(elem => elem.name.split('.')[0] === parentName.split('.')[0]);
    } else {
      currentFolderObj = null;
    }
  }
  route.reverse();
  route.push({name:file.name,id:file.id})
  return (
    <React.Fragment>
      <div className="modal-header align-center">
        <div className="nk-file-title">
          <div className="nk-file-icon"><div className="nk-file-icon-type">{icons[file.icon]}</div></div>
          <div className="nk-file-name">
            <div className="nk-file-name-text">
              <span className="title">{file.name}</span>
            </div>
            <div className="nk-file-name-sub">{file.type}</div>
          </div>
        </div>
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
      <div className="modal-body">
        <div className="nk-file-details">
          <div className="nk-file-details-row">
            <div className="nk-file-details-col">Size</div>
            <div className="nk-file-details-col">{file.size} MB</div>
          </div>
          <div className="nk-file-details-row">
            <div className="nk-file-details-col">Location</div>
            <div className="nk-file-details-col">
              <ul className="breadcrumb breadcrumb-sm breadcrumb-alt breadcrumb-arrow">
                {/* <li className="breadcrumb-item">{route[0].name}</li> */}
                {/* <li className="breadcrumb-item">{route[1]}</li> */}
                
                {route.map((item, index) => 
                <li key={index} className="breadcrumb-item">{item.name}</li>
                )}

              </ul>
            </div>
          </div>
          <div className="nk-file-details-row">
            <div className="nk-file-details-col">Owner</div>
            <div className="nk-file-details-col">{file.ownerName}</div>
          </div>
          <div className="nk-file-details-row">
            <div className="nk-file-details-col">Starred</div>
            <div className="nk-file-details-col">{file.starred ? 'Yes' : 'No'}</div>
          </div>
          <div className="nk-file-details-row">
            <div className="nk-file-details-col">Created</div>
            <div className="nk-file-details-col">{file.time}, {file.date}</div>
          </div>
        </div>
      </div>
      <div className="modal-footer modal-footer-stretch bg-light">
        <div className="modal-footer-between">
          <div className="g">
            <a href="link" onClick={(ev) => ev.preventDefault()} className="link link-primary">
              View All Activity
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
                    toggleShare();
                  }}
                  className="btn btn-outline-light btn-white"
                >
                  Share
                </a>
              </li>
              <li>
                <a
                  href="link"
                  onClick={(ev) => {
                    ev.preventDefault();
                    triggerDownload(file);
                  }}
                  className="btn btn-primary"
                >
                  Download
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Details;
