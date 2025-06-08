import React, { useEffect, useState } from "react";
import { Icon } from "../../../../components/Component";
import { useFileManager, useFileManagerUpdate } from "../components/Context";
import icons from "../components/Icons"
import { SelectPicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import moment from 'moment/moment';
import toast, { Toaster } from "react-hot-toast";
import * as API from '../../../../utils/API';
import Swal from "sweetalert2";

const UpdateOwner = ({ toggle, selectedNode, selectionType, selectionName, userList, setRefreshFlag }) => {
  const location = useLocation();
  const loaderFlag = useSelector(state => state.folders.loader);
  const [selectedUser, setSelectedUser] = useState(localStorage.getItem('userId'));
  const [checked, setChecked] = useState(null);
  const [tempArr, setTempArr] = useState([]);
  const currentSection = useSelector(state => state.folders.currentSection);
  const [directoryPath, setDirectoryPath] = useState([]);
  const [selected, setSelected] = useState("");

  async function getFirstLevel() {
    setDirectoryPath([])
    const folderRespo = await API.getNextFolderListMove('0', '', currentSection, selectedUser);
    if (!folderRespo) return toast.error('directory api error'.replace(/\b\w/g, char => char.toUpperCase()))
    setTempArr(folderRespo.data)
  }

  useEffect(() => {
    getFirstLevel()
  }, [selectedUser])

  async function findChildren(item) {
    debugger;
    let folderRespo;
    if (item.type == 'folder') {
      folderRespo = await API.getNextFolderListMove(`1`, item._id, null, selectedUser);
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
      folderRespo = await API.getNextFolderListMove(`1`, item._id, item._id, selectedUser);
    }
    if (!folderRespo) return toast.error('directory api error'.replace(/\b\w/g, char => char.toUpperCase()))
    setTempArr(folderRespo.data)
  }

  async function updateOwnership() {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to change the ownership of the ${selectionType} ${selectionName}!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (selectionType == 'section') {
          const updateResponse = await API.updateSectionOwnership(selectedUser, selectedNode.value);
          if (!updateResponse.status) {
            return toast.error(`Unable to change ownership of '${selectionName}' section`)
          }
          setRefreshFlag(prev => !prev)
        }else if (selectionType == 'folder') {
          const updateResponse = await API.updateFolderOwnership(selectedNode.value, selected, selectedUser );
          if (!updateResponse.status) {
            return toast.error(`Unable to change ownership of '${selectionName}' section`)
          }
          setRefreshFlag(prev => !prev)
        }
      }
    });
    toggle()
  }

  return (
    <React.Fragment>
      <div className={loaderFlag ? "modal-header align-center modalheader border-bottom-0 loading" : "modal-header align-center modalheader border-bottom-0"}>
        <h5 className="modal-title">Update {selectionName} Ownership...</h5>
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

        <div className="nk-fmg-listing is-scrollable">
          <div className="nk-files nk-files-view-list is-compact">
            <div className="nk-files-list">
              <SelectPicker
                data={userList}
                style={{ width: 240, }}
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
                onChange={(e) => { setSelectedUser(e) }}
                placeholder="Toggle User"
              />
            </div>
          </div>
        </div>

        {selectionType == 'folder' && <>
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
                        onDoubleClick={() => { setChecked(null); findChildren(item) }}
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
                            onClick={() => { setChecked(null); findChildren(item) }}
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
        </>}
      </div>
      <div className="modal-footer bg-light">
        <div className="modal-footer-between">
          <div className="g">
            <a
              href="link"
              onClick={(ev) => {
                ev.preventDefault();
                toggle();
              }}
              className="link link-primary"
            >
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
                {selectionType=='folder'?<button
                  className="btn btn-primary file-dl-toast"
                  disabled={!checked}
                  onClick={() => updateOwnership()}
                >
                  Change
                </button>:
                <button
                  className="btn btn-primary file-dl-toast"
                  onClick={() => updateOwnership()}
                >
                  Change
                </button>}
              </li>
            </ul>
          </div>
        </div>
        <Toaster />
      </div>
    </React.Fragment>
  );
};

export default UpdateOwner;
