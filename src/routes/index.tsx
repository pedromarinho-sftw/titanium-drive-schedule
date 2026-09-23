import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  Clock3,
  Droplets,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { cancelBooking, createBooking, getBookedSlots } from "@/lib/booking";
import heroImage from "@/assets/titanium-hero.jpg";
import titaniumLogo from "@/assets/titanium-logo.jpg";
import paintImage from "@/assets/paint-before-after.jpg";
import interiorImage from "@/assets/interior-detail.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Titanium | Estética Automotiva Premium em Juiz de Fora" },
      {
        name: "description",
        content:
          "Lavagem, higienização, polimento, vitrificação, envelopamento e detalhamento automotivo premium. Agende seu horário na Titanium.",
      },
      { property: "og:title", content: "Titanium | Estética Automotiva Premium" },
      {
        property: "og:description",
        content: "Precisão, proteção e acabamento impecável para o seu carro.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TitaniumPage,
});

const WHATSAPP = "5532991318611";

const services = [
  {
    name: "Lavagem e Higienização",
    short: "Lavagem Premium",
    price: "R$ 180",
    description: "Limpeza interna e externa, bancos e ar-condicionado com atenção a cada detalhe.",
    icon: Droplets,
    code: "01",
  },
  {
    name: "Polimento e Vitrificação",
    short: "Polimento + Vitrificação",
    price: "R$ 650",
    description: "Correção de riscos, brilho profundo e proteção cerâmica de alta durabilidade.",
    icon: Sparkles,
    code: "02",
  },
  {
    name: "Envelopamento e Película",
    short: "Envelopamento + Película",
    price: "R$ 450",
    description: "Personalização visual e proteção profissional para pintura, vidros e acabamentos.",
    icon: ShieldCheck,
    code: "03",
  },
  {
    name: "Detalhamento Completo",
    short: "Detalhamento Completo",
    price: "R$ 990",
    description: "Nosso pacote premium: cuidado integral, acabamento impecável e proteção completa.",
    icon: CarFront,
    code: "04",
  },
];

const testimonials = [
  {
    quote: "O carro voltou melhor do que quando saiu da concessionária. O cuidado nos mínimos detalhes impressiona.",
    name: "Rafael M.",
    car: "BMW 320i",
  },
  {
    quote: "Atendimento impecável e resultado surpreendente. A pintura ganhou outra profundidade depois da vitrificação.",
    name: "Mariana A.",
    car: "Jeep Compass",
  },
  {
    quote: "Equipe extremamente cuidadosa. Cumpriram o prazo e me explicaram todo o processo com muita transparência.",
    name: "Lucas R.",
    car: "Audi A3",
  },
];

const slots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function nextDays(total = 14) {
  const dates: Date[] = [];
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  for (let i = 1; i <= total; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    if (date.getDay() !== 0) dates.push(date);
  }
  return dates;
}

