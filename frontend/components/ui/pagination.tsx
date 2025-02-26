"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  showEdges?: boolean
  showControls?: boolean
  siblingCount?: number
}

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  showEdges = true,
  showControls = true,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  const createRange = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const renderPaginationItems = () => {
    // If total pages is less than 7, show all pages
    if (totalPages <= 7) {
      return createRange(1, totalPages).map((page) => (
        <PaginationItem
          key={page}
          page={page}
          isActive={page === currentPage}
          onClick={() => onPageChange(page)}
        />
      ))
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)
    
    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = createRange(1, 3 + siblingCount)
      return (
        <>
          {leftRange.map((page) => (
            <PaginationItem
              key={page}
              page={page}
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
            />
          ))}
          <PaginationEllipsis />
          {showEdges && (
            <PaginationItem
              page={totalPages}
              isActive={false}
              onClick={() => onPageChange(totalPages)}
            />
          )}
        </>
      )
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightRange = createRange(totalPages - (2 + siblingCount), totalPages)
      return (
        <>
          {showEdges && (
            <PaginationItem
              page={1}
              isActive={false}
              onClick={() => onPageChange(1)}
            />
          )}
          <PaginationEllipsis />
          {rightRange.map((page) => (
            <PaginationItem
              key={page}
              page={page}
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
            />
          ))}
        </>
      )
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = createRange(leftSiblingIndex, rightSiblingIndex)
      return (
        <>
          {showEdges && (
            <PaginationItem
              page={1}
              isActive={false}
              onClick={() => onPageChange(1)}
            />
          )}
          <PaginationEllipsis />
          {middleRange.map((page) => (
            <PaginationItem
              key={page}
              page={page}
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
            />
          ))}
          <PaginationEllipsis />
          {showEdges && (
            <PaginationItem
              page={totalPages}
              isActive={false}
              onClick={() => onPageChange(totalPages)}
            />
          )}
        </>
      )
    }
  }

  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
      {...props}
    >
      {showControls && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-md"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
      )}
      {renderPaginationItems()}
      {showControls && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-md"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      )}
    </div>
  )
}

interface PaginationItemProps {
  page: number
  isActive: boolean
  onClick: () => void
}

function PaginationItem({ page, isActive, onClick }: PaginationItemProps) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="icon"
      className="h-8 w-8 rounded-md"
      onClick={onClick}
      disabled={isActive}
    >
      {page}
    </Button>
  )
}

function PaginationEllipsis() {
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </div>
  )
}