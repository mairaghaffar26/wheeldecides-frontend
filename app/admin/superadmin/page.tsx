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
import { LogOut, Users, Plus, Minus, Search, Edit, Loader2, Ban, CheckCircle, Shield } from "lucide-react"

export default function AdminSuperadmin() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [superadmins, setSuperadmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
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
    const fetchSuperadmins = async () => {
      if (!user) return

      try {
        setLoading(true)
        const data = await apiService.getUsers(1, 50, searchTerm, 'super_admin')
        setSuperadmins(data.users || [])
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalUsers: data.pagination.totalUsers
        })
      } catch (error) {
        console.error('Error fetching superadmins:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "super_admin") {
      fetchSuperadmins()
    }
  }, [user, searchTerm])

  const updateUserEntries = async (userId: string, newEntries: number) => {
    try {
      setUpdating(userId)
      await apiService.updateUserEntries(userId, newEntries)
      
      // Update local state
      setSuperadmins(prev => 
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
      setSuperadmins(prev => 
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
            <h1 className="text-xl font-bold text-foreground">Superadmin Management</h1>
            <p className="text-sm text-muted-foreground">Manage all superadmin accounts</p>
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
              placeholder="Search superadmins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border text-foreground"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{pagination.totalUsers}</div>
                <div className="text-xs text-muted-foreground">Total Superadmins</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Plus className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {superadmins.reduce((sum, p) => sum + (p.totalEntries || 0), 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Entries</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Edit className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {superadmins.filter((p) => (p.totalEntries || 0) > 1).length}
                </div>
                <div className="text-xs text-muted-foreground">Active Admins</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Superadmins List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              All Superadmins ({superadmins.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {superadmins.map((superadmin, index) => (
                <div
                  key={superadmin._id}
                  className="flex items-center justify-between p-4 border-b border-border last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{superadmin.name}</p>
                        <p className="text-sm text-muted-foreground">{superadmin.email}</p>
                      </div>
                      <Badge className="bg-yellow-500 text-black text-xs">
                        Superadmin
                      </Badge>
                      {superadmin.owner && (
                        <Badge className="bg-purple-500 text-white text-xs">
                          Owner
                        </Badge>
                      )}
                      {superadmin.blocked && (
                        <Badge variant="destructive" className="text-xs">
                          Blocked
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-11">
                      <Badge variant="outline" className="text-xs">
                        {superadmin.country}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Joined {new Date(superadmin.createdAt).toLocaleDateString()}
                      </span>
                      {superadmin.isWinner && (
                        <Badge className="bg-yellow-500 text-black text-xs">
                          Winner
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateUserEntries(superadmin._id, Math.max(0, (superadmin.totalEntries || 0) - 1))}
                      disabled={superadmin.totalEntries <= 0 || updating === superadmin._id}
                      className="h-8 w-8 p-0"
                    >
                      {updating === superadmin._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                    </Button>

                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-bold text-foreground">{superadmin.totalEntries || 0}</div>
                      <div className="text-xs text-muted-foreground">entries</div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateUserEntries(superadmin._id, (superadmin.totalEntries || 0) + 1)}
                      disabled={updating === superadmin._id}
                      className="h-8 w-8 p-0"
                    >
                      {updating === superadmin._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Only show block button if current user is owner and not blocking themselves */}
                    {user?.owner && superadmin._id !== user?.id && (
                      <Button
                        variant={superadmin.blocked ? "default" : "destructive"}
                        size="sm"
                        onClick={() => toggleUserBlock(superadmin._id, !superadmin.blocked)}
                        disabled={updating === superadmin._id}
                        className="h-8 w-8 p-0"
                      >
                        {updating === superadmin._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : superadmin.blocked ? (
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
                  Showing {superadmins.length} of {pagination.totalUsers} superadmins
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
