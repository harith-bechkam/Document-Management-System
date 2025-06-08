import React, { useState, useEffect } from "react";
import Body from "./components/Body";
import { BlockTitle, Icon } from "../../../components/Component";
import Layout from "./components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { Breadcrumb, BreadcrumbItem, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import DeptDocs from "./components/DeptDocs";
import * as API from '../../../utils/API';
import toast from "react-hot-toast";
import { saveCurrentSection, saveDirectory, setFiles, setDocuments, saveSearchDirectory } from "../../../redux/folderSlice";
import { Spinner } from "reactstrap"
const FileManagerFolders = () => {

  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => { setIsOpen(!isOpen) }
  const navigationBar = useSelector(state => state.folders.navigation);
  const sharedAccess = useSelector(state => state.folders.sharedDocumentsAccessed);
  const sortOrder = localStorage.getItem('sortOrder') || 'desc';
  const sortBy = localStorage.getItem('sortBy') || 'createdAt';
  const store = useSelector(state => state.folders)
  const moveFlag = useSelector(state => state.folders.moveFlag);
  const documentLoaderFlag = useSelector(state => state.folders.docLoaderFlag);

  const [directoryPath, setDirectoryPath] = useState([]);
  const [directoryPathSection, setDirectoryPathSection] = useState({})
  const [loader, setLoader] = useState(false);

  const [page, setPage] = useState(1);

  const currentSection = useSelector(state => state.folders.currentSection)


  useEffect(() => {
    if (!location) return;
    const path = location.pathname
    const sectionRegex = /^\/section\/([a-fA-F0-9]{24})$/;
    const folderRegex = /^\/folder\/([a-fA-F0-9]{24})$/;

    const sectionMatched = sectionRegex.exec(path)
    const folderMatched = folderRegex.exec(path)

    // sectionMatched && fetchSectionList(sectionMatched[1])
    // folderMatched && fetchFolderList(folderMatched[1])

    if (sectionMatched) {
      fetchSectionList(sectionMatched[1])
      getPath(sectionMatched[1])
    }
    else if (folderMatched) {
      fetchFolderList(folderMatched[1])
      getPath(folderMatched[1])
    }

  }, [location, moveFlag, page])

  useEffect(() => {
    toast.remove();
    return () => {
      toast.remove();
    }
  }, [])

  const fetchSectionList = async (sectionId) => {
    setLoader(true);
    let listResponse = await API.getAllFilesAndFoldersListBySectionId(sectionId, sortBy, sortOrder)

    let { status } = listResponse
    if (!status) { setLoader(false); return toast.error(`Could not get Documents in the Section! Refresh and Try Again`) }
    dispatch(setDocuments({
      files: listResponse['data'],
      location: ''
    }))
    setLoader(false);
  }

  const fetchFolderList = async (folderId) => {
    // let selectedNavigation = navigationBar.find(item => item['selected'])
    setLoader(true);
    let listResponse = await API.getAllFilesAndFoldersListByFolderId(folderId, sharedAccess, sortBy, sortOrder)
    let { status } = listResponse
    if (!status) { setLoader(false); return toast.error(`Could not get Documents! Refresh and Try Again`) }

    dispatch(saveCurrentSection(listResponse['sectionId']))
    dispatch(setDocuments({
      files: listResponse['data'],
      location: ''
    }))
    setLoader(false);
  }

  const getPath = async (pathId) => {
    let pathRespo = await API.getDirectoryPath(pathId);
    if (!pathRespo.status) return toast.error(`Path Cannot be Found! Refresh and Try Again`);

    dispatch(saveDirectory([...pathRespo.data]));

    localStorage.removeItem('currentBreadCrumb');
    dispatch(saveSearchDirectory([...pathRespo.data]));

    setDirectoryPathSection(pathRespo.data[0]);
    const arr = pathRespo.data;
    arr.shift();
    setDirectoryPath(arr)
  }

  function navigateToSection(deptname) {
    navigate(`/section/${deptname}`)
  }

  function navigateToParent(pId) {
    navigate(`/folder/${pId}`)
  }

  function printBreadCrumbs() {
    const pathArr = [{
      pathId: directoryPathSection._id,
      name: directoryPathSection.name,
      type: 'section'
    }]
    for (let i = 0; i < directoryPath.length - 2; i++) {
      pathArr.push({
        pathId: directoryPath[i]._id,
        name: directoryPath[i].name,
        type: 'folder'
      })
    }
    pathArr.reverse();

    const pathIdsSet = new Set(pathArr.map(item => item.pathId));

    const remainingPathArr = directoryPath
      .filter(item => !pathIdsSet.has(item._id))
      .map(item => ({
        pathId: item._id,
        name: item.name,
        type: 'folder'
      }));

    function movetoLocation(item) {
      if (item.type == 'folder') {
        navigateToParent(item.pathId)
      } else if (item.type == 'section') {
        navigateToSection(item.pathId)
      }
    }
    return <Breadcrumb className="breadcrumb-arrow">
      <BreadcrumbItem>
        <Dropdown isOpen={isOpen} toggle={toggle}>

          <UncontrolledDropdown>
            <DropdownToggle tag="a" className="dropdown-toggle btn btn-icon ">
              <span className='d-flex justify-content-center align-item-center'>
                <Icon name={'more-h'}></Icon>
              </span>
            </DropdownToggle>
            <DropdownMenu end>
              <ul className="link-check">
                {pathArr.map((element, idx) => {
                  return <li key={element.pathId}>
                    <DropdownItem
                      tag="a"
                      className="breadcrumb_dropdown"
                      href="#dropdownitem"
                      onClick={(ev) => {
                        ev.preventDefault();
                        movetoLocation(element);
                      }}
                    >
                      {element.name}
                    </DropdownItem>
                  </li>
                })}
              </ul>

            </DropdownMenu>
          </UncontrolledDropdown>

        </Dropdown>
      </BreadcrumbItem>
      {remainingPathArr.map((item, index) => (
        <BreadcrumbItem key={item.id} active={index === remainingPathArr.length - 1}>
          {index !== remainingPathArr.length - 1 ?
            <span
              className="breadcrumbforward"
              onClick={() => movetoLocation(item)}
            >
              {item.name}
            </span>

            : (
              <span className="breadcrumbforward">{item.name}</span>
            )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  }


  return (
    <Layout>
      {/* <div className="nk-fmg-body-content"> */}
      <Body

        viewFilter={true}
        title={
          <BlockTitle page>
            {directoryPath.length >= 4 ? printBreadCrumbs() : <Breadcrumb className="breadcrumb-arrow">
              <BreadcrumbItem>
                <span
                  className="breadcrumbforward"
                  onClick={() => navigateToSection(directoryPathSection._id)}
                >
                  {directoryPathSection.name}
                </span>

              </BreadcrumbItem>
              {directoryPath.map((item, index) => (
                <BreadcrumbItem key={item.id} active={index === directoryPath.length - 1}>
                  {index !== directoryPath.length - 1 ?
                    <span
                      className="breadcrumbforward"
                      onClick={() => navigateToParent(item._id)}
                    >
                      {item.name}
                    </span>

                    : (
                      <span className="breadcrumbforward">{item.name}</span>
                    )}
                </BreadcrumbItem>
              ))}
            </Breadcrumb>}
          </BlockTitle>
        }
      >

        {(loader || documentLoaderFlag) ? <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Spinner size="sm" />
        </div> : <DeptDocs files={
          store.fileRepo
            ?.filter(item => {

              if (item['sectionId'] != currentSection) return false

              if (item['type'] == 'file' || item['type'] == 'form') {

                if (item['viewStatus']?.toLowerCase() === 'published') return true

                if (item['viewStatus']?.toLowerCase() == 'indraft') {
                  if (localStorage.getItem('userId') === item['createdBy']) return true
                  if (item['sharedWithIndividualUsers'].some(v => v['_id'] == localStorage.getItem('userId')) || item['sharedWithGroupMembers'].some(v => v['_id'] == localStorage.getItem('userId'))) return true
                }

              }
              else return true
            })
        }
        />}

      </Body>
      {/* </div> */}
    </Layout>
  );
};

export default FileManagerFolders;
