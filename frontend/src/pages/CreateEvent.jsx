import React, { useState } from "react";
import "../styles/CreateEvent.css";

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
    coverImageUrl: "", // Cloudinary URL from backend
  });

  const [uploading, setUploading] = useState(false);

  const mealChoices = ["Breakfast", "Lunch", "Dinner", "Snacks", "Beverages"];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file" && files[0]) {
      uploadImageToBackend(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMealSelect = (option) => {
    const updated = formData.mealOptions.includes(option)
      ? formData.mealOptions.filter((m) => m !== option)
      : [...formData.mealOptions, option];
    setFormData({ ...formData, mealOptions: updated });
  };

  // Upload file to backend which handles Cloudinary signed upload
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
      const text = await res.text(); // fallback if not JSON
      throw new Error(text || "Upload failed");
    }

    const result = await res.json();
    if (result.imageUrl) {
      setFormData({ ...formData, coverImageUrl: result.imageUrl });
    } else {
      alert("Image upload failed: No URL returned");
    }
  } catch (err) {
    console.error("Upload error:", err);
    alert("Error uploading image: " + err.message);
  } finally {
    setUploading(false);
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.coverImageUrl) {
      alert("Please upload a cover image.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // or wherever you store it

      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });


      if (res.ok) {
        alert("Event created successfully!");
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
        alert("Failed to create event.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting form.");
    }
  };

  const isOffline = formData.eventType === "Offline";
  const isPaid = formData.ticketType === "Paid";

  return (
    <div className="form-container">
      <h2>Event Creation Form</h2>

      <form onSubmit={handleSubmit}>
        {/* Event Details */}
        <section>
          <h3>Event Details</h3>
          <label>
            Event Name:
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Event Type:
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </label>

          <label>
            Category:
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Eg. Technology, Music, Business"
            />
          </label>

          <div className="inline-group">
            <label>
              Date:
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Time:
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        </section>

        {/* Offline specific sections */}
        {isOffline && (
          <>
            <section>
              <h3>Venue Information</h3>
              <label>
                Venue Name:
                <input
                  type="text"
                  name="venueName"
                  value={formData.venueName}
                  onChange={handleChange}
                />
              </label>

              <label>
                Address:
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </label>

              <div className="inline-group">
                <label>
                  City:
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  State:
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </section>

            <section>
              <h3>Ticket & Capacity</h3>
              <div className="inline-group">
                <label>
                  Capacity:
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                  />
                </label>

                <label>
                  Ticket Type:
                  <select
                    name="ticketType"
                    value={formData.ticketType}
                    onChange={handleChange}
                  >
                    <option value="">Select Type</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </label>
              </div>

              {isPaid && (
                <label>
                  Ticket Price (₹):
                  <input
                    type="number"
                    name="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </label>
              )}
            </section>

            <section>
              <h3>Catering Options</h3>
              <div className="checkbox-group">
                {mealChoices.map((option) => (
                  <label key={option}>
                    <input
                      type="checkbox"
                      checked={formData.mealOptions.includes(option)}
                      onChange={() => handleMealSelect(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h3>Event Cover Image</h3>
              <input type="file" name="coverImage" onChange={handleChange} />
              {uploading && <p>Uploading image...</p>}
              {formData.coverImageUrl && (
                <img
                  src={formData.coverImageUrl}
                  alt="Cover Preview"
                  style={{ width: "200px", marginTop: "10px" }}
                />
              )}
            </section>
          </>
        )}

        {/* Organizer Info (Always visible) */}
        <section>
          <h3>Organizer Contact</h3>
          <label>
            Organizer Name:
            <input
              type="text"
              name="organizerName"
              value={formData.organizerName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Organizer Email:
            <input
              type="email"
              name="organizerEmail"
              value={formData.organizerEmail}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Organizer Phone:
            <input
              type="tel"
              name="organizerPhone"
              value={formData.organizerPhone}
              onChange={handleChange}
              required
            />
          </label>
        </section>

        <button type="submit" className="submit-btn" disabled={uploading}>
          {uploading ? "Uploading..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
