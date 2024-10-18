interface WorkflowParam {
  name: string;
  type: string;
}

interface Workflow {
  name: string;
  namespace: string;
  params: WorkflowParam[];
  returnType: string;
}

interface RestAPI {
  active: boolean;
  type: 'oauth' | 'zapikey';
  url: string;
}

interface Tasks {
  external_tasks: boolean;
  params: string[];
}

export interface crmFunction {
  updatedTime: number;
  workflow: Workflow;
  rest_api: RestAPI[];
  isCRMV1TaskPresent: boolean;
  description: string | null;
  language: string;
  source: string;
  display_name: string;
  associated_place: string | null;
  api_name: string;
  createdTime: number;
  id: string;
  category: string;
  config: boolean;
  tasks: Tasks;
}

interface Workflow {
  return_type: string;
  modified_on: number;
  updatedTime: string;
  workflow: string;
  rest_api: null | string;
  description: null | string;
  language: string;
  source: string;
  display_name: string;
  script: string;
  associated_place: null | string;
  api_name: null | string;
  modified_by: null | string;
  name: string;
  nameSpace: string;
  id: string;
  category: string;
  config: boolean;
  tasks: {
    external_tasks: boolean;
  };
}

export interface UnifiedCRMFunction {
  // Present in both
  language: string;
  id: string;
  source: string;
  display_name: string;
  associated_place: string | null;
  category: string;
  config: boolean;
  workflow: string; // function code
  // Present only after code is fetched
  createdTime: number | undefined;
  updatedTime: number;
  rest_api: RestAPI[];
  api_name: string | undefined;
  description: string | null | undefined;
  isCRMV1TaskPresent: boolean | undefined;
  tasks: Tasks | undefined;
  // Present only in before code fetch
  return_type: string;
  modified_on: number;
  modified_by: null | string;
  name: string;
  nameSpace: string;
  script: string; // function code ( with functions init )
}
