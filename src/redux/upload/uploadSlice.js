import { createSlice } from '@reduxjs/toolkit'
import { modifyFiles } from './uploadUtils'
import { STATUS_UPLOAD } from './constants'
import axios from 'axios'

const initialState = {
    fileProgress: {
        // format
        // 1: {
        //   id: 1,
        //   file,
        //   progress: 0,
        //   cancelSource: source,
        //   status: 0,
        //   sectionId,
        //   folderId,
        //   defaultMetaData,
        //   custMetaData,
        // },
    },
    isMinimized: false,
    // isVisible: true,
}

const uploadSlice = createSlice({
    name: 'upload',
    initialState,
    reducers: {
        toggleMinimize: (state, action) => {
            state.isMinimized = !state.isMinimized
        },

        // saveVisible: (state, action) => {
        //     state.isVisible = action.payload
        // },

        setEmptyFilesProgress: (state, action) => {
            state.fileProgress = {}
        },

        setUploadFile: (state, action) => {
            return {
                ...state,
                fileProgress: {
                    ...state.fileProgress,
                    ...modifyFiles(state.fileProgress, action.payload),
                },
            }
        },

        setUploadProgress: (state, action) => {

            return {
                ...state,
                fileProgress: {
                    ...state.fileProgress,
                    [action?.payload?.id]: {
                        ...state.fileProgress?.[action?.payload?.id],
                        progress: action.payload?.progress,
                    },
                },
            }
        },

        successUploadFile: (state, action) => {

            return {
                ...state,
                fileProgress: {
                    ...state.fileProgress,
                    [action.payload]: {
                        ...state.fileProgress?.[action.payload],
                        status: STATUS_UPLOAD.success,
                    },
                },
            }
        },
        
        processedFile: (state, action) => {

            return {
                ...state,
                fileProgress: {
                    ...state.fileProgress,
                    [action.payload]: {
                        ...state.fileProgress?.[action.payload],
                        isProcessed: true,
                    },
                },
            }
        },

        failureUploadFile: (state, action) => {
            var obj = { ...state.fileProgress }

            return {
                ...state,
                fileProgress: {
                    ...obj,
                    [action.payload]: {
                        ...obj?.[action.payload],
                        status: STATUS_UPLOAD.failed,
                        progress: 0,
                    },
                },
            }
        },

        retryUploadFile: (state, action) => {
            const CancelToken = axios.CancelToken
            const cancelSource = CancelToken.source()

            return {
                ...state,
                fileProgress: {
                    ...state.fileProgress,
                    [action.payload]: {
                        ...state.fileProgress[action.payload],
                        status: STATUS_UPLOAD.uploading,
                        progress: 0,
                        cancelSource,
                    }
                }
            }

        },



    }
})

export const {
    toggleMinimize,
    // saveVisible,
    setEmptyFilesProgress,
    setUploadFile,
    setUploadProgress,
    successUploadFile,
    processedFile,
    failureUploadFile,
    retryUploadFile

} = uploadSlice.actions

export default uploadSlice.reducer


//WORKFLOW
// section Inherit Workflow option -> Body.js
// folder Inherit Workflow option -> DeptDocs.js
// file&form Inherit Workflow option ->Details.js
