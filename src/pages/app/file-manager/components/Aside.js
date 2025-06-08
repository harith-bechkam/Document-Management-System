import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SimpleBar from "simplebar-react";
import { Icon } from "../../../../components/Component";
import { Button, DropdownItem, DropdownMenu, DropdownToggle, Modal, UncontrolledDropdown } from "reactstrap";
import { useFileManager, useFileManagerUpdate } from "./Context";
import CreateDepartment from "../modals/CreateDepartment";
import { createSection, pullSection, resetNavigation, saveCurrentSection, updateAsideFlag, updateCurrentLocation, updateLoaderFlag, updateNavigation, updateSharedAccessed } from "../../../../redux/folderSlice";
import { useDispatch, useSelector } from "react-redux";
import * as API from '../../../../utils/API';
import toast, { Toaster } from "react-hot-toast";
import useCustomContextMenu from "./ContextMenu/useCustomContextMenu";
import ContextMenu from "./ContextMenu/contextMenu";
import RenameSection from "../modals/RenameSection";
import Swal from "sweetalert2";
import { findLogoName } from "../../../../utils/Utils";
import { LinkList, LinkItem } from "../../../../components/links/Links";
import { replace } from "lodash";


const FileManagerAside = ({ ...props }) => {
  const { fileManager } = useFileManager();
  const { fileManagerUpdate } = useFileManagerUpdate();
  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen(!open);
  };
  const location = useLocation();
  const dispatch = useDispatch();

  let data = useSelector(state => state.folders);

  const [activeNav, setActiveNav] = useState(null);
  const [dynamicMenus, setDynamicMenus] = useState([]);
  const [folderModal, setFolderModal] = useState(false);
  const [folder, setFolder] = useState({
    folderName: "",
    folderType: ""
  });
  const asideWrap = useRef(null);
  const navigate = useNavigate()
  const [View, setView] = useState('workflow');
  const [infoFlag, setInfoFlag] = useState(null);

  const [directoryPathSection, setDirectoryPathSection] = useState({})
  const currentSection = useSelector(state => state.folders.currentSection)

  const Privilege = JSON?.parse(localStorage.getItem('privileges'));

  const userStorage = useSelector(state => state.folders.userStorage)
  const navigationBar = useSelector(state => state.folders.navigation);

  const dropdownRef = useRef(null);

  const [rsuiteState, setRsuiteState] = useState(false);
  const { isVisible, position, menuItem, showContextMenu, setIsVisible, menuRef, menuOp } = useCustomContextMenu()

  //rename
  const [renameSectionModal, setRenameSectionModal] = useState(false);
  const [renameSelectedSection, setRenameSelectedSection] = useState('');

  //delete
  const [deleteLoader, setDeleteLoader] = useState(false);


  useEffect(() => {

    if (!location) return;
    intialCall()

  }, [location, navigationBar])


  useEffect(() => {
    if (asideWrap.current || dynamicMenus || data) fileManagerUpdate.contentHeight(asideWrap.current.clientHeight + 10);
  }, [asideWrap.current, dynamicMenus, data]);

  const switchWorkspace = async (workspaceinfo) => {
    debugger
    let response = workspaceinfo.userinfo;
    localStorage.setItem("accessToken", response?.authToken);
    localStorage.setItem("privileges", JSON.stringify(response?.privileges));
    localStorage.setItem("userId", response?.userId);
    localStorage.setItem("userName", response?.userName);
    localStorage.setItem("email", response?.email);
    localStorage.setItem("role", response?.role?.role);
    localStorage.setItem("timeZone", response?.timeZone);
    localStorage.setItem("user", JSON.stringify(response?.user));
    localStorage.setItem("userImg", JSON.stringify(response?.user?.imgUrl));
    localStorage.setItem("workspace_id", workspaceinfo._id.toString());

    if (workspaceinfo._id == localStorage.getItem("workspace_id")) {

      const planDetails = workspaceinfo?.planDetails
      var aisummary = false
      if (planDetails?.isActivePlan) {
        aisummary = planDetails?.grantedFeatures?.hasOwnProperty('AISummary') && planDetails?.grantedFeatures?.AISummary == "yes"
      }

      let appFeatures = { aisummary }
      if (workspaceinfo.owner == workspaceinfo.userinfo.userId && workspaceinfo.owner == localStorage.getItem('userId')) {
        appFeatures['ismarketDetailsCompleted'] = workspaceinfo.ismarketDetailsCompleted
      }
      localStorage.setItem("appFeatures", JSON.stringify(appFeatures))
    }

    window.dispatchEvent(new Event('storage')); // Notify components of change
    window.location.href = `/#/${workspaceinfo._id.toString()}/home`;
    window.location.reload();
  }

  const intialCall = async () => {
    const path = location.pathname

    const sectionRegex = /^\/section\/([a-fA-F0-9]{24})$/;
    const folderRegex = /^\/folder\/([a-fA-F0-9]{24})$/;
    const sharedRegex = /^\/shared(?:\/.*)?$/;
    const starredRegex = /^\/starred(?:\/.*)?$/;
    const recoveryRegex = /^\/recovery(?:\/.*)?$/;
    const homeRegex = /^\/home(?:\/.*)?$/;
    const foldreetreeRegex = /^\/foldertree(?:\/.*)?$/;

    const sectionMatched = path.match(sectionRegex)
    const folderMatched = path.match(folderRegex)
    const sharedMatched = path.match(sharedRegex)
    const starredMatched = path.match(starredRegex)
    const recoveryMatched = path.match(recoveryRegex)
    const homeMatched = path.match(homeRegex)
    const foldertreeMatched = path.match(foldreetreeRegex)


    if (sectionMatched) {
      dispatch(saveCurrentSection(sectionMatched ? sectionMatched[1] : ''))
      dispatch(updateNavigation({ id: sectionMatched[1] }))
      return;
    }
    else if (homeMatched) {
      dispatch(updateNavigation({ id: 0 }))
    }
    
    else if (sharedMatched) {
      dispatch(updateNavigation({ id: 2 }))
    }
    
    else if (starredMatched) {
      dispatch(updateNavigation({ id: 1 }))
    }
    
    else if (recoveryMatched) {
      dispatch(updateNavigation({ id: 3 }))
    }
    else if (foldertreeMatched) {
      dispatch(updateNavigation({ id: 4 }))
    }
    else {
      dispatch(updateNavigation({ id: -1 }))
    }

    // else if (
    //   (homeMatched && updateNavigationBar('/home')) ||
    //   (sharedMatched && updateNavigationBar('/shared')) ||
    //   (starredMatched && updateNavigationBar('/starred')) ||
    //   (recoveryMatched && updateNavigationBar('/recovery'))
    // ) {
    //   return;
    // }
    // else{
    //   console.log("comes")
    //   dispatch(updateNavigation({ id: null }))
    //   return;
    // }

    // if (folderMatched) {
    //   dispatch(updateNavigation({ id: folderMatched[1] }))
    //   return;
    // }


  }

  const updateNavigationBar = (link) => {
    var selectedNavigation = navigationBar.find(item => item['link'] == link)
    dispatch(saveCurrentSection(''))
    dispatch(updateNavigation({ id: selectedNavigation['id'] }))
  }

  async function getPath(pathId) {
    let pathRespo = await API.getDirectoryPath(pathId);
    if (!pathRespo.status) return toast.error(`Path Could not be Found! Refresh and Try Again`);
    setDirectoryPathSection(pathRespo.data[0]._id);
  }

  const addMenu = async () => {
    dispatch(updateLoaderFlag({ loader: true, text: 'Creating section' }))
    let sectionResponse = await API.createSection(folder.folderName)
    let { status, message } = sectionResponse

    if (status) dispatch(createSection({ name: folder.folderName, id: sectionResponse['data']['_id'] }))
    else {
      dispatch(updateLoaderFlag({ loader: false, text: '' }))
      toast.error(`${sectionResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
    }

    setFolder({
      folderName: "",
      folderType: ""
    })
    dispatch(updateLoaderFlag({ loader: false, text: '' }))
  }

  const toggleFolderModal = (check = false) => {
    setFolderModal(!folderModal);
    // if (folder.folderName !== '' && check) {
    //   addMenu();
    // }
  }

  function highlight(item) {
    if (item.selected) {
      return 'active';
    }
    return '';
  }

  //RIGHT CLICK OPERATIONS
  const toggleRenameSection = () => {
    setRenameSectionModal(!renameSectionModal);
  }

  async function deleteSection(sectionId) {
    dispatch(updateLoaderFlag({ loader: true, text: "Deleting Section" }));
    const checkRespo = await API.checkSectionChildren(sectionId);
    debugger
    dispatch(updateLoaderFlag({ loader: false, text: "" }));
    // if (!checkRespo.status) return toast.error('error in getting data');
    // if (checkRespo.data.length > 0){ 
    //     return toast(`This section contains documents, delete them to continue`, { icon: '⚠️' })
    // }
    if (!checkRespo.status) return toast.error('Error in Getting Data');
    // if (checkRespo.data.length > 0) return toast(`This section contains documents, delete them to continue`, { icon: '⚠️' })

    Swal.fire({
      title: "Are you sure you want to delete this section?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete Section!",
    }).then(async respo => {
      if (respo.isConfirmed) {
        dispatch(updateLoaderFlag({ loader: true, text: "Deleting Section" }));
        const deleteRespo = await API.sectionDelete(sectionId);
        if (!deleteRespo.status) toast.error(`Error in Deleting Section`);
        dispatch(updateLoaderFlag({ loader: false, text: "" }));
        dispatch(updateAsideFlag({}));
        dispatch(pullSection({ id: sectionId }));
        navigate('/recovery')
        toast.success(`${deleteRespo['message']}`)
      }
    })
  }


  return (
    <React.Fragment>
      <SimpleBar className={`nk-fmg-aside toggle-screen-lg ${fileManager.asideVisibility ? "content-active" : ""}`}>
        {

          data?.myworkspace?.length > 1 || data?.myworkspace?.filter(item => item?.owner == localStorage.getItem("userId"))?.length > 0 ?
            <>
              <div class="nk-fmg-switch">
                <UncontrolledDropdown>

                  <DropdownToggle tag="a" className="dropdown-toggle dropdown-indicator-unfold">
                    <div className="user-card sm">
                      <>
                        {
                          data?.myworkspace?.map(item => (
                            <>
                              {
                                localStorage.getItem("workspace_id") == item._id.toString() ?
                                  <><div className="user-avatar"> <span>{findLogoName(item.name)}</span></div><div className="user-info"><span className="lead-text">{item.name}</span></div></>
                                  : <></>
                              }
                            </>
                          ))
                        }
                      </>
                    </div>
                  </DropdownToggle>
                  <DropdownMenu start className="dropdown-menu-lg dropdown-menu-s1 workspacenav">
                    <div className="dropdown-inner user-card-wrap bg-lighter d-none d-md-block">
                      <>
                        {
                          data.myworkspace.map(item => (
                            <>
                              {localStorage.getItem("workspace_id") == item._id.toString() ?
                                <div className="user-card sm">
                                  <div className="user-avatar">
                                    {<span>{findLogoName(item.name)}</span>}
                                  </div>

                                  <div className="user-info">
                                    <span className="lead-text">{item.name}</span>
                                    <span className="sub-text">{`Free Trail ${item.members} ${(item.members > 1) ? 'members' : 'member'}`}</span>
                                  </div>
                                </div> : <></>
                              }
                            </>
                          ))
                        }
                      </>
                    </div>
                    {
                      data.myworkspace.map(item => (
                        <>
                          {
                            localStorage.getItem("userId") == item.owner ?
                              <>
                                <div className="dropdown-inner">
                                  <LinkList>
                                    <LinkItem
                                      link="/workspace-setting"
                                      icon="setting-alt"
                                      onClick={toggle}
                                    >Settings
                                    </LinkItem>
                                  </LinkList>
                                </div>
                              </> :
                              <></>
                          }
                        </>
                      ))
                    }
                    {
                      data.myworkspace.length > 1 ?
                        <>
                          <div className="dropdown-inner">
                            <div class="lead-text pt-2">Swith Workspaces</div>
                            <LinkList>
                              {
                                data.myworkspace.map(item => (
                                  <>
                                    {localStorage.getItem("workspace_id") != item._id.toString() ?
                                      <LinkItem
                                        link="#"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          toggle();
                                          switchWorkspace(item);
                                        }}
                                      >{item.name}
                                      </LinkItem> : <></>
                                    }
                                  </>
                                ))
                              }
                            </LinkList>
                          </div>
                        </> :
                        <></>
                    }

                  </DropdownMenu>

                </UncontrolledDropdown>
              </div>
            </> :
            <></>
        }
        <div className="nk-fmg-aside-wrap">
          <div ref={asideWrap}>
            <SimpleBar className="nk-fmg-aside-top">

              <ul className="nk-fmg-menu">
                {data.navigation.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <li
                      onClick={(ev) => {
                        ev.preventDefault();
                        dispatch(updateCurrentLocation({
                          drive: item
                        }))
                        fileManagerUpdate.asideHide();
                        if (item.type == 'section') {
                          dispatch(updateSharedAccessed({ access: 'section' }))
                        }
                        dispatch(resetNavigation());
                        dispatch(updateNavigation({ id: item.id }))
                      }}
                      onMouseEnter={() => setInfoFlag(item.id)} onMouseLeave={() => setInfoFlag(null)}
                      // className={`${window.location.pathname === `${process.env.PUBLIC_URL}${item.link}` ? "active" : ""}`}
                      className={highlight(item)}

                    >
                      <Link className="nk-fmg-menu-item" to={`${item.link}`} style={{ textDecoration: 'none' }}>
                        <Icon name={item.icon}></Icon>
                        <span className="nk-fmg-menu-text">{item.text}</span>
                      </Link>
                    </li>
                    {item.text === "Home" &&
                      (dynamicMenus.length > 5 ?
                        (
                          <SimpleBar style={{ maxHeight: "200px" }}>
                            {dynamicMenus.map((item) => (
                              <li
                                key={item.id}
                                onClick={(ev) => {
                                  ev.preventDefault();
                                  fileManagerUpdate.asideHide();
                                }}
                                className={`${window.location.pathname === `${process.env.PUBLIC_URL}${item.link}` ? "active" : ""
                                  }`}
                              >
                                <Link className="nk-fmg-menu-item" to={`${process.env.PUBLIC_URL}${item.link}`}>
                                  <Icon name={item.icon}></Icon>
                                  <span className="nk-fmg-menu-text">{item.text}</span>
                                </Link>
                              </li>
                            ))}
                          </SimpleBar>
                        ) :
                        (
                          dynamicMenus.map((item) => (
                            <li
                              key={item.id}
                              onClick={(ev) => {
                                ev.preventDefault();
                                fileManagerUpdate.asideHide();
                              }}
                              className={`${window.location.pathname === `${process.env.PUBLIC_URL}${item.link}` ? "active" : ""
                                }`}
                            >
                              <Link className="nk-fmg-menu-item" to={`${process.env.PUBLIC_URL}${item.link}`}>
                                <Icon name={item.icon}></Icon>
                                <span className="nk-fmg-menu-text">{item.text}</span>
                              </Link>
                            </li>
                          ))))}
                  </React.Fragment>
                ))}

                {Privilege?.section?.addSection &&
                  <li className="nk-fmg-menu-item px-0"
                    onContextMenu={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      showContextMenu(event, null, 'sectionMenu')
                    }}
                  >
                    <Button color="primary" onClick={toggleFolderModal} className="m-0 px-1 w-100">
                      <Icon className={`plusicon`} name="plus"></Icon> <span>Add Section</span>
                    </Button>
                  </li>
                }
                <li>
                  <div className="nk-fmg-aside-bottom">

                    <div className="nk-fmg-status px-1 py-3">
                      <h6 className="nk-fmg-status-title">
                        <Icon name="hard-drive"></Icon>
                        <span>My Storage</span>
                      </h6>
                      <div className="progress progress-md bg-light">
                        <div
                          className="progress-bar"
                          style={{ width: `${userStorage?.['storage']?.['percentageUsed']}` }}
                        ></div>
                      </div>
                      <div className="nk-fmg-status-info">
                        {userStorage?.['storage']?.['userStorageSize']} Used
                      </div>

                    </div>
                  </div>
                </li>

                {
                  data?.myworkspace?.map(item => (
                    <>
                      {
                        localStorage?.getItem("userId") == item?.owner ?
                          <>
                            <li>
                              <div className="nk-fmg-aside-bottom">

                                <div className="nk-fmg-status px-1 py-3">
                                  <h6 className="nk-fmg-status-title">
                                    <Icon name="db" />
                                    <span>My Workspace</span>
                                  </h6>
                                  <div className="progress progress-md bg-light">
                                    <div
                                      className="progress-bar"
                                      style={{ width: `${item?.percentageUsed}` }}
                                    ></div>
                                  </div>
                                  <div className="nk-fmg-status-info">
                                    {item?.usedStorage || '-'} Used / {item?.totalStorage}
                                  </div>

                                </div>
                              </div>
                            </li>
                          </> :
                          <></>
                      }
                    </>
                  ))
                }

              </ul>
            </SimpleBar>



          </div>
        </div>
      </SimpleBar>
      {fileManager.asideVisibility && <div className="toggle-overlay"
        onClick={(ev) => {
          ev.preventDefault();
          fileManagerUpdate.asideVisibility();
        }}></div>}

      <Modal isOpen={folderModal} size="md" toggle={toggleFolderModal}>
        <CreateDepartment toggle={toggleFolderModal} setFolder={setFolder} folder={folder} />
      </Modal>

      <Toaster />

      {isVisible ?
        <ContextMenu
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          position={position}
          menuItem={menuItem}
          menuRef={menuRef}
          menuOp={menuOp}

          //rename
          setRenameSelectedSection={(data) => setRenameSelectedSection(data)}
          toggleRenameSection={() => toggleRenameSection()}

          //delete
          deleteSection={(data) => deleteSection(data)}
          setDeleteLoader={(data) => setDeleteLoader(x => !x)}


        /> : <></>}


      {/* rename modal */}
      <Modal isOpen={renameSectionModal} size="md" toggle={toggleRenameSection}>
        <RenameSection toggle={toggleRenameSection} section={renameSelectedSection} />
      </Modal>

    </React.Fragment>
  );
};

export default FileManagerAside;
