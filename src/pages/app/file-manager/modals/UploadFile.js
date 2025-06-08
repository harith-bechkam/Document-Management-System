import React, { useState, useEffect } from "react";
import { Button, Icon } from "../../../../components/Component";
import PropTypes from 'prop-types';

import UploadFileForm from "../components/MultiStep/UploadFileForm";
import MetaDataForm from "../components/MultiStep/MetaDataForm";
import * as API from '../../../../utils/API';
import toast from "react-hot-toast";
import './MultiStepLoader.css'
import { Alert, Label, Modal, ModalFooter, ModalHeader } from "reactstrap";
import { Col, ModalBody, Row, Spinner } from "reactstrap";
import CustomMetaData from "../../../admin/MetaData/Modals/CustomMetaData";



const UploadFile = ({ toggle, files, setFiles, handleSubmit, metadataMode, setMetadataMode, handleSelectedValue,
  customMetaModal, setCustomMetaModal, customMetaData, setCustomMetaData, selectedMetaDataOptions, setSelectedMetaDataOptions, customMetaDataOptions, setCustomMetaDataOptions, dropdownOpen, setDropdownOpen, docNum, setDocNum, notes, setNotes, docTypeData, setDocTypeData, secdocTypeData, setSecDocTypeData, keywordsData, setKeywordsData, docTypeOptionsData, secdocTypeOptionsData, setDocTypeOptionsData, setsecDocTypeOptionsData, keywordOptionsData, setKeywordOptionsData
}) => {


  useEffect(() => {
    setFiles([])
    setMetadataMode('skip')

    setDocNum('')
    setNotes('')
    setDocTypeData([])
    setKeywordsData([])

    setSelectedMetaDataOptions([])
    setCustomMetaData([])

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



  const toggleCustomMetaModal = () => {
    setCustomMetaModal(!customMetaModal)
  }


  function handleNext() {

    if (files.length == 0) {
      toast('Please fill required Field', { icon: '⚠️' })
      return
    }
    handleSubmit()

  };



  return (
    <React.Fragment>

      <ModalHeader className="border-bottom-0 position-relative">
        <h5 className="title m-0">Upload File</h5>

        <a
          href="#close"
          onClick={(ev) => {
            ev.preventDefault();
            toggle();
          }}
          className="close position-absolute end-0 top-0 mt-2 me-2"
        >
          <Icon name="cross-sm" />
        </a>
      </ModalHeader>


      <ModalBody className="overflow-auto">

        <UploadFileForm handleNext={handleNext} files={files} setFiles={setFiles} />
        {files?.length != 0 &&
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
                      id="inlineRadio1"
                      value="auto"
                      checked={metadataMode === "auto"}
                      onChange={handleSelectedValue}
                    />
                    <label className="form-check-label" htmlFor="inlineRadio1">
                      Auto
                    </label>
                  </div>

                  {files?.length == 1 &&
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
                  }

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
              {metadataMode == 'auto' &&
                <div className="form-control-wrap">
                  <Alert className=" mt-3 metaupload" color="primary">
                    <p>
                      <Icon name="alert-circle" className="me-1" />
                      <strong>Auto Metadata Extraction:</strong> We will automatically extract metadata for the following document types:
                    </p>
                    <ul style={{ textAlign: 'left', paddingLeft: '1.25rem' }}>
                      <li><strong>Word</strong> (.doc, .docx)</li>
                      <li><strong>Excel</strong> (.xls, .xlsx)</li>
                      <li><strong>PDF</strong> (.pdf)</li>
                      <li><strong>PowerPoint</strong> (.ppt, .pptx)</li>
                      <li><strong>Video files</strong> (.mp4, .avi, .mov, etc.)</li>
                    </ul>
                    <p style={{ marginTop: '1rem' }}>
                      For other file types, you can select the <strong>Manual</strong> option to enter metadata manually.
                    </p>
                  </Alert>
                </div>
              }
            </div>

            {metadataMode == 'manual' &&
              <MetaDataForm
                defaultMetaData={[
                  {
                    fieldName: 'Document Number',
                    type: 'text',
                    id: "docNum",
                    placeholder: "Enter Document Number",
                    required: false
                  },
                  {
                    fieldName: 'Primary Document Type',
                    type: 'tag',
                    id: "doctype",
                    placeholder: "Enter Primary Document Type",
                    required: true,
                  },
                  {
                    fieldName: 'Secondary Document Type',
                    type: 'tag',
                    id: "doctype",
                    placeholder: "Enter Secondary Document Type",
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

                handleSubmit={handleSubmit}
                docNum={docNum} setDocNum={setDocNum}
                notes={notes} setNotes={setNotes}
                docTypeData={docTypeData} setDocTypeData={setDocTypeData}
                keywordsData={keywordsData} setKeywordsData={setKeywordsData}
                docTypeOptionsData={docTypeOptionsData} setDocTypeOptionsData={setDocTypeOptionsData}
                keywordOptionsData={keywordOptionsData} setKeywordOptionsData={setKeywordOptionsData}

                toggleCustomMetaModal={toggleCustomMetaModal}

                secdocTypeOptionsData={secdocTypeOptionsData} setsecDocTypeOptionsData={setsecDocTypeOptionsData}
                secdocTypeData={secdocTypeData} setSecDocTypeData={setSecDocTypeData}
              />
            }


          </>
        }


        <Modal isOpen={customMetaModal} size="md" toggle={toggleCustomMetaModal}>
          <CustomMetaData toggle={toggleCustomMetaModal} op={"Normal Modal"} setCustomMetaDataOptions={setCustomMetaDataOptions} />
        </Modal>


      </ModalBody>

      <ModalFooter className="bg-white">
        <div className="multi-step-buttons" style={{ display: "flex", justifyContent: "flex-end" }}>
          <ul className="btn-toolbar g-4 align-center justify-end mx-3">
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
          </ul>
          <ul className="btn-toolbar g-4 align-center justify-end">
            <li>
              <Button
                type="button"
                color="primary"
                onClick={handleSubmit}
                disabled={files?.length == 0}
              >
                Upload
              </Button>
            </li>
          </ul>
        </div>
      </ModalFooter>
    </React.Fragment>
  );
};

UploadFile.propTypes = {
  toggle: PropTypes?.func?.isRequired,
};

export default UploadFile;
