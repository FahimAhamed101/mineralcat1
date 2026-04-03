import SupportForm from "../components/contact-us/SupportForm";
import Contact from "../components/contact-us/Contact";

export default function Page() {
  return (
    <div>
      <div className="bg-linear-to-r from-[#A52B1A] to-[#EF5634] flex justify-center py-10">
        <h1 className="font-bold text-[28px] md:text-[48px] text-white">
          Need support ?
        </h1>
      </div>
      <SupportForm />
      <Contact />
    </div>
  );
}
