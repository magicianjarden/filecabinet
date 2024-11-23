'use client';

import Link from 'next/link';
import { ChevronRight, Home } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { usePathname } from 'next/navigation';

interface BreadcrumbNavProps {
  items: {
    title: string;
    href?: string;
    icon?: React.ReactNode;
  }[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          {isHome ? (
            <BreadcrumbPage className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink 
              href="/" 
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            {item.href ? (
              <BreadcrumbLink 
                href={item.href}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                {item.icon}
                {item.title}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage className="flex items-center gap-2">
                {item.icon}
                {item.title}
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 