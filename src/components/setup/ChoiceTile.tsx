import './ChoiceTile.css';

interface ChoiceTileProps {
  type: 'checkbox' | 'radio';
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  symbol?: string;
  description?: string;
  disabled?: boolean;
}

export function ChoiceTile({
  type,
  name,
  value,
  label,
  checked,
  onChange,
  symbol,
  description,
  disabled = false,
}: ChoiceTileProps) {
  return (
    <label
      className={[
        'choice-tile',
        checked && 'choice-tile--selected',
        disabled && 'choice-tile--disabled',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        className="visually-hidden"
        type={type}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      {symbol && (
        <span className="choice-tile__symbol" aria-hidden="true">
          {symbol}
        </span>
      )}
      <span className="choice-tile__text">
        <span className="choice-tile__label">{label}</span>
        {description && <span className="choice-tile__description">{description}</span>}
      </span>
      <span className="choice-tile__check" aria-hidden="true">
        {checked ? '✓' : ''}
      </span>
    </label>
  );
}
