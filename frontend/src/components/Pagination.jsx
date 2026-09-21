export default function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  const nums = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) nums.push(p);
  return (
    <div className="pagination">
      <button disabled={!pagination.hasPrev} onClick={() => onChange(page - 1)}>← Prev</button>
      {nums[0] > 1 && (
        <>
          <button onClick={() => onChange(1)}>1</button>
          {nums[0] > 2 && <span className="muted">…</span>}
        </>
      )}
      {nums.map((p) => (
        <button key={p} className={p === page ? 'active' : ''} onClick={() => onChange(p)}>{p}</button>
      ))}
      {nums[nums.length - 1] < pages && (
        <>
          {nums[nums.length - 1] < pages - 1 && <span className="muted">…</span>}
          <button onClick={() => onChange(pages)}>{pages}</button>
        </>
      )}
      <button disabled={!pagination.hasNext} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}
