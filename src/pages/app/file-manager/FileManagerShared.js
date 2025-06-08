import React, { useEffect, useState } from "react";
import Body from "./components/Body";
import Shared from "./views/Shared";
import { BlockTitle, Icon } from "../../../components/Component";
import { Breadcrumb, BreadcrumbItem, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import Layout from "./components/Layout";
import { useNavigate, useParams } from "react-router";
import * as API from '../../../utils/API';
import { useDispatch, useSelector } from "react-redux";
import { saveSearchDirectory, setDocuments } from "../../../redux/folderSlice";
import { Spinner } from "reactstrap"
import { size, toArray } from 'lodash'
import toast from "react-hot-toast";
import _ from 'lodash';

const FileManager = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const [directoryPathShared, setDirectoryPathShared] = useState({})
  const [directoryPath, setDirectoryPath] = useState([]);
  const sortOrder = localStorage.getItem('sortOrder') || 'desc';
  const sortBy = localStorage.getItem('sortBy') || 'createdAt';
  const store = useSelector(state => state.folders);
  const sharedAccess = useSelector(state => state.folders.sharedDocumentsAccessed);
  const moveFlag = useSelector(state => state.folders.moveFlag);
  const documentLoaderFlag = useSelector(state => state.folders.docLoaderFlag);
  const [loader, setLoader] = useState(false);
  const uploadStore = useSelector((state) => state.upload)
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => { setIsOpen(!isOpen) }


  useEffect(() => {
    localStorage.removeItem('currentBreadCrumb');
    dispatch(saveSearchDirectory([]))



    // uploadedFileAmount > 0 &&
    //   toArray(uploadStore.fileProgress)


    if (params.id) {
      getBreadCrumb(params.id)
      getNestedDocsShared(params.id)
    } else {
      getBreadCrumb()
      getSharedWithMe()
    }

  }, [params.id, moveFlag, uploadStore])


  async function getBreadCrumb(pathId = null) {
    let pathRespo = await API.getSharedWithDirectoryPath(pathId);
    if (!pathRespo.status) return toast.error(`Path Cannot be Found! Refresh and Try Again`);
    setDirectoryPathShared(pathRespo.data[0]);
    const arr = pathRespo.data;
    const searcharr = _.cloneDeep(pathRespo.data);
    arr.shift();
    setDirectoryPath(arr)
    localStorage.removeItem('currentBreadCrumb');
    dispatch(saveSearchDirectory(searcharr))
  }

  async function getSharedWithMe() {
    setLoader(true);
    const sharedRespo = await API.getSharedDocuments();

    let { status } = sharedRespo;
    if (!status) {
      setLoader(false);
      return toast.error(`${sharedRespo['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
    }
    else {
      dispatch(setDocuments({
        files: sharedRespo.data,
        location: 'shared'
      }))
      setLoader(false);
    }
  }

  async function getNestedDocsShared(folderId) {
    setLoader(true);
    let listResponse = await API.getAllFilesAndFoldersListByFolderId(folderId, 'shared', sortBy, sortOrder)
    let { status } = listResponse
    if (!status) { setLoader(false); return toast.error(`Some Error occured! Refresh and Try Again`) }

    // dispatch(saveCurrentSection(listResponse['sectionId']))
    dispatch(setDocuments({
      files: listResponse['data'],
      location: 'shared'
    }))
    setLoader(false);
  }

  const printBreadcrumbs = () => {
    const pathArr = [{
      pathId: directoryPathShared.link,
      name: directoryPathShared.name,
      type: 'shared'
    }]
    for (let i = 0; i < directoryPath.length - 2; i++) {
      pathArr.push({
        pathId: directoryPath[i].link,
        name: directoryPath[i].name,
        type: 'folder'
      })
    }
    pathArr.reverse();

    const pathIdsSet = new Set(pathArr.map(item => (item.pathId).split('/').pop()));

    const remainingPathArr = directoryPath
      .filter(item => !pathIdsSet.has(item._id))
      .map(item => ({
        pathId: item._id,
        name: item.name,
        type: 'folder'
      }));

    debugger
    return (
      <>
        <Breadcrumb className="breadcrumb-arrow">
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
                            navigate(element.pathId);
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
                  onClick={() => {
                    getBreadCrumb(item.pathId);
                    navigate(`/share/${item.pathId}`)
                  }}
                >
                  {item.name}
                </span>

                : (
                  <span className="breadcrumbforward">{item.name}</span>
                )}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      </>
    )
  }

  return (
    <Layout>
      <Body
        // title={
        //   <BlockTitle tag="h6">Shared</BlockTitle>
        // }
        viewFilter={true}
        title={
          <BlockTitle page>
            {directoryPath.length >= 4 ? printBreadcrumbs() : <Breadcrumb className="breadcrumb-arrow">
              <BreadcrumbItem>
                <span
                  className="breadcrumbforward"
                  onClick={() => navigate(directoryPathShared.link)}
                >
                  {directoryPathShared.name}
                </span>

              </BreadcrumbItem>
              {directoryPath.map((item, index) => (
                <BreadcrumbItem key={item.id} active={index === directoryPath.length - 1}>
                  {index !== directoryPath.length - 1 ?
                    <span
                      className="breadcrumbforward"
                      onClick={() => {
                        getBreadCrumb(item._id);
                        // getNestedDocsShared(item._id)
                        navigate(item.link)
                      }}
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
        {/* <Shared /> */}
        {(loader || documentLoaderFlag) ? <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Spinner size="sm" />
        </div> : <Shared docs={store.sharedRepo
          ?.filter(item => {
            if (item['type'] == 'file' || item['type'] == 'form') {

              if (item['viewStatus']?.toLowerCase() === 'published') return true

            }
            else return true
          })
        } />}
      </Body>
    </Layout>
  );
};

export default FileManager;
