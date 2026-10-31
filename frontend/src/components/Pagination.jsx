import React from 'react';

export default function Pagination({ totalItems, currentPage, pageSize = 20, onPageChange }) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 disabled:opacity-50 rounded-2xs"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-2 py-1 text-xs rounded-2xs ${p === currentPage ? 'bg-indigo-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 disabled:opacity-50 rounded-2xs"
      >
        Next
      </button>
      <span className="text-xs text-slate-600 ml-2">
        {totalItems} records
      </span>
    </div>
  );
}
