import { createSlice } from '@reduxjs/toolkit'
import { modifyFiles } from './downloadUtils'
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
        // },
    },
    isMinimized: false,
    // isVisible: true,
}

const downloadSlice = createSlice({
    name: 'download',
    initialState,
    reducers: {
        toggleDownloadMinimize: (state, action) => {
            state.isMinimized = !state.isMinimized
        },

        // saveVisible: (state, action) => {
        //     state.isVisible = action.payload
        // },

        setEmptyFilesDownloadProgress: (state, action) => {
            state.fileProgress = {}
        },

        setDownloadFile: (state, action) => {
            return {
                ...state,
                fileProgress: {
                    ...state.fileProgress,
                    ...modifyFiles(state.fileProgress, action.payload),
                },
            }
        },

        setDownloadProgress: (state, action) => {

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

        processedDownloadFile: (state, action) => {
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

        successDownloadFile: (state, action) => {

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

        failureDownloadFile: (state, action) => {
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

        retryDownloadFile: (state, action) => {
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
    toggleDownloadMinimize,
    // saveVisible,
    setEmptyFilesDownloadProgress,
    setDownloadFile,
    setDownloadProgress,
    processedDownloadFile,
    successDownloadFile,
    failureDownloadFile,
    retryDownloadFile

} = downloadSlice.actions

export default downloadSlice.reducer

