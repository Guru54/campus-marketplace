import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IndianRupee,
  FileText,
  Layers,
} from "lucide-react";
import { listingAPI } from "@/shared/services/api";
import { useImageUpload } from "@/features/listings/hooks/useImageUpload";
import { ImageUploadSection } from "@/features/listings/components/ImageUploadSection";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "BOOKS",       label: "📚 Books" },
  { value: "ELECTRONICS", label: "💻 Electronics" },
  { value: "FURNITURE",   label: "🪑 Furniture" },
  { value: "CYCLES",      label: "🚲 Cycles" },
  { value: "SPORTS",      label: "⚽ Sports" },
  { value: "CLOTHING",    label: "👗 Clothing" },
  { value: "NOTES",       label: "📝 Notes" },
  { value: "OTHERS",      label: "📦 Others" },
];

const CONDITIONS = [
  { value: "NEW",      label: "New",      desc: "Unused / sealed" },
  { value: "LIKE_NEW", label: "Like New", desc: "Used once or twice" },
  { value: "GOOD",     label: "Good",     desc: "Minor signs of use" },
  { value: "FAIR",     label: "Fair",     desc: "Noticeable wear" },
];

const MAX_IMAGES = 5;

const CreateListing = () => {
  const navigate = useNavigate();
  const { images, addImages, removeImage, fileInputRef } = useImageUpload(MAX_IMAGES);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    isNegotiable: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (form.title.trim().length < 3)
      errs.title = "Title must be at least 3 characters";
    if (form.title.length > 100)
      errs.title = "Title cannot exceed 100 characters";
    if (form.description.trim().length < 10)
      errs.description = "Description must be at least 10 characters";
    if (form.description.length > 1000)
      errs.description = "Description cannot exceed 1000 characters";
    if (form.price === "" || Number(form.price) < 0)
      errs.price = "Enter valid price";
    if (!form.category) errs.category = "Select category";
    if (!form.condition) errs.condition = "Select condition";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Fix the errors below");
      return;
    }

    try {
      setSubmitting(true);
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      images.forEach(({ file }) => fd.append("images", file));

      await listingAPI.create(fd);

      toast.success("Listing posted!");
      navigate("/my-listings");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen pt-24 pb-20 px-4 bg-gradient-to-b from-[#0f0c29] via-[#151134] to-[#0d0d0d] text-white">
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Post a Listing</h1>
          <p className="text-white/60 text-sm mt-1">Sell something on your campus</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ImageUploadSection images={images} maxImages={MAX_IMAGES} addImages={addImages} removeImage={removeImage} fileInputRef={fileInputRef} />

          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <FileText size={16} /> Details
            </h2>

            <input
              type="text"
              name="title"
              maxLength={100}
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="flex justify-between text-xs">
              <span className="text-red-400">{errors.title}</span>
              <span className="text-white/40">{form.title.length}/100</span>
            </div>

            <textarea
              name="description"
              maxLength={1000}
              rows={4}
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
            <div className="flex justify-between text-xs">
              <span className="text-red-400">{errors.description}</span>
              <span className="text-white/40">{form.description.length}/1000</span>
            </div>
          </section>

          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Layers size={16} /> Category & Condition
            </h2>

            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: value }))}
                    className={`rounded-xl py-3 text-xs border transition ${
                      form.category === value
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                        : "border-white/10 hover:border-indigo-500 text-white/70"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-400 text-xs mt-2">{errors.category}</p>}
            </div>

            <div>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, condition: value }))}
                    className={`rounded-xl px-4 py-3 text-sm border transition text-left ${
                      form.condition === value
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-white/10 hover:border-indigo-500"
                    }`}
                  >
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs text-white/40">{desc}</div>
                  </button>
                ))}
              </div>
              {errors.condition && <p className="text-red-400 text-xs mt-2">{errors.condition}</p>}
            </div>
          </section>

          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <IndianRupee size={16} /> Pricing
            </h2>

            <input
              type="number"
              name="price"
              min={0}
              value={form.price}
              onChange={handleChange}
              placeholder="Price (₹)"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {errors.price && <p className="text-red-400 text-xs">{errors.price}</p>}

            <div
              onClick={() => setForm((p) => ({ ...p, isNegotiable: !p.isNegotiable }))}
              className="flex items-center justify-between cursor-pointer group"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">Is Negotiable?</span>
                <span className="text-xs text-white/40">Are you willing to discuss the price?</span>
              </div>
              <div className={`w-11 h-6 rounded-full transition relative ${form.isNegotiable ? "bg-indigo-600 shadow-lg shadow-indigo-600/20" : "bg-white/20"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${form.isNegotiable ? "left-6" : "left-1"}`} />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-bold transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-white uppercase tracking-wider"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Posting...
              </span>
            ) : "Post Listing"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default CreateListing;