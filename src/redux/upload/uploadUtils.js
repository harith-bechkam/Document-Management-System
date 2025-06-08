import axios from 'axios'
import { size } from 'lodash'
import { STATUS_UPLOAD } from './constants'

export const modifyFiles = (existingFiles, files) => {
    let fileToUpload = {}

    for (let i = 0; i < files.length; i++) {
        const id = size(existingFiles) + i + 1
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        fileToUpload = {
            ...fileToUpload,
            [id]: {
                id,
                file: files[i]?.['file'],
                progress: 0,
                isProcessed: false,
                cancelSource: source,
                status: STATUS_UPLOAD.uploading,

                sectionId: files[i]['sectionId'],
                folderId: files[i]['folderId'],
                defaultMetaData: files[i]['defaultMetaData'],
                custmetafield: files[i]['custmetafield'],
                metadataMode: files[i]['metadataMode'] || 'skip',
                metaOperation: files[i]['metaOperation'] || false,
                APIType: files[i]['APIType']
            }
        }
    }

    return fileToUpload
}
