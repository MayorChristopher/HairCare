'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, User, Sparkles, Scissors, Droplets, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Database } from '@/lib/supabase'

interface Profile {
  id: string
  email: string
  full_name: string | null
  hair_type: string | null
  scalp_condition: string | null
  hair_concerns: string[] | null
}

const hairTypes = [
  { value: 'straight', label: 'Straight' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'curly', label: 'Curly' },
  { value: 'coily', label: 'Coily/Kinky' }
]

const scalpConditions = [
  { value: 'normal', label: 'Normal' },
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'sensitive', label: 'Sensitive' }
]

const hairConcerns = [
  'Hair Loss',
  'Dandruff',
  'Dryness',
  'Frizz',
  'Split Ends',
  'Lack of Volume',
  'Color Damage',
  'Heat Damage',
  'Scalp Irritation',
  'Slow Growth'
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([])
  const [activeSection, setActiveSection] = useState<'personal' | 'hair' | 'concerns'>('personal')
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setSelectedConcerns(data.hair_concerns || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('fullName') as string
    const hairType = formData.get('hairType') as string
    const scalpCondition = formData.get('scalpCondition') as string

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        hair_type: hairType || null,
        scalp_condition: scalpCondition || null,
        hair_concerns: selectedConcerns.length > 0 ? selectedConcerns : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile?.id)

    if (error) {
      setMessage('Error updating profile: ' + error.message)
    } else {
      setMessage('Profile updated successfully!')
      fetchProfile()
    }
    setSaving(false)
  }

  const handleConcernChange = (concern: string, checked: boolean) => {
    if (checked) {
      setSelectedConcerns(prev => [...prev, concern])
    } else {
      setSelectedConcerns(prev => prev.filter(c => c !== concern))
    }
  }

  const getCompletionPercentage = () => {
    let completed = 0
    let total = 4
    
    if (profile?.full_name) completed++
    if (profile?.hair_type) completed++
    if (profile?.scalp_condition) completed++
    if (profile?.hair_concerns && profile.hair_concerns.length > 0) completed++
    
    return Math.round((completed / total) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-gray-600">Loading your profile...</span>
        </div>
      </div>
    )
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/chat')}
                className="hover:bg-gray-100 p-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Chat</span>
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Hair Profile</h1>
                  <p className="text-xs sm:text-sm text-gray-500">Personalize your hair care experience</p>
                </div>
                <div className="sm:hidden">
                  <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs sm:text-sm font-medium text-gray-900">{completionPercentage}% Complete</div>
                <div className="w-16 sm:w-24 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-purple-600 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Mobile Section Tabs */}
          <div className="lg:hidden">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveSection('personal')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === 'personal' 
                    ? 'bg-white text-purple-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setActiveSection('hair')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === 'hair' 
                    ? 'bg-white text-purple-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Hair
              </button>
              <button
                onClick={() => setActiveSection('concerns')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === 'concerns' 
                    ? 'bg-white text-purple-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Concerns
              </button>
            </div>
          </div>

          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Profile Sections</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('personal')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'personal' 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Personal Info</span>
                  {profile?.full_name && <CheckCircle2 className="h-4 w-4 ml-auto text-green-500" />}
                </button>
                <button
                  onClick={() => setActiveSection('hair')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'hair' 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Scissors className="h-4 w-4" />
                  <span className="font-medium">Hair Details</span>
                  {(profile?.hair_type || profile?.scalp_condition) && 
                    <CheckCircle2 className="h-4 w-4 ml-auto text-green-500" />
                  }
                </button>
                <button
                  onClick={() => setActiveSection('concerns')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === 'concerns' 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Hair Concerns</span>
                  {profile?.hair_concerns && profile.hair_concerns.length > 0 && 
                    <CheckCircle2 className="h-4 w-4 ml-auto text-green-500" />
                  }
                </button>
              </nav>

              {/* Profile Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Current Profile</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hair Type:</span>
                    <span className="font-medium text-right">
                      {profile?.hair_type ? 
                        hairTypes.find(t => t.value === profile.hair_type)?.label || 'Unknown' 
                        : 'Not set'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scalp:</span>
                    <span className="font-medium text-right">
                      {profile?.scalp_condition ? 
                        scalpConditions.find(s => s.value === profile.scalp_condition)?.label || 'Unknown'
                        : 'Not set'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Concerns:</span>
                    <span className="font-medium text-right">
                      {profile?.hair_concerns && profile.hair_concerns.length > 0 
                        ? `${profile.hair_concerns.length} selected`
                        : 'None'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Personal Information Section */}
              {activeSection === 'personal' && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4 sm:pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Personal Information</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          Basic information about you
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          defaultValue={profile?.full_name || ''}
                          placeholder="Enter your full name"
                          className="h-10 sm:h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          value={profile?.email || ''}
                          disabled
                          className="h-10 sm:h-11 bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hair Details Section */}
              {activeSection === 'hair' && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4 sm:pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Scissors className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Hair Characteristics</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          Tell us about your hair type and scalp condition
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="hairType" className="text-sm font-medium text-gray-700">
                          Hair Type
                        </Label>
                        <Select name="hairType" defaultValue={profile?.hair_type || ''}>
                          <SelectTrigger className="h-10 sm:h-11">
                            <SelectValue placeholder="Select your hair type" />
                          </SelectTrigger>
                          <SelectContent>
                            {hairTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Scissors className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="scalpCondition" className="text-sm font-medium text-gray-700">
                          Scalp Condition
                        </Label>
                        <Select name="scalpCondition" defaultValue={profile?.scalp_condition || ''}>
                          <SelectTrigger className="h-10 sm:h-11">
                            <SelectValue placeholder="Select your scalp condition" />
                          </SelectTrigger>
                          <SelectContent>
                            {scalpConditions.map((condition) => (
                              <SelectItem key={condition.value} value={condition.value}>
                                <div className="flex items-center gap-2">
                                  <Droplets className="h-4 w-4" />
                                  {condition.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Why this matters</h4>
                          <p className="text-sm text-blue-700">
                            Understanding your hair type and scalp condition helps us provide more accurate, 
                            personalized recommendations for products and routines that work best for you.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hair Concerns Section */}
              {activeSection === 'concerns' && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4 sm:pb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Hair Concerns</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          Select any hair issues you'd like help addressing
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {hairConcerns.map((concern) => (
                        <div 
                          key={concern} 
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                            selectedConcerns.includes(concern)
                              ? 'bg-purple-50 border-purple-200'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <Checkbox
                            id={concern}
                            checked={selectedConcerns.includes(concern)}
                            onCheckedChange={(checked) => 
                              handleConcernChange(concern, checked as boolean)
                            }
                            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />
                          <Label 
                            htmlFor={concern} 
                            className="text-sm font-medium cursor-pointer flex-1"
                          >
                            {concern}
                          </Label>
                        </div>
                      ))}
                    </div>

                    {selectedConcerns.length > 0 && (
                      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-900 mb-1">
                              Selected Concerns ({selectedConcerns.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedConcerns.map((concern) => (
                                <Badge key={concern} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                  {concern}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4 sm:pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full sm:w-auto px-6 sm:px-8 py-2 bg-purple-600 hover:bg-purple-700"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Success/Error Message */}
            {message && (
              <Alert className={`mt-4 sm:mt-6 ${message.includes('Error') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <div className="flex items-center gap-2">
                  {message.includes('Error') ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  <AlertDescription className={message.includes('Error') ? 'text-red-800' : 'text-green-800'}>
                    {message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}