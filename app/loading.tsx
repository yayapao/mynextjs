export default function Loading() {
  return (
    <div
      className="flex min-h-[calc(100svh-3rem)] items-center justify-center"
      role="status"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="size-5 animate-spin rounded-full border-2 border-muted border-t-foreground motion-reduce:animate-none"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">加载中</p>
      </div>
    </div>
  );
}
