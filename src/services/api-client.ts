import axios, { CanceledError } from 'axios';

export default axios.create({
  baseURL: 'http://localhost:8080/rdm',
})

export { CanceledError };