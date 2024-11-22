'use server';

import axios from 'axios';

export const creatorGetAppStructure = async (
  domain,
  config,
  owner,
  name,
) => {
  try {
    const response = await axios.get(
      `https://creator.zoho.${domain}/appbuilder/${owner}/${name}/fetchAccordian`,
      {
        headers: config,
      },
    );

    const functions = response.data;
    const workflowMap =
      functions.workflows.workflowList.workflowList.reduce(
        (map, workflow) => {
          map[workflow.WFLinkName] = workflow;
          return map;
        },
        {},
      );

    const reportsGroupedByForm = functions.reports.reduce(
      (acc, report) => {
        if (!acc[report.fcn]) acc[report.fcn] = [];
        acc[report.fcn].push(report);
        return acc;
      },
      {},
    );

    const formData = Object.keys(functions.formToReport).map(
      (formName) => {
        const reports = reportsGroupedByForm[formName] || [];
        const workflows = (
          functions.formToWorkflow[formName] || []
        ).map((workflowName) => workflowMap[workflowName]);

        return {
          name: formName,
          reports,
          workflows,
        };
      },
    );

    return { data: formData, error: null };
  } catch (err) {
    return { data: null, error: err.response?.data || err.message };
  }
};

export const creatorGetFunction = async (
  domain,
  config,
  owner,
  name,
  workflow,
) => {
  const formData = new FormData();

  const extractToken = (str, key) => {
    const regex = new RegExp(`${key}=([^;]+)`);
    const match = str.match(regex);
    return match ? match[1] : null;
  };

  formData.append('workflowLinkName', workflow);
  formData.append(
    'zccpn',
    extractToken(config.cookie || config.Cookie, 'CSRF_TOKEN'),
  );

  try {
    const response = await axios.post(
      `https://creator.zoho.${domain}/appbuilder/${owner}/${name}/applicationide/workflow/${workflow}/definition`,
      formData,
      {
        headers: config,
      },
    );
    return response.data;
  } catch (err) {
    return { error: err.response?.data || err.message };
  }
};
