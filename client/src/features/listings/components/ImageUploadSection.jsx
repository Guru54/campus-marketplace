import { motion, AnimatePresence } from "framer-motion";
import { Upload, X } from "lucide-react";

export const ImageUploadSection = ({ images, maxImages, addImages, removeImage, fileInputRef }) => {
  return (
    <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
      <h2 className="flex items-center gap-2 font-semibold">
        <Upload size={16} /> Photos ({images.length}/{maxImages})
      </h2>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addImages(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-white/15 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition text-white/60 text-sm"
      >
        Drag & drop or click to upload
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={(e) => addImages(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {images.map((img, i) => (
              <motion.div
                key={img.preview}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10"
              >
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-indigo-500/80 text-[10px] text-center py-0.5 font-bold uppercase tracking-wider text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white/80 hover:text-white transition"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};
