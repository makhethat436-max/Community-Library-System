import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [membershipId, setMembershipId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (!users.some(user => user.membershipId === "ADMIN001")) {
      users.push({
        id: Date.now(),
        name: "Library Administrator",
        membershipId: "ADMIN001",
        role: "Admin",
        password: "1234"
      });

      localStorage.setItem("users", JSON.stringify(users));
    }
  }, []);

  const login = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      user =>
        user.membershipId.toLowerCase() ===
          membershipId.trim().toLowerCase() &&
        user.password === password
    );

    if (!user) {
      alert("Invalid membership ID or password");
      return;
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("currentUser", JSON.stringify(user));

    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Community Library</h1>
        <p>Library Management System</p>

        <form onSubmit={login}>
          <input
            type="text"
            placeholder="Membership ID"
            value={membershipId}
            onChange={e => setMembershipId(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;