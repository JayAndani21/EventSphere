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
    coverImage: null,
  });

  const mealChoices = ["Breakfast", "Lunch", "Dinner", "Snacks", "Beverages"];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    alert("Event form submitted successfully!");
  };

  const isOffline = formData.eventType === "Offline";
  const isOnline = formData.eventType === "Online";
  const isPaid = formData.ticketType === "Paid";

  return (
    <div className="form-container">
      <h2>
        Event Creation Form
      </h2>

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

        <button type="submit" className="submit-btn">
          Create Event
        </button>
      </form>
    </div>
  );
}
