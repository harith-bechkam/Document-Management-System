import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Row, Col, Icon, RSelect } from "../Component";
import { CheckPicker, Stack } from 'rsuite';
import { useEffect, useRef, useState } from "react";
const WorkflowFilter = ({
    onSearchText,
    filter,
    setFilter,
    workflowData,
    setCurrentPage,
}) => {
    const [rsuiteState, setRsuiteState] = useState(false);
    const dropdownRef = useRef(null);
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
                            <span className="sub-title dropdown-title">Filter Workflow</span>
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
                                        <label className="overline-title overline-title-alt">Workflow Name</label>
                                        <Stack className="rsuitepickerbtn" spacing={10} direction="column" alignItems="flex-start">
                                            <CheckPicker
                                                className="selectpickerclass"
                                                data={workflowData}

                                                onChange={(e) => {
                                                    setCurrentPage(1)
                                                    setFilter(prev => ({ ...prev, workflow: e }))
                                                }}
                                                container={dropdownRef.current}
                                                value={filter?.['workflow']}
                                                open={rsuiteState}
                                                onOpen={() => setRsuiteState(true)}
                                                onClose={() => setRsuiteState(false)}
                                            />
                                        </Stack>
                                    </div>
                                </Col>

                                <Col size="6">
                                    <div className="form-group">
                                        <label className="overline-title overline-title-alt">Status</label>
                                        <RSelect
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
                                        />
                                    </div>
                                </Col>

                                <Col size="12">
                                    <div className="form-group d-flex justify-content-center px-2">
                                        <button type="button" color="light" className="btn btn-light custom-margin-right" onClick={() => {
                                            setCurrentPage(1)
                                            setFilter({
                                                workflow: [],
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

export default WorkflowFilter;