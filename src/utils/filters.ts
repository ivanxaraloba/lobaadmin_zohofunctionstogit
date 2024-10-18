import { searchMatches } from '@/types/types';

export const matchByWords = (
  record: Record<string, any>,
  searchValue: string,
  fieldsToSearch: string[],
  searchMatches: searchMatches,
) => {
  const { caseSensitive, wholeWord } = searchMatches;

  if (!caseSensitive) {
    searchValue = searchValue.toLowerCase();
  }

  const matches = (toSearch: string) => {
    if (!caseSensitive) {
      toSearch = toSearch.toLowerCase();
    }

    if (wholeWord) {
      const regex = new RegExp(`\\b${searchValue}\\b`, caseSensitive ? '' : 'i');
      return regex.test(toSearch);
    }
    return toSearch.includes(searchValue);
  };

  return fieldsToSearch.some((field) => {
    const fieldValue = record[field];
    return typeof fieldValue === 'string' && matches(fieldValue);
  });
};
