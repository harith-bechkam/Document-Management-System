import React, { useState, useEffect } from "react";
import Body from "./components/Body";
import Layout from "./components/Layout";

import { BlockTitle } from "../../../components/Component";

import DeptDocs from './components/DeptDocs';
import * as API from '../../../utils/API';
import { addNewFile, setFiles, setDocuments, updateSharedAccessed, saveSearchDirectory } from '../../../redux/folderSlice';
import { useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import toast from "react-hot-toast";
import StarredDocs from "./components/StarredDocs";
import { Spinner } from "reactstrap"

const FileManager = () => {

  const [page, setPage] = useState(1);

  const location = useLocation()
  const dispatch = useDispatch()

  const store = useSelector(state => state.folders)
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    fetchStarredList()
  }, [])

  useEffect(() => {
    localStorage.removeItem('currentBreadCrumb');
    dispatch(saveSearchDirectory([]))
    toast.remove();
    return () => {
      toast.remove();
    }
  }, [])


  const fetchStarredList = async () => {
    setLoader(true);
    let starredListResponse = await API.getStarredList(page)

    let { status } = starredListResponse
    if (!status) {
      setLoader(false);
      return toast.error(`Some Error Occured! Refresh and Try Again`)
    }


    // dispatch(setFiles({
    //   files:starredListResponse['data'],
    //   location:'starred'
    // }))
    dispatch(setDocuments({
      files: starredListResponse['data'],
      location: 'starred'
    }))
    setLoader(false);
  }


  const fetchMoreData = async () => {
    setPage(page + 1);


    let starredListResponse = await API.getStarredList(page + 1)
    let { status } = starredListResponse


    if (status) {
      var { data } = starredListResponse

      if (data.length != 0) {
        for (var file of data) {
          dispatch(addNewFile(file))
        }
      }
    }

  }

  return (
    <Layout>

      {/* <div id="scrollable-container" className="nk-fmg-body-content" >
        <InfiniteScroll
          style={store.fileRepo?.length <= 8 && { height: "100%" }}
          dataLength={store.fileRepo?.length}
          hasMore={true}
          next={fetchMoreData}
          endMessage={
            <p>
              <b>Yay! You have seen it all</b>
            </p>
          }
          scrollableTarget="scrollable-container"
        > */}
      <Body
        title={
          <BlockTitle tag="h6">Starred</BlockTitle>
        }
        viewFilter={true}
      >
        {loader ? <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Spinner size="sm" />
        </div> :
          <StarredDocs files={store.starredRepo
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
        {/* <div className="emptydiv" style={{ height: "200px" }}></div> */}
      </Body>

      {/* </InfiniteScroll>
      </div> */}

    </Layout>
  );
};

export default FileManager;
