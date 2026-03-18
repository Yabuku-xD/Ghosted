import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
  menuClassName?: string;
  buttonClassName?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export function Select({
  id,
  value,
  options,
  onChange,
  placeholder,
  icon,
  className = '',
  menuClassName = '',
  buttonClassName = '',
  disabled = false,
  ariaLabel,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value) || null;
  }, [options, value]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const label = selectedOption?.label || placeholder || 'Select an option';

  return (
    <div ref={rootRef} className={`relative w-full ${className}`.trim()}>
      <button
        id={selectId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={`select-button ${buttonClassName}`.trim()}
      >
        <span className="select-button-content">
          {icon ? <span className="select-button-icon">{icon}</span> : null}
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown
          className={`select-button-chevron ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div className={`select-menu ${menuClassName}`.trim()}>
          <div
            role="listbox"
            aria-labelledby={selectId}
            className="max-h-64 overflow-y-auto"
          >
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value || option.label}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`select-option ${isSelected ? 'select-option-active' : ''}`}
                >
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
