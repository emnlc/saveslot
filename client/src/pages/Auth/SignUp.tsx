import { useState } from "react";
import { supabase } from "@/services/supabase";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data: existingUsername, error: usernameCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUsername) {
      setError("Username is already taken.");
      return;
    }

    if (usernameCheckError && usernameCheckError.code !== "PGRST116") {
      setError("Error checking username.");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    const userId = data.user?.id;

    const sessionResult = await supabase.auth.getSession();
    console.log("Auth session:", sessionResult.data.session);

    if (!sessionResult.data.session) {
      setError("No active session — profile insert blocked by RLS.");
      return;
    }

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        username,
        display_name: username,
      });

      if (profileError) {
        setError(profileError.message);
        return;
      }

      // Create default lists
      const { error: listError } = await supabase.from("game_lists").insert([
        { user_id: userId, name: "Favorites", is_public: true },
        { user_id: userId, name: "Backlog", is_public: true },
        { user_id: userId, name: "Wishlist", is_public: true },
      ]);

      if (listError) {
        setError("Failed to create default lists: " + listError.message);
        return;
      }
    }

    navigate({ to: "/games" });
  };

  return (
    <div className="flex flex-col gap-4 items-center justify-center my-48 min-w-72">
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
