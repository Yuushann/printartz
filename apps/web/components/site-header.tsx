import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ContactButton, HelpButton } from "@/components/info-modals";
import { HomeLink } from "@/components/home-link";
import Link from "next/link";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="bg-[var(--header)] sticky top-0 z-20 border-b border-border shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        {/* far-left: Home (hidden on the homepage itself) */}
        <div className="flex items-center">
          <HomeLink />
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/gallery"
            className="text-muted-foreground hidden text-sm font-medium hover:text-foreground sm:inline"
          >
            Examples
          </Link>
        <ContactButton />
        <HelpButton />
        <ThemeToggle />
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
