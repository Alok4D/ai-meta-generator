export function isApiError(data: any): boolean {
  return !!data && data.success === false && Array.isArray(data.errorMessages);
}

export function isApiSuccess(data: any): boolean {
  return !!data && data.success === true;
}
