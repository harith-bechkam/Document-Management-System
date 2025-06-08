import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Row, Col, Icon, RSelect } from "../Component";
import { CheckPicker, Stack } from 'rsuite';
import { useRef, useState } from "react";

const MetadataFilter = ({
    onSearchText,
    filter,
    setFilter,
    roleData,
    setCurrentPage
}) => {

    const [rsuiteRoleState, setRsuiteRoleState] = useState(false);

    const dropdownRef = useRef(null);
    const dropdownToggleRef = useRef(null);

    const handleFilterSubmit = () => {
        setRsuiteRoleState(false);

        if (dropdownToggleRef.current) {
            dropdownToggleRef.current.click();
        }
    };

    return (
        <>
            <UncontrolledDropdown>
                <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle" innerRef={dropdownToggleRef}>
                    {onSearchText && <div className="dot dot-primary"></div>}
                    <Icon name="filter-alt"></Icon>
                </DropdownToggle>
                <DropdownMenu
                    end
                    className="filter-wg dropdown-menu-xl"
                    style={{ overflow: "visible" }}
                >
                    <div ref={dropdownRef}>
                        <div className="dropdown-head">
                            <span className="sub-title dropdown-title">Filter Metadata</span>
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
                                        <label className="overline-title overline-title-alt">Type</label>

                                        <Stack className="rsuitepickerbtn" spacing={10} direction="column" alignItems="flex-start">
                                            <CheckPicker
                                                className="selectpickerclass"
                                                data={[
                                                    { value: "string", label: "String" },
                                                    { value: "boolean", label: "Boolean" },
                                                    { value: "date", label: "Date" },
                                                    { value: "datetime", label: "Datetime" },
                                                    { value: "decimal", label: "Decimal" },
                                                    { value: "email", label: "E-mail" },
                                                    { value: "integer", label: "Integer" },
                                                    { value: "list", label: "List" },
                                                    { value: "text", label: "Long text" },
                                                    { value: "time", label: "Time" },
                                                    { value: "url", label: "URL" }
                                                ]}
                                                onChange={(e) => {
                                                    setCurrentPage(1)
                                                    setFilter(prev => ({ ...prev, type: e }))
                                                }}
                                                container={dropdownRef.current}
                                                value={filter?.['type']}
                                                open={rsuiteRoleState}
                                                onOpen={() => setRsuiteRoleState(true)}
                                                onClose={() => setRsuiteRoleState(false)}
                                            />
                                        </Stack>
                                    </div>
                                </Col>

                                <Col size="12">
                                    <div className="form-group d-flex justify-content-center px-2">
                                        <button type="button" color="light" className="btn btn-light custom-margin-right" onClick={() => {
                                            setCurrentPage(1)
                                            setFilter({
                                                role: [],
                                                status: null
                                            })
                                        }}>
                                            Reset
                                        </button>
                                        <button type="button" className="btn btn-secondary"
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

export default MetadataFilter;