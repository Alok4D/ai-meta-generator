"use client";

import { useState } from "react";
import { 
  useGetSubscriptionsQuery, 
  useCreateSubscriptionMutation, 
  useUpdateSubscriptionMutation, 
  useDeleteSubscriptionMutation 
} from "@/lib/feature/subscription/subscriptionApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { SubscriptionCard } from "./SubscriptionCard";
import { SubscriptionModal } from "./SubscriptionModal";

export function SubscriptionsClient() {
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
            <SubscriptionCard 
              key={plan._id}
              plan={plan}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <SubscriptionModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingPlan={editingPlan}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        handleFeatureChange={handleFeatureChange}
        addFeature={addFeature}
        removeFeature={removeFeature}
      />
    </div>
  );
}
