'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LegalArea } from '@/types/chat'
import { 
  Scale, 
  Home, 
  Key, 
  DollarSign, 
  FileText, 
  Building,
  Users,
  AlertTriangle,
  MapPin,
  Handshake
} from 'lucide-react'

const legalAreas: LegalArea[] = [
  {
    id: 'buying-selling',
    name: 'Buying & Selling',
    description: 'Purchase agreements, closings, title issues',
    icon: 'Handshake',
    examples: ['Purchase contracts', 'Closing procedures', 'Title problems', 'Escrow issues']
  },
  {
    id: 'landlord-tenant',
    name: 'Landlord-Tenant',
    description: 'Rental agreements, evictions, security deposits',
    icon: 'Key',
    examples: ['Lease agreements', 'Eviction process', 'Security deposits', 'Tenant rights']
  },
  {
    id: 'property-disputes',
    name: 'Property Disputes',
    description: 'Boundary disputes, easements, neighbor issues',
    icon: 'AlertTriangle',
    examples: ['Boundary disputes', 'Easement rights', 'Neighbor conflicts', 'Property damage']
  },
  {
    id: 'financing-mortgages',
    name: 'Financing & Mortgages',
    description: 'Loan terms, foreclosures, refinancing',
    icon: 'DollarSign',
    examples: ['Mortgage terms', 'Foreclosure defense', 'Refinancing', 'Loan modifications']
  },
  {
    id: 'zoning-permits',
    name: 'Zoning & Permits',
    description: 'Building permits, zoning laws, development',
    icon: 'MapPin',
    examples: ['Building permits', 'Zoning violations', 'Development rights', 'Land use']
  },
  {
    id: 'property-management',
    name: 'Property Management',
    description: 'HOA issues, maintenance, property taxes',
    icon: 'Building',
    examples: ['HOA disputes', 'Property maintenance', 'Tax assessments', 'Insurance claims']
  },
  {
    id: 'commercial-real-estate',
    name: 'Commercial Real Estate',
    description: 'Commercial leases, investment properties',
    icon: 'FileText',
    examples: ['Commercial leases', 'Investment properties', 'Business sales', 'Development deals']
  },
  {
    id: 'estate-planning',
    name: 'Estate & Property Transfer',
    description: 'Inheritance, wills, property transfer',
    icon: 'Users',
    examples: ['Property inheritance', 'Estate planning', 'Trust properties', 'Transfer on death']
  }
]

const iconMap = {
  Handshake,
  Key,
  AlertTriangle,
  DollarSign,
  MapPin,
  Building,
  FileText,
  Users,
  Home,
  Scale
}

interface LegalAreasPanelProps {
  onSelectArea: (area: LegalArea) => void
}

export default function LegalAreasPanel({ onSelectArea }: LegalAreasPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Home className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Real Estate Topics</h2>
      </div>

      <div className="grid gap-3">
        {legalAreas.map((area) => {
          const IconComponent = iconMap[area.icon as keyof typeof iconMap] || Scale
          
          return (
            <Card 
              key={area.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectArea(area)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">{area.name}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {area.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {area.examples.slice(0, 2).map((example, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {example}
                    </Badge>
                  ))}
                  {area.examples.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{area.examples.length - 2} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-3">
          <p className="text-xs text-amber-800">
            <strong>Important:</strong> This assistant provides general information about real estate matters only. 
            For specific legal advice regarding your property, always consult with a qualified real estate attorney.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
