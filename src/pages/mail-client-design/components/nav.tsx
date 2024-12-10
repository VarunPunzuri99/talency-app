"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/Ui";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Droppable } from "@hello-pangea/dnd";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    icon: LucideIcon;
    variant: "default" | "ghost";
    onClick: () => void;
  }[];
  selectedFolder: string;
  onDropEmail: (folder: string, emailUIDs: string[]) => void;
}

export default function Nav({
  links,
  isCollapsed,
  selectedFolder,
}: NavProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links?.map((link) => (
          <Droppable key={link.title} droppableId={link.title}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "flex items-center justify-start cursor-pointer w-full p-2 rounded",
                  link.variant === "default" &&
                  (isCollapsed
                    ? "text-[#e56a48]" // Orange color for collapsed
                    : "text-dark-white"), // Default color
                  "hover:border hover:border-[#e56a48] hover:bg-[#f1d0c6] dark:hover:bg-[#f1d0c6] dark:hover:text-[#e56a48]",
                  "text-sm",
                  "border-none",
                  selectedFolder === link.title && "bg-[#e56a48] text-white", // Active folder styling
                  snapshot.isDraggingOver && "bg-gray-200" // Highlight during drag
                )}
                onClick={link.onClick} // Handle folder selection
              >
                {isCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center h-9">
                        <link.icon className="h-4 w-4" />
                        <span className="sr-only">{link.title}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-4">
                      {link.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="flex items-center">
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.title}
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </nav>
    </div>
  );
}
