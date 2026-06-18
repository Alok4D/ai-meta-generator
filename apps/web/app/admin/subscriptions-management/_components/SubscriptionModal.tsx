import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, X } from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlan: any;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  handleFeatureChange: (index: number, value: string) => void;
  addFeature: () => void;
  removeFeature: (index: number) => void;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  editingPlan,
  formData,
  setFormData,
  onSubmit,
  handleFeatureChange,
  addFeature,
  removeFeature
}: SubscriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-background z-10">
          <h3 className="text-xl font-bold">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-6">
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
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="year">year</option>
                <option value="forever">forever</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Credits</Label>
              <Input 
                type="number" 
                required 
                min="0"
                value={formData.credits || 0} 
                onChange={e => setFormData({...formData, credits: Number(e.target.value)})} 
                placeholder="e.g. 400"
              />
            </div>
            <div className="space-y-2">
              <Label>Validity in Days</Label>
              <Input 
                type="number" 
                required 
                min="1"
                value={formData.validityDays || 30} 
                onChange={e => setFormData({...formData, validityDays: Number(e.target.value)})} 
                placeholder="e.g. 90"
              />
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
            {formData.features.map((feature: string, index: number) => (
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
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{editingPlan ? 'Save Changes' : 'Create Plan'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
