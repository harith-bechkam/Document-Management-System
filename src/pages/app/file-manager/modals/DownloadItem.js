import React, { useMemo } from 'react'
import { STATUS_UPLOAD } from '../../../../redux/upload/constants'

const DownloadItem = props => {
    const { file, fileName, progress, cancelSource, status, type, extension } = props

    const renderIcon = useMemo(() => {
        const cancelDOwnload = () => {
            cancelSource.cancel('Download Cancelled by user')
        }

        if (status == STATUS_UPLOAD.downloading) {
            return (
                <span
                    title="Cancel Download"
                    style={{ color: 'red', cursor: "pointer" }}
                    onClick={cancelDOwnload}
                >
                    ✕
                </span>
            )
        } else if (status == STATUS_UPLOAD.success) {
            return (
                <span
                    title="Downloaded"
                    style={{ color: 'green', cursor: 'pointer' }}
                >
                    ✓
                </span>
            )
        } else if (status == STATUS_UPLOAD.failed) {
            return (
                <span
                    title="Retry Download"
                    style={{ color: 'orange', cursor: "pointer" }}
                    onClick={props.retryDownload}
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
                <label>{fileName}</label>
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

export default DownloadItem;