import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Listing, 
  Seller, 
  CategoryId, 
  Condition, 
  Conversation, 
  ChatMessage, 
  EscrowPayment, 
  ReportItem,
  PlatformSettings,
  AppNotification
} from '../types';
import { DEFAULT_PLATFORM_SETTINGS } from '../data/mockData';
import { supabase } from '../lib/supabase';

export type SortOption = 'latest' | 'price_asc' | 'price_desc' | 'popular';
export type ActiveTab = 'home' | 'explore' | 'messages' | 'profile' | 'admin';
export type AuthMode = 'login' | 'register' | 'otp' | 'forgot_password' | 'email_confirmation_sent';

interface AppContextType {
  listings: Listing[];
  favorites: string[];
  currentUser: Seller | null;
  notifications: AppNotification[];
  isAuthModalOpen: boolean;
  authMode: AuthMode;
  pendingOtpCode: string;
  pendingPhone: string;
  pendingConfirmationEmail: string;
  isPasswordRecovery: boolean;

  conversations: Conversation[];
  activeConversation: Conversation | null;
  escrowPayments: EscrowPayment[];
  reports: ReportItem[];
  selectedListing: Listing | null;
  
  // Filters
  searchQuery: string;
  selectedCategory: CategoryId | 'all';
  selectedCity: string;
  selectedNeighborhood: string;
  priceMin: string;
  priceMax: string;
  selectedCondition: Condition | 'all';
  sortOption: SortOption;
  onlyNegotiable: boolean;
  onlyDelivered: boolean;
  onlyVerified: boolean;
  
  // Navigation & Modals
  activeTab: ActiveTab;
  isCreateListingOpen: boolean;
  isChatOpen: boolean;
  isEscrowModalOpen: boolean;
  isProfileModalOpen: boolean;
  isAdminModalOpen: boolean;
  isAdminAuthModalOpen: boolean;
  isSafetyModalOpen: boolean;
  isReportModalOpen: boolean;
  targetReportListing: Listing | null;
  isMobileSimulator: boolean;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;


  // Actions
  setAuthMode: (mode: AuthMode) => void;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  loginUser: (identifier: string, pass: string) => Promise<boolean>;
  registerUser: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    accountType: 'particulier' | 'professionnel';
    shopName?: string;
    city: string;
    neighborhood?: string;
    avatar?: string;
  }) => Promise<boolean>;

  setPendingConfirmationEmail: (email: string) => void;
  resendConfirmationEmail: (email: string) => Promise<boolean>;
  verifyOtp: (code: string) => boolean;
  resendOtp: () => string;
  resetPasswordRequest: (identifier: string) => Promise<boolean>;
  confirmPasswordReset: (newPass: string) => void;

  logoutUser: () => void;
  updateUserProfile: (data: Partial<Seller>) => void;
  deleteUserAccount: () => void;
  markNotificationAsRead: (id: string) => void;
  switchUserAccount: (userId: string) => void;

  // Admin exclusive states
  isAdminAuthenticated: boolean;
  superAdminEmail: string;
  allUsers: Seller[];
  platformSettings: {
    escrowFeePercent: number;
    boostPriceFCFA: number;
    maintenanceMode: boolean;
    autoApproveListings: boolean;
  };

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: CategoryId | 'all') => void;
  setSelectedCity: (city: string) => void;
  setSelectedNeighborhood: (n: string) => void;
  setPriceMin: (p: string) => void;
  setPriceMax: (p: string) => void;
  setSelectedCondition: (c: Condition | 'all') => void;
  setSortOption: (s: SortOption) => void;
  setOnlyNegotiable: (n: boolean) => void;
  setOnlyDelivered: (d: boolean) => void;
  setOnlyVerified: (v: boolean) => void;
  resetFilters: () => void;

  setActiveTab: (tab: ActiveTab) => void;
  setIsCreateListingOpen: (open: boolean) => void;
  setIsChatOpen: (open: boolean) => void;
  setIsEscrowModalOpen: (open: boolean) => void;
  setIsProfileModalOpen: (open: boolean) => void;
  setIsAdminModalOpen: (open: boolean) => void;
  setIsAdminAuthModalOpen: (open: boolean) => void;
  setIsSafetyModalOpen: (open: boolean) => void;
  setIsReportModalOpen: (open: boolean) => void;
  setTargetReportListing: (listing: Listing | null) => void;
  setIsMobileSimulator: (isSim: boolean) => void;
  setActiveConversation: (conv: Conversation | null) => void;

  // Admin methods
  loginAsAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  toggleUserVerification: (userId: string) => void;
  toggleUserBlocked: (userId: string) => void;
  adminDeleteListing: (listingId: string) => void;
  adminToggleBoost: (listingId: string) => void;
  releaseEscrowFunds: (paymentId: string) => void;
  refundEscrowPayment: (paymentId: string) => void;
  updatePlatformSettings: (settings: Partial<{
    escrowFeePercent: number;
    boostPriceFCFA: number;
    maintenanceMode: boolean;
    autoApproveListings: boolean;
  }>) => void;

  toggleFavorite: (id: string) => void;
  openListingDetail: (listing: Listing) => void;
  closeListingDetail: () => void;
  addListing: (newListing: {
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: CategoryId;
    condition: Condition;
    images: string[];
    city: string;
    neighborhood: string;
    isNegotiable: boolean;
    hasDelivery: boolean;
    deliveryFee?: number;
    isBoosted?: boolean;
  }) => void;
  deleteListing: (id: string) => void;
  markAsSold: (id: string) => void;
  boostListing: (id: string) => void;
  
  startChatWithSeller: (listing: Listing, quickMessage?: string) => void;
  sendMessage: (conversationId: string, text: string, isOffer?: boolean, offerAmount?: number) => void;
  respondToOffer: (conversationId: string, messageId: string, accept: boolean) => void;
  
  initiateEscrowPayment: (
    listing: Listing, 
    paymentMethod: 'wave' | 'orange_money', 
    deliveryType: 'hand_delivery' | 'courier'
  ) => void;
  confirmEscrowDelivery: (paymentId: string) => void;
  
  submitReport: (listingId: string, listingTitle: string, reason: string, details: string) => void;
  resolveReport: (reportId: string, action: 'dismiss' | 'remove_listing') => void;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';

