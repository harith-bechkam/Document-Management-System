import React, { useEffect, useState } from 'react'
import { useFileManager } from "../components/Context";
import QuickAccess from '../components/QuickAccess';
import ViewFilter from '../components/ViewFilter';
import Files from '../components/Files';
import { Block, BlockBetween, BlockHead, BlockHeadContent, BlockTitle, Icon } from "../../../../components/Component";
import { useDispatch, useSelector } from "react-redux";
import { setDocuments, updateSharedAccessed } from '../../../../redux/folderSlice';
import * as API from '../../../../utils/API';
import toast, { Toaster } from 'react-hot-toast';
import DeptDocs from '../components/DeptDocs';
import { Spinner } from "reactstrap"


const Home = () => {
  const dispatch = useDispatch();
  const { fileManager } = useFileManager();
  const [files, setFiles] = useState([])
  const store = useSelector(state => state.folders);
  const [loader, setLoader] = useState(false);
  const moveFlag = useSelector(state => state.folders.moveFlag);

  useEffect(() => {
    getRecentDocs();
  }, [moveFlag])

  useEffect(() => {
    toast.remove();
    return () => {
      toast.remove();
    }
  }, [])
  async function getRecentDocs() {
    setLoader(true);
    const recentDocs = await API.getRecentDocuments();
    if (!recentDocs.status) { setLoader(false); return toast.error('Recents Files Fetch Error'.replace(/\b\w/g, char => char.toUpperCase())); }
    dispatch(setDocuments({
      files: recentDocs.data,
      location: 'home'
    }));
    setLoader(false);
  }


  return (
    <>
      {/* {quickView.length > 0 && <QuickAccess files={quickView} />} */}
      <Block className="nk-fmg-listing">
        <BlockHead size="xs">
          <BlockBetween className="g-2">
            <BlockHeadContent>
              <BlockTitle tag="h6">Recent Files</BlockTitle>
            </BlockHeadContent>
            <BlockHeadContent>
              <ViewFilter />
            </BlockHeadContent>
          </BlockBetween>
        </BlockHead>

        {loader ?
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Spinner size="sm" />
          </div> :
          <DeptDocs files={store.recentRepo
            ?.filter(item => {
              if (item['type'] == 'file' || item['type'] == 'form') {

                if (item['viewStatus']?.toLowerCase() === 'published') return true

                if (item['viewStatus']?.toLowerCase() == 'indraft') {
                  if (localStorage.getItem('userId') === item['createdBy']) return true
                  if (item['sharedWithIndividualUsers'].some(v => v['_id'] == localStorage.getItem('userId')) || item['sharedWithGroupMembers'].some(v => v['_id'] == localStorage.getItem('userId'))) return true
                }

              }
              else return true
            })
          } />}
      </Block>
      <Toaster />
    </>
  )
}

export default Home