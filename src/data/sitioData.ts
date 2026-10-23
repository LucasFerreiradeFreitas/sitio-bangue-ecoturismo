export interface ExperienceCard {
  id: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  imageAlt: string;
  highlights: string[];
  idealFor: string;
  scheduleInfo: string;
  whatsappText: string;
}

export interface DayUseActivity {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  spanLarge?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'natureza' | 'lazer' | 'acomodacoes' | 'fazendinha';
  categoryLabel: string;
  image: string;
  alt: string;
  tall?: boolean;
  wide?: boolean;
}

export const WHATSAPP_NUMBER = '5581997818700';
export const WHATSAPP_DISPLAY = '(81) 99781-8700';
export const INSTAGRAM_URL = 'https://www.instagram.com/sitiobangue.ecoturismo/';
export const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Rua+Osc%C3%A1r+Steiner%2C+486%2C+Aldeia+dos+Camar%C3%A1s%2C+Camaragibe%2C+PE';

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const HERO_VIDEO = 'assets/aistudio/video-header_26819d21.mp4';

export const HERO_IMAGE = 'assets/aistudio/image-psicina-drone_ba25196b.webp';

export const ABOUT_IMAGE = 'assets/aistudio/sitio_e0eeee5f.webp';

export const PEDAGOGICO_IMAGE = 'assets/aistudio/aprender_ab5a7ac6.webp';

export const CTA_FINAL_IMAGE = 'assets/aistudio/cta-final_c4d0b6a6.webp';

export const EXPERIENCES_CARDS: ExperienceCard[] = [
  {
    id: 'eco-day-use',
    title: 'Eco Day Use & Lazer Rural',
    subtitle: 'Vivência completa ao ar livre',
    shortDescription:
      'Um dia inteiro para desacelerar em meio à Mata Atlântica, com piscinas, trilhas acompanhadas, fazendinha e passeios a cavalo.',
    fullDescription:
      'O Eco Day Use do Sítio Banguê reúne atividades planejadas para famílias, casais e grupos de amigos que buscam contato autêntico com a natureza. Aproveite a tranquilidade de 18 hectares preservados em Aldeia para explorar, brincar e renovar as energias.',
    image: 'assets/aistudio/image-psicina-drone_ba25196b.webp',
    imageAlt: 'Vista aérea da piscina e área de lazer do Sítio Banguê cercada pela Mata Atlântica',
    highlights: [
      'Acesso à piscina cercada pelo verde da Mata Atlântica',
      'Interação e alimentação dos animais na Fazendinha',
      'Trilhas ecopedagógicas guiadas pela mata nativa',
      'Passeios tranquilos a cavalo e de charrete pelo sítio',
      'Áreas sombreadas de descanso e convivência familiar',
    ],
    idealFor: 'Famílias, casais e grupos de amigos',
    scheduleInfo: 'Atendimento mediante agendamento e consulta de programação',
    whatsappText:
      'Olá! Gostaria de saber mais detalhes e valores sobre o Eco Day Use no Sítio Banguê.',
  },
  {
    id: 'hospedagem-campo',
    title: 'Estrutura, Eventos & Estadias',
    subtitle: 'Conforto e integração com a natureza',
    shortDescription:
      'Espaços amplos e acolhedores integrados ao verde de Aldeia, ideais para eventos, encontros em família e descanso no campo.',
    fullDescription:
      'O Sítio Banguê conta com estrutura envidraçada e aconchegante integrada aos gramados e à Mata Atlântica, ideal para eventos, confraternizações, vivências em grupo e estadias sob consulta. Desfrute do ar puro da APA de Aldeia com total privacidade.',
    image: 'assets/aistudio/sitio_e0eeee5f.webp',
    imageAlt: 'Espaço coberto de madeira e vidro integrado ao gramado verde do Sítio Banguê',
    highlights: [
      'Salão e estrutura envidraçada integrada à paisagem',
      'Amplo gramado arborizado para eventos e confraternizações',
      'Ambiente silencioso, ideal para descanso e desconexão',
      'Integração com as atividades de lazer e trilhas locais',
      'Formatos personalizados para famílias, grupos e celebrações',
    ],
    idealFor: 'Famílias, celebrações, eventos corporativos e grupos',
    scheduleInfo: 'Disponibilidade e formatos sob consulta prévia pelo WhatsApp',
    whatsappText:
      'Olá! Gostaria de consultar a disponibilidade de espaço, eventos e estadias no Sítio Banguê.',
  },
  {
    id: 'turismo-pedagogico',
    title: 'Turismo Rural Pedagógico',
    subtitle: 'Educação ambiental na prática',
    shortDescription:
      'Aulas-passeio e roteiros ecopedagógicos para escolas e instituições, integrando aprendizado prático, fauna, flora e sustentabilidade.',
    fullDescription:
      'O Turismo Rural Pedagógico do Sítio Banguê proporciona às escolas a oportunidade de aproximar os estudantes da fauna, da flora e das características do ambiente natural da Mata Atlântica. As atividades complementam projetos escolares com observação guiada e oficinas criativas.',
    image: 'assets/aistudio/aprender_ab5a7ac6.webp',
    imageAlt: 'Crianças participando de oficina pedagógica e atividade educativa no Sítio Banguê',
    highlights: [
      'Roteiros adaptados para diferentes faixas etárias e séries',
      'Observação direta da biodiversidade da Mata Atlântica',
      'Vivência prática de sustentabilidade e educação ambiental',
      'Acompanhamento em trilhas interpretativas e fazendinha',
      'Estrutura segura e acolhedora para excursões escolares',
    ],
    idealFor: 'Escolas, colégios, universidades e grupos educacionais',
    scheduleInfo: 'Agendamento exclusivo para grupos e instituições de ensino',
    whatsappText:
      'Olá! Represento uma instituição de ensino e gostaria de conhecer os roteiros de Turismo Rural Pedagógico do Sítio Banguê.',
  },
];

