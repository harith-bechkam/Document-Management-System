import React, { useState, useEffect, useRef } from "react";
import { Icon } from "../../../../components/Component";
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import CreateFolderForm from "../components/MultiStep/CreateFolderForm";
import MetaDataForm from "../components/MultiStep/MetaDataForm";
import './MultiStepLoader.css'
import * as API from '../../../../utils/API';
import { addNewFile, updateLoaderFlag } from "../../../../redux/folderSlice";
import toast from "react-hot-toast";
import { Form } from "react-validation/build/form";
import { useDispatch, useSelector } from "react-redux";
import CustomMetaData from "../../../admin/MetaData/Modals/CustomMetaData";
import { useLocation } from "react-router";


const CreateFolder = ({ toggle }) => {

  const [currentStep, setCurrentStep] = useState(0);
  const [folderName, setFolderName] = useState('');

  const [metadataMode, setMetadataMode] = useState("skip")

  //DefaultMetaFields
  const [docNum, setDocNum] = useState('')
  const [notes, setNotes] = useState('')
  const [docTypeData, setDocTypeData] = useState([])
  const [keywordsData, setKeywordsData] = useState([])
  const [docTypeOptionsData, setDocTypeOptionsData] = useState([])
  const [keywordOptionsData, setKeywordOptionsData] = useState([])
  const [secdocTypeData, setSecDocTypeData] = useState([])
  const [secdocTypeOptionsData, setsecDocTypeOptionsData] = useState([])


  //customMetaFields
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customMetaDataOptions, setCustomMetaDataOptions] = useState([])
  const [selectedMetaDataOptions, setSelectedMetaDataOptions] = useState([])
  const [customMetaData, setCustomMetaData] = useState({})

  const [customMetaModal, setCustomMetaModal] = useState(false)

  const dispatch = useDispatch();
  const currentSection = useSelector(state => state.folders.currentSection);
  const store = useSelector(state => state.folders);

  const [folderCreationError, setFolderCreationError] = useState('');
  const [folderCreationErr, setFolderCreationErr] = useState(false);
  const [docTypeError, setDocTypeError] = useState('');
  const [docTypeErr, setDocTypeErr] = useState(false);
  const formRef = useRef(null);

  const location = useLocation()

  useEffect(() => {
    fetchData()
  }, [])


  const fetchData = async () => {
    let customMetaDataFieldReponse = await API.getAllCustomMetaDataList()
    let docTypeResponse = await API.getAllDocumentType()
    let keywordsResponse = await API.getAllKeywords()

    customMetaDataFieldReponse['status'] && setCustomMetaDataOptions(customMetaDataFieldReponse['data'])
    if (docTypeResponse?.['status']) {
      setDocTypeOptionsData(docTypeResponse['data']['documentTypeData']?.map(item => ({ label: item['name'], value: item['name'] })))
      setsecDocTypeOptionsData(docTypeResponse['data']['secDocumentTypeData']?.map(item => ({ label: item['name'], value: item['name'] })))
    }
    keywordsResponse['status'] && setKeywordOptionsData(keywordsResponse['data'].map(item => ({ label: item['name'], value: item['name'] })))
  }


  const stepsHeader = [
    { step: 0, label: "Create Folder" },
    { step: 1, label: "MetaData" }
  ];


  const toggleCustomMetaModal = () => {
    setCustomMetaModal(!customMetaModal)
  }


  function handleNext() {

    if (currentStep == 0) {

      // if (formRef.current.context._errors.length > 0) {
      //   return;
      // }
      if (folderName == "") {
        // formRef.current.validateAll();
        // return
        setFolderCreationError('Enter the Folder Name!')
        setFolderCreationErr(true)
        return
      }
    }

    if (currentStep == 1) {
      if (docTypeData.length == 0) {
        toast('Please fill required Field!', { icon: '⚠️' })
        return
      }
    }

    // setCurrentStep(prevStep => Math.min(prevStep + 1, steps.length - 1));
  };

  // let handlePrevious = () => {
  //   setCurrentStep(prevStep => Math.max(prevStep - 1, 0));
  // };


  async function handleSubmit() {

    // if (docTypeData.length == 0) {
    //   toast('Please fill required Field!', { icon: '⚠️' })
    //   return
    // }

    if (folderName == "") {
      // formRef.current.validateAll();
      // return
      setFolderCreationError('Enter the Folder Name!')
      setFolderCreationErr(true)
      return
    }

    if (!location) return;

    const pathname = location.pathname
    const sectionRegex = /^\/section\/([a-fA-F0-9]{24})$/;
    const folderRegex = /^\/folder\/([a-fA-F0-9]{24})$/;

    const sectionMatched = sectionRegex.exec(pathname)
    const folderMatched = folderRegex.exec(pathname)

    let docTypeDataValue = docTypeData?.map(item => item.value);
    let keywordsDataValue = keywordsData?.map(item => item.value);

    let defaultMetaData = (!docNum && !notes && docTypeDataValue.length == 0 && keywordsDataValue.length == 0) ? null : { docNum, notes, docTypeDataValue, keywordsDataValue }
    let custmetafield = Object.keys(customMetaData)?.length == 0 ? null : customMetaData


    let sectionId = sectionMatched ? sectionMatched[1] : currentSection
    let parentId = folderMatched ? folderMatched[1] : null

    let folderResponse;
    dispatch(updateLoaderFlag({ loader: true, text: "Creating Folder" }));
    folderResponse = await API.createFolder(folderName, sectionId, parentId, defaultMetaData, custmetafield, metadataMode)
    dispatch(updateLoaderFlag({ loader: false, text: "" }));


    let { status } = folderResponse
    if (!status) return toast.error(`${folderResponse?.['message']}`.replace(/\b\w/g, char => char.toUpperCase()))

    let { data } = folderResponse
    dispatch(addNewFile(data))
    toast.success(`${folderName} created successfully`);
    toggle()

  };

  const handleSelectedValue = (event) => {
    setMetadataMode(event.target.value)
  }

  return (
    <React.Fragment>
      <ModalHeader className="border-bottom-0 position-relative">
        <h5 className="title m-0">Create Folder</h5>

        <a
          href="#close"
          onClick={(ev) => {
            ev.preventDefault();
            toggle();
          }}
          className="close position-absolute end-0 top-0 mt-2 me-2 cursor-pointer"
        >
          <Icon name="cross-sm" />
        </a>
      </ModalHeader>

      <ModalBody className="overflow-auto">
        <div className="nk-upload-form mb-0">

          <CreateFolderForm
            folderName={folderName}
            setFolderName={setFolderName}
            folderCreationError={folderCreationError}
            setFolderCreationError={setFolderCreationError}
            folderCreationErr={folderCreationErr}
            setFolderCreationErr={setFolderCreationErr}
            handleNext={handleNext}
          // formRef={formRef}
          />

          {folderName &&
            <>
              <div className="form-group fs-6 pb-4 mt-4">
                <Label className="form-label" htmlFor="Metadata">
                  Metadata <span className="required">*</span>
                </Label>

                <div className="form-control-wrap">
                  <div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="metadataOptions"
                        id="inlineRadio2"
                        value="manual"
                        checked={metadataMode === "manual"}
                        onChange={handleSelectedValue}
                      />
                      <label className="form-check-label" htmlFor="inlineRadio2">
                        Manual
                      </label>
                    </div>

                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="metadataOptions"
                        id="inlineRadio3"
                        value="skip"
                        checked={metadataMode === "skip"}
                        onChange={handleSelectedValue}
                      />
                      <label className="form-check-label" htmlFor="inlineRadio3">
                        Skip
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          }

          {metadataMode == "manual" &&
            <MetaDataForm
              defaultMetaData={[
                {
                  fieldName: 'Folder Number',
                  type: 'text',
                  id: "docNum",
                  placeholder: "Enter Folder Number",
                  required: false
                },
                {
                  fieldName: 'Primary Folder Type',
                  type: 'tag',
                  id: "doctype",
                  placeholder: "Enter Primary Folder Type",
                  required: true,
                },
                {
                  fieldName: 'Secondary Folder Type',
                  type: 'tag',
                  id: "doctype",
                  placeholder: "Enter Secondary Folder Type",
                  required: true,
                },
                {
                  fieldName: 'Keywords',
                  type: 'tag',
                  id: "keywords",
                  placeholder: "Enter Keywords",
                  required: false,
                },
                {
                  fieldName: 'Notes',
                  type: 'textarea',
                  id: "notes",
                  placeholder: "Enter Notes",
                  required: false
                }
              ]}

              dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen}
              customMetaDataOptions={customMetaDataOptions} setCustomMetaDataOptions={setCustomMetaDataOptions}
              selectedMetaDataOptions={selectedMetaDataOptions} setSelectedMetaDataOptions={setSelectedMetaDataOptions}
              customMetaData={customMetaData} setCustomMetaData={setCustomMetaData}


              docNum={docNum} setDocNum={setDocNum}
              notes={notes} setNotes={setNotes}
              docTypeData={docTypeData} setDocTypeData={setDocTypeData}
              keywordsData={keywordsData} setKeywordsData={setKeywordsData}
              docTypeOptionsData={docTypeOptionsData} setDocTypeOptionsData={setDocTypeOptionsData}
              keywordOptionsData={keywordOptionsData} setKeywordOptionsData={setKeywordOptionsData}
              handleSubmit={handleSubmit}
              toggleCustomMetaModal={toggleCustomMetaModal}
              secdocTypeOptionsData={secdocTypeOptionsData} setsecDocTypeOptionsData={setsecDocTypeOptionsData}
              secdocTypeData={secdocTypeData} setSecDocTypeData={setSecDocTypeData}
            />
          }


        </div>

        <Modal isOpen={customMetaModal} size="md" toggle={toggleCustomMetaModal}>
          <CustomMetaData toggle={toggleCustomMetaModal} op={"Normal Modal"} setCustomMetaDataOptions={setCustomMetaDataOptions} />
        </Modal>
      </ModalBody>

      <ModalFooter className="bg-white">
        <ul className="btn-toolbar g-4 align-center justify-end">
          <li>
            <a
              href="#"
              onClick={(ev) => {
                ev.preventDefault();
                toggle();
              }}
            >
              Cancel
            </a>
          </li>
          <li>
            <Button
              type="button"
              color="primary"
              onClick={handleSubmit}
              disabled={folderName == ""}
            >
              Create
            </Button>
          </li>
        </ul>
      </ModalFooter>

    </React.Fragment >

  );
};

export default CreateFolder;
