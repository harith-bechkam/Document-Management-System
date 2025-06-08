import axios from 'axios'
import { size } from 'lodash'
import { STATUS_UPLOAD } from './constants'

export const modifyFiles = (existingFiles, files) => {
    let fileToDownload = {}

    for (let i = 0; i < files.length; i++) {
        const id = size(existingFiles) + i + 1
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()

        fileToDownload = {
            ...fileToDownload,
            [id]: {
                id,
                file: files[i]?.['file'],
                folder: files[i]?.['folder'],
                progress: 0,
                cancelSource: source,
                status: STATUS_UPLOAD.downloading,
                isProcessed:false,
                
                APIType: files[i]['APIType'],
                type: files[i].type,
                fileName: files[i]['fileName'],
                extension: files[i]['extension'],
            }
        }
    }

    return fileToDownload
}
