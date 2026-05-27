import { Phone, MessageCircle, MapPin, StickyNote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/types";

export function CustomerInfoCard({ customer }: { customer: Customer }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
            {customer.name.split(" ").map(s => s[0]).slice(0,2).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{customer.name}</p>
          <p className="text-xs text-muted-foreground truncate">{customer.phone}</p>
        </div>
        <div className="flex gap-2">
          <a href={`tel:${customer.phone}`}>
            <Button size="icon" className="h-9 w-9 rounded-full bg-success hover:bg-success/90 text-success-foreground">
              <Phone className="h-4 w-4" />
            </Button>
          </a>
          <Button size="icon" variant="outline" className="h-9 w-9 rounded-full">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-start gap-2 text-sm text-foreground">
        <MapPin className="h-4 w-4 mt-0.5 text-brand shrink-0" />
        <p>{customer.address}</p>
      </div>
      {customer.notes && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground rounded-xl bg-muted/60 p-3">
          <StickyNote className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{customer.notes}</p>
        </div>
      )}
    </div>
  );
}
