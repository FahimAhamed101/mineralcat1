import { useState, useEffect } from "react"
import fetchWithAuth from "../utils/fetchWithAuth"

export function useGetAllUsers(baseUrl) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [planType, setPlanType] = useState("All")

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!baseUrl) throw new Error("API base URL is required")

      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "",
      })

      
      if (planType !== "All") {
        params.append("planType", planType)
      }

    
      if (searchTerm.trim() !== "") {
        params.append("search", searchTerm.trim())
      }

      const url = `${baseUrl}/admin/all-users?${params.toString()}`

      const response = await fetchWithAuth(url, {
        headers: {
          "Content-Type": "application/json",
          
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()

      
      const usersData = data.users || data.data || []
      setUsers(Array.isArray(usersData) ? usersData : [])

      if (data.totalPages) {
        setTotalPages(data.totalPages)
      } else if (data.meta?.totalPages) {
        setTotalPages(data.meta.totalPages)
      } else {
        setTotalPages(1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching users:", err)
      setUsers([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  
  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, planType])

  return {
    users,
    loading,
    error,
    totalPages,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    planType,
    setPlanType,
    refetch: fetchUsers,
  }
}
