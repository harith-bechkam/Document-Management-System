import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, Navigate, useNavigate } from 'react-router';
import * as API from '../../../../utils/API';
import Logo from '../../../../layout/logo/Logo';
import logo from '../../../../images/logo1.jpeg'
import toast from 'react-hot-toast';
import Comments from '../../../admin/Workflow/Support/comments/Comments';
import { triggerOpenGraphArgs, updateDocumentUrl, updateLoaderFlag } from '../../../../redux/folderSlice';
import { useDispatch, useSelector } from "react-redux"
import { Spinner } from 'reactstrap';
import Error404Modern from '../../../error/404-modern';
import { getFileType, getOnlyOfficeDocumentType } from '../../../../utils/helper';
import Swal from 'sweetalert2';
import ErrorImage from "../../../../images/gfx/error-404.svg";
import Head from '../../../../layout/head/Head';
import OpenGraphMeta from '../../../../layout/OpenGraph';
import { Helmet } from 'react-helmet-async';
import { Block, BlockContent, Button } from '../../../../components/Component';
import { Link } from 'react-router-dom';

const BACKEND_URL = `${process.env.REACT_APP_BE_URL}` //``


function FileView(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    let fileId = props?.fileId ? props?.fileId : params?.id

    const isLinkClicked = useSelector(state => state.folders.documentUrl);
    const dispatch = useDispatch()
    let fileDetails = {
        fileName: ``,
        desc: ``,
        image: ``,
        url: `${window.location.origin}/#/file/view/${fileId}`,
        type: ``
    }
    let openGraphRef = useRef({
        fileName: ``,
        desc: ``,
        image: ``,
        url: `${window.location.origin}/#/file/view/${fileId}`,
        type: ``
    })
    const [showWarning, setShowWarning] = useState(false);
    const [reinit, setReinit] = useState(0);
    const [warningmessage, setWarningmessage] = useState("");
    const [isLoading, setIsLoading] = useState({ status: true, text: "Closing your Session. Please Wait..." })
    const handleOnline = () => {
        console.log("Connection restored. Reloading component...");
        setReinit(prevKey => prevKey + 1); // Update key to force re-render
    };
    const handleClose = () => {
        if (fileviewerdocEditor != null) {
            fileviewerdocEditor.destroyEditor();
            fileviewerdocEditor = null;
        }
    }
    useEffect(() => {

        getFileDetails();
        dispatch(updateDocumentUrl({
            link: '',
            status: 'remove'
        }))
        toast.remove();
        window.addEventListener("online", handleOnline);
        //window.addEventListener("beforeunload",handleClose);
        return () => {
            window.removeEventListener("online", handleOnline);
            //window.removeEventListener("beforeunload",handleClose);
            toast.remove()
        }
    }, [reinit])

    // Function to get query parameter from URL
    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    async function getFileDetails() {
        let workspace_id = (params.workspace_id != null) ? params.workspace_id : localStorage.getItem("workspace_id");
        var externaluser = {};
        if (!workspace_id) {
            workspace_id = params.workspaceId
        }
        const file = await API.getOnlyOfficeDetails(fileId, workspace_id);

        const externalusertoken = params.externalusertoken;
        const userId = localStorage.getItem('userId');
        var memberTeams = [];
        if (externalusertoken == null) {
            const memberTeamsResponse = await API.getAllGroupsContainingUser();
            memberTeams = memberTeamsResponse.data;
        }
        let editAccess = false;
        let viewAccess = false;
        if (externalusertoken != null) {

            const externaluserinfo = await API.getexternaluserinfo(fileId, params.externalusertoken, workspace_id);
            if (externaluserinfo.status) {
                editAccess = false;
                viewAccess = true;
                externaluser = { "email": externaluserinfo.filepermission.email, "userName": externaluserinfo.filepermission.email }
            } else {
                navigate('/noaccess')
                return;
            }
        }
        else if (file?.data?.data?.createdBy == userId) {
            editAccess = true;
        } else if (file?.data?.data?.sharedWith?.users.some(val => val.user == userId)) {
            const shareStatus = file?.data?.data?.sharedWith.users.find(val => val.user == userId);
            if (shareStatus.access == 'edit') {
                editAccess = true;
            } else if (shareStatus.access == 'view') {
                viewAccess = true;
            }
        } else {
            if (userId) {
                const userGroups = memberTeams;
                const sharedUserGroups = file?.data?.data?.sharedWith?.userGroups || [];
                const isGroupShared = sharedUserGroups?.some(group =>
                    userGroups.some(userGroup =>
                        userGroup._id?.toString() == group.group?.toString()
                    )
                );

                if (isGroupShared) {
                    const groupAccess = sharedUserGroups.find(group =>
                        userGroups.some(userGroup =>
                            userGroup._id?.toString() == group?.group?.toString()
                        )
                    )?.access;
                    if (groupAccess === 'edit') {
                        editAccess = true;
                    } else if (groupAccess === 'view') {
                        viewAccess = true;
                    }
                }
            }
        }

        if (localStorage.getItem('userId')) {
            if (!props?.fileId && editAccess == false && viewAccess == false) {
                navigate('/noaccess')
                return
            }
        }

        var user = JSON.parse(localStorage.getItem('user'));
        if (externalusertoken != null) {
            user = externaluser
        }
        let currentLocation = JSON.parse(localStorage.getItem('currentLocation'));
        if (!currentLocation) {
            currentLocation = `/home`
        }
        const redirectUrl = `${window.location.origin}/#/${workspace_id}${currentLocation}`
        const fileData = file?.data?.data;
        document.title = fileData?.name;
        let version = file.data?.version

        // setFileDetails({
        //     ...fileDetails,
        //     fileName: fileData?.name
        // });

        let documentType = 'word'
        documentType = await getOnlyOfficeDocumentType(fileData?.fileType.toLowerCase())
        if (documentType == 'word') {
            fileDetails["fileName"] = fileData?.name,
                fileDetails["image"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg/120px-Microsoft_Office_Word_%282019%E2%80%93present%29.svg.png"

            openGraphRef.current["fileName"] = fileData?.name,
                openGraphRef.current["image"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg/120px-Microsoft_Office_Word_%282019%E2%80%93present%29.svg.png"

            dispatch(triggerOpenGraphArgs({
                fileName: fileData?.name,
                desc: ``,
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg/120px-Microsoft_Office_Word_%282019%E2%80%93present%29.svg.png",
                url: `${window.location.origin}/#/${workspace_id}/file/view/${params.id}`,
                type: `website`
            }))
        } else if (documentType == 'cell') {
            fileDetails["fileName"] = fileData?.name,
                fileDetails["image"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/120px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png"

            openGraphRef.current["fileName"] = fileData?.name,
                openGraphRef.current["image"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/120px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png"

            dispatch(triggerOpenGraphArgs({
                fileName: fileData?.name,
                desc: ``,
                image: `https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/120px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png`,
                url: `${window.location.origin}/#/${workspace_id}/file/view/${params.id}`,
                type: `website`
            }))
        } else if (documentType == 'pdf') {
            fileDetails["fileName"] = fileData?.name,
                fileDetails["image"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/121px-PDF_file_icon.svg.png"

            openGraphRef.current["fileName"] = fileData?.name,
                openGraphRef.current["image"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/121px-PDF_file_icon.svg.png"

            dispatch(triggerOpenGraphArgs({
                fileName: fileData?.name,
                desc: ``,
                image: `https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/121px-PDF_file_icon.svg.png`,
                url: `${window.location.origin}/#/${workspace_id}/file/view/${params.id}`,
                type: `website`
            }))
        } else if (documentType == 'slide') {
            fileDetails["fileName"] = fileData?.name,
                fileDetails["image"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg/130px-Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg.png"

            openGraphRef.current["fileName"] = fileData?.name,
                openGraphRef.current["image"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg/130px-Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg.png"

            dispatch(triggerOpenGraphArgs({
                fileName: fileData?.name,
                desc: ``,
                image: `https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg/130px-Microsoft_Office_PowerPoint_%282019%E2%80%93present%29.svg.png`,
                url: `${window.location.origin}/#/${workspace_id}/file/view/${params.id}`,
                type: `website`
            }))
        }
        const timestamp = new Date().getTime(); // Generate current timestamp
        // Extract the page number from the URL
        var destinationPage = getQueryParam("destination") || 1; // Default to page 1 if not provided


        //for metadata approval
        if (typeof props?.fileId != "undefined" && props?.fileId) {
            viewAccess = true
            editAccess = false
        }

        const config = {
            "document": {
                "fileType": fileData?.fileType,
                "key": `${fileData._id}_${version}`,
                "title": fileData.name,
                "url": `${BACKEND_URL}/file/documentreader/${fileData._id}/${workspace_id}`,
                "permissions": {
                    "print": true,
                    "edit": editAccess,
                    "comment": true,
                },
            },
            "documentType": documentType,
            "editorConfig": {
                plugins: {
                    autostart: [
                        "asc.{0616AE85-5DBE-4B6B-A0A9-455C4F1503AD}",
                    ],
                    pluginsData: [
                        BACKEND_URL + "/onlyofficeplugins/templates/config.json",
                    ],
                },
                "coEditing": {
                    "mode": "fast",  // Change this to "fast" if needed
                    "change": false
                },
                "callbackUrl": `${BACKEND_URL}/file/onlyofficecallback/${workspace_id}`,
                "customization": {
                    "autosave": true,
                    "compactMode": false,
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
                        "mail": user?.email,
                        "name": user?.userName,
                        "www": redirectUrl
                    },
                    "features": {
                        "roles": true,
                        "spellcheck": {
                            "mode": true
                        }
                    },
                    "forcesave": true,
                    /*"goback": {
                        "blank": false,
                        "text": "Save & Close File",
                        "url": redirectUrl
                    },*/
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
                // "mode": "edit",
                "user": {
                    "group": "iDoks",
                    "id": user?._id,
                    "image": user?.imgUrl,
                    "name": user?.userName
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
                "onRequestClose": function (event) {
                    //setIsLoading({ status: true, text: "Closing your Session. Please Wait..." })
                    //debugger
                    document.getElementById("editorLoaderBackground").classList.remove("hidden");
                    if (fileviewerdocEditor != null) {
                        fileviewerdocEditor.destroyEditor();
                    }

                    setTimeout(() => {
                        setIsLoading({ status: false, text: "" })
                        // window.location.href = redirectUrl;
                        window.close();
                        fileviewerdocEditor = null;
                        return;
                    }, 8000)


                },
                "onDocumentReady": function () {
                    setTimeout(() => {
                        //debugger
                        //fileviewerdocEditor.serviceCommand("goto", 5)
                        //.scrollToPage(destinationPage); // Scroll to extracted page
                    }, 1000); // Small delay for smooth loading
                }, "onWarning": function (event) {
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
                }, "onError": function (event) {
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
                }, "onOutdatedVersion": function () {
                    setReinit(prevKey => prevKey + 1);
                    window.location.reload()
                }, "onRequestRefreshFile": function () {
                    setReinit(prevKey => prevKey + 1);
                    window.location.reload()
                }
            },
            "height": "100%",
            "type": "desktop",
            "width": "100%",
        }
        console.log(config)

        fileviewerdocEditor = new DocsAPI.DocEditor("documentEditor", config);


    }

    return (
        (!showWarning) ?
            <>
                <OpenGraphMeta
                // fileName = {fileDetails.fileName}
                // image = {fileDetails.image}
                // desc = {fileDetails.desc}
                // url = {fileDetails.url}
                // type = {fileDetails.type}

                // fileName={openGraphRef.current?.fileName}
                // image={openGraphRef.current?.image}
                // desc={openGraphRef.current?.desc}
                // url={openGraphRef.current?.url}
                // type={openGraphRef.current?.type}
                />

                {localStorage.getItem("accessToken") && localStorage.getItem('workspace_id') ? <div style={{ height: '100vh', overflow: 'hidden' }}>

                    <div className="editorLoaderBackground hidden" id="editorLoaderBackground">
                        <div className="editorLoader">
                            <Spinner size="md" />&nbsp; {isLoading['text']}
                        </div>
                    </div>

                    <div id="documentEditor" style={{ width: "100%", height: "100%" }}></div>
                </div> :
                    <div className='d-flex justify-center'>
                        <Block className="nk-block-middle wide-xs mx-auto">
                            <BlockContent className="nk-error-ld text-center">
                                <h1 className="nk-error-head">401</h1>
                                <h3 className="nk-error-title text-dark">Unauthorized Access</h3>
                                <p className="nk-error-text text-dark">
                                    It looks like you're not logged in. Please log in to continue.
                                </p>
                                <Button onClick={() => navigate('/')} color="primary" size="lg" className="mt-2">
                                    Back to Home
                                </Button>
                            </BlockContent>
                        </Block>
                    </div>}
            </>
            : <>
                {/* No Access */}
            </>
    )
}

export default FileView;
