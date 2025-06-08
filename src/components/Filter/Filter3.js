import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Row, Col, Icon, RSelect } from "../Component";
const Filter3 = ({
    docId,
    filter,
    setFilter,
    activityOptions,
    fetchData,
    searchText
}) => {
    return (
        <>
            <UncontrolledDropdown>
                <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                    {filter['activity'] && <div className="dot dot-primary"></div>}
                    <Icon name="filter-alt"></Icon>
                </DropdownToggle>
                <DropdownMenu
                    end
                    className="filter-wg dropdown-menu-xl"
                    style={{ overflow: "visible" }}
                >
                    <div className="dropdown-head">
                        <span className="sub-title dropdown-title">Filter Activities</span>
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
                                    <label className="overline-title overline-title-alt">Activity</label>
                                    <RSelect
                                        options={activityOptions}
                                        value={filter['activity']}
                                        onChange={(selectedOption) => setFilter(prevFilter => ({ ...prevFilter, activity: selectedOption }))}
                                        placeholder="Select Activity"
                                    />
                                </div>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col size="12">
                                <div className="form-group d-flex justify-content-center px-2">
                                    <button type="button" color="light" className="btn btn-light custom-margin-right" onClick={() => {
                                        setFilter({ activity: null })
                                        fetchData(searchText,'',docId)
                                    }}>
                                        Reset
                                    </button>
                                    <button type="button" className="btn btn-secondary"
                                        onClick={() => fetchData(searchText, filter['activity'],docId)}
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

export default Filter3;