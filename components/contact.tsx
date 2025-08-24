"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, MapPin, Phone } from "lucide-react"
import { useState } from "react"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual form submission logic
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "hello@pmbc.store",
      description: "General inquiries and support",
    },
    {
      icon: MessageSquare,
      title: "Discord",
      details: "Join our server",
      description: "Real-time community chat",
    },
    {
      icon: MapPin,
      title: "Location",
      details: "California, USA",
      description: "Board culture headquarters",
    },
    {
      icon: Phone,
      title: "Business",
      details: "Partnerships & Sponsorships",
      description: "Collaboration opportunities",
    },
  ]

  return (
    <section id="contact" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-yellow-400">GET IN TOUCH</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Have questions about our NFTs, games, or events? Want to collaborate or become a sponsor? We'd love to hear
            from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white focus:border-yellow-400"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white focus:border-yellow-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white focus:border-yellow-400"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
            {contactInfo.map((info, index) => (
              <Card key={index} className="bg-gray-900 border-yellow-400/20 hover:border-yellow-400 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-yellow-400/20 rounded-lg">
                      <info.icon className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{info.title}</h4>
                      <p className="text-yellow-400 font-medium mb-1">{info.details}</p>
                      <p className="text-gray-400 text-sm">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* FAQ Section */}
            <Card className="bg-gray-900 border-yellow-400/20">
              <CardContent className="p-6">
                <h4 className="text-lg font-bold text-white mb-4">Frequently Asked Questions</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-yellow-400 font-medium">How do I join the community?</p>
                    <p className="text-gray-400">Join our Discord server and follow us on social media!</p>
                  </div>
                  <div>
                    <p className="text-yellow-400 font-medium">When is the metaverse game launching?</p>
                    <p className="text-gray-400">We're targeting Q3 2025 for the beta release.</p>
                  </div>
                  <div>
                    <p className="text-yellow-400 font-medium">How can I become a sponsor?</p>
                    <p className="text-gray-400">Contact us directly for partnership opportunities.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
