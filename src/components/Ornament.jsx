export default function Ornament(props) {
  return (
    <span className="ornament" aria-hidden="true" {...props}>
      <span className="ornament__line" />
      <span className="ornament__gem" />
      <span className="ornament__line" />
    </span>
  );
}
