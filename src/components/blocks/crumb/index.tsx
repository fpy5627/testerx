import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { NavItem } from "@/types/blocks/base";

export default function Crumb({ items }: { items: NavItem[] }) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground">
      {items.map((item, index) => {
        const isActive = item.is_active;
        if (!item.url || !item.url.trim()) {
          return (
            <div key={index} className="flex items-center">
              <span
                className={`hover:text-foreground transition-colors ${
                  isActive ? "text-primary font-medium hover:text-primary" : ""
                }`}
              >
                {item.title}
              </span>
              {!isActive && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/40" />
              )}
            </div>
          );
        }
        return (
          <div key={index} className="flex items-center">
            <Link
              href={item.url.trim()}
              className={`hover:text-foreground transition-colors ${
                isActive ? "text-primary font-medium hover:text-primary" : ""
              }`}
            >
              {item.title}
            </Link>

            {!isActive && (
              <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/40" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
