import { useEffect, useRef, useState } from "react";
import {
    Block,
    BlockTitle,
    Button,
    Icon,
    ReactDataTable,
    Row,
    UserAvatar,
} from "../../../../components/Component"
import FilesBody from "../components/Body"
import FileManagerLayout from "../components/Layout"
import { Badge, Breadcrumb, BreadcrumbItem, Card, Modal, ModalBody, Tooltip } from "reactstrap";
import * as API from '../../../../utils/API';
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import { saveDirectory, saveSearchDirectory, saveWorkflowCurrClickedItem, updateMoveFlag } from "../../../../redux/folderSlice";
import toast, { Toaster } from "react-hot-toast";
import Head from "../../../../layout/head/Head";
import Content from "../../../../layout/content/Content";
import MetaDataForm from "../components/MultiStep/MetaDataForm";
import CustomMetaData from "../../../admin/MetaData/Modals/CustomMetaData";
import Filter3 from "../../../../components/Filter/Filter3";
import UploadVersion from "./UploadVersion";
import { useSelector } from "react-redux";
import { userTimezone } from "../../../../utils/Utils";
import WorkflowVersion from "./WorkflowVersion";
import { CardTitle } from "reactstrap";
import FormRevisionHistories from "../modals/FormReportModal";
import Offcanvas from 'react-bootstrap/Offcanvas';
import Swal from "sweetalert2";
import { Lightbox } from "react-modal-image";
import Viewer from "../modals/Viewer";
import { getFileType } from "../../../../utils/helper";

const UnSupportFilesViewer = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const params = useParams();
    const [viewerModal, setViewerModal] = useState(false);
    const [documentDetails, setDocumentDetails] = useState({})
    const [imageFlag, setImageFlag] = useState(false);
    const [imageFile, setImageFile] = useState({})
    const [viewDoc, setViewDoc] = useState({})
    const [codeContent, setCodeContent] = useState('')
    const [externaluser,setExternaluser]=useState({});
    const toggleViewerModal = () => {
        //setViewerModal(!viewerModal);
    };

    const fetchDetails = async (id) => {
        let workspace_id=(params.workspaceId!=null)?params.workspaceId:localStorage.getItem("workspace_id");
        const externaluserinfo = await API.getexternaluserinfo(params.id,params.externalusertoken,workspace_id);
        if(externaluserinfo.status){
            setExternaluser({"email":externaluserinfo.filepermission.email,"userName":externaluserinfo.filepermission.email})
        }else{
            navigate('/noaccess')
            return;
        }
        const detailsResponse = await API.getOnlyOfficeDetails(params.id,workspace_id);
        setDocumentDetails(detailsResponse.data?.data)
        openSharedFile(detailsResponse.data?.data)
        return
    }

    async function openSharedFile(fileDetails) {
        const mode = getFileType(fileDetails.fileType)
        if (mode == 'image') {
            setImageFile(fileDetails);
            setImageFlag(true);
        } else if (mode == 'code') {
            const fileResponse = await API.readFile(fileDetails._id);
            if (!fileResponse.status) return toast.error('Error reading file');
            setCodeContent(fileResponse.content);
            setViewDoc(fileDetails);
            toggleViewerModal();
        } else {
            setViewDoc(fileDetails);
            toggleViewerModal();
        }
    }

    useEffect(() => {
        if (['view', 'edit'].includes(params.id?.toLowerCase())){
            navigate('/auth/login')
            return
        }
        fetchDetails(params.id)

    }, [])
    
    return (
        <>
        <Modal isOpen={true} size="lg" toggle={toggleViewerModal}>
        <Viewer toggle={toggleViewerModal} file={viewDoc} codeContent={codeContent} />
        </Modal>

        {imageFlag && <Lightbox
        medium={`${process.env.REACT_APP_BE_URL}/file/documents/${imageFile._id}/${params.workspaceId}`}
        large={`${process.env.REACT_APP_BE_URL}/file/documents/${imageFile._id}/${params.workspaceId}`}
        alt={imageFile.name}
        hideZoom={true}
        hideDownload={false}
        onClose={() => setImageFlag(true)}
        />}
        </>
        )
    }

export default UnSupportFilesViewer