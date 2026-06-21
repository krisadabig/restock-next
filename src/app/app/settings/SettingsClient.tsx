'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Moon, Sun, Globe, LogOut, Trash2, Fingerprint, ShieldCheck, ChevronRight, Users, Store, Tag, UserCircle, Link, Copy, Check } from 'lucide-react';
import { logout } from '@/app/auth/actions';
import { registerPasskey } from '@/lib/auth';
import { createInvite, updateMemberProfile, leaveSpace, switchSpace } from '@/app/app/actions';
import { useSpace } from '@/components/providers/SpaceContext';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type { Category } from '@/lib/db/schema';

interface Props {
  categories: Category[];
  stores: string[];
}

export default function SettingsClient({ categories, stores }: Props) {
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { spaceId, memberId, displayName, members, mySpaces } = useSpace();
  const [mounted, setMounted] = useState(false);

  // invite state
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  // profile edit state
  const [profileName, setProfileName] = useState(displayName);
  const [profileSaving, setProfileSaving] = useState(false);

  // invite copy state
  const [inviteCopied, setInviteCopied] = useState(false);

  // leave space state
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  // delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyMsg, setPasskeyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleInvite = async () => {
    setInviteLoading(true);
    try {
      const { code } = await createInvite();
      setInviteCode(code);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    try {
      await updateMemberProfile({ displayName: profileName });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLeaveSpace = async () => {
    setLeaveLoading(true);
    try {
      await leaveSpace(spaceId);
    } finally {
      setLeaveLoading(false);
      setShowLeaveConfirm(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const handleAddPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyMsg(null);
    try {
      await registerPasskey();
      setPasskeyMsg({ type: 'success', text: 'Passkey added successfully!' });
    } catch (err) {
      setPasskeyMsg({ type: 'error', text: (err as Error).message });
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try { await logout(); } catch { setIsDeleting(false); }
  };

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 pb-40 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-2xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">{t('settings.title')}</h1>
      </div>

      {/* My Profile */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <UserCircle size={12} />
          {t('settings.myProfile')}
        </h2>
        <div className="glass-card overflow-hidden rounded-[2rem] p-5 space-y-4">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('settings.displayName')}</p>
            <input
              data-testid="profile-display-name-input"
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="input-premium"
            />
          </div>
          <button
            data-testid="profile-save-btn"
            onClick={handleProfileSave}
            disabled={profileSaving || profileName === displayName}
            className="h-11 px-6 rounded-2xl bg-primary text-white font-bold text-sm disabled:opacity-50 transition-all"
          >
            {profileSaving ? t('settings.saving') : t('settings.saveChanges')}
          </button>
        </div>
      </section>

      {/* Members */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <Users size={12} />
          {t('settings.members')}
        </h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          {members.map((m) => (
            <div
              key={m.memberId}
              data-testid={`member-${m.memberId}`}
              className="flex items-center justify-between p-5"
            >
              <span className="text-sm font-semibold text-foreground">
                {m.displayName}
                {m.memberId === memberId && (
                  <span className="ml-2 text-xs text-primary">({t('settings.youLabel')})</span>
                )}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Active</span>
            </div>
          ))}

          {/* Invite */}
          <div className="p-5 space-y-3">
            <button
              data-testid="invite-member-btn"
              onClick={handleInvite}
              disabled={inviteLoading}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:underline disabled:opacity-50"
            >
              <Link size={14} />
              {t('settings.inviteMember')}
            </button>
            {inviteCode && (
              <div className="bg-secondary/30 rounded-2xl p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('settings.inviteCode')}</p>
                <p data-testid="invite-code" className="text-2xl font-mono font-bold tracking-widest text-primary">{inviteCode}</p>
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/join/${inviteCode}`;
                    navigator.clipboard.writeText(url).then(() => {
                      setInviteCopied(true);
                      setTimeout(() => setInviteCopied(false), 2000);
                    });
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all"
                >
                  {inviteCopied ? <Check size={12} /> : <Copy size={12} />}
                  {inviteCopied ? 'Copied!' : 'Copy invite link'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Switch space */}
      {mySpaces.length > 1 && (
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">{t('settings.switchSpace')}</h2>
          <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
            {mySpaces.map((s) => (
              <button
                key={s.id}
                data-testid={`switch-space-${s.id}`}
                type="button"
                disabled={s.id === spaceId}
                onClick={async () => { await switchSpace(s.id); router.refresh(); }}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all disabled:opacity-50 text-left"
              >
                <span className="text-sm font-semibold">{s.name}</span>
                {s.id === spaceId && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Active</span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* My Stores */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <Store size={12} />
          {t('settings.myStores')}
        </h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          {stores.length === 0 ? (
            <p data-testid="no-stores-settings" className="px-5 py-4 text-sm text-muted-foreground">{t('settings.noStores')}</p>
          ) : (
            stores.map((store) => (
              <div key={store} className="flex items-center justify-between p-5">
                <span className="text-sm font-semibold text-foreground">{store}</span>
                <span className="text-primary">✓</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <Tag size={12} />
          {t('settings.categories')}
        </h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          {categories.length === 0 ? (
            <p data-testid="no-categories" className="px-5 py-4 text-sm text-muted-foreground">{t('settings.noCategories')}</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} data-testid={`category-row-${cat.id}`} className="flex items-center justify-between p-5">
                <div>
                  <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{cat.defaultUnit}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">{t('settings.appearance')}</h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-5">
              <div className={`h-14 w-14 flex items-center justify-center rounded-2xl transition-all shadow-inner border border-primary/5 ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-600'}`}>
                {theme === 'light' ? <Sun className="h-6 w-6" strokeWidth={2.5} /> : <Moon className="h-6 w-6" strokeWidth={2.5} />}
              </div>
              <div>
                <span className="block text-lg font-bold text-foreground leading-tight">{t('settings.theme')}</span>
                <span className="text-xs text-muted-foreground font-medium opacity-60">{theme === 'light' ? t('settings.lightMode') : t('settings.darkMode')}</span>
              </div>
            </div>
            <div className="flex bg-secondary/40 p-1.5 rounded-2xl border border-primary/5 relative isolate shadow-inner">
              <button onClick={() => setTheme('light')} className={`relative z-10 h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-300 ${theme === 'light' ? 'text-amber-600' : 'text-muted-foreground/40 hover:text-foreground'}`}><Sun size={20} strokeWidth={2.5} /></button>
              <button onClick={() => setTheme('dark')} className={`relative z-10 h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-300 ${theme === 'dark' ? 'text-indigo-400' : 'text-muted-foreground/40 hover:text-foreground'}`}><Moon size={20} strokeWidth={2.5} /></button>
              <div className={`absolute inset-y-1.5 w-[calc(50%-6px)] h-[calc(100%-12px)] bg-background shadow-lg rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-primary/10 ${theme === 'dark' ? 'translate-x-full left-1.5' : 'left-1.5'}`} />
            </div>
          </div>
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner border border-primary/5"><Globe className="h-6 w-6" strokeWidth={2.5} /></div>
              <span className="text-lg font-bold text-foreground">{t('settings.language')}</span>
            </div>
            <div className="flex bg-secondary/40 p-1.5 rounded-2xl border border-primary/5 shadow-inner">
              <button onClick={() => setLocale('en')} className={`h-11 px-5 text-xs font-bold rounded-xl transition-all ${locale === 'en' ? 'bg-background text-primary shadow-lg border border-primary/10' : 'text-muted-foreground/40 hover:text-foreground'}`}>EN</button>
              <button onClick={() => setLocale('th')} className={`h-11 px-5 text-xs font-bold rounded-xl transition-all ${locale === 'th' ? 'bg-background text-primary shadow-lg border border-primary/10' : 'text-muted-foreground/40 hover:text-foreground'}`}>TH</button>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">Security</h2>
        <div className="glass-card p-6 rounded-[2rem] space-y-6">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 shadow-inner border border-primary/5 shrink-0"><Fingerprint className="h-6 w-6" strokeWidth={2.5} /></div>
            <div className="flex-1 space-y-1 pt-1">
              <p className="text-lg font-bold text-foreground leading-tight">Passkeys</p>
              <p className="text-sm text-muted-foreground font-medium opacity-60 leading-relaxed">Secure your account with FaceID or TouchID.</p>
            </div>
          </div>
          {passkeyMsg && (
            <div className={`p-5 rounded-2xl text-sm font-bold flex items-center gap-4 animate-in slide-in-from-top-2 duration-500 border ${passkeyMsg.type === 'success' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-red-500/5 text-red-500 border-red-500/10'}`}>
              <ShieldCheck className="h-5 w-5 shrink-0" strokeWidth={2.5} />
              {passkeyMsg.text}
            </div>
          )}
          <button onClick={handleAddPasskey} disabled={passkeyLoading} className="w-full h-15 bg-primary text-white font-bold rounded-2xl shadow-lg login-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-3 group">
            {passkeyLoading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Add New Passkey<ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </div>
      </section>

      {/* Account */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">{t('settings.account')}</h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center gap-5 p-6 text-left hover:bg-white/5 transition-all disabled:opacity-50 active:scale-[0.98]">
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-secondary/40 text-muted-foreground shadow-inner border border-primary/5"><LogOut className="h-6 w-6" strokeWidth={2.5} /></div>
            <span className="flex-1 text-lg font-bold text-foreground">{isLoggingOut ? t('app.processing') : t('app.logout')}</span>
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center gap-5 p-6 text-left hover:bg-red-500/5 transition-all group active:scale-[0.98]">
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform shadow-inner border border-red-500/5"><Trash2 className="h-6 w-6" strokeWidth={2.5} /></div>
            <span className="text-lg font-bold text-red-500 group-hover:translate-x-1 transition-transform">{t('settings.deleteAccount')}</span>
          </button>
        </div>
      </section>

      {/* Danger zone — leave space */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-red-500/50 uppercase tracking-[0.2em] px-2">{t('settings.dangerZone')}</h2>
        <div className="glass-card overflow-hidden rounded-[2rem] p-5 space-y-3">
          {!showLeaveConfirm ? (
            <button
              data-testid="leave-space-btn"
              onClick={() => setShowLeaveConfirm(true)}
              className="text-sm font-bold text-red-500 hover:underline"
            >
              {t('settings.leaveSpace')}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-foreground font-medium">{t('settings.leaveSpaceConfirm')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 h-11 rounded-2xl bg-secondary/50 font-bold text-sm"
                >
                  {t('settings.cancel')}
                </button>
                <button
                  data-testid="leave-space-confirm-btn"
                  onClick={handleLeaveSpace}
                  disabled={leaveLoading}
                  className="flex-1 h-11 rounded-2xl bg-red-500 text-white font-bold text-sm disabled:opacity-50"
                >
                  {leaveLoading ? '...' : t('settings.confirm')}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="text-center pt-4 opacity-30">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Restock v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</p>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowDeleteModal(false)} />
          <div className="relative glass w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-500 border border-primary/10 overflow-hidden">
            <div className="sm:hidden w-12 h-1.5 bg-primary/20 rounded-full mx-auto mt-4 mb-2" />
            <div className="p-8 pb-4 flex flex-col items-center text-center space-y-6">
              <div className="h-20 w-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-2 shadow-inner border border-red-500/10"><Trash2 className="text-red-500" size={36} /></div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">{t('settings.confirmDeleteTitle')}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{t('settings.confirmDeleteDesc')}</p>
              </div>
              <div className="w-full space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1 block text-left">{t('settings.typeToDelete')}</label>
                <input type="text" autoFocus value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder={t('settings.deletePlaceholder')} className="w-full h-14 px-5 bg-secondary/30 border border-primary/5 focus:border-red-500/30 focus:bg-secondary/50 focus:ring-4 focus:ring-red-500/5 rounded-2xl transition-all text-foreground font-bold text-center" />
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} className="h-14 bg-secondary/30 text-foreground font-bold rounded-2xl hover:bg-secondary/50 transition-all active:scale-95 disabled:opacity-50 border border-primary/5">{t('settings.cancel')}</button>
              <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== 'DELETE' || isDeleting} className="h-14 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2">{isDeleting ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('settings.confirm')}</button>
            </div>
            <div className="h-[calc(1.5rem+env(safe-area-inset-bottom))] sm:hidden" />
          </div>
        </div>
      )}
    </div>
  );
}
