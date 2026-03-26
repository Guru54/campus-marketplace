import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

export const useImageUpload = (maxImages = 5) => {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  const addImages = (files) => {
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const valid = Array.from(files)
      .slice(0, remaining)
      .filter((f) => f.type.startsWith("image/"));

    if (valid.length < files.length) {
      toast.error("Only image files allowed");
    }

    setImages((prev) => [
      ...prev,
      ...valid.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(images[index].preview);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return { images, addImages, removeImage, fileInputRef, setImages };
};
