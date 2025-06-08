import React from "react";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";

const DynamicBreadcrumbs = ({ breadcrumbs }) => {
    return (
        <Breadcrumb className="breadcrumb-arrow">
            {breadcrumbs.map((breadcrumb, index) => (
                <BreadcrumbItem
                    key={index}
                    active={breadcrumb.active}
                >
                    {breadcrumb.link ? (
                        <a href={breadcrumb.link}>{breadcrumb.name}</a>
                    ) : (
                        breadcrumb.name
                    )}
                </BreadcrumbItem>
            ))}
        </Breadcrumb>
    );
};

export default DynamicBreadcrumbs;
