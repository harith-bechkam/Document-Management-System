import React, { useEffect, useState, useRef } from "react"
import { Nav, NavItem, NavLink, TabContent, TabPane, Button, Label } from "reactstrap"
import classnames from "classnames"
import CreatableSelect from "react-select/creatable"
import makeAnimated from "react-select/animated"
import * as API from '../../../../utils/API'
import { Icon } from "../../../../components/Component"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { doesMetaMultiSelectClicked, updateLoaderFlag } from "../../../../redux/folderSlice";
import toast from "react-hot-toast";
import FileView from "../../../app/file-manager/components/FileView";
import { useLocation, useNavigate, useParams } from "react-router";
import Swal from "sweetalert2";
import { getFileType } from "../../../../utils/helper";
import Viewer from "../../../app/file-manager/modals/Viewer";
import ModalImage from "react-modal-image";
import { Spinner } from 'reactstrap';
import { Tooltip } from "react-tooltip";
import FileRender from "./FileRender"
import Nodata from '../../../../assets/images/search/nodata.svg'


const MetadataDocument = ({ selectedRows, setSelectedRows,
  docTypeOptionsData, setDocTypeOptionsData,
  secdocTypeOptionsData, setsecDocTypeOptionsData,
  keywordOptionsData, setKeywordOptionsData,


  docTypeData, setDocTypeData,
  secdocTypeData, setSecDocTypeData,
  keywordsData, setKeywordsData,
  notes, setNotes,

  totaldata,

  approveCall,
  rejectCall,
  editAccess
}) => {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation();


  const [resourceId, setResourceId] = useState(null)
  const [resource, setResource] = useState(null)
  const [activeTab, setActiveTab] = useState("2");
  const animatedComponents = makeAnimated();
  const params = useParams();

  const [imageFile, setImageFile] = useState({})
  const [imageFlag, setImageFlag] = useState(false);

  const [codeContent, setCodeContent] = useState('')
  const [viewDoc, setViewDoc] = useState({})
  const [viewerModal, setViewerModal] = useState(false);
  const [fileModal, setFileModal] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('')
  const [loading, setLoading] = useState(false);


  const containerRef = useRef(null);
  const editorRef = useRef(null);



  useEffect(() => {
    settuP()
  }, [selectedRows])

  // useEffect(() => {
  //   setLoading(true)
  // }, [iframeUrl])


  useEffect(() => {


    const handleKeyDown = async (event) => {
      if (event.key == 'ArrowDown' || event.key == 'ArrowRight') {
        await handleNext()
      }
      else if (event.key == 'ArrowUp' || event.key == 'ArrowLeft') {
        await handlePrevious()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedRows, setSelectedRows,
    totaldata,
    docTypeData, setDocTypeData,
    secdocTypeData, setSecDocTypeData,
    keywordsData, setKeywordsData,
    notes, setNotes,
  ])





  const settuP = async () => {
    if (selectedRows && selectedRows?.length > 0) {
      const lastSelectedRow = selectedRows?.[0]
      if (!lastSelectedRow) return

      var src = { resourceId: lastSelectedRow?.resourceId, resourceDetails: lastSelectedRow?.resourceDetails }
      setResourceId(src?.resourceId)
      setResource(src)

      const { defaultMetaData } = lastSelectedRow
      if (defaultMetaData) {
        setDocTypeData(defaultMetaData?.docTypeDataValue || [])
        setSecDocTypeData(defaultMetaData?.secondaryDocTypeDataValue || [])
        setKeywordsData(defaultMetaData?.keywordsDataValue || [])
        setNotes(defaultMetaData?.notes || "")
      }

      await loadFile(src?.resourceDetails)
    }
  }

  const reactSelectCustomStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: "4px",
      padding: "4px",
      borderColor: state.isFocused ? "#4B6382" : provided.borderColor, // Change border color to #4B6382 when focused
      boxShadow: state.isFocused ? "0 0 0 1px #4B6382" : provided.boxShadow, // Apply #4B6382 glow effect
    }),
  }


  const mergeprimaryopt = [
    ...(docTypeOptionsData
      ?.filter((option) => !docTypeData?.includes(option?.name))
      .map((option) => ({ value: option?._id, label: option?.name })) || [])
  ]

  const mergesecopt = [
    ...(secdocTypeOptionsData
      ?.filter((option) => !secdocTypeData?.includes(option?.name))
      .map((option) => ({ value: option?.name, label: option?.name })) || [])
  ]

  const keywordopt = [
    ...(keywordOptionsData
      ?.filter((option) => !keywordsData?.includes(option?.name))
      .map((option) => ({ value: option?._id, label: option?.name })) || [])
  ]

  const handleCreate = async (item, inputValue) => {

    const newOption = { value: inputValue, label: inputValue }

    if (item['op'] == 'doctype') {
      let op = item?.id == 'primaryDocType' ? 'primary' : 'secondary'
      dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
      let docResponse = await API.createDocumentType(op, inputValue)
      dispatch(updateLoaderFlag({ loader: false, text: '' }))

      if (docResponse['status']) {
        if (op == 'primary') {
          setDocTypeOptionsData((prevOptions) => [...prevOptions, newOption])
          !docTypeData ? setDocTypeData([inputValue]) : setDocTypeData([...docTypeData, inputValue])
        }
        else {
          setsecDocTypeOptionsData((prevOptions) => [...prevOptions, newOption])
          !secdocTypeData ? setSecDocTypeData([inputValue]) : setSecDocTypeData([...secdocTypeData, inputValue])
        }
      }
    }

    if (item['id'] == 'keywords') {
      dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
      let keywordResponse = await API.createKeywords(inputValue)
      dispatch(updateLoaderFlag({ loader: false, text: '' }))

      if (keywordResponse['status']) {
        setKeywordOptionsData((prevOptions) => [...(prevOptions || []), newOption])
        !keywordsData ? setKeywordsData([inputValue]) : setKeywordsData([...keywordsData, inputValue])
      }
    }

  }

  const isDifferenceFound = async (currentIndex) => {
    const orgMeta = totaldata?.[currentIndex]?.['defaultMetaData']
    if (!orgMeta) return false

    return (
      JSON.stringify(orgMeta['docTypeDataValue'] ?? []) !== JSON.stringify(docTypeData) ||
      JSON.stringify(orgMeta['secondaryDocTypeDataValue'] ?? []) !== JSON.stringify(secdocTypeData) ||
      JSON.stringify(orgMeta['keywordsDataValue'] ?? []) !== JSON.stringify(keywordsData) ||
      JSON.stringify(orgMeta['notes'] ?? '') !== JSON.stringify(notes)
    )
  }

  const handlePrevious = async () => {
    if (!totaldata?.length || selectedRows?.length === 0) return

    const currentIndex = totaldata.findIndex(item => item._id === selectedRows?.[0]?._id)
    if (currentIndex === -1) return

    const hasDifference = await isDifferenceFound(currentIndex)

    if (hasDifference) {
      const result = await Swal.fire({
        title: "Are you sure you want to go to previous record?",
        text: "This action cannot be undone",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Go!",
      })

      if (result.isConfirmed) {
        const prevIndex = (currentIndex - 1 + totaldata.length) % totaldata.length
        const prevRow = totaldata[prevIndex]
        renderFileWhileClickTraverseIcon([prevRow])
        setSelectedRows([prevRow])
      }
    }
    else {
      // No difference found, just go to previous record
      const prevIndex = (currentIndex - 1 + totaldata.length) % totaldata.length
      const prevRow = totaldata[prevIndex]
      renderFileWhileClickTraverseIcon([prevRow])
      setSelectedRows([prevRow])
    }
  }


  const handleNext = async () => {
    if (!totaldata?.length || selectedRows?.length === 0) return

    const currentIndex = totaldata.findIndex(item => item._id === selectedRows?.[0]?._id)
    if (currentIndex === -1) return

    const hasDifference = await isDifferenceFound(currentIndex)

    if (hasDifference) {
      const result = await Swal.fire({
        title: "Are you sure you want to go to next record?",
        text: "This action cannot be undone",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Go!",
      })

      if (result.isConfirmed) {
        const nextIndex = (currentIndex + 1) % totaldata.length
        const nextRow = totaldata[nextIndex]
        renderFileWhileClickTraverseIcon([nextRow])
        setSelectedRows([nextRow])
      }
    }
    else {
      const nextIndex = (currentIndex + 1) % totaldata.length
      const nextRow = totaldata[nextIndex]
      renderFileWhileClickTraverseIcon([nextRow])
      setSelectedRows([nextRow])
    }
  }

  const renderFileWhileClickTraverseIcon = async (data) => {
    if (data) {
      if (['word', 'excel', 'ppt', 'pdf'].includes(data?.resourceDetails?.fileType)) {
        await toggleFileModal(data?.resourceDetails)
      }
    }
    else {
      return
    }
  }

  const toggle = async (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab)
      if (tab == '1') {
        await settuP()
      }
      if (tab == '2') {
        await loadFile(resource?.resourceDetails)
      }
    }
  }


  const openFilInFullScreen = async (fileDetails) => {
    const mode = getFileType(fileDetails?.fileType)

    if (mode == 'unknown') {
      return
    }
    if (['word', 'excel', 'ppt', 'pdf'].includes(mode)) {
      localStorage.setItem('currentLocation', JSON.stringify(location?.pathname));
      window.open(`${window.location.origin}/#/${localStorage.getItem("workspace_id")}/file/view/${fileDetails?._id}`, '_blank', 'noopener,noreferrer');
    }
  }

  const toggleViewerModal = async () => {
    setViewerModal(true)
    setFileModal(false)
  }

  const toggleFileModal = async (fileDetails) => {
    const url = `${window.location.origin}/#/${localStorage.getItem("workspace_id")}/file/view/${fileDetails?._id}?t=${Date.now()}`
    setIframeUrl(url)
    setFileModal(true)
    setViewerModal(false)
  }

  async function loadFile(fileDetails) {
    const mode = getFileType(fileDetails?.fileType)

    if (mode == 'unknown') {
      setViewDoc(fileDetails)
      await toggleViewerModal()
      return
    }

    if (['word', 'excel', 'ppt', 'pdf'].includes(mode)) {
      await toggleFileModal(fileDetails)
    }
    else {
      if (mode == 'image') {
        setImageFile(fileDetails)
        setImageFlag(true)
        await toggleViewerModal()
      }
      else if (mode == 'code') {
        dispatch(updateLoaderFlag({ loader: true, text: 'Loading' }))
        const fileResponse = await API.readFile(fileDetails._id)
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        if (!fileResponse.status) return toast.error('Error Reading File')
        setCodeContent(fileResponse.content)
        setViewDoc(fileDetails)
        await toggleViewerModal()
      }
      else {
        setViewDoc(fileDetails)
        await toggleViewerModal()
      }
    }
  }

  return (
    <div className="d-flex flex-column h-100" >
      {selectedRows?.length > 0 ? (
        <>
          <div className="container flex-grow-1 h-100">
            <Nav tabs className="d-flex align-items-center justify-content-between">
              <div className="d-flex">
                <NavItem style={{ cursor: "pointer" }}>
                  <NavLink
                    className={classnames("custom-tab  pt-0", { active: activeTab === "2" })}
                    onClick={() => toggle("2")}
                  >
                    Document
                  </NavLink>
                </NavItem>
                <NavItem style={{ cursor: "pointer" }}>
                  <NavLink
                    className={classnames("custom-tab pt-0", { active: activeTab === "1" })}
                    onClick={() => toggle("1")}
                  >
                    Metadata
                  </NavLink>
                </NavItem>
              </div>

              {activeTab === "2" &&
                ["word", "excel", "ppt", "pdf"].includes(getFileType(resource?.resourceDetails?.fileType)) && (
                  <>
                    <span
                      className="ms-auto align-items-center pointer"//underline-hover
                      data-tooltip-id="fullscreen-tooltip"
                      data-tooltip-content="Full Screen"
                      onClick={async () => {
                        await openFilInFullScreen(resource?.resourceDetails);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      <Icon name="maximize"
                      />
                    </span>
                    <Tooltip id="fullscreen-tooltip" place="top" className="metatable-tooltip" />
                  </>
                )}
            </Nav>

            <TabContent activeTab={activeTab} className={`custom-tab-content fade-in ${activeTab === "2" ? "mt-0" : "metadatacontentwrapper"}`}>

              <TabPane tabId="1" className="custom-tab-pane">
                <div className="content">
                  {totaldata?.length > 0 ? (
                    <>
                      <div className="mb-3">
                        <Label>Primary Doc Type</Label>
                        <CreatableSelect
                          isMulti
                          value={docTypeData?.map((item) => ({ value: item, label: item }))}
                          placeholder="Select or Create Primary Doc Type"
                          onCreateOption={(inputValue) => handleCreate({ op: "doctype", id: "primaryDocType" }, inputValue)}
                          onChange={(newValue) => setDocTypeData(newValue.map((option) => option.label))}
                          options={mergeprimaryopt}
                          styles={reactSelectCustomStyles}
                        />
                      </div>

                      <div className="mb-3">
                        <Label>Secondary Doc Type</Label>
                        <CreatableSelect
                          isMulti
                          value={secdocTypeData?.map((item) => ({ value: item, label: item }))}
                          placeholder="Select or Create Secondary Doc Type"
                          onCreateOption={(inputValue) => handleCreate({ op: "doctype", id: "secondaryDocType" }, inputValue)}
                          onChange={(newValue) => setSecDocTypeData(newValue.map((option) => option.label))}
                          options={mergesecopt}
                          styles={reactSelectCustomStyles}
                        />
                      </div>

                      <div className="mb-3">
                        <Label>Keywords</Label>
                        <CreatableSelect
                          isMulti
                          value={keywordsData?.map((item) => ({ value: item, label: item }))}
                          placeholder="Select or Create Keywords"
                          onCreateOption={(inputValue) => handleCreate({ id: "keywords" }, inputValue)}
                          onChange={(newValue) => setKeywordsData(newValue.map((option) => option.label))}
                          options={keywordopt}
                          styles={reactSelectCustomStyles}
                        />
                      </div>

                      <div className="mb-3">
                        <Label>Notes</Label>
                        <textarea
                          className="form-control"
                          placeholder="Type your notes here..."
                          rows={10}
                          value={notes || ""}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="d-flex flex-column justify-content-center align-items-center text-muted" style={{ height: "90vh" }}>
                      <img src={Nodata} alt="NoData" width={200} height={200} />
                      <p className="mt-2 fs-6">No item to display</p>
                    </div>
                  )}
                </div>
              </TabPane>

              <TabPane tabId="2" className="custom-tab-pane">
                <div className="content h-100 overflow-hidden" style={{ flexGrow: 1 }}>
                  {totaldata?.length > 0 ? (
                    resourceId && (
                      <>
                        {fileModal ? (
                          <>
                            {loading && (
                              <div className="fileLoader d-flex justify-content-center align-items-center">
                                <Spinner size="sm" /> &nbsp;Loading...
                              </div>
                            )}
                            <FileRender key={resourceId} fileId={resourceId} setLoading={setLoading} containerRef={containerRef} editorRef={editorRef} />
                          </>
                        ) : viewerModal ? (
                          imageFlag ? (
                            <div className="fileLoaderTopdiv d-flex flex-column" style={{ height: "100%", border: "1px solid #ccc" }}>
                              <center>
                                <ModalImage
                                  small={`${process.env.REACT_APP_BE_URL}/file/documents/${imageFile._id}/${localStorage.getItem("workspace_id")}`}
                                  large={`${process.env.REACT_APP_BE_URL}/file/documents/${imageFile._id}/${localStorage.getItem("workspace_id")}`}
                                  alt={imageFile.name}
                                  hideZoom={true}
                                  hideDownload={false}
                                  onClose={() => setImageFlag(false)}
                                />
                              </center>
                            </div>
                          ) : (
                            <div className="fileLoaderTopdiv d-flex flex-column" style={{ height: "100%", border: "1px solid #ccc" }}>
                              <Viewer toggle={toggleViewerModal} file={viewDoc} codeContent={codeContent} op={"metdataApproval"} />
                            </div>
                          )
                        ) : (
                          <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-muted" style={{ height: "90vh" }}>
                            <Icon name="file" style={{ fontSize: "2rem" }} />
                            <p className="mt-2">Invalid File</p>
                          </div>
                        )}
                      </>
                    )
                  ) : (
                    <div className="d-flex flex-column justify-content-center align-items-center text-muted" style={{ height: "90vh" }}>
                      <img src={Nodata} alt="NoData" width={200} height={200} />
                      <p className="mt-2 fs-6">No file to display</p>
                    </div>
                  )}
                </div>
              </TabPane>
            </TabContent>
          </div>

          <div className="d-flex justify-content-between align-items-center p-3 border-top w-100 text-center mx-auto bg-white" style={{ position: "sticky", bottom: 0 }}>
            <Icon
              name="first"
              className="text-primary prevnextbtn"
              data-tooltip-id="prev-tooltip"
              data-tooltip-content="Go to previous"
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onClick={handlePrevious}
            />

            <div className="d-flex justify-content-center">
              {editAccess && (
                <>
                  <Button color="primary" className="me-2" onClick={() => approveCall("single")}>
                    Approve
                  </Button>
                  <Button color="danger" onClick={() => rejectCall("single")}>
                    Cancel
                  </Button>
                </>
              )}
            </div>

            <Icon
              name="last"
              className="text-primary nextbtn"
              data-tooltip-id="next-tooltip"
              data-tooltip-content="Go to next"
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onClick={handleNext}
            />

            <Tooltip id="prev-tooltip" place="top" className="metatable-tooltip" />
            <Tooltip id="next-tooltip" place="top" className="metatable-tooltip" />
          </div>
        </>
      ) : (
        <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-muted" style={{ height: "90vh" }}>
          <img src={Nodata} alt="NoData" width={200} height={200} />
          <p className="mt-2">No item selected. Please select a row to continue.</p>
        </div>
      )}
    </div>
  )
}

export default MetadataDocument