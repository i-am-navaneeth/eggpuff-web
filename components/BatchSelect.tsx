'use client';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function BatchSelect({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label>Select Batch</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #ccc',
        }}
      >
        <option value="">Select Batch</option>
        <option value="2025-29">2025–29</option>
        <option value="2024-28">2024–28</option>
        <option value="2023-27">2023–27</option>
        <option value="2022-26">2022–26</option>
      </select>
    </div>
  );
}