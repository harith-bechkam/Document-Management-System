import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Row, Col, Icon, RSelect } from "../Component";
import { useState, useRef } from "react";
const Filter2 = ({
    filter,
    setFilter,
    usroptions,
    setCurrentPage 
}) => {

    const [rsuiteRoleState, setRsuiteRoleState] = useState(false);

    const dropdownToggleRef = useRef(null)

    const handleFilterSubmit = () => {
        setRsuiteRoleState(false)

        if (dropdownToggleRef.current) {
            dropdownToggleRef.current.click()
        }
    }

    return (
        <>
            <UncontrolledDropdown>
                <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle" innerRef={dropdownToggleRef}>
                    {filter['user'] && <div className="dot dot-primary"></div>}
                    <Icon name="filter-alt"></Icon>
                </DropdownToggle>
                <DropdownMenu
                    end
                    className="filter-wg dropdown-menu-xl"
                    style={{ overflow: "visible" }}
                >
                    <div className="dropdown-head">
                        <span className="sub-title dropdown-title">Filter Users</span>
                        <div className="dropdown">
                            <a
                                href="#more"
                                onClick={(ev) => {
                                    ev.preventDefault();
                                }}
                                className="btn btn-sm btn-icon"
                            >
                                {/* <Icon name="more-h"></Icon> */}
                            </a>
                        </div>
                    </div>

                    <div className="dropdown-body dropdown-body-rg">
                        <Row className="gx-6 gy-3">

                            <Col size="12">
                                <div className="form-group">
                                    <label className="overline-title overline-title-alt">User</label>
                                    <RSelect
                                        options={usroptions}
                                        value={filter['user']}
                                        onChange={(selectedOption) => setFilter(prevFilter => ({ ...prevFilter, user: selectedOption }))}
                                        placeholder="Select User"
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col size="12">
                                <div className="form-group d-flex justify-content-center px-2">
                                    <button type="button" color="light" className="btn btn-light custom-margin-right" onClick={() => {
                                        setCurrentPage(1)
                                        setFilter({ user: null })
                                        // fetchData(searchText)
                                    }}>
                                        Reset
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleFilterSubmit}
                                    >
                                        Filter
                                    </button>
                                </div>
                            </Col>
                        </Row>
                    </div>

                </DropdownMenu>
            </UncontrolledDropdown>
        </>
    )
}

export default Filter2;