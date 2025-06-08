import React, { useEffect, useRef, useState } from 'react'
import { size, toArray } from 'lodash'
import { useSelector, useDispatch } from 'react-redux'
import { retryUploadAction, uploadFileAction } from '../../../../redux/upload/uploadAction'
import UploadItem from './UploadItem'
import { Icon } from '../../../../components/Component'
import { saveVisible, setEmptyFilesProgress, toggleMinimize } from '../../../../redux/upload/uploadSlice'
import toast from 'react-hot-toast'
import { setEmptyFilesDownloadProgress, toggleDownloadMinimize } from '../../../../redux/download/downloadSlice'
import DownloadItem from './DownloadItem'
import { bulkFileDownloadAction, retryDownloadAction, singleFileDownloadAction } from '../../../../redux/download/downloadAction'
import { Nav, NavItem, NavLink, Progress, TabContent, TabPane, Tooltip } from 'reactstrap'
import classnames from "classnames";


const UploadProgress = () => {
    const dispatch = useDispatch()

    const uploadStore = useSelector((state) => state.upload)
    const uploadedFileAmount = size(uploadStore.fileProgress);
    const [uploadComplete, setUploadComplete] = useState(false);
    const uploadItemsWrapperRef = useRef(null)
    const [isUserScrolling, setIsUserScrolling] = useState(false)

    const [fileCount, setFileCount] = useState(0);
    const [totalFileCount, setTotalFileCount] = useState(0);
    const [tooltipOpen, setTooltipOpen] = useState({});
    const toolTipToggle = (id) => {
        setTooltipOpen((prevState) => ({
            ...prevState,
            [id]: !prevState[id],
        }));
    };
    const [showRetryAllIcon, setShowRetryAllIcon] = useState(false);

    //download
    const downloadStore = useSelector((state) => state.download)
    const downloadFileAmount = size(downloadStore.fileProgress);
    const [downloadComplete, setDownloadComplete] = useState(false);
    const downloadItemsWrapperRef = useRef(null)
    const [isUserScrollingDownload, setIsUserScrollingDownload] = useState(false)
    const [showdownloadRetryAllIcon, setShowdownloadRetryAllIcon] = useState(false);
    const [filedownCount, setFileCountdown] = useState(0);
    const [totalFileCountdown, setTotalFileCountdown] = useState(0);

    //tabs
    const [selectedType1, setSelectedType1] = useState("All");//upload
    const [selectedType, setSelectedType] = useState("All");//download

    useEffect(() => {
        const fileToUpload = toArray(uploadStore.fileProgress).filter((file) => file.progress == 0 && file?.isProcessed == false)
        if (fileToUpload.length > 0) {
            dispatch(uploadFileAction(fileToUpload))
        }


        const fileToDownload = toArray(downloadStore.fileProgress).filter((file) => file.progress == 0 && file?.isProcessed == false)

        if (fileToDownload.length > 0) {

            for (let item of fileToDownload) {
                if (item['type'] == 'single') {
                    dispatch(singleFileDownloadAction(item))
                }
                else {
                    dispatch(bulkFileDownloadAction(item))
                }
            }
        }

    }, [
        uploadedFileAmount,
        downloadFileAmount,
        dispatch
    ])

    useEffect(() => {
        if (!isUserScrolling && uploadItemsWrapperRef.current) {
            uploadItemsWrapperRef.current.scrollTop = uploadItemsWrapperRef.current.scrollHeight
        }

        if (Object.keys(uploadStore.fileProgress).length != 0 &&
            Object.values(uploadStore.fileProgress).every(elem => elem.status == 1)
        ) {
            // debugger
            setUploadComplete(true);
        }



        const hasFailedUploads = Object.values(uploadStore.fileProgress).some(elem => elem.status == 2)
        setShowRetryAllIcon(hasFailedUploads && Object.keys(uploadStore.fileProgress).length != 0)


        const fileKeys = Object.keys(uploadStore.fileProgress);
        setTotalFileCount(fileKeys.length);

        const completedFiles = fileKeys.filter(key => uploadStore.fileProgress[key].status === 1).length;
        setFileCount(completedFiles);



        //download
        let downfileKeys = Object.keys(downloadStore.fileProgress)
        setTotalFileCountdown(downfileKeys.length)

        let completedFiles2 = downfileKeys.filter(key => downloadStore.fileProgress[key].status === 1).length
        setFileCountdown(completedFiles2)


        const hasFailedDownloads = Object.values(downloadStore.fileProgress).some(elem => elem.status == 2)
        setShowdownloadRetryAllIcon(hasFailedDownloads && Object.keys(downloadStore.fileProgress).length != 0)

        if (!isUserScrollingDownload && downloadItemsWrapperRef.current) {
            downloadItemsWrapperRef.current.scrollTop = downloadItemsWrapperRef.current.scrollHeight
        }

        if (Object.keys(downloadStore.fileProgress).length != 0 &&
            Object.values(downloadStore.fileProgress).every(elem => elem.status == 1)
        ) {
            setDownloadComplete(true)
        }

    }, [
        uploadStore.fileProgress,
        downloadStore.fileProgress
    ])

    const handleScroll = () => {
        if (uploadItemsWrapperRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = uploadItemsWrapperRef.current

            if (scrollTop + clientHeight < scrollHeight - 10) {
                setIsUserScrolling(true)
            } else {
                setIsUserScrolling(false)
            }
        }
    }
    const handleDownloadScroll = () => {
        if (downloadItemsWrapperRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = downloadItemsWrapperRef.current

            if (scrollTop + clientHeight < scrollHeight - 10) {
                setIsUserScrollingDownload(true)
            } else {
                setIsUserScrollingDownload(false)
            }
        }
    }

    const handleUploadClose = (e) => {
        e.preventDefault()

        const data = { ...uploadStore.fileProgress }
        const hasStatusZero = Object.values(data).some((item) => item.status === 0)

        if (hasStatusZero) {
            toast(`Files are Uploading. Please wait...`, { icon: '⚠️' })
            return
        }

        dispatch(setEmptyFilesProgress())
    }

    const handleDownloadClose = (e) => {
        e.preventDefault()

        const data = { ...downloadStore.fileProgress }
        const hasStatusZero = Object.values(data).some((item) => item.status == 0)

        if (hasStatusZero) {
            toast(`Files are Downloading. Please wait...`, { icon: '⚠️' })
            return
        }

        dispatch(setEmptyFilesDownloadProgress())
    }

    async function retryAllDocuments(e) {
        e.preventDefault();

        const attemptedDocs = { ...uploadStore.fileProgress }
        const failedDocuments = Object.values(attemptedDocs).filter((item) => item.status == 2)

        if (failedDocuments.length > 0) {
            for (let elem of failedDocuments) {
                dispatch(retryUploadAction(elem?.id))
            }
        }
    }

    async function downloadretryAllDocuments(e) {
        e.preventDefault();

        const attemptedDocs = { ...downloadStore.fileProgress }
        const failedDocuments = Object.values(attemptedDocs).filter((item) => item.status == 2)

        if (failedDocuments.length > 0) {
            for (let elem of failedDocuments) {
                dispatch(retryDownloadAction({ id: elem?.id, type: elem?.type }))
            }
        }
    }



    const navtoggle = (type) => {
        setSelectedType(type);
    };

    const navtoggle1 = (type) => {
        setSelectedType1(type);
    };

    const filteredDownloadFiles = toArray(downloadStore.fileProgress)?.filter((file) => {

        if (selectedType == "All") return true;
        if (selectedType == "Downloading") return file.status == 0
        if (selectedType == "Success") return file.status == 1
        if (selectedType == "Failed") return file.status == 2

        return file.type == selectedType
    })

    const filteredUploadFiles = toArray(uploadStore.fileProgress)?.filter((file) => {

        if (selectedType1 == "All") return true;
        if (selectedType1 == "Uploading") return file.status == 0
        if (selectedType1 == "Success") return file.status == 1
        if (selectedType1 == "Failed") return file.status == 2

        return file.type == selectedType1
    })

    return uploadedFileAmount > 0 || downloadFileAmount > 0 ?
        (
            <div className='uploadcontainer'>
                <div className='d-flex flex-row-reverse align-items-end'>

                    {uploadedFileAmount > 0 && (
                        <div className={`uploadWrapper ${uploadStore.isMinimized ? 'collapsed' : 'expanded'}`}>
                            <h5 className="uploadHeader">
                                {uploadComplete
                                    ? `Uploaded ${fileCount}/${totalFileCount} File${uploadedFileAmount >= 2 ? 's' : ''}`
                                    : `Uploading ${fileCount}/${totalFileCount} File${uploadedFileAmount >= 2 ? 's' : ''}`}
                                {showRetryAllIcon && <>
                                    <Icon
                                        title={'Retry All'}
                                        onClick={e => retryAllDocuments(e)}
                                        style={{ cursor: 'pointer', marginLeft: 'auto' }}
                                    >↩︎</Icon>
                                    {/* <Tooltip
                                        placement="top"
                                        isOpen={tooltipOpen['RetryAll'] || false}
                                        target={'RetryAll'}
                                        toggle={() => toolTipToggle('RetryAll')}
                                    >
                                        {'Retry All'}
                                    </Tooltip> */}
                                </>}
                                <Icon
                                    title={uploadStore.isMinimized ? 'Maximize' : 'Minimize'}
                                    name={uploadStore.isMinimized ? 'chevron-up-circle' : 'chevron-down-circle'}
                                    onClick={() => dispatch(toggleMinimize())}
                                    style={{ cursor: 'pointer', marginLeft: showRetryAllIcon ? '.3rem' : 'auto' }}
                                />
                                {/* <Tooltip
                                    placement="top"
                                    isOpen={tooltipOpen['minandmax'] || false}
                                    target={'minandmax'}
                                    toggle={() => toolTipToggle('minandmax')}
                                >
                                    {uploadStore.isMinimized ? 'Maximize' : 'Minimize'}
                                </Tooltip> */}
                                <Icon
                                    title={'close'}
                                    name="cross-circle"
                                    onClick={handleUploadClose}
                                    style={{ cursor: 'pointer', marginLeft: '.3rem' }}
                                />
                                {/* <Tooltip
                                    placement="top"
                                    isOpen={tooltipOpen['close'] || false}
                                    target={'close'}
                                    toggle={() => toolTipToggle('close')}
                                >
                                    {'Close'}
                                </Tooltip> */}
                            </h5>
                            {/* <Progress
                                // className="my-2"
                                value={(fileCount / totalFileCount) * 100}
                            >
                                {fileCount}/{totalFileCount}
                            </Progress> */}
                            {!uploadStore.isMinimized && (
                                <div className="uploadItemsWrapper"
                                    // ref={uploadItemsWrapperRef} onScroll={handleScroll}
                                    >

                                    <Nav tabs>
                                        {["All", "Uploading", "Success", "Failed"]?.map((type) => (
                                            <NavItem key={type} className="px-2">
                                                <NavLink
                                                    style={{ padding: 0 }}
                                                    tag="a"
                                                    href="#tab"
                                                    className={classnames({ active: selectedType1 == type })}
                                                    onClick={(ev) => {
                                                        ev.preventDefault();
                                                        navtoggle1(type);
                                                    }}
                                                >
                                                    {type}
                                                </NavLink>
                                            </NavItem>
                                        ))}
                                    </Nav>

                                    <TabContent activeTab={selectedType1} style={{ marginTop: 0 }}>
                                        <TabPane tabId={selectedType1}>
                                            <div className="uploadItemsWrapper">
                                                {filteredUploadFiles.length == 0 ? (
                                                    <center>No Items available</center>
                                                ) : (
                                                    filteredUploadFiles?.map((file) => (
                                                        <UploadItem
                                                            key={file?.id}
                                                            file={file}
                                                            retryUpload={() => dispatch(retryUploadAction(file?.id))}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        </TabPane>
                                    </TabContent>
                                </div>
                            )}
                        </div>
                    )}



                    {/* Download */}
                    {downloadFileAmount > 0 && (
                        <div className={`uploadWrapper ${downloadStore.isMinimized ? 'collapsed' : 'expanded'}`}>
                            <h5 className="uploadHeader">
                                {downloadComplete
                                    ? `Downloaded ${filedownCount}/${totalFileCountdown} Item${downloadFileAmount >= 2 ? 's' : ''}`
                                    : `Downloading ${filedownCount}/${totalFileCountdown} Item${downloadFileAmount >= 2 ? 's' : ''}`
                                }

                                {showdownloadRetryAllIcon &&
                                    <>
                                        <Icon
                                            title={'Retry All'}
                                            onClick={e => downloadretryAllDocuments(e)}
                                            style={{ cursor: 'pointer', marginLeft: 'auto' }}
                                        >↩︎</Icon>
                                        {/* <Tooltip
                                        placement="top"
                                        isOpen={tooltipOpen['downloadretryall'] || false}
                                        target={'downloadretryall'}
                                        toggle={() => toolTipToggle('downloadretryall')}
                                    >
                                        {'Retry All'}
                                    </Tooltip> */}
                                    </>
                                }

                                <Icon
                                    title={downloadStore.isMinimized ? 'Maximize' : 'Minimize'}
                                    name={downloadStore.isMinimized ? 'chevron-up-circle' : 'chevron-down-circle'}
                                    onClick={() => dispatch(toggleDownloadMinimize())}
                                    style={{ cursor: 'pointer', marginLeft: showdownloadRetryAllIcon ? '.3rem' : 'auto' }}
                                />
                                {/* <Tooltip
                                    placement="top"
                                    isOpen={tooltipOpen['downloadminandmax'] || false}
                                    target={'downloadminandmax'}
                                    toggle={() => toolTipToggle('downloadminandmax')}
                                >
                                    {downloadStore.isMinimized ? 'Maximize' : 'Minimize'}
                                </Tooltip> */}

                                <Icon
                                    title={"Close"}
                                    name="cross-circle"
                                    onClick={handleDownloadClose}
                                    style={{ cursor: 'pointer', marginLeft: '.3rem' }}
                                />
                                {/* <Tooltip
                                    placement="top"
                                    isOpen={tooltipOpen['downloadclose'] || false}
                                    target={'downloadclose'}
                                    toggle={() => toolTipToggle('downloadclose')}
                                >
                                    {'Close'}
                                </Tooltip> */}

                            </h5>
                            {!downloadStore.isMinimized && (
                                <div className="uploadItemsWrapper" 
                                    // ref={downloadItemsWrapperRef} onScroll={handleDownloadScroll}
                                    >

                                    <Nav tabs>
                                        {["All", "Downloading", "Success", "Failed"]?.map((type) => (
                                            <NavItem key={type} className="px-2">
                                                <NavLink
                                                    style={{ padding: 0 }}
                                                    tag="a"
                                                    href="#tab"
                                                    className={classnames({ active: selectedType == type })}
                                                    onClick={(ev) => {
                                                        ev.preventDefault();
                                                        navtoggle(type);
                                                    }}
                                                >
                                                    {type}
                                                </NavLink>
                                            </NavItem>
                                        ))}
                                    </Nav>

                                    <TabContent activeTab={selectedType}>
                                        <TabPane tabId={selectedType}>
                                            <div className="uploadItemsWrapper">
                                                {filteredDownloadFiles.length == 0 ? (
                                                    <center>No Items available</center>
                                                ) : (
                                                    filteredDownloadFiles?.map((file) => (
                                                        <DownloadItem
                                                            key={file?.id}
                                                            file={file}
                                                            fileName={file?.type == "single" ? `${file?.fileName}.${file.extension}` : file?.fileName}
                                                            retryDownload={() => {
                                                                console.log(file, "filefile")
                                                                dispatch(retryDownloadAction({ id: file?.id, type: file?.type }))
                                                            }}
                                                            progress={file?.progress}
                                                            status={file?.status}
                                                            type={file?.type}
                                                            extension={file?.extension}
                                                        />
                                                    ))
                                                )}
                                            </div>
                                        </TabPane>
                                    </TabContent>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        ) : null;


}

export default UploadProgress
