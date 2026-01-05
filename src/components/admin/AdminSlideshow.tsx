import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Upload, Trash2, GripVertical, ImageIcon } from "lucide-react";

interface Slide {
  id: string;
  image_url: string;
  tagline: string | null;
  order_index: number | null;
  active: boolean | null;
  created_at: string;
}

export function AdminSlideshow() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [tagline, setTagline] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: slides, isLoading } = useQuery({
    queryKey: ["slideshow"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slideshow")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Slide[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, tagline }: { file: File; tagline: string }) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `slideshow-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      const maxOrder = slides?.reduce((max, s) => Math.max(max, s.order_index || 0), 0) || 0;

      const { error: insertError } = await supabase
        .from("slideshow")
        .insert({
          image_url: publicUrl,
          tagline: tagline || null,
          order_index: maxOrder + 1,
          active: true,
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slideshow"] });
      setSelectedFile(null);
      setPreviewUrl("");
      setTagline("");
      toast.success("Slide uploaded successfully");
    },
    onError: (error) => {
      toast.error("Failed to upload slide");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, tagline, active }: { id: string; tagline?: string; active?: boolean }) => {
      const updates: Record<string, unknown> = {};
      if (tagline !== undefined) updates.tagline = tagline;
      if (active !== undefined) updates.active = active;

      const { error } = await supabase
        .from("slideshow")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slideshow"] });
      toast.success("Slide updated");
    },
    onError: () => {
      toast.error("Failed to update slide");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (slide: Slide) => {
      // Extract filename from URL
      const urlParts = slide.image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      await supabase.storage.from("gallery").remove([fileName]);

      // Delete from database
      const { error } = await supabase
        .from("slideshow")
        .delete()
        .eq("id", slide.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slideshow"] });
      toast.success("Slide deleted");
    },
    onError: () => {
      toast.error("Failed to delete slide");
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    await uploadMutation.mutateAsync({ file: selectedFile, tagline });
    setUploading(false);
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading slideshow...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif text-foreground mb-2">Slideshow Management</h1>
        <p className="text-muted-foreground">
          Manage the hero slideshow images displayed at the top of the website. Upload 3-4 images for best results.
        </p>
      </div>

      {/* Upload Section */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-6">
          <h3 className="font-medium text-foreground mb-4">Add New Slide</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="slideImage">Select Image from Device</Label>
                <Input
                  id="slideImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline (Optional)</Label>
                <Input
                  id="tagline"
                  placeholder="e.g., Precision. Focus. Class."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Slide"}
              </Button>
            </div>
            <div className="flex items-center justify-center bg-muted/30 rounded-sm min-h-[200px]">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-[200px] object-contain rounded-sm"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Image preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Slides */}
      <div>
        <h3 className="font-medium text-foreground mb-4">
          Current Slides ({slides?.filter(s => s.active).length || 0} active)
        </h3>
        {slides && slides.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {slides.map((slide, index) => (
              <Card key={slide.id} className={`border-border/50 ${!slide.active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="relative aspect-video mb-3 overflow-hidden rounded-sm bg-muted">
                    <img
                      src={slide.image_url}
                      alt={slide.tagline || `Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Enter tagline..."
                      defaultValue={slide.tagline || ""}
                      onBlur={(e) => {
                        if (e.target.value !== (slide.tagline || "")) {
                          updateMutation.mutate({ id: slide.id, tagline: e.target.value });
                        }
                      }}
                      className="text-sm"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={slide.active ?? true}
                          onCheckedChange={(checked) => {
                            updateMutation.mutate({ id: slide.id, active: checked });
                          }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {slide.active ? "Active" : "Hidden"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(slide)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 border-dashed">
            <CardContent className="p-8 text-center">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No slides uploaded yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Upload your first slide to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
