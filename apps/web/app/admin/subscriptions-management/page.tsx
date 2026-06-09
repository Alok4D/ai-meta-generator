"use client";

import { useState } from "react";
import { 
  useGetSubscriptionsQuery, 
  useCreateSubscriptionMutation, 
  useUpdateSubscriptionMutation, 
  useDeleteSubscriptionMutation 
} from "@/lib/feature/subscription/subscriptionApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, Edit2, Trash2, Plus, X } from "lucide-react";

export default function SubscriptionsManagement() {

  const { data: plans = [], isLoading } = useGetSubscriptionsQuery(undefined);
  const [createPlan] = useCreateSubscriptionMutation();
  const [updatePlan] = useUpdateSubscriptionMutation();
  const [deletePlan] = useDeleteSubscriptionMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    period: "month",
    features: [""],
    isPopular: false,
    buttonText: "Upgrade"
  });

  const handleOpenModal = (plan: any = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        period: plan.period,
        features: plan.features.length ? plan.features : [""],
        isPopular: plan.isPopular,
        buttonText: plan.buttonText
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        period: "month",
        features: [""],
        isPopular: false,
        buttonText: "Upgrade"
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length ? newFeatures : [""] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== "")
      };

      if (editingPlan) {
        await updatePlan({ id: editingPlan._id, data: cleanData }).unwrap();
        toast.success("Plan updated successfully");
      } else {
        await createPlan(cleanData).unwrap();
        toast.success("Plan created successfully");
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to save plan");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      try {
        await deletePlan(id).unwrap();
        toast.success("Plan deleted successfully");
      } catch (error: any) {
        toast.error(error.data?.error || "Failed to delete plan");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions Management</h2>
          <p className="text-muted-foreground">Manage pricing plans, features, and popularity tags.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Add New Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-8">
          {plans.map((plan: any) => (
            <div 
              key={plan._id} 
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
                  onClick={() => handleOpenModal(plan)}
                  className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                  title="Edit Plan"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(plan._id)}
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
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-background z-10">
              <h3 className="text-xl font-bold">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h3>
              <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="e.g. Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input 
                    required 
                    value={formData.buttonText} 
                    onChange={e => setFormData({...formData, buttonText: e.target.value})} 
                    placeholder="e.g. Upgrade to Pro"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  required 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Perfect for trying out the platform."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input 
                    type="number" 
                    required 
                    min="0"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Billing Period</Label>
                  <select
                    required
                    value={formData.period}
                    onChange={e => setFormData({...formData, period: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="month">month</option>
                    <option value="year">year</option>
                    <option value="forever">forever</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isPopular" 
                  checked={formData.isPopular}
                  onChange={e => setFormData({...formData, isPopular: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isPopular" className="cursor-pointer">Mark as "Most Popular"</Label>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="flex justify-between items-center">
                  <span>Features List</span>
                  <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                    <Plus className="w-3 h-3 mr-1" /> Add Feature
                  </Button>
                </Label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={feature} 
                      onChange={e => handleFeatureChange(index, e.target.value)} 
                      placeholder="e.g. 500 images per day"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeFeature(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit">{editingPlan ? 'Save Changes' : 'Create Plan'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}