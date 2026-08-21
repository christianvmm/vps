import { randomBytes } from "crypto";
import { refresh } from "next/cache";
import { connection } from "next/server";
import { ensureSchema, query } from "@/lib/db";

type RandomString = {
  id: number;
  value: string;
  created_at: Date;
};

export default async function Home() {
  await connection();
  await ensureSchema();

  const strings = await query<RandomString>(
    "SELECT id, value, created_at FROM random_strings ORDER BY id DESC LIMIT 20",
  );

  async function saveRandomString() {
    "use server";
    await ensureSchema();
    const value = randomBytes(16).toString("hex");
    await query("INSERT INTO random_strings (value) VALUES ($1)", [value]);
    refresh();
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center gap-10 py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <h1 className="max-w-md text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Save a random string
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Click the button to generate a random string and store it in
            Postgres with raw SQL.
          </p>
        </div>
        <form action={saveRandomString}>
          <button
            type="submit"
            className="flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Save random string
          </button>
        </form>
        {strings.length > 0 ? (
          <ul className="w-full space-y-2 font-mono text-sm text-zinc-700 dark:text-zinc-300">
            {strings.map((row) => (
              <li
                key={row.id}
                className="rounded-lg bg-black/[.04] px-4 py-3 dark:bg-white/[.08]"
              >
                {row.value}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-500">No strings saved yet.</p>
        )}
      </main>
    </div>
  );
}
