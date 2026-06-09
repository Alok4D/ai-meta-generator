import { Button } from "@/components/ui/button";
import { Check, Edit2, Trash2 } from "lucide-react";

interface SubscriptionCardProps {
  plan: any;
  onEdit: (plan: any) => void;
  onDelete: (id: string) => void;
}

export function SubscriptionCard({ plan, onEdit, onDelete }: SubscriptionCardProps) {
  return (
    <div 
      className={`relative flex flex-col bg-card rounded-2xl p-8 transition-all duration-200 ${
        plan.isPopular 
          ? 'border-2 border-foreground shadow-xl scale-105 z-10' 
          : 'border border-border shadow-sm'
      }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-md">
          Most Popular
        </div>
      )}

      {/* Admin Actions */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={() => onEdit(plan)}
          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
          title="Edit Plan"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(plan._id)}
          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded-md transition-colors"
          title="Delete Plan"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <p className="text-muted-foreground text-sm min-h-[40px]">{plan.description}</p>
      </div>

      <div className="mb-6 flex items-baseline text-foreground">
        <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
        <span className="text-muted-foreground ml-1">/{plan.period}</span>
      </div>

      <ul className="flex-1 space-y-4 mb-8">
        {plan.features.map((feature: string, index: number) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        variant={plan.isPopular ? 'default' : 'outline'} 
        className="w-full rounded-lg py-6 font-semibold"
      >
        {plan.buttonText}
      </Button>
    </div>
  );
}
