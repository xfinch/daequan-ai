'use client';

import { useState } from 'react';
import { Navbar } from '@/components/ui/navbar';

interface Prospect {
  business_name: string;
  contact_name: string | null;
  address: string;
  zip_code: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  source: string;
  notes: string;
  priority: 'high' | 'medium' | 'low';
}

interface Category {
  key: string;
  title: string;
  count: number;
  prospects: Prospect[];
}

const partnersData: Category[] = [
  {
    key: 'machines',
    title: '🖨️ Business Machines (Printers, Copiers)',
    count: 11,
    prospects: [
      {
        business_name: 'Copiers Northwest',
        contact_name: 'Sales Team',
        address: 'Tacoma, WA',
        zip_code: '98406',
        phone: '(253) 590-5008',
        email: null,
        website: 'https://copiersnw.com',
        source: 'Web Search',
        notes: 'Major local dealer for Xerox, Canon, Ricoh, Konica Minolta. They visit many offices daily - prime referral partner.',
        priority: 'high'
      },
      {
        business_name: 'Kelley Create',
        contact_name: null,
        address: 'Tacoma, WA',
        zip_code: '98406',
        phone: '(800) 495-3175',
        email: null,
        website: 'https://kelleycreate.com/copiers-printers/tacoma-washington/',
        source: 'Web Search',
        notes: 'Printer/copier sales and leasing',
        priority: 'medium'
      },
      {
        business_name: 'Service Business Equipment (Great Copiers)',
        contact_name: null,
        address: '20648 84th Ave S, Kent, WA',
        zip_code: 'External',
        phone: null,
        email: null,
        website: null,
        source: 'Web Search',
        notes: '20+ years in business. Serves Tacoma/Puyallup area.',
        priority: 'medium'
      }
    ]
  },
  {
    key: 'msp',
    title: '💻 Managed Service Providers (IT)',
    count: 15,
    prospects: [
      {
        business_name: 'Attentus Technologies',
        contact_name: 'Sales Team / Wolf, Sean',
        address: 'Tacoma, WA',
        zip_code: '98406',
        phone: null,
        email: null,
        website: 'https://www.attentus.tech',
        source: 'Web Search',
        notes: '18+ years experience. Strong testimonials from manufacturing, healthcare, legal. Wolf and Sean mentioned as top techs. 96.6% CSAT rating.',
        priority: 'high'
      },
      {
        business_name: 'Rainier IT',
        contact_name: null,
        address: 'Orting, WA',
        zip_code: '98360',
        phone: null,
        email: null,
        website: 'https://rainier-it.com',
        source: 'Web Search',
        notes: 'Serves Orting, Puyallup, Sumner, Bonney Lake, Buckley & Pierce County',
        priority: 'medium'
      },
      {
        business_name: 'Puyallup.Computer',
        contact_name: null,
        address: 'Puyallup, WA',
        zip_code: '98371',
        phone: null,
        email: null,
        website: 'https://puyallup.computer',
        source: 'Web Search',
        notes: 'Managed IT for Puyallup businesses, 24/7 monitoring',
        priority: 'medium'
      }
    ]
  },
  {
    key: 'payment',
    title: '💳 Payment Processors',
    count: 6,
    prospects: [
      {
        business_name: 'Electronic Merchant Systems (EMS)',
        contact_name: null,
        address: 'Tacoma, WA',
        zip_code: '98406',
        phone: null,
        email: null,
        website: 'https://www.emscorporate.com/merchant-services/tacoma-wa',
        source: 'Web Search',
        notes: 'Local Tacoma presence. Countertop terminals, mobile devices, POS solutions.',
        priority: 'high'
      },
      {
        business_name: 'Kurv Pay',
        contact_name: null,
        address: 'National',
        zip_code: 'N/A',
        phone: null,
        email: null,
        website: 'https://kurvpay.com',
        source: 'Web Search',
        notes: 'Payment solutions, 30,000+ businesses. Free terminal options.',
        priority: 'medium'
      }
    ]
  },
  {
    key: 'pos',
    title: '🖥️ POS Systems (Restaurant, Retail, Cannabis)',
    count: 9,
    prospects: [
      {
        business_name: 'Toast POS',
        contact_name: 'Territory Account Executive - Retail (hiring)',
        address: 'Tacoma Territory',
        zip_code: '98406',
        phone: '(617) 297-1005',
        email: null,
        website: 'https://pos.toasttab.com',
        source: 'Web Search',
        notes: 'Hiring Territory Account Executive for Tacoma retail. Expanding beyond restaurants into convenience stores, grocery, bottle shops.',
        priority: 'high'
      },
      {
        business_name: 'National Business Systems (NBS)',
        contact_name: null,
        address: 'Seattle/Tacoma Area',
        zip_code: '98406',
        phone: '253-839-9636',
        email: null,
        website: 'https://www.nbsystems.com',
        source: 'Web Search',
        notes: 'Heartland Restaurant POS dealer for Seattle/Tacoma. Local sales rep.',
        priority: 'high'
      },
      {
        business_name: 'NBS Heartland POS',
        contact_name: null,
        address: 'Seattle/Tacoma',
        zip_code: '98406',
        phone: '253-839-9636',
        email: null,
        website: 'https://nbsheartlandpos.com',
        source: 'Web Search',
        notes: 'Local Heartland POS dealer for Seattle Tacoma area',
        priority: 'medium'
      }
    ]
  },
  {
    key: 'property',
    title: '🏢 Commercial Property Managers',
    count: 11,
    prospects: [
      {
        business_name: 'Kidder Mathews',
        contact_name: null,
        address: 'Downtown Tacoma',
        zip_code: '98402',
        phone: null,
        email: null,
        website: 'https://kidder.com/office-locations/tacoma/',
        source: 'Web Search',
        notes: 'Largest independent commercial real estate firm in Western US. Full service: brokerage, appraisal, property management, construction management.',
        priority: 'high'
      },
      {
        business_name: 'UNICO Properties LLC',
        contact_name: null,
        address: '1201 Pacific Ave Ste 150, Tacoma, WA',
        zip_code: '98402',
        phone: '(253) 272-7000',
        email: null,
        website: null,
        source: 'Tacoma Chamber Directory',
        notes: 'Commercial property management',
        priority: 'high'
      },
      {
        business_name: 'Keyrenter Property Management Tacoma',
        contact_name: null,
        address: 'Tacoma, WA',
        zip_code: '98406',
        phone: '(253) 449-3000',
        email: null,
        website: 'https://www.keyrentertacoma.com',
        source: 'Web Search',
        notes: 'Commercial and residential property management services',
        priority: 'medium'
      }
    ]
  },
  {
    key: 'movers',
    title: '🚚 Commercial Movers',
    count: 9,
    prospects: [
      {
        business_name: 'Lile Moving & Storage',
        contact_name: null,
        address: 'Tacoma, WA',
        zip_code: '98406',
        phone: '888-507-6304',
        email: null,
        website: 'https://lile.com/office-movers-tacoma-washington/',
        source: 'Web Search',
        notes: 'Tacoma office movers. 65+ years experience. Commercial moving consultants.',
        priority: 'high'
      },
      {
        business_name: 'Mountain Moving & Storage',
        contact_name: null,
        address: 'Tacoma, WA',
        zip_code: '98406',
        phone: null,
        email: null,
        website: 'https://www.mountainmoving.com/office-movers-in-tacoma/',
        source: 'Web Search',
        notes: 'Office movers in Tacoma. Evening and weekend services. Electronics packing and shipping.',
        priority: 'medium'
      }
    ]
  },
  {
    key: 'wraps',
    title: '🚗 Vehicle Wrappers / Fleet Graphics',
    count: 7,
    prospects: [
      {
        business_name: 'USA Wrap Co',
        contact_name: null,
        address: 'Gig Harbor/Tacoma, WA',
        zip_code: '98335',
        phone: '(253) 525-8148',
        email: null,
        website: 'https://usawrapco.com',
        source: 'Web Search',
        notes: "Washington's premier commercial vehicle wraps & fleet upfitting. Full truck wraps, van graphics, shelving, ladder racks, partitions. 3M certified, 5-star rated.",
        priority: 'high'
      },
      {
        business_name: 'WrapJax',
        contact_name: null,
        address: 'Tacoma, Woodinville, Silverdale',
        zip_code: '98406',
        phone: null,
        email: null,
        website: 'https://wrapjax.com',
        source: 'Web Search',
        notes: 'Custom vehicle wraps, fleet branding, window graphics. Tacoma location. Serves commercial and government clients.',
        priority: 'medium'
      }
    ]
  },
  {
    key: 'construction',
    title: '🏗️ Construction Companies (Large Crews)',
    count: 8,
    prospects: [
      {
        business_name: 'Westmark Construction',
        contact_name: null,
        address: 'Tacoma, WA',
        zip_code: '98406',
        phone: null,
        email: null,
        website: 'https://westmarkconst.com',
        source: 'Web Search',
        notes: 'Large commercial and public works construction. Western Washington and Pacific Northwest. New builds need connectivity!',
        priority: 'high'
      },
      {
        business_name: 'Colvos Construction',
        contact_name: null,
        address: 'Tacoma, WA',
        zip_code: '98406',
        phone: null,
        email: null,
        website: 'https://www.colvosconstruction.com',
        source: 'Web Search',
        notes: 'Full-service commercial general contractor. Tacoma, Seattle, Bellevue, Olympia, Puget Sound. Private and public commercial.',
        priority: 'high'
      },
      {
        business_name: 'Merit Construction',
        contact_name: null,
        address: 'Tacoma, WA',
        zip_code: '98406',
        phone: null,
        email: null,
        website: 'https://www.meritnw.com',
        source: 'Web Search',
        notes: 'Award-winning full service commercial general contractor. Since 1957. Tacoma-based.',
        priority: 'high'
      }
    ]
  }
];

