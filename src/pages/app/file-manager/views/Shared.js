import React, { useEffect, useState } from 'react'
import { useFileManager } from "../components/Context";
import Files from '../components/Files';
import * as API from '../../../../utils/API';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from "react-redux";
import { saveCurrentSection, setDocuments, updateSharedAccessed } from '../../../../redux/folderSlice';
import DeptDocs from '../components/DeptDocs';
import SharedDocs from '../components/SharedDocs';
import { useLocation, useParams } from 'react-router';
import { Spinner } from "reactstrap"

const Shared = ({docs}) => {

  const dispatch = useDispatch();
  const location = useLocation();
  const params = useParams();
  const store = useSelector(state => state.folders);
  const sharedAccess = useSelector(state => state.folders.sharedDocumentsAccessed)
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    dispatch(updateSharedAccessed({ access: 'shared' }))
    // getSharedWithMe()
    // if (params.id) {
    //   getNestedDocsShared(params.id)
    // } else {
    //   getSharedWithMe()
    // }

    // need to review

    // if(docs.length>0){
    //   if(docs[0].createdAt!=localStorage.getItem('userId')){
    //     window.location = `${window.location.origin}/#/folder/${params.id}`
    //   }
    // }
  }, [store.sharedRepo?.length != 0, params])

  useEffect(() => {
    toast.remove();
    return () => {
      toast.remove();
    }
  }, [])


  return (
    <>
      <SharedDocs files={docs} />
    </>
  )
}

export default Shared