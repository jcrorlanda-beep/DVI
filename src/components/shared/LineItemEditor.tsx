import { useState } from 'react'
import type { FC, CSSProperties } from 'react'
import type { LineItem, LineItemType, Technician, InventoryPart } from '../../types'
import { calcLineItems, fmt } from '../../hooks/useWorkOrderCalcs'
import { lineItemId } from '../../store/ids'

interface LineItemEditorProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
  laborRate: number
  taxRate: number
  technicians: Technician[]
  inventoryParts?: InventoryPart[]
  readOnly?: boolean
}

const CELL: CSSProperties = { padding: '4px 6px' }
const MINI_INPUT: CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  border: '1px solid #e2e8f0',
  borderRadius: '5px',
  fontSize: '13px',
  fontFamily: 'inherit',
  color: '#0f172a',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
}

const TYPE_COLORS: Record<LineItemType, string> = {
  labor: '#dbeafe',
  part: '#dcfce7',
  sublet: '#ffedd5',
  fee: '#f3e8ff',
}

interface RowProps {
  item: LineItem
  onChange: (item: LineItem) => void
  onDelete: () => void
  laborRate: number
  technicians: Technician[]
  inventoryParts: InventoryPart[]
  readOnly: boolean
}

const LineItemRow: FC<RowProps> = ({
  item,
  onChange,
  onDelete,
  laborRate,
  technicians,
  inventoryParts,
  readOnly,
}) => {
  const [descFocus, setDescFocus] = useState(false)
  const lineTotal = item.quantity * item.unitPrice

  const suggestions = descFocus && item.type === 'part' && item.description.length > 1
    ? inventoryParts
        .filter((p) => p.name.toLowerCase().includes(item.description.toLowerCase()))
        .slice(0, 4)
    : []

  return (
    <tr>
      <td style={CELL}>
        <select
          disabled={readOnly}
          value={item.type}
          onChange={(e) =>
            onChange({
              ...item,
              type: e.target.value as LineItemType,
              taxable: e.target.value !== 'labor',
              unitPrice: e.target.value === 'labor' ? laborRate : item.unitPrice,
            })
          }
          style={{
            ...MINI_INPUT,
            width: '80px',
            background: TYPE_COLORS[item.type],
            fontWeight: 600,
            cursor: readOnly ? 'default' : 'pointer',
          }}
        >
          <option value="labor">Labor</option>
          <option value="part">Part</option>
          <option value="sublet">Sublet</option>
          <option value="fee">Fee</option>
        </select>
      </td>
      <td style={{ ...CELL, position: 'relative', minWidth: '200px' }}>
        <input
          disabled={readOnly}
          value={item.description}
          onChange={(e) => onChange({ ...item, description: e.target.value })}
          onFocus={() => setDescFocus(true)}
          onBlur={() => setTimeout(() => setDescFocus(false), 150)}
          style={{ ...MINI_INPUT, width: '100%' }}
          placeholder={item.type === 'labor' ? 'Service description' : 'Part name / number'}
        />
        {suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 10,
            }}
          >
            {suggestions.map((p) => (
              <div
                key={p.id}
                onMouseDown={() =>
                  onChange({
                    ...item,
                    description: p.name,
                    unitPrice: p.sellPrice,
                    cost: p.costPrice,
                    partNumber: p.partNumber,
                    inventoryPartId: p.id,
                  })
                }
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  borderBottom: '1px solid #f1f5f9',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ color: '#94a3b8', marginLeft: '8px' }}>
                  ${fmt(p.sellPrice)} · Stock: {p.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </td>
      {item.type === 'labor' && (
        <td style={CELL}>
          <select
            disabled={readOnly}
            value={item.technicianId ?? ''}
            onChange={(e) => onChange({ ...item, technicianId: e.target.value || undefined })}
            style={{ ...MINI_INPUT, width: '120px', cursor: readOnly ? 'default' : 'pointer' }}
          >
            <option value="">Any</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </td>
      )}
      {item.type !== 'labor' && <td style={CELL} />}
      <td style={CELL}>
        <input
          disabled={readOnly}
          type="number"
          min="0"
          step={item.type === 'labor' ? '0.5' : '1'}
          value={item.quantity}
          onChange={(e) => onChange({ ...item, quantity: parseFloat(e.target.value) || 0 })}
          style={{ ...MINI_INPUT, width: '60px', textAlign: 'right' }}
        />
      </td>
      <td style={CELL}>
        <input
          disabled={readOnly}
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice}
          onChange={(e) => onChange({ ...item, unitPrice: parseFloat(e.target.value) || 0 })}
          style={{ ...MINI_INPUT, width: '80px', textAlign: 'right' }}
        />
      </td>
      <td style={{ ...CELL, textAlign: 'right', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
        ${fmt(lineTotal)}
      </td>
      <td style={{ ...CELL, textAlign: 'center' }}>
        <input
          disabled={readOnly}
          type="checkbox"
          checked={item.taxable}
          onChange={(e) => onChange({ ...item, taxable: e.target.checked })}
          style={{ cursor: readOnly ? 'default' : 'pointer', width: '16px', height: '16px' }}
        />
      </td>
      {!readOnly && (
        <td style={CELL}>
          <button
            type="button"
            onClick={onDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '18px',
              lineHeight: 1,
              padding: '2px 6px',
              fontFamily: 'inherit',
            }}
          >
            &times;
          </button>
        </td>
      )}
    </tr>
  )
}

const LineItemEditor: FC<LineItemEditorProps> = ({
  items,
  onChange,
  laborRate,
  taxRate,
  technicians,
  inventoryParts = [],
  readOnly = false,
}) => {
  const totals = calcLineItems(items, taxRate)

  const updateItem = (id: string, updated: LineItem) =>
    onChange(items.map((i) => (i.id === id ? updated : i)))

  const deleteItem = (id: string) =>
    onChange(items.filter((i) => i.id !== id))

  const addItem = (type: LineItemType) =>
    onChange([
      ...items,
      {
        id: lineItemId(),
        type,
        description: '',
        quantity: type === 'labor' ? 1 : 1,
        unitPrice: type === 'labor' ? laborRate : 0,
        taxable: type !== 'labor',
      },
    ])

  const TH_STYLE: CSSProperties = {
    padding: '8px 6px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '2px solid #e2e8f0',
    background: '#f8fafc',
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr>
              <th style={TH_STYLE}>Type</th>
              <th style={{ ...TH_STYLE, minWidth: '200px' }}>Description</th>
              <th style={TH_STYLE}>Tech</th>
              <th style={{ ...TH_STYLE, textAlign: 'right' }}>Qty</th>
              <th style={{ ...TH_STYLE, textAlign: 'right' }}>Unit $</th>
              <th style={{ ...TH_STYLE, textAlign: 'right' }}>Total</th>
              <th style={{ ...TH_STYLE, textAlign: 'center' }}>Tax</th>
              {!readOnly && <th style={TH_STYLE} />}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={readOnly ? 7 : 8}
                  style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}
                >
                  No line items yet. Use the buttons below to add services or parts.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <LineItemRow
                  key={item.id}
                  item={item}
                  onChange={(updated) => updateItem(item.id, updated)}
                  onDelete={() => deleteItem(item.id)}
                  laborRate={laborRate}
                  technicians={technicians}
                  inventoryParts={inventoryParts}
                  readOnly={readOnly}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add buttons */}
      {!readOnly && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
          {(['labor', 'part', 'sublet', 'fee'] as LineItemType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addItem(type)}
              style={{
                background: TYPE_COLORS[type],
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'inherit',
                color: '#0f172a',
              }}
            >
              + {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Totals */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px',
          fontSize: '14px',
        }}
      >
        <div style={{ display: 'flex', gap: '32px' }}>
          <span style={{ color: '#64748b' }}>
            Labor ({fmt(totals.laborHours)} hrs)
          </span>
          <span style={{ minWidth: '80px', textAlign: 'right' }}>${fmt(totals.laborSubtotal)}</span>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          <span style={{ color: '#64748b' }}>Parts & Other</span>
          <span style={{ minWidth: '80px', textAlign: 'right' }}>${fmt(totals.partsSubtotal)}</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '4px' }}>
          <span style={{ color: '#64748b' }}>Subtotal</span>
          <span style={{ minWidth: '80px', textAlign: 'right' }}>${fmt(totals.subtotal)}</span>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          <span style={{ color: '#64748b' }}>Tax ({taxRate}%)</span>
          <span style={{ minWidth: '80px', textAlign: 'right' }}>${fmt(totals.taxAmount)}</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', borderTop: '2px solid #0f172a', paddingTop: '6px', marginTop: '2px' }}>
          <span style={{ fontWeight: 700, fontSize: '15px' }}>Total</span>
          <span style={{ minWidth: '80px', textAlign: 'right', fontWeight: 700, fontSize: '15px' }}>
            ${fmt(totals.total)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LineItemEditor
