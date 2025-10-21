import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
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
    window.location.href = `mailto:nobody@goodluck.com?subject=${subject}&body=${body}`;
    //window.location.href = `https://`;
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
          Contact
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          You&apos;re trying to reach a person? In the age of AI? Good luck.
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
          <h2 className="text-xl font-semibold mb-6 text-center">If you want.</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Contact me on X.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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

    </div>
  );
};