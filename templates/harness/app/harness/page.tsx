import { HarnessPanel } from '@/components/harness/panel';
import { getBrowserRuntime } from '@/lib/harness/runtime';
import { createBrowserHarnessRuntime } from '@/harness/browser/runtime';

export const metadata = { title: 'AI 对话' };
export const dynamic = 'force-dynamic';

export default async function HarnessPage() {
  const runtime = await getBrowserRuntime();
  const initialData = await (
    runtime ?? createBrowserHarnessRuntime()
  ).snapshot();
  return <HarnessPanel initialData={initialData} />;
}
