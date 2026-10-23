import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Compass,
  MapPin,
  Phone,
  Instagram,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Trees,
  BookOpen,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  EXPERIENCES_CARDS,
  DAY_USE_ACTIVITIES,
  GALLERY_ITEMS,
  HERO_VIDEO,
  HERO_IMAGE,
  ABOUT_IMAGE,
  PEDAGOGICO_IMAGE,
  CTA_FINAL_IMAGE,
  WHATSAPP_DISPLAY,
  INSTAGRAM_URL,
  GOOGLE_MAPS_URL,
  buildWhatsAppUrl,
  type ExperienceCard,
  type GalleryItem,
} from './data/sitioData';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackLabel?: string;
}

function SafeImage({ src, alt, className = '', fallbackLabel, ...rest }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#284533] via-[#3A5F43] to-[#6B7F5E] text-[#FBF7EE] p-6 text-center ${className}`}
        role="img"
        aria-label={alt || fallbackLabel || 'Imagem ilustrativa do Sítio Banguê'}
      >
        <Trees className="w-10 h-10 mb-2 opacity-80" />
        <span className="font-display text-sm font-medium opacity-90">
          {fallbackLabel || alt || 'Sítio Banguê · Natureza & Lazer'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
}

interface InquiryResponse {
  success: boolean;
  protocol: string;
  message: string;
  whatsappUrl: string;
  inquiry: {
    id: string;
    date: string;
    guests: string;
    category: string;
    name?: string;
    phone?: string;
  };
}

export default function App() {
  // Header state
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Booking / Availability Search bar state
  const defaultTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [bookingCategory, setBookingCategory] = useState('Eco Day Use & Lazer');
  const [bookingDate, setBookingDate] = useState(defaultTomorrow);
  const [bookingGuests, setBookingGuests] = useState('Família (3 a 5 pessoas)');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<InquiryResponse | null>(null);
  const [bookingError, setBookingError] = useState('');

  // Experience detail modal state
  const [selectedExperience, setSelectedExperience] = useState<ExperienceCard | null>(null);

  // Gallery filter & Lightbox state
  const [galleryFilter, setGalleryFilter] = useState<'todas' | GalleryItem['category']>('todas');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactCategory, setContactCategory] = useState('Eco Day Use & Lazer');
  const [contactDate, setContactDate] = useState(defaultTomorrow);
  const [contactGuests, setContactGuests] = useState('4 pessoas');
  const [contactNotes, setContactNotes] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [contactResponse, setContactResponse] = useState<InquiryResponse | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredGallery =
    galleryFilter === 'todas'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === galleryFilter);

  // Handle keyboard navigation for modals & lightbox
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedExperience(null);
        setBookingResult(null);
        setLightboxIndex(null);
        setMobileMenuOpen(false);
      } else if (lightboxIndex !== null) {
        if (e.key === 'ArrowRight') {
          setLightboxIndex((prev) =>
            prev === null ? null : (prev + 1) % filteredGallery.length
          );
        } else if (e.key === 'ArrowLeft') {
          setLightboxIndex((prev) =>
            prev === null
              ? null
              : (prev - 1 + filteredGallery.length) % filteredGallery.length
          );
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, filteredGallery.length]);

  const handleBookingBarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    if (!bookingDate) {
      setBookingError('Selecione uma data para consultar a disponibilidade.');
      return;
    }

    setBookingSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: bookingCategory,
          date: bookingDate,
          guests: bookingGuests,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível processar a consulta.');
      }
      setBookingResult(data);
    } catch {
      const formattedDate = bookingDate.split('-').reverse().join('/');
      const fallbackUrl = buildWhatsAppUrl(
        `Olá! Gostaria de consultar a disponibilidade no Sítio Banguê.\n• Modalidade: ${bookingCategory}\n• Data: ${formattedDate}\n• Pessoas: ${bookingGuests}`
      );
      setBookingResult({
        success: true,
        protocol: `SB-${Date.now().toString().slice(-6)}`,
        message: 'Consulta pronta! Continue o atendimento diretamente pelo WhatsApp.',
        whatsappUrl: fallbackUrl,
        inquiry: {
          id: `SB-${Date.now().toString().slice(-6)}`,
          date: bookingDate,
          guests: bookingGuests,
          category: bookingCategory,
        },
      });
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;
    setContactStatus('submitting');
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          phone: contactPhone,
          category: contactCategory,
          date: contactDate,
          guests: contactGuests,
          notes: contactNotes,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setContactResponse(data);
      setContactStatus('success');
    } catch {
      const formattedDate = contactDate.split('-').reverse().join('/');
      const fallbackUrl = buildWhatsAppUrl(
        `Olá! Meu nome é ${contactName} (${contactPhone}). Gostaria de consultar reserva para ${contactCategory} na data ${formattedDate} (${contactGuests}). ${contactNotes}`
      );
      setContactResponse({
        success: true,
        protocol: `SB-${Date.now().toString().slice(-6)}`,
        message: 'Solicitação preparada para envio via WhatsApp.',
        whatsappUrl: fallbackUrl,
        inquiry: {
          id: `SB-${Date.now().toString().slice(-6)}`,
          date: contactDate,
          guests: contactGuests,
          category: contactCategory,
          name: contactName,
          phone: contactPhone,
        },
      });
      setContactStatus('success');
    }
  };

  const selectExperienceForBooking = (exp: ExperienceCard) => {
    setBookingCategory(exp.title);
    setSelectedExperience(null);
    const barEl = document.getElementById('reserva-rapida');
    if (barEl) {
      barEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7EE] text-[#1C2A1E]">
      {/* Skip to content for accessibility */}
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-[#1E3A2B] focus:text-[#FBF7EE] focus:px-4 focus:py-2.5 focus:rounded-lg"
      >
        Ir para o conteúdo principal
      </a>

      {/* ===================== HEADER (3-Zone Top Bar Contract) ===================== */}
      <header
        id="topo"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'bg-[#FBF7EE]/95 backdrop-blur-md shadow-sm py-3 border-b border-[#1E3A2B]/10'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div
            className={`flex items-center justify-between gap-8 transition-all duration-200 ${
              isScrolled
                ? 'px-2'
                : 'bg-[#FBF7EE]/95 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg border border-white/60'
            }`}
          >
            {/* Zone 1: Brand Logo */}
            <a
              href="#topo"
              aria-label="Sítio Banguê Ecoturismo - Início"
              className="inline-flex items-center shrink-0"
            >
              <img
                src="assets/aistudio/logo_36c15d95.webp"
                alt="Sítio Banguê Ecoturismo"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </a>

            {/* Zone 2: 5 Concise Single-Line Navigation Links */}
            <nav
              aria-label="Navegação principal"
              className="hidden md:flex items-center gap-7 text-sm font-medium text-[#2A3B2C]"
            >
              <a
                href="#sobre"
                className="hover:text-[#3D633B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Sobre o Sítio
              </a>
              <a
                href="#experiencias"
                className="hover:text-[#3D633B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Experiências
              </a>
              <a
                href="#pedagogico"
                className="hover:text-[#3D633B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Pedagógico
              </a>
              <a
                href="#galeria"
                className="hover:text-[#3D633B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Galeria
              </a>
              <a
                href="#contato"
                className="hover:text-[#3D633B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Contato
              </a>
            </nav>

            {/* Zone 3: 1 Primary Action Button */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={buildWhatsAppUrl(
                  'Olá! Gostaria de saber mais sobre reservas e visitas no Sítio Banguê.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 bg-[#3D633B] hover:bg-[#2F5233] text-[#FBF7EE] text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm transition-all duration-150 whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Reservar agora</span>
              </a>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#EBF0E4] text-[#1E3A2B] hover:bg-[#DCE5D0] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FBF7EE] border-b border-[#1E3A2B]/15 shadow-xl px-6 py-5 mt-2">
            <nav className="flex flex-col gap-3 text-base font-medium text-[#1E3A2B]">
              <a
                href="#sobre"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-[#1E3A2B]/10"
              >
                Sobre o Sítio
              </a>
              <a
                href="#experiencias"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-[#1E3A2B]/10"
              >
                Experiências e Acomodações
              </a>
              <a
                href="#pedagogico"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-[#1E3A2B]/10"
              >
                Turismo Pedagógico
              </a>
              <a
                href="#galeria"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-[#1E3A2B]/10"
              >
                Galeria de Fotos
              </a>
              <a
                href="#contato"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 border-b border-[#1E3A2B]/10"
              >
                Localização e Contato
              </a>
              <a
                href={buildWhatsAppUrl(
                  'Olá! Gostaria de saber mais sobre o Sítio Banguê.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 bg-[#3D633B] text-[#FBF7EE] font-semibold py-3 px-5 rounded-full"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Reservar pelo WhatsApp</span>
              </a>
            </nav>
          </div>
        )}
      </header>

      <main id="conteudo-principal" className="flex-1">
        {/* ===================== HERO SECTION ===================== */}
        <section
          aria-labelledby="hero-heading"
          className="relative min-h-[600px] lg:min-h-[680px] flex items-center pt-28 pb-24 lg:pb-32 overflow-hidden"
        >
          {/* Panoramic Nature Background Video */}
          <div className="absolute inset-0 z-0 bg-[#13261B]">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={HERO_IMAGE}
              aria-hidden="true"
              tabIndex={-1}
              className="w-full h-full object-cover object-center"
            >
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-[#13261B]/80 via-[#13261B]/55 to-[#13261B]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#13261B]/80 via-transparent to-[#13261B]/30" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-2xl">
              <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#D4E2C8] mb-3">
                Aldeia · Camaragibe · Pernambuco · 18 Hectares de Mata Atlântica
              </p>

              <h1
                id="hero-heading"
                style={{ textWrap: 'balance' }}
                className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#FBF7EE] leading-[1.12] mb-5"
              >
                Um encontro com a natureza que fica na memória.
              </h1>

              <p className="text-base sm:text-lg text-[#E6EFE0] leading-relaxed mb-8 max-w-xl">
                Descubra o Sítio Banguê: um refúgio acolhedor de ecoturismo, lazer no campo,
                estadias tranquilas e aprendizado ambiental no coração de Aldeia.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#reserva-rapida"
                  className="inline-flex items-center gap-2.5 bg-[#3D633B] hover:bg-[#2F5233] text-[#FBF7EE] font-semibold px-7 py-3.5 rounded-full shadow-lg border border-[#7FA674]/40 transition-all duration-150 whitespace-nowrap shrink-0"
                >
                  <span>Consultar disponibilidade</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#experiencias"
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-[#FBF7EE] font-medium px-6 py-3.5 rounded-full border border-white/35 transition-all duration-150 whitespace-nowrap shrink-0"
                >
                  <span>Explorar experiências</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== FLOATING SEARCH / BOOKING BAR ===================== */}
        <section
          id="reserva-rapida"
          aria-label="Consulta rápida de disponibilidade e reservas"
          className="relative z-20 -mt-14 sm:-mt-16 px-4 sm:px-6"
        >
          <div className="max-w-[1120px] mx-auto">
            <div className="bg-[#9CB388] p-4 sm:p-5 rounded-3xl sm:rounded-full shadow-xl border border-[#88A173]">
              <form
                onSubmit={handleBookingBarSubmit}
                className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
              >
                {/* White inner capsule holding the 3 inputs (inspired by reference image) */}
                <div className="flex-1 bg-white rounded-2xl lg:rounded-full px-4 py-3 sm:px-6 sm:py-2.5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0 sm:divide-x sm:divide-[#1E3A2B]/15 items-center">
                  {/* Field 1: Modalidade */}
                  <div className="sm:pr-4 flex items-center gap-3">
                    <Compass className="w-5 h-5 text-[#3D633B] shrink-0" />
                    <div className="w-full min-w-0">
                      <label
                        htmlFor="search-category"
                        className="block text-[11px] font-semibold text-[#5A6B58] uppercase tracking-wider"
                      >
                        Experiência
                      </label>
                      <select
                        id="search-category"
                        value={bookingCategory}
                        onChange={(e) => setBookingCategory(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-[#1C2A1E] focus:outline-none truncate cursor-pointer"
                      >
                        <option value="Eco Day Use & Lazer">Eco Day Use & Lazer</option>
                        <option value="Hospedagem & Refúgio no Campo">
                          Hospedagem / Chalés (Consulta)
                        </option>
                        <option value="Turismo Rural Pedagógico">Turismo Rural Pedagógico</option>
                        <option value="Eventos & Confraternizações">
                          Eventos & Confraternizações
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Field 2: Data */}
                  <div className="sm:px-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E3A2B]/10 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#3D633B] shrink-0" />
                    <div className="w-full min-w-0">
                      <label
                        htmlFor="search-date"
                        className="block text-[11px] font-semibold text-[#5A6B58] uppercase tracking-wider"
                      >
                        Data da visita
                      </label>
                      <input
                        id="search-date"
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-[#1C2A1E] focus:outline-none cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  {/* Field 3: Quantidade de pessoas */}
                  <div className="sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E3A2B]/10 flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#3D633B] shrink-0" />
                    <div className="w-full min-w-0">
                      <label
                        htmlFor="search-guests"
                        className="block text-[11px] font-semibold text-[#5A6B58] uppercase tracking-wider"
                      >
                        Visitantes
                      </label>
                      <select
                        id="search-guests"
                        value={bookingGuests}
                        onChange={(e) => setBookingGuests(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-[#1C2A1E] focus:outline-none truncate cursor-pointer"
                      >
                        <option value="1 a 2 pessoas">1 a 2 pessoas (Casal / Individual)</option>
                        <option value="Família (3 a 5 pessoas)">Família (3 a 5 pessoas)</option>
                        <option value="Grupo (6 a 15 pessoas)">Grupo (6 a 15 pessoas)</option>
                        <option value="Excursão / Escola (15+ pessoas)">
                          Excursão / Escola (15+ pessoas)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit CTA button */}
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="bg-[#2F5233] hover:bg-[#1E3A2B] text-[#FBF7EE] font-semibold text-sm px-7 py-4 rounded-2xl lg:rounded-full shadow-md transition-all duration-150 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
                >
                  <span>
                    {bookingSubmitting ? 'Consultando...' : 'Consultar disponibilidade'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              {bookingError && (
                <p className="text-xs text-[#1E3A2B] font-medium mt-2 px-4">{bookingError}</p>
              )}
            </div>
          </div>
        </section>

        {/* ===================== SOBRE O SÍTIO ===================== */}
        <section
          id="sobre"
          aria-labelledby="sobre-heading"
          className="py-20 lg:py-28 px-4 sm:px-6"
        >
          <div className="max-w-[1160px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Framed Image + Organic Badges (Matching Reference Image) */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  {/* Top-left circular moss-green emblem */}
                  <div className="absolute -top-6 -left-4 sm:-left-6 z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#3D633B] text-[#FBF7EE] border-4 border-[#FBF7EE] shadow-lg flex flex-col items-center justify-center text-center p-2">
                    <Trees className="w-6 h-6 mb-1 text-[#D4E2C8]" />
                    <span className="text-[11px] font-semibold leading-tight">
                      18 Hectares
                      <br />
                      Preservados
                    </span>
                  </div>

                  {/* White framed photo card */}
                  <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-[#1E3A2B]/10">
                    <div className="overflow-hidden rounded-xl aspect-[4/3]">
                      <SafeImage
                        src={ABOUT_IMAGE}
                        alt="Casa de campo cercada por árvores nativas da Mata Atlântica no Sítio Banguê"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Editorial Presentation & Key Facts */}
              <div className="lg:col-span-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6B3A] mb-2">
                  Sobre o Sítio Banguê
                </p>

                <h2
                  id="sobre-heading"
                  style={{ textWrap: 'balance' }}
                  className="font-display text-3xl sm:text-4xl font-bold text-[#1E3A2B] mb-5"
                >
                  Natureza de perto, experiências autênticas para viver.
                </h2>

                <p className="text-[#3E4E3C] text-base leading-relaxed mb-4">
                  O <strong>Sítio Banguê</strong> está localizado em Aldeia (Km 3,5), em
                  Camaragibe, Pernambuco. O espaço está inserido em um fragmento preservado de
                  Mata Atlântica com <strong>18 hectares</strong>, dentro de uma Área de Proteção
                  Ambiental (APA) que abrange mais de <strong>31.634 hectares</strong>.
                </p>

                <p className="text-[#3E4E3C] text-base leading-relaxed mb-8">
                  Aqui, descanso, lazer rural e aprendizado ambiental caminham juntos. Nossas
                  portas estão abertas para famílias em busca de ar puro, grupos de amigos e
                  instituições de ensino que valorizam o contato direto com a natureza.
                </p>

                {/* Tabular Facts Strip */}
                <div className="grid grid-cols-3 gap-4 py-5 px-5 bg-[#F2EFE4] rounded-2xl border border-[#1E3A2B]/10 mb-8">
                  <div>
                    <span className="block font-display text-2xl sm:text-3xl font-bold text-[#1E3A2B] tabular-nums">
                      18 ha
                    </span>
                    <span className="text-xs text-[#4A5745]">de Mata Atlântica própria</span>
                  </div>
                  <div className="border-l border-[#1E3A2B]/10 pl-4">
                    <span className="block font-display text-2xl sm:text-3xl font-bold text-[#1E3A2B] tabular-nums">
                      31.634+
                    </span>
                    <span className="text-xs text-[#4A5745]">hectares de APA na região</span>
                  </div>
                  <div className="border-l border-[#1E3A2B]/10 pl-4">
                    <span className="block font-display text-2xl sm:text-3xl font-bold text-[#1E3A2B] tabular-nums">
                      Km 3,5
                    </span>
                    <span className="text-xs text-[#4A5745]">Aldeia · Camaragibe, PE</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center gap-5">
                  <a
                    href={buildWhatsAppUrl(
                      'Olá! Gostaria de agendar uma visita ao Sítio Banguê em Aldeia.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#3D633B] hover:bg-[#2F5233] text-[#FBF7EE] text-sm font-semibold px-6 py-3 rounded-full shadow-sm transition-colors whitespace-nowrap shrink-0"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Agendar visita</span>
                  </a>

                  <a
                    href="#diferenciais"
                    className="text-sm font-semibold text-[#2F5233] hover:text-[#1E3A2B] underline underline-offset-4 whitespace-nowrap shrink-0"
                  >
                    Conhecer nossos diferenciais
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== EXPERIÊNCIAS E ACOMODAÇÕES (3 Cards Section) ===================== */}
        <section
          id="experiencias"
          aria-labelledby="experiencias-heading"
          className="py-20 lg:py-24 bg-[#E9F0E1] px-4 sm:px-6"
        >
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6B3A] mb-2">
                Experiências & Estadias
              </p>
              <h2
                id="experiencias-heading"
                style={{ textWrap: 'balance' }}
                className="font-display text-3xl sm:text-4xl font-bold text-[#1E3A2B] mb-4"
              >
                Escolha como viver o seu dia no campo
              </h2>
              <p className="text-[#425440] text-base">
                Do passeio em família no Eco Day Use ao descanso no campo e às aulas-passeio
                escolares, cada modalidade conecta você à tranquilidade da natureza.
              </p>
            </div>

            {/* 3 Cards Grid (Inspired by the 3 cards in the visual reference) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {EXPERIENCES_CARDS.map((card) => (
                <article
                  key={card.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-[#1E3A2B]/8 transition-all duration-200 flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#DCE5D0]">
                    <SafeImage
                      src={card.image}
                      alt={card.imageAlt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 sm:p-7 flex-1 flex flex-col">
                    <p className="text-xs text-[#5A6E54] font-medium mb-1">{card.subtitle}</p>
                    <h3 className="font-display text-xl font-bold text-[#1E3A2B] mb-3">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#4A5745] leading-relaxed mb-6 flex-1">
                      {card.shortDescription}
                    </p>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedExperience(card)}
                        className="inline-flex items-center justify-center gap-2 bg-[#3D633B] hover:bg-[#2F5233] text-[#FBF7EE] text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>Ver detalhes</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={buildWhatsAppUrl(card.whatsappText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#2F5233] hover:text-[#1E3A2B] underline underline-offset-4 whitespace-nowrap shrink-0"
                      >
                        Consultar via WhatsApp
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== ATIVIDADES DO ECO DAY USE (BENTO GRID) ===================== */}
        <section
          aria-labelledby="atividades-heading"
          className="py-20 lg:py-24 px-4 sm:px-6 bg-[#FBF7EE]"
        >
          <div className="max-w-[1160px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6B3A] mb-2">
                  Atrativos ao Ar Livre
                </p>
                <h2
                  id="atividades-heading"
                  style={{ textWrap: 'balance' }}
                  className="font-display text-3xl sm:text-4xl font-bold text-[#1E3A2B]"
                >
                  Um dia inteiro para explorar, brincar e respirar ar puro.
                </h2>
              </div>
              <a
                href={buildWhatsAppUrl(
                  'Olá! Gostaria de saber mais sobre a programação do Eco Day Use do Sítio Banguê.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1E3A2B] hover:bg-[#14281D] text-[#FBF7EE] text-sm font-semibold px-6 py-3 rounded-full self-start md:self-auto whitespace-nowrap shrink-0"
              >
                <span>Quero conhecer o Eco Day Use</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {DAY_USE_ACTIVITIES.map((act, idx) => {
                const colSpan =
                  idx === 0 || idx === 1 ? 'md:col-span-6' : 'md:col-span-6 lg:col-span-6';
                return (
                  <article
                    key={act.id}
                    className={`${colSpan} bg-white rounded-3xl overflow-hidden border border-[#1E3A2B]/8 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row`}
                  >
                    <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto overflow-hidden shrink-0">
                      <SafeImage
                        src={act.image}
                        alt={act.imageAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                      <h3 className="font-display text-xl font-bold text-[#1E3A2B] mb-2">
                        {act.title}
                      </h3>
                      <p className="text-sm text-[#4A5745] leading-relaxed">{act.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================== TURISMO RURAL PEDAGÓGICO ===================== */}
        <section
          id="pedagogico"
          aria-labelledby="pedagogico-heading"
          className="py-20 lg:py-24 bg-[#1E3A2B] text-[#FBF7EE] px-4 sm:px-6"
        >
          <div className="max-w-[1160px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 order-2 lg:order-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#B8CEA6] mb-2">
                  Educação Ambiental & Escolas
                </p>
                <h2
                  id="pedagogico-heading"
                  style={{ textWrap: 'balance' }}
                  className="font-display text-3xl sm:text-4xl font-bold text-[#FBF7EE] mb-5"
                >
                  Aprender com a natureza faz toda a diferença.
                </h2>
                <p className="text-[#DCE5D0] text-base leading-relaxed mb-6">
                  O Turismo Rural Pedagógico do Sítio Banguê proporciona às escolas e instituições
                  a oportunidade de aproximar os estudantes da fauna, da flora e da conservação da
                  Mata Atlântica por meio de aulas-passeio dinâmicas e seguras.
                </p>

                <ul className="space-y-3.5 mb-8 text-sm sm:text-base text-[#E9F0E1]">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#9CB388] shrink-0 mt-0.5" />
                    <span>Aprendizado interdisciplinar fora da sala de aula</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#9CB388] shrink-0 mt-0.5" />
                    <span>Contato supervisionado com a fauna, fazendinha e flora nativa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#9CB388] shrink-0 mt-0.5" />
                    <span>Trilhas ecopedagógicas dentro de 18 hectares de Mata Atlântica</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#9CB388] shrink-0 mt-0.5" />
                    <span>Roteiros que complementam projetos escolares e de sustentabilidade</span>
                  </li>
                </ul>

                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href={buildWhatsAppUrl(
                      'Olá! Represento uma instituição de ensino e gostaria de conhecer as opções de Turismo Rural Pedagógico do Sítio Banguê.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#FBF7EE] hover:bg-[#E9F0E1] text-[#1E3A2B] font-semibold text-sm px-6 py-3.5 rounded-full transition-colors whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Consultar visita pedagógica</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2">
                <div className="rounded-3xl overflow-hidden border-4 border-[#3D633B]/40 shadow-2xl aspect-[4/3]">
                  <SafeImage
                    src={PEDAGOGICO_IMAGE}
                    alt="Estudantes em atividade educativa ao ar livre em contato com a natureza"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== DIFERENCIAIS ===================== */}
        <section
          id="diferenciais"
          aria-labelledby="diferenciais-heading"
          className="py-16 lg:py-20 bg-[#FBF7EE] px-4 sm:px-6 border-b border-[#1E3A2B]/8"
        >
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6B3A] mb-2">
                Diferenciais do Sítio Banguê
              </p>
              <h2
                id="diferenciais-heading"
                className="font-display text-2xl sm:text-3xl font-bold text-[#1E3A2B]"
              >
                Por que viver momentos especiais conosco?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#1E3A2B]/8">
                <div className="w-11 h-11 rounded-xl bg-[#EBF0E4] text-[#3D633B] flex items-center justify-center mb-4">
                  <Trees className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#1E3A2B] mb-2">
                  Reserva de Mata Atlântica
                </h3>
                <p className="text-sm text-[#4A5745]">
                  18 hectares próprios preservados dentro de uma APA com mais de 31.634 hectares.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#1E3A2B]/8">
                <div className="w-11 h-11 rounded-xl bg-[#EBF0E4] text-[#3D633B] flex items-center justify-center mb-4">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#1E3A2B] mb-2">
                  Ambiente Familiar
                </h3>
                <p className="text-sm text-[#4A5745]">
                  Atividades ao ar livre acolhedoras e seguras para crianças, adultos e idosos.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#1E3A2B]/8">
                <div className="w-11 h-11 rounded-xl bg-[#EBF0E4] text-[#3D633B] flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#1E3A2B] mb-2">
                  Educação na Prática
                </h3>
                <p className="text-sm text-[#4A5745]">
                  Trilhas guiadas e fazendinha que despertam a consciência ecológica.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#1E3A2B]/8">
                <div className="w-11 h-11 rounded-xl bg-[#EBF0E4] text-[#3D633B] flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#1E3A2B] mb-2">
                  Pertinho do Recife
                </h3>
                <p className="text-sm text-[#4A5745]">
                  Fácil acesso no Km 3,5 de Aldeia, em Camaragibe, na Região Metropolitana.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== GALERIA DE FOTOS ===================== */}
        <section
          id="galeria"
          aria-labelledby="galeria-heading"
          className="py-20 lg:py-24 px-4 sm:px-6 bg-[#FBF7EE]"
        >
          <div className="max-w-[1160px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6B3A] mb-2">
                  Galeria Visual
                </p>
                <h2
                  id="galeria-heading"
                  className="font-display text-3xl sm:text-4xl font-bold text-[#1E3A2B]"
                >
                  Paisagens, lazer e vida no campo
                </h2>
              </div>

              {/* Interactive Filter Controls */}
              <div
                role="tablist"
                aria-label="Filtrar fotos da galeria"
                className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#E9F0E1] rounded-2xl self-start"
              >
                {[
                  { id: 'todas', label: 'Todas' },
                  { id: 'natureza', label: 'Natureza & Trilhas' },
                  { id: 'lazer', label: 'Lazer & Piscina' },
                  { id: 'acomodacoes', label: 'Estrutura & Pedagógico' },
                  { id: 'fazendinha', label: 'Fazendinha' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={galleryFilter === tab.id}
                    onClick={() =>
                      setGalleryFilter(tab.id as 'todas' | GalleryItem['category'])
                    }
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      galleryFilter === tab.id
                        ? 'bg-[#2F5233] text-[#FBF7EE] shadow-sm'
                        : 'text-[#2A3B2C] hover:bg-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredGallery.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#DCE5D0] text-left focus:outline-none focus:ring-2 focus:ring-[#3D633B] cursor-pointer"
                >
                  <SafeImage
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-[#FBF7EE]">
                    <p className="text-xs text-[#D4E2C8] mb-0.5">{item.categoryLabel}</p>
                    <h3 className="font-display text-base font-semibold text-[#FBF7EE]">
                      {item.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CHAMADA FINAL (CTA BAND COM FOTO AÉREA DO SÍTIO) ===================== */}
        <section
          aria-labelledby="cta-final-heading"
          className="relative py-20 lg:py-28 px-4 sm:px-6 overflow-hidden text-center text-[#FBF7EE]"
        >
          <div className="absolute inset-0 z-0">
            <SafeImage
              src={CTA_FINAL_IMAGE}
              alt="Vista aérea superior do Sítio Banguê cercado pelos 18 hectares de Mata Atlântica"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#13261B]/75 backdrop-blur-[1px]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2
              id="cta-final-heading"
              style={{ textWrap: 'balance' }}
              className="font-display text-3xl sm:text-4xl font-bold text-[#FBF7EE] mb-4"
            >
              Sua próxima experiência na natureza começa aqui.
            </h2>
            <p className="text-base sm:text-lg text-[#DCE5D0] leading-relaxed mb-8">
              Entre em contato com o Sítio Banguê e descubra as possibilidades para sua próxima
              visita, passeio em família ou atividade pedagógica em Aldeia.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={buildWhatsAppUrl(
                  'Olá! Gostaria de saber mais sobre o Sítio Banguê.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#3D633B] hover:bg-[#2F5233] text-[#FBF7EE] font-semibold text-sm px-7 py-3.5 rounded-full shadow-lg transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Fale pelo WhatsApp</span>
              </a>
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-[#FBF7EE] font-semibold text-sm px-7 py-3.5 rounded-full border border-white/40 transition-colors whitespace-nowrap shrink-0"
              >
                <MapPin className="w-4 h-4" />
                <span>Ver localização</span>
              </a>
            </div>
          </div>
        </section>

        {/* ===================== CONTATO E LOCALIZAÇÃO ===================== */}
        <section
          id="contato"
          aria-labelledby="contato-heading"
          className="py-20 lg:py-24 bg-[#F2EFE4] px-4 sm:px-6"
        >
          <div className="max-w-[1160px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4A6B3A] mb-2">
                Localização & Reservas
              </p>
              <h2
                id="contato-heading"
                className="font-display text-3xl sm:text-4xl font-bold text-[#1E3A2B] mb-3"
              >
                Venha conhecer o Sítio Banguê
              </h2>
              <p className="text-[#4A5745] text-base">
                Fale diretamente com nossa equipe pelo WhatsApp ou envie sua solicitação de
                agendamento abaixo.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Contact Info + Interactive Booking Form */}
              <div className="lg:col-span-6 space-y-6">
                {/* Direct Contact Cards */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#1E3A2B]/8 shadow-sm space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#EBF0E4] text-[#3D633B] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-[#1E3A2B]">
                        Endereço Oficial
                      </h3>
                      <p className="text-sm text-[#4A5745] mt-0.5">
                        Rua Oscár Steiner, 486 — Aldeia dos Camarás (Km 3,5)
                        <br />
                        Camaragibe, PE · CEP 54789-205
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#EBF0E4] text-[#3D633B] flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-[#1E3A2B]">
                        Telefone e WhatsApp
                      </h3>
                      <p className="text-sm text-[#4A5745] mt-0.5">
                        <a
                          href={`tel:+5581997818700`}
                          className="font-semibold text-[#2F5233] hover:underline tabular-nums"
                        >
                          {WHATSAPP_DISPLAY}
                        </a>{' '}
                        · Atendimento para reservas, Day Use e escolas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#EBF0E4] text-[#3D633B] flex items-center justify-center shrink-0">
                      <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-[#1E3A2B]">
                        Instagram
                      </h3>
                      <p className="text-sm text-[#4A5745] mt-0.5">
                        <a
                          href={INSTAGRAM_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#2F5233] hover:underline"
                        >
                          @sitiobangue.ecoturismo
                        </a>{' '}
                        · Acompanhe fotos, eventos e novidades
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <a
                      href={buildWhatsAppUrl(
                        'Olá! Gostaria de saber mais sobre o Sítio Banguê.'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#3D633B] hover:bg-[#2F5233] text-[#FBF7EE] text-xs sm:text-sm font-semibold px-5 py-3 rounded-full transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Conversar no WhatsApp</span>
                    </a>

                    <a
                      href={GOOGLE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#EBF0E4] hover:bg-[#DCE5D0] text-[#1E3A2B] text-xs sm:text-sm font-semibold px-5 py-3 rounded-full transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Abrir no Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Quick Reservation / Inquiry Form */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#1E3A2B]/8 shadow-sm">
                  <h3 className="font-display text-xl font-bold text-[#1E3A2B] mb-1">
                    Solicitar orçamento ou reserva
                  </h3>
                  <p className="text-xs text-[#5A6B58] mb-5">
                    Preencha os dados abaixo para gerar seu protocolo e iniciar o atendimento.
                  </p>

                  {contactStatus === 'success' && contactResponse ? (
                    <div className="bg-[#EBF0E4] p-5 rounded-2xl border border-[#3D633B]/30 space-y-3">
                      <div className="flex items-center gap-2 text-[#1E3A2B] font-semibold">
                        <CheckCircle2 className="w-5 h-5 text-[#3D633B]" />
                        <span>Solicitação registrada ({contactResponse.protocol})</span>
                      </div>
                      <p className="text-xs text-[#3E4E3C]">{contactResponse.message}</p>
                      <div className="flex flex-wrap gap-3 pt-1">
                        <a
                          href={contactResponse.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#3D633B] text-white text-xs font-semibold px-4 py-2.5 rounded-full"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Enviar dados no WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setContactStatus('idle');
                            setContactNotes('');
                          }}
                          className="text-xs font-semibold text-[#1E3A2B] underline cursor-pointer"
                        >
                          Nova solicitação
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="contact-name"
                            className="block text-xs font-semibold text-[#2A3B2C] mb-1"
                          >
                            Seu nome *
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            required
                            placeholder="Ex.: Maria Silva"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#1E3A2B]/20 bg-[#FBF7EE]/60 focus:outline-none focus:border-[#3D633B]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="contact-phone"
                            className="block text-xs font-semibold text-[#2A3B2C] mb-1"
                          >
                            WhatsApp / Telefone *
                          </label>
                          <input
                            id="contact-phone"
                            type="tel"
                            required
                            placeholder="(81) 99999-9999"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#1E3A2B]/20 bg-[#FBF7EE]/60 focus:outline-none focus:border-[#3D633B]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label
                            htmlFor="contact-category"
                            className="block text-xs font-semibold text-[#2A3B2C] mb-1"
                          >
                            Interesse
                          </label>
                          <select
                            id="contact-category"
                            value={contactCategory}
                            onChange={(e) => setContactCategory(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#1E3A2B]/20 bg-[#FBF7EE]/60 focus:outline-none focus:border-[#3D633B]"
                          >
                            <option value="Eco Day Use & Lazer">Eco Day Use</option>
                            <option value="Hospedagem & Refúgio no Campo">Hospedagem</option>
                            <option value="Turismo Rural Pedagógico">Visita Pedagógica</option>
                            <option value="Eventos & Confraternizações">Eventos</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="contact-date"
                            className="block text-xs font-semibold text-[#2A3B2C] mb-1"
                          >
                            Data pretendida
                          </label>
                          <input
                            id="contact-date"
                            type="date"
                            value={contactDate}
                            onChange={(e) => setContactDate(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#1E3A2B]/20 bg-[#FBF7EE]/60 focus:outline-none focus:border-[#3D633B]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="contact-guests"
                            className="block text-xs font-semibold text-[#2A3B2C] mb-1"
                          >
                            Nº de pessoas
                          </label>
                          <input
                            id="contact-guests"
                            type="text"
                            value={contactGuests}
                            onChange={(e) => setContactGuests(e.target.value)}
                            placeholder="Ex.: 4 adultos"
                            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#1E3A2B]/20 bg-[#FBF7EE]/60 focus:outline-none focus:border-[#3D633B]"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="contact-notes"
                          className="block text-xs font-semibold text-[#2A3B2C] mb-1"
                        >
                          Observações ou dúvidas (opcional)
                        </label>
                        <textarea
                          id="contact-notes"
                          rows={2}
                          value={contactNotes}
                          onChange={(e) => setContactNotes(e.target.value)}
                          placeholder="Informe dúvidas sobre horários, excursão escolar ou hospedagem..."
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#1E3A2B]/20 bg-[#FBF7EE]/60 focus:outline-none focus:border-[#3D633B]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={contactStatus === 'submitting'}
                        className="w-full bg-[#2F5233] hover:bg-[#1E3A2B] text-[#FBF7EE] font-semibold text-sm py-3.5 px-6 rounded-full transition-colors cursor-pointer"
                      >
                        {contactStatus === 'submitting'
                          ? 'Enviando solicitação...'
                          : 'Solicitar atendimento'}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Right Column: Embedded Google Map of Sítio Banguê */}
              <div className="lg:col-span-6">
                <div className="bg-white p-3 rounded-3xl border border-[#1E3A2B]/10 shadow-md overflow-hidden">
                  <iframe
                    title="Mapa de localização do Sítio Banguê em Aldeia, Camaragibe - PE"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1975.5215384495518!2d-34.968694954334225!3d-7.994488665072085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab1a098b46b5b1%3A0x99b6de31371f87c5!2zU8OtdGlvIEJhbmd1w6o!5e0!3m2!1spt-BR!2sbr!4v1791859618566!5m2!1spt-BR!2sbr"
                    className="w-full h-[460px] lg:h-[580px] rounded-2xl border-0"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== RODAPÉ ===================== */}
      <footer className="bg-[#12261A] text-[#C8D3B0] pt-14 pb-8 px-4 sm:px-6">
        <div className="max-w-[1160px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#C8D3B0]/15">
            <div className="md:col-span-5">
              <a
                href="#topo"
                aria-label="Sítio Banguê Ecoturismo - Início"
                className="inline-block mb-4"
              >
                <img
                  src="assets/aistudio/logo_36c15d95.webp"
                  alt="Sítio Banguê Ecoturismo"
                  className="h-16 sm:h-20 w-auto object-contain"
                />
              </a>
              <p className="text-sm text-[#B8C6A3] max-w-sm leading-relaxed mb-4">
                Sítio Banguê Eventos, Hospedagem e Ecoturismo. Refúgio de lazer rural,
                educação ambiental e contato com a Mata Atlântica em Aldeia, Camaragibe — PE.
              </p>
              <p className="text-xs text-[#8FA27C]">
                Rua Oscár Steiner, 486 · Aldeia dos Camarás · CEP 54789-205
              </p>
            </div>

            <div className="md:col-span-3">
              <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-[#FBF7EE] mb-4">
                Navegação
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#topo" className="hover:text-white transition-colors">
                    Início
                  </a>
                </li>
                <li>
                  <a href="#sobre" className="hover:text-white transition-colors">
                    Sobre o Sítio
                  </a>
                </li>
                <li>
                  <a href="#experiencias" className="hover:text-white transition-colors">
                    Experiências e Acomodações
                  </a>
                </li>
                <li>
                  <a href="#pedagogico" className="hover:text-white transition-colors">
                    Turismo Pedagógico
                  </a>
                </li>
                <li>
                  <a href="#galeria" className="hover:text-white transition-colors">
                    Galeria de Fotos
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <h4 className="font-sans text-xs font-semibold uppercase tracking-widest text-[#FBF7EE] mb-4">
                Atendimento e Redes Sociais
              </h4>
              <p className="text-sm mb-2">
                WhatsApp / Telefone:{' '}
                <a
                  href="tel:+5581997818700"
                  className="text-[#FBF7EE] font-semibold underline underline-offset-4 tabular-nums"
                >
                  {WHATSAPP_DISPLAY}
                </a>
              </p>
              <p className="text-sm mb-5">
                Instagram:{' '}
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FBF7EE] font-semibold underline underline-offset-4"
                >
                  @sitiobangue.ecoturismo
                </a>
              </p>

              <div className="flex items-center gap-3">
                <a
                  href={buildWhatsAppUrl(
                    'Olá! Gostaria de saber mais sobre o Sítio Banguê.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Conversar pelo WhatsApp"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#3D633B] text-[#FBF7EE] flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Seguir no Instagram"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#3D633B] text-[#FBF7EE] flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ver localização no Google Maps"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#3D633B] text-[#FBF7EE] flex items-center justify-center transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8FA27C]">
            <p>
              © {new Date().getFullYear()} Sítio Banguê Eventos e Ecoturismo. Todos os direitos
              reservados.
            </p>
            <p>Aldeia · Camaragibe · Pernambuco · Brasil</p>
          </div>
        </div>
      </footer>

      {/* ===================== MODAL: DETALHES DA EXPERIÊNCIA ===================== */}
      {selectedExperience && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-exp-title"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedExperience(null)}
        >
          <div
            className="bg-[#FBF7EE] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#1E3A2B]/15 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] bg-[#DCE5D0]">
              <SafeImage
                src={selectedExperience.image}
                alt={selectedExperience.imageAlt}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedExperience(null)}
                aria-label="Fechar janela de detalhes"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#4A6B3A] mb-1">
                {selectedExperience.subtitle}
              </p>
              <h3
                id="modal-exp-title"
                className="font-display text-2xl sm:text-3xl font-bold text-[#1E3A2B] mb-3"
              >
                {selectedExperience.title}
              </h3>
              <p className="text-sm sm:text-base text-[#3E4E3C] leading-relaxed mb-6">
                {selectedExperience.fullDescription}
              </p>

              <div className="bg-white p-5 rounded-2xl border border-[#1E3A2B]/10 mb-6">
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#1E3A2B] mb-3">
                  O que está incluído / Destaques
                </h4>
                <ul className="space-y-2 text-sm text-[#3E4E3C]">
                  {selectedExperience.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#3D633B] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#4A5745] mb-6">
                <div className="flex items-center gap-2 bg-[#E9F0E1] px-4 py-3 rounded-xl">
                  <Users className="w-4 h-4 text-[#2F5233] shrink-0" />
                  <span>
                    <strong>Ideal para:</strong> {selectedExperience.idealFor}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#E9F0E1] px-4 py-3 rounded-xl">
                  <Clock className="w-4 h-4 text-[#2F5233] shrink-0" />
                  <span>{selectedExperience.scheduleInfo}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => selectExperienceForBooking(selectedExperience)}
                  className="px-5 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#E9F0E1] hover:bg-[#DCE5D0] text-[#1E3A2B] transition-colors cursor-pointer"
                >
                  Selecionar na barra de datas
                </button>
                <a
                  href={buildWhatsAppUrl(selectedExperience.whatsappText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#3D633B] hover:bg-[#2F5233] text-[#FBF7EE] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reservar pelo WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CONFIRMAÇÃO DE CONSULTA DE DISPONIBILIDADE ===================== */}
      {bookingResult && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-booking-title"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setBookingResult(null)}
        >
          <div
            className="bg-[#FBF7EE] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#1E3A2B]/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E9F0E1] text-[#3D633B] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setBookingResult(null)}
                aria-label="Fechar confirmação"
                className="w-9 h-9 rounded-full bg-[#E9F0E1] text-[#1E3A2B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3
              id="modal-booking-title"
              className="font-display text-2xl font-bold text-[#1E3A2B] mb-2"
            >
              Consulta pronta para atendimento
            </h3>
            <p className="text-sm text-[#4A5745] mb-5">{bookingResult.message}</p>

            <div className="bg-white rounded-2xl p-4 border border-[#1E3A2B]/10 space-y-2 text-xs sm:text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-[#5A6B58]">Protocolo:</span>
                <strong className="text-[#1E3A2B] tabular-nums">{bookingResult.protocol}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6B58]">Experiência:</span>
                <strong className="text-[#1E3A2B]">{bookingResult.inquiry.category}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6B58]">Data desejada:</span>
                <strong className="text-[#1E3A2B] tabular-nums">
                  {bookingResult.inquiry.date.split('-').reverse().join('/')}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6B58]">Visitantes:</span>
                <strong className="text-[#1E3A2B]">{bookingResult.inquiry.guests}</strong>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={bookingResult.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#3D633B] hover:bg-[#2F5233] text-white font-semibold text-sm py-3.5 px-6 rounded-full transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirmar disponibilidade no WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setBookingResult(null)}
                className="w-full py-2.5 text-xs font-semibold text-[#4A5745] hover:text-[#1E3A2B] cursor-pointer"
              >
                Voltar para a página
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== LIGHTBOX DA GALERIA ===================== */}
      {lightboxIndex !== null && filteredGallery[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada da foto"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Fechar galeria"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(
                (lightboxIndex - 1 + filteredGallery.length) % filteredGallery.length
              );
            }}
            aria-label="Foto anterior"
            className="absolute left-4 sm:left-6 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-h-[75vh] overflow-hidden rounded-2xl bg-[#1E3A2B]">
              <SafeImage
                src={filteredGallery[lightboxIndex].image}
                alt={filteredGallery[lightboxIndex].alt}
                className="w-full max-h-[75vh] object-contain mx-auto"
              />
            </div>
            <div className="mt-4 text-center text-[#FBF7EE]">
              <p className="text-xs text-[#C8D3B0]">
                {filteredGallery[lightboxIndex].categoryLabel}
              </p>
              <h3 className="font-display text-xl font-semibold text-white">
                {filteredGallery[lightboxIndex].title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((lightboxIndex + 1) % filteredGallery.length);
            }}
            aria-label="Próxima foto"
            className="absolute right-4 sm:right-6 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
