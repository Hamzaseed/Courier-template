"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PublicLayout from "@/layouts/PublicLayout";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { login } from "@/redux/slices/auth/authSlice";
import { updateUser, resetUsers } from "@/redux/slices/users/userSlice";
import type { Role } from "@/lib/types";
import SwiftLineLogo from "@/components/common/SwiftLineLogo";

export default function Login() {
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("demo123");
  const [role, setRole] = useState<Role>("Admin");
  const [error, setError] = useState("");
  const users = useAppSelector((s) => s.users);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const user = users.find(
      (x) =>
        x.email.toLowerCase() === email.toLowerCase() &&
        x.password === password &&
        (x.role === role || (role === "Admin" && (x.role === "Super Admin" || x.role === "Admin"))),
    );
    if (!user) {
      setError("Email, password or role is incorrect.");
      return;
    }
    if (user.status !== "Active") {
      dispatch(updateUser({ id: user.id, status: "Active" }));
    }
    dispatch(
      login({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: role,
        linkedId: user.linkedId,
      }),
    );
    router.push(
      role === "Admin"
        ? "/admin"
        : role === "Merchant"
          ? "/merchant"
          : "/rider",
    );
  };

  const handleResetAccounts = () => {
    dispatch(resetUsers());
    setError("");
    setEmail("admin@demo.com");
    setPassword("demo123");
    setRole("Admin");
  };

  return (
    <PublicLayout>
      <div className="login-wrap">
        <form className="auth-card" onSubmit={submit}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <SwiftLineLogo variant="full" theme="light" height={44} />
          </div>
          <h1>Portal login</h1>
          <p className="muted">Select your role and use an active account.</p>
          {error && <div className="notice text-danger">{error}</div>}
          <div className="field">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => {
                const next = e.target.value as Role;
                setRole(next);
                setEmail(
                  next === "Admin"
                    ? "admin@demo.com"
                    : next === "Merchant"
                      ? "merchant@demo.com"
                      : "rider@demo.com",
                );
              }}
            >
              <option>Admin</option>
              <option>Merchant</option>
              <option>Rider</option>
            </select>
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" style={{ width: "100%" }}>
            Sign in
          </button>
          <div className="demo-box" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>
              <strong>Demo password:</strong> demo123
              <br />
              Admin: admin@demo.com
              <br />
              Merchant: merchant@demo.com
              <br />
              Rider: rider@demo.com
            </div>
            <button
              type="button"
              className="button secondary small"
              onClick={handleResetAccounts}
              style={{ marginTop: "6px" }}
            >
              Reset & Reactivate Demo Accounts
            </button>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}
