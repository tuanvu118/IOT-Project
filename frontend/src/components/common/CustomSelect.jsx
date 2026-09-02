import { useState, useRef, useEffect } from "react";

function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = "Chọn...",
  disabled = false,
  icon = null,
  className = "",
  ariaLabel = "Chọn tùy chọn",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    if (onChange) onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      className={`pwa-custom-select-wrap ${className} ${isOpen ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="pwa-custom-select-trigger"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <div className="pwa-custom-select-main">
          {icon || (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0066cc" strokeWidth="2.2" aria-hidden="true">
              <circle cx="6" cy="17" r="2.2" />
              <circle cx="18" cy="17" r="2.2" />
              <path d="M5 16h2l2.5-4h5L17 16h2M10 12 9 9h3M15 12l2-3h2" />
            </svg>
          )}
          <span className="pwa-custom-select-current">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <svg
          className={`pwa-custom-select-chevron ${isOpen ? "rotated" : ""}`}
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="#64748b"
          strokeWidth="2.2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="pwa-custom-select-dropdown" role="listbox">
          <ul className="pwa-custom-select-list">
            {options.length > 0 ? (
              options.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <li
                    key={opt.value ?? idx}
                    role="option"
                    aria-selected={isSelected}
                    className={`pwa-custom-select-option ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    <div className="pwa-custom-opt-content">
                      <div className="pwa-custom-opt-title-row">
                        <span className="pwa-custom-opt-title">{opt.label}</span>
                        {isSelected && (
                          <svg className="pwa-custom-opt-check" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#0066cc" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      {opt.sublabel && (
                        <span className="pwa-custom-opt-sub">{opt.sublabel}</span>
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="pwa-custom-select-option empty">
                <span className="pwa-custom-opt-sub">Chưa có tùy chọn nào</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
