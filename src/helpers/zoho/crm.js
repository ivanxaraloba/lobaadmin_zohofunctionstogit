'use server';

import axios from 'axios';

export const crmGetFunctions = async (domain, config) => {
  let functions = [];
  let offset = 0;
  const limit = 200;

  try {
    while (true) {
      const { data } = await axios.get(
        `https://crm.zoho.${domain}/crm/v2/settings/functions?type=org&start=${offset + 1}&limit=${limit}`,
        {
          headers: config,
        },
      );

      const fetchedFunctions = data?.functions ?? [];
      functions.push(...fetchedFunctions);

      if (fetchedFunctions.length < limit) break;
      offset += limit;
    }

    return { data: functions, error: null };
  } catch (err) {
    console.log(err);
    return {
      data: null,
      error: err?.response?.data || 'Internal error',
    };
  }
};

export const crmGetFunction = async (
  domain,
  config,
  functionInfo,
) => {
  try {
    const url = `https://crm.zoho.${domain}/crm/v2/settings/functions/${functionInfo.id}?category=${functionInfo.category}&source=crm&language=deluge`;
    const response = await axios.get(url, { headers: config });
    return { data: response.data?.functions?.[0], error: null };
  } catch (err) {
    return {
      data: null,
      error: `error crmGetFunction, ${functionInfo}`,
    };
  }
};

export const crmGetConnections = async (domain, config) => {
  try {
    const url = `https://crm.zoho.${domain}/crm/v2/settings/connectors`;
    const response = await axios.get(url, { headers: config });
    return {
      data: response.data?.crm_connectors?.connection_list
        ?.connections,
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      data: null,
      error: err?.response?.data || 'Internal error',
    };
  }
};

export const crmGetConstants = async (domain, config) => {
  try {
    const url = `https://crm.zoho.${domain}/crm/org716124623/Constants.do`;
    const response = await axios.get(url, { headers: config });
    return {
      data: response.data,
      error: null,
    };
  } catch (err) {
    console.log(err);
    return {
      data: null,
      error: err?.response?.data || 'Internal error',
    };
  }
};

export const crmTestFunction = async (
  domain,
  config,
  timesToRun,
  code,
) => {
  try {
    const match = code.match(/(?:function\s+|(?:\w+\.)?)(\w+)\s*\(/);
    const functionName = match[1];

    const executionPromises = Array.from(
      { length: timesToRun },
      (_, index) => {
        const execNumber = index + 1;
        const modifiedCode = code.replace(
          '[var:EXEC_NUMBER]',
          execNumber.toString(),
        );

        const url = `https://crm.zoho.${domain}/crm/v7/settings/functions/${functionName}/actions/test`;
        console.log(
          `Executing: ${url} with execNumber: ${execNumber}`,
        );

        return axios.post(
          url,
          {
            functions: [
              {
                script: modifiedCode,
                arguments: {},
              },
            ],
          },
          { headers: config },
        );
      },
    );

    const responses = await Promise.all(executionPromises);

    return {
      data: responses,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err?.response?.data || 'Internal error',
    };
  }
};
