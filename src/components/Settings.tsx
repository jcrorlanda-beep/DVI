import { useState, useEffect } from 'react'
import type { FC, FormEvent, CSSProperties } from 'react'
import type { WorkshopSettings } from '../types'

interface SettingsProps {
  settings: WorkshopSettings
  onSave: (s: WorkshopSettings) => void
}

const INPUT: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  fontSize: '14px',
  color: '#0f172a',
  boxSizing: 'border-box',
  outline: 'none',
  background: '#fff',
}

const LABEL: CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  display: 'block',
  marginBottom: '5px',
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

const Section: FC<SectionProps> = ({ title, children }) => (
  <div
    style={{
      background: '#ffffff',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      marginBottom: '20px',
    }}
  >
    <div
      style={{
        padding: '14px 24px',
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc',
      }}
    >
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
        {title}
      </h3>
    </div>
    <div style={{ padding: '20px 24px' }}>{children}</div>
  </div>
)

const Settings: FC<SettingsProps> = ({ settings, onSave }) => {
  const [form, setForm] = useState(settings)
  const [newTech, setNewTech] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(settings)
  }, [settings])

  const set = <K extends keyof WorkshopSettings>(key: K, value: WorkshopSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const addTech = () => {
    const name = newTech.trim()
    if (name && !form.technicians.includes(name)) {
      set('technicians', [...form.technicians, name])
      setNewTech('')
    }
  }

  const removeTech = (name: string) => {
    set(
      'technicians',
      form.technicians.filter((t) => t !== name)
    )
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    onSave(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '720px' }}>
      <h1
        style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 24px' }}
      >
        Settings
      </h1>

      <form onSubmit={handleSave}>
        <Section title="Workshop Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LABEL}>Shop Name</label>
              <input
                value={form.shopName}
                onChange={(e) => set('shopName', e.target.value)}
                style={INPUT}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LABEL}>Address</label>
              <input
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                style={INPUT}
              />
            </div>
            <div>
              <label style={LABEL}>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                style={INPUT}
              />
            </div>
            <div>
              <label style={LABEL}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                style={INPUT}
              />
            </div>
          </div>
        </Section>

        <Section title="Billing">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={LABEL}>Labor Rate ($/hr)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.laborRate}
                onChange={(e) => set('laborRate', Number(e.target.value))}
                style={INPUT}
              />
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 0' }}>
                Used to calculate work order estimates
              </p>
            </div>
            <div>
              <label style={LABEL}>Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.taxRate}
                onChange={(e) => set('taxRate', Number(e.target.value))}
                style={INPUT}
              />
            </div>
          </div>
        </Section>

        <Section title="Technicians">
          <div style={{ marginBottom: '16px' }}>
            {form.technicians.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 12px' }}>
                No technicians added yet.
              </p>
            )}
            {form.technicians.map((tech) => (
              <div
                key={tech}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <span style={{ fontSize: '14px', color: '#0f172a' }}>{tech}</span>
                <button
                  type="button"
                  onClick={() => removeTech(tech)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    fontSize: '18px',
                    lineHeight: 1,
                    padding: '2px 6px',
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTech()
                }
              }}
              placeholder="Technician name..."
              style={{ ...INPUT, flex: 1 }}
            />
            <button
              type="button"
              onClick={addTech}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                padding: '9px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Add
            </button>
          </div>
        </Section>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {saved && (
            <span style={{ color: '#16a34a', fontSize: '14px', fontWeight: 600 }}>
              Settings saved successfully.
            </span>
          )}
          <button
            type="submit"
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '10px 28px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings
