"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiFetch, apiJson } from "@/lib/api/http";
import type { Role } from "@/types/session";

type UserRow = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  active?: boolean;
};

const ROLES: Role[] = ["SYSTEM_ADMIN", "PLANT_MANAGER", "FIELD_OPERATOR", "READ_ONLY"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "READ_ONLY" as Role,
    tailingDamIds: "",
  });

  function load() {
    setError(null);
    apiJson<UserRow[]>("users")
      .then(setUsers)
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "Error al cargar usuarios");
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const dams = form.tailingDamIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await apiJson("users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          role: form.role,
          tailingDamIds: dams.length ? dams : [],
        }),
      });
      setForm({ email: "", password: "", fullName: "", role: "READ_ONLY", tailingDamIds: "" });
      load();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.body ?? `Error ${err.status}` : "Error al crear");
    } finally {
      setBusy(false);
    }
  }

  async function updateRole(userId: string, role: Role) {
    setBusy(true);
    try {
      await apiJson(`users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      load();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.body ?? `Error ${err.status}` : "Error al actualizar rol");
    } finally {
      setBusy(false);
    }
  }

  async function removeUser(userId: string) {
    if (!confirm("Eliminar usuario?")) {
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch(`users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text();
        throw new ApiError(`HTTP ${res.status}`, res.status, t);
      }
      load();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.body ?? `Error ${err.status}` : "Error al eliminar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Usuarios" description="GET/POST/PATCH/DELETE /v1/users — SYSTEM_ADMIN." />
      {error ? <p className="text-sm text-amber-400">{error}</p> : null}

      <form onSubmit={(ev) => void createUser(ev)} className="mt-6 max-w-lg space-y-3 rounded-lg border border-slate-800 p-4 text-sm">
        <p className="font-medium text-slate-200">Nuevo usuario</p>
        <div>
          <label className="text-xs text-slate-500">Correo</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Contrasena</label>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Nombre completo</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Rol</label>
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Tranques (UUID separados por coma)</label>
          <input
            value={form.tailingDamIds}
            onChange={(e) => setForm((f) => ({ ...f, tailingDamIds: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-teal-700 px-4 py-2 text-xs text-white hover:bg-teal-600 disabled:opacity-50"
        >
          Crear
        </button>
      </form>

      <h2 className="mt-8 text-sm font-semibold text-slate-300">Listado</h2>
      <ul className="mt-2 space-y-3 text-sm">
        {users.map((u) => (
          <li key={u.id} className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2">
            <p className="text-slate-200">{u.fullName}</p>
            <p className="text-xs text-slate-500">{u.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={u.role}
                disabled={busy}
                onChange={(e) => void updateRole(u.id, e.target.value as Role)}
                className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busy}
                onClick={() => void removeUser(u.id)}
                className="text-xs text-red-400 hover:underline disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
