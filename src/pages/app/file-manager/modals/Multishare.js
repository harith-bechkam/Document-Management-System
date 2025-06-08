import React, { useContext, useEffect, useState } from "react";
import { Button, Badge, Modal } from "reactstrap";
import { Icon, UserAvatar } from "../../../../components/Component";
import { CheckPicker, Stack, SelectPicker, Tabs, Placeholder, Table, IconButton } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import toast, { Toaster } from "react-hot-toast";
import * as API from '../../../../utils/API';
import { findLogoName } from "../../../../utils/Utils";
import { useSelector, useDispatch } from "react-redux";
import { updateLoaderFlag, updateMoveFlag } from "../../../../redux/folderSlice";
import SharedMembers from "./SharedMembers";

const MultiShare = ({ toggle, multiselected, sharedDocumentList, setSelectedFiles }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('1');
  const [users, setusers] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const currentsection = useSelector(state => state.folders.currentSection);

  const [usersAccess, setUsersAccess] = useState('view');
  const [userGroupsAccess, setUserGroupsAccess] = useState('view');
  const [externalAccess, setExternalAccess] = useState('view');

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserGroups, setSelectedUserGroups] = useState([]);
  const [externalinput,setExternalinput] = useState({items: [],value: "",error: null});
  const [cansharetoexternal, setCansharetoexternal] = useState(false);
  
  const loaderFlag = useSelector(state => state.folders.loader);

  const handleUserAccess = event => {
    if (event == 'View') {
      setUsersAccess('view')
    } else {
      setUsersAccess('edit')
    }
  }

  const handleUserGroupAccess = event => {
    if (event == 'View') {
      setUserGroupsAccess('view')
    } else {
      setUserGroupsAccess('edit')
    }
  }

  const handleExternalAccess = event => {
    if (event == 'View') {
      setExternalAccess('view')
    } else {
      setExternalAccess('edit')
    }
  }


  const onSubmit = async () => {
    dispatch(updateLoaderFlag({ loader: true, text: "Sharing" }));
    const sharedTime = new Date();
    const usersArray = [];
    const loggedInUser = localStorage.getItem('userId');
    const userGroupsArray = [];
    const externalemails =[];
    selectedUsers.forEach(elem => {
      usersArray.push({
        user: elem,
        sharedAt:sharedTime,
        sharedBy:loggedInUser,
        access: usersAccess,
        inherit:false
      })
    })
    selectedUserGroups.forEach(elem => {
      userGroupsArray.push({
        group: elem,
        sharedAt:sharedTime,
        sharedBy:loggedInUser,
        access: userGroupsAccess,
        inherit:false
      })
    })
    externalinput.items.forEach(elem => {
      externalemails.push({
        email: elem,
        sharedAt: sharedTime,
        sharedBy:loggedInUser,
        access: externalAccess,
        inherit: false
      })
    })
    const shareRespo = await API.multiShareDocument(multiselected.files, multiselected.folders, multiselected.forms, usersArray, userGroupsArray,externalemails);
    if (!shareRespo.status) {
      dispatch(updateLoaderFlag({ loader: false, text: "" }));
      return toast.error(`Error : ${shareRespo.message} in sharing documents`.replace(/\b\w/g, char => char.toUpperCase()))
    }
    toast.success(`Documents shared successfully`);
    //setSelectedFiles([])
    setSelectedUserGroups([])
    setSelectedUsers([])
    setExternalinput({items:[],value: "",error: null});
    // toggle();
    dispatch(updateLoaderFlag({ loader: false, text: "" }));
    // dispatch(updateMoveFlag());
  };

  const checkIsfolderexists= ()=>{
    let isfolderexists=sharedDocumentList.filter(item=>item.type=="folder").length;
    if(isfolderexists==0){
      setCansharetoexternal(true);
    }
  };

  useEffect(() => {
   checkIsfolderexists()
    fetchData();
  }, [])

  const { Column, HeaderCell, Cell } = Table;

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

  async function fetchData() {
    const usersList = await API.getAllUsers();
    if (!usersList.status) return toast.error('users fetch error'.replace(/\b\w/g, char => char.toUpperCase()));
    const userGroupList = await API.getAllUserGroups();
    if (!userGroupList.status) return toast.error('user groups fetch error'.replace(/\b\w/g, char => char.toUpperCase()));
    const arr = [];
    for (let i = 0; i < usersList.data.length; i++) {
      if (usersList.data[i]._id.toString() == localStorage.getItem('userId')) {
        continue;
      }
      arr.push({
        label: usersList.data[i].userName,
        value: usersList.data[i]._id,
        email: usersList.data[i].email,
        imgUrl: usersList.data[i].imgUrl ? usersList.data[i].imgUrl : generateAvatarBase64(
          usersList.data[i].userName.split(' ')?.map((w) => w[0].toUpperCase())?.join(''),
          '#ccc'
        )
      })
    }
    setusers(arr);
    const temp = [];
    // arr.splice(0, arr.length);
    userGroupList.data.forEach(elem => {
      temp.push({
        label: elem.groupName,
        value: elem._id,
        imgurl: <div className="user-avatar-group">
          {elem.members.length <= 4 ? elem.members.slice(0, 4).map((member, index) =>
            <div key={index} className="user-avatar xs members_avatar">
              {member.profileImg ?
                <img src={member.profileImg} alt="" /> :
                <span>{member.username.charAt(0).toUpperCase()}</span>
              }
            </div>
          ) : elem.members.slice(0, 3).map((member, index) =>
            <div key={index} className="user-avatar xs members_avatar">
              {member.profileImg ?
                <img src={member.profileImg} alt="" /> :
                <span>{member.username.charAt(0).toUpperCase()}</span>
              }
            </div>
          )}
          {elem.members.length > 4 &&
            <div className="user-avatar xs members_avatar">
              <span>{elem.members.length - 3}+</span>
            </div>
          }
        </div>
      })
    })
    setUserGroups(temp)
  }

  function returnIcon(item) {
    if (item.type == 'folder') {
      return <Icon name={"folder-fill"}></Icon>
    } else if (item.type == 'form') {
      return <Icon name={"file-code"}></Icon>
    } else {
      return <Icon name={"files"}></Icon>
    }
  }

  const [sharedWithUsersModal, setSharedWithUsersModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState('')

  function toggleSharedWithModal(item) {
    setSelectedDoc(item)
    setSharedWithUsersModal(!sharedWithUsersModal);
  }


  const handleKeyDown = (evt) => {
      if (["Enter", "Tab", ","].includes(evt.key)) {
        evt.preventDefault();

        var value = externalinput.value.trim();
        updateemailinput(value);
      }else{
          setExternalinput({
              items: externalinput.items,
              value: evt.target.value,
              error: null
          })
      }
        
  };

  const updateemailinput=(value)=>{
      if (value && isValid(value)) {
        if(externalinput.items.filter(item=>item.email.toLowerCase()==value.toLowerCase()).length>0){
          setExternalinput({items:externalinput.items,
            value: externalinput.value,
            error: "You have already shared to this email"})
        }else if(users.filter(item=>item.email.toLowerCase()==value.toLowerCase()).length>0){
          setExternalinput({items:externalinput.items,
            value: externalinput.value,
            error: "This email is exists in your workspace"})
        }else if(localStorage.getItem("email").toLowerCase()==value.toLowerCase()){
          setExternalinput({items:externalinput.items,
            value: externalinput.value,
            error: "You can't share to your self"})
        }else{
          setExternalinput({
            items: [...externalinput.items, externalinput.value],
            value: "",
            error: externalinput.error
          });
        }
      }
      else{
          setExternalinput({items:externalinput.items,
            value: value,
            error:"Invalid email"})
        }

  }


  const handleChange = (evt) => {
    setExternalinput({
      items:externalinput.items,
      value: evt.target.value,
      error: externalinput.error
    });
  };

  const handleDelete = (item) => {
    setExternalinput({
      items: externalinput.items.filter(i => i !== item),
      value: externalinput.value,
      error: externalinput.error
    });
  };

  const handlePaste = (evt) => {
    evt.preventDefault();
    var paste = evt.clipboardData.getData("text");
    updateemailinput(paste)
  };

  const isValid=(email)=> {
    let error = null;

    if (isInList(email)) {
      error = `${email} has already been added.`;
    }

    if (!isEmail(email)) {
      error = `${email} is not a valid email address.`;
    }

    if (error) {
      setExternalinput({ error });

      return false;
    }

    return true;
  };

  const isInList=(email)=> {
    return externalinput.items.includes(email);
  };

  const isEmail=(email)=> {
    return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email);
  };

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
      <div className="modal-body modal-body-md">
        <div className={loaderFlag ? "nk-upload-form mb-0 loading" : "nk-upload-form mb-0"}>
          <h5 className="title mb-3">Share Selected</h5>
          <form>
            <div className="form-group">
              <Tabs activeKey={activeTab} onSelect={setActiveTab}>
                <Tabs.Tab eventKey="1" title="Users" icon={<Icon name="user-fill"></Icon>}>
                  <Stack spacing={10} direction="row" alignItems="flex-start">
                    <CheckPicker
                      data={users}
                      style={{ width: 350 }}
                      renderMenuItem={(label, item) => (
                        <div>
                          <img
                            src={item.imgUrl}
                            alt={label}
                            style={{ width: 24, height: 24, marginRight: 10, borderRadius: '50%' }}
                          />
                          {label}
                        </div>
                      )}
                      value={selectedUsers}
                      onChange={(e) => setSelectedUsers(e)}
                    />
                    <SelectPicker
                      data={['View', 'Edit'].map(
                        item => ({ label: item, value: item })
                      )}
                      defaultValue="View"
                      searchable={false}
                      onChange={handleUserAccess}
                      style={{ width: 150 }}
                      placeholder="Access"
                    />
                  </Stack>
                </Tabs.Tab>
                <Tabs.Tab eventKey="2" title="User Groups" icon={<Icon name="users-fill"></Icon>}>
                  <Stack spacing={10} direction="row" alignItems="flex-start">
                    <CheckPicker
                      data={userGroups}
                      style={{ width: 350 }}
                      renderMenuItem={(label, item) => (
                        <div style={{ display: 'flex' }}>
                          {label}
                          {item.imgurl}
                        </div>
                      )}
                      value={selectedUserGroups}
                      onChange={(e) => setSelectedUserGroups(e)}
                    />
                    <SelectPicker
                      data={['View', 'Edit'].map(
                        item => ({ label: item, value: item })
                      )}
                      defaultValue="View"
                      searchable={false}
                      onChange={handleUserGroupAccess}
                      style={{ width: 150 }}
                      placeholder="Access"
                    />
                  </Stack>
                </Tabs.Tab>
                {
                  cansharetoexternal==true?
                  <><Tabs.Tab eventKey="3" title="External User" icon={<Icon name="users-fill"></Icon>}>
                  <div className="sharetoexternal">  
                  <Stack spacing={10} direction="row" alignItems="flex-start">
                  
                  <input
                      className={"input " + (externalinput.error && " has-error")}
                      value={externalinput.value}
                      placeholder="Type or paste email addresses and press `Enter`..."
                      onKeyDown={handleKeyDown}
                      onChange={handleChange}
                      onPaste={handlePaste}
                  />

                  <SelectPicker
                      data={['View', 'Edit'].map(
                      item => ({ label: item, value: item })
                      )}
                      defaultValue="View"
                      searchable={false}
                      onChange={handleExternalAccess}
                      style={{ width: 150 }}
                      placeholder="Access"
                  />
                  </Stack>
                  {externalinput.error && <p className="error">{externalinput.error}</p>}
                  {externalinput.items.map(item => (
                      <div className="tag-item" key={item}>
                      {item}
                      <button
                          type="button"
                          className="button"
                          onClick={() => handleDelete(item)}
                      >
                          &times;
                      </button>
                      </div>
                  ))}

                  </div>
                  </Tabs.Tab></>:<></>
              }
              </Tabs>
            </div>
            <ul className="multishare btn-toolbar g-4 align-center justify-end">

              <li>
                <Button
                  color="primary"
                  type="submit"
                  onClick={(ev) => {
                    ev.preventDefault();
                    onSubmit()
                  }}
                >
                  Share
                </Button>
              </li>
            </ul>
          </form>
          {sharedDocumentList.length > 0 ?
            <>
              <label className="form-label">Selected Documents</label>
              <Table data={sharedDocumentList}>
                <Column width={200} align="left" fixed>
                  <HeaderCell>Document</HeaderCell>
                  <Cell>
                    {rowData => (
                      <span style={{ cursor: 'pointer' }}
                        onClick={() => toggleSharedWithModal(rowData)}
                      >
                        {returnIcon(rowData)}
                        <span>{rowData.name}</span>
                      </span>
                    )}
                  </Cell>
                </Column>

                <Column width={200} align="center">
                  <HeaderCell>Shared With</HeaderCell>
                  <Cell className="sharedWith_select" >
                    {rowData => {
                      if(rowData.sharedWith?.externalUsers){
                        return <span>{[...rowData.sharedWith.users, ...rowData.sharedWith.userGroups, ...rowData.sharedWith.externalUsers].length} members</span>
                      }else{
                        return <span>{[...rowData.sharedWith.users, ...rowData.sharedWith.userGroups].length} members</span>
                      }
                    }}
                  </Cell>
                </Column>

                <Column width={100} align="center">
                  <HeaderCell>Document Type</HeaderCell>
                  <Cell className="sharedWith_select" >
                    {rowData => (
                      <span>{rowData.type}</span>
                    )}
                  </Cell>
                </Column>

              </Table>
            </> : <></>}

        </div>
        <Toaster />
      </div>
      <Modal isOpen={sharedWithUsersModal} size="md" toggle={toggleSharedWithModal}>
        <SharedMembers toggle={toggleSharedWithModal} selectedDoc={selectedDoc} />
      </Modal>
    </React.Fragment>
  );
};

export default MultiShare;
