import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Row, Col, Icon, RSelect } from "../Component";
import { CheckPicker, Stack } from 'rsuite';
import { useEffect, useRef, useState } from "react";
const UserGroupFilter = ({
    onSearchText,
    filter,
    users,
    setFilter,
    setCurrentPage,
}) => {

    const dropdownRef = useRef(null);

    const [rsuiteState, setRsuiteState] = useState(false);

    const [rsuiteStatusState, setRsuiteStatusState] = useState(false);


    const dropdownToggleRef = useRef(null);

    const handleFilterSubmit = () => {
        setRsuiteState(false);

        if (dropdownToggleRef.current) {
            dropdownToggleRef.current.click();
        }
    };

    return (
        <>
            <UncontrolledDropdown>
                <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle filterbtn" innerRef={dropdownToggleRef}>
                    {onSearchText && <div className="dot dot-primary"></div>}
                    <Icon name="filter-alt"></Icon>
                </DropdownToggle>
                <DropdownMenu
                    end
                    className={`filter-wg dropdown-menu-xl filterclass ${rsuiteState ? 'show' : ''}`}
                    style={{ overflow: "visible" }}

                >
                    <div ref={dropdownRef}>
                        <div className="dropdown-head">
                            <span className="sub-title dropdown-title">Filter User Groups</span>
                            <div className="dropdown">
                                {/* <a
                                    href="#more"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                    }}
                                    className="btn btn-sm btn-icon"
                                >
                                    <Icon name="more-h"></Icon>
                                </a> */}
                            </div>
                        </div>

                        <div className="dropdown-body dropdown-body-rg">
                            <Row className="gx-6 gy-3">

                                <Col size="6">
                                    <div className="form-group">
                                        <label className="overline-title overline-title-alt">Users</label>

                                        <div className="pickerclass">
                                            <Stack className="rsuitepickerbtn" spacing={10} direction="column" alignItems="flex-start">
                                                <CheckPicker
                                                    className="selectpickerclass"
                                                    data={users}
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
                                                    onChange={(e) => {
                                                        // debugger
                                                        setCurrentPage(1)
                                                        setFilter(prev => ({ ...prev, users: e }))
                                                    }}
                                                    container={dropdownRef.current}
                                                    value={filter?.users}
                                                    open={rsuiteState}
                                                    onOpen={() => setRsuiteState(true)}
                                                    onClose={() => setRsuiteState(false)}
                                                />
                                            </Stack>
                                            <div className="popup"></div>
                                        </div>
                                    </div>
                                </Col>

                                <Col size="6">
                                    <div className="form-group">
                                        <label className="overline-title overline-title-alt">Status</label>
                                        {/* <RSelect
                                            options={[
                                                { value: "Active", label: "Active" },
                                                { value: "InActive", label: "InActive" },
                                            ]}
                                            value={filter['status']}
                                            onChange={(selectedOption) => {
                                                setCurrentPage(1)
                                                setFilter(prevFilter => ({ ...prevFilter, status: selectedOption }))
                                            }}
                                            placeholder="Select Status"
                                        /> */}
                                        <Stack className="rsuitepickerbtn" spacing={10} direction="column" alignItems="flex-start">
                                            <CheckPicker
                                                className="selectpickerclass"
                                                data={[
                                                    { value: "Active", label: "Active" },
                                                    { value: "InActive", label: "Inactive" },
                                                ]}
                                                onChange={(selectedOption) => {
                                                    setCurrentPage(1)
                                                    setFilter(prevFilter => ({ ...prevFilter, status: selectedOption }))
                                                }}
                                                container={dropdownRef.current}
                                                open={rsuiteStatusState}
                                                onOpen={() => setRsuiteStatusState(true)}
                                                onClose={() => setRsuiteStatusState(false)}
                                                value={filter['status']}
                                            />
                                        </Stack>
                                    </div>
                                </Col>

                                <Col size="12">
                                    <div className="form-group d-flex justify-content-center px-2">
                                        <button type="button" color="light" className="btn btn-light custom-margin-right" onClick={() => {
                                          setCurrentPage(1)
                                          setFilter({
                                                users: [],
                                                status: { value: "Active", label: "Active" }
                                            })
                                        }}>
                                            Reset
                                        </button>
                                        <button type="button" className="btn btn-secondary"
                                            // onClick={() => fetchData(onSearchText, filter['status']?.['value'], filter['role']?.['value'], selectedMembers)}
                                            onClick={handleFilterSubmit}
                                        >
                                            Filter
                                        </button>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>

                </DropdownMenu>
            </UncontrolledDropdown>
        </>
    )
}

export default UserGroupFilter;