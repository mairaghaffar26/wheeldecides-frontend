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
import { LogOut, Gift, Plus, Search, Eye, Copy, CheckCircle, XCircle, Clock, TrendingUp, Users, Award } from "lucide-react"

export default function AdminPurchaseCodes() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [codes, setCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'used' | 'unused'>('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCodes: 0
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "super_admin")) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        const [codesData, statsData] = await Promise.all([
          apiService.getPurchaseCodes(1, 50, selectedStatus),
          apiService.getPurchaseCodeStats()
        ])
        
        setCodes(codesData.codes || [])
        setStats(statsData.statistics)
        setPagination({
          currentPage: codesData.pagination.currentPage,
          totalPages: codesData.pagination.totalPages,
          totalCodes: codesData.pagination.totalCodes
        })
      } catch (error) {
        console.error('Error fetching purchase codes:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "super_admin") {
      fetchData()
    }
  }, [user, selectedStatus])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const generateNewCodes = async () => {
    try {
      const count = prompt("How many codes to generate? (1-1000)", "50")
      if (!count || isNaN(Number(count))) return
      
      const entriesPerCode = prompt("Entries per code?", "10")
      if (!entriesPerCode || isNaN(Number(entriesPerCode))) return
      
      await apiService.generatePurchaseCodes(Number(count), Number(entriesPerCode))
      alert(`Successfully generated ${count} new codes!`)
      
      // Refresh data
      const codesData = await apiService.getPurchaseCodes(1, 50, selectedStatus)
      setCodes(codesData.codes || [])
    } catch (error) {
      console.error('Error generating codes:', error)
      alert('Failed to generate codes')
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
            <h1 className="text-xl font-bold text-foreground">Purchase Code Management</h1>
            <p className="text-sm text-muted-foreground">Manage unique codes and track usage</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={generateNewCodes}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Codes
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <Gift className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Codes</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.used}</div>
                <div className="text-xs text-muted-foreground">Used Codes</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <XCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.unused}</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stats.usageRate}%</div>
                <div className="text-xs text-muted-foreground">Usage Rate</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
            className={selectedStatus === 'all' ? 'bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}
          >
            All Codes
          </Button>
          <Button
            variant={selectedStatus === 'used' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('used')}
            className={selectedStatus === 'used' ? 'bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}
          >
            Used Codes
          </Button>
          <Button
            variant={selectedStatus === 'unused' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('unused')}
            className={selectedStatus === 'unused' ? 'bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}
          >
            Available Codes
          </Button>
        </div>

        {/* Codes List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Purchase Codes ({codes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {codes.map((code, index) => (
                <div
                  key={code._id}
                  className="flex items-center justify-between p-4 border-b border-border last:border-b-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-mono text-lg font-bold text-foreground">{code.code}</p>
                        <p className="text-sm text-muted-foreground">
                          {code.entriesAwarded} entries • Created {new Date(code.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        className={code.isUsed ? "bg-green-500 text-white" : "bg-blue-500 text-white"}
                      >
                        {code.isUsed ? 'Used' : 'Available'}
                      </Badge>
                    </div>
                    
                    {code.isUsed && code.usedBy && (
                      <div className="ml-11 space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            Used by: {code.usedBy.name} ({code.usedBy.email})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Used on: {new Date(code.usedDate).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Awarded: {code.entriesAwarded} entries
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(code.code)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
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
                  Showing {codes.length} of {pagination.totalCodes} codes
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