export const DAY_USE_ACTIVITIES: DayUseActivity[] = [
  {
    id: 'fazendinha',
    title: 'Fazendinha',
    description:
      'Conhecer e alimentar os animais da fazendinha, em uma vivência tranquila e próxima da rotina do campo.',
    image: 'assets/aistudio/fazendinha_d6fc9607.webp',
    imageAlt: 'Animal da fazendinha do Sítio Banguê em ambiente rural ao ar livre',
    spanLarge: true,
  },
  {
    id: 'trilhas',
    title: 'Trilhas ecopedagógicas',
    description:
      'Explorar a natureza por trilhas acompanhadas, com observação da fauna, da flora e do ambiente local.',
    image: 'assets/aistudio/trilha_59c799c4.webp',
    imageAlt: 'Visitantes percorrendo trilha ecológica em meio à Mata Atlântica no Sítio Banguê',
    spanLarge: true,
  },
  {
    id: 'piscina',
    title: 'Piscina',
    description:
      'Momentos de lazer e refresco em meio ao verde para toda a família.',
    image: 'assets/aistudio/Piscina_3b51c8e4.webp',
    imageAlt: 'Visitantes aproveitando a piscina do Sítio Banguê',
  },
  {
    id: 'cavalo',
    title: 'Passeios a cavalo e de charrete',
    description:
      'Percursos tranquilos pelo gramado do sítio para observar a paisagem e viver o campo.',
    image: 'assets/aistudio/cavalo_59b0a883.webp',
    imageAlt: 'Passeio a cavalo acompanhado na área verde do Sítio Banguê',
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Vista Aérea · 18 Hectares de Mata Atlântica',
    category: 'natureza',
    categoryLabel: 'Natureza & Trilhas',
    image: 'assets/aistudio/cta-final_c4d0b6a6.webp',
    alt: 'Vista aérea superior do Sítio Banguê cercado pela imensidão da Mata Atlântica',
    wide: true,
  },
  {
    id: 'gal-2',
    title: 'Piscina e Área de Lazer',
    category: 'lazer',
    categoryLabel: 'Lazer & Piscina',
    image: 'assets/aistudio/image-psicina-drone_ba25196b.webp',
    alt: 'Vista panorâmica da piscina e jardins do Sítio Banguê',
    wide: true,
  },
  {
    id: 'gal-3',
    title: 'Espaço Coberto & Arquitetura do Sítio',
    category: 'acomodacoes',
    categoryLabel: 'Estrutura & Campo',
    image: 'assets/aistudio/sitio_e0eeee5f.webp',
    alt: 'Pavilhão de madeira e vidro cercado por gramado e árvores nativas',
  },
  {
    id: 'gal-4',
    title: 'Vivência na Fazendinha',
    category: 'fazendinha',
    categoryLabel: 'Fazendinha',
    image: 'assets/aistudio/fazendinha_d6fc9607.webp',
    alt: 'Animal na fazendinha do Sítio Banguê',
  },
  {
    id: 'gal-5',
    title: 'Trilhas Ecopedagógicas Guiadas',
    category: 'natureza',
    categoryLabel: 'Natureza & Trilhas',
    image: 'assets/aistudio/trilha_59c799c4.webp',
    alt: 'Grupo caminhando pela trilha ecológica na Mata Atlântica',
  },
  {
    id: 'gal-6',
    title: 'Diversão na Piscina',
    category: 'lazer',
    categoryLabel: 'Lazer & Piscina',
    image: 'assets/aistudio/Piscina_3b51c8e4.webp',
    alt: 'Banho de piscina no Sítio Banguê visto de cima',
  },
  {
    id: 'gal-7',
    title: 'Passeios a Cavalo no Campo',
    category: 'fazendinha',
    categoryLabel: 'Fazendinha',
    image: 'assets/aistudio/cavalo_59b0a883.webp',
    alt: 'Criança realizando passeio a cavalo acompanhado no gramado do Sítio Banguê',
  },
  {
    id: 'gal-8',
    title: 'Oficinas e Turismo Pedagógico',
    category: 'acomodacoes',
    categoryLabel: 'Pedagógico & Oficinas',
    image: 'assets/aistudio/aprender_ab5a7ac6.webp',
    alt: 'Atividade pedagógica e criativa com elementos naturais no Sítio Banguê',
  },
];
