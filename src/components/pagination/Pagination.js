import React from "react"
import Icon from "../icon/Icon"
import { Pagination, PaginationLink, PaginationItem } from "reactstrap"

const PaginationComponent = ({ itemPerPage, totalItems, paginate, currentPage }) => {
  const pageCount = Math.ceil(totalItems / itemPerPage)
  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1)

  const getPageList = () => {
    if (pageCount <= 5) return pageNumbers
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", pageCount]
    if (currentPage >= pageCount - 3) return [1, "...", ...pageNumbers.slice(pageCount - 5)]
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", pageCount]
  }

  const pageList = getPageList()

  const firstPage = () => paginate(1)
  const lastPage = () => paginate(pageCount)
  const nextPage = () => paginate(currentPage + 1)
  const prevPage = () => paginate(currentPage - 1)

  return (
    <Pagination aria-label="Page navigation example">
      <div className="dataTables_info d-flex align-items-center me-2" role="status" aria-live="polite">
        {Number.isFinite(itemPerPage) && Number.isFinite(currentPage) && Number.isFinite(totalItems) && (
          <span className="d-none d-sm-block">
            Showing {itemPerPage * (currentPage - 1) + 1} - {Math.min(itemPerPage * currentPage, totalItems)} of {totalItems}
          </span>
        )}
      </div>
      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink
          className="page-link-first"
          onClick={e => {
            e.preventDefault()
            firstPage()
          }}
          href="#first"
        >
          <Icon name="chevrons-left" />
        </PaginationLink>
      </PaginationItem>
      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink
          className="page-link-prev"
          onClick={e => {
            e.preventDefault()
            prevPage()
          }}
          href="#prev"
        >
          <Icon name="chevron-left" />
        </PaginationLink>
      </PaginationItem>
      {pageList.map((item, i) => (
        <PaginationItem
          key={i}
          disabled={isNaN(item)}
          className={`d-none d-sm-block ${currentPage === item ? "active" : ""}`}
        >
          <PaginationLink
            tag="a"
            href="#pageitem"
            onClick={e => {
              e.preventDefault()
              if (!isNaN(item)) paginate(item)
            }}
          >
            {item}
          </PaginationLink>
        </PaginationItem>
      ))}
      <PaginationItem disabled={currentPage === pageCount}>
        <PaginationLink
          className="page-link-next"
          onClick={e => {
            e.preventDefault()
            nextPage()
          }}
          href="#next"
        >
          <Icon name="chevron-right" />
        </PaginationLink>
      </PaginationItem>
      <PaginationItem disabled={currentPage === pageCount}>
        <PaginationLink
          className="page-link-last"
          onClick={e => {
            e.preventDefault()
            lastPage()
          }}
          href="#last"
        >
          <Icon name="chevrons-right" />
        </PaginationLink>
      </PaginationItem>
    </Pagination>
  )
}

export default PaginationComponent
