import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Trophy } from "lucide-react"

export function Events() {
  const events = [
    {
      title: "PMBC Summer Skate Jam",
      date: "July 15, 2024",
      location: "Venice Beach, CA",
      type: "Competition",
      prize: "$10,000",
      participants: 150,
      image: "/placeholder.svg?height=300&width=500&text=Skate+Jam",
      status: "Registration Open",
      description: "Annual skateboarding competition featuring the best riders from the PMBC community.",
    },
    {
      title: "Surf & NFT Meetup",
      date: "August 3, 2024",
      location: "Malibu, CA",
      type: "Community",
      participants: 75,
      image: "/placeholder.svg?height=300&width=500&text=Surf+Meetup",
      status: "Coming Soon",
      description: "Connect with fellow NFT holders while catching waves at one of California's best surf spots.",
    },
    {
      title: "Snow Season Kickoff",
      date: "December 1, 2024",
      location: "Mammoth Mountain, CA",
      type: "Festival",
      participants: 300,
      image: "/placeholder.svg?height=300&width=500&text=Snow+Festival",
      status: "Save the Date",
      description: "Celebrate the start of snow season with competitions, demos, and community activities.",
    },
  ]

  const pastEvents = [
    {
      title: "PMBC Spring Championship",
      date: "March 2024",
      location: "San Diego, CA",
      image: "/placeholder.svg?height=200&width=300&text=Spring+Champ",
      participants: 200,
    },
    {
      title: "NFT Launch Party",
      date: "January 2024",
      location: "Los Angeles, CA",
      image: "/placeholder.svg?height=200&width=300&text=Launch+Party",
      participants: 500,
    },
  ]

  const sponsors = [
    { name: "Board Co.", logo: "/placeholder.svg?height=60&width=120&text=Board+Co" },
    { name: "Wave Riders", logo: "/placeholder.svg?height=60&width=120&text=Wave+Riders" },
    { name: "Snow Gear", logo: "/placeholder.svg?height=60&width=120&text=Snow+Gear" },
    { name: "Action Sports", logo: "/placeholder.svg?height=60&width=120&text=Action+Sports" },
  ]

  return (
    <section id="events" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-yellow-400">EVENTS & SPONSORSHIPS</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join the community at our epic events and competitions. We support athletes and bring the board sports
            community together through unforgettable experiences.
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8 text-yellow-400">Upcoming Events</h3>
          <div className="grid lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <Card
                key={index}
                className="bg-gray-900 border-yellow-400/20 hover:border-yellow-400 transition-all duration-300 overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-48 object-cover" />
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="secondary"
                      className={`${
                        event.status === "Registration Open"
                          ? "bg-green-600"
                          : event.status === "Coming Soon"
                            ? "bg-yellow-600"
                            : "bg-blue-600"
                      } text-white`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="border-white text-white bg-black/50">
                      {event.type}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{event.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-3 text-yellow-400" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-3 text-yellow-400" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="h-4 w-4 mr-3 text-yellow-400" />
                      {event.participants} participants
                    </div>
                    {event.prize && (
                      <div className="flex items-center text-gray-300">
                        <Trophy className="h-4 w-4 mr-3 text-yellow-400" />
                        {event.prize} prize pool
                      </div>
                    )}
                  </div>

                  <Button
                    className={`w-full font-bold ${
                      event.status === "Registration Open"
                        ? "bg-yellow-400 text-black hover:bg-yellow-300"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                  >
                    {event.status === "Registration Open" ? "Register Now" : "Learn More"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8 text-yellow-400">Past Events</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {pastEvents.map((event, index) => (
              <Card key={index} className="bg-gray-900 border-yellow-400/20 overflow-hidden">
                <div className="flex">
                  <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-32 h-32 object-cover" />
                  <CardContent className="p-4 flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">{event.title}</h4>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-2 text-yellow-400" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-2 text-yellow-400" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-2 text-yellow-400" />
                        {event.participants} attended
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sponsors Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-8 text-yellow-400">Our Sponsors & Partners</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center mb-8">
            {sponsors.map((sponsor, index) => (
              <div key={index} className="bg-white/10 p-6 rounded-lg hover:bg-white/20 transition-colors">
                <img
                  src={sponsor.logo || "/placeholder.svg"}
                  alt={sponsor.name}
                  className="w-full h-12 object-contain filter brightness-0 invert"
                />
              </div>
            ))}
          </div>
          <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold">Become a Sponsor</Button>
        </div>
      </div>
    </section>
  )
}
