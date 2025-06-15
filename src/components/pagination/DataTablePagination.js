import React, { useEffect } from "react"
import Icon from "../icon/Icon"
import { Pagination, PaginationLink, PaginationItem, Row, Col } from "reactstrap"

const DataTablePagination = ({
  itemPerPage,
  totalItems,
  paginate,
  currentPage,
  onChangeRowsPerPage,
  customItemPerPage,
  setRowsPerPage,
}) => {
  const pageCount = Math.ceil(totalItems / itemPerPage)
  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1)

  const getPaginationNumbers = () => {
    if (pageCount <= 5) return pageNumbers
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', pageCount]
    if (currentPage >= pageCount - 3) return [1, '...', ...pageNumbers.slice(pageCount - 5)]
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', pageCount]
  }

  const paginationItems = getPaginationNumbers()

  const firstPage = () => paginate(1)
  const lastPage = () => paginate(pageCount)
  const nextPage = () => paginate(currentPage + 1)
  const prevPage = () => paginate(currentPage - 1)

  useEffect(() => {
    onChangeRowsPerPage(customItemPerPage)
    setRowsPerPage(customItemPerPage)
  }, [customItemPerPage])

  return (
    <Row className="align-items-center floatright">
      <Col sm="12" md="12" className="col-5 text-start text-md-end">
        <div className="pagination-gap">
          <div className="dataTables_info" role="status" aria-live="polite">
            {itemPerPage * (currentPage - 1) + 1} - {Math.min(itemPerPage * currentPage, totalItems)} of {totalItems}
          </div>
          <Pagination aria-label="Page navigation example">
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
            {paginationItems.map(item => (
              <PaginationItem
                key={item}
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
                className="page-link-next"
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
        </div>
      </Col>
    </Row>
  )
}

export default DataTablePagination
