import { arr } from "@/utils/generic";
import { useState } from "react";

export function useSearch<T>({
  data = [],
  searchKeys,
  groupBy,
}: {
  data: T[] | undefined;
  searchKeys: keyof T | (keyof T)[];
  groupBy: string;
}) {
  const [search, setSearch] = useState({
    text: "",
    caseSensitive: false,
    wholeWord: false,
  });

  if (!data) data = [];

  data = data.filter((item) => {
    let searchValue = search.text || "";
    if (!searchValue) return true;

    const searchKeysArray = Array.isArray(searchKeys)
      ? searchKeys
      : [searchKeys];

    const primaryValues = searchKeysArray.map(
      (key) => item[key] as unknown as string
    );

    let filteredValues = primaryValues;

    if (!search.caseSensitive) {
      filteredValues = filteredValues.map((val) => val?.toLowerCase() || "");
      searchValue = searchValue.toLowerCase();
    }

    if (search.wholeWord) {
      const regex = new RegExp(
        `\\b${searchValue}\\b`,
        search.caseSensitive ? "" : "i"
      );
      return filteredValues.some((val) => regex.test(val));
    }

    return filteredValues.some((val) => val.includes(searchValue));
  });

  const [columns, setColumns] = useState([]);
  const setColumn = (columnKey: string, value: any) => {
    // @ts-ignore
    setColumns((prevColumns: any) => {
      const columnIndex = prevColumns.findIndex(
        (column: any) => column.key === columnKey
      );
      if (columnIndex > -1) {
        // Update existing column value
        const updatedColumns = [...prevColumns];
        updatedColumns[columnIndex] = { key: columnKey, value };
        return updatedColumns;
      } else {
        // Add new column
        return [...prevColumns, { key: columnKey, value }];
      }
    });
  };

  if (columns.length) {
    columns.forEach(({ key, value }) => {
      if (value) data = data.filter((item) => item[key] === value);
    });
  }

  data = arr.groupInArr(data, groupBy);

  return {
    data,
    search,
    setSearch,
    setColumn,
  };
}
