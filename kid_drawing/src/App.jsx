import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, Redirect, useLocation, useHistory } from 'react-router-dom';
import DrawPage from './pages/DrawPage';
import ColorPage from './pages/ColorPage';
import DashboardPage from './pages/DashboardPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import ProfilePage from './pages/ProfilePage';
import { useUserStore } from './store/userStore';
import './index.css';

/* ===== Account Selection Screen ===== */
const AccountSelector = ({ onChildSelect, onParentSelect }) => {
  const { users, children } = useUserStore();
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const { verifyParentPin } = useUserStore();
  const parentUser = users.find(u => u.isParent);

  const handleParentPinSubmit = (e) => {
    e.preventDefault();
    if (verifyParentPin(pin)) {
      onParentSelect(parentUser.id);
    } else {
      setPinError('Sai mã PIN! Thử lại nhé.');
      setPin('');
    }
  };

  return (
    <div className="account-selector-screen">
      <div className="account-selector-content">
        <div className="account-selector-header">
          <h1>🎨 Kid Drawing</h1>
          <p>Chọn tài khoản để bắt đầu</p>
        </div>

        <div className="account-grid">
          {children.map(child => (
            <div
              key={child.id}
              className="account-card"
              onClick={() => onChildSelect(child.id)}
            >
              <span className="account-avatar">{child.avatar}</span>
              <span className="account-name">{child.name}</span>
              <span className="account-role">👶 Trẻ em</span>
            </div>
          ))}

          {parentUser && (
            <div
              className="account-card account-card-parent"
              onClick={() => setShowPin(true)}
            >
              <span className="account-avatar">{parentUser.avatar}</span>
              <span className="account-name">{parentUser.name}</span>
              <span className="account-role">🔒 Phụ huynh</span>
            </div>
          )}
        </div>

        {showPin && (
          <div className="account-pin-section">
            <form onSubmit={handleParentPinSubmit}>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>🔒 Nhập mã PIN phụ huynh</p>
              <input
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(''); }}
                placeholder="Nhập PIN (mặc định: 1234)"
                maxLength={6}
                autoFocus
                className="pin-input"
              />
              {pinError && <p className="pin-error">{pinError}</p>}
              <div className="pin-actions">
                <button type="submit" className="btn-primary">Xác nhận</button>
                <button type="button" className="btn-secondary" onClick={() => { setShowPin(false); setPin(''); setPinError(''); }}>Huỷ</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

/* ===== NavBar ===== */
const NavBar = ({ isParent, onLogout }) => {
  const location = useLocation();
  const history = useHistory();
  const user = useUserStore((s) => s.user);
  const children = useUserStore((s) => s.children);
  const selectUser = useUserStore((s) => s.selectUser);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <nav className="top-nav">
        <Link to="/" className="nav-brand">🎨 Kid Drawing</Link>
        <div className="nav-links">
          {!isParent && (
            <>
              <Link to="/draw" className={isActive('/draw')}>✏️ Vẽ</Link>
              <Link to="/color" className={isActive('/color')}>🖌️ Tô màu</Link>
              <Link to="/dashboard" className={isActive('/dashboard')}>📊 Bộ sưu tập</Link>
            </>
          )}
          {isParent && (
            <>
              <Link to="/parent-dashboard" className={isActive('/parent-dashboard')}>👨‍👩‍👧 Quản lý</Link>
              <Link to="/profile" className={isActive('/profile')}>👤 Hồ sơ</Link>
            </>
          )}
        </div>
        <div className="nav-right">
          <div className="nav-user-wrapper" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <span className="nav-user">{user?.avatar || '🐱'}</span>
            <span className="nav-user-name">{user?.name || 'Bé'}</span>
          </div>
          <button className="nav-parent-btn" onClick={onLogout} title="Đổi tài khoản">
            🔄
          </button>
        </div>
      </nav>

      {/* Profile Switcher - only children profiles for switching */}
      {showProfileMenu && !isParent && (
        <div className="profile-switcher-overlay" onClick={() => setShowProfileMenu(false)}>
          <div className="profile-switcher" onClick={(e) => e.stopPropagation()}>
            <h4>👥 Chọn hồ sơ</h4>
            {children.map((child) => (
              <div
                key={child.id}
                className={`profile-switch-item ${user?.id === child.id ? 'active' : ''}`}
                onClick={() => { selectUser(child.id); setShowProfileMenu(false); }}
              >
                <span className="switch-avatar">{child.avatar}</span>
                <span className="switch-name">{child.name}</span>
                {user?.id === child.id && <span className="switch-check">✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

/* ===== App ===== */
const App = () => {
  const [accountSelected, setAccountSelected] = useState(false);
  const user = useUserStore((s) => s.user);
  const selectUser = useUserStore((s) => s.selectUser);

  const handleSelect = (userId) => {
    selectUser(userId);
    setAccountSelected(true);
  };

  const handleLogout = () => {
    setAccountSelected(false);
  };

  if (!accountSelected) {
    return (
      <AccountSelector
        onChildSelect={handleSelect}
        onParentSelect={handleSelect}
      />
    );
  }

  const isParent = user?.isParent === true;

  return (
    <Router>
      <div className="app-layout">
        <NavBar isParent={isParent} onLogout={handleLogout} />
        <div className="page">
          <Switch>
            <Route path="/" exact>
              {isParent ? <Redirect to="/parent-dashboard" /> : <Redirect to="/draw" />}
            </Route>
            {!isParent && <Route path="/draw" component={DrawPage} />}
            {!isParent && <Route path="/color" component={ColorPage} />}
            {!isParent && <Route path="/dashboard" component={DashboardPage} />}
            {isParent && <Route path="/parent-dashboard" component={ParentDashboardPage} />}
            {isParent && <Route path="/profile" component={ProfilePage} />}
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default App;