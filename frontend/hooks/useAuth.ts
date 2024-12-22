import { useState, useEffect } from 'react'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Auth logic here
  
  return { isAuthenticated }
} 