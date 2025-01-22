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
    const url = `https://crm.zoho.${domain}/deluge/api/ui/v1/${config['x-crm-org']}/services/ZohoCRM/connections?zuid=716124001&flowNeeded=true`;
    const response = await axios.get(url, {
      headers: {
        ...config,
        ['x-zcsrf-token']: config['x-zcsrf-token'].replace(
          'crmcsrfparam',
          'drepn',
        ),
      },
    });

    if (response.data.status === 'failure')
      throw new Error(response.data.message);

    return {
      data: response.data?.connections,
      error: null,
    };
  } catch (err) {
    console.log(err.message);

    return {
      data: null,
      error: err.message || 'Internal error',
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
    if (!match)
      throw new Error(
        'Function name could not be extracted from the code',
      );
    const functionName = match[1];
    const url = `https://crm.zoho.${domain}/crm/v7/settings/functions/${functionName}/actions/test`;

    const execNumbers = Array.from(
      { length: timesToRun },
      (_, index) => index + 1,
    );

    const result = {};
    for (const index of execNumbers) {
      const response = await axios.post(
        url,
        {
          functions: [
            {
              script: code,
              arguments: {},
            },
          ],
        },
        { headers: config },
      );
      console.log(index);

      result[`execution_${index}`] = response.data?.functions[0];
    }

    return {
      data: result,
      error: null,
    };
  } catch (err) {
    console.log(err?.response?.data || 'Internal error');
    return {
      data: null,
      error: err?.response?.data || 'Internal error',
    };
  }
};
