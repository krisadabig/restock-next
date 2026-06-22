import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import JoinPageClient from './JoinPageClient';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params;
  const session = await getSession();
  if (!session) {
    redirect(`/login?returnUrl=/join/${code}`);
  }
  return <JoinPageClient code={code} />;
}