export default function PartnersPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredCategories = activeFilter === 'all' 
    ? partnersData 
    : partnersData.filter(cat => cat.key === activeFilter);

  const totalProspects = partnersData.reduce((sum, cat) => sum + cat.count, 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-green-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      case 'low': return 'border-l-4 border-gray-400';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤝 Partnership Prospects</h1>
          <p className="text-gray-600">Referral partners in your Comcast territory • Updated June 3, 2026</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600">{totalProspects}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Total Prospects</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600">14</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">ZIP Codes</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600">8</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Categories</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600">12</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">With Phone #</div>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-wrap gap-3">
          <a 
            href="/comcast-partners-prospects.csv" 
            download
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </a>
          <a 
            href="/comcast-partners-prospect-list.json" 
            download
            className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download JSON
          </a>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {partnersData.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveFilter(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === cat.key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat.title.split(' ')[0]} {cat.count}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {filteredCategories.map(category => (
            <div key={category.key} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">{category.title}</h2>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{category.count}</span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {category.prospects.map((prospect, idx) => (
                  <div key={idx} className={`p-5 ${getPriorityColor(prospect.priority)}`}>
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{prospect.business_name}</h3>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{prospect.zip_code}</span>
                    </div>
                    
                    {prospect.contact_name && (
                      <p className="text-sm text-blue-600 mb-2">{prospect.contact_name}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      {prospect.phone && (
                        <a href={`tel:${prospect.phone}`} className="flex items-center gap-1 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {prospect.phone}
                        </a>
                      )}
                      {prospect.website && (
                        <a href={prospect.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          Website
                        </a>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{prospect.address}</p>
                    <p className="text-sm text-gray-700 mb-2">{prospect.notes}</p>
                    <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">{prospect.source}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
