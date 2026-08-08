import React, { useEffect, useRef, useState } from 'react';

export interface AddressComponents {
  fullAddress: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface AddressSearchProps {
  value: string;
  /** Fires on every keystroke, so the search box stays a controlled input. */
  onChange: (text: string) => void;
  /** Fires when a suggestion is picked, with the full parsed address — use this to auto-fill other fields. */
  onSelect?: (address: AddressComponents) => void;
  placeholder?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

/** Pulls street/city/state/postcode/country out of a Google geocode result. */
function parseAddressComponents(components: any[]): Omit<AddressComponents, 'fullAddress'> {
  const find = (type: string) => components.find((c: any) => c.types.includes(type));

  const streetNumber = find('street_number')?.long_name;
  const route = find('route')?.long_name;
  const street1 = [streetNumber, route].filter(Boolean).join(' ') || undefined;
  const street2 = find('subpremise')?.long_name;
  const city =
    find('locality')?.long_name ||
    find('sublocality')?.long_name ||
    find('postal_town')?.long_name;
  const state = find('administrative_area_level_1')?.short_name;
  const postcode = find('postal_code')?.long_name;
  const country = find('country')?.long_name;

  return { street1, street2, city, state, postcode, country };
}

export const AddressSearch: React.FC<AddressSearchProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Search for address'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<AddressComponents[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Selecting a suggestion changes `value` via onChange, which would otherwise
  // re-run this effect and immediately re-search for (and reopen) the address
  // the user just picked. Set right before that onChange call, consumed here.
  const skipNextSearchRef = useRef(false);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

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

        // Get details for each prediction to extract the full address breakdown
        const detailPromises = predictions.slice(0, 5).map(prediction => {
          return new Promise<AddressComponents>(resolve => {
            geocoder.geocode({ placeId: prediction.place_id }, (results: any[]) => {
              if (results && results[0]) {
                const result = results[0];
                resolve({
                  fullAddress: result.formatted_address,
                  ...parseAddressComponents(result.address_components || []),
                });
              } else {
                resolve({ fullAddress: prediction.description });
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

  const handleSelectSuggestion = (suggestion: AddressComponents) => {
    skipNextSearchRef.current = true;
    setSuggestions([]);
    setShowSuggestions(false);
    onChange(suggestion.fullAddress);
    onSelect?.(suggestion);
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
