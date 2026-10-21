import { usePracticeConfig } from '../app/practiceConfig';
import { ButtonLink } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { PageContainer } from '../components/layout/PageContainer';
import { DIFFICULTY_NAMES, OPERATION_LABELS } from '../utils/labels';

export function PracticePage() {
  const { config } = usePracticeConfig();
  const operations = config.operations.map((op) => OPERATION_LABELS[op]).join(', ');
  const difficulty = config.difficulty
    ? `Level ${config.difficulty}: ${DIFFICULTY_NAMES[config.difficulty]}`
    : 'none';
  const length =
    config.sessionLength === 'continuous' ? 'Keep going' : `${config.sessionLength} questions`;

  return (
    <PageContainer title="Practice">
      <EmptyState message="Your practice cards will show up here soon.">
        <ul aria-label="Your choices">
          <li>Math: {operations || 'none'}</li>
          <li>Level: {difficulty}</li>
          <li>Questions: {length}</li>
        </ul>
        <ButtonLink to="/practice/setup">Change My Choices</ButtonLink>
      </EmptyState>
    </PageContainer>
  );
}
