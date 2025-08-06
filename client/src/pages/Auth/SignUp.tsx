import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { UserAuth } from "@/context/AuthContext";

const SignUp = () => {
  const { signUpNewUser } = UserAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signUpNewUser(email, password, username);
    if (result.success) {
      navigate({ to: "/u/$username", params: { username } });
    } else {
      setError(result.error ? result.error : "Error signing up");
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center min-w-72">
      <h2 className="text-3xl">Sign Up</h2>
      <form
        className="flex flex-col gap-8 bg-base-200 px-6 py-4 rounded-xl min-w-72"
        onSubmit={handleSignUp}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="usernameInput">Username</label>
          <input
            id="usernameInput"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="self-start input input-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="emailInput">Email</label>
          <input
            id="emailInput"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="self-start input input-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="passwordInput">Password</label>
          <input
            id="passwordInput"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="self-start input input-primary"
          />
        </div>

        <button className="btn btn-primary " type="submit">
          Sign Up
        </button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <span className="text-xs">
        Already a member?{" "}
        <Link to="/login" className="hover:text-primary transition-all">
          Login
        </Link>
      </span>
    </div>
  );
};

export default SignUp;
