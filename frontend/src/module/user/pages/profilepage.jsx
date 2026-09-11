import React from "react";
import {
    HeartPulse,
    FileText,
    User,
    Globe,
    Plus,
    ChevronDown,
    CalendarDays,
    Pencil,
    Camera,
    Star,
    Shield,
    Search,
    Heart,
    Pill,
    Bell,
    Droplet,
    Activity,
    Syringe,
    BookOpen,
    MapPin,
    Phone,
    Mail,
    AlertCircle,
} from "lucide-react";

const ProfilePage = () => {
    return (
        <div className="min-h-screen bg-[#F5FAF8] text-[#183B56]">

            {/* ================= NAVBAR ================= */}
            <nav className="h-20 bg-white border-b border-[#E1ECE8] flex items-center justify-between px-6 lg:px-10">

                {/* LOGO */}
                <div className="flex items-center gap-3">
                    <div className=" translate-x-5 w-12 h-12 rounded-full bg-[#DDF3EC] flex items-center justify-center">
                        <HeartPulse className="  w-7 h-7 text-[#2F8F83]" />
                    </div>

                    <div className="translate-x-8">
                        <h1 className="text-xl font-bold text-[#12304A]">
                            MedVault
                        </h1>
                        <p className="text-[10px] tracking-widest text-[#71928E] font-semibold">
                            HEALTH PORTAL
                        </p>
                    </div>
                </div>

                {/* NAVIGATION */}
                <div className="hidden md:flex items-center gap-8">

                    <NavButton icon={<HeartPulse size={18} />} text="ABHA" />



                    <NavButton icon={<FileText size={18} />} text="Documents" />

                    <NavButton
                        icon={<User size={18} />}
                        text="Basic Info"
                    />
                    <div className="relative group">
                        <button
                            className="
      inline-flex items-center justify-center
      gap-2
      h-5
      min-w-36

      px-5
      rounded-full
      bg-[#F1F7F5]
      text-[#315E67]
      font-medium
      whitespace-nowrap
      transition-all duration-200
      hover:bg-[#2F8F83]
      hover:text-white
    "
                        >
                            <Globe size={18} className="shrink-0" />

                            <span>English</span>

                            <ChevronDown
                                size={15}
                                className="shrink-0 transition-transform duration-200
                 group-hover:rotate-180"
                            />
                        </button>

                        {/* Dropdown */}
                        <div
                            className="
      absolute right-0 top-full mt-2
      w-36
      bg-white
      border border-[#DCEAE6]
      rounded-2xl
      shadow-lg
      p-2
      opacity-0 invisible
      translate-y-1
      group-hover:opacity-100
      group-hover:visible
      group-hover:translate-y-0
      transition-all duration-200
      z-50
    "
                        >
                            <button className="w-full text-left px-3 py-2 rounded-xl
                       text-[#315E67] hover:bg-[#2F8F83] hover:text-white">
                                English
                            </button>

                            <button className="w-full text-left px-3 py-2 rounded-xl
                       text-[#315E67] hover:bg-[#2F8F83] hover:text-white">
                                हिंदी
                            </button>

                            <button className="w-full text-left px-3 py-2 rounded-xl
                       text-[#315E67] hover:bg-[#2F8F83] hover:text-white">
                                ਪੰਜਾਬੀ
                            </button>
                        </div>
                    </div>
                </div>
                {/* RIGHT */}
                <div className=" -translate-x-5 flex items-center gap-3">
                    {/* NOTIFICATION */}
                    <button
                        className="
      relative
      w-11 h-11
      rounded-full
      bg-[#E4F5EF]
      text-[#2F8F83]
      flex items-center justify-center
      transition
      -translate-x-6
       hover:bg-[#2F8F83]
        hover:text-white
     
    "
                    >
                        <Bell size={21} />

                        {/* Notification dot */}
                        <span
                            className="
        absolute
        top-2
        right-2
        w-2.5
        h-2.5
        rounded-full
        bg-[#E05A68]
        border-2
        border-white
      "
                        />
                    </button>
                    <div className="-translate-x-3 flex items-center gap-3 cursor-pointer">

                        <div className="w-11 h-11 rounded-full bg-[#4CA77D] text-white flex items-center justify-center font-semibold">
                            AC
                        </div>

                        <div className="  hidden sm:block">
                            <p className="font-semibold text-[#183B56]">
                                Aanchal.chaudhary
                            </p>
                        </div>

                        <ChevronDown size={17} className="text-[#607D82]" />

                    </div>

                </div>
            </nav>


            {/* ================= MAIN ================= */}
            <main className="px-5 lg:px-10 py-8">

                {/* HEADING */}
                <div className=" flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-7">

                    <div>
                        <p className=" translate-x-6 text-sm font-semibold tracking-wider text-[#4B927F] uppercase">
                            My Health Dashboard
                        </p>

                        <h2 className=" translate-x-6 text-4xl font-bold text-[#12304A] mt-2">
                            Welcome back, Aanchal.Chaudhary
                            <span className="ml-2">👋</span>
                        </h2>
                    </div>


                    {/* DATE */}
                    <div className=" min-w-50 -translate-x-5 flex items-center gap-3  rounded-full px-5 py-3 ">

                        <CalendarDays size={20} className="text-[#438D81]" />

                        <div className="text-sm">
                            <span className="font-semibold">
                                Thursday, 11 September 2026
                            </span>

                            <span className="text-[#82999B] ml-2">
                                • Last synced 3 min ago
                            </span>
                        </div>

                    </div>

                </div>


                {/* ================= GRID ================= */}
                <div className=" grid grid-cols-1 xl:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)] gap-5">


                    {/* ================= PROFILE CARD ================= */}
                    <section className=" translate-x-2  translate-y-4 bg-white rounded-2xl border border-[#DCEAE6]  overflow-hidden">

                        {/* CARD HEADER */}
                        <div className="px-7 py-5 border-b border-[#E4ECEA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                            <div>
                                <p className=" translate-x-6 text-xs font-semibold tracking-widest text-[#61988E] uppercase">
                                    Patient Profile
                                </p>

                                <h3 className=" translate-x-6 text-2xl font-bold text-[#12304A] mt-1">
                                    Aanchal.Chaudhary
                                </h3>
                            </div>


                            <div className=" -translate-x-5 flex items-center gap-8">

                                {/* ACTIVE */}
                                <span className="-translate-x-8 w-30 flex items-center gap-2 bg-[#E2F6EE] text-[#32816D] px-4 py-2 rounded-full text-sm font-semibold">
                                    <span className=" translate-x-1 w-2.5 h-2.5 rounded-full bg-[#4DBE8D]" />
                                    Active Patient
                                </span>


                                {/* EDIT */}
                                <button className="-translate-x-4 w-30 flex items-center gap-2  bg-[#F1F7F5] hover:bg-[#E2F6EE] text-black px-5 py-2.5 rounded-full text-sm font-semibold transition">
                                    <Pencil size={16} />
                                    Edit Profile
                                </button>

                            </div>

                        </div>


                        {/* PROFILE CONTENT */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)_260px] gap-6">

                            {/* ================= LEFT PROFILE ================= */}
                            <div>

                                {/* PHOTO */}
                                <div className=" translate-x-12 translate-y-7 relative">

                                    <div className="h-52 w-full rounded-2xl bg-gradient-to-br from-[#DCEFEB] to-[#EDF5F4] border-8 border-[#EDF7F4] flex items-center justify-center overflow-hidden">

                                        <div className="w-32 h-32 rounded-full bg-[#277F88] flex items-center justify-center text-white text-4xl font-bold">
                                            AC
                                        </div>

                                    </div>

                                    {/* CAMERA */}
                                    <button className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#277F88] text-white border-4 border-white flex items-center justify-center">
                                        <Camera size={19} />
                                    </button>

                                </div>


                                {/* ================= ALLERGIES BELOW PHOTO ================= */}
                                <div className=" translate-x-12 translate-y-7  mt-5">

                                    <div className=" translate-y-3 translate-x-6 flex items-center gap-2 mb-3">
                                        <Star size={19} className="text-[#4B8C82]" />

                                        <h4 className="font-bold text-[#367C73] tracking-wide">
                                            KNOWN ALLERGIES
                                        </h4>
                                    </div>


                                    <div className=" translate-y-6  translate-x-6 flex flex-wrap gap-2">

                                        <div className="">
                                            <Tag
                                                text="Penicillin"
                                                bg="bg-[#FDE8EC]"
                                                color="text-[#D43C5B]"
                                                icon="♥"

                                            />
                                        </div>

                                        <Tag
                                            text="Aspirin"
                                            bg="bg-[#EFEAFF]"
                                            color="text-[#6850C7]"
                                            icon="✦"
                                        />

                                        <Tag
                                            text="Shellfish"
                                            bg="bg-[#FFF4D5]"
                                            color="text-[#C88C18]"
                                            icon="★"
                                        />

                                        <Tag
                                            text="Latex"
                                            bg="bg-[#E4F5EC]"
                                            color="text-[#42966F]"
                                            icon="✚"
                                        />

                                        <Tag
                                            text="Pollen"
                                            bg="bg-[#EAF1FF]"
                                            color="text-[#5278D0]"
                                            icon="⌁"
                                        />

                                        <Tag
                                            text="Dust"
                                            bg="bg-[#EEEFF5]"
                                            color="text-[#78809A]"
                                            icon="✦"
                                        />
                                    </div>
                                </div>
                                {/* ================= CHATBOT ================= */}
                                <div className="fixed right-6 bottom-6 z-50">
                                    <button
                                        className="
     
      w-[100px] h-[100px]
      flex items-center justify-center
      bg-transparent
      border-none
      cursor-pointer
      hover:scale-105
      transition-transform duration-300
    "
                                        style={{
                                            animation: "wiggle 1.5s ease-in-out infinite",
                                        }}
                                    >
                                        <img
                                            src="/chatbot.png"
                                            alt="AI Chatbot"
                                            className="w-full h-full object-contain"
                                        />
                                    </button>

                                    <style>
                                        {`
      @keyframes wiggle {
        0%, 100% {
          transform: translateX(0) rotate(0deg);
        }
        25% {
          transform: translateX(-2px) rotate(-2deg);
        }
        50% {
          transform: translateX(2px) rotate(2deg);
        }
        75% {
          transform: translateX(-2px) rotate(-2deg);
        }
      }
    `}
                                    </style>

                                </div>

                            </div>


                            {/* ================= MIDDLE INFORMATION ================= */}
                            <div className="w-140 translate-x-20 h-100 translate-y-6 border border-[#E2ECE9] rounded-[10px] p-5">

                                <p className=" translate-x-5 translate-y-2 text-sm font-bold tracking-wider text-[#4C8D82] uppercase mb-5">
                                    Patient Information
                                </p>


                                <div className=" translate-y-3 translate-x-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                                    <Detail
                                        title="Patient ID"
                                        value={
                                            <>
                                                ABHA-2847-
                                                <br />
                                                1923-4561
                                            </>
                                        }
                                    />

                                    <Detail
                                        title="Date of Birth"
                                        value="14 March 1988"
                                    />

                                    <Detail
                                        title="Gender"
                                        value="Male · 38 yrs"
                                    />

                                    <Detail
                                        title="Blood Type"
                                        value="O Positive"
                                    />

                                    <Detail
                                        title="Contact"
                                        value="+91 98765 43210"
                                        icon={<Phone size={15} />}
                                    />

                                    <Detail
                                        title="Email"
                                        value="arjun.ramesh@gmail.com"
                                        icon={<Mail size={15} />}
                                    />

                                    <Detail
                                        title="Address"
                                        value={
                                            <>
                                                Koramangala
                                                <br />
                                                Bengaluru, KA
                                            </>
                                        }
                                        icon={<MapPin size={15} />}
                                    />

                                    <Detail
                                        title="Emergency"
                                        value={
                                            <>
                                                Priya Ramesh · +91 98700
                                                <br />
                                                12345
                                            </>
                                        }
                                    />

                                    <Detail
                                        title="Insurance"
                                        value="Star Health · SH8847291"
                                    />

                                    <Detail
                                        title="Physician"
                                        value="Dr. Kavitha Menon"
                                    />

                                </div>
                            </div>
                        </div>

                    </section>


                    {/* ================= MEDICAL DICTIONARY ================= */}
                    <aside className=" -translate-x-2 translate-y-4  overflow-x-hidden bg-white rounded-3xl border border-[#DCEAE6] shadow-sm p-6 h-fit">

                        {/* HEADER */}
                        <div className="flex items-center gap-4 mb-5">

                            <div className=" translate-x-7 w-11 h-11 rounded-2xl bg-[#E7EEFF] flex items-center justify-center">
                                <BookOpen className="w-7 h-7 text-[#5274C9]" />
                            </div>

                            <div className="translate-x-7">
                                <h3 className="text-2xl font-bold text-[#12304A]">
                                    Medical Dictionary
                                </h3>

                                <p className="text-sm text-[#7C9297] mt-1">
                                    Understand your health terms
                                </p>
                            </div>

                        </div>


                        {/* SEARCH */}
                        {/* SEARCH */}
<div className="translate-x-1 relative mb-5">

    <Search
        size={20}
        className="absolute left-[100px] top-1/2 -translate-y-1/2 text-[#75929B] z-5"
    />

    <input
        type="text"
        placeholder="Search terms..."
        className="text-center w-114 h-14 pl-12 pr-4 rounded-2xl border border-[#D9E5E4] bg-[#FBFDFC] outline-none focus:border-[#65A99D] text-[#183B56]"
    />

</div>


                        {/* TERMS */}
<div className="translate-x-1 translate-y-3 mx-1">

    <DictionaryCard
        icon={<HeartPulse />}
        title="Hypertension"
        category="Cardiovascular"
        description="Persistently elevated blood pressure ≥130/80 mmHg in the arteries, increasing risk of heart..."
        bg="bg-[#FFF4F5]"
        iconBg="bg-[#F9D7DD]"
        iconColor="text-[#D94761]"
        categoryBg="bg-[#F9DDEA]"
        categoryColor="text-[#B45576]"
    />

    <DictionaryCard
        icon={<Pill />}
        title="Metformin"
        category="Pharmacology"
        description="First-line oral antidiabetic drug that lowers hepatic glucose output and improves..."
        bg="bg-[#F1FBF5]"
        iconBg="bg-[#D7F2E2]"
        iconColor="text-[#41A16F]"
        categoryBg="bg-[#DFF3E6]"
        categoryColor="text-[#4B8D6C]"
    />

    <DictionaryCard
        icon={<Droplet />}
        title="HbA1c"
        category="Diagnostics"
        description="Glycated hemoglobin test reflecting average blood glucose over the past 2–3 months..."
        bg="bg-[#F1F7FF]"
        iconBg="bg-[#D9E8FF]"
        iconColor="text-[#477DD4]"
        categoryBg="bg-[#DFEBFF]"
        categoryColor="text-[#527AC5]"
    />

    <DictionaryCard
        icon={<Pill />}
        title="Amlodipine"
        category="Pharmacology"
        description="Calcium channel blocker used for hypertension and angina. Relaxes blood ve..."
        bg="bg-[#F7F1FF]"
        iconBg="bg-[#E5D8FF]"
        iconColor="text-[#7655CE]"
        categoryBg="bg-[#EADFFF]"
        categoryColor="text-[#755BB9]"
    />

    <DictionaryCard
        icon={<Activity />}
        title="oGER"
        category="Nephrology"
        description="A medical term related to kidney health and renal function..."
        bg="bg-[#F1FBF7]"
        iconBg="bg-[#D8F1E8]"
        iconColor="text-[#439579]"
        categoryBg="bg-[#DDF2EA]"
        categoryColor="text-[#4A8D78]"
    />

</div>

                    </aside>

                </div>

            </main>

        </div>
    );
};


/* =========================================================
   REUSABLE COMPONENTS
========================================================= */


const NavButton = ({ icon, text, active = false }) => (
    <button
        className={`
      inline-flex items-center justify-center
      min-w-35
      whitespace-nowrap shrink-0
      gap-2
      px-4 py-2.5
      rounded-full
      text-[15px] font-medium
      transition-all duration-200
      ${active
                ? "bg-[#2F8F83] text-white"
                : "bg-[#F1F7F5] text-[#315E67] hover:bg-[#2F8F83] hover:text-white"
            }
    `}
    >
        <span className="shrink-0 flex items-center">
            {icon}
        </span>

        <span className="leading-none">
            {text}
        </span>
    </button>
);


const InfoBadge = ({
    icon,
    title,
    value,
    bg,
    iconBg,
    iconColor,
}) => {
    return (
        <div
            className={`flex items-center justify-between rounded-2xl px-4 py-3 ${bg}`}
        >

            <div className="flex items-center gap-3">

                <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}
                >
                    {React.cloneElement(icon, { size: 19 })}
                </div>

                <span className="text-sm font-medium text-[#557177]">
                    {title}
                </span>

            </div>

            <span className="font-bold text-[#23475B]">
                {value}
            </span>

        </div>
    );
};


const Detail = ({ title, value, icon }) => {
    return (
        <div>

            <p className="text-xs font-semibold tracking-wider text-[#6B9190] uppercase mb-1.5">
                {title}
            </p>

            <div className="flex items-start gap-1.5 text-[#23475B] font-semibold leading-6">
                {icon && (
                    <span className="mt-1 text-[#5B928B]">
                        {icon}
                    </span>
                )}

                <span>{value}</span>
            </div>

        </div>
    );
};


const Tag = ({ text, bg, color, icon }) => {
    return (
        <span
            className={`
        inline-flex
        items-center
        justify-center
        gap-1.5
        px-3
        py-1.5
        w-fit
        rounded-full
        text-m
        font-semibold
        whitespace-nowrap
        shrink-0
        min-w-20
        ${bg}
        ${color}
      `}
        >
            <span className="shrink-0 leading-none">
                {icon}
            </span>

            <span className="whitespace-nowrap leading-none">
                {text}
            </span>
        </span>
    );
};

const DictionaryCard = ({
    icon,
    title,
    category,
    description,
    bg,
    iconBg,
    iconColor,
    categoryBg,
    categoryColor,
}) => {
    return (
        <div
            className={`rounded-2xl p-4 mb-3 border border-[#E3ECEA] ${bg}`}
        >

            <div className="flex items-start gap-3">

                <div
                    className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}
                >
                    {React.cloneElement(icon, { size: 22 })}
                </div>


                <div className="flex-1 min-w-0">

                    <div className="flex items-center justify-between gap-2">

                        <h4 className="font-bold text-[#23445A]">
                            {title}
                        </h4>

                        <ChevronDown
                            size={17}
                            className="text-[#617F88] -rotate-90"
                        />

                    </div>


                    <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold mt-1 ${categoryBg} ${categoryColor}`}
                    >
                        {category}
                    </span>


                    <p className="text-xs leading-5 text-[#789097] mt-2">
                        {description}
                    </p>

                </div>

            </div>

        </div>
    );
};

export default ProfilePage;