"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { cn } from "./utils";
import { buttonVariants } from "./button";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "rdp-root text-sm",
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",

        month_caption: "relative flex items-center justify-center px-1 pt-1 text-sm font-medium",
        caption_label: "pointer-events-none text-sm font-semibold",

        nav: "absolute inset-x-5 z-10 flex items-center justify-between",

        chevron: "flex items-center justify-center [&::before]:hidden [&::after]:hidden",

        button_previous: cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        ),
        button_next: cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        ),

        weekdays: "grid grid-cols-7 gap-1 text-xs text-muted-foreground",
        weekday: "flex items-center justify-center w-8 h-8 font-medium",
        week: "grid grid-cols-7 gap-1",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        today: "bg-accent text-accent-foreground",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        outside: "text-muted-foreground opacity-50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent/50 aria-selected:text-accent-foreground",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ className, disabled, orientation, ...chevronProps }) => {
          const Icon =
            orientation === "left" ? ChevronLeft : ChevronRight;

          return (
            <Icon
              className={cn(
                "size-4",
                disabled && "opacity-50",
                className
              )}
              {...chevronProps}
            />
          );
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
