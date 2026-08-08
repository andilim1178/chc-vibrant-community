import React, { useState } from 'react';
import { usePlaceRate } from '../../context/PlaceRateContext';
import { AddressSearch, AddressComponents } from './AddressSearch';

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--surface2)',
  border: '1px solid var(--border2)',
  borderRadius: 'var(--radius)',
  color: 'var(--text)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: 4,
};

export const SetupForm: React.FC = () => {
  const { projects, createNewProject } = usePlaceRate();
  const [type] = useState('Mixed Use');

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const [addr, setAddr] = useState('');
  const [street1, setStreet1] = useState('');
  const [street2, setStreet2] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('');

  const handleAddressSelect = (a: AddressComponents) => {
    setStreet1(a.street1 || '');
    setStreet2(a.street2 || '');
    setCity(a.city || '');
    setRegion(a.state || '');
    setPostcode(a.postcode || '');
    setCountry(a.country || '');
  };

  const handleClearAddress = () => {
    setAddr('');
    setStreet1('');
    setStreet2('');
    setCity('');
    setRegion('');
    setPostcode('');
    setCountry('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const isDuplicate = projects.some(
      p => p.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      setNameError('A project with this name already exists.');
      return;
    }
    setNameError(null);

    // Prefer the structured fields the user reviewed/edited; fall back to the
    // raw search text if they never picked a suggestion (e.g. typed and submitted).
    const composedAddr = [
      [street1, street2].filter(Boolean).join(', '),
      [city, region, postcode].filter(Boolean).join(' '),
      country,
    ].filter(Boolean).join(', ') || addr;

    createNewProject({ name: trimmedName, addr: composedAddr, postcode, type });
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        maxWidth: 500,
        margin: '0 auto',
      }}
    >
      <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, marginBottom: 16 }}>Project Details</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle} htmlFor="setup-name">PROJECT NAME</label>
          <input
            id="setup-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(null);
            }}
            placeholder="e.g. Town Centre Revitalisation"
            style={fieldStyle}
            required
          />
          {nameError && (
            <p role="alert" style={{ marginTop: 6, fontSize: 12, color: '#B3261E' }}>
              {nameError}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label style={labelStyle} htmlFor="setup-address-search">SEARCH FOR ADDRESS</label>
            <button
              type="button"
              onClick={handleClearAddress}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                marginBottom: 4,
                fontSize: 11,
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Clear address
            </button>
          </div>
          <AddressSearch
            value={addr}
            onChange={setAddr}
            onSelect={handleAddressSelect}
            placeholder="Search for address"
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle} htmlFor="setup-street1">STREET LINE 1</label>
          <input
            id="setup-street1"
            type="text"
            value={street1}
            onChange={(e) => setStreet1(e.target.value)}
            placeholder="Street address"
            style={fieldStyle}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle} htmlFor="setup-street2">STREET LINE 2</label>
          <input
            id="setup-street2"
            type="text"
            value={street2}
            onChange={(e) => setStreet2(e.target.value)}
            placeholder="Apartment, suite, etc. (optional)"
            style={fieldStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle} htmlFor="setup-city">CITY</label>
            <input
              id="setup-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={fieldStyle}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="setup-postcode">POSTCODE</label>
            <input
              id="setup-postcode"
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              style={fieldStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle} htmlFor="setup-state">STATE</label>
            <input
              id="setup-state"
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={fieldStyle}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="setup-country">COUNTRY</label>
            <input
              id="setup-country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={fieldStyle}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--accent)',
            color: 'var(--accent-text)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Create Project →
        </button>
      </form>
    </div>
  );
};
