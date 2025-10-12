import { Heart, Shield, Globe, Users, Zap, Lock } from 'lucide-react'

const AboutPage = () => {
  const features = [
    {
      icon: Shield,
      title: 'Transparency',
      description: 'Every donation and withdrawal is recorded on the blockchain, ensuring complete transparency and accountability.',
      details: [
        'Public transaction records',
        'Real-time donation tracking',
        'Auditable withdrawal history',
        'Smart contract verification'
      ]
    },
    {
      icon: Zap,
      title: 'Efficiency',
      description: 'Blockchain technology eliminates intermediaries, reducing fees and processing times significantly.',
      details: [
        'Direct peer-to-peer transfers',
        'Minimal transaction fees',
        'Instant transaction confirmation',
        'No geographical restrictions'
      ]
    },
    {
      icon: Lock,
      title: 'Security',
      description: 'Advanced smart contracts ensure secure and tamper-proof donation processing.',
      details: [
        'Immutable transaction records',
        'Cryptographic security',
        'Decentralized infrastructure',
        'No single point of failure'
      ]
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Support humanitarian causes worldwide with borderless cryptocurrency donations.',
      details: [
        '24/7 global access',
        'Multiple cryptocurrency support',
        'Cross-border donations',
        'Universal accessibility'
      ]
    }
  ]

  const team = [
    {
      name: 'Blockchain Developers',
      role: 'Smart Contract & Infrastructure',
      description: 'Expert developers ensuring secure and efficient blockchain operations.'
    },
    {
      name: 'Charity Partners',
      role: 'Humanitarian Organizations',
      description: 'Trusted organizations working on the ground to make a real difference.'
    },
    {
      name: 'Community',
      role: 'Donors & Volunteers',
      description: 'Thousands of individuals worldwide supporting humanitarian causes.'
    }
  ]

  const milestones = [
    {
      year: '2024',
      title: 'Platform Launch',
      description: 'Chain of Hope launched with initial charity partnerships and smart contract deployment.'
    },
    {
      year: '2024',
      title: 'First 1000 Donors',
      description: 'Reached milestone of 1000 donors and $50,000 in transparent donations.'
    },
    {
      year: '2024',
      title: 'Multi-Chain Support',
      description: 'Expanded to support multiple blockchain networks for broader accessibility.'
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Partnered with charities across 25 countries for worldwide humanitarian impact.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Chain of Hope
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Revolutionizing charitable giving through blockchain technology. 
              Transparent, secure, and efficient humanitarian aid platform.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              To create a transparent, efficient, and trustworthy platform that connects 
              donors directly with humanitarian causes, ensuring that every contribution 
              makes the maximum possible impact.
            </p>
            <div className="bg-primary-50 rounded-xl p-8">
              <Heart className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Making Charity Transparent
              </h3>
              <p className="text-gray-600">
                We believe that transparency builds trust. By leveraging blockchain technology, 
                we provide complete visibility into how donations are received, managed, and 
                distributed to humanitarian causes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Blockchain for Charity?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Traditional charity systems lack transparency and efficiency. 
              Blockchain technology solves these problems.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-50 p-3 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, secure, and transparent donation process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600">
                Connect your cryptocurrency wallet (MetaMask, WalletConnect, etc.) 
                to start making donations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Make Your Donation
              </h3>
              <p className="text-gray-600">
                Choose your donation amount, add an optional message, and submit 
                your transaction to the blockchain.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Track Impact
              </h3>
              <p className="text-gray-600">
                Monitor your donation and see how it contributes to humanitarian 
                causes with complete transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Community
            </h2>
            <p className="text-xl text-gray-600">
              Built by and for the humanitarian community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-200">
                <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-gray-600">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">
              Key milestones in our mission to revolutionize charitable giving
            </p>
          </div>
          
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="bg-primary-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {milestone.year}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Be part of the future of transparent, efficient, and impactful charitable giving. 
            Together, we can make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/donate"
              className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Donating
            </a>
            <a
              href="/dashboard"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200"
            >
              View Dashboard
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
