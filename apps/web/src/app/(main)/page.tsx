import { ContinueListeningRow } from '@/components/ContinueListeningRow';
import { ExploreGrid } from '@/components/ExploreGrid';
import { rawFetch } from '@/lib/http';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  coverUrl?: string | null;
  episodeCount: number;
  isPremium: boolean;
  creator: { displayName: string };
}

export default async function HomePage() {
  const res = await rawFetch<ContentItem[]>('/explore');
  const initialContents = res.success && res.data ? res.data : undefined;
  const initialError = !res.success ? res.error?.message : null;

  return (
    <>
      <h1 className="section-title">کاوش</h1>
      <p className="section-subtitle">پادکست، کتاب صوتی و ویدیو — همه در یک جا</p>

      <ContinueListeningRow />

      <ExploreGrid initialContents={initialContents} initialError={initialError} />
    </>
  );
}
