import MuscleStrengthSection from "./MuscleStrengthSection";
import ReflexesSection from "./ReflexesSection";

export default function ClinicalExaminationSection() {
  return (
    <section className="overflow-hidden rounded-xl border border-[#d4e2ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      {/* SECTION HEADER */}
      <div className="border-b border-[#dce7f2] px-5 py-3 sm:px-7">
        <h2 className="m-0 text-[18px] font-bold text-[#173b69]">
          Clinical Examination
        </h2>
      </div>

      {/* REFLEXES & MUSCLE STRENGTH */}
      <div className="grid grid-cols-1 items-stretch gap-5 px-5 py-5 sm:px-7 xl:grid-cols-2">
        <ReflexesSection />
        <MuscleStrengthSection />
      </div>
    </section>
  );
}
