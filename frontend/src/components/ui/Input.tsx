import { forwardRef, type InputHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  success?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, success, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`
            input
            ${error ? 'input-error' : ''}
            ${success ? 'input-success' : ''}
            ${className}
          `.trim()}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <div id={`${props.id}-error`} className="flex items-center gap-2 mt-2 text-sm text-danger">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && !error && (
          <div className="flex items-center gap-2 mt-2 text-sm text-success">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {helperText && !error && !success && (
          <p className="mt-2 text-sm text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
