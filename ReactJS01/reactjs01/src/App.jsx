import { Outlet, Link } from "react-router-dom";

function App() {
  return (
    <div>
      <h1>App Layout</h1>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/login">Login</Link> |{" "}
        <Link to="/register">Register</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

export default App;
