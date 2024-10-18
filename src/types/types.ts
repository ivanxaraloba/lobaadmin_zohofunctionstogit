export interface Accordian {
  type: string;
  WFName: string;
  report: string;
  script: string;
  eventType: number;
  fieldName: string;
  WFLinkName: string;
  subEventType: number;
  subFieldName: string;
}

export interface creatorForm {
  name: string;
  reports: any[];
  workflows: Accordian[];
}

export interface creatorApp {
  id: number;
  name: string;
  accordian: Accordian[];
  lastSync: string;
  lastCommit: string;
}

export interface Deparment {
  id: number;
  name: string;
}

export interface Project {
  // database
  id: number;
  name: string;
  username: string;
  domain: string;
  functions: any[];
  file?: any;
  departments: Deparment;
  crm?: {
    id: number;
    projectId: number;
    functions: any[];
    created_at: any;
    lastSync: string;
    lastCommit: string;
    config: {};
  };
  creator?: {
    id?: number;
    projectId: number;
    owner: string;
    config: {
      cookie: any;
      'user-agent': any;
    };
    created_at: any;
    creatorApps?: creatorApp[];
  };
  recruit?: {
    id: number;
    projectId: number;
    functions: any[];
    created_at: any;
    config: {};
    lastSync: string;
    lastCommit: string;
  };
  // added
  _repositoryName: string;
  _repository: Repository;
}

interface Repository {
  type: string;
  full_name: string;
  links: {
    self: { href: string };
    html: { href: string };
    avatar: { href: string };
    pullrequests: { href: string };
    commits: { href: string };
    forks: { href: string };
    watchers: { href: string };
    branches: { href: string };
    tags: { href: string };
    downloads: { href: string };
    source: { href: string };
    clone: { name: string; href: string }[];
    hooks: { href: string };
  };
  name: string;
  slug: string;
  description: string;
  scm: string;
  website: string | null;
  owner: {
    display_name: string;
    links: {
      self: { href: string };
      avatar: { href: string };
      html: { href: string };
    };
    type: string;
    uuid: string;
    username: string;
  };
  workspace: {
    type: string;
    uuid: string;
    name: string;
    slug: string;
    links: {
      avatar: { href: string };
      html: { href: string };
      self: { href: string };
    };
  };
  is_private: boolean;
  project: {
    type: string;
    key: string;
    uuid: string;
    name: string;
    links: {
      self: { href: string };
      html: { href: string };
      avatar: { href: string };
    };
  };
  fork_policy: string;
  created_on: string;
  updated_on: string;
  size: number;
  language: string;
  uuid: string;
  mainbranch: { name: string; type: string };
  override_settings: {
    default_merge_strategy: boolean;
    branching_model: boolean;
  };
  parent: null | any;
  has_issues: boolean;
  has_wiki: boolean;
}

export interface Function {
  name: string;
}

export interface User {
  id: string;
  profile: {
    id: string;
    bbUsername: string;
    bbPassword: string;
    created_at: string;
  } | null;
}

export interface Commit {
  id: number;
  userId: string;
  projectId: number;
  functionId: string;
  functionName: string;
  message: string;
  created_at: string;
  users?: any;
  status: 'pending' | 'committed';
  function: any;
  path: string;
  projects: Project;
}

export interface searchMatches {
  caseSensitive?: boolean;
  wholeWord?: boolean;
}
