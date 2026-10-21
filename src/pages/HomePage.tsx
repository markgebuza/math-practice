import { ButtonLink } from '../components/common/Button';
import { PageContainer } from '../components/layout/PageContainer';
import './HomePage.css';

const SYMBOLS = [
  { symbol: '+', className: 'home__symbol--blue' },
  { symbol: '−', className: 'home__symbol--yellow' },
  { symbol: '×', className: 'home__symbol--green' },
  { symbol: '÷', className: 'home__symbol--purple' },
];

export function HomePage() {
  return (
    <PageContainer title="Math Practice">
      <div className="home">
        <div className="home__symbols" aria-hidden="true">
          {SYMBOLS.map(({ symbol, className }) => (
            <span key={symbol} className={`home__symbol ${className}`}>
              {symbol}
            </span>
          ))}
        </div>
        <p className="home__welcome">
          Hi there! Ready to practice adding, subtracting, multiplying, and dividing? Every question
          you try helps you get stronger at math.
        </p>
        <div className="home__actions">
          <ButtonLink to="/practice/setup" size="lg">
            Start Practice
          </ButtonLink>
          <ButtonLink to="/statistics" variant="secondary" size="lg">
            View Statistics
          </ButtonLink>
          <ButtonLink to="/settings" variant="secondary" size="lg">
            Settings
          </ButtonLink>
        </div>
      </div>
    </PageContainer>
  );
}
