import type { ComponentType } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  GraduationCap,
  BookOpen,
  Briefcase,
} from 'lucide-react-native';
import {
  UNISA_COURSES,
  PHONE_PREFIXES,
  enrolledStudentsByCourse,
} from './data';
import type { Role, UserProfile, NewsItem, Ticket as TicketType } from './types';
import { BACKEND_URL } from './constants';

export type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

export const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const isInstitutionalEmail = (email: string) => {
  const trimmed = email.trim();
  const regex = /^[a-zA-Z0-9._%+-]*[a-zA-Z][a-zA-Z0-9._%+-]*@((studenti\.)?unisa\.it)$/i;
  return regex.test(trimmed);
};

export const isNameValid = (text: string) => {
  const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([\'’\-][A-Za-zÀ-ÖØ-öø-ÿ]+)*(\s+[A-Za-zÀ-ÖØ-öø-ÿ]+([\'’\-][A-Za-zÀ-ÖØ-öø-ÿ]+)*)*$/;
  return regex.test(text.trim());
};

export const isPasswordValid = (pwd: string) => {
  if (pwd.length < 8 || pwd.length > 16) return false;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(pwd);
  return hasUppercase && hasSpecial;
};

export const getDegreeCfu = (courseName?: string): number => {
  if (!courseName) return 180;
  const found = UNISA_COURSES.find(c => c.name.toLowerCase() === courseName.toLowerCase());
  return found ? found.cfu : 180;
};

export const parsePhone = (phoneStr?: string): { prefix: string; number: string } => {
  if (!phoneStr) return { prefix: '🇮🇹 +39', number: '' };
  const cleaned = phoneStr.trim();
  const matchWithFlag = PHONE_PREFIXES.find(p => cleaned.startsWith(p));
  if (matchWithFlag) {
    return { prefix: matchWithFlag, number: cleaned.slice(matchWithFlag.length).trim() };
  }
  const matchWithoutFlag = PHONE_PREFIXES.find(p => {
    const purePrefix = p.replace(/^[^\+]+/, '');
    return cleaned.startsWith(purePrefix);
  });
  if (matchWithoutFlag) {
    const purePrefix = matchWithoutFlag.replace(/^[^\+]+/, '');
    return { prefix: matchWithoutFlag, number: cleaned.slice(purePrefix.length).trim() };
  }
  return { prefix: '🇮🇹 +39', number: cleaned };
};

export const getTeacherCourses = (user: UserProfile | null) => {
  if (!user || user.role !== 'Docente') return [];
  const teachings = user.teachings || [];
  if (teachings.length === 0) {
    return [
      { id: 'tc-1', name: 'Mobile Programming', room: 'Aula F6', students: 86, material: 'Slide, esercitazioni, progetto finale' },
      { id: 'tc-2', name: 'Laboratorio di App', room: 'Lab T25', students: 42, material: 'Repository GitHub e consegne settimanali' },
    ];
  }
  return teachings.map((t, idx) => ({
    id: `tc-${idx}-${t}`,
    name: t,
    room: `Aula ${String.fromCharCode(65 + (idx % 6))}${idx + 1}`,
    students: 15 + (idx * 7) % 50,
    material: 'Slide, esercitazioni, progetto finale',
  }));
};

export const getEnrolledStudents = (courseId: string) => {
  const predefined = enrolledStudentsByCourse[courseId];
  if (predefined && predefined.length > 0) return predefined;
  return [
    { name: 'Lucia', surname: 'Canzolino', matricola: '0512106789' },
    { name: 'Giovanni', surname: 'Lupo', matricola: '0512101234' },
    { name: 'Antonio', surname: 'Purcaro', matricola: '0512105678' },
    { name: 'Marco', surname: 'Rossi', matricola: '0512104321' },
    { name: 'Francesca', surname: 'Bianchi', matricola: '0512109876' }
  ];
};

export const capitalizeWords = (str?: string): string => {
  if (!str) return '';
  const trimmed = str.trim();
  let result = '';
  const separators = [' ', '-', "'", '’'];
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    const prev = i > 0 ? trimmed[i - 1] : undefined;
    const next = i < trimmed.length - 1 ? trimmed[i + 1] : undefined;

    // First letter of a word (start of string or after a separator)
    const isFirstLetter = i === 0 || (prev !== undefined && separators.includes(prev));

    if (isFirstLetter) {
      result += char.toUpperCase();
    } else {
      const isNextToSeparator = next !== undefined && separators.includes(next);
      if (isNextToSeparator) {
        result += char;
      } else {
        result += char.toLowerCase();
      }
    }
  }
  return result;
};

export const decodeHtmlEntities = (str: string): string => {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&agrave;/g, 'à')
    .replace(/&egrave;/g, 'è')
    .replace(/&igrave;/g, 'ì')
    .replace(/&ograve;/g, 'ò')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&eacute;/g, 'é')
    .replace(/&deg;/g, '°')
    .replace(/&ndash;/g, '–');
};

