import React, { useEffect } from "react";
import Body from "./components/Body";
import Recovery from "./views/Recovery";

import { BlockTitle, Icon } from "../../../components/Component";
import Layout from "./components/Layout";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import * as API from '../../../utils/API';
import { saveSearchDirectory, updateLoaderFlag, updateMoveFlag } from "../../../redux/folderSlice";


const FileManager = () => {
  const dispatch = useDispatch();


  useEffect(() => {

    localStorage.removeItem('currentBreadCrumb');
    dispatch(saveSearchDirectory([]))
    toast.remove();

    return () => {
      toast.remove();
    }
  }, [])


  return (
    <Layout>
      <Body recoveryFilter
        viewFilter={true}
        title={
          <BlockTitle tag="h6">Recovery
          </BlockTitle>
        }
      >
        <Recovery />
      </Body>
      {/* <Toaster /> */}
    </Layout>
  );
};

export default FileManager;
