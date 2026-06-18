import React, { useState } from 'react';
import { Megaphone } from 'lucide-react-native';

import type { NewsItem } from '../types';
import { translations } from '../constants';
import { SectionTitle } from './SectionTitle';
import { ListRow } from './ListRow';

export function CampusNews({
  news,
  onOpenExternal,
  t,
  lang,
}: {
  news: NewsItem[];
  onOpenExternal: (url: string) => void;
  t: (key: keyof typeof translations.IT) => string;
  lang: 'IT' | 'EN';
}) {
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null);

  return (
    <>
      <SectionTitle title={t('newsLabel')} subtitle={t('newsSubtitle')} />
      {news.map((item) => {
        let title = item.title;
        let body = item.body;
        let tag = item.tag;
        if (lang === 'EN') {
          if (item.id === 'news-1') {
            title = 'Master courses open day';
            body = 'Aula Magna in Fisciano, info desks and meetings with course coordinators.';
          } else if (item.id === 'news-2') {
            title = 'New CUS schedule';
            body = 'Published updated hours for futsal, tennis, basketball and weight room.';
          } else if (item.id === 'news-3') {
            title = 'Scholarships and notices';
            body = 'New notices available for international mobility and tutoring.';
          }
          
          const tagMap: Record<string, string> = {
            'Didattica': 'Academics',
            'Campus': 'Campus',
            'Opportunita': 'Opportunities',
            'Opportunità': 'Opportunities',
            'Ateneo': 'University',
            'Ricerca': 'Research',
            'Studenti': 'Students',
            'Orientamento': 'Orientation',
            'Internazionale': 'International',
            'Eventi': 'Events',
            'Servizi': 'Services'
          };
          tag = tagMap[tag] || tag;
        }
        const isExpanded = expandedNewsId === item.id;
        return (
          <ListRow
            key={item.id}
            icon={Megaphone}
            title={title}
            subtitle={body}
            meta={tag}
            onPress={() => setExpandedNewsId(isExpanded ? null : item.id)}
            expanded={isExpanded}
            onActionPress={item.link ? () => onOpenExternal(item.link as string) : undefined}
            actionLabel={item.link ? (lang === 'IT' ? 'Apri' : 'Open') : undefined}
          />
        );
      })}
    </>
  );
}
