import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from "./ui/Header";
import backgroundImage from './Login_Sign/photo.jpeg';
import LoginPage from './Login_Sign/LoginPage';
import SignUpPage from './Login_Sign/SignUpPage';
import ForgotPassword from './Login_Sign/Forgot_Pass';
import Diva from './Photos/Diva.jpg';
import kalkiImage from './Photos/Kalki.jpg';
import Ajay from './Photos/Ajay.jpg';
import Rawin from './Photos/Rawin.jpg';
import Haritha from './Photos/Haritha.jpg';
import Mithun from './Photos/Mithun.jpg';
import Ullas from './Photos/Ullas.jpg';
import Praba from './Photos/Praba.jpg';
import Mouli from './Photos/Mouli.jpg';
import Subramani from './Photos/Subramani.jpg';
import Bhuvanesh from './Photos/Bhuvanesh.jpg';
import Nithin from './Photos/Nithin.jpg';
import Sakthi from './Photos/Sakthi.jpg';
import Salidh from './Photos/Salidh.jpg';
import Sir from './Photos/Sir.jpg';
import Mam from './Photos/Mam.jpeg';
import Kamalesh from './Photos/Kamalesh.jpg';
import Sindhu from './Photos/Sindhu.jpg';
import Zoho from './Photos/Zoho.png';
import Spiro from './Photos/Spiro.jpeg';
import Poorvika from './Photos/Poorvika.png';
import Acer from './Photos/Acer.png';
import Cognizant from './Photos/Cognizant.png';
import Ibm from './Photos/Ibm.png';
import Indian from './Photos/Indian.png';
import Lic from './Photos/Lic.png';
import Ananya from './Photos/Ananya.jpg';
import abinesh from './Photos/abinesh.jpeg';
import vijayashree from './Photos/vijayashree.jpeg'
import aravinth from './Photos/aravinth.jpeg'
// --- Data for different sections ---

const featuredAlumni = [
  { name: "Abinesh R ", dept: "IT", year: 2025, role: "Software Engineer ,Amazon", achievement: "SDE Intern at Amazon.", imageUrl: abinesh },
  { name: "Vijayashree Sridhar", dept: "IT", year: 2023, role: "Member of Technical Staff, Adobe", achievement: "Product Intern at Adobe", imageUrl: vijayashree },
  { name: "Aravinth A", dept: "IT", year: 2026, role: "SDET ,DE Shaw", achievement: "SDET Intern at DE Shaw", imageUrl: aravinth },
];

type AlumniDept = 'CSE' | 'IT' | 'ECE';

const allAlumni: Record<AlumniDept, { name: string; year: number; role: string; achievement: string; imageUrl: string; }[]> = {
    CSE: [ { name: "Arjun Nair", year: 2020, role: "Sr. Software Engineer, Google", achievement: "Led Google Pay India features.", imageUrl: "https://placehold.co/150x150/1A1A2E/A78BFA?text=AN" } ],
    IT: [ { name: "Priya Menon", year: 2019, role: "Product Manager, Microsoft", achievement: "Launched Azure AI services.", imageUrl: "https://placehold.co/150x150/1A1A2E/A78BFA?text=PM" } ],
    ECE: [ { name: "Rahul Krishnan", year: 2021, role: "Founder, TechVenture", achievement: "Built IoT platform for 10M+ devices.", imageUrl: "https://placehold.co/150x150/1A1A2E/A78BFA?text=RK" } ],
};

const achievements = [
  { year: "2024", title: "Best Technical Club Award", description: "Recognized for outstanding contribution to student development." },
  { year: "2023", title: "National Coding Championship", description: "Secured 2nd position in a prestigious inter-college competition." },
  { year: "2022", title: "Industry Partnership Milestone", description: "Established partnerships with over 15 leading tech companies." },
];

