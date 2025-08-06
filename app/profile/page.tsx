'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, User } from 'lucide-react'

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
  const router = useRouter()

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/chat')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your profile to get personalized hair care recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={profile?.full_name || ''}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hairType">Hair Type</Label>
                <Select name="hairType" defaultValue={profile?.hair_type || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your hair type" />
                  </SelectTrigger>
                  <SelectContent>
                    {hairTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scalpCondition">Scalp Condition</Label>
                <Select name="scalpCondition" defaultValue={profile?.scalp_condition || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your scalp condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {scalpConditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Hair Concerns (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {hairConcerns.map((concern) => (
                    <div key={concern} className="flex items-center space-x-2">
                      <Checkbox
                        id={concern}
                        checked={selectedConcerns.includes(concern)}
                        onCheckedChange={(checked) => 
                          handleConcernChange(concern, checked as boolean)
                        }
                      />
                      <Label htmlFor={concern} className="text-sm">
                        {concern}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>

            {message && (
              <Alert className="mt-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
