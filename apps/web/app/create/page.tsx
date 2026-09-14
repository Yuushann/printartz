import { auth, signIn } from "@/auth";
import { prisma } from "@printartz/db";
import { FREE_GENERATION_QUOTA } from "@printartz/shared";
import { Button } from "@/components/ui/button";
import { CreateForm } from "@/components/create-form";
import { PageBackdrop } from "@/components/page-backdrop";

export default async function CreatePage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  return (
    <>
    <PageBackdrop src="/bg/craft-supplies.jpg" />
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">
        Start a{" "}
        <span className="bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-transparent">
          project
        </span>
      </h1>
      <p className="text-muted-foreground mt-2">
        Paste the school instruction, pick the basics, and generate a preview.
      </p>

      <div className="mt-8">
        {userId ? (
          <CreateFormWithQuota userId={userId} />
        ) : (
          <div className="rounded-2xl border bg-gradient-to-br from-fuchsia-50 to-sky-50 p-8 text-center dark:from-fuchsia-950/30 dark:to-sky-950/20">
            <h2 className="text-xl font-semibold">Sign in to generate</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
              You get {FREE_GENERATION_QUOTA} free image generations. Sign in with
              Google to start creating.
            </p>
            <form
              className="mt-5"
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/create" });
              }}
            >
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white hover:from-fuchsia-500 hover:to-violet-500"
              >
                Sign in with Google
              </Button>
            </form>
          </div>
        )}
      </div>
    </main>
    </>
  );
}

async function CreateFormWithQuota({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { freeGenerationsUsed: true },
  });
  const remaining = Math.max(
    0,
    FREE_GENERATION_QUOTA - (user?.freeGenerationsUsed ?? 0),
  );
  return <CreateForm remaining={remaining} />;
}
