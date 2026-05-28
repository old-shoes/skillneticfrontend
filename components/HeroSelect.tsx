"use client";

import { ListBox, ListBoxItem, Select } from "@heroui/react";
import type { Key } from "react";

type HeroSelectOption = {
  label: string;
  value: string;
};

type HeroSelectProps = {
  ariaLabel: string;
  value: string;
  options: HeroSelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  isDisabled?: boolean;
  onChange: (value: string) => void;
};

export function HeroSelect({
  ariaLabel,
  value,
  options,
  placeholder,
  className,
  triggerClassName,
  popoverClassName,
  isDisabled,
  onChange,
}: HeroSelectProps) {
  return (
    <Select
      aria-label={ariaLabel}
      selectedKey={value || null}
      onSelectionChange={(key) => {
        const selected = key as Key | null;
        onChange(typeof selected === "string" ? selected : "");
      }}
      isDisabled={isDisabled}
      className={className}
    >
      <Select.Trigger className={triggerClassName}>
        <Select.Value>{value ? options.find((item) => item.value === value)?.label : placeholder || ""}</Select.Value>
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover className={popoverClassName}>
        <ListBox items={options}>
          {(item) => (
            <ListBoxItem id={item.value} textValue={item.label}>
              {item.label}
            </ListBoxItem>
          )}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
