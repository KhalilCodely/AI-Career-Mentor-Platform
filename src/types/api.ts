export type ApiError = {
  error: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};
