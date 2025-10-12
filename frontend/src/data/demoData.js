// Demo data for Chain of Hope DApp
export const demoCampaigns = [
  {
    id: 0,
    name: "Emergency Relief for Flood Victims",
    description: "Severe flooding in rural communities has displaced over 500 families, leaving them without homes, clean water, or basic necessities. Your donation will provide immediate relief including emergency shelter, clean drinking water, food supplies, and medical aid. Every contribution helps us reach more families in need and restore hope in their darkest hour.",
    detailedDescription: `**The Crisis:**
The recent unprecedented flooding has devastated three rural communities, affecting over 2,000 individuals including 800 children. Homes have been completely submerged, schools and clinics destroyed, and agricultural livelihoods wiped out.

**How Your Donation Helps:**
• **$25**: Provides emergency food kit for a family of 4 for one week
• **$50**: Supplies clean water tablets and basic hygiene items for 10 people
• **$100**: Emergency shelter materials for one displaced family
• **$250**: Medical supplies and first aid for 50 individuals
• **$500**: Temporary classroom setup for 30 children

**Our Commitment:**
100% of donations go directly to relief efforts. We work with local partners who know the communities best, ensuring aid reaches those who need it most. Regular updates and photos show exactly how your contribution makes a difference.

**Immediate Needs:**
1. Emergency shelter and bedding
2. Clean water purification systems
3. Food and nutrition supplies
4. Medical care and supplies
5. Educational materials for displaced children`,
    goal: "10.0000",
    raised: "6.5000",
    creator: "0x1234567890123456789012345678901234567890",
    isActive: true,
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
    totalDonors: 47,
    progress: 65,
    category: "Disaster Relief",
    urgency: "High",
    location: "Rural Communities, Bangladesh",
    beneficiaries: "500 families (2,000+ individuals)",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    tags: ["Emergency", "Disaster Relief", "Water", "Shelter", "Medical Aid"],
    organizer: {
      name: "Global Relief Foundation",
      verified: true,
      experience: "15+ years in disaster response",
      previousCampaigns: 23
    },
    updates: [
      {
        date: Date.now() - 86400000 * 2, // 2 days ago
        title: "Medical Team Deployed",
        content: "Thanks to your generous donations, we've deployed a medical team to provide immediate healthcare to flood victims. 150 people treated so far."
      },
      {
        date: Date.now() - 86400000 * 4, // 4 days ago
        title: "First Relief Supplies Delivered",
        content: "Emergency food kits and clean water reached the first 100 families. Distribution continuing as more supplies arrive."
      }
    ]
  },
  {
    id: 1,
    name: "Education for Underprivileged Children",
    description: "Transform the future of 200 children in underserved communities by providing access to quality education, school supplies, and nutritious meals. This program establishes learning centers, trains local teachers, and creates sustainable educational opportunities that break the cycle of poverty.",
    detailedDescription: `**The Challenge:**
In remote villages, over 200 children aged 6-14 have no access to formal education. Without schools nearby, many children work instead of learning, perpetuating cycles of poverty. Girls are particularly affected, with only 30% completing primary education.

**Our Solution:**
We're establishing community learning centers with qualified teachers, providing:
• Quality primary education curriculum
• School supplies and learning materials
• Daily nutritious meals to improve attendance
• Special programs for girls' education
• Adult literacy classes for parents

**Impact of Your Donation:**
• **$30**: School supplies for one child for a full year
• **$75**: Nutritious meals for one child for 3 months
• **$150**: Teacher training and salary for one month
• **$300**: Scholarship fund for one girl's complete primary education
• **$500**: Learning materials and books for an entire classroom

**Long-term Vision:**
By year 3, we aim to have:
- 200 children receiving quality education
- 85% primary school completion rate
- 15 trained local teachers employed
- 3 established learning centers
- Adult literacy program for 100 parents

**Community Partnership:**
We work directly with village leaders and parents to ensure cultural sensitivity and community ownership. Local teachers are trained and employed, creating sustainable employment while delivering education.

**Transparency Promise:**
Monthly financial reports, progress photos, and student success stories are shared with all donors. Visit our centers anytime or join our virtual classroom sessions.`,
    goal: "8.0000",
    raised: "3.2000",
    creator: "0x2345678901234567890123456789012345678901",
    isActive: true,
    createdAt: Date.now() - 86400000 * 12, // 12 days ago
    totalDonors: 28,
    progress: 40,
    category: "Education",
    urgency: "Medium",
    location: "Rural Villages, Kenya",
    beneficiaries: "200 children + families",
    imageUrl: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800",
    tags: ["Education", "Children", "Rural Development", "Women's Rights", "Sustainability"],
    organizer: {
      name: "Bright Future Education Initiative",
      verified: true,
      experience: "8 years in educational development",
      previousCampaigns: 12
    },
    updates: [
      {
        date: Date.now() - 86400000 * 3, // 3 days ago
        title: "First Learning Center Opens!",
        content: "Wonderful news! Our first learning center is now operational with 45 children enrolled. Teacher Sarah and her team are doing amazing work."
      },
      {
        date: Date.now() - 86400000 * 7, // 1 week ago
        title: "Local Teachers Complete Training",
        content: "5 local teachers have completed their training program and are ready to start classes. The community is excited to begin this educational journey."
      },
      {
        date: Date.now() - 86400000 * 10, // 10 days ago
        title: "Site Construction Begins",
        content: "Ground breaking ceremony held with community leaders. Construction of the first learning center is underway with local materials and labor."
      }
    ]
  }
];

