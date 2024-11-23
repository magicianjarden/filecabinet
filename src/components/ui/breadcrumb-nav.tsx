'use client';

import Link from "next/link";
import { ChevronRight, Home, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center hover:text-foreground transition-colors group"
          >
            <Home className="h-4 w-4 mr-2 group-hover:text-foreground" />
            <span className="group-hover:text-foreground">Home</span>
          </Link>
        </div>
        {items.map((item, index) => (
          <div key={item.title} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center hover:text-foreground transition-colors group"
              >
                {item.icon && (
                  <span className="mr-2 group-hover:text-foreground">{item.icon}</span>
                )}
                <span className="group-hover:text-foreground">{item.title}</span>
              </Link>
            ) : (
              <button
                className="flex items-center hover:text-foreground transition-colors"
              >
                {item.icon && (
                  <span className="mr-2">{item.icon}</span>
                )}
                <span>{item.title}</span>
              </button>
            )}
          </div>
        ))}
      </ol>
    </nav>
  );
} 