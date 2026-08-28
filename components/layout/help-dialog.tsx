"use client";

import * as React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { HelpCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OnboardingGuide } from "@/components/dashboard/onboarding-guide";

export function HelpDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="How to use this dashboard"
          />
        }
      >
        <HelpCircle className="size-4" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[min(92vw,960px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-background p-6 shadow-lg focus:outline-none">
          <div className="mb-4 flex items-start justify-between gap-3">
            <Dialog.Title className="font-heading text-lg font-semibold tracking-tight">
              How to use this dashboard
            </Dialog.Title>
            <Dialog.Close
              render={
                <Button variant="ghost" size="icon" aria-label="Close" />
              }
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            A step-by-step guide to viewing GitHub analytics in this dashboard.
          </Dialog.Description>
          <OnboardingGuide variant="dialog" />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
