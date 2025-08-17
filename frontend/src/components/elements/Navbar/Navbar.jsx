import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <>
            <div className="header">
                <nav>
                    <ul className="navbar">
                        <li><Link className="nav-link" to="/">Home</Link></li>
                        <li>Contacts</li>
                        <li>About Us</li>
                        <li>Services</li>
                        <li>News</li>
                    </ul>
                </nav>
                <ul className="navbar-icons">
                    <li><Link to="/"><i className="fas fa-home nav-icon"></i></Link></li>
                    <li><i className="fas fa-search nav-icon"></i></li>
                    <li><Link to="/profile"><i className="fas fa-user nav-icon"></i></Link></li>
                    <li><Link to="/login"><button>Log in</button></Link></li>
                </ul>
            </div>
        </>
    )
}