const profileToSeller = (p: any, email?: string): Seller => ({
  id: p.id, name: p.name || 'Utilisateur', email, role: p.role, avatar: p.avatar_url || DEFAULT_AVATAR,
  phone: p.phone || '', whatsapp: p.whatsapp || p.phone || '', city: p.city || 'Dakar', neighborhood: p.neighborhood || '',
  rating: 0, reviewCount: 0,
  memberSince: new Date(p.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
  isVerified: !!p.is_verified, isBlocked: !!p.is_blocked, accountType: p.account_type === 'pro' ? 'professionnel' : 'particulier', shopName: p.shop_name || undefined,
  responseTime: '', totalSales: 0, salesCount: 0, activeListingsCount: 0
});

const rowToListing = (r: any): Listing => ({
  id: r.id, title: r.title, description: r.description || '', price: r.price,
  originalPrice: r.original_price ?? undefined, currency: 'FCFA', category: r.category, condition: r.condition,
  images: r.images || [], city: r.city, neighborhood: r.neighborhood || '', sellerId: r.seller_id,
  seller: {
    id: r.seller_id, name: r.seller_name || 'Vendeur SamaDeal', avatar: DEFAULT_AVATAR, phone: r.seller_phone || '',
    whatsapp: r.seller_whatsapp || r.seller_phone || '', city: r.city, neighborhood: r.neighborhood || '',
    rating: 0, reviewCount: 0, memberSince: r.seller_member_since || '', isVerified: !!r.seller_is_verified,
    responseTime: '', totalSales: 0, salesCount: 0, activeListingsCount: 0
  } as Seller, isNegotiable: r.is_negotiable, hasDelivery: r.has_delivery,
  deliveryFee: r.delivery_fee ?? undefined, isFeatured: r.is_featured, status: r.status,
  createdAt: new Date(r.created_at).toLocaleDateString('fr-FR'), viewsCount: r.views_count, favoritesCount: 0
});

// Envoie une image (data URL) vers Supabase Storage et renvoie son URL publique
const uploadImage = async (dataUrl: string, uid: string, bucket = 'listing-images'): Promise<string> => {
  if (!dataUrl.startsWith('data:')) return dataUrl;
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${blob.type.split('/')[1] || 'jpg'}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or defaults
  const [listings, setListings] = useState<Listing[]>([]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('samadeal_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<Seller | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [pendingOtpCode, setPendingOtpCode] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const [pendingUserRegistration, setPendingUserRegistration] = useState<Partial<Seller> | null>(null);


  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const [escrowPayments, setEscrowPayments] = useState<EscrowPayment[]>([]);

  const [reports, setReports] = useState<ReportItem[]>([]);

  // Selected Listing Detail Modal
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState('Toutes les villes');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Tous les quartiers');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<Condition | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('latest');
  const [onlyNegotiable, setOnlyNegotiable] = useState(false);
  const [onlyDelivered, setOnlyDelivered] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isCreateListingOpen, setIsCreateListingOpenRaw] = useState(false);
  const [isChatOpen, setIsChatOpenRaw] = useState(false);
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpenRaw] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpenRaw] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [targetReportListing, setTargetReportListing] = useState<Listing | null>(null);
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);


  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  // Le rôle admin vient de la base (table profiles) et est protégé par RLS : plus aucun PIN côté client.
  const isAdminAuthenticated = currentUser?.role === 'admin';

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    try {
      const saved = localStorage.getItem('samadeal_platform_settings');
      return saved ? JSON.parse(saved) : DEFAULT_PLATFORM_SETTINGS;
    } catch {
      return DEFAULT_PLATFORM_SETTINGS;
    }
  });

  const [allUsers, setAllUsers] = useState<Seller[]>([]);

  // Sync state to localStorage

  useEffect(() => {
    try {
      localStorage.setItem('samadeal_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem('samadeal_conversations', JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed to save conversations to localStorage', e);
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem('samadeal_escrow', JSON.stringify(escrowPayments));
    } catch (e) {
      console.warn('Failed to save escrow to localStorage', e);
    }
  }, [escrowPayments]);

  useEffect(() => {
    try {
      localStorage.setItem('samadeal_reports', JSON.stringify(reports));
    } catch (e) {
      console.warn('Failed to save reports to localStorage', e);
    }
  }, [reports]);


  useEffect(() => {
    try {
      localStorage.setItem('samadeal_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage', e);
    }
  }, [notifications]);

  // Session Supabase -> profil
  useEffect(() => {
    const loadProfile = async (user: any) => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!data) return;
      if (data.is_blocked) {
        await supabase.auth.signOut();
        showToast('Ce compte a été suspendu par les administrateurs SamaDeal.', 'warning');
        return;
      }
      setCurrentUser(profileToSeller(data, user.email));
    };
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadProfile(session.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setAuthMode('forgot_password');
        setIsAuthModalOpen(true);
      }
      if (session?.user) setTimeout(() => loadProfile(session.user), 0);
      else {
        setCurrentUser(null);
        setIsProfileModalOpenRaw(false); setIsCreateListingOpenRaw(false); setIsChatOpenRaw(false); setIsAdminModalOpenRaw(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Annonces publiques depuis Supabase
  useEffect(() => {
    supabase.from('listings').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.warn('Chargement des annonces :', error.message); return; }
        setListings((data || []).map(rowToListing));
      });
  }, [currentUser?.id]);

  // Données réservées à l'admin (RLS côté serveur)
  useEffect(() => {
    if (currentUser?.role !== 'admin') { setAllUsers([]); setReports([]); return; }
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => data && setAllUsers(data.map((p: any) => profileToSeller(p))));
    supabase.from('reports').select('*, listings(title)').order('created_at', { ascending: false })
      .then(({ data }) => data && setReports(data.map((r: any) => ({
        id: r.id, listingId: r.listing_id || '', listingTitle: r.listings?.title || '(annonce supprimée)',
        reason: r.reason, details: r.details || '', createdAt: new Date(r.created_at).toLocaleDateString('fr-FR'),
        status: r.status
      }))));
  }, [currentUser?.id, currentUser?.role]);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const openAuthModal = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Garde des espaces privés : c'est la session Supabase (getSession) qui fait foi, pas l'état local.
  // Sans session -> on renvoie vers la connexion (ici une fenêtre : le site n'a pas de page /login).
  const requireSession = async (): Promise<boolean> => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return true;
    setCurrentUser(null);
    setActiveTab('home');
    openAuthModal('login');
    showToast('Connectez-vous pour accéder à cet espace.', 'info');
    return false;
  };
  const guarded = (setRaw: (v: boolean) => void) => (open: boolean) => {
    if (!open) { setRaw(false); return; }
    requireSession().then(ok => { if (ok) setRaw(true); });
  };
  const setIsCreateListingOpen = guarded(setIsCreateListingOpenRaw);
  const setIsChatOpen = guarded(setIsChatOpenRaw);
  const setIsProfileModalOpen = guarded(setIsProfileModalOpenRaw);
  // Espace admin : session + rôle admin lu en base (sans session -> formulaire de connexion admin)
  const setIsAdminModalOpen = (open: boolean) => {
    if (!open) { setIsAdminModalOpenRaw(false); return; }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setIsAdminAuthModalOpen(true); return; }
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single();
      if (prof?.role === 'admin') setIsAdminModalOpenRaw(true);
      else showToast('Accès réservé aux administrateurs.', 'warning');
    });
  };

  // Une fois le compte confirmé (session créée), on ferme l'écran « vérifiez votre e-mail »
  useEffect(() => {
    if (currentUser && isAuthModalOpen && authMode === 'email_confirmation_sent') {
      setIsAuthModalOpen(false);
      showToast('Compte confirmé ! Bienvenue sur SamaDeal 🇸🇳', 'success');
    }
  }, [currentUser, isAuthModalOpen, authMode]);

  const loginUser = async (identifier: string, pass: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: identifier.trim(), password: pass });
    if (error || !data.session) {
      showToast(error?.message.includes('not confirmed') ? 'Vérifiez votre e-mail et confirmez votre compte avant de vous connecter.' : 'E-mail ou mot de passe incorrect.', 'warning');
      return false;
    }
    setIsAuthModalOpen(false);
    showToast('Bienvenue sur SamaDeal ! 🇸🇳', 'success');
    return true;
  };

  const registerUser = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    accountType: 'particulier' | 'professionnel';
    shopName?: string;
    city: string;
    neighborhood?: string;
    avatar?: string;
  }): Promise<boolean> => {
    if (!data.name.trim() || !data.email.trim() || !data.phone.trim() || !data.password || !data.confirmPassword) {
      showToast('Veuillez remplir tous les champs obligatoires (Nom, Email, Téléphone, Mot de passe).', 'warning');
      return false;
    }
    if (data.password !== data.confirmPassword) {
      showToast('Les mots de passe ne correspondent pas.', 'warning');
      return false;
    }
    if (data.accountType === 'professionnel' && (!data.shopName || !data.shopName.trim())) {
      showToast('Le nom de la boutique est obligatoire pour les comptes professionnels.', 'warning');
      return false;
    }

    const { data: res, error } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name: data.name.trim(), phone: data.phone.trim(), city: data.city || 'Dakar',
          neighborhood: data.neighborhood || '', account_type: data.accountType === 'professionnel' ? 'pro' : 'particulier', shop_name: data.shopName?.trim() || ''
        }
      }
    });
    if (error) {
      showToast(error.message.includes('registered') ? 'Cette adresse e-mail est déjà utilisée.' : `Inscription impossible : ${error.message}`, 'warning');
      return false;
    }
    if (res.user && res.user.identities?.length === 0) {
      showToast('Cette adresse e-mail est déjà utilisée. Connectez-vous.', 'warning');
      return false;
    }
    if (res.session) {
      setIsAuthModalOpen(false);
      showToast('Bienvenue sur SamaDeal ! 🎉', 'success');
      return true;
    }
    setPendingConfirmationEmail(data.email.trim());
    setAuthMode('email_confirmation_sent');
    showToast('Vérifiez votre e-mail et confirmez votre compte avant de vous connecter. ✉️', 'info');
    return true;
  };

  const resendConfirmationEmail = async (email: string): Promise<boolean> => {
    const targetEmail = (email || pendingConfirmationEmail).trim();
    if (!targetEmail) {
      showToast('Veuillez renseigner votre adresse e-mail.', 'warning');
      return false;
    }

    if (supabase) {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: targetEmail,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
          }
        });
        if (error) {
          showToast(`Erreur Supabase : ${error.message}`, 'warning');
          return false;
        }
      } catch (err: any) {
        showToast('Envoi impossible pour le moment.', 'warning');
        return false;
      }
    }

    showToast(`Lien de confirmation renvoyé par Supabase à ${targetEmail} ! ✉️`, 'success');
    return true;
  };



  const verifyOtp = (_code: string): boolean => {
    showToast('La vérification par SMS n\'est pas disponible.', 'warning');
    return false;
  };

  const resendOtp = (): string => '';

  const resetPasswordRequest = async (identifier: string): Promise<boolean> => {
    const { error } = await supabase.auth.resetPasswordForEmail(identifier.trim(), { redirectTo: window.location.origin });
    if (error) { showToast(`Erreur : ${error.message}`, 'warning'); return false; }
    showToast('Si un compte existe pour cet e-mail, un lien de réinitialisation vient d\'être envoyé. ✉️', 'info');
    return false;
  };

  const confirmPasswordReset = async (newPass: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) { showToast(`Erreur : ${error.message}`, 'warning'); return; }
    setIsPasswordRecovery(false);
    setIsAuthModalOpen(false);
    showToast('Mot de passe mis à jour avec succès !', 'success');
  };

  const logoutUser = () => {
    supabase.auth.signOut();
    setCurrentUser(null);
    setIsProfileModalOpen(false);
    showToast('Déconnexion réussie. À très bientôt sur SamaDeal !', 'info');
  };

  const updateUserProfile = async (data: Partial<Seller>) => {
    if (!currentUser) return;
    try {
      const { password: _pw, ...rest } = data;
      const avatar = rest.avatar ? await uploadImage(rest.avatar, currentUser.id, 'avatars') : undefined;
      const cols: Record<string, string> = { name: 'name', phone: 'phone', whatsapp: 'whatsapp', city: 'city', neighborhood: 'neighborhood', accountType: 'account_type', shopName: 'shop_name' };
      const patch: Record<string, any> = {};
      for (const [k, c] of Object.entries(cols)) if ((rest as any)[k] !== undefined) patch[c] = (rest as any)[k];
      if (patch.account_type) patch.account_type = patch.account_type === 'professionnel' ? 'pro' : 'particulier';
      if (avatar) patch.avatar_url = avatar;
      const { error } = await supabase.from('profiles').update(patch).eq('id', currentUser.id);
      if (error) throw error;
      const updated: Seller = { ...currentUser, ...rest, ...(avatar ? { avatar } : {}) };
      setCurrentUser(updated);
      setListings(prev => prev.map(l => l.sellerId === currentUser.id ? { ...l, seller: updated } : l));
      showToast('Profil mis à jour avec succès.', 'success');
    } catch (e: any) {
      showToast(`Erreur : ${e.message}`, 'warning');
    }
  };

  const deleteUserAccount = async () => {
    if (!currentUser) return;
    const { error } = await supabase.rpc('delete_my_account');
    if (error) { showToast(`Suppression impossible : ${error.message}`, 'warning'); return; }
    await supabase.auth.signOut();
    setListings(prev => prev.filter(l => l.sellerId !== currentUser.id));
    setCurrentUser(null);
    setIsProfileModalOpen(false);
    showToast('Votre compte SamaDeal et vos annonces ont été supprimés définitivement.', 'warning');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const switchUserAccount = (_userId: string) => {};

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(fId => fId !== id) : [...prev, id];
      showToast(exists ? 'Retiré de vos favoris' : 'Ajouté à vos favoris ❤️', 'info');
      return updated;
    });

    // Update favorites count on listing
    setListings(prev =>
      prev.map(item => {
        if (item.id === id) {
          const isFav = favorites.includes(id);
          return {
            ...item,
            favoritesCount: isFav ? Math.max(0, item.favoritesCount - 1) : item.favoritesCount + 1
          };
        }
        return item;
      })
    );
  };

  const openListingDetail = (listing: Listing) => {
    setSelectedListing(listing);
    supabase.rpc('increment_views', { p_listing_id: listing.id }).then(() => {});
  };

  const closeListingDetail = () => {
    setSelectedListing(null);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCity('Toutes les villes');
    setSelectedNeighborhood('Tous les quartiers');
    setPriceMin('');
    setPriceMax('');
    setSelectedCondition('all');
    setSortOption('latest');
    setOnlyNegotiable(false);
    setOnlyDelivered(false);
    setOnlyVerified(false);
    showToast('Filtres réinitialisés', 'info');
  };

  const addListing = async (newListingData: {
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: CategoryId;
    condition: Condition;
    images: string[];
    city: string;
    neighborhood: string;
    isNegotiable: boolean;
    hasDelivery: boolean;
    deliveryFee?: number;
    isBoosted?: boolean;
  }): Promise<void> => {
    if (!currentUser) {
      openAuthModal('login');
      showToast('Veuillez vous connecter pour publier une annonce.', 'info');
      return;
    }

    if (!(await requireSession())) return;
    if (newListingData.title.trim().length < 5) { showToast('Le titre doit contenir au moins 5 caractères.', 'warning'); return; }
    try {
      showToast('Publication en cours…', 'info');
      const urls = await Promise.all(newListingData.images.map(img => uploadImage(img, currentUser.id)));
      const { data, error } = await supabase.from('listings').insert({
        seller_id: currentUser.id, title: newListingData.title, description: newListingData.description,
        price: newListingData.price, category: newListingData.category, condition: newListingData.condition,
        images: urls, city: newListingData.city, region: newListingData.city, neighborhood: newListingData.neighborhood,
        city_district: newListingData.neighborhood || newListingData.city,
        is_negotiable: newListingData.isNegotiable, has_delivery: newListingData.hasDelivery,
        delivery_fee: newListingData.deliveryFee ?? 0
      }).select('*').single();
      if (error) throw error;
      setListings(prev => [rowToListing(data), ...prev]);
      setIsCreateListingOpen(false);
      showToast('Annonce publiée avec succès sur SamaDeal ! 🚀', 'success');
    } catch (e: any) {
      showToast(`Publication impossible : ${e.message}`, 'warning');
    }
  };

  const deleteListing = async (id: string) => {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) { showToast(`Suppression impossible : ${error.message}`, 'warning'); return; }
    setListings(prev => prev.filter(l => l.id !== id));
    if (selectedListing?.id === id) setSelectedListing(null);
    showToast('Annonce supprimée', 'info');
  };

  const markAsSold = async (id: string) => {
    const { error } = await supabase.from('listings').update({ status: 'sold' }).eq('id', id);
    if (error) { showToast(`Erreur : ${error.message}`, 'warning'); return; }
    setListings(prev => prev.map(l => (l.id === id ? { ...l, status: 'sold' } : l)));
    if (selectedListing?.id === id) setSelectedListing(prev => prev ? { ...prev, status: 'sold' } : null);
    showToast('Félicitations pour votre vente ! Article marqué comme vendu.', 'success');
  };

  const boostListing = (_id: string) => {
    showToast('Le boost payant sera bientôt disponible.', 'info');
  };

  const startChatWithSeller = (listing: Listing, quickMessage?: string) => {
    const digits = (listing.seller.whatsapp || listing.seller.phone || '').replace(/[^0-9]/g, '');
    if (!digits) { showToast('Ce vendeur n\'a pas renseigné de numéro.', 'warning'); return; }
    const num = digits.length === 9 ? `221${digits}` : digits;
    const text = quickMessage || `Bonjour, je suis intéressé par votre annonce « ${listing.title} » sur SamaDeal. Est-elle toujours disponible ?`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const sendMessage = (conversationId: string, text: string, isOffer = false, offerAmount?: number) => {
    const senderId = currentUser ? currentUser.id : 'guest';
    const senderName = currentUser ? currentUser.name : 'Visiteur';
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      text,
      timestamp: 'À l\'instant',
      isOffer,
      offerAmount,
      offerStatus: isOffer ? 'pending' : undefined
    };

    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedMessages = [...conv.messages, newMessage];
          return {
            ...conv,
            lastMessage: isOffer ? `Offre de ${offerAmount?.toLocaleString('fr-FR')} FCFA` : text,
            lastMessageTime: 'À l\'instant',
            messages: updatedMessages
          };
        }
        return conv;
      })
    );

    if (activeConversation?.id === conversationId) {
      setActiveConversation(prev => prev ? {
        ...prev,
        lastMessage: isOffer ? `Offre de ${offerAmount?.toLocaleString('fr-FR')} FCFA` : text,
        lastMessageTime: 'À l\'instant',
        messages: [...prev.messages, newMessage]
      } : null);
    }

    // Auto-respond simulation from seller if chatting with someone else
    if (activeConversation && currentUser && activeConversation.sellerId !== currentUser.id) {
      setTimeout(() => {
        const replies = [
          'Jërëjëf pour votre message ! L\'article est en parfait état.',
          'Oui, c\'est disponible. On peut convenir d\'un rendez-vous sur Dakar.',
          'D\'accord, vous préférez un paiement direct ou sécurisé Wave ?',
          'Parfait, je peux vous envoyer une vidéo du produit sur WhatsApp si vous voulez.'
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const autoMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          senderId: activeConversation.sellerId,
          senderName: activeConversation.sellerName,
          text: randomReply,
          timestamp: 'À l\'instant'
        };

        setConversations(prevList =>
          prevList.map(c => {
            if (c.id === conversationId) {
              return {
                ...c,
                lastMessage: randomReply,
                lastMessageTime: 'À l\'instant',
                messages: [...c.messages, autoMsg]
              };
            }
            return c;
          })
        );

        setActiveConversation(cur => cur && cur.id === conversationId ? {
          ...cur,
          lastMessage: randomReply,
          lastMessageTime: 'À l\'instant',
          messages: [...cur.messages, autoMsg]
        } : cur);
      }, 1400);
    }
  };

  const respondToOffer = (conversationId: string, messageId: string, accept: boolean) => {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedMessages = conv.messages.map(m =>
            m.id === messageId ? { ...m, offerStatus: accept ? 'accepted' as const : 'declined' as const } : m
          );
          return {
            ...conv,
            messages: updatedMessages,
            lastMessage: accept ? 'Offre acceptée !' : 'Offre refusée.'
          };
        }
        return conv;
      })
    );

    if (activeConversation?.id === conversationId) {
      setActiveConversation(prev => prev ? {
        ...prev,
        messages: prev.messages.map(m =>
          m.id === messageId ? { ...m, offerStatus: accept ? 'accepted' as const : 'declined' as const } : m
        )
      } : null);
    }

    showToast(accept ? 'Offre acceptée ! Vous pouvez maintenant finaliser.' : 'Offre refusée.', accept ? 'success' : 'info');
  };

  const initiateEscrowPayment = (
    _listing: Listing,
    _paymentMethod: 'wave' | 'orange_money',
    _deliveryType: 'hand_delivery' | 'courier'
  ) => {
    setIsEscrowModalOpen(false);
    showToast('Le paiement sécurisé Wave / Orange Money arrive bientôt. En attendant, contactez le vendeur sur WhatsApp et payez à la remise en main propre.', 'info');
  };

  const confirmEscrowDelivery = (paymentId: string) => {
    setEscrowPayments(prev =>
      prev.map(p => (p.id === paymentId ? { ...p, status: 'delivered' } : p))
    );
    showToast('Réception confirmée ! Les fonds ont été débloqués et versés au vendeur. Jërëjëf !', 'success');
  };

  const submitReport = async (listingId: string, listingTitle: string, reason: string, details: string) => {
    if (!currentUser) {
      openAuthModal('login');
      showToast('Connectez-vous pour signaler une annonce.', 'info');
      return;
    }
    if (!(await requireSession())) return;
    const { error } = await supabase.from('reports').insert({
      listing_id: listingId, reason, details, reporter_id: currentUser.id
    });
    if (error) { showToast(`Signalement impossible : ${error.message}`, 'warning'); return; }
    setIsReportModalOpen(false);
    setTargetReportListing(null);
    showToast('Signalement transmis à l\'équipe de modération SamaDeal. Merci de protéger la communauté !', 'info');
  };

  const resolveReport = async (reportId: string, action: 'dismiss' | 'remove_listing') => {
    const rep = reports.find(r => r.id === reportId);
    if (!rep) return;
    if (action === 'remove_listing' && rep.listingId) {
      await supabase.from('listings').delete().eq('id', rep.listingId);
      setListings(prev => prev.filter(l => l.id !== rep.listingId));
    }
    const status = action === 'remove_listing' ? 'resolved' : 'dismissed';
    const { error } = await supabase.from('reports').update({ status }).eq('id', reportId);
    if (error) { showToast(`Erreur : ${error.message}`, 'warning'); return; }
    setReports(prev => action === 'remove_listing' && rep.listingId ? prev.filter(r => r.listingId !== rep.listingId) : prev.map(r => (r.id === reportId ? { ...r, status } : r)));
    showToast(action === 'remove_listing' ? 'Annonce retirée de la plateforme.' : 'Signalement classé sans suite.', 'info');
  };

  const loginAsAdmin = async (email: string, password: string): Promise<boolean> => {
    if (currentUser?.role === 'admin') {
      setIsAdminAuthModalOpen(false);
      setIsAdminModalOpenRaw(true);
      return true;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { showToast('Identifiants incorrects.', 'warning'); return false; }
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (prof?.role !== 'admin') {
      await supabase.auth.signOut();
      showToast('Accès réservé aux administrateurs.', 'warning');
      return false;
    }
    setIsAdminAuthModalOpen(false);
    setIsAdminModalOpenRaw(true);
    return true;
  };

  const logoutAdmin = () => {
    supabase.auth.signOut();
    setCurrentUser(null);
    setIsAdminModalOpenRaw(false);
    setActiveTab('home');
    showToast('Session administrateur fermée.', 'info');
  };

  const toggleUserVerification = async (userId: string) => {
    const u = allUsers.find(x => x.id === userId);
    if (!u) return;
    const { error } = await supabase.from('profiles').update({ is_verified: !u.isVerified }).eq('id', userId);
    if (error) { showToast(`Erreur : ${error.message}`, 'warning'); return; }
    setAllUsers(prev => prev.map(x => x.id === userId ? { ...x, isVerified: !x.isVerified } : x));
    setListings(prev => prev.map(l => l.sellerId === userId ? { ...l, seller: { ...l.seller, isVerified: !u.isVerified } } : l));
    showToast('Statut de vérification du vendeur mis à jour.', 'success');
  };

  const toggleUserBlocked = async (userId: string) => {
    const u = allUsers.find(x => x.id === userId);
    if (!u) return;
    const { error } = await supabase.from('profiles').update({ is_blocked: !u.isBlocked }).eq('id', userId);
    if (error) { showToast(`Erreur : ${error.message}`, 'warning'); return; }
    setAllUsers(prev => prev.map(x => x.id === userId ? { ...x, isBlocked: !x.isBlocked } : x));
    showToast('Statut du compte utilisateur mis à jour.', 'info');
  };

  const adminDeleteListing = async (listingId: string) => {
    const { error } = await supabase.from('listings').delete().eq('id', listingId);
    if (error) { showToast(`Erreur : ${error.message}`, 'warning'); return; }
    setListings(prev => prev.filter(l => l.id !== listingId));
    showToast('Annonce supprimée du catalogue.', 'warning');
  };

  const adminToggleBoost = async (listingId: string) => {
    const l = listings.find(x => x.id === listingId);
    if (!l) return;
    const { error } = await supabase.from('listings').update({ is_featured: !l.isFeatured }).eq('id', listingId);
    if (error) { showToast(`Erreur : ${error.message}`, 'warning'); return; }
    setListings(prev => prev.map(x => x.id === listingId ? { ...x, isFeatured: !x.isFeatured } : x));
    showToast('Mise en avant de l\'annonce modifiée.', 'success');
  };

  const releaseEscrowFunds = (paymentId: string) => {
    setEscrowPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'delivered' } : p));
    showToast('Fonds Wave / Orange Money débloqués en faveur du vendeur.', 'success');
  };

  const refundEscrowPayment = (paymentId: string) => {
    setEscrowPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'refunded' } : p));
    showToast('Remboursement de l\'acheteur effectué avec succès.', 'info');
  };

  const updatePlatformSettings = (newSettings: Partial<PlatformSettings>) => {
    setPlatformSettings((prev: PlatformSettings) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('samadeal_platform_settings', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
    showToast('Paramètres généraux SamaDeal enregistrés.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        listings,
        favorites,
        currentUser,
        notifications,
        isAuthModalOpen,
        authMode,
        pendingOtpCode,
        isPasswordRecovery,
        pendingPhone,
        conversations,
        activeConversation,
        escrowPayments,
        reports,
        selectedListing,
        searchQuery,
        selectedCategory,
        selectedCity,
        selectedNeighborhood,
        priceMin,
        priceMax,
        selectedCondition,
        sortOption,
        onlyNegotiable,
        onlyDelivered,
        onlyVerified,
        activeTab,
        isCreateListingOpen,
        isChatOpen,
        isEscrowModalOpen,
        isProfileModalOpen,
        isAdminModalOpen,
        isAdminAuthModalOpen,
        isSafetyModalOpen,
        isReportModalOpen,
        targetReportListing,
        isMobileSimulator,
        toastMessage,

        // User Auth & Account Actions
        setAuthMode,
        openAuthModal,
        closeAuthModal,
        loginUser,
        pendingConfirmationEmail,
        setPendingConfirmationEmail,
        resendConfirmationEmail,
        registerUser,
        verifyOtp,

        resendOtp,
        resetPasswordRequest,
        confirmPasswordReset,
        logoutUser,
        updateUserProfile,
        deleteUserAccount,
        markNotificationAsRead,
        switchUserAccount,

        // Admin exclusive
        isAdminAuthenticated,
        superAdminEmail: '',
        allUsers,
        platformSettings,

        loginAsAdmin,
        logoutAdmin,
        toggleUserVerification,
        toggleUserBlocked,
        adminDeleteListing,
        adminToggleBoost,
        releaseEscrowFunds,
        refundEscrowPayment,
        updatePlatformSettings,

        setSearchQuery,
        setSelectedCategory,
        setSelectedCity,
        setSelectedNeighborhood,
        setPriceMin,
        setPriceMax,
        setSelectedCondition,
        setSortOption,
        setOnlyNegotiable,
        setOnlyDelivered,
        setOnlyVerified,
        resetFilters,

        setActiveTab,
        setIsCreateListingOpen,
        setIsChatOpen,
        setIsEscrowModalOpen,
        setIsProfileModalOpen,
        setIsAdminModalOpen,
        setIsAdminAuthModalOpen,
        setIsSafetyModalOpen,
        setIsReportModalOpen,
        setTargetReportListing,
        setIsMobileSimulator,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        setActiveConversation,

        toggleFavorite,
        openListingDetail,
        closeListingDetail,
        addListing,
        deleteListing,
        markAsSold,
        boostListing,
        startChatWithSeller,
        sendMessage,
        respondToOffer,
        initiateEscrowPayment,
        confirmEscrowDelivery,
        submitReport,
        resolveReport,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
