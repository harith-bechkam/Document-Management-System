import React, { useEffect, useState } from "react";
import { Icon } from "../../../../components/Component";
import icons from "../components/Icons"
import { useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import * as API from '../../../../utils/API';

const CopyForms = ({ toggle, toggleCreate, copySelected, multiselected }) => {
  const location = useLocation();
  const navigationBar = useSelector(state => state.folders.navigation);
  const currentPath = useSelector(state => state.folders.currentDirectory);
  const currentSection = useSelector(state => state.folders.currentSection);
  const dispatch = useDispatch();
  const [checked, setChecked] = useState(null);
  const [tempArr, setTempArr] = useState([]);
  const [directoryPath, setDirectoryPath] = useState([]);

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

  async function copySelectedFile(bool = false) {
    if (!bool) return;

    if (multiselected && multiselected.length > 0) {
      debugger
      const copyRespo = await API.formsCopy(multiselected, checked);
      if (!copyRespo) return toast.error('error occured during copying form'.replace(/\b\w/g, char => char.toUpperCase()))
      toast.success(`Forms copied successfully`);
    } else {
      let copyRespo 
      if(copySelected.isShortcut){
        copyRespo = await API.formsCopy([], checked, [copySelected.shortcutId]);
      }else{
        copyRespo = await API.formsCopy([copySelected._id], checked, []);
      }
      if (!copyRespo) return toast.error('error occured during copying form'.replace(/\b\w/g, char => char.toUpperCase()))
      toast.success(`${copySelected.name} copied successfully`);
    }
    toggle();
  }


  return (
    <React.Fragment>
      <div className="modal-header align-center modalheader border-bottom-0">
        <h5 className="modal-title">Copy item to...</h5>
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
        <li className="" style={{paddingRight:'0.25rem'}} onClick={()=>getFirstLevel()}><Icon name="chevrons-left"></Icon></li>
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
              Create New Folder
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
                  onClick={() => copySelectedFile(true)}
                  disabled={!checked}
                  className="btn btn-primary file-dl-toast"
                >
                  Copy
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

export default CopyForms;
