import { useState, useCallback } from 'react';

export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const show = useCallback(() => setValue(true), []);
  const hide = useCallback(() => setValue(false), []);
  const set = useCallback((value: boolean) => setValue(value), []);
  const toggle = useCallback(() => setValue((state) => !state), []);

  return { value, isOpen: value, show, hide, set, toggle };
}
