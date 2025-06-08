import React, { useEffect, useState } from 'react'
import { Icon, UserAvatar } from '../../../../components/Component';
import * as API from '../../../../utils/API';
import toast from 'react-hot-toast';
import { CheckPicker, Stack, SelectPicker, Tabs, Placeholder, Table, IconButton } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import { findLogoName } from '../../../../utils/Utils';

function SharedMembers({ selectedDoc, toggle }) {

    const [sharedWithUsers, setSharedWithUsers] = useState([]);
    const [sharedWithGroups, setSharedWithGroups] = useState([]);

    const { Column, HeaderCell, Cell } = Table;

    useEffect(() => {
        if (selectedDoc) {
            fetchData();
        }
    }, [])

    async function fetchData() {
        const sharedWithMembers = await API.getSharedWithMembers(selectedDoc._id, selectedDoc.type);
        if (!sharedWithMembers.status) return toast.error('shared members fetch error'.replace(/\b\w/g, char => char.toUpperCase()));
        setSharedWithUsers(sharedWithMembers.data?.sharedWithUsers);
        setSharedWithGroups(sharedWithMembers.data?.sharedWithGroups);
    }

    function formatString(input) {
        return input
            .split(',')
            .map((word, index) => {
                const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
                return capitalized;
            })
            .join(', ')
            .trim();
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
                    <h5 className="title mb-3">Shared With</h5>
                </div>

                {sharedWithUsers.length > 0 ?
                    <>
                        <label className="form-label">Users</label>
                        <Table data={sharedWithUsers} rowHeight={rowData => {
                            return 70
                        }}>
                            <Column width={200} align="left" fixed flexGrow={3}>
                                <HeaderCell>Name</HeaderCell>
                                <Cell >
                                    {rowData => (
                                        <>
                                            {rowData.user?.imgUrl ?
                                                <img
                                                    src={rowData.user?.imgUrl}
                                                    alt={rowData.user?.userName}
                                                    style={{ width: 24, height: 24, marginRight: 10, borderRadius: '50%' }}
                                                /> :
                                                <UserAvatar text={findLogoName(rowData.user?.userName)} image={rowData.user?.imgUrl} />
                                            }
                                            <div className='d-flex align-items-center px-2'>{rowData.user?.userName}</div >
                                        </>
                                    )}
                                </Cell>
                            </Column>

                            <Column width={200} align="center">
                                <HeaderCell>Access</HeaderCell>
                                <Cell className="sharedWith_select" >
                                    {rowData => (
                                        <span>{formatString(rowData.access)}</span>
                                    )}
                                </Cell>
                            </Column>
                        </Table>
                    </> :
                    // <div className="text-center">Not Shared With Any Users</div>
                    <></>
                }


                {sharedWithGroups.length ?
                    <>
                        <label className="form-label">User Groups</label>
                        <Table data={sharedWithGroups}>
                            <Column width={200} align="left" fixed>
                                <HeaderCell>Name</HeaderCell>
                                <Cell dataKey="group.groupName" />
                            </Column>

                            <Column width={200} align="center">
                                <HeaderCell>Access</HeaderCell>
                                <Cell className="sharedWith_select" >
                                    {rowData => (
                                        <span>{formatString(rowData.access)}</span>
                                    )}
                                </Cell>
                            </Column>

                            <Column align="center">
                                <HeaderCell>Members</HeaderCell>
                                <Cell className="sharedWith_select" >
                                    {rowData => (
                                        <span>{rowData.group?.userIds?.length}</span>
                                    )}
                                </Cell>
                            </Column>

                        </Table></> :
                    // <div className="text-center">Not Shared With Any Group</div>
                    <></>
                }
            </div>

        </React.Fragment>
    )
}

export default SharedMembers