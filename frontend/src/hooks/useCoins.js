import { useState, useEffect } from 'react';

const useCoins = () => {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const savedCoins = localStorage.getItem('coins');
    if (savedCoins) {
      setCoins(parseInt(savedCoins, 10));
    }
  }, []);

  const changeCoins = (amount) => {
    const newCoins = Math.max(0, coins + amount);
    setCoins(newCoins);
    localStorage.setItem('coins', newCoins.toString());
  };

  return { coins, changeCoins };
};

export default useCoins; 