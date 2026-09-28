import './styles/BrandMark.css';

// Outline of a faceted gem, used beside the wordmark in the header and footer.
export default function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10l4 5-9 11L3 9z" />
      <path d="M3 9h18M9 9l3 11 3-11M7 4l2 5 3-5 3 5 2-5" />
    </svg>
  );
}
