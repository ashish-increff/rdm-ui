import axios from 'axios';

export function handleError(error: unknown, defaultMessage: string = "An error occurred"): string {
  console.error(error);

  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  } else {
    return (error as Error).message || defaultMessage;
  }
}
