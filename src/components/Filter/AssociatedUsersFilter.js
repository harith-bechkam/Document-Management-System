import React from 'react'
import {
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
    DropdownItem,
} from "reactstrap";
import {
    Icon,
    Row,
    Col,
    Button,
    RSelect,
} from '../Component';

function AssociatedUserFilter() {
    return (
        <UncontrolledDropdown>
            <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
                <div className="dot dot-primary"></div>
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
                        <DropdownItem
                            href="#more"
                            onClick={(ev) => {
                                ev.preventDefault();
                            }}
                            className="btn btn-sm btn-icon"
                        >
                            <Icon name="more-h"></Icon>
                        </DropdownItem>
                    </div>
                </div>
                <div className="dropdown-body dropdown-body-rg">
                    <Row className="gx-6 gy-3">
                        <Col size="6">
                            <div className="custom-control custom-control-sm custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="hasBalance"
                                />
                                <label className="custom-control-label" htmlFor="hasBalance">
                                    {" "}
                                    Have Balance
                                </label>
                            </div>
                        </Col>
                        <Col size="6">
                            <div className="custom-control custom-control-sm custom-checkbox">
                                <input
                                    type="checkbox"
                                    className="custom-control-input"
                                    id="hasKYC"
                                />
                                <label className="custom-control-label" htmlFor="hasKYC">
                                    {" "}
                                    KYC Verified
                                </label>
                            </div>
                        </Col>
                        <Col size="6">
                            <div className="form-group">
                                <label className="overline-title overline-title-alt">Role</label>
                                <RSelect 
                                // options={filterRole} 
                                placeholder="Any Role" />
                            </div>
                        </Col>
                        <Col size="6">
                            <div className="form-group">
                                <label className="overline-title overline-title-alt">Status</label>
                                <RSelect
                                //  options={filterStatus} 
                                 placeholder="Any Status" />
                            </div>
                        </Col>
                        <Col size="12">
                            <div className="form-group">
                                <Button color="secondary">Filter</Button>
                            </div>
                        </Col>
                    </Row>
                </div>
                <div className="dropdown-foot between">
                    <a
                        href="#reset"
                        onClick={(ev) => {
                            ev.preventDefault();
                        }}
                        className="clickable"
                    >
                        Reset Filter
                    </a>
                    <a
                        href="#save"
                        onClick={(ev) => {
                            ev.preventDefault();
                        }}
                    >
                        Save Filter
                    </a>
                </div>
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}

export default AssociatedUserFilter