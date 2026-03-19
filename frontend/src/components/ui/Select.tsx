import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
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
  const listboxId = `${selectId}-listbox`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value) || null;
  }, [options, value]);

  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const label = selectedOption?.label || placeholder || 'Select an option';

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveIndex(-1);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const focusOption = (index: number) => {
    const boundedIndex = Math.max(0, Math.min(options.length - 1, index));
    setActiveIndex(boundedIndex);
    requestAnimationFrame(() => {
      optionRefs.current[boundedIndex]?.focus();
    });
  };

  const openMenu = (index = selectedIndex) => {
    setIsOpen(true);
    setActiveIndex(index);
  };

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false);
    setActiveIndex(-1);

    if (restoreFocus) {
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  };

  const selectOption = (optionValue: string) => {
    onChange(optionValue);
    closeMenu(true);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          openMenu(selectedIndex);
        }
        focusOption(activeIndex >= 0 ? activeIndex + 1 : selectedIndex);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          openMenu(selectedIndex);
        }
        focusOption(activeIndex >= 0 ? activeIndex - 1 : selectedIndex);
        break;
      case 'Home':
        event.preventDefault();
        openMenu(0);
        focusOption(0);
        break;
      case 'End':
        event.preventDefault();
        openMenu(options.length - 1);
        focusOption(options.length - 1);
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          closeMenu();
        }
        break;
      default:
        break;
    }
  };

  const handleOptionKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
    optionValue: string,
  ) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusOption(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusOption(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusOption(0);
        break;
      case 'End':
        event.preventDefault();
        focusOption(options.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu(true);
        break;
      case 'Tab':
        closeMenu();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectOption(optionValue);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      className={`relative w-full ${className}`.trim()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          closeMenu();
        }
      }}
    >
      <button
        id={selectId}
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (isOpen) {
            closeMenu();
            return;
          }
          openMenu(selectedIndex);
        }}
        onKeyDown={handleTriggerKeyDown}
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
            id={listboxId}
            role="listbox"
            aria-labelledby={selectId}
            className="max-h-64 overflow-y-auto"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value || option.label}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={activeIndex === index ? 0 : -1}
                  onClick={() => selectOption(option.value)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index, option.value)}
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