export const fetchUnisaNews = async (fallbackNews: NewsItem[]): Promise<NewsItem[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${BACKEND_URL}/api/news`, { signal: controller.signal });
    const html = await response.text();
    clearTimeout(timeoutId);
    
    const bachecaStart = html.indexOf('<h2>bacheca</h2>') !== -1 
      ? html.indexOf('<h2>bacheca</h2>') 
      : html.indexOf('data-tts="true">bacheca</h2>');
      
    if (bachecaStart === -1) return fallbackNews;
    
    const bachecaEnd = html.indexOf('</ul>', bachecaStart);
    if (bachecaEnd === -1) return fallbackNews;
    const bachecaHtml = html.substring(bachecaStart, bachecaEnd);
    
    const liRegex = /<li>([\s\S]*?)<\/li>/g;
    const items: NewsItem[] = [];
    let match;
    let idCounter = 1;
    
    const cleanHtml = (text: string) => {
      return decodeHtmlEntities(text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
    };

    while ((match = liRegex.exec(bachecaHtml)) !== null && items.length < 5) {
      const liContent = match[1];
      
      const tagMatch = liContent.match(/<small[^>]*>([\s\S]*?)<\/small>/);
      const tag = tagMatch ? cleanHtml(tagMatch[1]) : 'Ateneo';
      
      const h3Match = liContent.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      if (!h3Match) continue;
      
      const aMatch = h3Match[1].match(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      if (!aMatch) continue;
      
      const link = aMatch[1].startsWith('http') ? aMatch[1] : `https://www.unisa.it${aMatch[1]}`;
      const title = cleanHtml(aMatch[2]);
      
      let body = '';
      const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
      let pMatch;
      while ((pMatch = pRegex.exec(liContent)) !== null) {
        const content = pMatch[1].trim();
        if (!content.includes('<small') && !content.includes('class="categoryover"')) {
          body = cleanHtml(content);
          break;
        }
      }
      
      if (!body) {
        body = title;
      }
      
      items.push({
        id: `unisa-live-${idCounter++}`,
        title,
        body,
        tag,
        link,
      });
    }
    
    return items.length > 0 ? items : fallbackNews;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (controller.signal.aborted) {
      console.log('UNISA News Fetch Timeout (exceeded 5000ms)');
    } else {
      console.error('Error fetching UNISA news:', error.message);
    }
    return fallbackNews;
  }
};

export const formatAverage = (avg: number) => {
  return typeof avg === 'number' && !Number.isNaN(avg) && avg > 0 ? avg.toFixed(2) : '0.00';
};

export const safeParse = <T,>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const getWeatherInfo = (code: number, lang: 'IT' | 'EN') => {
  if (code === 0) {
    return {
      text: lang === 'IT' ? 'Soleggiato' : 'Sunny',
      icon: Sun,
    };
  } else if (code >= 1 && code <= 3) {
    return {
      text: lang === 'IT' ? 'Variabile' : 'Partly Cloudy',
      icon: CloudSun,
    };
  } else if (code === 45 || code === 48) {
    return {
      text: lang === 'IT' ? 'Nebbia' : 'Foggy',
      icon: Cloud,
    };
  } else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
    return {
      text: lang === 'IT' ? 'Pioggia' : 'Rainy',
      icon: CloudRain,
    };
  } else if (code >= 71 && code <= 77) {
    return {
      text: lang === 'IT' ? 'Neve' : 'Snowy',
      icon: CloudSnow,
    };
  } else if (code >= 95) {
    return {
      text: lang === 'IT' ? 'Temporale' : 'Thunderstorm',
      icon: CloudLightning,
    };
  }
  return {
    text: lang === 'IT' ? 'Variabile' : 'Partly Cloudy',
    icon: CloudSun,
  };
};

