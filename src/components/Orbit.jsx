// Thin gold rings drawn behind a bracelet; the page's motion hook rotates it.
export default function Orbit(props) {
  return (
    <svg className="orbit" viewBox="0 0 600 600" aria-hidden="true" {...props}>
      <circle cx="300" cy="300" r="290" />
      <circle cx="300" cy="300" r="240" strokeDasharray="2 10" />
      <circle cx="300" cy="10" r="5" className="orbit__dot" />
    </svg>
  );
}
