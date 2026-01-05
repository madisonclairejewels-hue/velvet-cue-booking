import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Plus, Trash2, Edit, Save, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  useAllPricing,
  useCreatePricing,
  useUpdatePricing,
  useDeletePricing,
} from "@/hooks/usePricing";

export function AdminPricing() {
  const { toast } = useToast();
  const { data: pricing, isLoading } = useAllPricing();
  const createPricing = useCreatePricing();
  const updatePricing = useUpdatePricing();
  const deletePricing = useDeletePricing();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    price: 0,
    duration: "",
    description: "",
    features: [""],
    is_popular: false,
    active: true,
    sort_order: 0,
  });

  const resetForm = () => {
    setForm({
      title: "",
      price: 0,
      duration: "",
      description: "",
      features: [""],
      is_popular: false,
      active: true,
      sort_order: 0,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    const cleanFeatures = form.features.filter((f) => f.trim());

    if (editingId) {
      await updatePricing.mutateAsync({
        id: editingId,
        ...form,
        features: cleanFeatures,
      });
      toast({ title: "Pricing updated!" });
    } else {
      await createPricing.mutateAsync({
        ...form,
        features: cleanFeatures,
      });
      toast({ title: "Pricing plan created!" });
    }

    resetForm();
  };

  const handleEdit = (plan: any) => {
    setForm({
      title: plan.title,
      price: plan.price,
      duration: plan.duration || "",
      description: plan.description || "",
      features: plan.features?.length ? plan.features : [""],
      is_popular: plan.is_popular || false,
      active: plan.active ?? true,
      sort_order: plan.sort_order || 0,
    });
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deletePricing.mutateAsync(id);
    toast({ title: "Pricing plan deleted!" });
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await updatePricing.mutateAsync({ id, active });
    toast({ title: active ? "Plan activated!" : "Plan deactivated!" });
  };

  const handleTogglePopular = async (id: string, is_popular: boolean) => {
    await updatePricing.mutateAsync({ id, is_popular });
    toast({ title: is_popular ? "Marked as popular!" : "Removed popular status!" });
  };

  const addFeature = () => {
    setForm({ ...form, features: [...form.features, ""] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...form.features];
    newFeatures[index] = value;
    setForm({ ...form, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = form.features.filter((_, i) => i !== index);
    setForm({ ...form, features: newFeatures.length ? newFeatures : [""] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-2 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-accent" />
            Pricing Management
          </h1>
          <p className="text-muted-foreground">Manage your pricing plans and memberships.</p>
        </div>
        {!showForm && (
          <Button variant="premium" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Plan
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border/50 rounded-sm p-6"
        >
          <h2 className="text-lg font-medium text-foreground mb-4">
            {editingId ? "Edit Pricing Plan" : "Create New Pricing Plan"}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Plan Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-muted/50 mt-1"
                  placeholder="e.g., Hourly Play"
                />
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={form.price || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/^0+/, "").replace(/\D/g, "");
                    setForm({ ...form, price: value ? parseInt(value, 10) : 0 });
                  }}
                  className="bg-muted/50 mt-1"
                />
              </div>
              <div>
                <Label>Duration</Label>
                <Input
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="bg-muted/50 mt-1"
                  placeholder="e.g., per hour, per month"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-muted/50 mt-1"
                placeholder="Short description of this plan"
              />
            </div>

            <div>
              <Label>Features</Label>
              <div className="space-y-2 mt-1">
                {form.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="bg-muted/50"
                      placeholder="Feature description"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.active}
                  onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_popular}
                  onCheckedChange={(checked) => setForm({ ...form, is_popular: checked })}
                />
                <Label>Mark as Popular</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="premium" onClick={handleSubmit}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? "Save Changes" : "Create Plan"}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pricing List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/50 rounded-sm p-6"
      >
        <h2 className="text-lg font-medium text-foreground mb-4">
          All Pricing Plans ({pricing?.length || 0})
        </h2>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !pricing?.length ? (
          <p className="text-muted-foreground py-8 text-center">No pricing plans yet.</p>
        ) : (
          <div className="space-y-3">
            {pricing.map((plan) => (
              <div
                key={plan.id}
                className={`bg-muted/30 border rounded-sm p-4 ${
                  plan.active ? "border-border/30" : "border-destructive/30 opacity-60"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-foreground font-medium">{plan.title}</h3>
                      {plan.is_popular && (
                        <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded">
                          Popular
                        </span>
                      )}
                      {!plan.active && (
                        <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-accent text-lg font-bold">
                      ₹{plan.price}
                      {plan.duration && (
                        <span className="text-muted-foreground text-sm font-normal">
                          {" "}
                          / {plan.duration}
                        </span>
                      )}
                    </p>
                    {plan.features && plan.features.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {plan.features.map((feature, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1 text-xs text-muted-foreground"
                          >
                            <Check className="h-3 w-3 text-primary" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Active</span>
                      <Switch
                        checked={plan.active ?? true}
                        onCheckedChange={(checked) => handleToggleActive(plan.id, checked)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Popular</span>
                      <Switch
                        checked={plan.is_popular ?? false}
                        onCheckedChange={(checked) => handleTogglePopular(plan.id, checked)}
                      />
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
