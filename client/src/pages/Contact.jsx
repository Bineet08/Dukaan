import { useState } from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post("/contact", formData);
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send message"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Get in Touch
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Have a question or feedback? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Contact Information
            </h2>

            <div className="space-y-8">
              <Info icon={<MapPin />} title="Address">
                Sadhan, Ramgarh<br />Chandauli<br />Uttar Pradesh
              </Info>

              <Info icon={<Phone />} title="Phone">
                +91 XXXXX XXXXX
              </Info>

              <Info icon={<Mail />} title="Email">
                support@dukaan.com
              </Info>
            </div>
          </div>

          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d900.3769136409968!2d83.24060122904596!3d25.48811065016932!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398e210d7e901b1f%3A0x5567f302608cfca6!2sGupta%20General%20Store!5e0!3m2!1sen!2sin!4v1766570691621!5m2!1sen!2sin"
            className="w-full h-60 border-0"
            loading="lazy"
            title="Location"
          />
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Send us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                rows="5"
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon, title, children }) => (
  <div className="flex items-start space-x-4">
    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-600">{children}</p>
    </div>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      required
      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  </div>
);

export default Contact;
