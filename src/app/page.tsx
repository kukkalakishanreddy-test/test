import { ArrowRight, Check, MapPin, Menu, MessageCircle, ShieldCheck, CarFront, Plane, Route, ChevronRight, Palmtree } from "lucide-react";
import BookingForm from "@/components/BookingForm";

const tours = [
  {
    name: "Munnar Hill Escape",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Munnar%20hill%20station%20.JPG?width=1200",
    tag: "Mountain favourite",
    description: "Kochi → Munnar town → tea gardens → viewpoints → return or onward drop.",
    details: "100 km limit per day • Additional km: ₹17/km",
    price: "₹3,500"
  },
  {
    name: "Alleppey Backwaters",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=85",
    tag: "Easy day trip",
    description: "Kochi → Alleppey backwaters → beach or town stops → return to Kochi.",
    details: "100 km limit per day • Additional km: ₹17/km",
    price: "₹3,500"
  },
  {
    name: "Thekkady Nature Trail",
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1000&q=85",
    tag: "Nature & wildlife",
    description: "Kochi → hill-country drive → Thekkady / Kumily → local sightseeing → return or onward drop.",
    details: "100 km limit per day • Additional km: ₹17/km",
    price: "₹3,500"
  },
  {
    name: "Kochi City & Local Travel",
    image: "https://images.unsplash.com/photo-1590123732197-e87b4c6a3e1b?auto=format&fit=crop&w=1000&q=85",
    tag: "Kochi special rate",
    description: "Explore Fort Kochi → Mattancherry → Marine Drive → local city attractions.",
    details: "130 km limit per day • Additional km: ₹17/km",
    price: "₹2,500"
  }
];

const benefits = [
  { icon: CarFront, title: "Private, comfortable rides", body: "A dedicated car and driver for your family, group or business trip." },
  { icon: Route, title: "Flexible itineraries", body: "Choose popular routes or ask us to tailor a trip to your schedule." },
  { icon: ShieldCheck, title: "Clear trip details", body: "Confirm the kilometres, duration, inclusions and final price before travel." },
  { icon: MessageCircle, title: "Easy communication", body: "Discuss your pickup, luggage and itinerary directly with our team." }
];

export default function Home() {
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || "Kerala car rentals, vacation and holidays";
  return (
    <main>
      <header className="site-header">
        <div className="container nav">
          <a href="#home" className="brand" aria-label={`${businessName} home`}>
            <span className="brand-mark"><Palmtree size={30} /></span>
            <span>{businessName}<small>TOURS • TAXI • TRANSFERS</small></span>
          </a>
          <nav className="desktop-nav">
            <a href="#home">Home</a><a href="#packages">Tour Packages</a><a href="#services">Taxi Services</a><a href="#about">About Us</a><a href="#contact">Contact</a>
          </nav>
          <a className="btn btn-primary nav-cta" href="#booking"><MessageCircle size={17} /> Plan your journey</a>
          <a className="mobile-menu" href="#booking" aria-label="Send trip enquiry"><Menu size={24} /></a>
        </div>
      </header>

      <section className="hero hero-reference" id="home">
        <div className="hero-bg" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker">DISCOVER KERALA</span>
            <h1>Plan Your<br /><em>Journey</em></h1>
            <p>Explore the breathtaking beauty of Kerala with our customized tour packages and reliable taxi services.</p>
            <div className="hero-highlights">
              <div><CarFront size={23} /><span>Custom Tour<br />Packages</span></div>
              <div><ShieldCheck size={23} /><span>Comfortable<br />Vehicles</span></div>
              <div><Check size={23} /><span>Safe & Reliable<br />Travel</span></div>
              <div><MessageCircle size={23} /><span>24/7<br />Support</span></div>
            </div>
          </div>
          <div className="hero-enquiry" id="booking"><BookingForm /></div>
        </div>
      </section>

      <section className="section" id="packages">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">Made for your kind of travel</span><h2>Popular ways to<br />explore Kerala.</h2></div>
            <p>Explore Kerala routes and Kochi local travel. Daily kilometre allowances and fares vary by route.</p>
          </div>
          <div className="tour-grid">
            {tours.map((tour) => (
              <article className="tour-card card" key={tour.name}>
                <div className="tour-image">
                  {/* Remote image URLs are intentionally used for this starter; replace with licensed business photos before launch. */}
                  <img src={tour.image} alt={tour.name} className="image-cover" />
                  <span className="tour-tag">{tour.tag}</span>{tour.name === "Munnar Hill Escape" && <span className="image-credit">Photo: Arshad.ka5 / Wikimedia Commons (CC BY 3.0)</span>}
                </div>
                <div className="tour-content">
                  <div className="tour-meta"><span><MapPin size={14} /> Kerala</span></div>
                  <h3>{tour.name}</h3>
                  <p>{tour.description}</p>
                  <p className="tour-route-details">{tour.details}</p>
                  <div className="tour-bottom"><strong className="tour-price">{tour.price || "₹3,500"}</strong><a href="#booking" aria-label={`Enquire about ${tour.name}`} className="round-arrow"><ArrowRight size={18} /></a></div>
                </div>
              </article>
            ))}
          </div>
          
        </div>
      </section>

      <section className="services-section section" id="services">
        <div className="container services-layout">
          <div className="services-intro">
            <span className="eyebrow">Travel, made simpler</span>
            <h2>More than a ride.<br /><em>A better journey.</em></h2>
            <p>Whether you need a one-way transfer or a multi-day holiday, start with your destination and we will help you plan the details.</p>
            <a className="btn btn-primary" href="#booking">Tell us your plan <ArrowRight size={17} /></a>
            <div className="services-image"><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85" alt="Green mountain landscape in Kerala" className="image-cover" /></div>
          </div>
          <div className="benefit-grid">
            {benefits.map(({ icon: Icon, title, body }, i) => (
              <article className="benefit" key={title}>
                <span className="benefit-icon"><Icon size={22} /></span>
                <span className="benefit-index">0{i + 1}</span>
                <h3>{title}</h3><p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>



      <section className="closing-strip" id="about">
        <div className="container closing-inner">
          <div><span className="eyebrow">Your Kerala story starts here</span><h2>Ready to take the scenic route?</h2></div>
          <a className="btn btn-lime" href="#booking">Plan a trip <ArrowRight size={17} /></a>
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="container footer-main">
          <a href="#" className="brand footer-brand"><span className="brand-mark"><Route size={23} /></span><span>{businessName}<small>TOURS • TAXI • TRANSFERS</small></span></a>
          <p>Private taxi journeys and custom Kerala tour enquiries.</p>
          <div className="footer-links"><a href="#packages">Packages</a><a href="#services">Services</a><a href="#booking">Contact / Enquire</a></div>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} {businessName}. All rights reserved.</span><span>Travel responsibly. Leave only footprints.</span></div>
      </footer>
    </main>
  );
}