import axios from 'axios';
const GAS_KEY = process.env.REACT_APP_GAS_KEY;

const fetchGasPrices = async () => {
  const res = await axios(
    `https://ethgasstation.info/json/ethgasAPI.json?api-key=${GAS_KEY}`
  );
  const { data } = res;
  return {
    high: data.fast / 10,
    low: data.safeLow / 10,
    medium: data.average / 10,
  };
};

export default fetchGasPrices;