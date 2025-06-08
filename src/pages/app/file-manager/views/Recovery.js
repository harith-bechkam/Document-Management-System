import React, { useEffect, useState } from 'react'
import { useFileManager } from "../components/Context";
import Files from '../components/Files';
import DatePicker from "react-datepicker";
import { BlockBetween, BlockHead, BlockHeadContent, BlockTitle, RSelect } from '../../../../components/Component';
import { Row, Col, Button } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { setDocuments, updateSharedAccessed } from '../../../../redux/folderSlice';
import * as API from '../../../../utils/API';
import toast, { Toaster } from 'react-hot-toast';
import ViewFilter from '../components/ViewFilter';
import { Spinner } from "reactstrap"

const Recovery = () => {

  const dispatch = useDispatch();
  const store = useSelector(state => state.folders);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    dispatch(updateSharedAccessed({ access: 'recovery' }))
    getDeletedDocuments()
  }, [store.moveFlag])

  async function getDeletedDocuments() {
    setLoader(true);
    let listResponse = await API.getAllFilesAndFoldersListByFolderId(null, 3)
    let { status } = listResponse
    if (!status) {
      setLoader(false);
      return toast.error(`some error occured! Refresh and try again`.replace(/\b\w/g, char => char.toUpperCase()))
    }

    dispatch(setDocuments({
      files: listResponse['data'],
      location: 'recovery'
    }))
    setLoader(false);

  }

  return (
    <>


        {/* NO NEED SORT IN RECOVERY */}
        {/* <BlockHead size="xs">
          <BlockBetween className="g-2">
            <BlockHeadContent>
              <BlockTitle tag="h6">Recent Files</BlockTitle>
            </BlockHeadContent>
            <BlockHeadContent>
              <ViewFilter />
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead> */}

        {loader ? <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Spinner size="sm" />
        </div> : <Files files={store.trashRepo} page="recovery" />}

        <Toaster />


    </>
  )
}

export default Recovery