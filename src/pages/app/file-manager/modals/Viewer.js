import React, { useEffect, useRef, useState } from "react";
import { Icon } from "../../../../components/Component";
import icons from "../components/Icons";
import ReactPlayer from 'react-player';
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import { Lightbox } from "react-modal-image";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { getFileType } from "../../../../utils/helper";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import parse from 'html-react-parser';
import * as API from '../../../../utils/API';
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { setDownloadFileAction } from "../../../../redux/download/downloadAction";
import { Background } from "reactflow";
import { Button } from "reactstrap";

const Viewer = ({ op, file, toggle, codeContent, videoDuration = 0 }) => {
    const location = useLocation();
    const [open, setOpen] = React.useState(true);
    const params = useParams();
    const dispatch = useDispatch()
    const playerRef = useRef();
    const [isReady, setIsReady] = useState(false);
    const handleAudioReady = () => {
        if (isReady == false && playerRef.current?.audio?.current) {
            setIsReady(true);
            const audio = playerRef.current.audio.current;
            audio.currentTime = videoDuration; // Seek to specified time
            audio.play(); // Start playback
        }
    };
    function render() {
        const docType = getFileType(file.fileType)
        const fileId = (typeof file._id !== "undefined") ? file._id : file.id;
        const workspace_id = (typeof params.workspaceId !== "undefined" && params.workspaceId != null) ? params.workspaceId : localStorage.getItem("workspace_id");
        if (docType == 'video') {
            return <ReactPlayer
                ref={playerRef}
                url={`${process.env.REACT_APP_BE_URL}/file/documents/${fileId}/${workspace_id}`}
                controls={true}
                width="100%"
                height="100%"
                playing={true}
                light={false}
                progressInterval={1000}
                onSeek={(e) => console.log('Seeking to:', e)}
                onEnded={() => console.log('Video ended')}
                onReady={() => {
                    if (isReady == false && playerRef.current && videoDuration > 0) {
                        setIsReady(true);
                        playerRef.current.seekTo(videoDuration, "seconds"); // Seek to converted time
                    }
                }}
                config={{
                    file: {
                        attributes: {
                            preload: 'auto'
                        }
                    }
                }}
            />
        } else if (docType == 'audio') {
            return (
                <AudioPlayer
                    ref={playerRef}
                    volume={0.8}
                    showSkipControls={true}
                    onCanPlay={handleAudioReady}
                    src={`${process.env.REACT_APP_BE_URL}/file/documents/${fileId}/${workspace_id}`}
                />
            )
        } else if (docType == 'code') {
            if (file.fileType == 'txt') {
                return <SyntaxHighlighter language={file.fileType} style={prism}>
                    {codeContent}
                </SyntaxHighlighter>
            }
            else if (file.fileType == 'html') {
                return <>
                    {parse(codeContent)}
                </>
            }
            else {
                return <SyntaxHighlighter language={file.fileType} style={oneDark}>
                    {codeContent}
                </SyntaxHighlighter>
            }
        } else {
            return <div className="unsupported-file">
                <Icon style={{ color: 'orange', fontSize: '65px' }} name={`alert`} />
                {`Unsupported Filetype!`}
                <Button onClick={() => downloadFile(file)} style={{ color: '#fff', background: 'mediumspringgreen' }}>📥 Download!</Button>
            </div>
        }
    }


    const downloadFile = async (file) => {
        // dispatch(updateDownloadLoaderFlag({ loader: true, text: 'Downloading' }))

        if (file.type == 'folder') {
            dispatch(setDownloadFileAction([{ file: [], folder: [file._id], fileName: "Zipping", extension: "", APIType: 'fileDownloadAPI', type: "bulk" }]))
            // await API.bulkDocsDownload([], [file._id])
        }
        else {
            console.log(file, "file")
            dispatch(setDownloadFileAction([{ file: file._id, folder: [], fileName: file.name.split('.')[0], extension: file.fileType, APIType: 'fileDownloadAPI', type: "single" }]))
            // await API.downloadedFile(file._id, file.name.split('.')[0], file.storageInfo["contentType"], file.fileType)
        }
        // dispatch(updateDownloadLoaderFlag({ loader: false, text: '' }))


    };

    function workflowFileRender() {
        const fileId = (typeof file._id !== "undefined") ? file._id : file.id;
        const workspace_id = (typeof params.workspaceId !== "undefined" && params.workspaceId != null) ? params.workspaceId : localStorage.getItem("workspace_id");
        const docType = getFileType(file.fileType)
        if (docType == 'video') {
            return <ReactPlayer
                ref={playerRef}
                url={`${process.env.REACT_APP_BE_URL}/workflow/file/documents/${fileId}/1/${workspace_id}`}
                controls={true}
                width="100%"
                height="100%"
                playing={true}
                light={false}
                progressInterval={1000}
                onSeek={(e) => console.log('Seeking to:', e)}
                onEnded={() => console.log('Video ended')}
                onReady={() => {

                    if (isReady == false && playerRef.current && videoDuration > 0) {
                        setIsReady(true);
                        playerRef.current.seekTo(videoDuration, "seconds"); // Seek to converted time
                    }
                }}
                config={{
                    file: {
                        attributes: {
                            preload: 'auto'
                        }
                    }
                }}
            />
        } else if (docType == 'audio') {
            return (
                <AudioPlayer
                    volume={0.8}
                    showSkipControls={true}
                    autoPlay
                    ref={playerRef}
                    onLoadedMetadata={() => {
                        if (isReady == false && playerRef.current && videoDuration > 0) {
                            setIsReady(true);
                            playerRef.current.audio.current.currentTime = videoDuration; // Seek to time
                            playerRef.current.audio.current.play(); // Play from that time
                        }
                    }}
                    src={`${process.env.REACT_APP_BE_URL}/workflow/file/documents/${fileId}/1/${workspace_id}`}
                />
            )
        } else if (docType == 'code') {
            if (file.fileType == 'txt') {
                return <SyntaxHighlighter language={file.fileType} style={prism}>
                    {codeContent}
                </SyntaxHighlighter>
            }
            else if (file.fileType == 'html') {
                return <>
                    {parse(codeContent)}
                </>
            }
            else {
                return <SyntaxHighlighter language={file.fileType} style={oneDark}>
                    {codeContent}
                </SyntaxHighlighter>
            }
        } else {
            return <div className="unsupported-file">
                <Icon style={{ color: 'orange', fontSize: '65px' }} name={`alert`} />
                {`Unsupported Filetype!`}
                <Button onClick={() => downloadFile(file)} style={{ color: '#fff', background: 'mediumspringgreen' }}>📥 Download!</Button>
            </div>
        }
    }

    return (
        <>
            {op === 'metdataApproval' ? (
                <>
                    <div className="d-flex flex-column h-100">
                        <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
                            <div>
                                <span className="title fw-medium text-truncate d-inline-block" title={file.name}>
                                    {file.name}
                                </span>
                                <div className="nk-file-name-sub">{file.type}</div>
                            </div>
                            <a
                                href="#close"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                    toggle();
                                }}
                                className="close"
                            >
                            </a>
                        </div>
                        <div className="flex-grow-1 overflow-auto">
                            {render()}
                        </div>
                    </div>
                </>
            ) : (
                <React.Fragment>
                    <div className="modal-header align-center justify-content-between">
                        <div className="nk-file-title">
                            <div className="nk-file-name">
                                <div className="nk-file-name-text">
                                    <span className="title">{file.name}</span>
                                </div>
                                <div className="nk-file-name-sub">{file.type}</div>
                            </div>
                        </div>
                        <a
                            href="#close"
                            onClick={(ev) => {
                                ev.preventDefault();
                                toggle();
                            }}
                            className="close"
                        >
                            <Icon name="cross-sm"></Icon>
                        </a>
                    </div>
                    <div className="modal-body video-player">
                        {op !== 'WorkflowFileViewer' ? render() : workflowFileRender()}
                    </div>
                </React.Fragment>
            )}
        </>
    );

};

export default Viewer;
