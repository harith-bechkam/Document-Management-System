import React, { useMemo } from 'react'
import { STATUS_UPLOAD } from '../../../../redux/upload/constants'

const UploadItem = props => {
    const { file, progress, cancelSource, status } = props.file

    const renderIcon = useMemo(() => {
        const cancelUpload = () => {
            cancelSource.cancel('Cancelled by user')
        }

        if (status == STATUS_UPLOAD.uploading) {
            return (
                <span
                    title="Cancel upload"
                    style={{ color: 'red', cursor: "pointer" }}
                    onClick={cancelUpload}
                >
                    ✕
                </span>
            )
        } else if (status == STATUS_UPLOAD.success) {
            return (
                <span
                    title="Success upload"
                    style={{ color: 'green', cursor: 'pointer' }}
                >
                    ✓
                </span>
            )
        } else if (status == STATUS_UPLOAD.failed) {
            return (
                <span
                    title="Retry upload"
                    style={{ color: 'orange', cursor: "pointer" }}
                    onClick={props.retryUpload}
                >
                    ↩︎
                </span>
            )
        }

        return null
    }, [status])

    return (
        <div className="wrapperItem">
            <div className="leftSide">
                <label>{file?.name}</label>
                <div className="progressBar">
                    <div style={{ width: `${progress}%` }} />
                </div>
            </div>
            <div className="rightSide">
                {renderIcon}
                <span>{progress}%</span>
            </div>
        </div>
    )
}

export default UploadItem;