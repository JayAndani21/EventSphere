import React, { useState } from "react";
import "../styles/CreateEvent.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EventForm() {
  const [formData, setFormData] = useState({
    eventName: "",
    eventType: "",
    category: "",
    date: "",
    time: "",
    venueName: "",
    address: "",
    city: "",
    state: "",
    capacity: "",
    ticketType: "",
    ticketPrice: "",
    mealOptions: [],
    organizerName: "",
    organizerEmail: "",
    organizerPhone: "",
    coverImageUrl: "",
  });

  const [uploading, setUploading] = useState(false);
  const mealChoices = ["Breakfast", "Lunch", "Dinner", "Snacks", "Beverages"];
  const categoryOptions = ["Hackathon", "Seminar", "Workshop", "Conference", "Meetup", "Training", "Concert"];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files && files[0]) {
      uploadImageToBackend(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMealSelect = (option) => {
    setFormData((prev) => {
      const updated = prev.mealOptions.includes(option)
        ? prev.mealOptions.filter((m) => m !== option)
        : [...prev.mealOptions, option];
      return { ...prev, mealOptions: updated };
    });
  };

  const uploadImageToBackend = async (file) => {
    setUploading(true);
    const data = new FormData();
    data.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Upload failed");
      }

      const result = await res.json();
      if (result.imageUrl) {
        setFormData((prev) => ({ ...prev, coverImageUrl: result.imageUrl }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Image upload failed: No URL returned");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error uploading image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const {
      eventName,
      eventType,
      category,
      date,
      time,
      organizerName,
      organizerEmail,
      organizerPhone,
      coverImageUrl,
      ticketType,
      ticketPrice,
      capacity,
    } = formData;

    if (!eventName.trim()) return "Event Name is required.";
    if (!eventType) return "Event Mode is required.";
    if (!category) return "Category is required.";
    if (!date) return "Date is required.";
    if (!time) return "Time is required.";
    if (!organizerName.trim()) return "Organizer Name is required.";
    if (!organizerEmail.trim()) return "Organizer Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail)) return "Invalid email format.";
    if (!organizerPhone.trim()) return "Organizer Phone is required.";
    if (!/^\d{10}$/.test(organizerPhone)) return "Phone number must be 10 digits.";
    if (!ticketType) return "Ticket Type is required.";
    if (ticketType === "Paid" && !ticketPrice) return "Ticket price is required for paid events.";
    if (!coverImageUrl) return "Please upload a cover image.";
    if (!capacity) return "Capacity is required.";
    if (eventType === "Offline" && this.mealOptions && this.mealOptions.length === 0) {
      // Optional: Add this validation if you want to require meal options for offline events
      // return "Please select at least one meal option for offline events.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Event created successfully!");
        setFormData({
          eventName: "",
          eventType: "",
          category: "",
          date: "",
          time: "",
          venueName: "",
          address: "",
          city: "",
          state: "",
          capacity: "",
          ticketType: "",
          ticketPrice: "",
          mealOptions: [],
          organizerName: "",
          organizerEmail: "",
          organizerPhone: "",
          coverImageUrl: "",
        });
      } else {
        const text = await res.text();
        toast.error(`Failed to create event: ${text}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting form.");
    }
  };

  const isOffline = formData.eventType === "Offline";
  const isPaid = formData.ticketType === "Paid";

  return (
    <div className="form-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Event Creation Form</h2>

      <form onSubmit={handleSubmit}>
        {/* Event Details */}
        <section>
          <h3>Event Details</h3>
          <label>
            Event Name:
            <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} required />
          </label>

          <label>
            Event Mode:
            <select name="eventType" value={formData.eventType} onChange={handleChange} required>
              <option value="">Select Mode</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </label>

          <label>
            Category:
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <div className="inline-group">
            <label>
              Date:
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </label>

            <label>
              Time:
              <input type="time" name="time" value={formData.time} onChange={handleChange} required />
            </label>
          </div>
        </section>

        {/* Ticket Type (for both Online and Offline) */}
        <section>
          <h3>Ticket Information</h3>
          <div className="inline-group">
            <label>
              Ticket Type:
              <select name="ticketType" value={formData.ticketType} onChange={handleChange} required>
                <option value="">Select Type</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </label>

            {isPaid && (
              <label>
                Ticket Price (₹):
                <input type="number" name="ticketPrice" value={formData.ticketPrice} onChange={handleChange} min="0" required />
              </label>
            )}
          </div>
        </section>

        {/* Event Cover Image - Required for ALL events */}
        <section>
          <h3>Event Cover Image</h3>
          <input type="file" name="coverImage" onChange={handleChange} accept="image/*" />
          {uploading && <p>Uploading image...</p>}
          {formData.coverImageUrl && (
            <img src={formData.coverImageUrl} alt="Cover Preview" style={{ width: "200px", marginTop: "10px" }} />
          )}
        </section>

        {/* Capacity - Required for ALL events */}
        <section>
          <h3>Event Capacity</h3>
          <label>
            Capacity:
            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" required />
          </label>
        </section>

        {/* Offline Sections */}
        {isOffline && (
          <>
            <section>
              <h3>Venue Information</h3>
              <label>
                Venue Name:
                <input type="text" name="venueName" value={formData.venueName} onChange={handleChange} />
              </label>

              <label>
                Address:
                <textarea name="address" value={formData.address} onChange={handleChange} />
              </label>

              <div className="inline-group">
                <label>
                  City:
                  <input type="text" name="city" value={formData.city} onChange={handleChange} />
                </label>
                <label>
                  State:
                  <input type="text" name="state" value={formData.state} onChange={handleChange} />
                </label>
              </div>
            </section>

            <section>
              <h3>Catering Options</h3>
              <div className="checkbox-group">
                {mealChoices.map((option) => (
                  <label key={option}>
                    <input type="checkbox" checked={formData.mealOptions.includes(option)} onChange={() => handleMealSelect(option)} />
                    {option}
                  </label>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Organizer Info */}
        <section>
          <h3>Organizer Contact</h3>
          <label>
            Organizer Name:
            <input type="text" name="organizerName" value={formData.organizerName} onChange={handleChange} required />
          </label>
          <label>
            Organizer Email:
            <input type="email" name="organizerEmail" value={formData.organizerEmail} onChange={handleChange} required />
          </label>
          <label>
            Organizer Phone:
            <input type="tel" name="organizerPhone" value={formData.organizerPhone} onChange={handleChange} required />
          </label>
        </section>

        <button type="submit" className="submit-btn" disabled={uploading}>
          {uploading ? "Uploading..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}