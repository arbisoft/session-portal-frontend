import capitalize from "lodash/capitalize";

export type ErrorType = {
  statusCode: number | string;
  message: string;
  details?: Record<string, string>;
};

type ErrorStatus = number | string | "FETCH_ERROR" | "PARSING_ERROR" | "TIMEOUT_ERROR" | "CUSTOM_ERROR";

const isErrorAnObject = (err: unknown): err is Record<string, unknown> =>
  Boolean(err) && typeof err === "object" && Object.keys(err ?? {}).length > 0;

export const parseError = (error: unknown, statusCode: ErrorStatus): ErrorType[] => {
  // Handle server errors with a generic message
  if (typeof statusCode !== "number" || statusCode === 500) {
    return [{ statusCode, message: "Something went wrong." }];
  }

  // Handle errors that are simple strings
  if (typeof error === "string") {
    return [{ statusCode, message: error }];
  }

  // Handle errors that are arrays
  if (Array.isArray(error)) {
    return error.flatMap((e) => parseError(e, statusCode));
  }

  // Handle errors that are objects
  if (isErrorAnObject(error)) {
    return Object.entries(error).flatMap(([key, value]) => {
      // Directly handle null and undefined values
      if (value === null || value === undefined) {
        return [{ statusCode, message: `${capitalize(key)}: unknown value` }];
      }

      // For array values, recursively handle each element
      if (Array.isArray(value)) {
        return value.flatMap((item) => {
          if (typeof item === "object" && item !== null) {
            return parseError(item, statusCode).map((err) => ({
              statusCode: err.statusCode,
              message: `${capitalize(key)}: ${err.message}`,
            }));
          }
          return [{ statusCode, message: `${capitalize(key)}: ${item}` }];
        });
      }

      // For nested object values, recursively call parseError
      if (typeof value === "object" && value !== null) {
        return parseError(value, statusCode).map((err) => ({
          statusCode: err.statusCode,
          message: `${capitalize(key)}: ${err.message}`,
        }));
      }

      // Convert non-array and non-object values to string
      const messageValue = typeof value === "string" ? value : JSON.stringify(value);
      return [{ statusCode, message: `${capitalize(key)}: ${messageValue}` }];
    });
  }

  // Fallback for any other types of error
  return [{ statusCode, message: "Something went wrong." }];
};
