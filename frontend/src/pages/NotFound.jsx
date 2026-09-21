import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section center">
      <h1 className="big-404">404</h1>
      <p className="muted">Oops — this page doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  );
}
