// @ts-nocheck

import { formatDistanceToNow } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { pt } from 'date-fns/locale';

export const arr = {
  groupInObj: (array, key) => {
    return array.reduce((acc, obj) => {
      const keyParts = key.split('.');

      const keyValue = keyParts.reduce((value, part) => {
        return value ? value[part] : undefined;
      }, obj);

      if (!acc[keyValue]) {
        acc[keyValue] = [];
      }

      acc[keyValue].push(obj);

      return acc;
    }, {});
  },
  groupInArr: (array, key) => {
    const grouped = array.reduce((acc, obj) => {
      const keyParts = key.split('.');
      const keyValue = keyParts.reduce((value, part) => {
        return value ? value[part] : undefined;
      }, obj);

      // Find the existing group by keyValue
      let group = acc.find((g) => g.label === keyValue);

      // If the group doesn't exist, create it
      if (!group) {
        group = { label: keyValue, items: [] };
        acc.push(group);
      }

      // Add the current object to the group's items
      group.items.push(obj);

      return acc;
    }, []);

    return grouped;
  },
  sortBy: (arr, key) => {
    return arr.sort((a, b) => {
      const keyPath = key.split('.'); // Split the key path into parts

      // Get the value at the nested key path for object 'a'
      const aValue = keyPath.reduce((obj, prop) => (obj ? obj[prop] : undefined), a);

      // Get the value at the nested key path for object 'b'
      const bValue = keyPath.reduce((obj, prop) => (obj ? obj[prop] : undefined), b);

      // Compare values using localeCompare if they are strings, otherwise use subtraction for numbers
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      } else {
        return (aValue > bValue) - (aValue < bValue); // Handle other types (numbers, dates, etc.)
      }
    });
  },
  concat: (arr1 = [], arr2 = [], key) => {
    if (!arr1) arr1 = [];
    if (!arr2) arr2 = [];
    const combinedArray = [...arr1, ...arr2];

    const uniqueArray = combinedArray.reduce((acc, current) => {
      const found = acc.find((item) => item[key] === current[key]);
      if (!found) {
        acc.push(current);
      }
      return acc;
    }, []);

    return uniqueArray || [];
  },
};

export const obj = {
  findToken: (obj, findName, options = {}) => {
    const { filterString = '', caseSensitive = false } = options;

    let result = '';

    function search(item) {
      if (Array.isArray(item)) {
        for (const element of item) {
          search(element);
        }
      } else if (item !== null && typeof item === 'object') {
        const nameMatches = caseSensitive
          ? item.name === findName
          : item.name?.toLowerCase() === findName.toLowerCase();

        const filterMatches = caseSensitive
          ? item.value?.includes(filterString)
          : item.value?.toLowerCase().includes(filterString.toLowerCase());

        if (nameMatches && (filterString === '' || filterMatches)) {
          result = item.value;
          return;
        }

        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            search(item[key]);
          }
        }
      }
    }

    search(obj);
    return result;
  },
};

export const files = {
  read: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const content = reader.result;
          resolve(content);
        } catch (parseError) {
          console.log(parseError);
          reject(parseError);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  },
};

export const str = {
  slugify: (str) => {
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove diacritics ( "ã", "é" ...)
    str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
    str = str.toLowerCase(); // convert string to lowercase
    str = str
      .replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
      .replace(/\s+/g, '') // replace spaces with hyphens
      .replace(/-+/g, ''); // remove consecutive hyphens
    return str;
  },
  decodeHtmlSpecialChars: (str) => {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(str, 'text/html').documentElement
      .textContent;
    return decodedString;
  },
};

export const time = {
  timeAgo: (timestamptz) => {
    if (!timestamptz) return;
    const date = new Date(timestamptz);

    const localDate = new Date(timestamptz);
    const localOffset = localDate.getTimezoneOffset() * 60000; // Get the offset in milliseconds
    const adjustedDate = new Date(localDate.getTime() + localOffset);

    const result = formatDistanceToNow(adjustedDate, {
      addSuffix: true,
      includeSeconds: true,
    });

    return result;
  },
  getTimestamptz: () => {
    return formatInTimeZone(new Date(), 'Europe/Lisbon', "yyyy-MM-dd'T'HH:mm:ss");
  },
  fixTime: (datetime) => {
    return new Date(datetime).setTime(
      new Date(datetime).getTime() + new Date(datetime).getTimezoneOffset() * 60 * 1000,
    );
  },
};

export const type = {
  isJson: (input) => {
    try {
      JSON.parse(input);
      return true;
    } catch {
      return false;
    }
  },
};
