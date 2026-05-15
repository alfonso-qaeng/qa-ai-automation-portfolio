export interface ReqresUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface ReqresSupport {
  url: string;
  text: string;
}

export interface ReqresListResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: ReqresUser[];
  support: ReqresSupport;
}

export interface ReqresSingleResponse {
  data: ReqresUser;
  support: ReqresSupport;
}

export interface ReqresCreatedUser {
  name: string;
  job: string;
  id: string;
  createdAt: string;
}

export interface ReqresUpdatedUser {
  name: string;
  job: string;
  updatedAt: string;
}

export interface ReqresLoginSuccess {
  token: string;
}

export interface ReqresErrorResponse {
  error: string;
}
