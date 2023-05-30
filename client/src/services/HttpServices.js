import axios from "axios";
const config = require('./config.json');

// axios.defaults.headers.common['x-token'] = localStorage.getItem("token");

axios.defaults.baseURL = `http://${config.server_host}:${config.server_port}`;

axios.interceptors.response.use(null, (e) => {
  const expectedError =
    e.response && e.response.status >= 400 && e.response.status < 500;
  if (!expectedError) {
    console.log("logging the error", e);
  }
  return Promise.reject(e);
});

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
};
