import { createAsyncThunk } from '@reduxjs/toolkit';
import { failureUploadFile, processedFile, retryUploadFile, setUploadFile, setUploadProgress, successUploadFile } from './uploadSlice'
import axios from 'axios';
import { addNewFile } from '../folderSlice';
import * as API from "../../utils/API";
import toast from "react-hot-toast";


export const setUploadFileAction = createAsyncThunk('upload/setUploadFileAction',
    async (data, { dispatch }) => {
        dispatch(setUploadFile(data))
    }
)

export const setUploadProgressAction = createAsyncThunk('upload/setUploadProgressAction',
    async (data, { dispatch }) => {
        let { id, progress } = data
        dispatch(setUploadProgress({ id, progress }))
    }
)

export const processedFileAction = createAsyncThunk('upload/processedFileAction',
    async (id, { dispatch }) => {
        dispatch(processedFile(id))
    }
)

export const successUploadFileAction = createAsyncThunk('upload/successUploadFileAction',
    async (id, { dispatch }) => {
        dispatch(successUploadFile(id))
    }
)

export const failureUploadFileAction = createAsyncThunk('upload/failureUploadFileAction',
    async (id, { dispatch }) => {
        dispatch(failureUploadFile(id))
    }
)

export const addNewFileAction = createAsyncThunk('folders/addNewFileAction',
    async (data, { dispatch }) => {
        dispatch(addNewFile(data))
    }
)

// export const fetchWorkflowHistoryAction = createAsyncThunk('folders/fetchWorkflowHistoryAction',
//     async (data, { dispatch }) => {
//         dispatch(fetchWorkflowHistory(data))
//     }
// )

export const retryUploadAction = createAsyncThunk('upload/retryUploadAction',
    async (id, { dispatch, getState }) => {

        dispatch(retryUploadFile(id))

        const state = getState()
        const reuploadFile = [state.upload.fileProgress[id]]
        dispatch(uploadFileAction(reuploadFile))
    }
)

//parallel
// export const uploadFileAction = createAsyncThunk(
//     'upload/uploadFileAction',
//     async (datas, { dispatch }) => {
//         try {
//             const uploadPromises = datas.map(async (item) => {
//                 let urlString;

//                 const sectionId = item.sectionId
//                 const folderId = item.folderId
//                 const defaultMetaData = item.defaultMetaData
//                 const customMetaData = item.custmetafield

//                 const formData = new FormData()
//                 formData.append('file', item?.file)
//                 formData.append('defaultMetaData', JSON.stringify(defaultMetaData))
//                 formData.append('customMetaData', JSON.stringify(customMetaData))

//                 if (folderId) {
//                     urlString = `${process.env.REACT_APP_BE_URL}/file/uploadFile?sectionId=${sectionId}&folderId=${folderId}`
//                 } else {
//                     urlString = `${process.env.REACT_APP_BE_URL}/file/uploadFile?sectionId=${sectionId}`
//                 }

//                 return axios({
//                     url: urlString,
//                     method: 'post',
//                     data: formData,
//                     headers: {
//                         'Content-Type': 'multipart/form-data',
//                     },
//                     cancelToken: item?.cancelSource?.token,
//                     onUploadProgress: (progressEvent) => {
//                         if (progressEvent.total && progressEvent.total > 0) {
//                             const { loaded, total } = progressEvent
//                             let percentageProgress = Math.floor((loaded / total) * 100)

//                             if (percentageProgress > 95) {
//                                 percentageProgress = 95
//                             }

//                             dispatch(setUploadProgressAction({ id: item?.id, progress: percentageProgress }))
//                         }
//                     },
//                 })
//                     .then(async (res) => {
//                         const { status, data } = res.data
//                         if (status) {

//                             sectionId != 'workflowupload' && (await checkAndStartWorkflow(data))
//                             dispatch(setUploadProgressAction({ id: item?.id, progress: 100 }))

//                             debugger;
//                             console.log(data, "abcData")
//                             item?.APIType == 'fileUploadAPI' && dispatch(addNewFileAction(data))
//                             dispatch(successUploadFileAction(item?.id))
//                         }
//                     })
//                     .catch((err) => {
//                         const errorMessage = extractErrorMessage(err?.response?.data || err?.message)
//                         toast.error(`${errorMessage}`)
//                         console.error(errorMessage, 'Error in uploading file')

//                         if (!axios.isCancel(err)) {
//                             dispatch(failureUploadFileAction(item?.id))
//                         }
//                     })
//             })

//             await Promise.all(uploadPromises)
//         } catch (err) {
//             toast.error(`An Error Occurred While Uploading - ${err}`)
//             console.error('An Error Occurred While Uploading -', err)
//         }
//     }
// );


