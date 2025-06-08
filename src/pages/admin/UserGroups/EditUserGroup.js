import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { Icon } from "../../../components/Component";
import { CheckPicker, Stack, Toggle } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import * as API from "../../../utils/API";
import toast, { Toaster } from "react-hot-toast";

const EditGroup = ({ toggle, users, fetchData, userGroupName, groupMembers, groupId }) => {

    const [groupName, setGroupName] = useState(userGroupName);
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        setSelectedMembers(groupMembers.map(item => (item['value'])))
    }, [groupMembers])

    const handleGroupNameChange = (e) => {
        setGroupName(e.target.value);
    };

    const handleMembersChange = (value) => {
        setSelectedMembers(value);
    };

    async function editusergroup() {
        if (groupName && groupName.trim() !== '' && selectedMembers.length > 0) {
            const response = await API.editUserGroup({
                groupId,
                groupName,
                teamMembers: selectedMembers,
                loggedInUser: localStorage.getItem('userId')
            })
            if (response.status) {
                fetchData();
                toggle(true);
            } else {
                return toast.error(response.message?.replace(/\b\w/g, char => char.toUpperCase()))
            }
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
                    <h5 className="title mb-3">Edit User Group</h5>
                    <form>
                        <div className="form-group">
                            <label className="form-label">Group Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={groupName}
                                onChange={handleGroupNameChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Members</label>
                            <Stack spacing={10} direction="column" alignItems="flex-start">
                                <CheckPicker
                                    data={users}
                                    style={{ width: 524 }}
                                    value={selectedMembers}
                                    // defaultValue={groupMembers}
                                    onChange={handleMembersChange}
                                />
                            </Stack>
                        </div>
                        <div className="d-flex justify-between">
                            <div className="status-toggle d-flex">
                                {/* <label className="form-label">Status</label>
                                <Toggle
                                    className="px-2"
                                />
                                <span className="px-2">Active</span> */}

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
                                            editusergroup();
                                        }}
                                    >
                                        Create
                                    </Button>
                                </li>
                            </ul>
                        </div>
                    </form>
                </div>
                <Toaster />
            </div>
        </React.Fragment>
    );
};

export default EditGroup;
