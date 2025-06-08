import React, { useState,useEffect,useRef } from "react";
import { Button } from "reactstrap";
import { Icon } from "../../../components/Component";
import { CheckPicker, Stack } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import * as API from "../../../utils/API";
import toast, { Toaster } from "react-hot-toast";

const CreateGroup = ({ toggle, users, newUseradded }) => {

    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [groupNameError, setgroupNameError] = useState('');
    const [groupNameErr, setgroupNameErr] = useState(false);
    const [MembersError, setMembersError] = useState('');
    const [MembersErr, setMembersErr] = useState(false);
    const inputRef = useRef(null);

    const handleGroupNameChange = (e) => {
        setGroupName(e.target.value);
        setgroupNameError('')
        setgroupNameErr(false);
    };

    const handleMembersChange = (value) => {
        setSelectedMembers(value);
        setMembersError('')
        setMembersErr(false);
    };

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    async function newGroup() {
        if(groupName==''){
            setgroupNameError('Enter Group Name!');
            setgroupNameErr(true);
        }
        if(selectedMembers.length==0){
            setMembersError('Add Members to the Group!');
            setMembersErr(true);
        }
        if (groupName && groupName.trim() != '' && selectedMembers.length > 0) {

            const response = await API.addUserGroup({
                groupName,
                teamMembers: selectedMembers,
                loggedInUser: localStorage.getItem('userId')
            })
            if (response.status) {
                console.log("Adas")
                newUseradded();
                toggle(true);
            } else {
                return toast.error(response.message?.replace(/\b\w/g, char => char.toUpperCase()))
            }
        }
    }

    const handlePress =(e) => {
        if(e.key=='Enter'){
            newGroup()
        }
    }

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
                <div className="nk-upload-form mb-0">
                    <h5 className="title mb-3">Create User Group</h5>
                    <form>
                        <div className="form-group">
                            <label className="form-label">Group Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={groupName}
                                onChange={handleGroupNameChange}
                                onKeyDown={handlePress}
                                ref={inputRef}
                            ></input>
                            {groupNameErr&&<p style={{color:'red'}}>{groupNameError}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Members</label>
                            <Stack spacing={10} direction="column" alignItems="flex-start">
                                <CheckPicker
                                    data={users}
                                    // style={{ width: 524 }}
                                    style={{ width: 524 }}
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
                                    value={selectedMembers}
                                    onChange={handleMembersChange}
                                    onKeyDown={handlePress}
                                />
                            </Stack>
                            {MembersErr&&<p style={{color:'red'}}>{MembersError}</p>}
                        </div>
                        <ul className="btn-toolbar g-4 align-center justify-end">
                            <li>
                                <a
                                    href="#"
                                    className="link link-primary"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        toggle();
                                    }}
                                >
                                    Cancel
                                </a>
                            </li>
                            <li>
                                <Button
                                    color="primary"
                                    type="submit"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        newGroup()
                                    }}
                                >
                                    Create
                                </Button>
                            </li>
                        </ul>
                    </form>
                </div>
                <Toaster />
            </div>
        </React.Fragment>
    );
};

export default CreateGroup;
