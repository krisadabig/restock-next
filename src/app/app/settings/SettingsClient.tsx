'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Moon, Sun, Globe, LogOut, Trash2, Fingerprint, ShieldCheck, ChevronRight, Users, Store, Tag, Layers, Pencil, X, Check } from 'lucide-react';
import { logout } from '@/app/auth/actions';
import { registerPasskey } from '@/lib/auth';
import { addGroup, renameGroup, deleteGroup, assignItemToGroup, removeItemFromGroup } from '@/app/app/actions';
import { useTheme } from 'next-themes';
import type { Category } from '@/lib/db/schema';

interface Member {
  userId: string;
  username: string;
}

interface GroupItem {
  id: number;
  name: string;
}

interface GroupWithItems {
  id: number;
  name: string;
  items: GroupItem[];
}

interface Props {
  currentUserId: string;
  members: Member[];
  categories: Category[];
  stores: string[];
  groups: GroupWithItems[];
  allItems: GroupItem[];
}

export default function SettingsClient({ currentUserId, members, categories, stores, groups, allItems }: Props) {
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyMsg, setPasskeyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Group management state
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [renamingGroupId, setRenamingGroupId] = useState<number | null>(null);
  const [renameText, setRenameText] = useState('');
  const [deletingGroupId, setDeletingGroupId] = useState<number | null>(null);
  const [groupSaving, setGroupSaving] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);

  // suppress the router import warning
  void router;

  useEffect(() => {
    setMounted(true);
  }, []);

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
    try {
      await logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      setIsDeleting(false);
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newGroupName.trim();
    if (!name) return;
    setGroupSaving(true);
    try {
      await addGroup({ name });
      setNewGroupName('');
      setShowAddGroup(false);
      router.refresh();
    } finally {
      setGroupSaving(false);
    }
  };

  const handleRenameGroup = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    const name = renameText.trim();
    if (!name) return;
    setGroupSaving(true);
    try {
      await renameGroup(id, { name });
      setRenamingGroupId(null);
      router.refresh();
    } finally {
      setGroupSaving(false);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    setGroupSaving(true);
    try {
      await deleteGroup(id);
      setDeletingGroupId(null);
      router.refresh();
    } finally {
      setGroupSaving(false);
    }
  };

  const handleToggleItemInGroup = async (groupId: number, itemId: number, isCurrentlyAssigned: boolean) => {
    if (isCurrentlyAssigned) {
      await removeItemFromGroup(groupId, itemId);
    } else {
      await assignItemToGroup(groupId, itemId);
    }
    router.refresh();
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
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          {t('settings.title')}
        </h1>
      </div>

      {/* Household */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <Users size={12} />
          {t('settings.household')}
        </h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          {members.map((m) => (
            <div
              key={m.userId}
              data-testid={`member-${m.userId}`}
              className="flex items-center justify-between p-5"
            >
              <span className="text-sm font-semibold text-foreground">
                {m.username}
                {m.userId === currentUserId && (
                  <span className="ml-2 text-xs text-primary">({t('settings.youLabel')})</span>
                )}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                Active
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* My Stores */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <Store size={12} />
          {t('settings.myStores')}
        </h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          {stores.length === 0 ? (
            <p data-testid="no-stores-settings" className="px-5 py-4 text-sm text-muted-foreground">
              {t('settings.noStores')}
            </p>
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
            <p data-testid="no-categories" className="px-5 py-4 text-sm text-muted-foreground">
              {t('settings.noCategories')}
            </p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                data-testid={`category-row-${cat.id}`}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{cat.defaultUnit}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Groups */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <Layers size={12} />
          {t('settings.groups')}
        </h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          {groups.length === 0 ? (
            <p data-testid="no-groups" className="px-5 py-4 text-sm text-muted-foreground">
              {t('settings.noGroups')}
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.id} data-testid={`group-row-${group.id}`} className="p-5 space-y-2">
                {renamingGroupId === group.id ? (
                  <form
                    data-testid={`rename-group-form-${group.id}`}
                    onSubmit={(e) => handleRenameGroup(e, group.id)}
                    className="flex gap-2"
                  >
                    <input
                      data-testid={`rename-group-input-${group.id}`}
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      className="input-premium h-9 text-sm flex-1"
                      autoFocus
                    />
                    <button type="submit" disabled={groupSaving} className="h-9 px-3 bg-primary text-white rounded-xl text-xs font-bold">
                      <Check size={14} />
                    </button>
                    <button type="button" onClick={() => setRenamingGroupId(null)} className="h-9 px-3 bg-secondary/40 rounded-xl text-xs">
                      <X size={14} />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{group.name}</span>
                    <div className="flex gap-2">
                      {deletingGroupId === group.id ? (
                        <>
                          <button
                            data-testid={`confirm-delete-group-${group.id}`}
                            onClick={() => handleDeleteGroup(group.id)}
                            disabled={groupSaving}
                            className="h-8 px-3 bg-red-500 text-white rounded-xl text-[10px] font-bold"
                          >
                            {t('settings.confirmDeleteGroup')}
                          </button>
                          <button
                            onClick={() => setDeletingGroupId(null)}
                            className="h-8 px-3 bg-secondary/40 rounded-xl text-[10px]"
                          >
                            {t('settings.cancel')}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            data-testid={`manage-items-${group.id}`}
                            onClick={() => setExpandedGroupId(expandedGroupId === group.id ? null : group.id)}
                            className="h-8 px-3 bg-secondary/40 rounded-xl text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {t('settings.manageItems')}
                          </button>
                          <button
                            data-testid={`rename-group-${group.id}`}
                            onClick={() => { setRenamingGroupId(group.id); setRenameText(group.name); }}
                            className="h-8 px-3 bg-secondary/40 rounded-xl text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            data-testid={`delete-group-${group.id}`}
                            onClick={() => setDeletingGroupId(group.id)}
                            className="h-8 px-3 bg-secondary/40 rounded-xl text-[10px] font-bold text-red-500/70 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Item assignment panel */}
                {expandedGroupId === group.id ? (
                  <div className="mt-2 space-y-1 pl-1">
                    {allItems.map((item) => {
                      const assigned = group.items.some((gi) => gi.id === item.id);
                      return (
                        <label key={item.id} className="flex items-center gap-2 py-1 cursor-pointer">
                          <input
                            type="checkbox"
                            data-testid={`item-checkbox-${group.id}-${item.id}`}
                            checked={assigned}
                            onChange={() => handleToggleItemInGroup(group.id, item.id, assigned)}
                            className="h-4 w-4 rounded border-primary/30 text-primary accent-primary"
                          />
                          <span className="text-xs font-medium text-foreground">{item.name}</span>
                        </label>
                      );
                    })}
                    {allItems.length === 0 && (
                      <span className="text-[10px] text-muted-foreground/50">No items in household</span>
                    )}
                  </div>
                ) : (
                  <div data-testid={`group-items-${group.id}`} className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center h-6 px-2.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold"
                      >
                        {item.name}
                      </span>
                    ))}
                    {group.items.length === 0 && (
                      <span className="text-[10px] text-muted-foreground/50">No items assigned</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add group */}
        {showAddGroup ? (
          <form
            data-testid="add-group-form"
            onSubmit={handleAddGroup}
            className="flex gap-2"
          >
            <input
              data-testid="add-group-input"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder={t('settings.groupNamePlaceholder')}
              className="input-premium h-11 text-sm flex-1"
              autoFocus
            />
            <button type="submit" disabled={groupSaving} className="h-11 px-4 bg-primary text-white rounded-2xl text-sm font-bold">
              {groupSaving ? t('settings.saving') : t('app.save')}
            </button>
            <button type="button" onClick={() => { setShowAddGroup(false); setNewGroupName(''); }} className="h-11 px-4 bg-secondary/40 rounded-2xl text-sm">
              {t('settings.cancel')}
            </button>
          </form>
        ) : (
          <button
            data-testid="add-group-btn"
            onClick={() => setShowAddGroup(true)}
            className="w-full h-11 bg-secondary/30 border border-dashed border-primary/20 rounded-2xl text-sm font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            {t('settings.addGroup')}
          </button>
        )}
      </section>

      {/* Appearance */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">
          {t('settings.appearance')}
        </h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-5">
              <div className={`h-14 w-14 flex items-center justify-center rounded-2xl transition-all shadow-inner border border-primary/5 ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-600'}`}>
                {theme === 'light' ? <Sun className="h-6 w-6" strokeWidth={2.5} /> : <Moon className="h-6 w-6" strokeWidth={2.5} />}
              </div>
              <div>
                <span className="block text-lg font-bold text-foreground leading-tight">
                  {t('settings.theme')}
                </span>
                <span className="text-xs text-muted-foreground font-medium opacity-60">
                  {theme === 'light' ? t('settings.lightMode') : t('settings.darkMode')}
                </span>
              </div>
            </div>
            <div className="flex bg-secondary/40 p-1.5 rounded-2xl border border-primary/5 relative isolate shadow-inner">
              <button
                onClick={() => setTheme('light')}
                className={`relative z-10 h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-300 ${theme === 'light' ? 'text-amber-600' : 'text-muted-foreground/40 hover:text-foreground'}`}
              >
                <Sun size={20} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`relative z-10 h-11 w-11 flex items-center justify-center rounded-xl transition-all duration-300 ${theme === 'dark' ? 'text-indigo-400' : 'text-muted-foreground/40 hover:text-foreground'}`}
              >
                <Moon size={20} strokeWidth={2.5} />
              </button>
              <div className={`absolute inset-y-1.5 w-[calc(50%-6px)] h-[calc(100%-12px)] bg-background shadow-lg rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-primary/10 ${theme === 'dark' ? 'translate-x-full left-1.5' : 'left-1.5'}`} />
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner border border-primary/5">
                <Globe className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-foreground">{t('settings.language')}</span>
            </div>
            <div className="flex bg-secondary/40 p-1.5 rounded-2xl border border-primary/5 shadow-inner">
              <button
                onClick={() => setLocale('en')}
                className={`h-11 px-5 text-xs font-bold rounded-xl transition-all ${locale === 'en' ? 'bg-background text-primary shadow-lg border border-primary/10' : 'text-muted-foreground/40 hover:text-foreground'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('th')}
                className={`h-11 px-5 text-xs font-bold rounded-xl transition-all ${locale === 'th' ? 'bg-background text-primary shadow-lg border border-primary/10' : 'text-muted-foreground/40 hover:text-foreground'}`}
              >
                TH
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">
          Security
        </h2>
        <div className="glass-card p-6 rounded-[2rem] space-y-6">
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 shadow-inner border border-primary/5 shrink-0">
              <Fingerprint className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div className="flex-1 space-y-1 pt-1">
              <p className="text-lg font-bold text-foreground leading-tight">Passkeys</p>
              <p className="text-sm text-muted-foreground font-medium opacity-60 leading-relaxed">
                Secure your account with FaceID or TouchID.
              </p>
            </div>
          </div>
          {passkeyMsg && (
            <div className={`p-5 rounded-2xl text-sm font-bold flex items-center gap-4 animate-in slide-in-from-top-2 duration-500 border ${passkeyMsg.type === 'success' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-red-500/5 text-red-500 border-red-500/10'}`}>
              <ShieldCheck className="h-5 w-5 shrink-0" strokeWidth={2.5} />
              {passkeyMsg.text}
            </div>
          )}
          <button
            onClick={handleAddPasskey}
            disabled={passkeyLoading}
            className="w-full h-15 bg-primary text-white font-bold rounded-2xl shadow-lg login-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-3 group"
          >
            {passkeyLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Add New Passkey
                <ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Account */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-2">
          {t('settings.account')}
        </h2>
        <div className="glass-card overflow-hidden rounded-[2rem] divide-y divide-primary/5">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-5 p-6 text-left hover:bg-white/5 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-secondary/40 text-muted-foreground shadow-inner border border-primary/5">
              <LogOut className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <span className="flex-1 text-lg font-bold text-foreground">
              {isLoggingOut ? t('app.processing') : t('app.logout')}
            </span>
            {isLoggingOut && <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center gap-5 p-6 text-left hover:bg-red-500/5 transition-all group active:scale-[0.98]"
          >
            <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform shadow-inner border border-red-500/5">
              <Trash2 className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-red-500 group-hover:translate-x-1 transition-transform">
              {t('settings.deleteAccount')}
            </span>
          </button>
        </div>
      </section>

      {/* Version Footer */}
      <div className="text-center pt-4 opacity-30">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">
          Restock v{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
        </p>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setShowDeleteModal(false)} />
          <div className="relative glass w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-500 border border-primary/10 overflow-hidden">
            <div className="sm:hidden w-12 h-1.5 bg-primary/20 rounded-full mx-auto mt-4 mb-2" />
            <div className="p-8 pb-4 flex flex-col items-center text-center space-y-6">
              <div className="h-20 w-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-2 shadow-inner border border-red-500/10">
                <Trash2 className="text-red-500" size={36} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">{t('settings.confirmDeleteTitle')}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{t('settings.confirmDeleteDesc')}</p>
              </div>
              <div className="w-full space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-1 block text-left">
                  {t('settings.typeToDelete')}
                </label>
                <input
                  type="text"
                  autoFocus
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={t('settings.deletePlaceholder')}
                  className="w-full h-14 px-5 bg-secondary/30 border border-primary/5 focus:border-red-500/30 focus:bg-secondary/50 focus:ring-4 focus:ring-red-500/5 rounded-2xl transition-all text-foreground font-bold text-center"
                />
              </div>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="h-14 bg-secondary/30 text-foreground font-bold rounded-2xl hover:bg-secondary/50 transition-all active:scale-95 disabled:opacity-50 border border-primary/5"
              >
                {t('settings.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="h-14 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isDeleting ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : t('settings.confirm')}
              </button>
            </div>
            <div className="h-[calc(1.5rem+env(safe-area-inset-bottom))] sm:hidden" />
          </div>
        </div>
      )}
    </div>
  );
}
