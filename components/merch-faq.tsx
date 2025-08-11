"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"

export function MerchFAQ() {
  const faqs = [
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping usually takes 5-7 business days within the US. International shipping times may vary, typically 10-20 business days depending on the destination.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for unworn and unwashed items. Please visit our 'Returns' page for detailed instructions on how to process a return or exchange.",
    },
    {
      question: "Do NFT holders get special discounts?",
      answer:
        "Yes! Verified Prime Mates NFT holders receive exclusive discounts and early access to limited edition merch drops. Connect your wallet on our 'NFT Holder Access' page to unlock your benefits.",
    },
    {
      question: "Can I track my order?",
      answer:
        "Once your order ships, you will receive a confirmation email with a tracking number. You can use this number to track your package's journey.",
    },
    {
      question: "What materials are your products made from?",
      answer:
        "We prioritize quality and comfort. Our apparel is made from premium cotton blends, and other materials are specified on individual product pages. We aim for sustainable sourcing where possible.",
    },
  ]

  return (
    <section id="merch-faq" className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-yellow-400">MERCH FAQ</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about our Prime Mates merchandise.
          </p>
        </div>

        <Card className="bg-black border-yellow-400/30 max-w-4xl mx-auto">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-yellow-400/20">
                  <AccordionTrigger className="text-left text-lg font-semibold text-white hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300 text-base">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
