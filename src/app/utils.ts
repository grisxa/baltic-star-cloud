// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function isNotNullOrUndefined<T>(input: null | undefined | T): input is T {
  return input !== null && input !== undefined;
}