const clubMembers = [
    { name: "Rawin S", role: "Chairperson", dept: "IT", email: "shanmugamrawin82@gmail.com", imageUrl:Rawin },
    { name: "Nithin G", role: "Vice Chairperson", dept: "RPT", email: "nithingancsan004@gmail.com", imageUrl: Nithin },
    { name: "Subramanian K", role: "Club Ambassador", dept: "IT", email: "subukarthi29@gmail.com", imageUrl: Subramani },
    { name: "Bhuvanesh P S", role: "General Secretary-Operations", dept: "PT", email: "psbhuvanesh2005@gmail.com", imageUrl:Bhuvanesh},
    { name: "Kamalesh S", role: "General Secretary-Administration", dept: "PT", email: "kamalesh135@gmail.com", imageUrl: Kamalesh },
    { name: "Praba Sree C", role: "Joint Secretary", dept: "RPT", email: "prabasreechellappa@gmail,com", imageUrl: Praba },
    { name: "Haritha K", role: "Executive Director", dept: "IT", email: "harithakandasamy4@gmail.com", imageUrl: Haritha },
    { name: "Ananya V", role: "Executive board member", dept: "IT", email: "ananyavenkat23@gmail.com", imageUrl: Ananya },
    { name: "Mithun Sabari V", role: "Chief Technical Officer", dept: "CT", email: "mithunoffO8@gmail.com", imageUrl: Mithun },
    { name: "Ullas A U", role: "Treasurer", dept: "IT", email: "ullasullas2187@gmail.com", imageUrl: Ullas },
    { name: "Divakar S", role: "Head of Web Development", dept: "IT", email: "divakardivakar30057@gmail.com", imageUrl: Diva },
    { name: "Sathivikash S", role: "Director of Events and Planning", dept: "AE", email: "sakthivikash70@gmail.com", imageUrl: Sakthi },
    { name: "Kalkidharan KS", role: "Head of Public Relations (PR)", dept: "IT", email: "kskalkidharan@gmail.com", imageUrl: kalkiImage },
    { name: "Mouli S", role: "Head of Social Media and Digital Engagement", dept: "PT", email: "senthilmouli1978@gmail.com", imageUrl: Mouli },
    { name: "Ajay R", role: "Guest Relation Officer", dept: "IT", email: "ajayravi250@gmail.com", imageUrl: Ajay },
    { name: "Sindhu J", role: "Creative Director-Design & Visual Media", dept: "IT", email: "sindhu30sindhu30@gmail.com", imageUrl: Sindhu },
    { name: "Mohamed Salih M", role: "Logistic and Operations", dept: "CT", email: "mdsalih.m2005@gmail.com", imageUrl: Salidh },
];

const faculty = [
    { name: "Dr. B. Thanasekhar ", qualification: "Professor & Head, KCC", specialization: "", email: "", imageUrl: Sir },
    { name: "Ms. D. Piratheba ", qualification: "Staff Advisor, CSMIT ", specialization: "", email: "", imageUrl: Mam },
];

const sponsors = [
  { name: 'Zoho', logoUrl: Zoho },
  { name: 'Spiro', logoUrl: Spiro },
  { name: 'Poorvika', logoUrl: Poorvika },
  { name: 'Acer', logoUrl: Acer },
  { name: 'Cognizant', logoUrl: Cognizant },
  { name: 'IBM', logoUrl: Ibm },
  { name: 'Indian', logoUrl: Indian },
  { name: 'LIC', logoUrl: Lic}
];

