import { useState } from 'react';

interface SkipLinkProps {
  targetId: string;
  label?: string;
}

function SkipLink({ targetId, label = 'Skip to main content' }: SkipLinkProps) {
  const [focused, setFocused] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.removeAttribute('tabindex');
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`
        fixed top-0 left-0 z-[9999]
        bg-accent text-white
        px-4 py-3
        font-mono text-sm font-semibold uppercase tracking-wider
        transition-transform duration-200
        ${focused ? 'translate-y-0' : '-translate-y-full'}
        focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-accent
      `}
      style={{ textDecoration: 'none' }}
    >
      {label}
    </a>
  );
}

export default SkipLink;