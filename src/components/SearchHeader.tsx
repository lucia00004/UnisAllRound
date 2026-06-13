import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';

import { useTheme } from '../theme';
import type { MainTab } from '../types';
import type { translations } from '../constants';

interface SearchResultItem {
  title: string;
  tab: MainTab | 'role';
  keywords: string;
}

interface SearchHeaderProps {
  searchTerm: string;
  onSearchTermChange: (text: string) => void;
  searchResults: SearchResultItem[];
  onSelectResult: (tab: MainTab) => void;
  t: (key: keyof typeof translations.IT) => string;
}

export default function SearchHeader({
  searchTerm,
  onSearchTermChange,
  searchResults,
  onSelectResult,
  t,
}: SearchHeaderProps) {
  const { colors, styles } = useTheme();
  return (
    <View style={{ zIndex: 10 }}>
      <View style={styles.searchShell}>
        <Search color={colors.muted} size={18} />
        <TextInput
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={onSearchTermChange}
        />
      </View>

      {searchResults.length ? (
        <View style={styles.searchResults}>
          {searchResults.map((item) => (
            <Pressable
              key={item.title}
              style={styles.searchResultRow}
              onPress={() => {
                if (item.tab === 'role') {
                  onSelectResult('home');
                } else {
                  onSelectResult(item.tab);
                }
                onSearchTermChange('');
              }}
            >
              <Text style={styles.searchResultTitle}>{item.title}</Text>
              <Text style={styles.searchResultMeta}>{t('searchResultOpen')}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
