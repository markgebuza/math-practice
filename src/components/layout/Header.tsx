import { Link } from 'react-router';
import { Navigation } from './Navigation';
import './Header.css';

export function Header() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="site-header__inner">
        <Link to="/" className="site-header__title">
          Math Practice
        </Link>
        <Navigation />
      </div>
    </header>
  );
}