export const demoDonations = [
  {
    id: 0,
    campaignId: 0,
    campaignName: "Emergency Relief for Flood Victims",
    donor: "0x3456789012345678901234567890123456789012",
    amount: "1.5000",
    timestamp: Date.now() - 86400000 * 1,
    isRefunded: false,
    donorName: "Anonymous Donor",
    message: "Hope this helps the families in need. Stay strong!"
  },
  {
    id: 1,
    campaignId: 1,
    campaignName: "Education for Underprivileged Children",
    donor: "0x4567890123456789012345678901234567890123",
    amount: "0.8000",
    timestamp: Date.now() - 86400000 * 2,
    isRefunded: false,
    donorName: "Sarah Chen",
    message: "Education is the key to breaking poverty cycles. Supporting this amazing cause!"
  },
  {
    id: 2,
    campaignId: 0,
    campaignName: "Emergency Relief for Flood Victims",
    donor: "0x5678901234567890123456789012345678901234",
    amount: "2.0000",
    timestamp: Date.now() - 86400000 * 3,
    isRefunded: false,
    donorName: "Community Group",
    message: "From our community fundraiser. Every family deserves a safe home."
  },
  {
    id: 3,
    campaignId: 1,
    campaignName: "Education for Underprivileged Children",
    donor: "0x6789012345678901234567890123456789012345",
    amount: "0.5000",
    timestamp: Date.now() - 86400000 * 4,
    isRefunded: false,
    donorName: "John Smith",
    message: "As a teacher, I believe every child deserves quality education."
  },
  {
    id: 4,
    campaignId: 0,
    campaignName: "Emergency Relief for Flood Victims",
    donor: "0x7890123456789012345678901234567890123456",
    amount: "3.0000",
    timestamp: Date.now() - 86400000 * 5,
    isRefunded: false,
    donorName: "Tech for Good Foundation",
    message: "Corporate social responsibility donation. We stand with disaster victims."
  }
];

export const demoStats = {
  totalCampaigns: 2,
  totalDonations: 75,
  totalRaised: 9.7000,
  totalExpenditures: 0
};

// Utility function to generate more demo donations
export const generateMoreDemoDonations = (campaignId, count = 5) => {
  const donations = [];
  const donors = [
    "Anonymous Donor", "Maria Garcia", "David Kim", "Lisa Wang", "Ahmed Hassan",
    "Emma Johnson", "Carlos Rodriguez", "Priya Patel", "Michael Brown", "Fatima Al-Zahra"
  ];
  
  const messages = [
    "Happy to support this cause!",
    "Every bit helps. Stay strong!",
    "Making a difference together.",
    "Hope this helps reach the goal.",
    "Supporting from the heart.",
    "Together we can make change happen.",
    "Proud to contribute to this cause.",
    "Sending love and support.",
    "Making the world a better place.",
    "Small actions, big impact."
  ];

  for (let i = 0; i < count; i++) {
    donations.push({
      id: `demo-${campaignId}-${i}`,
      campaignId,
      campaignName: demoCampaigns[campaignId]?.name || "Demo Campaign",
      donor: `0x${Math.random().toString(16).substr(2, 40)}`,
      amount: (Math.random() * 2 + 0.1).toFixed(4),
      timestamp: Date.now() - Math.random() * 86400000 * 10,
      isRefunded: false,
      donorName: donors[Math.floor(Math.random() * donors.length)],
      message: messages[Math.floor(Math.random() * messages.length)]
    });
  }
  
  return donations;
};