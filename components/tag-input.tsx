"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

interface TagInputProps {
  defaultValue?: string
  placeholder?: string
  label?: string
  errorMessage?: string
  pattern?: string
  required?: boolean
  className?: string
}

export function TagInput({
  defaultValue = "",
  placeholder = " ",
  label = "tag",
  errorMessage = "must be at least 2 characters",
  pattern = ".{2,}",
  required = true,
  className = "",
}: TagInputProps) {
  const [value, setValue] = useState(defaultValue)
  const [isFocused, setIsFocused] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const formGroupRef = useRef<HTMLDivElement>(null)

  // Split the label for character animation
  const labelChars = label.split("")

  useEffect(() => {
    // Check validity when value changes
    if (inputRef.current) {
      setIsValid(inputRef.current.checkValidity())
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  return (
    <div
      ref={formGroupRef}
      className={`form-group ${!isValid ? "has-error" : ""} ${value ? "has-value" : ""} ${className}`}
    >
      <label htmlFor={`tag-input-${label}`} className="mb-2">
        <span>
          <span aria-hidden="true" className="label-text">
            {labelChars.map((char, index) => (
              <span
                key={index}
                className="char"
                style={
                  {
                    "--char-index": index,
                    "--char-total": labelChars.length,
                  } as React.CSSProperties
                }
              >
                {char}
              </span>
            ))}
          </span>
          <span className="sr-only">{label}</span>
        </span>
      </label>
      <input
        ref={inputRef}
        id={`tag-input-${label}`}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        pattern={pattern}
        title={label}
        autoComplete="off"
        spellCheck="false"
        className="border-green-500 focus:border-green-600 mt-2"
      />
      {/* Error message removed */}
    </div>
  )
}
