import { configureStore } from '@reduxjs/toolkit';
import folderReducer from './folderSlice';
import uploadReducer from './upload/uploadSlice';
import downloadReducer from './download/downloadSlice';

//file  - non-serializable value
const store = configureStore({
  reducer: {
    folders: folderReducer,
    upload: uploadReducer,
    download: downloadReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {

        ignoredActions: [
          //upload
          'upload/setUploadFile', 'upload/uploadFileAction', 'upload/uploadFileAction/fulfilled', 'upload/uploadFileAction/pending'
          , 'upload/retryUploadAction', 'upload/setUploadProgressAction', 'upload/setUploadFileAction', 'folders/addNewFileAction',

          //download
          'download/setUploadFile', 'download/uploadFileAction', 'download/uploadFileAction/fulfilled', 'download/uploadFileAction/pending'
          , 'download/retryDownloadAction', 'download/setDownloadProgressAction', 'download/setDownloadFileAction'
        ],

        ignoredActionPaths: ['meta.arg', 'payload.timestamp',
          //upload
          'upload/retryUploadAction', 'upload/setUploadProgressAction', 'upload/setUploadFileAction', 'folders/addNewFileAction',

          //download
          'download/retryDownloadAction', 'download/setDownloadProgressAction', 'download/setDownloadFileAction'
        ],

        ignoredPaths: [
          //upload
          'upload.fileProgress', 'upload.fileProgress.file',

          //download
          'download.fileProgress', 'download.fileProgress.file',
        ],

      },
    })

})

export default store;
