import { NavLink } from 'react-router-dom';

export default function Header() {
    return (
        <header className="header">
            <div className="header__brand">
                <div className="header__logo">🏥</div>
                <div>
                    <div className="header__title">Rural Healthcare Assistant</div>
                    <div className="header__subtitle">AI-Powered Multilingual Medical Instructions</div>
                </div>
            </div>
            <nav className="header__nav">
                <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                    📊 Dashboard
                </NavLink>
                <NavLink to="/new" className={({ isActive }) => isActive ? 'active' : ''}>
                    ➕ New Consultation
                </NavLink>
            </nav>
        </header>
    );
}
