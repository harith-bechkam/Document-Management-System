import React, { useContext, useEffect, useState } from "react";
import { Button, Badge } from "reactstrap";
import { Icon, UserAvatar } from "../../../../components/Component";
import { CheckPicker, Stack, SelectPicker, Tabs, Placeholder, Table, IconButton } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import toast, { Toaster } from "react-hot-toast";
import * as API from '../../../../utils/API';
import { findLogoName } from "../../../../utils/Utils";
import { useSelector, useDispatch } from "react-redux";
import { updateLoaderFlag, updateMoveFlag } from "../../../../redux/folderSlice";
import Swal from "sweetalert2";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { getFileType } from "../../../../utils/helper";
import { useLocation } from "react-router";


const GroupMembers = ({ members, toggle }) => {
  const dispatch = useDispatch();
  const location = useLocation()
  const loaderFlag = useSelector(state => state.folders.loader);

  function generateAvatarBase64(char, backgroundColor) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 24;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, size / 2, size / 2);

    return canvas.toDataURL();
  }

  const { Column, HeaderCell, Cell } = Table;

  return (
    <React.Fragment>
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
      <div className={loaderFlag ? "modal-body modal-body-md loading" : "modal-body modal-body-md"}>
        <div className="nk-upload-form mb-0">
          {/* <h5 className="title mb-3 document-title">Group</h5> */}
          {/* {Array.isArray(members) && members.map((member, idx) => {
            return <div style={{ display: 'flex' }}>
              <img style={{ borderRadius: '50px' }} height={'50px'} width={'50px'} src={member.profileImg} />
              <h3 style={{ marginLeft: '1rem' }}>{member.username}</h3>
            </div>
          })} */}
          <Table data={members}>
            <Column width={200} align="left" fixed>
              {[`/workflowPendings`, `/ownerHistory`, '/approvalHistory'].includes(location.pathname) ?
                <HeaderCell>Collaborators List</HeaderCell>
                :
                <HeaderCell>Group Members</HeaderCell>
              }
              <Cell>
                {rowData => (
                  <span>
                    <span>
                      <img style={{ borderRadius: '50px', height: '30px', width: '30px', marginRight: '1rem' }} src={rowData.profileImg || generateAvatarBase64(rowData.username?.split(' ')?.slice(0, 2)?.map((w) => w[0].toUpperCase())?.join(''), '#ccc')} />
                    </span>
                    <span >{rowData.username}</span>
                  </span>
                )}
              </Cell>
            </Column>
          </Table>
        </div>
        <Toaster />
      </div>
    </React.Fragment>
  );
};

export default GroupMembers;
