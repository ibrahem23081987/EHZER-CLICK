import { useCallback, useId, useState } from 'react'
import { IconUpload } from './icons'

type Props = {
  label: string
  description?: string
  required?: boolean
  accept?: string
  value: File | null
  onChange: (file: File | null) => void
}

export function FileDropzone({
  label,
  description,
  required,
  accept = '.pdf,.jpg,.jpeg,.png',
  value,
  onChange,
}: Props) {
  const id = useId()
  const [drag, setDrag] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDrag(false)
      const f = e.dataTransfer.files[0]
      if (f) onChange(f)
    },
    [onChange],
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-navy">
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>
      </div>
      {description && <p className="text-xs text-navy/60">{description}</p>}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition ${
          drag ? 'border-gold bg-gold-muted' : 'border-navy/20 bg-slate-50/80'
        } ${value ? 'border-emerald-400/60 bg-emerald-50/30' : ''}`}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          onChange={(e) => {
            const f = e.target.files?.[0]
            onChange(f ?? null)
          }}
        />
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <IconUpload className="text-navy/40" />
          <p className="text-sm font-medium text-navy">
            {value ? value.name : 'גרור קובץ לכאן או לחץ לבחירה'}
          </p>
          <p className="text-xs text-navy/50">PDF, JPG או PNG · עד כ-10MB</p>
        </div>
      </div>
    </div>
  )
}

type MultiProps = Omit<Props, 'value' | 'onChange'> & {
  value: File[]
  onChange: (files: File[]) => void
}

export function FileDropzoneMulti({
  label,
  description,
  accept = '.pdf,.jpg,.jpeg,.png',
  value,
  onChange,
}: MultiProps) {
  const id = useId()
  const [drag, setDrag] = useState(false)

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return
      onChange([...value, ...Array.from(list)])
    },
    [onChange, value],
  )

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </label>
      {description && <p className="text-xs text-navy/60">{description}</p>}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          addFiles(e.dataTransfer.files)
        }}
        className={`relative rounded-2xl border-2 border-dashed transition ${
          drag ? 'border-gold bg-gold-muted' : 'border-navy/20 bg-slate-50/80'
        }`}
      >
        <input
          id={id}
          type="file"
          multiple
          accept={accept}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <IconUpload className="text-navy/40" />
          <p className="text-sm font-medium text-navy">גרור קבצים או לחץ לבחירה</p>
        </div>
      </div>
      {value.length > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-navy/80">
          {value.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-navy/10">
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
              >
                הסר
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
