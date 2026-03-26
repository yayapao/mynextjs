'use client';
import { Button } from '@/components/ui/button';
import { useGlobal } from '@/lib/providers/global';

export default function Home() {
  const userInfo = useGlobal((state) => state.user_info);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome, {userInfo?.name}
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          A minimal landing page built with Next.js
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button size="lg">Get Started</Button>
        <Button variant="outline" size="lg">
          Learn More
        </Button>
      </div>
    </div>
  );
}
