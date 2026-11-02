"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, MessageCircle, RefreshCw, Send } from "lucide-react";

type FormValues = {
  name: string;
  phone: string;
  pickup: string;
  destination: string;
  fromDate: string;
  toDate: string;
  totalKm: string;
  travellers: string;
  tripType: string;
  notes: string;
};

const STANDARD_RATE_PER_DAY = 3500;
const STANDARD_INCLUDED_KM_PER_DAY = 100;
const KOCHI_RATE_PER_DAY = 2500;
const KOCHI_INCLUDED_KM_PER_DAY = 130;
const EXTRA_KM_RATE = 17;
const today = new Date().toISOString().split("T")[0];
const initial: FormValues = {
  name: "", phone: "", pickup: "Kochi / Cochin Airport", destination: "",
  fromDate: today, toDate: today, totalKm: "100", travellers: "2",
  tripType: "Multi-day Kerala tour", notes: ""
};

function formatDate(date: string) {
  if (!date) return "Not selected";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function customerWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return "";
}

export default function BookingForm() {
  const [values, setValues] = useState<FormValues>(initial);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [recalculated, setRecalculated] = useState(false);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const set = (key: keyof FormValues, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setRecalculated(false);
  };

  const estimate = useMemo(() => {
    if (!values.fromDate || !values.toDate) return null;
    const start = new Date(`${values.fromDate}T00:00:00`);
    const end = new Date(`${values.toDate}T00:00:00`);
    const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
    if (!Number.isFinite(diff) || diff < 0) return null;
    const days = diff + 1;
    const km = Number(values.totalKm);
    if (!Number.isFinite(km) || km < 0) return null;
    const isKochi = values.tripType === "Kochi local trip";
    const ratePerDay = isKochi ? KOCHI_RATE_PER_DAY : STANDARD_RATE_PER_DAY;
    const includedKmPerDay = isKochi ? KOCHI_INCLUDED_KM_PER_DAY : STANDARD_INCLUDED_KM_PER_DAY;
    const includedKm = days * includedKmPerDay;
    const extraKm = Math.max(0, km - includedKm);
    const base = days * ratePerDay;
    return { days, km, includedKm, includedKmPerDay, ratePerDay, extraKm, base, extraCharge: extraKm * EXTRA_KM_RATE, total: base + extraKm * EXTRA_KM_RATE };
  }, [values.fromDate, values.toDate, values.totalKm, values.tripType]);

  const itineraryText = () => {
    if (!estimate) return "";
    return [
      `Trip itinerary and estimated fare - ${process.env.NEXT_PUBLIC_BUSINESS_NAME || "Kerala car rentals, vacation and holidays"}`,
      `Name: ${values.name || "Not provided"}`,
      `Customer mobile: ${values.phone || "Not provided"}`,
      `Route: ${values.pickup} to ${values.destination}`,
      `Travel dates: ${formatDate(values.fromDate)} to ${formatDate(values.toDate)}`,
      `Duration: ${estimate.days} day(s)`,
      `Estimated total distance: ${estimate.km} km`,
      `Daily rate: ₹${estimate.ratePerDay.toLocaleString("en-IN")} per day`,
      `Included distance: ${estimate.includedKm} km (${estimate.includedKmPerDay} km/day)`,
      `Base fare: ₹${estimate.base.toLocaleString("en-IN")}`,
      `Extra distance: ${estimate.extraKm} km × ₹${EXTRA_KM_RATE} = ₹${estimate.extraCharge.toLocaleString("en-IN")}`,
      `Estimated total: ₹${estimate.total.toLocaleString("en-IN")}`,
      `Travellers: ${values.travellers}`,
      `Trip type: ${values.tripType}`,
      `Additional details: ${values.notes || "None"}`,
      "This is an indicative estimate. Final fare and route distance will be confirmed by the operator."
    ].join("\n");
  };

  async function sendItineraryToCustomer() {
    setMessage("");
    if (!estimate) {
      setStatus("error");
      setMessage("Please select valid travel dates and enter the estimated total kilometres.");
      return;
    }
    const number = customerWhatsAppNumber(values.phone);
    if (!number) {
      setStatus("error");
      setMessage("Enter a valid mobile number with country code (or a 10-digit Indian mobile number).");
      return;
    }
    if (!whatsappConsent) {
      setStatus("error");
      setMessage("Please confirm that you agree to receive this itinerary and quotation on WhatsApp.");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/send-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
  phone: number,
  name: values.name,
  pickup: values.pickup,
  destination: values.destination,
  travelDate: `${formatDate(values.fromDate)} to ${formatDate(values.toDate)}`,
  itinerary: itineraryText(),
  total: `₹${estimate.total.toLocaleString("en-IN")}`
})
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send your itinerary.");
      setStatus("success");
      setMessage(result.message || "WhatsApp accepted your itinerary request. Delivery confirmation may take a moment.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to send your itinerary right now.");
    }
  }

  function checkFreshFare() {
    if (!estimate) {
      setStatus("error");
      setMessage("Please check the From date, To date and total kilometres.");
      return;
    }
    setRecalculated(true);
    setStatus("idle");
    setMessage("Fare recalculated using your latest route, dates and kilometre details.");
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    if (!estimate) {
      setStatus("error");
      setMessage("Please select a valid date range and enter the estimated total kilometres.");
      return;
    }
    const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "917989581582").replace(/\D/g, "");
    if (!number) {
      setStatus("error");
      setMessage("WhatsApp is not configured. Please contact the business directly.");
      return;
    }
    const text = `New trip enquiry\n\n${itineraryText()}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setStatus("success");
    setMessage("Your enquiry is ready in WhatsApp. Press Send to share it with our team.");
  }

  return (
    <form className="booking-form card" onSubmit={submit}>
      <div className="form-heading"><span className="form-step">01</span><div><h3>Send trip enquiry</h3><p>Choose your dates and route to see an estimated fare.</p></div></div>
      <div className="form-grid">
        <div className="form-field"><label htmlFor="name">YOUR NAME *</label><input id="name" required autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} placeholder="Enter your name" /></div>
        <div className="form-field"><label htmlFor="phone">YOUR MOBILE / WHATSAPP *</label><input id="phone" required type="tel" inputMode="tel" autoComplete="tel" pattern="[+0-9() -]{8,20}" value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" /></div>
        <div className="form-field"><label htmlFor="tripType">TYPE OF TRIP</label><select id="tripType" value={values.tripType} onChange={(e) => set("tripType", e.target.value)}><option>Multi-day Kerala tour</option><option>Kochi local trip</option><option>Airport transfer</option><option>Local taxi</option><option>One-way outstation</option><option>Custom itinerary</option></select></div>
        <div className="form-field"><label htmlFor="travellers">TRAVELLERS</label><select id="travellers" value={values.travellers} onChange={(e) => set("travellers", e.target.value)}>{[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>)}</select></div>
        <div className="form-field"><label htmlFor="pickup">FROM / PICKUP LOCATION *</label><input id="pickup" required value={values.pickup} onChange={(e) => set("pickup", e.target.value)} placeholder="Airport, hotel or town" /></div>
        <div className="form-field"><label htmlFor="destination">TO / DESTINATION *</label><input id="destination" required value={values.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Where would you like to go?" /></div>
        <div className="form-field"><label htmlFor="fromDate">FROM DATE *</label><input id="fromDate" required type="date" min={today} value={values.fromDate} onChange={(e) => set("fromDate", e.target.value)} /></div>
        <div className="form-field"><label htmlFor="toDate">TO DATE *</label><input id="toDate" required type="date" min={values.fromDate || today} value={values.toDate} onChange={(e) => set("toDate", e.target.value)} /></div>
        <div className="form-field form-field-wide"><label htmlFor="totalKm">ESTIMATED TOTAL ROUTE DISTANCE (KM) *</label><input id="totalKm" required type="number" min="0" step="1" value={values.totalKm} onChange={(e) => set("totalKm", e.target.value)} placeholder="Enter estimated total kilometres" /><small>{values.tripType === "Kochi local trip" ? "Kochi rate: ₹2,500/day including 130 km. Additional distance: ₹17/km." : "Kerala tour rate: ₹3,500/day including 100 km. Additional distance: ₹17/km."}</small></div>
        <div className="form-field form-field-wide"><label htmlFor="notes">ANY DETAILS? (OPTIONAL)</label><textarea id="notes" rows={2} value={values.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Places you want to visit, luggage or other requests..." /></div>
      </div>

      <div className="fare-estimate" aria-live="polite">
        <div className="fare-estimate-head"><div><span className="eyebrow">YOUR TRIP ESTIMATE</span><h4>Estimated total amount</h4></div><strong>₹{estimate ? estimate.total.toLocaleString("en-IN") : "—"}</strong></div>
        {estimate ? <div className="fare-breakdown"><span>{estimate.days} day(s) × ₹{estimate.ratePerDay.toLocaleString("en-IN")} = ₹{estimate.base.toLocaleString("en-IN")}</span><span>{estimate.includedKm} km included ({estimate.includedKmPerDay} km/day) · {estimate.extraKm} extra km × ₹17 = ₹{estimate.extraCharge.toLocaleString("en-IN")}</span><small>Based on the entered distance and dates. Final route kilometres, tolls, parking, permits and other applicable charges must be confirmed before booking.</small></div> : <small>Please enter a valid date range and total kilometres to calculate your estimate.</small>}
      </div>

      <div className="fare-actions">
        <button className="btn btn-outline" type="button" onClick={checkFreshFare}><RefreshCw size={16} /> Check fresh route price</button>
        <button className="btn btn-secondary" type="button" onClick={sendItineraryToCustomer} disabled={status === "sending"}><Send size={16} /> {status === "sending" ? "Sending itinerary..." : "Send itinerary & quotation to my WhatsApp"}</button>
      </div>
      <label className="whatsapp-consent"><input type="checkbox" checked={whatsappConsent} onChange={(e) => setWhatsappConsent(e.target.checked)} /> I agree to receive this trip itinerary and quotation on the WhatsApp number entered above.</label>
      <button className="btn btn-primary submit-btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? <><LoaderCircle size={17} className="spin" /> Preparing...</> : <>Send enquiry to our WhatsApp <ArrowRight size={17} /> </>}
      </button>
      {message && <div className={`form-message ${status === "error" ? "error" : "success"}`} role="status">{status === "error" ? <MessageCircle size={18} /> : <CheckCircle2 size={18} />}{message}</div>}
      <p className="privacy-note">Your itinerary is sent directly to the WhatsApp number you entered using the business WhatsApp API. This button does not open WhatsApp on your device. The business number is used only as the sender and is not shown in this customer-facing action. Delivery requires the owner's WhatsApp Cloud API credentials and an approved message template.</p>
    </form>
  );
}
