'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { joinByInviteCode } from '@/app/app/actions';

interface Props {
  code: string;
}

export default function JoinPageClient({ code }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setError(null);
    setLoading(true);
    try {
      await joinByInviteCode(code);
      router.push('/app');
    } catch (e) {
      const msg = (e as Error).message;
      if (msg === 'Code expired') {
        setError(t('join.expired'));
      } else if (msg === 'Already a member') {
        setError(t('join.alreadyMember'));
      } else {
        // 'Invalid code' | 'Already used' | anything else
        setError(t('join.invalid'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-sm p-8 rounded-3xl space-y-6 text-center">
        <p className="text-lg font-semibold text-foreground">{t('join.title')}</p>

        {error && (
          <p
            data-testid="join-error"
            className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleAccept}
          disabled={loading}
          className="w-full bg-primary text-white h-14 rounded-2xl text-base font-bold login-glow shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? t('app.processing') : t('join.accept')}
        </button>
      </div>
    </div>
  );
}
