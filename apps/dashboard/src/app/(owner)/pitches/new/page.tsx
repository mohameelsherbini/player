"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { IconUpload, IconMapPin, IconCurrencyDollar, IconInfoCircle } from "@tabler/icons-react";

export default function AddPitchPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("يجب تسجيل الدخول");

      // 1. Upload Image to Storage if exists
      let imageUrl = null;
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${userData.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pitch-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('pitch-images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrlData.publicUrl;
      }

      // 2. Insert Pitch into Database
      const { data: pitchData, error: pitchError } = await supabase
        .from('pitches')
        .insert({
          owner_id: userData.user.id,
          name,
          description,
          location_text: locationText,
          price_per_hour: parseFloat(pricePerHour),
          status: 'active',
          // Note: coordinates would require map integration, keeping it simple for MVP
        })
        .select()
        .single();

      if (pitchError) throw pitchError;

      // 3. Insert Image Record if we uploaded one
      if (imageUrl && pitchData) {
        await supabase.from('pitch_images').insert({
          pitch_id: pitchData.id,
          image_url: imageUrl,
          is_primary: true
        });
      }

      alert("تم إضافة الملعب بنجاح!");
      router.push("/dashboard");

    } catch (error: any) {
      alert("حدث خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">إضافة ملعب جديد</h1>
        <p className="text-slate-400">قم بإدخال بيانات ملعبك لتنشره على منصة يلا حجز</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur border border-slate-800 p-8 rounded-3xl space-y-6">
        
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <IconInfoCircle size={18} className="text-emerald-400" />
            اسم الملعب
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-200 outline-none transition"
            placeholder="مثال: ملعب الأبطال الخماسي"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">وصف الملعب</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-200 outline-none transition resize-none"
            placeholder="اكتب وصفاً جذاباً لملعبك..."
          />
        </div>

        {/* Location & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <IconMapPin size={18} className="text-emerald-400" />
              العنوان التفصيلي
            </label>
            <input
              type="text"
              required
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-200 outline-none transition"
              placeholder="مثال: القاهرة، مدينة نصر، شارع 10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <IconCurrencyDollar size={18} className="text-emerald-400" />
              سعر الساعة (جنيه)
            </label>
            <input
              type="number"
              required
              min="0"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-200 outline-none transition"
              placeholder="250"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <IconUpload size={18} className="text-emerald-400" />
            صورة الملعب الرئيسية
          </label>
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:bg-slate-800/50 transition cursor-pointer relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {image ? (
              <p className="text-emerald-400 font-bold">{image.name}</p>
            ) : (
              <div className="space-y-2">
                <IconUpload size={32} className="mx-auto text-slate-500" />
                <p className="text-slate-400">اضغط لرفع صورة أو قم بسحبها وإفلاتها هنا</p>
                <p className="text-xs text-slate-500">PNG, JPG حتى 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-4 px-4 rounded-xl transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? "جاري الحفظ والرفع..." : "إضافة الملعب ونشره"}
          </button>
        </div>

      </form>
    </div>
  );
}
