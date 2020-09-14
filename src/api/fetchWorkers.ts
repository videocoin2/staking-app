import axios from 'axios';
const apiURL = process.env.REACT_APP_API_URL;

const fetchWorkers = async () => {
  const res = await axios(`${apiURL}/miners/all`);
  const { data } = res;
  return data.items || [];
};

export default fetchWorkers;