export const uploadFileAction = createAsyncThunk(
    'upload/uploadFileAction',
    async (datas, { dispatch }) => {
        try {
            const uploadPromises = datas.map(async (item) => {

                dispatch(processedFileAction(item?.id))

                let urlString

                const sectionId = item.sectionId
                const folderId = item.folderId
                const defaultMetaData = item.defaultMetaData
                const customMetaData = item.custmetafield
                const metadataMode = item?.metadataMode || 'skip'
                const metaOperation = item?.metaOperation || false


                const formData = new FormData()
                formData.append('file', item?.file)
                formData.append('defaultMetaData', JSON.stringify(defaultMetaData))
                formData.append('customMetaData', JSON.stringify(customMetaData))
                formData.append('metadataMode', metadataMode.toString())
                formData.append('metaOperation', metaOperation)



                urlString = folderId
                    ? `${process.env.REACT_APP_BE_URL}/file/uploadFile?sectionId=${sectionId}&folderId=${folderId}`
                    : `${process.env.REACT_APP_BE_URL}/file/uploadFile?sectionId=${sectionId}`

                urlString += `&timestamp=${Math.random().toString(36).substring(2, 9)}`

                return axios({
                    url: urlString,
                    method: 'post',
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    cancelToken: item?.cancelSource?.token,
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total && progressEvent.total > 0) {
                            const { loaded, total } = progressEvent
                            let percentageProgress = Math.floor((loaded / total) * 100)

                            if (percentageProgress > 95) {
                                percentageProgress = 95
                            }

                            dispatch(setUploadProgressAction({ id: item?.id, progress: percentageProgress }))
                        }
                    },
                })
                    .then(async (res) => {
                        const { status, data } = res.data
                        if (status) {

                            if (sectionId != 'workflowupload') {
                                // await checkAndStartWorkflow({ ...data, fileId: item?.id })
                            }

                            dispatch(setUploadProgressAction({ id: item?.id, progress: 100 }))


                            if (item?.APIType == 'fileUploadAPI') {
                                dispatch(addNewFileAction({ ...data, fileId: item?.id }))
                            }
                            dispatch(successUploadFileAction(item?.id))
                        }
                    })
                    .catch((err) => {
                        //not given error message in toast.bcoz good and feel will not better

                        // const errorMessage = extractErrorMessage(err?.response?.data || err?.message)
                        // toast.error(`${errorMessage}`)

                        console.error(err, "Error in uploading file")

                        if (axios.isCancel(err)) { }
                        dispatch(failureUploadFileAction(item?.id))
                    })

            })

            //main loop will block when use for loop so used promise.all..
            await Promise.allSettled(uploadPromises)

        }
        catch (err) {
            toast.error(`Error Occurred While Uploading - ${err}`)
            console.error('Error Occurred While Uploading -', err)
        }
    }
)



const checkAndStartWorkflow = async (item) => {

    //before his parent & ancestor parent check himself
    let { status, message, lastRevisionNo } = await checkBeforeEnableThisBtn(item['_id'], 'file')
    if (lastRevisionNo == '' || !lastRevisionNo || lastRevisionNo == undefined || lastRevisionNo == '-') {
        lastRevisionNo = 0
    }

    if (message == "File is in under Workflow!") {
        toast("This file is already in a workflow" || message, { icon: '⚠️' });
        return
    }

    //check his parent & ancestor parent worklow is present or not,if present update it in current item
    let pathRespo = await API.getDirectoryPath(item['_id']);
    if (!pathRespo.status) return toast.error(`Some Error Occured While fetching ${item['name']} Parent! Refresh and try again`);

    const result = pathRespo.data.reduce((acc, path) => {
        if (path._id != item._id && path.workflow !== null) {
            acc.hasWorkflow = true;
            acc.workflows.push(path);
        }
        return acc
    }, { hasWorkflow: false, workflows: [] })



    if (result['hasWorkflow']) {
        let parentData = result['workflows'][result['workflows'].length - 1]
        let togoName = 'file'
        let togoId = item['_id']
        parentData['workflow']['revisionNo'] = lastRevisionNo + 1 || 1

        try {
            await API.updateWorkflowInFiles(parentData['workflow'], togoName, togoId, lastRevisionNo + 1 || 1)
        }
        catch (err) {
            toast.error(`An Error Occurred While Starting Workflow - ${err}`)
            console.error('An Error Occurred While Starting Workflow -', err)
        }
    }
    // else {
    //     // if not setUp the workflow
    // toast(`Please SetUp the Workflow`, { icon: '⚠️' })
    // }
}

const checkBeforeEnableThisBtn = async (detailsId, detailsType) => {
    let workflowDetailResponse = await API.checkFileInWorkflow(detailsId, detailsType)
    let { status, message, lastRevisionNo } = workflowDetailResponse
    return { status, message, lastRevisionNo }
}

const extractErrorMessage = (error) => {
    try {
        if (typeof error === 'string' && error.startsWith('<!DOCTYPE html>')) {
            const regex = /<pre>(.*?)<\/pre>/s;
            const match = regex.exec(error);
            if (match && match[1]) {
                const errorMessage = match[1]
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/&nbsp;/gi, ' ')
                    .replace(/<[^>]+>/g, '');

                const specificErrorRegex = /Error: .*/;
                const specificErrorMatch = specificErrorRegex.exec(errorMessage);
                if (specificErrorMatch && specificErrorMatch[0]) {
                    return specificErrorMatch[0].trim();
                }
                return errorMessage.trim();
            }
        }
        return error?.message || "An unknown error occurred.";
    } catch (extractionError) {
        console.error("Error extracting message:", extractionError);
        return "Failed to extract error message.";
    }
}