export default function HomePage() {
  const [activeAlumniTab, setActiveAlumniTab] = useState<AlumniDept>('CSE');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    const handleLoad = () => window.scrollTo(0, 0);
    window.addEventListener('load', handleLoad);

    return () => window.removeEventListener('load', handleLoad);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const handleSwitchToSignUp = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignUpModalOpen(false);
    setIsForgotPasswordModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleSwitchToForgotPassword = () => {
    setIsLoginModalOpen(false);
    setIsForgotPasswordModalOpen(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
        
        .glow-button:hover { box-shadow: 0 0 15px 2px rgba(167, 139, 250, 0.6); }

        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    
      <div 
        className="relative min-h-screen font-sans text-gray-200 overflow-x-hidden" // Removed bg-cover bg-center bg-fixed and backgroundImage from here
        style={{
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed" // Added background styles here
          style={{
            backgroundImage: `url(${backgroundImage})`
          }}
        ></div>

        {/* Overlay Layer */}
        <div className="absolute inset-0 bg-black/70 z-0"></div>

        <Header setIsLoginModalOpen={setIsLoginModalOpen} setIsSignUpModalOpen={setIsSignUpModalOpen}  />


        <main className="relative z-10 pt-16">
            <section id="home" className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative pt-20">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">CSMIT – Computer Society of MIT</h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl">Fostering innovation and technical excellence through collaboration and hands-on learning.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#about" className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg glow-button">Explore More</a>
                  <a href="#events" className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:scale-105 transition-transform duration-300 shadow-lg">Learn More</a>
              </div>
            </section>

            <section id="featured-alumni" className="py-20 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12 text-white">Featured Alumni Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {featuredAlumni.map(alumnus => (
                        <div key={alumnus.name} className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 p-6 rounded-lg transform transition-transform hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20">
                            <img src={alumnus.imageUrl} alt={alumnus.name} className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-purple-400"/>
                            <h3 className="text-xl font-bold text-white text-center">{alumnus.name}</h3>
                            <p className="text-purple-400 text-center text-sm mb-2">{alumnus.dept} ({alumnus.year})</p>
                            <p className="text-gray-300 text-center font-semibold">{alumnus.role}</p>
                            <p className="text-gray-400 text-center mt-2 text-sm">"{alumnus.achievement}"</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center bg-gray-900/70 backdrop-blur-md border border-purple-500/30 p-8 rounded-lg">
                    <h2 className="text-3xl font-bold mb-6 text-white">About CSMIT</h2>
                    <p className="text-lg text-gray-300 mb-8">The Computer Society of MIT (CSMIT), founded in 1983 at Madras Institute of Technology, Anna University, began as a computer club
                      teaching basic programming and hardware tools. With the rise of Computer Science and IT departments, it grew into an inclusive platform for students across streams, fostering coding, technical skills, and industry readiness. Today, CSMIT actively organizes national-level symposiums, training, and placement preparation, transforming students into skilled technocrats.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        <div className="bg-gray-800/80 p-6 rounded-lg">
                            <h3 className="text-xl font-bold text-purple-400 mb-2">Our Mission</h3>
                            <p>To cultivate technical excellence, innovation, and collaborative learning by empowering students with
                               the skills and mindset to thrive in the ever-evolving tech landscape.</p>
                        </div>
                        <div className="bg-gray-800/80 p-6 rounded-lg">
                            <h3 className="text-xl font-bold text-purple-400 mb-2">Our Vision</h3>
                            <p>To be the leading society shaping the next generation of tech innovators.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="faculty" className="py-20 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12 text-white">Faculty Advisors</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {faculty.map(person => (
                        <div key={person.name} className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 p-6 rounded-lg text-center transition-all duration-300 hover:border-purple-400">
                            <img src={person.imageUrl} alt={person.name} className="w-24 h-24 rounded-full mx-auto mb-4"/>
                            <h3 className="text-xl font-bold text-white">{person.name}</h3>
                            <p className="text-purple-400">{person.qualification}</p>
                            <p className="text-gray-400 text-sm">{person.specialization}</p>
                            <a href={`mailto:${person.email}`} className="text-sm text-gray-500 hover:text-purple-400 transition">{person.email}</a>
                        </div>
                    ))}
                </div>
            </section>

            <section id="members" className="py-20 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12 text-white">Office Bearers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                    {clubMembers.map(member => (
                        <div key={member.name} className="bg-gray-900/70 backdrop-blur-md border border-purple-500/30 p-6 rounded-lg text-center transition-all duration-300 hover:border-purple-400">
                            <img src={member.imageUrl} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4"/>
                            <h3 className="text-xl font-bold text-white">{member.name}</h3>
                            <p className="text-purple-400">{member.role}</p>
                            <p className="text-gray-400 text-sm">{member.dept}</p>
                            <a href={`mailto:${member.email}`} className="text-sm text-gray-500 hover:text-purple-400 transition">{member.email}</a>
                        </div>
                    ))}
                </div>
            </section>

            <section id="achievements" className="py-20 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-16 text-white">Our Journey of Excellence</h2>
                <div className="relative max-w-4xl mx-auto">
                    <div className="absolute left-1/2 w-0.5 bg-purple-500/50 h-full -translate-x-1/2"></div>
                    {achievements.map((a, i) => (
                        <div key={i} className={`flex items-center w-full mb-8 ${i % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
                            <div className="w-1/2"></div>
                            <div className="w-1/2 px-4">
                                <div className="bg-gray-900/70 backdrop-blur-md p-6 rounded-lg relative border border-purple-500/30">
                                    <div className={`absolute top-1/2 w-4 h-4 bg-purple-500 rounded-full -translate-y-1/2 border-4 border-gray-900 ${i % 2 !== 0 ? '-right-2 translate-x-1/2' : '-left-2 -translate-x-1/2'}`}></div>
                                    <p className="text-purple-400 font-bold text-lg">{a.year}</p>
                                    <h3 className="text-xl font-semibold text-white mt-1">{a.title}</h3>
                                    <p className="text-gray-300 mt-2 text-sm">{a.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="events" className="py-20 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12 text-white">Tech Fests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    <div className="bg-gray-900/70 backdrop-blur-md border border-gray-700 p-8 rounded-lg">
                        <h3 className="text-2xl font-bold text-white mb-3">ENIGMA</h3>
                        <p className="text-gray-300 mb-4">A premier technical symposium featuring cutting-edge competitions in AI, ML, and emerging technologies.</p>
                        <Link to="/events" className="px-5 py-2 border border-purple-400 text-purple-400 text-sm font-semibold rounded-lg hover:bg-purple-400 hover:text-black transition">View Events</Link>
                    </div>
                    <div className="bg-gray-900/70 backdrop-blur-md border border-gray-700 p-8 rounded-lg">
                        <h3 className="text-2xl font-bold text-white mb-3">CARTE BLANCHE</h3>
                        <p className="text-gray-300 mb-4">An innovation fest celebrating creativity in technology with workshops, seminars, and competitions.</p>
                        <Link to="/events" className="px-5 py-2 border border-purple-400 text-purple-400 text-sm font-semibold rounded-lg hover:bg-purple-400 hover:text-black transition">View Events</Link>
                    </div>
                </div>
            </section>

            <section id="alumni" className="py-20 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12 text-white">Alumni Achievements</h2>
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-center border-b border-gray-700 mb-8">
                        {(Object.keys(allAlumni) as AlumniDept[]).map((dept: AlumniDept) => (
                            <button
                                key={dept}
                                onClick={() => setActiveAlumniTab(dept)}
                                className={`px-6 py-3 text-sm font-medium transition ${activeAlumniTab === dept ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>
                    <div>
                        {allAlumni[activeAlumniTab].map(alumnus => (
                        <div key={alumnus.name} className="bg-gray-900/70 backdrop-blur-md p-4 rounded-lg mb-4 flex items-center border border-purple-500/30">
                                <img src={alumnus.imageUrl} alt={alumnus.name} className="w-16 h-16 rounded-full mr-4"/>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{alumnus.name} ({alumnus.year})</h3>
                                    <p className="text-purple-400 text-sm">{alumnus.role}</p>
                                    <p className="text-gray-300 text-sm mt-1">{alumnus.achievement}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="sponsors" className="py-20">
                <h2 className="text-3xl font-bold text-center mb-12 text-white">Our Valued Sponsors</h2>
                <div className="relative w-full overflow-hidden">
                    <div className="flex animate-marquee">
                        {[...sponsors, ...sponsors].map((sponsor, index) => (
                            <div key={index} className="flex-shrink-0 w-48 mx-6 flex items-center justify-center">
                                <img 
                                    src={sponsor.logoUrl} 
                                    alt={sponsor.name} 
                                    className="h-12 object-contain transition-all duration-300"
                                    />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </main>

        <footer className="py-16 px-6 sm:px-12 bg-black/50 backdrop-blur-md border-t border-purple-500/20 text-gray-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 max-w-7xl mx-auto text-center md:text-left">
                <div>
                    <h3 className="text-lg font-bold mb-4 text-white">CSMIT</h3>
                    <p className="text-sm">Fostering the next generation of technologists through innovation and collaboration.</p>
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-4 text-white">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#about" className="hover:text-purple-400 transition">About</a></li>
                        <li><a href="#alumni" className="hover:text-purple-400 transition">Alumni</a></li>
                        <li><a href="#events" className="hover:text-purple-400 transition">Events</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-4 text-white">Contact</h3>
                    <p className="text-sm">Email: <a href="mailto:chairmancsmit@mitindia.edu" className="hover:text-purple-400 transition">chairmancsmit@mitindia.edu</a></p>
                    <p className='text-sm'>Phone: <a href="tel:+91 6374521646" className="hover:text-purple-400 transition">+91 63745 21646</a></p>
                    <p className="text-sm">Address: MIT Campus, Chromepet, Chennai</p>
                </div>
            </div>
            <p className="text-xs text-center border-t border-purple-500/20 pt-8 mt-8">© {new Date().getFullYear()} CSMIT - Computer Society of MIT. All Rights Reserved.</p>
        </footer>

        <LoginPage 
            isOpen={isLoginModalOpen} 
            onClose={() => setIsLoginModalOpen(false)} 
            onSwitchToSignUp={handleSwitchToSignUp} 
            onSwitchToForgotPassword={handleSwitchToForgotPassword} 
        />
        <SignUpPage 
            isOpen={isSignUpModalOpen} 
            onClose={() => setIsSignUpModalOpen(false)} 
            onSwitchToLogin={handleSwitchToLogin} 
        />
        <ForgotPassword 
            isOpen={isForgotPasswordModalOpen} 
            onClose={() => setIsForgotPasswordModalOpen(false)} 
            onSwitchToLogin={handleSwitchToLogin} 
        />
      </div>
    </>
  );
}