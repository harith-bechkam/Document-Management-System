import React, { useState, useEffect } from "react";
import Icon from "../icon/Icon";
import Button from "../button/Button";
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge } from "reactstrap";

import {
  Block,
  BlockHead,
  BlockHeadContent,
  BlockTitle,
  BlockDes,
  BackTo,
  PreviewCard,
  ReactDataTable,
} from "../Component";
import { orderData, transactionData } from "./TableData";

export const SpecialTable = ({ action, isCompact, data }) => {
  const DropdownTrans = () => {
    return (
      <UncontrolledDropdown>
        <DropdownToggle tag="a" className="text-soft dropdown-toggle btn btn-icon btn-trigger">
          <Icon name="more-h"></Icon>
        </DropdownToggle>
        <DropdownMenu end>
          <ul className="link-list-plain">
            <li>
              <DropdownItem
                tag="a"
                href="#dropdownitem"
                onClick={(ev) => {
                  ev.preventDefault();
                }}
              >
                View
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                tag="a"
                href="#dropdownitem"
                onClick={(ev) => {
                  ev.preventDefault();
                }}
              >
                Invoice
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                tag="a"
                href="#dropdownitem"
                onClick={(ev) => {
                  ev.preventDefault();
                }}
              >
                Print
              </DropdownItem>
            </li>
          </ul>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  };
  return (
    <table className={`table table-tranx ${isCompact ? "is-compact" : ""}`}>
      <thead>
        <tr className="tb-tnx-head">
          <th className="tb-tnx-id">
            <span className="">#</span>
          </th>
          <th className="tb-tnx-info">
            <span className="tb-tnx-desc d-none d-sm-inline-block">
              <span>Bill For</span>
            </span>
            <span className="tb-tnx-date d-md-inline-block d-none">
              <span className="d-md-none">Date</span>
              <span className="d-none d-md-block">
                <span>Issue Date</span>
                <span>Due Date</span>
              </span>
            </span>
          </th>
          <th className="tb-tnx-amount is-alt">
            <span className="tb-tnx-total">Total</span>
            <span className="tb-tnx-status d-none d-md-inline-block">Status</span>
          </th>
          {action && (
            <th className="tb-tnx-action">
              <span>&nbsp;</span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {data
          ? data.map((item) => {
            return (
              <tr key={item.id} className="tb-tnx-item">
                <td className="tb-tnx-id">
                  <a
                    href="#id"
                    onClick={(ev) => {
                      ev.preventDefault();
                    }}
                  >
                    <span>{item.id}</span>
                  </a>
                </td>
                <td className="tb-tnx-info">
                  <div className="tb-tnx-desc">
                    <span className="title">{item.bill}</span>
                  </div>
                  <div className="tb-tnx-date">
                    <span className="date">{item.issue}</span>
                    <span className="date">{item.due}</span>
                  </div>
                </td>
                <td className="tb-tnx-amount is-alt">
                  <div className="tb-tnx-total">
                    <span className="amount">${item.total}</span>
                  </div>
                  <div className="tb-tnx-status">
                    <Badge
                      className="badge-dot"
                      color={
                        item.status === "Paid" ? "success" : item.status === "Due" ? "warning" : "danger"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </td>

                {action && (
                  <td className="tb-tnx-action">
                    <DropdownTrans />
                  </td>
                )}
              </tr>
            );
          })
          : transactionData.data.map((item) => {
            return (
              <tr key={item.id} className="tb-tnx-item">
                <td className="tb-tnx-id">
                  <a
                    href="#id"
                    onClick={(ev) => {
                      ev.preventDefault();
                    }}
                  >
                    <span>{item.id}</span>
                  </a>
                </td>
                <td className="tb-tnx-info">
                  <div className="tb-tnx-desc">
                    <span className="title">{item.bill}</span>
                  </div>
                  <div className="tb-tnx-date">
                    <span className="date">{item.issue}</span>
                    <span className="date">{item.due}</span>
                  </div>
                </td>
                <td className="tb-tnx-amount is-alt">
                  <div className="tb-tnx-total">
                    <span className="amount">${item.total}</span>
                  </div>
                  <div className="tb-tnx-status">
                    <Badge
                      className="badge-dot"
                      color={
                        item.status === "Paid" ? "success" : item.status === "Due" ? "warning" : "danger"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </td>

                {action && (
                  <td className="tb-tnx-action">
                    <DropdownTrans />
                  </td>
                )}
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

export const OrderTable = () => {
  const DropdownTrans = () => {
    return (
      <UncontrolledDropdown>
        <DropdownToggle tag="a" className="text-soft dropdown-toggle btn btn-icon btn-trigger">
          <Icon name="more-h"></Icon>
        </DropdownToggle>
        <DropdownMenu end>
          <ul className="link-list-plain">
            <li>
              <DropdownItem
                tag="a"
                href="#dropdownitem"
                onClick={(ev) => {
                  ev.preventDefault();
                }}
              >
                View
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                tag="a"
                href="#dropdownitem"
                onClick={(ev) => {
                  ev.preventDefault();
                }}
              >
                Invoice
              </DropdownItem>
            </li>
            <li>
              <DropdownItem
                tag="a"
                href="#dropdownitem"
                onClick={(ev) => {
                  ev.preventDefault();
                }}
              >
                Print
              </DropdownItem>
            </li>
          </ul>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  };
  return (
    <table className="table table-orders">
      <thead className="tb-odr-head">
        <tr className="tb-odr-item">
          <th className="tb-odr-info">
            <span className="tb-odr-id">Order ID</span>
            <span className="tb-odr-date d-none d-md-inline-block">Date</span>
          </th>
          <th className="tb-odr-amount">
            <span className="tb-odr-total">Amount</span>
            <span className="tb-odr-status d-none d-md-inline-block">Status</span>
          </th>
          <th className="tb-odr-action">&nbsp;</th>
        </tr>
      </thead>
      <tbody className="tb-odr-body">
        {orderData.map((item) => {
          return (
            <tr className="tb-odr-item" key={item.id}>
              <td className="tb-odr-info">
                <span className="tb-odr-id">
                  <a
                    href="#id"
                    onClick={(ev) => {
                      ev.preventDefault();
                    }}
                  >
                    {item.id}
                  </a>
                </span>
                <span className="tb-odr-date">{item.date}</span>
              </td>
              <td className="tb-odr-amount">
                <span className="tb-odr-total">
                  <span className="amount">${item.amount}</span>
                </span>
                <span className="tb-odr-status">
                  <Badge
                    className="badge-dot"
                    color={
                      item.status === "Complete" ? "success" : item.status === "Pending" ? "warning" : "danger"
                    }
                  >
                    {item.status}
                  </Badge>
                </span>
              </td>
              <td className="tb-odr-action">
                <div className="tb-odr-btns d-none d-md-inline">
                  <Button color="primary" className="btn-sm">
                    View
                  </Button>
                </div>
                <DropdownTrans />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};