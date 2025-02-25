import { useEffect, useState } from "react";

const useDebounce = (input: string, delay: number): string => {
  const [debounceValue, setDebounceValue] = useState(input);

  useEffect(() => {
    const delayHandler = setTimeout(() => {
      setDebounceValue(input);
    }, delay);

    return () => {
      clearTimeout(delayHandler);
    };
  }, [input, delay]);

  return debounceValue;
};

export default useDebounce;
