"use client";

import { Button } from "@heroui/react";
import type { ReactNode } from "react";

type HeroButtonProps = {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  isDisabled?: boolean;
  onPress?: () => void;
  onClick?: () => void;
};

export function HeroButton({ children, className, type = "button", isDisabled, onPress, onClick }: HeroButtonProps) {
  return (
    <Button type={type} isDisabled={isDisabled} onPress={onPress} onClick={onClick} className={className}>
      {children}
    </Button>
  );
}
