import Link from "next/link";
import { SITE } from "@printartz/shared";
import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-10 border-b border-black/5 bg-background/80 backdrop-blur-md dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
            {SITE.name}
          </span>
          <span className="text-muted-foreground">.co.in</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/gallery"
            className="text-muted-foreground hidden text-sm font-medium hover:text-foreground sm:inline"
          >
            Examples
          </Link>
          {user ? (
            <>
              <span className="text-muted-foreground hidden text-sm sm:inline">
                {user.name ?? user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/create" });
              }}
            >
              <Button type="submit" size="sm">
                Sign in with Google
              </Button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
