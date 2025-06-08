import React, { useEffect, useState } from 'react'
import classNames from 'classnames';
import { Icon } from '../../../../components/Component';
import { useFileManager, useFileManagerUpdate } from "./Context";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Tooltip, UncontrolledDropdown } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { saveCurrentSection, setDocuments, updateDocumentLoaderFlag, updateLoaderFlag, updateMoveFlag } from '../../../../redux/folderSlice';
import toast from 'react-hot-toast';
import * as API from '../../../../utils/API';
import { useLocation } from 'react-router';
import { useTheme } from '../../../../layout/provider/Theme';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';


export const options = [
  {
    id: 'Grid',
    title: 'Grid Layout (Alt+A)',
    icon: 'view-grid3-wd',
    value: 'grid'
  },
  {
    id: 'Group',
    title: 'Group Layout (Alt+S)',
    icon: 'view-group-wd',
    value: 'group'
  },
  {
    id: "List",
    title: 'List Layout (Alt+D)',
    icon: 'view-row-wd',
    value: 'list'
  },
]

const ViewFilter = ({ listOpt }) => {

  const { fileManager } = useFileManager();
  const { fileManagerUpdate } = useFileManagerUpdate();
  const dispatch = useDispatch();
  const location = useLocation();
  const theme = useTheme()

  const [isOpen, setIsOpen] = useState(false);
  const [checkStatus, setCheckStatus] = useState(localStorage.getItem('sortOrder') || 'asc');
  const [sortcheckStatus, setSortCheckStatus] = useState(localStorage.getItem('sortBy') || 'createdAt');

  const [tooltipOpen, setTooltipOpen] = useState({});

  const trash = useSelector(state => state.folders.trashRepo);


  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    // Clean up the event listener when the component is unmounted
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [])


  const handleKeyPress = (event) => {
    if (event.altKey) {
      // If Alt+V is pressed, check for L, M, or R
      const switchToView = {
        'a': 'grid',   // First view
        's': 'group',  // Second view
        'd': 'list'    // Third view
      };

      if (switchToView[event.key]) {

        const selectedView = switchToView[event.key];
        localStorage.setItem('fileView', selectedView);
        fileManagerUpdate.filesView(selectedView);
      }
    }
  }

  const toggle = () => { setIsOpen(!isOpen) }
  const toolTipToggle = (id) => {
    setTooltipOpen((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };


  const fetchSectionList = async (sectionId, order, by) => {
    dispatch(updateDocumentLoaderFlag({}))
    let listResponse = await API.getAllFilesAndFoldersListBySectionId(sectionId, order, by)
    let { status } = listResponse
    if (!status){
      dispatch(updateDocumentLoaderFlag({}))
      return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))
    }

    dispatch(setDocuments({
      files: listResponse['data'],
      location: ''
    }))
    dispatch(updateDocumentLoaderFlag({}))
  }

  const fetchFolderList = async (folderId, order, by) => {
    dispatch(updateDocumentLoaderFlag({}))
    let listResponse = await API.getAllFilesAndFoldersListByFolderId(folderId, '', order, by)
    let { status } = listResponse
    if (!status) {
      dispatch(updateDocumentLoaderFlag({}))
      return toast.error(`Some Error Occured! Refresh and Try Again`.replace(/\b\w/g, char => char.toUpperCase()))
    }

    dispatch(setDocuments({
      files: listResponse['data'],
      location: ''
    }))
    dispatch(saveCurrentSection(listResponse['sectionId']))
    dispatch(updateDocumentLoaderFlag({}))
  }

  const fetchSharedFolderList = async (folderId, order, by) => {
    dispatch(updateDocumentLoaderFlag({}))
    let listResponse = await API.getAllFilesAndFoldersListByFolderId(folderId, '', order, by)
    let { status } = listResponse
    if (!status) {
      dispatch(updateDocumentLoaderFlag({}))
      return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))
    }

    dispatch(setDocuments({
      files: listResponse['data'],
      location: 'shared'
    }))
    dispatch(saveCurrentSection(listResponse['sectionId']))
    dispatch(updateDocumentLoaderFlag({}))
  }


  function getLocation() {
    let result = {
      path: '',
      isSection: false,
      isFolder: false,
      isShared: false,
      isSharedFolder: false,
      isStarred: false
    }
    const pathname = location.pathname
    const sectionRegex = /^\/section\/([a-fA-F0-9]{24})$/;
    const folderRegex = /^\/folder\/([a-fA-F0-9]{24})$/;
    const shareRegex = /^\/share\/([a-fA-F0-9]{24})$/;

    const sectionMatched = sectionRegex.exec(pathname)
    const folderMatched = folderRegex.exec(pathname);
    const shareMatched = shareRegex.exec(pathname);

    if (sectionMatched) {
      result.path = sectionMatched[1];
      result.isSection = true
    }
    if (folderMatched) {
      result.path = folderMatched[1];
      result.isFolder = true
    }

    //SHARED
    if (pathname.includes('/shared')) {
      result.isShared = true;
    }
    if (shareMatched) {
      result.path = shareMatched[1];
      result.isSharedFolder = true
    }

    //STARRED
    if (pathname.includes('/starred')) {
      result.isStarred = true;
    }


    return result;
  }

  const toggleCheckStatus = async () => {
    const newStatus = checkStatus == 'asc' ? 'desc' : 'asc'
    localStorage.setItem('sortOrder', newStatus)

    await fetchData(sortcheckStatus, newStatus)

    setCheckStatus(newStatus)
  };

  const toggleSortStatus = async () => {
    const newSortStatus = sortcheckStatus === 'name' ? 'createdAt' : 'name';
    localStorage.setItem('sortBy', newSortStatus);

    await fetchData(newSortStatus, checkStatus)

    setSortCheckStatus(newSortStatus)

  };


  const fetchData = async (sortBy, order) => {
    const currentLocation = getLocation()

    if (currentLocation.isSection) {
      fetchSectionList(currentLocation?.path, sortBy, order)
    }

    else if (currentLocation.isFolder) {
      fetchFolderList(currentLocation?.path, sortBy, order)
    }

    else if (currentLocation.isShared) {
      try {
        const sharedRespo = await API.getSharedDocuments(sortBy, order)
        const { status } = sharedRespo

        if (!status) {
          toast.error(sharedRespo.message.replace(/\b\w/g, char => char.toUpperCase()))
        } else {
          dispatch(setDocuments({
            files: sharedRespo.data,
            location: 'shared',
          }))
        }
      } catch (err) {
        toast.error("Error Fetching Shared Documents".replace(/\b\w/g, char => char.toUpperCase()))
      }
    }
    else if (currentLocation.isSharedFolder) {
      fetchSharedFolderList(currentLocation?.path, sortBy, order)
    }
    else if (currentLocation.isStarred) {
      try {
        let starredListResponse = await API.getStarredList(1, sortBy, order)

        let { status } = starredListResponse
        if (!status) return toast.error(`Some Error Occured! Refresh and Try Again`.replace(/\b\w/g, char => char.toUpperCase()))

        // dispatch(setFiles({
        //   files:starredListResponse['data'],
        //   location:'starred'
        // }))
        dispatch(setDocuments({
          files: starredListResponse['data'],
          location: 'starred'
        }))
      }
      catch (err) {
        toast.error("Error Fetching Starred Documents")
      }
    }
  }

  const mainClass = classNames({
    [`nk-block-tools g-3`]: !listOpt,
    [`link-list-opt no-bdr`]: listOpt,
  });
  const linkClass = classNames({
    [`nk-switch-icon`]: !listOpt
  });


  async function clearTrash() {
    Swal.fire({
      title: "Are you sure you want to delete?",
      text: "This will Permenantly delete the Trash. Please confirm.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async respo => {
      if (respo.isConfirmed) {
        dispatch(updateLoaderFlag({ loader: true, text: "Deleting" }));
        const clearRespo = await API.EmptyTrash();
        if (!clearRespo.status) {
          dispatch(updateLoaderFlag({ loader: false, text: "" }));
          return toast.error('error in emptying recycle bin'.replace(/\b\w/g, char => char.toUpperCase()));
        }
        dispatch(updateLoaderFlag({ loader: false, text: "" }));
        toast.success('Trash emptied successfully');
        dispatch(updateMoveFlag({}));
      }
    })
  }

  async function restoreTrash() {
    const restoreDocs = {
      files: [],
      folders: [],
      forms: [],
      sections: [],
    }
    trash.forEach(elem => {
      if (elem.type == 'folder') {
        restoreDocs.folders.push(elem._id)
      } else if (elem.type == 'file') {
        restoreDocs.files.push(elem._id)
      } else if (elem.type == 'form') {
        restoreDocs.forms.push(elem._id)
      } else if (elem.type == 'section') {
        restoreDocs.sections.push(elem._id)
      }
    })
    const restoreRespo = await API.restoreDocuments(restoreDocs.files, restoreDocs.folders, restoreDocs.forms, restoreDocs.sections);
    if (!restoreRespo.status) toast.error(`Error in Restoring Documents`);
    toast.success(`Documents restored successfully`);
    dispatch(updateMoveFlag({}))
  }

  return (
    <ul className={`${mainClass}`}>

      {!location.pathname.includes('home') && !location.pathname.includes('recovery') &&
        <Dropdown  isOpen={isOpen} toggle={toggle}>

          <UncontrolledDropdown>
            <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon ">
              <Button className='btn btn-light' style={{ padding: ".7rem" }}>
                <span className='d-flex justify-content-center align-item-center'>
                  <Icon name={'sort-line'}></Icon>
                  Sort
                  <Icon name={'arrow-long-down'}></Icon>
                </span>
              </Button>
            </DropdownToggle>
            <DropdownMenu end>
              <ul className="link-check">
                <li>
                  <span>Sort By</span>
                </li>
                <li className={sortcheckStatus === 'createdAt' ? "active" : ""}>
                  <DropdownItem
                    tag="a"
                    href="#dropdownitem"
                    onClick={(ev) => {
                      ev.preventDefault();
                      toggleSortStatus();
                    }}
                  >
                    Created At
                  </DropdownItem>
                </li>
                <li className={sortcheckStatus === 'name' ? "active" : ""}>
                  <DropdownItem
                    tag="a"
                    href="#dropdownitem"
                    onClick={(ev) => {
                      ev.preventDefault();
                      toggleSortStatus();
                    }}
                  >
                    Name
                  </DropdownItem>
                </li>
              </ul>
              <ul className="link-check">
                <li>
                  <span>Order</span>
                </li>
                <li className={checkStatus === 'asc' ? "active" : ""}>
                  <DropdownItem
                    tag="a"
                    href="#dropdownitem"
                    onClick={(ev) => {
                      ev.preventDefault();
                      toggleCheckStatus();
                    }}
                  >
                  Ascending 
                  </DropdownItem>
                </li>
                <li className={checkStatus === 'desc' ? "active" : ""}>
                  <DropdownItem
                    tag="a"
                    href="#dropdownitem"
                    onClick={(ev) => {
                      ev.preventDefault();
                      toggleCheckStatus();
                    }}
                  >
                    Descending
                  </DropdownItem>
                </li>
              </ul>
            </DropdownMenu>
          </UncontrolledDropdown>

        </Dropdown>
      }
      {location.pathname.includes('recovery') &&
        <>
          {
            trash.length > 0 &&
            <div>
              <Button className='btn btn-light' style={{ padding: ".7rem" }} onClick={() => clearTrash()}>
                <Icon name="trash-fill" />
                <span>Empty Trash</span>
              </Button>
              &emsp;
              <Button className='btn btn-light' style={{ padding: ".7rem" }} onClick={() => restoreTrash()}>
                <Icon name="undo" />
                <span>Restore All</span>
              </Button>
            </div>
          }
        </>
      }


      {/* {options.map((item) => (
        <li className='doc-view-type'  key={item.value}>
          <a href="#link" onClick={(ev) => {
            ev.preventDefault();
            localStorage.setItem('fileView', item.value)
            fileManagerUpdate.filesView(item.value);
          }} className={`${linkClass} ${fileManager.filesView == item.value ? 'active' : ''}`}>
            <Icon title={item.title} name={item.icon}></Icon>
            {listOpt && <span>{item.title}</span>}
          </a>
        </li>
      ))} */}

      <div className="view-toggle" style={{ border: theme?.skin == "light" && "1px solid #ccc" }}>
        {options.map((item) => {
          const tooltipId = 'Tooltip-' + item?.id.replace(/\s+/g, '-');
          return (
            <div
              id={tooltipId}
              className={`doc-view-option ${fileManager.filesView === item.value ? 'active' : ''}`}
              key={item.value}
              onClick={() => {
                localStorage.setItem('fileView', item.value);
                fileManagerUpdate.filesView(item.value);
              }}
            >
              <Icon name={item.icon} />
              <Tooltip
                placement="bottom"
                isOpen={tooltipOpen[tooltipId] || false}
                target={tooltipId}
                toggle={() => toolTipToggle(tooltipId)}
              >
                {item.title}
              </Tooltip>
            </div>
          );
        })}
      </div>
    </ul>
  )
}


export default ViewFilter