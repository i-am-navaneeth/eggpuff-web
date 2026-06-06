"use client";

import { ReactNode } from "react";

export default function ProfileModalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="fixed top-[55px] bottom-0 left-0 right-0 z-[9999] bg-[#f5f5f5] overflow-y-auto">
      {children}
    </div>
  );
}