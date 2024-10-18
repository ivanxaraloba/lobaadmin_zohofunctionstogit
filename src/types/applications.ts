export interface CRMFunctions {
  id: string;
  name: string;
  tasks: {
    external_tasks: boolean;
  };
  config: boolean;
  script: string;
  source: string;
  api_name: string;
  category: string;
  language: string;
  rest_api: {
    url: string;
    type: string;
    active: boolean;
  }[];
  workflow: string;
  nameSpace: string;
  description: string | null;
  modified_by: string;
  modified_on: string;
  return_type: string;
  updatedTime: string;
  display_name: string;
  associated_place: string | null;
  createdTime: string;
}
