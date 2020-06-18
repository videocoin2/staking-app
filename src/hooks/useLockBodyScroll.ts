import { useLayoutEffect } from 'react';

function getScrollbarWidth() {
  if (document.body.clientHeight <= window.innerHeight) {
    return 0;
  }

  const outer = document.createElement('div');
  const inner = document.createElement('div');

  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;

  outer.style.overflow = 'scroll';
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;

  outer.parentNode?.removeChild(outer);

  return widthNoScroll - widthWithScroll;
}

export default function useLockBodyScroll(onlyMobile = false) {
  useLayoutEffect(() => {
    if (onlyMobile && window.innerWidth > 768) {
      return () => false;
    }
    const scrollPosition = window.scrollY;

    document.body.style.paddingRight = `${getScrollbarWidth()}px`;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'absolute';
    document.body.style.height = '100%';
    document.body.style.width = '100%';

    return () => {
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.width = '';
      document.body.style.position = '';
      window.scrollTo(0, scrollPosition);
    };
  }, [onlyMobile]);
}
