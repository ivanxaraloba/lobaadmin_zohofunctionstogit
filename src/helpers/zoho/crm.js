"use server";
import axios from "axios";

export const crmGetFunctions = async (domain, config) => {
  let functions = [];
  let offset = 0;
  const limit = 200;

  try {
    while (true) {
      const { data } = await axios.get(
        `https://crm.zoho.${domain}/crm/v2/settings/functions?type=org&start=${
          offset + 1
        }&limit=${limit}`,
        { headers: config }
      );

      const fetchedFunctions = data?.functions ?? [];
      functions.push(...fetchedFunctions);

      if (fetchedFunctions.length < limit) break;
      offset += limit;
    }

    return { data: functions, error: null };
  } catch (err) {
    return { data: null, error: err.response.data };
  }
};

export const crmGetFunction = async (domain, config, functionInfo) => {
  try {
    const url = `https://crm.zoho.${domain}/crm/v2/settings/functions/${functionInfo.id}?category=${functionInfo.category}&source=crm&language=deluge`;
    const response = await axios.get(url, { headers: config });
    console.log(response.data);
    return response.data?.functions?.[0];
  } catch (err) {
    console.error(functionInfo.display_name, err);
    return [];
  }
};

export const crmGetOrgDetails = async (domain, config) => {
  try {
    const response = await axios.get(
      `https://crm.zoho.${domain}/crm/v2/organizations?include=info&from=crm_org_profile`,
      { headers: config }
    );
    return response?.data ?? null;
  } catch (err) {
    console.error("Error fetching Zoho functions:", err);
    return [];
  }
};
