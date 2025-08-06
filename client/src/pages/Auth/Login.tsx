import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { UserAuth } from "@/context/AuthContext";

const Login = () => {
  const { signInUser } = UserAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signInUser(email, password);
    if (result.success && result.username) {
      navigate({ to: "/u/$username", params: { username: result.username } });
    } else {
      setError(result.error ? result.error : "Error signing in");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 items-center justify-center min-h-full">
        <h2 className="text-3xl">Log back in!</h2>
        <form
          className="flex flex-col gap-8 bg-base-200 px-6 py-4 rounded-xl min-w-72"
          onSubmit={handleLogin}
        >
          <div className="flex flex-col gap-2 ">
            <label htmlFor="emailInput">Email</label>
            <input
              id="emailInput"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="self-start input input-primary "
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
          <button className="btn btn-primary" type="submit">
            Log In
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
        <span className="text-xs">
          Not a member?{" "}
          <Link to="/sign-up" className="hover:text-primary transition-all ">
            Join Now
          </Link>
        </span>
      </div>
    </>
  );
};

export default Login;