function LinkButton({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  return (
    <a href={href} className={secondary ? "btn btn-secondary" : "btn btn-primary"}>
      {children}
    </a>
  );
}

function TitaniumPage() {
  const dates = useMemo(() => nextDays(), []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(dates[0] ?? null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState(services[0]?.name ?? "");
  const [testimonial, setTestimonial] = useState(0);
  const [success, setSuccess] = useState<{ name: string; car: string; phone: string; notes: string; bookingId: string; cancellationToken: string } | null>(null);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadAvailability() {
      if (!selectedDate) return;
      setLoadingSlots(true);
      setAvailabilityLoaded(false);
      setBookingError("");
      try {
        const booked = await getBookedSlots(dateKey(selectedDate));
        if (active) {
          setUnavailable(booked);
          setAvailabilityLoaded(true);
          setSelectedTime((current) => booked.includes(current) ? "" : current);
        }
      } catch (error) {
        if (active) {
          setAvailabilityLoaded(false);
          setBookingError(error instanceof Error ? error.message : "Não foi possível carregar os horários.");
        }
      } finally {
        if (active) setLoadingSlots(false);
      }
    }
    void loadAvailability();
    return () => { active = false; };
  }, [selectedDate]);

  function selectDate(date: Date) {
    setSelectedDate(date);
    setSelectedTime("");
    setAvailabilityLoaded(false);
    setBookingError("");
  }

  async function refreshSlots(date: Date) {
    setLoadingSlots(true);
    setAvailabilityLoaded(false);
    try {
      const booked = await getBookedSlots(dateKey(date));
      setUnavailable(booked);
      setAvailabilityLoaded(true);
      setSelectedTime((current) => (booked.includes(current) ? "" : current));
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : "Não foi possível atualizar os horários.");
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDate || !selectedTime || !availabilityLoaded || submitting) return;
    setBookingError("");
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    const bookingData = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      car: String(data.get("car") ?? ""),
      notes: String(data.get("notes") ?? ""),
      service: selectedService,
      bookingDate: dateKey(selectedDate),
      bookingTime: selectedTime,
    };

    try {
      const booking = await createBooking(bookingData);
      setUnavailable((current) => [...current, selectedTime]);
      setSuccess({ ...bookingData, bookingId: booking.id, cancellationToken: booking.cancellationToken });

      const dateLabel = selectedDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
      const message = encodeURIComponent(
        `Olá, Titanium! Gostaria de confirmar meu agendamento.

🚗 Serviço: ${selectedService}
📅 Data: ${dateLabel}
🕐 Horário: ${selectedTime}
👤 Nome: ${bookingData.name}
🚘 Veículo: ${bookingData.car}
📱 WhatsApp: ${bookingData.phone}
${bookingData.notes ? `📝 Observações: ${bookingData.notes}` : ""}

Estou enviando esta mensagem para confirmar o serviço e o horário.`
      );
      window.location.assign(`https://wa.me/${WHATSAPP}?text=${message}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível registrar o agendamento.";
      setBookingError(
        /indispon|unique|duplicad/i.test(message)
          ? "Este horário acabou de ficar indisponível. Escolha outro horário disponível."
          : message,
      );
      await refreshSlots(selectedDate);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    if (!success) return;
    setCancelling(true);
    try {
      await cancelBooking(success.cancellationToken);
      setUnavailable((current) => current.filter((slot) => slot !== selectedTime));
      setSuccess(null);
      setSelectedTime("");
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : "Não foi possível cancelar o agendamento.");
    } finally {
      setCancelling(false);
    }
  }

  const formattedDate = selectedDate?.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const whatsappMessage = success
    ? encodeURIComponent(
        `Olá, Titanium! Gostaria de confirmar meu agendamento.\\n\\n🚗 Serviço: ${success.service}\\n📅 Data: ${selectedDate?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}\\n🕐 Horário: ${success.bookingTime}\\n👤 Nome: ${success.name}\\n🚘 Veículo: ${success.car}\\n📱 WhatsApp: ${success.phone}${success.notes ? `\\n📝 Observações: ${success.notes}` : ""}\\n\\nEstou enviando esta mensagem para confirmar o serviço e o horário.`
      )
    : encodeURIComponent("Olá, Titanium! Gostaria de falar sobre um agendamento.");

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="site-header">
        <a href="#inicio" className="brand" aria-label="Titanium — início">
          <img src={titaniumLogo} alt="Titanium" className="brand-logo" width={86} height={86} />
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#servicos">Serviços</a>
          <a href="#sobre">Sobre</a>
          <a href="#galeria">Galeria</a>
          <a href="#agendamento">Agendamento</a>
          <a href="#contato">Contato</a>
        </nav>
        <a href="#agendamento" className="header-cta">Agendar horário</a>
        <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Abrir menu" aria-expanded={menuOpen}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Navegação móvel">
            {[["Serviços", "servicos"], ["Sobre", "sobre"], ["Galeria", "galeria"], ["Agendamento", "agendamento"], ["Contato", "contato"]].map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section id="inicio" className="hero-section">
          <img src={heroImage} alt="Carro esportivo preto recebendo detalhamento profissional" className="hero-image" width={1920} height={1088} />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow animate-fade-in"><span /> Estética automotiva de alta precisão</div>
            <h1 className="animate-fade-in">Seu carro merece um<br /><em>acabamento de titânio.</em></h1>
            <p className="animate-fade-in">Proteção, brilho e cuidado técnico para quem não abre mão de excelência.</p>
            <div className="hero-actions animate-fade-in">
              <LinkButton href="#agendamento">Agendar meu horário <ArrowRight size={18} /></LinkButton>
              <LinkButton href="#servicos" secondary>Conhecer serviços</LinkButton>
            </div>
          </div>
          <a href="#servicos" className="scroll-cue" aria-label="Ver serviços"><ArrowDown size={20} /></a>
          <div className="hero-stat"><strong>+500</strong><span>carros transformados</span></div>
        </section>

        <section id="servicos" className="section services-section">
          <div className="section-heading">
            <div><span className="kicker">Serviços</span><h2>Cuidado completo.<br /><em>Resultado impecável.</em></h2></div>
            <p>Técnica, produtos profissionais e atenção rigorosa em cada etapa do processo.</p>
          </div>
          <div className="services-grid">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article className="service-card" key={service.name}>
                  <span className="service-number">{service.code}</span>
                  <Icon size={30} strokeWidth={1.5} />
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-price"><span>A partir de</span><strong>{service.price}</strong></div>
                  <a href="#agendamento" onClick={() => setSelectedService(service.name)}>Agendar serviço <ArrowRight size={16} /></a>
                </article>
              );
            })}
          </div>
        </section>

        <section id="galeria" className="section gallery-section">
          <div className="section-heading compact">
            <div><span className="kicker">Antes & Depois</span><h2>A diferença está<br /><em>nos detalhes.</em></h2></div>
            <p>Resultados demonstrativos do padrão de acabamento que buscamos em cada veículo.</p>
          </div>
          <div className="gallery-grid">
            <figure className="gallery-main">
              <img src={paintImage} alt="Comparação de pintura automotiva antes e depois do polimento" loading="lazy" width={1408} height={912} />
              <figcaption><span>Antes</span><span>Depois</span></figcaption>
            </figure>
            <figure className="gallery-side">
              <img src={interiorImage} alt="Interior automotivo após higienização profissional" loading="lazy" width={1200} height={912} />
              <figcaption>Higienização interna</figcaption>
            </figure>
            <figure className="gallery-side detail-crop">
              <img src={heroImage} alt="Reflexo da pintura após detalhamento" loading="lazy" width={1920} height={1088} />
              <figcaption>Brilho e proteção</figcaption>
            </figure>
          </div>
        </section>

        <section id="agendamento" className="section booking-section">
          <div className="booking-intro">
            <span className="kicker">Agendamento</span>
            <h2>Escolha seu<br /><em>melhor horário.</em></h2>
            <p>Reserve seu atendimento em poucos passos. O horário fica separado para cuidarmos do seu carro sem pressa.</p>
            <div className="booking-perks">
              <span><Check size={16} /> Confirmação pelo WhatsApp</span>
              <span><Check size={16} /> Atendimento exclusivo</span>
              <span><Check size={16} /> Sem pagamento antecipado</span>
            </div>
          </div>

          <div className="booking-panel">
            {success ? (
              <div className="success-state" role="status">
                <div className="success-icon"><Check size={32} /></div>
                <span className="kicker">Confirmação pelo WhatsApp</span>
                <h3>Solicitação enviada, {success.name.split(" ")[0]}.</h3>
                <p>Seu pedido foi registrado e a mensagem pronta foi aberta no WhatsApp. A confirmação final do serviço e do horário será feita pela Titanium por lá.</p>
                <div className="booking-summary">
                  <div><CalendarDays size={18} /><span><small>Data</small>{formattedDate}</span></div>
                  <div><Clock3 size={18} /><span><small>Horário</small>{selectedTime}</span></div>
                  <div><CarFront size={18} /><span><small>Veículo</small>{success.car}</span></div>
                  <div><Sparkles size={18} /><span><small>Serviço</small>{selectedService}</span></div>
                </div>
                <div className="success-actions">
                  <a className="btn btn-primary" href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
                    <MessageCircle size={18} /> Confirmar pelo WhatsApp
                  </a>
                  <button className="btn btn-secondary" onClick={() => void handleCancel()} disabled={cancelling}>
                    {cancelling ? "Cancelando..." : "Cancelar agendamento"}
                  </button>
                  <button className="text-action" onClick={() => { setSuccess(null); setSelectedTime(""); }}>Fazer outro agendamento</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-step"><span>01</span><div><strong>Escolha a data</strong><small>Atendemos de segunda a sábado</small></div></div>
                <div className="date-strip">
                  {dates.slice(0, 7).map((date) => {
                    const active = selectedDate ? dateKey(selectedDate) === dateKey(date) : false;
                    return (
                      <button type="button" key={dateKey(date)} className={active ? "date-card active" : "date-card"} onClick={() => selectDate(date)}>
                        <span>{date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span>
                        <strong>{date.getDate()}</strong>
                        <small>{date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</small>
                      </button>
                    );
                  })}
                </div>

                <div className="form-step"><span>02</span><div><strong>Escolha o horário</strong><small>{loadingSlots ? "Atualizando disponibilidade..." : "Horários ocupados ficam indisponíveis para todos"}</small></div></div>
                <div className="time-grid" aria-busy={loadingSlots}>
                  {slots.map((slot) => {
                    const disabled = loadingSlots || !availabilityLoaded || unavailable.includes(slot);
                    return <button type="button" key={slot} disabled={disabled} className={selectedTime === slot ? "active" : ""} onClick={() => setSelectedTime(slot)}>{slot}</button>;
                  })}
                </div>

                <div className="form-step"><span>03</span><div><strong>Seus dados</strong><small>Conte-nos sobre você e seu carro</small></div></div>
                <div className="form-grid">
                  <label className="full">Serviço desejado<select value={selectedService} onChange={(event) => setSelectedService(event.target.value)}>{services.map((service) => <option key={service.name}>{service.name}</option>)}</select><ChevronDown size={16} /></label>
                  <label>Seu nome<input name="name" required placeholder="Nome completo" /></label>
                  <label>WhatsApp<input name="phone" required type="tel" placeholder="(32) 99999-9999" /></label>
                  <label className="full">Modelo do carro<input name="car" required placeholder="Ex.: Honda Civic 2022" /></label>
                  <label className="full">Observações <span>(opcional)</span><textarea name="notes" rows={3} placeholder="Algo que devemos saber sobre o veículo?" /></label>
                </div>
                {!selectedTime && <p className="time-warning">Selecione um horário disponível para continuar.</p>}
                {bookingError && <p className="booking-error" role="alert">{bookingError}</p>}
                <p className="time-warning">Seu horário será reservado no sistema e a confirmação final do pedido será realizada pelo WhatsApp.</p>
                <button className="btn btn-primary submit-button" type="submit" disabled={!selectedTime || !availabilityLoaded || loadingSlots || submitting}>{submitting ? "Reservando horário..." : "Reservar horário"} <ArrowRight size={18} /></button>
                <div className="or-line"><span>ou</span></div>
                <a className="whatsapp-alternative" href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`} target="_blank" rel="noreferrer"><MessageCircle size={19} /> Prefiro agendar pelo WhatsApp</a>
              </form>
            )}
          </div>
        </section>

        <section id="sobre" className="section about-section">
          <div className="about-image"><img src={heroImage} alt="Equipe Titanium realizando detalhamento automotivo" loading="lazy" width={1920} height={1088} /><span>Precisão em cada detalhe</span></div>
          <div className="about-copy">
            <span className="kicker">Sobre a Titanium</span>
            <h2>Paixão por carros.<br /><em>Obsessão por excelência.</em></h2>
            <p>A Titanium nasceu para elevar o padrão da estética automotiva. Tratamos cada veículo como único, combinando técnica, produtos de alto desempenho e cuidado artesanal.</p>
            <div className="differentials">
              <div><strong>01</strong><span><b>Qualidade sem atalhos</b><small>Processos precisos e acabamento rigoroso.</small></span></div>
              <div><strong>02</strong><span><b>Equipamento profissional</b><small>Tecnologia e produtos de alta performance.</small></span></div>
              <div><strong>03</strong><span><b>Cuidado de especialista</b><small>Seu carro protegido por quem entende.</small></span></div>
            </div>
          </div>
        </section>

        <section className="section testimonials-section">
          <span className="kicker">Quem confia, recomenda</span>
          <div className="testimonial-layout">
            <div className="quote-mark">“</div>
            <article>
              <div className="stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={17} fill="currentColor" />)}</div>
              <blockquote>{testimonials[testimonial]?.quote}</blockquote>
              <div className="testimonial-author"><strong>{testimonials[testimonial]?.name}</strong><span>{testimonials[testimonial]?.car}</span></div>
            </article>
            <div className="carousel-controls">
              <button onClick={() => setTestimonial((testimonial - 1 + testimonials.length) % testimonials.length)} aria-label="Depoimento anterior"><ArrowLeft size={19} /></button>
              <span>{String(testimonial + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}</span>
              <button onClick={() => setTestimonial((testimonial + 1) % testimonials.length)} aria-label="Próximo depoimento"><ArrowRight size={19} /></button>
            </div>
          </div>
        </section>
      </main>

      <footer id="contato" className="site-footer">
        <div className="footer-top">
          <div className="footer-brand"><a href="#inicio" className="brand"><img src={titaniumLogo} alt="Titanium" className="brand-logo footer-logo" width={100} height={100} /></a><p>Estética automotiva premium.<br />Precisão que você vê. Proteção que dura.</p></div>
          <div><span className="footer-label">Contato</span><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">(32) 99131-8611</a><a href="https://instagram.com/titanium_jf" target="_blank" rel="noreferrer"><Instagram size={16} /> @titanium_jf</a></div>
          <div><span className="footer-label">Localização</span><p><MapPin size={16} /> Juiz de Fora — MG</p><small>Endereço a confirmar</small></div>
          <div><span className="footer-label">Funcionamento</span><p>Horários sob consulta</p><small>Agende seu atendimento online</small></div>
        </div>
        <div className="map-placeholder"><MapPin size={24} /><span>Mapa e endereço em breve</span></div>
        <div className="footer-bottom"><span>© 2026 Titanium Estética Automotiva</span><span>Excelência em cada detalhe.</span></div>
      </footer>

      <a className="floating-whatsapp" href={`https://wa.me/${WHATSAPP}?text=${whatsappMessage}`} target="_blank" rel="noreferrer" aria-label="Agendar pelo WhatsApp"><MessageCircle size={25} /></a>
    </div>
  );
}