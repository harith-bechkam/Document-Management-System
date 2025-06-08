import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router";

import { Icon, RSelect } from "../../../../components/Component";
import { Alert, Button, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import data from "../Data"
import moment from "moment/moment";
import incomingFile from "../../../../utils/fileDetails";
import { useDispatch, useSelector } from "react-redux";
import { useFileManager, useFileManagerUpdate } from "../components/Context";
import * as API from '../../../../utils/API';
import toast from "react-hot-toast";
import UploadFolderForm from "../components/MultiStep/UploadFolderForm";
import MetaDataForm from "../components/MultiStep/MetaDataForm";
import { saveCurrentSection, setFiles, setDocuments, updateLoaderFlag, updateMoveFlag } from "../../../../redux/folderSlice";
import './MultiStepLoader.css'
import CustomMetaData from "../../../admin/MetaData/Modals/CustomMetaData";
import { setUploadFileAction } from "../../../../redux/upload/uploadAction";
import Swal from "sweetalert2";


const UploadFolder = ({ toggle }) => {

    const [currentStep, setCurrentStep] = useState(0);
    const [folder, setFolder] = useState({
        data: [],
        sectionId: ''
    })
    const [metadataMode, setMetadataMode] = useState("skip")


    //DefaultMetaFields
    const [docNum, setDocNum] = useState('')
    const [notes, setNotes] = useState('')
    const [docTypeData, setDocTypeData] = useState([])

    const [keywordsData, setKeywordsData] = useState([])
    const [docTypeOptionsData, setDocTypeOptionsData] = useState([])

    const [secdocTypeData, setSecDocTypeData] = useState([])
    const [secdocTypeOptionsData, setsecDocTypeOptionsData] = useState([])

    const [keywordOptionsData, setKeywordOptionsData] = useState([])

    //customMetaFields
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [customMetaDataOptions, setCustomMetaDataOptions] = useState([])
    const [selectedMetaDataOptions, setSelectedMetaDataOptions] = useState([])
    const [customMetaData, setCustomMetaData] = useState({})

    const [customMetaModal, setCustomMetaModal] = useState(false)
    const [isFolderUploaded, setIsFolderUploaded] = useState(false)

    const dispatch = useDispatch();
    const currentSection = useSelector(state => state.folders.currentSection);
    // const hasOneOrMoreFolders = Object.keys(folder['data']).length == 1;

    const location = useLocation();
    const params = useParams();

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




    const toggleCustomMetaModal = () => {
        setCustomMetaModal(!customMetaModal)
    }



    const fetchSectionList = async (sectionId) => {
        let listResponse = await API.getAllFilesAndFoldersListBySectionId(sectionId)
        let { status } = listResponse
        if (!status) return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))

        // dispatch(setFiles({
        //     files: listResponse['data'],
        //     location: ''
        // }))
        dispatch(setDocuments({
            files: listResponse['data'],
            location: ''
        }))
    }

    const fetchFolderList = async (folderId) => {
        let listResponse = await API.getAllFilesAndFoldersListByFolderId(folderId)
        let { status } = listResponse
        if (!status) return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))

        // dispatch(setFiles(listResponse['data']))
        dispatch(setDocuments({
            files: listResponse['data'],
            location: ''
        }))
        dispatch(saveCurrentSection(listResponse['sectionId'])) //save's currentSection
    }

    const askUploadReviewOption = async () => {
        const result = await Swal.fire({
            title: 'Upload Document',
            text: 'Do you want to upload the document with review enabled?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'With Review',
            cancelButtonText: 'Without Review',
            reverseButtons: true,
            allowOutsideClick: true,
        })

        if (result?.isConfirmed) {
            return true
        }
        else if (result.dismiss == Swal.DismissReason.cancel) {
            return false
        }
        else {
            return null
        }
    }

    let handleSubmit = async () => {

        // if (docTypeData.length == 0) {
        //     toast('Please fill required Field!', { icon: '⚠️' })
        //     return
        // }
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

        let folderId = folderMatched ? folderMatched[1] : null



        let folderResponse;

        let sharedDirectoryFolder = params.id;
        let sharedDirectorySection = '';

        let metaOperation = false
        if (metadataMode == 'auto') {
            metaOperation = await askUploadReviewOption()
            if (metaOperation === null) {
                return;
            }
        }
        toggle()
        dispatch(updateLoaderFlag({ loader: true, text: "Uploading Folder" }));

        if (location.pathname.includes('share')) {
            const folderId = params.id;
            const folderDetails = await API.getDetails(folderId);
            const currentSectionId = folderDetails.data?.data?.sectionId;
            sharedDirectorySection = folderDetails.data?.data?.sectionId;
            folderResponse = await API.uploadFolder(folder['data'], currentSectionId, folderId, defaultMetaData, custmetafield, metadataMode, metaOperation)
        } else {
            folderResponse = await API.uploadFolder(folder['data'], folder['sectionId'], folderId, defaultMetaData, custmetafield, metadataMode, metaOperation)
        }

        var { status, fileInfos } = folderResponse
        if (!status) {
            dispatch(updateLoaderFlag({ loader: false, text: "" }));
            return toast.error(`${folderResponse['message']}`.replace(/\b\w/g, char => char.toUpperCase()))
        }

        if (status) {
            let fileData = []

            for (var val of fileInfos) {

                //for fast search use map to find
                // const key = `${val.orgFileName}_${val.size}_${val.filePath}`
                if (location.pathname.includes('share')) {
                    fileData.push({
                        sectionId: sharedDirectorySection, folderId: val['folderDBId'], defaultMetaData, custmetafield, metadataMode, metaOperation,
                        file: folder['data'] && Array.from(folder['data']).find(item => {
                            return item.name == val.orgFileName && item.size == val.size && item.webkitRelativePath == val.filePath
                        }) || {},
                        APIType: 'folderUploadAPI'
                    })
                } else {
                    fileData.push({
                        sectionId: folder['sectionId'], folderId: val['folderDBId'], defaultMetaData, custmetafield, metadataMode, metaOperation,
                        file: folder['data'] && Array.from(folder['data']).find(item => {
                            return item.name == val.orgFileName && item.size == val.size && item.webkitRelativePath == val.filePath
                        }) || {},
                        APIType: 'folderUploadAPI'
                    })
                }


            }

            dispatch(updateLoaderFlag({ loader: false, text: "" }));
            dispatch(setUploadFileAction(fileData))

        }


        sectionMatched && fetchSectionList(sectionMatched[1])
        folderMatched && fetchFolderList(folderMatched[1])
        // toggle()
        setFolder({
            data: [],
            sectionId: ''
        })
        dispatch(updateMoveFlag({}))

    }
    const handleSelectedValue = (event) => {
        setMetadataMode(event.target.value)
    }

    return (
        <React.Fragment>
            <ModalHeader className="border-bottom-0 position-relative">
                <h5 className="title m-0">Upload Folder</h5>

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

                <div className="nk-upload-form mb-0">

                    <UploadFolderForm folder={folder} setFolder={setFolder} setIsFolderUploaded={setIsFolderUploaded} />
                    {isFolderUploaded &&
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
                        </>
                    }

                    {metadataMode == 'manual' &&
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
                            secdocTypeOptionsData={secdocTypeOptionsData} setsecDocTypeOptionsData={setsecDocTypeOptionsData}
                            secdocTypeData={secdocTypeData} setSecDocTypeData={setSecDocTypeData}

                            toggleCustomMetaModal={toggleCustomMetaModal}
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
                            disabled={!isFolderUploaded}
                        >
                            Upload
                        </Button>
                    </li>
                </ul>
            </ModalFooter>
        </React.Fragment >
    )
};

export default UploadFolder;
