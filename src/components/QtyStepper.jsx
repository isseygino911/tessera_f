import './QtyStepper.css';

export default function QtyStepper({ value, min = 1, max, onChange, disabled = false }) {
  const clamp = (n) => {
    let next = n;
    if (Number.isNaN(next)) next = min;
    next = Math.max(min, next);
    if (typeof max === 'number') next = Math.min(max, next);
    return next;
  };

  const handleInputChange = (e) => {
    const parsed = parseInt(e.target.value, 10);
    onChange(clamp(parsed));
  };

  return (
    <div className="qty-stepper">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
      >
        &minus;
      </button>
      <input
        type="number"
        name="quantity"
        aria-label="Quantity"
        value={value}
        min={min}
        max={max}
        onChange={handleInputChange}
        disabled={disabled}
      />
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || (typeof max === 'number' && value >= max)}
      >
        +
      </button>
    </div>
  );
}
