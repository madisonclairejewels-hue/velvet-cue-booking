import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Image, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useGallery, useCreateGalleryImage, useDeleteGalleryImage } from "@/hooks/useGallery";
import { supabase } from "@/integrations/supabase/client";

export function AdminGallery() {
  const { toast } = useToast();
  const { data: gallery, isLoading } = useGallery();
  const createGalleryImage = useCreateGalleryImage();
  const deleteGalleryImage = useDeleteGalleryImage();

  const [newCaption, setNewCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({ title: "Please select an image", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from("gallery")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(fileName);

      // Save to database
      await createGalleryImage.mutateAsync({
        image_url: urlData.publicUrl,
        caption: newCaption || null,
        order_index: gallery?.length || 0,
      });

      toast({ title: "Image uploaded successfully!" });
      setNewCaption("");
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string, imageUrl: string) => {
    try {
      // Extract filename from URL and delete from storage
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from("gallery").remove([fileName]);
      
      // Delete from database
      await deleteGalleryImage.mutateAsync(id);
      toast({ title: "Image deleted!" });
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-foreground mb-2 flex items-center gap-3">
          <Image className="h-8 w-8 text-primary" />
          Gallery Management
        </h1>
        <p className="text-muted-foreground">Upload and manage your club's gallery images.</p>
      </div>

      {/* Add New Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border/50 rounded-sm p-6"
      >
        <h2 className="text-lg font-medium text-foreground mb-4">Upload New Image</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="gallery-upload"
              />
              <label
                htmlFor="gallery-upload"
                className="flex items-center justify-center gap-2 w-full h-12 bg-muted/50 border border-border/50 rounded-sm cursor-pointer hover:bg-muted/70 transition-colors"
              >
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {fileInputRef.current?.files?.[0]?.name || "Choose image from device"}
                </span>
              </label>
            </div>
            <Input
              placeholder="Caption (optional)"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              className="bg-muted/50"
            />
          </div>
          <Button
            variant="premium"
            onClick={handleUploadImage}
            disabled={uploading || !fileInputRef.current?.files?.[0]}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>

          {/* Preview */}
          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-sm border border-border/50"
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Gallery Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border/50 rounded-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-foreground">
            Current Images ({gallery?.length || 0})
          </h2>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : !gallery?.length ? (
          <p className="text-muted-foreground py-8 text-center">No images in gallery yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative group aspect-square bg-muted/30 rounded-sm overflow-hidden"
              >
                <img
                  src={img.image_url}
                  alt={img.caption || "Gallery image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDeleteImage(img.id, img.image_url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Caption */}
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/90 to-transparent">
                    <p className="text-xs text-foreground truncate">{img.caption}</p>
                  </div>
                )}

                {/* Order badge */}
                <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded-sm">
                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
