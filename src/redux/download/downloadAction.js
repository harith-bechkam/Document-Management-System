import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { addNewFile } from '../folderSlice';
import * as API from "../../utils/API";
import toast from "react-hot-toast";
import { failureDownloadFile, processedDownloadFile, retryDownloadFile, setDownloadFile, setDownloadProgress, successDownloadFile } from './downloadSlice';


export const setDownloadFileAction = createAsyncThunk('download/setDownloadFileAction',
    async (data, { dispatch }) => {
        dispatch(setDownloadFile(data))
    }
)

export const setDownloadProgressAction = createAsyncThunk('download/setDownloadProgressAction',
    async (data, { dispatch }) => {
        let { id, progress } = data
        dispatch(setDownloadProgress({ id, progress }))
    }
)

export const processedFileAction = createAsyncThunk('download/processedFileAction',
    async (id, { dispatch }) => {
        dispatch(processedDownloadFile(id))
    }
)

export const successDownloadFileAction = createAsyncThunk('download/successDownloadFileAction',
    async (id, { dispatch }) => {
        dispatch(successDownloadFile(id))
    }
)

export const failureDownloadFileAction = createAsyncThunk('download/failureDownloadFileAction',
    async (id, { dispatch }) => {
        dispatch(failureDownloadFile(id))
    }
)

// export const addNewFileAction = createAsyncThunk('folders/addNewFileAction',
//     async (data, { dispatch }) => {
//         dispatch(addNewFile(data))
//     }
// )

// export const fetchWorkflowHistoryAction = createAsyncThunk('folders/fetchWorkflowHistoryAction',
//     async (data, { dispatch }) => {
//         dispatch(fetchWorkflowHistory(data))
//     }
// )

export const retryDownloadAction = createAsyncThunk('download/retryDownloadAction',
    async ({ id, type }, { dispatch, getState }) => {

        dispatch(retryDownloadFile(id))

        const state = getState()
        const redownloadFile = state.download.fileProgress[id]
        if (type == 'single') {
            dispatch(singleFileDownloadAction(redownloadFile))
        }
        else {
            dispatch(bulkFileDownloadAction(redownloadFile))
        }
    }
)

//parallel
export const singleFileDownloadAction = createAsyncThunk(
    'download/singleFileDownloadAction',
    async (item, { dispatch }) => {

        let urlString = `${process.env.REACT_APP_BE_URL}/file/readFile`;

        dispatch(processedFileAction(item?.id))

        return axios({
            url: urlString,
            method: 'post',
            data: { fileId: item.file },
            responseType: "blob",
            cancelToken: item?.cancelSource?.token,
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.total && progressEvent.total > 0) {
                    const { loaded, total } = progressEvent;
                    let percentageProgress = Math.floor((loaded / total) * 100);

                    dispatch(setDownloadProgressAction({ id: item?.id, progress: percentageProgress }));
                }
            },
        })
            .then((response) => {
                const { data } = response;

                if (data) {
                    const url = window.URL.createObjectURL(new Blob([data]));
                    const link = document.createElement("a");
                    link.href = url;
                    const filename = `${item?.fileName}.${item?.extension}`;
                    link.setAttribute("download", filename);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);

                    dispatch(setDownloadProgressAction({ id: item?.id, progress: 100 }));
                    dispatch(successDownloadFileAction(item?.id))
                }
            })
            .catch((err) => {
                toast.error(`An Error Occurred While Downloading - ${err}`)
                console.error('An Error Occurred While Downloading -', err)
                dispatch(setDownloadProgressAction({ id: item?.id, progress: 0 }))
                dispatch(failureDownloadFileAction(item?.id))
            });
    }
);

export const bulkFileDownloadAction = createAsyncThunk(
    'download/bulkFileDownloadAction',
    (item, { dispatch }) => {
        let urlString = `${process.env.REACT_APP_BE_URL}/documentzipdownload`;

        dispatch(processedFileAction(item?.id))

        return axios({
            url: urlString,
            method: 'post',
            data: { files: item.file, folders: item.folder },
            responseType: "arraybuffer",
            cancelToken: item?.cancelSource?.token,
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.total && progressEvent.total > 0) {
                    const { loaded, total } = progressEvent;
                    let percentageProgress = Math.floor((loaded / total) * 100);

                    dispatch(setDownloadProgressAction({ id: item?.id, progress: percentageProgress }));
                }
            },
        })
            .then((response) => {
                const { data } = response;

                if (data) {
                    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/zip' }));
                    const link = document.createElement("a");
                    link.href = url;

                    const contentDisposition = response.headers['content-disposition'];
                    const zipName = contentDisposition ? contentDisposition.split('=')[1] : 'download.zip';

                    link.setAttribute("download", zipName);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);

                    dispatch(setDownloadProgressAction({ id: item?.id, progress: 100 }));
                    dispatch(successDownloadFileAction(item?.id));
                }
            })
            .catch((err) => {
                toast.error(`An Error Occurred While Downloading - ${err}`);
                console.error('An Error Occurred While Downloading -', err);
                dispatch(setDownloadProgressAction({ id: item?.id, progress: 0 }));
                dispatch(failureDownloadFileAction(item?.id));
            });
    }
);
