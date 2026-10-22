import { allOperationsSelected, usePracticeConfig } from '../../app/practiceConfig';
import {
  OPERATION_LABELS,
  OPERATION_SYMBOLS,
  OPERATIONS,
  REVIEW_SETUP_HINT,
} from '../../utils/labels';
import { ChoiceTile } from './ChoiceTile';
import './SetupSection.css';

interface OperationSelectorProps {
  disabled?: boolean;
}

export function OperationSelector({ disabled = false }: OperationSelectorProps) {
  const { config, dispatch } = usePracticeConfig();
  const allSelected = allOperationsSelected(config);

  return (
    <fieldset className="setup-section" disabled={disabled}>
      <legend className="setup-section__legend">What do you want to practice?</legend>
      <p className="setup-section__hint">{disabled ? REVIEW_SETUP_HINT : 'Pick one or more.'}</p>
      <div className="setup-section__grid">
        {OPERATIONS.map((operation) => (
          <ChoiceTile
            key={operation}
            type="checkbox"
            name="operations"
            value={operation}
            label={OPERATION_LABELS[operation]}
            symbol={OPERATION_SYMBOLS[operation]}
            disabled={disabled}
            checked={config.operations.includes(operation)}
            onChange={() => dispatch({ type: 'toggleOperation', operation })}
          />
        ))}
        <ChoiceTile
          type="checkbox"
          name="operations-all"
          value="mixed"
          label="Mixed operations"
          description="All four kinds of math"
          symbol="★"
          disabled={disabled}
          checked={allSelected}
          onChange={() => dispatch({ type: 'setAllOperations', selected: !allSelected })}
        />
      </div>
    </fieldset>
  );
}
