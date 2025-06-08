import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router';
import * as API from '../../../../utils/API';
import Logo from '../../../../layout/logo/Logo';
import logo from '../../../../images/logo1.jpeg'
import toast from 'react-hot-toast';
import Comments from '../../../admin/Workflow/Support/comments/Comments';
import { updateLoaderFlag } from '../../../../redux/folderSlice';
import { useDispatch } from "react-redux"
import { Spinner } from 'reactstrap';
import { getFileType, getOnlyOfficeDocumentType } from '../../../../utils/helper';
import Swal from 'sweetalert2';

const BACKEND_URL = `${process.env.REACT_APP_BE_URL}` //"http://106.51.7.59:3100"


function FileEdit() {
    const location = useLocation();
    let { workflowHisId } = useParams()
    const [reinit,setReinit]=useState(0);
    const [hisData, setHisData] = useState(null)
    const [comments, setComments] = useState([]);
    const [showWarning,setShowWarning]=useState(false);
    const [warningmessage,setWarningmessage]=useState("");
    const dispatch = useDispatch()

    const [isLoading, setIsLoading] = useState({ status: false, text: "" })
    const handleOnline = () => {
        console.log("Connection restored. Reloading component...");
        setReinit(prevKey => prevKey + 1); // Update key to force re-render
    };
    useEffect(() => {
        getFileDetails();
        toast.remove();
        window.addEventListener("online", handleOnline);
        //window.addEventListener("beforeunload",handleClose);
        return () => {
            window.removeEventListener("online", handleOnline);
            //window.removeEventListener("beforeunload",handleClose);
            toast.remove()
        }
    }, [reinit])

    async function getFileDetails() {
        const fileHistoryData = await API.getWorkflowHistoryUsingHistoryId(workflowHisId);

        
        if (fileHistoryData?.status) {
            setHisData(fileHistoryData?.data)
            setComments(fileHistoryData?.data?.comments)
        }

        const user = JSON.parse(localStorage.getItem('user'));
        const redirectUrl = `${window.location.origin}/#/${localStorage.getItem("workspace_id")}/workflow/detail/File/${fileHistoryData?.data?.fileId}/${fileHistoryData?.data?._id?.toString()}`

        const fileInfoData = fileHistoryData?.data;
        document.title = fileInfoData?.currStorageInfo?.fileName;
        let storageInfo=fileInfoData?.storageInfo;
        let version=1;
        let prevsource="";
        /*for(let item of storageInfo){
            for(let s of item["storageInfo"]){
                if(typeof s["updatedSource"]!=="undefined"){
                    if(prevsource!="" && prevsource!=s["updatedSource"]){
                        version++;
                        prevsource=s["updatedSource"];
                    }else if(prevsource=="" && s["updatedSource"]!=""){
                        prevsource=s["updatedSource"];
                    }
                }
            }
        }
        version--;*/
        for(let item of storageInfo){
            for(let s of item["storageInfo"]){
                if(typeof s["updatedSource"]!=="undefined"){
                    version++;
                }
            }
        }

        let documentType = 'word'
        documentType = await getOnlyOfficeDocumentType(fileInfoData?.currStorageInfo?.ext.toLowerCase())


        // if (fileInfoData?.currStorageInfo?.ext == 'docx') {
        //     documentType = 'word'
        // } else if (fileInfoData?.currStorageInfo?.ext == 'xlsx') {
        //     documentType = 'cell'
        // } else if (fileInfoData?.currStorageInfo?.ext == 'pptx') {
        //     documentType = 'slide'
        // } else if (fileInfoData?.currStorageInfo?.ext == 'pdf') {
        //     documentType = 'pdf'
        // }
        const timestamp = new Date().getTime(); // Generate current timestamp
        console.log(`${fileInfoData['_id']}_${fileInfoData['fileId']}_${fileInfoData?.currentStepInfo?.id}_${version}`);
        console.log(`${BACKEND_URL}/workflow/file/documents/${workflowHisId}/${localStorage.getItem("workspace_id")}`)
        console.log(`${fileInfoData['_id']}_${fileInfoData['fileId']}_${fileInfoData?.currentStepInfo?.id}`)
        const config = {
            "document": {
                "fileType": fileInfoData?.currStorageInfo?.ext,
                "key": `${fileInfoData['_id']}_${fileInfoData['fileId']}_${fileInfoData?.currentStepInfo?.id}_${version}`,
                "title": fileInfoData?.currStorageInfo?.fileName,
                "url": `${BACKEND_URL}/workflow/file/documents/${workflowHisId}/${localStorage.getItem("workspace_id")}?t=${timestamp}`,
                "version": "8.2.2.23",
                "permissions": {
                    "print": true,
                    "edit": fileHistoryData?.data?.canShowBtn?.status ? true : false,
                    "comment": true,
                },
            },
            "documentType": documentType,
            "editorConfig": {
                "coEditing": {
                    "mode": "fast",  // Change this to "fast" if needed
                    "change": false
                },
                "callbackUrl": `${BACKEND_URL}/workflow/onlyofficecallback/${localStorage.getItem("workspace_id")}`,
                "customization": {
                    "autosave": true,
                    "compactMode":false,
                    "anonymous": {
                        "request": true,
                        "label": "Guest"
                    },
                    "close": {
                        "visible": true,
                        "text": "Close & Save file"
                    },
                    "comments": true,
                    "customer": {
                        "logo": 'https://api.onlyoffice.com/content/img/docbuilder/examples/blue_cloud.png',
                        "logoDark": "https://api.onlyoffice.com/content/img/docbuilder/examples/user-profile.png",
                        "mail": user.email,
                        "name": user.userName,
                        "www": redirectUrl
                    },
                    "features": {
                        "roles": true,
                        "spellcheck": {
                            "mode": true
                        }
                    },
                    /*"goback": {
                        "blank": false,
                        "text": "Save & Close File",
                        "url": redirectUrl
                    },*/
                    "forcesave": true,
                    "help": true,
                    "hideNotes": false,
                    "hideRightMenu": true,
                    "hideRulers": false,
                    "integrationMode": "inline",
                    "logo": {
                        "image": "https://ikomet.idoks.ai/static/media/logo2x.4c5ecef1ef62c40807a5.png",
                        "imageDark": "https://ikomet.idoks.ai/static/media/logo2x.4c5ecef1ef62c40807a5.png",
                        "url": redirectUrl,
                        "visible": true
                    },
                    "uiTheme": "theme-classic-light",
                    "zoom": 100
                },
                "lang": "en",
                "location": "us",
                "user": {
                    "group": "iDoks",
                    "id": user._id,
                    "image": user.imgUrl,
                    "name": user.userName
                },
                "canCoAuthoring": true,
                "canUseHistory": true,
                "canHistoryClose": true,
                "canHistoryRestore": true,
                "canSendEmailAddresses": false,
                "canRequestEditRights": false,
                "canRequestClose": true,
                "canRename": false,
                "canMakeActionLink": false,
                "canRequestUsers": false,
                "canRequestSendNotify": false,
                "canRequestSaveAs": false,
                "canRequestInsertImage": false,
                "canRequestMailMergeRecipients": false,
                "canRequestCompareFile": false,
                "canRequestSharingSettings": false,
                "canRequestCreateNew": false,
                "canRequestReferenceData": false,
                "canRequestOpen": false,
                "canRequestSelectDocument": false,
                "canRequestSelectSpreadsheet": false,
                "canRequestReferenceSource": false,
                "canSaveDocumentToBinary": false,
                "canStartFilling": false
            },
            "events": {
                "onRequestClose": function () {
                    setIsLoading({ status: true, text: "Closing your Session. Please Wait..." })

                    if (docWorkflowEditor != null) {
                        docWorkflowEditor.destroyEditor();
                    }

                    setTimeout(() => {

                        setIsLoading({ status: false, text: "" })
                        window.close();
                        // window.location.href = redirectUrl;
                        docWorkflowEditor = null;

                        return;
                    }, 8000)


                },
                "onDocumentReady": function () {
                    document.getElementById("navId").classList.remove("hide");
                },"onWarning": function(event) {
                    console.log(`ONLYOFFICE Document Editor reports a warning: code ${event.data.warningCode}, description ${event.data.warningDescription}`);
                    /*setShowWarning(true);
                    Swal.fire({
                        title: `Warning!`,
                        html:`${event.data.warningDescription}`,
                        icon: "warning",
                        showCancelButton: false,
                        confirmButtonText: "Okay",
                      }).then(async (result) => {
                        if (result.isConfirmed) {
                            window.location.reload()
                        }
                      });
                    setWarningmessage(event.data.warningDescription);*/
                },"onError": function(event) {
                    console.log(`ONLYOFFICE Document Editor reports a Error: code ${event.data.errorCode}, description ${event.data.errorDescription}`);
                    /*setShowWarning(true);
                    Swal.fire({
                        title: `Warning!`,
                        html:`${event.data.errorDescription}`,
                        icon: "warning",
                        showCancelButton: false,
                        confirmButtonText: "Okay",
                      }).then(async (result) => {
                        if (result.isConfirmed) {
                            window.location.reload()
                        }
                      });
                    setWarningmessage(event.data.warningDescription);*/
                },"onOutdatedVersion":function(){
                    setReinit(prevKey => prevKey + 1);
                    //window.location.reload()
                },"onRequestRefreshFile":function(){
                    //window.location.reload()
                    setReinit(prevKey => prevKey + 1);
                }
                // "onRequestClose": function () {
                //     debugger;
                // }
            },
            "height": "100%",
            "type": "desktop",
            "width": "100%",
        }

        docWorkflowEditor = new DocsAPI.DocEditor("docWorkflowEditor", config);
        // console.log(config, 'test-config');
    }

    const toggleComment = () => {
        if (document.getElementById("navId").classList.contains("open") == true) {
            document.getElementById("navId").classList.remove("open");
            document.getElementById("commentnav").classList.add("hide");
            document.getElementById("navId").style.color = '';
        }
        else {
            document.getElementById("navId").classList.add("open");
            document.getElementById("commentnav").classList.remove("hide");
            document.getElementById("navId").style.color = '#000';
        }
    }



    const statusChange = async (hisId, role, fileId, stat) => {
        dispatch(updateLoaderFlag({ loader: true, text: 'Loading...' }))
        let statusRedposen = await API.changeStatus(hisId, role, fileId, stat, 'file')
        dispatch(updateLoaderFlag({ loader: false, text: '' }))

        let { status, message, isCurrStepCompleted, isLastStepCompleted } = statusRedposen

        if (!status) {
            return toast.error('Status Not Changed')
        }

        if (stat == 'Approved' || stat == 'Rejected') {
            navigate('/workflowPendings')
            if (isCurrStepCompleted && isLastStepCompleted) {
                toast.success(`Workflow Completed and File Published`, { duration: 120000 })
            }
        }
    }

    const handleComments = async (newComment) => {
        let latestComment = newComment

        // setIsLoading({ status: true, text: "Updating Comments. Please Wait..." })
        if (hisData?.['canShowBtn']?.['status']) {
            await statusChange(hisData['_id'], hisData?.['canShowBtn']?.['role'], hisData['fileId'], 'IP')
        }
        let { status, message } = await API.setWorkflowComments(hisData['fileId'], hisData['_id'].toString(), latestComment, hisData['currentStepInfo']['id'], hisData['currentStepInfo']['stepName'], "file")
        if (!status) {
            return toast.error(`${message || 'Error Occured Inserting New Comment'}`.replace(/\b\w/g, char => char.toUpperCase()))
        }
        // setIsLoading({ status: false, text: "" })

    }

    return (
        (!showWarning)?
        <>
            <div style={{ height: '100vh', overflow: 'hidden' }}>

                {isLoading['status'] && (
                    <div className="editorLoaderBackground">
                        <div className="editorLoader">
                            <Spinner size="md" />&nbsp; {isLoading['text']}
                        </div>
                    </div>
                )}
                <span id="navId" className='hide' onClick={toggleComment}> <em class="icon ni ni-chat" /></span>
                <div id="docWorkflowEditor" style={{ width: "100%", height: "100%" }}></div>
            </div>

            <div id="commentnav" className='hide'>
                {hisData &&
                    <Comments
                        currentUserId={localStorage.getItem('userId')}
                        data={comments}
                        fileId={hisData['fileId']}
                        historyId={hisData['_id']}
                        stepId={hisData['currentStepInfo']['id']}
                        type={"file"}
                        setdata={async (data) => {
                            await handleComments(data)
                            setComments(data)
                        }}
                    />
                }
            </div>
        </>:
        <></>
    )
}

export default FileEdit;
