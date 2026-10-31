import { useState, useMemo, useEffect } from 'react';

/**
 * Hook to manage combined filtering and pagination.
 * @param {Array} data - original dataset (array of objects)
 * @param {Array<Function>} filterFns - array of predicate functions (item) => boolean
 * @param {number} pageSize - items per page (default 20)
 * @returns {object} { filteredData, total, currentPage, setPage, clearFilters }
 */
// Hook to manage combined filtering and pagination.
// Returns paginated data (filteredData) as well as the full filtered list (allFiltered) for CSV export.
export default function useFilteredData(data, filterFns = [], pageSize = 20) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({}); // optional, kept for UI if needed

  // Compute the full filtered list
  const allFiltered = useMemo(() => {
    if (!filterFns.length) return data;
    return data.filter((item) => filterFns.every((fn) => fn(item)));
  }, [data, filterFns]);

  // Reset page when the full filtered list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [allFiltered]);

  const total = allFiltered.length;

  // Compute the current page slice
  const filteredData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return allFiltered.slice(start, start + pageSize);
  }, [allFiltered, currentPage, pageSize]);

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  return {
    filteredData,
    allFiltered,
    total,
    currentPage,
    setPage: setCurrentPage,
    clearFilters,
    filters,
    setFilters,
  };
}
