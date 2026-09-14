import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@printartz/db";
import { FREE_GENERATION_QUOTA } from "@printartz/shared";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ContactButton, HelpButton } from "@/components/info-modals";
import { ReviewsButton } from "@/components/reviews-modal";
import { HomeLink } from "@/components/home-link";
import { ProfileMenu } from "@/components/profile-menu";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;
  const userId = (user as { id?: string } | undefined)?.id;

  let used = 0;
  if (userId) {
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: { freeGenerationsUsed: true },
    });
    used = row?.freeGenerationsUsed ?? 0;
  }

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
          <ReviewsButton />
          <ThemeToggle />
          {user ? (
            <ProfileMenu
              name={user.name ?? null}
              email={user.email ?? null}
              image={user.image ?? null}
              used={used}
              quota={FREE_GENERATION_QUOTA}
            />
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
