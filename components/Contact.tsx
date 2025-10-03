import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/Button';

export const Contact = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    business: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct mailto link with form data
    const subject = encodeURIComponent(`Contact from ${formData.name} - ${formData.business}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nBusiness: ${formData.business}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:contact@kirigamilabs.com?subject=${subject}&body=${body}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block"
        >
          <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 mb-4">
            <Mail className="w-12 h-12 text-primary" />
          </div>
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Each of our products are custom tailored to your specific needs and requirements. 
          In order to best serve you, please reach out to us.
        </p>
      </div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border/50">
          <h2 className="text-xl font-semibold mb-6 text-center">Get Started</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Please provide your name, business, and any additional information that may help us get you started.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                         transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="business" className="text-sm font-medium">
                Business *
              </label>
              <input
                id="business"
                name="business"
                type="text"
                required
                value={formData.business}
                onChange={handleChange}
                placeholder="Your company or organization"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                         transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                         transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Additional Information
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your project, requirements, or any questions you have..."
                className="w-full rounded-lg border border-border bg-background px-4 py-3 
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                         transition-all duration-200 resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg
                       flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Send className="w-5 h-5" />
              Send Message
            </Button>
          </form>
        </div>
      </motion.div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-2xl mx-auto mt-8"
      >
        <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl p-6 border border-primary/20">
          <h3 className="text-lg font-semibold mb-3 text-center">What Happens Next?</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">1</span>
              </div>
              <p>We'll review your inquiry and reach out within 48 hours</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">2</span>
              </div>
              <p>Schedule a consultation to discuss your specific needs</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-semibold text-primary">3</span>
              </div>
              <p>Receive a custom solution tailored to your requirements</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};