export const getRoleLabel = (r: Role, lang: 'IT' | 'EN') => {
  if (r === 'Studente') return lang === 'IT' ? 'Studente' : 'Student';
  if (r === 'Docente') return lang === 'IT' ? 'Docente' : 'Professor';
  if (r === 'PTA') return lang === 'IT' ? 'PTA' : 'Staff';
  return r;
};

export const getRoleCopy = (role: Role, lang: 'IT' | 'EN') => {
  if (role === 'Studente') {
    return {
      title: lang === 'IT' ? 'Carriera, didattica e servizi rapidi' : 'Career, teaching and quick services',
      subtitle: lang === 'IT' 
        ? 'Medie, CFU, lezioni, esiti, ricevimenti e risorse per vivere le campus senza saltare tra mille app.'
        : 'Averages, CFU, classes, results, office hours and resources to experience the campus without jumping between apps.',
      accent: '#137C8B',
    };
  }
  if (role === 'Docente') {
    return {
      title: lang === 'IT' ? 'Corsi, comunicazioni e pubblicazioni' : 'Courses, communications and publications',
      subtitle: lang === 'IT'
        ? 'Gestione di lezioni, esiti, avvisi agli studenti e ricevimento in un unico pannello.'
        : 'Management of classes, results, announcements to students and office hours in a single panel.',
      accent: '#E27E07',
    };
  }
  if (role === 'PTA') {
    return {
      title: lang === 'IT' ? 'Turni, interventi e ticket' : 'Shifts, tasks and tickets',
      subtitle: lang === 'IT'
        ? 'Orario di lavoro, richieste di supporto e presa in carico degli interventi del campus.'
        : 'Working hours, support requests and taking charge of campus interventions.',
      accent: '#D96C4A',
    };
  }
  return {
    title: '',
    subtitle: '',
    accent: '#137C8B',
  };
};

export const getNotificationText = (id: string, title: string, body: string, lang: 'IT' | 'EN') => {
  if (id === 'n-1') {
    return {
      title: lang === 'IT' ? 'Nuovo esito disponibile' : 'New result available',
      body: lang === 'IT' ? 'Basi di Dati ha pubblicato un risultato da accettare o rifiutare.' : 'Basi di Dati has published a grade to accept or reject.',
    };
  }
  if (id === 'n-2') {
    return {
      title: lang === 'IT' ? 'Manutenzione aula T25' : 'Room T25 maintenance',
      body: lang === 'IT' ? 'Richiesto controllo dei proiettori nel laboratorio T25.' : 'Projector check requested in Lab T25.',
    };
  }
  if (id === 'n-3') {
    return {
      title: lang === 'IT' ? 'Avviso di ateneo' : 'University notice',
      body: lang === 'IT' ? 'Domani la mensa centrale chiuderà alle 15:00 per manutenzione programmata.' : 'Tomorrow the main canteen will close at 15:00 for scheduled maintenance.',
    };
  }
  return { title, body };
};

export const roleIcon: Record<Role, IconComponent> = {
  Studente: GraduationCap,
  Docente: BookOpen,
  PTA: Briefcase,
};

export const translateDay = (day: string, lang: string): string => {
  if (lang !== 'EN') return day;
  switch (day) {
    case 'Lunedì': return 'Monday';
    case 'Martedì': return 'Tuesday';
    case 'Mercoledì': return 'Wednesday';
    case 'Giovedì': return 'Thursday';
    case 'Venerdì': return 'Friday';
    default: return day;
  }
};
