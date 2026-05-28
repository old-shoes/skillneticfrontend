"use client";

import { ListBox, ListBoxItem, Popover } from "@heroui/react";
import { useRef, useState } from "react";

type HeroMultiSelectOption = {
  label: string;
  value: string;
};

type HeroMultiSelectProps = {
  ariaLabel: string;
  values: string[];
  options: HeroMultiSelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  isDisabled?: boolean;
  onChange: (values: string[]) => void;
};

export function HeroMultiSelect({
  ariaLabel,
  values,
  options,
  placeholder,
  className,
  triggerClassName,
  popoverClassName,
  isDisabled,
  onChange,
}: HeroMultiSelectProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const selectedOptions = values
    .map((value) => options.find((item) => item.value === value))
    .filter((item): item is HeroMultiSelectOption => Boolean(item));

  function removeValue(value: string) {
    onChange(values.filter((item) => item !== value));
  }

  return (
    <div className={className}>
      {selectedOptions.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => removeValue(item.value)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
            >
              <span>{item.label}</span>
              <span aria-hidden="true">x</span>
            </button>
          ))}
        </div>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={isDisabled}
        onClick={() => setOpen((previous) => !previous)}
        className={triggerClassName}
      >
        <span className="block truncate text-left">
          {selectedOptions.length > 0
            ? selectedOptions.map((item) => item.label).join(", ")
            : placeholder || ""}
        </span>
      </button>
      <Popover.Content
        isOpen={open}
        onOpenChange={setOpen}
        triggerRef={triggerRef}
        placement="bottom"
        offset={8}
        className={popoverClassName}
      >
        <div className="min-w-[260px] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <ListBox
            aria-label={ariaLabel}
            items={options}
            selectionMode="multiple"
            selectedKeys={new Set(values)}
            onSelectionChange={(keys) => {
              if (keys === "all") {
                onChange(options.map((item) => item.value));
                return;
              }
              onChange(Array.from(keys).filter((item): item is string => typeof item === "string"));
            }}
            className="max-h-72 overflow-y-auto"
          >
            {(item) => (
              <ListBoxItem
                id={item.value}
                textValue={item.label}
                className="rounded-xl"
              >
                {({ isSelected }) => (
                  <div
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                      isSelected
                        ? "bg-brand-50 font-medium text-brand-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={isSelected ? "text-brand-600" : "text-slate-300"}>
                      {isSelected ? "✓" : ""}
                    </span>
                  </div>
                )}
              </ListBoxItem>
            )}
          </ListBox>
        </div>
      </Popover.Content>
    </div>
  );
}
