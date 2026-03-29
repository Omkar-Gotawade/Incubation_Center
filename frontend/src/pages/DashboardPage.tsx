import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPrototype, deletePrototype, fetchPrototypes } from "../api/prototypes";
import { sendMeetingEmail } from "../api/admin";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { Prototype } from "../types";

export function DashboardPage() {
  const { user } = useAuth();
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const visiblePrototypes = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.role === "prototyper") {
      return prototypes.filter((item) => item.created_by === user.id);
    }

    return prototypes;
  }, [prototypes, user]);

  const loadPrototypes = async (activeSearch?: string) => {
    setLoading(true);
    try {
      const items = await fetchPrototypes(activeSearch);
      setPrototypes(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPrototypes();
  }, []);

  const onCreatePrototype = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    await createPrototype({ title, description });
    setTitle("");
    setDescription("");
    setMessage("Prototype created successfully.");
    await loadPrototypes(search || undefined);
  };

  const onDeletePrototype = async (prototypeId: number) => {
    await deletePrototype(prototypeId);
    setMessage("Prototype deleted.");
    await loadPrototypes(search || undefined);
  };

  const onSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadPrototypes(search || undefined);
  };

  const onSendMeetingEmail = async () => {
    const response = await sendMeetingEmail();
    setMessage(`${response.message} (${response.recipients_count} recipients)`);
  };

  return (
    <div className="min-h-screen bg-canvas pb-10">
      <Navbar />

      <main className="mx-auto mt-6 max-w-6xl px-4 sm:px-6">
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-lg shadow-black/5">
          <h1 className="font-heading text-3xl text-ink">Role Dashboard</h1>
          <p className="mt-1 text-sm text-ink/70">
            {user?.role === "admin" && "Coordinate teams, communicate updates, and oversee everything."}
            {user?.role === "prototyper" && "Create and track your prototype pipeline in one place."}
            {user?.role === "business" && "Review all prototypes and monitor progress."}
          </p>

          {user?.role === "admin" ? (
            <button
              type="button"
              onClick={onSendMeetingEmail}
              className="mt-5 rounded-lg bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-teal-700"
            >
              Send Meeting Email To All Users
            </button>
          ) : null}

          {user?.role === "prototyper" ? (
            <form onSubmit={onCreatePrototype} className="mt-6 grid gap-3 rounded-xl border border-black/10 bg-canvas/70 p-4">
              <h2 className="font-heading text-xl text-ink">Create Prototype</h2>
              <input
                type="text"
                placeholder="Prototype title"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-lg border border-black/15 bg-white px-3 py-2 outline-none ring-accent focus:ring"
              />
              <textarea
                placeholder="Describe your prototype"
                required
                minLength={10}
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="rounded-lg border border-black/15 bg-white px-3 py-2 outline-none ring-accent focus:ring"
              />
              <button
                type="submit"
                className="w-fit rounded-lg bg-ink px-4 py-2.5 font-semibold text-white transition hover:bg-black"
              >
                Save Prototype
              </button>
            </form>
          ) : null}

          {message ? <p className="mt-4 text-sm font-semibold text-accent">{message}</p> : null}

          <form onSubmit={onSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search prototypes by title"
              className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 outline-none ring-accent focus:ring"
            />
            <button
              type="submit"
              className="rounded-lg bg-warm px-4 py-2.5 font-semibold text-white transition hover:bg-amber-600"
            >
              Search
            </button>
          </form>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? <p className="text-ink/70">Loading prototypes...</p> : null}

          {!loading && visiblePrototypes.length === 0 ? (
            <p className="text-ink/70">No prototypes found for this view.</p>
          ) : null}

          {visiblePrototypes.map((prototype) => {
            const canDelete = user?.role === "admin" || prototype.created_by === user?.id;
            return (
              <article key={prototype.id} className="rounded-xl border border-black/10 bg-white p-4 shadow-lg shadow-black/5">
                <h3 className="font-heading text-xl text-ink">{prototype.title}</h3>
                <p className="mt-2 text-sm text-ink/80">{prototype.description}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink/60">
                  Owner ID: {prototype.created_by}
                </p>
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => void onDeletePrototype(prototype.id)}
                    className="mt-4 rounded-md bg-red-600 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-700"
                  >
                    Delete
                  </button>
                ) : null}
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
