'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import type { UserRole } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  Users,
  Briefcase,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Ticket,
  Mail,
  Lock,
  User,
} from 'lucide-react'

const roleCards: { role: UserRole; title: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { role: 'admin', title: 'Admin', description: 'Full system access and user management', icon: Shield },
  { role: 'manager', title: 'Manager', description: 'Team supervision and task delegation', icon: Users },
  { role: 'employee', title: 'Employee', description: 'Daily tasks and ticket management', icon: Briefcase },
  { role: 'intern', title: 'Intern', description: 'Assigned work and progress tracking', icon: GraduationCap },
]

const DEPARTMENTS = [
  'Engineering',
  'Management',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
  'Product',
]

export function AuthScreen() {
  const router = useRouter()
  const { login, loginWithError, setSelectedRole, selectedRole } = useStore()
  const [step, setStep] = useState<'role' | 'auth'>('role')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [error, setError] = useState('')

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setStep('auth')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    setIsLoading(true)
    setError('')

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Invalid email address. Please enter a valid email.')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setIsLoading(false)
      return
    }

    try {
      const result = await loginWithError(email, password, selectedRole)
      if (result.success) {
        router.push('/dashboard')
      } else {
        if (result.error?.includes('Invalid login credentials') || result.error?.includes('invalid_credentials')) {
          setError('Invalid email or password. Please try again.')
        } else if (result.error?.includes('Email not confirmed')) {
          setError('Please confirm your email before signing in.')
        } else if (result.error?.includes('user not found') || result.error?.includes('no rows')) {
          setError('No account found with this email and role. Please Sign Up first.')
        } else {
          setError(result.error || 'Login failed. Please try again.')
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    setIsLoading(true)
    setError('')

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Invalid email address. Please enter a valid email.')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setIsLoading(false)
      return
    }

    if (!name.trim()) {
      setError('Please enter your full name.')
      setIsLoading(false)
      return
    }

    if (!department) {
      setError('Please select your department.')
      setIsLoading(false)
      return
    }

    try {
      // Check if email already exists with this role before signing up
      const { supabase } = await import('@/lib/supabase/client')
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .eq('role', selectedRole)
        .maybeSingle()

      if (existingUser) {
        setError(`This email is already registered as ${selectedRole}. Please Sign In instead.`)
        setIsLoading(false)
        return
      }

      const result = await loginWithError(email, password, selectedRole, name, department)
      if (result.success) {
        router.push('/dashboard')
      } else {
        if (result.error?.includes('already registered') || result.error?.includes('already exists')) {
          setError('This email is already registered. Please Sign In instead.')
        } else if (result.error?.includes('weak_password') || result.error?.includes('weak password')) {
          setError('Password is too weak. Use at least 6 characters.')
        } else {
          setError(result.error || 'Could not create account. Please try again.')
        }
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/25">
            <Ticket className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Smart Ticketing Portal</h1>
          <p className="text-muted-foreground mt-2">
            Collaborative ticket and task management platform
          </p>
        </div>

        {step === 'role' ? (
          /* Role Selection */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground">Select Your Role</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose your role to access the appropriate dashboard
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roleCards.map(({ role, title, description, icon: Icon }) => (
                <Card
                  key={role}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50',
                    selectedRole === role && 'border-primary shadow-lg shadow-primary/10'
                  )}
                  onClick={() => handleRoleSelect(role)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className={cn(
                      'mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-2 transition-colors',
                      selectedRole === role ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-xs">
                      {description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Auth Forms */
          <Card className="max-w-md mx-auto shadow-xl border-0 bg-card/80 backdrop-blur">
            <CardHeader className="space-y-1 pb-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2 mb-2"
                onClick={() => setStep('role')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to role selection
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {roleCards.find(r => r.role === selectedRole)?.icon && (
                    (() => {
                      const Icon = roleCards.find(r => r.role === selectedRole)!.icon
                      return <Icon className="h-5 w-5 text-primary" />
                    })()
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {roleCards.find(r => r.role === selectedRole)?.title} Portal
                  </CardTitle>
                  <CardDescription>
                    Sign in or create a new account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@company.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <Button type="button" variant="link" className="px-0 text-sm">
                        Forgot password?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Signing in...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@company.com"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-department">Department</Label>
                      <select
                        id="signup-department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        required
                      >
                        <option value="">Select your department...</option>
                        {DEPARTMENTS.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          className="pl-10 pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive font-medium">{error}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Create Account
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Demo Credentials */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Demo: Use any email and password to login as your selected role
          </p>
        </div>
      </div>
    </div>
  )
}