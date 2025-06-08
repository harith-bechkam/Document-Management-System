import React, { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
    DropdownItem,
    Badge,
    Progress,
    Modal,
} from "reactstrap";
import {
    Block,
    Icon,
    UserAvatar,
    PaginationComponent,
    Button,
    DataTable,
    DataTableBody,
    DataTableHead,
    DataTableRow,
    // DataTableItem,
    TooltipComponent,
    RSelect
} from "../../../../components/Component";
import { findLogoName } from "../../../../utils/Utils";
import { useLocation, useNavigate } from "react-router";
import moment from "moment";
import GroupMembers from "../../../../pages/app/file-manager/modals/UserGroupMembers";
import { Tooltip } from 'react-tooltip';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const Table = ({
    op,
    columns,
    extraColumns,
    setColumns,
    setExtraColumns,
    data,
    itemPerPage,
    setItemPerPage,
    setCurrentPage,
    handlePagination,
    privilege,
    onEditClick,
    onRowClick,
    onEyeClick,
    suspendUser,
    sortData,
    filterComp,
    onSearchText,
    onSearchChange,
    selectedRows,
    setSelectedRows,
    toggleRowSelection,
    toggleSelectAll,
    toggleRowCheckboxRowSelection,
}) => {
    const navigate = useNavigate()

    const [tablesm, updateTableSm] = useState(false)
    const [onSearch, setonSearch] = useState(true)
    const [sort, setSort] = useState(true)
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupMembers, setGroupMembers] = useState(false);

    function toggleGroupMemberModal() {
        setShowGroupModal(!showGroupModal)
    }

    const toggle = () => setonSearch(!onSearch)

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

    function printGroupMembersModal(groupArr) {
        let array = JSON.parse(JSON.stringify(groupArr))
        array.forEach((elem, idx) => {
            if (!elem.profileImg) {
                elem.profileImg = generateAvatarBase64(
                    elem.username.split(' ')?.slice(0, 2)?.map((w) => w[0].toUpperCase())?.join(''),
                    '#ccc'
                )
            }
        })
        setGroupMembers(array);
        setShowGroupModal(true);
    }


    const getColumns = (item, columnName) => {
        switch (columnName) {

            //consent_meta
            case 'consent_metadata_name': {
                const metafilename = item?.resourceDetails?.name || '';
                const fileLength = metafilename.length;
                const tooltipId = `metafilename-${item._id}`;
                const shouldTruncate = fileLength >= 15;

                if (!fileLength) return '-';

                return (
                    <>
                        <span
                            id={tooltipId}
                            style={{ cursor: shouldTruncate ? 'pointer' : 'default' }}
                        >
                            {shouldTruncate ? metafilename.substring(0, 15) + '...' : metafilename}
                        </span>
                        <span id={`${tooltipId}-icon`} style={{ cursor: "pointer", marginLeft: "4px" }} onClick={() => {
                            navigate(`/details/${item?.resourceDetails?._id}`)
                        }}>
                            <Icon name="external" />
                        </span>
                        {shouldTruncate && (
                            <Tooltip
                                anchorSelect={`#${tooltipId}`}
                                content={metafilename}
                                place="top"
                                className="metatable-tooltip"
                            />
                        )}
                        <Tooltip
                            anchorSelect={`#${tooltipId}-icon`}
                            content="Go to Location"
                            place="top"
                            className="metatable-tooltip"
                        />
                    </>
                );
            }


            case 'consent_primary_metadata_doc_type': {
                const primary = item?.defaultMetaData?.docTypeDataValue || [];

                if (!primary.length) return '-';

                const visibleKeywords = primary.slice(0, 2);
                const remaining = primary.slice(2);
                const tooltipId = `primary-tooltip-${item._id}`;

                const tooltipContent = primary.length
                    ? primary.map((keyword, index) => (
                        <div key={index}>{keyword}</div>
                    ))
                    : 'No more Primary Metadata';

                return (
                    <>
                        <span id={tooltipId} style={{ cursor: remaining.length ? 'pointer' : 'default' }}>
                            {visibleKeywords.map((keyword, index) => (
                                <Badge key={index} color="primary" className="me-1">
                                    {keyword}
                                </Badge>
                            ))}
                            {remaining.length > 0 && (
                                <Badge color="primary" className="me-1">
                                    +{remaining.length}
                                </Badge>
                            )}
                        </span>

                        {remaining.length > 0 && (
                            <Tooltip
                                anchorSelect={`#${tooltipId}`}
                                content={<div>{tooltipContent}</div>}
                                place="right"
                                className="metatable-tooltip"
                            />
                        )}
                    </>
                );
            }


            case 'consent_secondary_metadata_doc_type': {
                const secondary = item?.defaultMetaData?.secondaryDocTypeDataValue || [];

                if (!secondary.length) return '-';

                const visibleKeywords = secondary.slice(0, 2);
                const remaining = secondary.slice(2);
                const tooltipId = `secondary-tooltip-${item._id}`;

                const tooltipContent = secondary.length
                    ? secondary.map((keyword, index) => (
                        <div key={index}>{keyword}</div>
                    ))
                    : 'No more Secondary Metadata';

                return (
                    <>
                        <span id={tooltipId} style={{ cursor: remaining.length ? 'pointer' : 'default' }}>
                            {visibleKeywords.map((keyword, index) => (
                                <Badge key={index} color="primary" className="me-1">
                                    {keyword}
                                </Badge>
                            ))}
                            {remaining.length > 0 && (
                                <Badge color="primary" className="me-1">
                                    +{remaining.length}
                                </Badge>
                            )}
                        </span>

                        {remaining.length > 0 && (
                            <Tooltip
                                anchorSelect={`#${tooltipId}`}
                                content={<div>{tooltipContent}</div>}
                                place="right"
                                className="metatable-tooltip"
                            />
                        )}
                    </>
                );
            }

            case 'consent_metadata_keywords': {
                const keywords = item?.defaultMetaData?.keywordsDataValue || [];

                if (!keywords.length) return '-';

                const visibleKeywords = keywords.slice(0, 2)
                const remaining = keywords.slice(2)
                const tooltipId = `keywords-tooltip-${item._id}`

                const tooltipContent = keywords.length
                    ? keywords.map((keyword, index) => (
                        <div key={index}>{keyword}</div>
                    ))
                    : 'No more keywords';

                return (
                    <>
                        <span id={tooltipId} style={{ cursor: remaining.length ? 'pointer' : 'default' }}>
                            {visibleKeywords.map((keyword, index) => (
                                <Badge key={index} color="primary" className="me-1">
                                    {keyword}
                                </Badge>
                            ))}
                            {remaining.length > 0 && (
                                <Badge color="primary" className="me-1">
                                    +{remaining.length}
                                </Badge>
                            )}
                        </span>

                        {remaining.length > 0 && (
                            <Tooltip
                                anchorSelect={`#${tooltipId}`}
                                content={<div>{tooltipContent}</div>}
                                place="right"
                                className="metatable-tooltip"
                            />
                        )}
                    </>
                );
            }


            //react-tooltip
            // case 'consent_metadata_notes': {
            //     const note = item?.defaultMetaData?.notes || '';
            //     const noteLength = note.length;
            //     const tooltipId = `note-${item._id}`;
            //     const shouldTruncate = noteLength >= 10;

            //     if (!noteLength) return '-';

            //     return (
            //         <>
            //             <div
            //                 id={tooltipId}
            //                 style={{ cursor: shouldTruncate ? 'pointer' : 'default' }}
            //             >
            //                 {shouldTruncate ? note.substring(0, 10) + '...' : note}
            //             </div>
            //             {shouldTruncate && (
            //                 <Tooltip
            //                     anchorSelect={`#${tooltipId}`}
            //                     content={<div style={{ whiteSpace: 'pre-wrap', maxWidth: 400 }}>{note}</div>} //.length > 40 ? note.substring(0, 40) + '...' : note
            //                     place="top"
            //                     className="metatable-tooltip"
            //                     float={true}
            //                     style={{ zIndex: 9999 }}
            //                 />
            //             )}
            //         </>
            //     );
            // }

            //tippy
            case 'consent_metadata_notes': {
                const note = item?.defaultMetaData?.notes || '';
                const noteLength = note.length;
                const shouldTruncate = noteLength >= 10;

                if (!noteLength) return '-';

                return (
                    <Tippy
                        content={
                            <div style={{ whiteSpace: 'pre-wrap', maxWidth: 400 }}>{note}</div>
                        }
                        placement="right"
                        disabled={!shouldTruncate}
                        className="metatable-tippy-tooltip"
                        maxWidth="none"
                    >
                        <div style={{ cursor: shouldTruncate ? 'pointer' : 'default' }}>
                            {shouldTruncate ? note.substring(0, 10) + '...' : note}
                        </div>
                    </Tippy>
                );
            }
            default:
                return '-'
        }
    }

    const DataTableItem = ({ className, style, onClick, ...props }) => {
        return <div className={`nk-tb-item ${className ? className : ""}`} style={style} onClick={onClick}>{props.children}</div>;
    };


    const DataTableRow = ({ className, style, size, ...props }) => {
        let rowClass = "nk-tb-col"
        if (className) {
            rowClass += ` ${className}`;
        }

        if (size) {
            rowClass += ` tb-col-${size}`;
        }
        const newstyle = {
            ...style,
        }

        return <div className={rowClass} style={newstyle} >{props.children}</div>;
    }


    return (
        <Block>
            <DataTable className="card-stretch metaapproval_table-box">  {/* card-stretch  */}
                <div className="card-inner position-relative card-tools-toggle custom-table-wrapper">
                    {/* cardHeader */}
                    <div className="card-title-group">
                        <div className="card-tools">
                            <div className="form-inline flex-nowrap gx-3"></div>
                        </div>
                        <div className="card-tools me-n1">
                            <ul className="btn-toolbar gx-1">
                                <li>
                                    <a
                                        href="#search"
                                        onClick={(ev) => {
                                            ev.preventDefault();
                                            toggle();
                                        }}
                                        className="btn btn-icon search-toggle toggle-search"
                                    >
                                        <Icon name="search"></Icon>
                                    </a>
                                </li>
                                <li className="btn-toolbar-sep"></li>
                                <li>
                                    <div className="toggle-wrap">
                                        <Button
                                            className={`btn-icon btn-trigger toggle ${tablesm ? "active" : ""}`}
                                            onClick={() => updateTableSm(true)}
                                        >
                                            <Icon name="menu-right"></Icon>
                                        </Button>
                                        <div className={`toggle-content ${tablesm ? "content-active" : ""}`}>
                                            <ul className="btn-toolbar gx-1">
                                                <li className="toggle-close">
                                                    <Button className="btn-icon btn-trigger toggle" onClick={() => updateTableSm(false)}>
                                                        <Icon name="arrow-left"></Icon>
                                                    </Button>
                                                </li>
                                                <li>{filterComp} </li>
                                                <li>
                                                    <UncontrolledDropdown>
                                                        <DropdownToggle color="transparent" className="btn btn-trigger btn-icon dropdown-toggle">
                                                            <Icon name="setting"></Icon>
                                                        </DropdownToggle>
                                                        <DropdownMenu end className="dropdown-menu-xs">
                                                            <ul className="link-check">
                                                                <li>
                                                                    <span>Show</span>
                                                                </li>
                                                                <li className={itemPerPage === 10 ? "active" : ""}>
                                                                    <DropdownItem
                                                                        tag="a"
                                                                        href="#dropdownitem"
                                                                        onClick={(ev) => {
                                                                            ev.preventDefault();
                                                                            setCurrentPage(1);
                                                                            setItemPerPage(10);
                                                                        }}
                                                                    >
                                                                        10
                                                                    </DropdownItem>
                                                                </li>
                                                                {/* Add other options here */}
                                                            </ul>
                                                        </DropdownMenu>
                                                    </UncontrolledDropdown>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* on clicking on search cardHeader */}
                    <div className={`card-search search-wrap ${!onSearch && "active"}`}>
                        <div className="card-body">
                            <div className="search-content">
                                <Button
                                    className="search-back btn-icon toggle-search active"
                                    onClick={() => {
                                        toggle();
                                    }}
                                >
                                    <Icon name="arrow-left"></Icon>
                                </Button>
                                <input
                                    type="text"
                                    className="border-transparent form-focus-none form-control"
                                    placeholder={"Search Consent"}
                                    value={onSearchText}
                                    onChange={(e) => onSearchChange(e)}
                                />
                                <Button className="search-submit btn-icon">
                                    <Icon name="search"></Icon>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>



                <div className="custom-table-body"> {/* datatable-class - for horizontal scrollbar */}
                    <DataTableBody>
                        {/* head */}
                        <DataTableHead>
                            <DataTableRow className="nk-tb-col-check">
                                <div className="custom-control custom-control-sm custom-checkbox notext">
                                    <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="selectAll"
                                        checked={selectedRows.length === data?.data?.length}
                                        onChange={toggleSelectAll}
                                    />
                                    <label className="custom-control-label" htmlFor="selectAll"></label>
                                </div>
                            </DataTableRow>
                            {columns.filter((item) => item['show']).map((item) => (
                                <DataTableRow className={"text-center"} key={item.name}>
                                    <h2
                                        className="sub-text"
                                        size="lg"
                                        onClick={() => {
                                            if (item.sort) {
                                                setSort((prev) => {
                                                    const newSort = !prev;
                                                    sortData(item.name, newSort);
                                                    return newSort;
                                                });
                                            }
                                        }}
                                    >
                                        {item.label}
                                        {item.sort && (
                                            item.sortOrder === 0 ? (
                                                <span className="custom-sort">
                                                    <span>&darr;</span>
                                                    <span>&uarr;</span>
                                                </span>
                                            ) : (
                                                <span className="custom-sort">
                                                    {item.sortOrder === 1 && <span>&darr;</span>}
                                                    {item.sortOrder === -1 && <span>&uarr;</span>}
                                                </span>
                                            )
                                        )}
                                    </h2>
                                </DataTableRow>
                            ))}
                        </DataTableHead>

                        {/* row datas */}
                        {data['data']?.length > 0 && data['data']?.map((item) => (
                            <DataTableItem
                                key={item._id}
                                style={{
                                    backgroundColor: selectedRows?.some((row) => row?._id === item?._id) ? "#f0f8ff" : "transparent",
                                    cursor: "pointer"
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleRowSelection(item);
                                }}
                            >
                                <DataTableRow className="nk-tb-col-check">
                                    <div className="custom-control custom-control-sm custom-checkbox notext" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id={`uid-${item?._id}`}
                                            checked={selectedRows?.some((row) => row?._id === item?._id)}
                                            onChange={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleRowCheckboxRowSelection(item);
                                            }}
                                        />
                                        <label className="custom-control-label" htmlFor={`uid-${item?._id}`}></label>
                                    </div>
                                </DataTableRow>
                                {columns.map(column => (
                                    column['show'] && (
                                        <DataTableRow key={column.name} size="mb" style={{ textAlign: "center" }} className={`${column?.name}`}>
                                            <span className={` sub-text`} size="lg">  {/* datatable-column-custom */}
                                                {getColumns(item, column.name)}
                                            </span>
                                        </DataTableRow>
                                    )
                                ))}

                            </DataTableItem>
                        ))}
                    </DataTableBody>
                </div>



                <div className={"card-inner" + (data['data']?.length > 0 ? ' floatright' : '')}>
                    {data['data']?.length > 0 ? (
                        <PaginationComponent
                            itemPerPage={data['perPage']}
                            totalItems={data['totalCount']}
                            paginate={handlePagination}
                            currentPage={data['currentPage']}
                        />
                    ) : (
                        <div className="text-center">
                            <span className="text-silent">No data found</span>
                        </div>
                    )}
                </div>
            </DataTable>

            <Modal isOpen={showGroupModal} size="sm" toggle={toggleGroupMemberModal}>
                <GroupMembers members={groupMembers} toggle={toggleGroupMemberModal} />
            </Modal>
        </Block>
    )
}

export default Table