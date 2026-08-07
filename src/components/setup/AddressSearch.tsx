import React, { useEffect, useRef, useState } from 'react';

interface AddressResult {
  fullAddress: string;
  postcode?: string;
}

interface AddressSearchProps {
  value: string;
  onChange: (address: string, postcode?: string) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AddressSearch: React.FC<AddressSearchProps> = ({
  value,
  onChange,
  placeholder = 'e.g. 123 Main St, Sydney'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!window.google?.maps?.places) {
      console.warn('Google Maps API not loaded. Address autocomplete disabled.');
      return;
    }

    if (!inputRef.current) return;

    const service = new window.google.maps.places.AutocompleteService();
    const geocoder = new window.google.maps.Geocoder();

    const timer = setTimeout(() => {
      if (value.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);

      // Restrict to Australia
      const request = {
        input: value,
        componentRestrictions: { country: 'au' },
      };

      service.getPlacePredictions(request, (predictions: any[]) => {
        if (!predictions) {
          setIsLoading(false);
          return;
        }

        // Get details for each prediction to extract postcode
        const detailPromises = predictions.slice(0, 5).map(prediction => {
          return new Promise<AddressResult>(resolve => {
            geocoder.geocode({ placeId: prediction.place_id }, (results: any[]) => {
              if (results && results[0]) {
                const result = results[0];
                const address = result.formatted_address;

                // Extract postcode from address components
                let postcode: string | undefined;
                result.address_components.forEach((comp: any) => {
                  if (comp.types.includes('postal_code')) {
                    postcode = comp.long_name;
                  }
                });

                resolve({ fullAddress: address, postcode });
              } else {
                resolve({ fullAddress: prediction.description, postcode: undefined });
              }
            });
          });
        });

        Promise.all(detailPromises).then(results => {
          setSuggestions(results);
          setShowSuggestions(true);
          setIsLoading(false);
        });
      });
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelectSuggestion = (suggestion: AddressResult) => {
    onChange(suggestion.fullAddress, suggestion.postcode);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value && suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'var(--surface2)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)',
          color: 'var(--text)',
          fontSize: 14,
        }}
      />

      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          padding: 8,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          fontSize: 13,
          color: 'var(--text-muted)',
        }}>
          Loading suggestions...
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          zIndex: 10,
          maxHeight: 200,
          overflowY: 'auto',
        }}>
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSuggestion(suggestion)}
              style={{
                padding: '10px 12px',
                borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border2)' : 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--text)',
                transition: 'background-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div>{suggestion.fullAddress}</div>
              {suggestion.postcode && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {suggestion.postcode}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
