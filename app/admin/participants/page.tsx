"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { apiService } from "@/lib/api"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LogOut, Users, Plus, Minus, Search, Edit, Loader2, Ban, CheckCircle, Gift, Award, Code } from "lucide-react"

export default function AdminParticipants() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [participants, setParticipants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<'user' | 'super_admin' | 'all'>('user')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "super_admin")) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!user) return

      try {
        setLoading(true)
        const role = selectedRole === 'all' ? undefined : selectedRole
        const data = await apiService.getUsers(1, 50, searchTerm, role)
        setParticipants(data.users || [])
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalUsers: data.pagination.totalUsers
        })
      } catch (error) {
        console.error('Error fetching participants:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "super_admin") {
      fetchParticipants()
    }
  }, [user, searchTerm, selectedRole])

  const updateUserEntries = async (userId: string, newEntries: number) => {
    try {
      setUpdating(userId)
      await apiService.updateUserEntries(userId, newEntries)
      
      // Update local state
      setParticipants(prev => 
        prev.map(p => p._id === userId ? { ...p, totalEntries: newEntries } : p)
      )
    } catch (error) {
      console.error('Error updating user entries:', error)
      alert('Failed to update user entries')
    } finally {
      setUpdating(null)
    }
  }

  const toggleUserBlock = async (userId: string, blocked: boolean) => {
    try {
      setUpdating(userId)
      await apiService.blockUser(userId, blocked)
      
      // Update local state
      setParticipants(prev => 
        prev.map(p => p._id === userId ? { ...p, blocked } : p)
      )
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status')
    } finally {
      setUpdating(null)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "super_admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {selectedRole === 'user' ? 'Participants' : 
               selectedRole === 'super_admin' ? 'Superadmin' : 'All Users'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedRole === 'user' ? 'Manage all participants and their slots' :
               selectedRole === 'super_admin' ? 'Manage all superadmin accounts' :
               'Manage all users and their accounts'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search and Stats */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border text-foreground"
            />
          </div>

          {/* Role Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={selectedRole === 'user' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole('user')}
              className={selectedRole === 'user' ? 'bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}
            >
              All Participants
            </Button>
            <Button
              variant={selectedRole === 'super_admin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole('super_admin')}
              className={selectedRole === 'super_admin' ? 'bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}
            >
              All Superadmin
            </Button>
            <Button
              variant={selectedRole === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRole('all')}
              className={selectedRole === 'all' ? 'bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}
            >
              All Users
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{pagination.totalUsers}</div>
                <div className="text-xs text-muted-foreground">Total Participants</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Plus className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {participants.reduce((sum, p) => sum + (p.totalEntries || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Entries</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Gift className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {participants.filter((p) => (p.totalCodesUsed || 0) > 0).length}
                </div>
                <div className="text-xs text-muted-foreground">Code Users</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Participants List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedRole === 'user' ? 'All Participants' :
               selectedRole === 'super_admin' ? 'All Superadmin' :
               'All Users'} ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {participants.map((participant, index) => (
                <div
                  key={participant._id}
                  className="flex items-center justify-between p-4 border-b border-border last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">{participant.email}</p>
                      </div>
                      {participant.role === 'super_admin' && participant.owner && (
                        <Badge className="bg-purple-500 text-white text-xs">
                          Owner
                        </Badge>
                      )}
                      {participant.blocked && (
                        <Badge variant="destructive" className="text-xs">
                          Blocked
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-11">
                      <Badge variant="outline" className="text-xs">
                        {participant.country}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Joined {new Date(participant.createdAt).toLocaleDateString()}
                      </span>
                      {participant.isWinner && (
                        <Badge className="bg-yellow-500 text-black text-xs">
                          Winner
                        </Badge>
                      )}
                      {participant.totalCodesUsed > 0 && (
                        <Badge className="bg-purple-500 text-white text-xs">
                          <Gift className="h-3 w-3 mr-1" />
                          {participant.totalCodesUsed} codes
                        </Badge>
                      )}
                    </div>
                    
                    {/* Code Usage Details */}
                    {participant.codesUsed && participant.codesUsed.length > 0 && (
                      <div className="ml-11 mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-1">
                          <Code className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                            Code Usage ({participant.totalCodesUsed} codes, +{participant.totalBonusEntries} entries)
                          </span>
                        </div>
                        <div className="space-y-1">
                          {participant.codesUsed.slice(0, 3).map((codeUsed: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <span className="font-mono bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded">
                                {codeUsed.code}
                              </span>
                              <span className="text-purple-600 dark:text-purple-400">
                                +{codeUsed.entriesAwarded} entries
                              </span>
                              <span className="text-muted-foreground">
                                {new Date(codeUsed.usedDate).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                          {participant.codesUsed.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{participant.codesUsed.length - 3} more codes...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateUserEntries(participant._id, Math.max(0, (participant.totalEntries || 0) - 1))}
                      disabled={participant.totalEntries <= 0 || updating === participant._id}
                      className="h-8 w-8 p-0"
                    >
                      {updating === participant._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-bold text-foreground">{participant.totalEntries || 0}</div>
                      <div className="text-xs text-muted-foreground">entries</div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateUserEntries(participant._id, (participant.totalEntries || 0) + 1)}
                      disabled={updating === participant._id}
                      className="h-8 w-8 p-0"
                    >
                      {updating === participant._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Only show block button if user can block this participant */}
                    {((participant.role === 'user') || 
                      (participant.role === 'super_admin' && user?.owner && participant._id !== user?.id)) && (
                      <Button
                        variant={participant.blocked ? "default" : "destructive"}
                        size="sm"
                        onClick={() => toggleUserBlock(participant._id, !participant.blocked)}
                        disabled={updating === participant._id}
                        className="h-8 w-8 p-0"
                      >
                        {updating === participant._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : participant.blocked ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Ban className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {participants.length} of {pagination.totalUsers} participants
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === 1}
                    onClick={() => {
                      // Implement pagination
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => {
                      // Implement pagination
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Admin Navigation */}
      <AdminNav />
    </div>
  )
}
